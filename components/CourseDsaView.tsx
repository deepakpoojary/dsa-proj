'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import SiteNav from './SiteNav';
import StudyList, { arrange, SortToggle } from './StudyList';
import { NoteEditsProvider } from './NoteEdits';
import { StarFilter } from './Stars';
import { NotesCtx, useNoteHost } from './Notes';
import { DSA_TOPIC, SITE_DSA_COOKIE, StudyItem } from '@/lib/study-items';
import { useStudyProgress } from '@/lib/use-study-progress';
import { COURSE_NAME } from '@/lib/course-syllabus';

const PREFS_KEY = 'dsa-course:prefs';

const sectionId = (s: string) => `dsa-${s.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

export function setSiteDsa(on: boolean) {
  document.cookie = `${SITE_DSA_COOKIE}=${on ? '1' : '0'}; path=/; max-age=31536000; samesite=lax`;
}

export default function CourseDsaView({ items, email }: { items: StudyItem[]; email: string | null }) {
  const router = useRouter();
  const signedIn = !!email;
  const noteHost = useNoteHost(signedIn);
  const { isDone, onToggle } = useStudyProgress(items, signedIn);
  const [minStars, setMinStars] = useState(0);
  const [sort, setSort] = useState<'order' | 'stars'>('order');
  const [hideQuizzes, setHideQuizzes] = useState(false);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}') as { minStars?: number; sort?: 'order' | 'stars'; hideQuizzes?: boolean };
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (typeof p.minStars === 'number') setMinStars(p.minStars);
      if (p.sort === 'order' || p.sort === 'stars') setSort(p.sort);
      if (typeof p.hideQuizzes === 'boolean') setHideQuizzes(p.hideQuizzes);
    } catch {
      // ignore
    }
  }, []);

  const save = (next: Partial<{ minStars: number; sort: 'order' | 'stars'; hideQuizzes: boolean }>) => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({ minStars, sort, hideQuizzes, ...next }));
    } catch {
      // ignore
    }
  };

  const sections = useMemo(() => {
    const out: { title: string; items: StudyItem[] }[] = [];
    for (const it of items) {
      const last = out[out.length - 1];
      if (last && last.title === it.group) last.items.push(it);
      else out.push({ title: it.group ?? '', items: [it] });
    }
    return out;
  }, [items]);

  const visible = (list: StudyItem[]) =>
    arrange(hideQuizzes ? list.filter((i) => i.kind === 'reading') : list, minStars, sort);

  const total = items.filter((i) => i.kind === 'reading').length;
  const done = items.filter((i) => i.kind === 'reading' && isDone(i)).length;
  const topics = { [DSA_TOPIC.key]: DSA_TOPIC };

  return (
    <NotesCtx.Provider value={noteHost.value}><NoteEditsProvider signedIn={signedIn}>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#0d1117' }}>
        <aside
          style={{
            width: '230px', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
            borderRight: '1px solid #21262d', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '1.1rem',
          }}
        >
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#e6edf3' }}>DSA Problems</div>
            <div style={{ fontSize: '0.72rem', color: '#8b949e', marginTop: '2px' }}>{COURSE_NAME} · {done}/{total} solved</div>
            <div style={{ height: '5px', borderRadius: '3px', background: '#21262d', marginTop: '6px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${total ? (done / total) * 100 : 0}%`, background: '#26a641' }} />
            </div>
          </div>

          <SiteNav variant="sidebar" />

          <label
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', padding: '8px 10px',
              borderRadius: '8px', border: '1px solid #30363d', background: '#161b22', fontSize: '0.75rem', color: '#8b949e', cursor: 'pointer',
            }}
            title="Bring back this site's own 450 DSA problems with full solutions"
          >
            {switching ? 'Loading…' : "Show this site's problems"}
            <input
              type="checkbox"
              checked={false}
              disabled={switching}
              onChange={() => {
                setSwitching(true);
                setSiteDsa(true);
                router.refresh();
              }}
            />
          </label>

          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
              Sections
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              {sections.map((s) => {
                const probs = s.items.filter((i) => i.kind === 'reading');
                const d = probs.filter(isDone).length;
                return (
                  <a
                    key={s.title}
                    href={`#${sectionId(s.title)}`}
                    style={{
                      display: 'flex', justifyContent: 'space-between', gap: '6px', fontSize: '0.76rem', padding: '3px 6px',
                      borderRadius: '5px', textDecoration: 'none', color: d === probs.length && probs.length ? '#3fb950' : '#c9d1d9',
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</span>
                    <span style={{ color: '#6e7681', flexShrink: 0 }}>{d}/{probs.length}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </aside>

        <main style={{ flex: 1, padding: '2rem 2.5rem 4rem', maxWidth: 'calc(100% - 230px)', overflowX: 'hidden' }}>
          <div style={{ marginBottom: '1.5rem', paddingBottom: '1.1rem', borderBottom: '1px solid #21262d' }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#e6edf3', margin: 0 }}>Course DSA problems</h1>
            <p style={{ color: '#8b949e', fontSize: '0.85rem', margin: '4px 0 0' }}>
              Every problem from your {COURSE_NAME}, rated ★1–5 for interview importance. Tick when solved; ✎ to keep your own notes.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginTop: '0.9rem' }}>
              <StarFilter value={minStars} onChange={(n) => { setMinStars(n); save({ minStars: n }); }} />
              <SortToggle value={sort} onChange={(v) => { setSort(v); save({ sort: v }); }} />
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#8b949e', cursor: 'pointer' }}>
                <input type="checkbox" checked={hideQuizzes} onChange={(e) => { setHideQuizzes(e.target.checked); save({ hideQuizzes: e.target.checked }); }} />
                Hide quizzes & tests
              </label>
              <a href="/search?q=dsa" style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#58a6ff', textDecoration: 'none' }}>🔎 Search →</a>
            </div>
          </div>

          {sort === 'stars' ? (
            <StudyList items={visible(items)} topics={topics} mode="notes" isDone={isDone} onToggle={onToggle} canTrack={signedIn} showGroups={false} />
          ) : (
            sections.map((s) => {
              const list = visible(s.items);
              if (!list.length) return null;
              const probs = s.items.filter((i) => i.kind === 'reading');
              return (
                <section key={s.title} id={sectionId(s.title)} style={{ marginBottom: '2rem', scrollMarginTop: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                    <h2 style={{ fontSize: '0.8rem', fontWeight: 700, color: DSA_TOPIC.color, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                      {s.title}
                    </h2>
                    <div style={{ flex: 1, height: '1px', background: '#21262d' }} />
                    <span style={{ fontSize: '0.72rem', color: '#8b949e' }}>{probs.filter(isDone).length}/{probs.length}</span>
                  </div>
                  <StudyList items={list} topics={topics} mode="notes" isDone={isDone} onToggle={onToggle} canTrack={signedIn} showGroups={false} />
                </section>
              );
            })
          )}
        </main>
      </div>
      {noteHost.modal}
    </NoteEditsProvider></NotesCtx.Provider>
  );
}
