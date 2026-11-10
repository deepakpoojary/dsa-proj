'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import SiteNav from './SiteNav';
import StudyList, { arrange, ModeToggle, SortToggle, useListMode } from './StudyList';
import { NoteEditsProvider } from './NoteEdits';
import { StarFilter } from './Stars';
import { NotesCtx, useNoteHost } from './Notes';
import type { StudyItem, StudyTopic } from '@/lib/study-items';
import { useStudyProgress } from '@/lib/use-study-progress';

export default function SearchView({
  q, items, topics, category, categories, email,
}: {
  q: string;
  items: StudyItem[];
  topics: Record<string, StudyTopic>;
  category: { key: string; label: string } | null;
  categories: { key: string; label: string; query: string; count: number }[];
  email: string | null;
}) {
  const router = useRouter();
  const signedIn = !!email;
  const [text, setText] = useState(q);
  const [pending, startTransition] = useTransition();
  const [mode, setMode] = useListMode();
  const [minStars, setMinStars] = useState(0);
  const [sort, setSort] = useState<'order' | 'stars'>('stars');
  const noteHost = useNoteHost(signedIn);
  const { isDone, onToggle } = useStudyProgress(items, signedIn);
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const len = inputRef.current?.value.length ?? 0;
    inputRef.current?.setSelectionRange(len, len);
  }, []);

  const go = (value: string) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      startTransition(() => router.replace(value.trim() ? `/search?q=${encodeURIComponent(value.trim())}` : '/search'));
    }, 350);
  };

  // Group by topic (keeping the server's order) so each category reads as its own block.
  const groups = useMemo(() => {
    const list = arrange(items, minStars, sort);
    const map = new Map<string, StudyItem[]>();
    for (const it of list) {
      if (!map.has(it.topic)) map.set(it.topic, []);
      map.get(it.topic)!.push(it);
    }
    return [...map.entries()];
  }, [items, minStars, sort]);

  const shown = groups.reduce((a, [, l]) => a + l.length, 0);
  const revised = items.filter(isDone).length;

  return (
    <NotesCtx.Provider value={noteHost.value}><NoteEditsProvider signedIn={signedIn}>
      <div style={{ minHeight: '100vh', background: '#0d1117', padding: '1.5rem 1rem 4rem' }}>
        <div style={{ maxWidth: '920px', margin: '0 auto' }}>
          <SiteNav />

          <div style={{ marginTop: '1.5rem', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6e7681' }}>🔎</span>
            <input
              ref={inputRef}
              type="search"
              value={text}
              onChange={(e) => { setText(e.target.value); go(e.target.value); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { if (timer.current) clearTimeout(timer.current); startTransition(() => router.replace(`/search?q=${encodeURIComponent(text.trim())}`)); } }}
              placeholder='Search everything — try "dsa", "node js", "devops", "typescript generics", "deadlock"…'
              aria-label="Search all questions"
              style={{
                width: '100%', padding: '0.8rem 1rem 0.8rem 2.6rem', borderRadius: '10px', border: '1px solid #30363d',
                background: '#161b22', color: '#e6edf3', fontSize: '1rem', outline: 'none',
              }}
            />
            {pending && <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#8b949e', fontSize: '0.75rem' }}>searching…</span>}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.8rem' }}>
            {categories.map((c) => {
              const active = category?.key === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => { setText(c.query); startTransition(() => router.replace(`/search?q=${encodeURIComponent(c.query)}`)); }}
                  style={{
                    padding: '3px 11px', borderRadius: '999px', fontSize: '0.75rem', cursor: 'pointer',
                    border: `1px solid ${active ? '#58a6ff' : '#30363d'}`, background: active ? 'rgba(88,166,255,0.12)' : 'transparent',
                    color: active ? '#e6edf3' : '#8b949e',
                  }}
                >
                  {c.label} <span style={{ color: '#6e7681' }}>{c.count}</span>
                </button>
              );
            })}
          </div>

          {q.trim() && (
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', margin: '1.2rem 0 1rem', paddingBottom: '0.9rem', borderBottom: '1px solid #21262d' }}>
              <div style={{ fontSize: '0.85rem', color: '#c9d1d9', marginRight: 'auto' }}>
                {category ? <><strong style={{ color: '#e6edf3' }}>{category.label}</strong> only · </> : null}
                {shown} question{shown === 1 ? '' : 's'}{shown !== items.length ? ` of ${items.length}` : ''} · {revised} revised
              </div>
              <ModeToggle mode={mode} onChange={setMode} />
              <StarFilter value={minStars} onChange={setMinStars} />
              <SortToggle value={sort} onChange={setSort} />
            </div>
          )}

          {!q.trim() ? (
            <p style={{ color: '#8b949e', fontSize: '0.85rem', marginTop: '2rem', textAlign: 'center' }}>
              Type a category (<code>dsa</code>, <code>javascript</code>, <code>node js</code>, <code>typescript</code>, <code>devops</code>, <code>os</code>, <code>dbms</code>…) to see only its questions,
              add words to narrow it (<code>node streams</code>), or search any topic.
            </p>
          ) : shown === 0 ? (
            <p style={{ color: '#8b949e', fontSize: '0.9rem', textAlign: 'center', marginTop: '2rem' }}>No questions match “{q}”.</p>
          ) : (
            groups.map(([topicKey, list]) => {
              const t = topics[topicKey];
              return (
                <section key={topicKey} style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.6rem' }}>
                    <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: t?.color ?? '#58a6ff' }} />
                    <h2 style={{ fontSize: '0.8rem', fontWeight: 700, color: t?.color ?? '#58a6ff', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                      {t?.label ?? topicKey}
                    </h2>
                    <div style={{ flex: 1, height: '1px', background: '#21262d' }} />
                    <span style={{ fontSize: '0.72rem', color: '#8b949e' }}>{list.length}</span>
                  </div>
                  <StudyList
                    items={list}
                    topics={topics}
                    mode={mode}
                    isDone={isDone}
                    onToggle={onToggle}
                    canTrack={signedIn}
                    showGroups={sort === 'order'}
                  />
                </section>
              );
            })
          )}
        </div>
      </div>
      {noteHost.modal}
    </NoteEditsProvider></NotesCtx.Provider>
  );
}
