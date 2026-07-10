'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Fuse from 'fuse.js';
import { EnrichedProblem } from '@/types';
import ProblemCard from './ProblemCard';
import UserNav from './UserNav';

function topicId(topic: string) {
  return `topic-${topic.toLowerCase().replace(/\s+/g, '-')}`;
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div
      onClick={onChange}
      style={{
        width: '34px', height: '19px', borderRadius: '999px',
        background: checked ? '#238636' : '#30363d',
        cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <div style={{
        width: '13px', height: '13px', borderRadius: '50%', background: '#fff',
        position: 'absolute', top: '3px', left: checked ? '18px' : '3px', transition: 'left 0.2s',
      }} />
    </div>
  );
}

const SCROLL_KEY = 'dsa_scroll_pos';

export default function ProblemsView({
  problems: initialProblems,
  topicOrder,
  email,
  hasPaid,
  isAdmin,
}: {
  problems: EnrichedProblem[];
  topicOrder: string[];
  email: string | null;
  hasPaid: boolean;
  isAdmin: boolean;
}) {
  const [problems, setProblems] = useState(initialProblems);
  const [query, setQuery] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [topicFilter, setTopicFilter] = useState('all');
  const [top150Only, setTop150Only] = useState(false);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Re-sync when the server re-renders this tree (e.g. router.refresh() after
  // checkout) — otherwise this client component's local state keeps the stale
  // locked/unlocked snapshot from the initial mount.
  useEffect(() => {
    setProblems(initialProblems);
  }, [initialProblems]);

  // Scroll persistence
  useEffect(() => {
    const saved = localStorage.getItem(SCROLL_KEY);
    if (saved) {
      setTimeout(() => window.scrollTo({ top: parseInt(saved), behavior: 'instant' as ScrollBehavior }), 80);
    }
    const onScroll = () => {
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
      scrollTimer.current = setTimeout(() => {
        if (!document.querySelector('input[type=text]')?.matches(':focus')) {
          localStorage.setItem(SCROLL_KEY, String(window.scrollY));
        }
      }, 250);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleUpdate = useCallback((updated: EnrichedProblem) => {
    setProblems((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }, []);

  const scoped = useMemo(() => {
    return problems.filter(
      (p) =>
        (topicFilter === 'all' || p.topic === topicFilter) &&
        (!top150Only || p.isTop150)
    );
  }, [problems, topicFilter, top150Only]);

  const fuse = useMemo(
    () => new Fuse(scoped, { keys: ['title', 'description', 'topic'], threshold: 0.35 }),
    [scoped]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return scoped;
    return fuse.search(query).map((r) => r.item);
  }, [query, fuse, scoped]);

  const topicRank = useMemo(() => {
    const map = new Map<string, number>();
    topicOrder.forEach((t, i) => map.set(t, i));
    return map;
  }, [topicOrder]);

  const byTopicOrder = useCallback(
    (a: string, b: string) => {
      const ra = topicRank.has(a) ? topicRank.get(a)! : Infinity;
      const rb = topicRank.has(b) ? topicRank.get(b)! : Infinity;
      return ra - rb;
    },
    [topicRank]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, EnrichedProblem[]>();
    for (const p of filtered) {
      if (!map.has(p.topic)) map.set(p.topic, []);
      map.get(p.topic)!.push(p);
    }
    return new Map([...map.entries()].sort((a, b) => byTopicOrder(a[0], b[0])));
  }, [filtered, byTopicOrder]);

  const allTopics = useMemo(
    () => Array.from(new Set(problems.map((p) => p.topic))).sort(byTopicOrder),
    [problems, byTopicOrder]
  );
  const visibleTopics = Array.from(grouped.keys());

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0d1117' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: '240px', flexShrink: 0, position: 'sticky', top: 0, height: '100vh',
          overflowY: 'auto', borderRight: '1px solid #30363d', background: '#0d1117',
          padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem',
        }}
      >
        {/* Logo */}
        <div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e6edf3', marginBottom: '2px' }}>
            DSA Answers
          </div>
          <div style={{ fontSize: '0.72rem', color: '#8b949e' }}>
            {problems.length} problems · scroll to read
          </div>
          <a
            href="/theory"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '8px',
              fontSize: '0.75rem', color: '#8b949e', textDecoration: 'none',
              padding: '4px 10px', borderRadius: '6px', border: '1px solid #30363d',
              transition: 'color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.color = '#e6edf3'; el.style.borderColor = '#8b949e'; }}
            onMouseLeave={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.color = '#8b949e'; el.style.borderColor = '#30363d'; }}
          >
            📖 Theory Q&amp;A
          </a>
        </div>

        {/* Auth / account */}
        <UserNav email={email} hasPaid={hasPaid} />

        {/* Edit mode toggle — admin only */}
        {isAdmin && (
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 10px', borderRadius: '8px',
              background: editMode ? 'rgba(88,166,255,0.08)' : '#161b22',
              border: `1px solid ${editMode ? 'rgba(88,166,255,0.3)' : '#30363d'}`,
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: '0.8rem', color: editMode ? '#58a6ff' : '#8b949e', fontWeight: 500 }}>
              ✏ Edit Mode
            </span>
            <Toggle checked={editMode} onChange={() => setEditMode((e) => !e)} />
          </div>
        )}

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#8b949e', fontSize: '0.8rem', pointerEvents: 'none' }}>
            ⌕
          </span>
          <input
            type="text"
            placeholder="Search problems..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%', background: '#161b22', border: '1px solid #30363d',
              borderRadius: '8px', padding: '0.45rem 0.75rem 0.45rem 1.8rem',
              color: '#e6edf3', fontSize: '0.8rem', outline: 'none',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: '#8b949e', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Topic filter */}
        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#8b949e', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Topic
          </label>
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            style={{
              width: '100%', background: '#161b22', border: '1px solid #30363d',
              borderRadius: '8px', padding: '0.45rem 0.6rem', color: '#e6edf3',
              fontSize: '0.8rem', outline: 'none',
            }}
          >
            <option value="all">All Topics ({problems.length})</option>
            {allTopics.map((topic) => (
              <option key={topic} value={topic}>
                {topic} ({problems.filter((p) => p.topic === topic).length})
              </option>
            ))}
          </select>
        </div>

        {/* Top 150 toggle */}
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 10px', borderRadius: '8px',
            background: top150Only ? 'rgba(210,153,34,0.08)' : '#161b22',
            border: `1px solid ${top150Only ? 'rgba(210,153,34,0.3)' : '#30363d'}`,
            transition: 'all 0.2s',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: top150Only ? '#d29922' : '#8b949e', fontWeight: 500 }}>
            ⭐ Top 150 only
          </span>
          <Toggle checked={top150Only} onChange={() => setTop150Only((v) => !v)} />
        </div>

        {/* TOC */}
        <nav>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#8b949e', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Topics
            </span>
            {topicFilter !== 'all' && (
              <button
                onClick={() => setTopicFilter('all')}
                style={{ background: 'none', border: 'none', color: '#58a6ff', fontSize: '0.7rem', cursor: 'pointer' }}
              >
                Clear
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {allTopics.map((topic) => {
              const active = visibleTopics.includes(topic);
              const selected = topicFilter === topic;
              const count = problems.filter((p) => p.topic === topic).length;
              return (
                <a
                  key={topic}
                  href={`#${topicId(topic)}`}
                  onClick={(e) => { e.preventDefault(); setTopicFilter(topic); }}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.35rem 0.6rem', borderRadius: '6px', fontSize: '0.82rem',
                    color: selected ? '#e6edf3' : active ? '#8b949e' : '#4a5568',
                    background: selected ? '#161b22' : 'transparent',
                    textDecoration: 'none', transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#161b22'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = selected ? '#161b22' : 'transparent'; }}
                >
                  <span>{topic}</span>
                  <span style={{ fontSize: '0.7rem', background: '#30363d', color: active ? '#8b949e' : '#4a5568', padding: '0 6px', borderRadius: '10px', minWidth: '18px', textAlign: 'center' }}>
                    {count}
                  </span>
                </a>
              );
            })}
          </div>
        </nav>

        {/* Admin link */}
        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #30363d' }}>
          <a
            href="/admin"
            style={{
              display: 'block', textAlign: 'center', padding: '0.45rem', borderRadius: '8px',
              border: '1px solid #30363d', color: '#8b949e', fontSize: '0.78rem',
              textDecoration: 'none', transition: 'color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.color = '#e6edf3'; el.style.borderColor = '#8b949e'; }}
            onMouseLeave={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.color = '#8b949e'; el.style.borderColor = '#30363d'; }}
          >
            ⚙ Admin
          </a>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '2rem 2rem 4rem', maxWidth: 'calc(100% - 240px)' }}>
        <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #30363d' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#e6edf3', margin: 0 }}>DSA Answers</h1>
          <p style={{ color: '#8b949e', fontSize: '0.875rem', marginTop: '4px' }}>
            {query ? (
              `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${query}"`
            ) : topicFilter !== 'all' || top150Only ? (
              `${filtered.length} problem${filtered.length !== 1 ? 's' : ''}${topicFilter !== 'all' ? ` in ${topicFilter}` : ''}${top150Only ? ' · ⭐ Top 150' : ''}`
            ) : (
              'All problems with brute force & optimal solutions — just scroll'
            )}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#8b949e', padding: '4rem 0' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>¯\_(ツ)_/¯</div>
            <div>
              {query
                ? `No problems found for "${query}"`
                : 'No problems match the current filters'}
            </div>
          </div>
        ) : (
          Array.from(grouped.entries()).map(([topic, topicProblems]) => (
            <section key={topic} id={topicId(topic)} style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#58a6ff', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                  {topic}
                </h2>
                <div style={{ flex: 1, height: '1px', background: '#30363d' }} />
                <span style={{ fontSize: '0.72rem', color: '#8b949e' }}>{topicProblems.length}</span>
              </div>
              {topicProblems.map((problem, i) => (
                <ProblemCard
                  key={problem.id}
                  problem={problem}
                  index={i}
                  editMode={editMode && isAdmin}
                  locked={problem.isLocked}
                  onUpdate={handleUpdate}
                />
              ))}
            </section>
          ))
        )}
      </main>
    </div>
  );
}
