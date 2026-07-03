'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Fuse from 'fuse.js';
import { EnrichedProblem } from '@/types';
import ProblemCard from './ProblemCard';

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

export default function ProblemsView({ problems: initialProblems }: { problems: EnrichedProblem[] }) {
  const [problems, setProblems] = useState(initialProblems);
  const [query, setQuery] = useState('');
  const [editMode, setEditMode] = useState(true);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const fuse = useMemo(
    () => new Fuse(problems, { keys: ['title', 'description', 'topic'], threshold: 0.35 }),
    [problems]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return problems;
    return fuse.search(query).map((r) => r.item);
  }, [query, fuse, problems]);

  const grouped = useMemo(() => {
    const map = new Map<string, EnrichedProblem[]>();
    for (const p of filtered) {
      if (!map.has(p.topic)) map.set(p.topic, []);
      map.get(p.topic)!.push(p);
    }
    return map;
  }, [filtered]);

  const allTopics = useMemo(() => Array.from(new Set(problems.map((p) => p.topic))), [problems]);
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

        {/* Edit mode toggle */}
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

        {/* TOC */}
        <nav>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#8b949e', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Topics
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {allTopics.map((topic) => {
              const active = visibleTopics.includes(topic);
              const count = (grouped.get(topic) || problems.filter((p) => p.topic === topic)).length;
              return (
                <a
                  key={topic}
                  href={`#${topicId(topic)}`}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.35rem 0.6rem', borderRadius: '6px', fontSize: '0.82rem',
                    color: active ? '#e6edf3' : '#4a5568', textDecoration: 'none',
                    pointerEvents: active ? 'auto' : 'none', transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { if (active) (e.currentTarget as HTMLElement).style.background = '#161b22'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
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
            {query
              ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${query}"`
              : 'All problems with brute force & optimal solutions — just scroll'}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#8b949e', padding: '4rem 0' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>¯\_(ツ)_/¯</div>
            <div>No problems found for &quot;{query}&quot;</div>
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
                  editMode={editMode}
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
