'use client';

import { useCallback, useContext, useEffect, useState } from 'react';
import type { StudyItem, StudyTopic } from '@/lib/study-items';
import type { NoteLine } from '@/lib/answer-notes';
import Stars from './Stars';
import { NoteButton, NotesCtx } from './Notes';

export type ListMode = 'notes' | 'inline';

const DIFF_COLOR: Record<string, string> = { Easy: '#3fb950', Medium: '#d29922', Hard: '#f85149' };
const KIND_ICON: Record<string, string> = { reading: '🧩', quiz: '❓', video: '🎬', test: '🧪' };

// `code` spans inside note text.
function Inline({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('`') && p.endsWith('`') && p.length > 2 ? (
          <code key={i} style={{ background: 'rgba(110,118,129,0.2)', borderRadius: '4px', padding: '0 4px', fontSize: '0.92em', fontFamily: 'var(--font-geist-mono), monospace' }}>
            {p.slice(1, -1)}
          </code>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

export function NotesBody({ notes, code }: { notes?: NoteLine[]; code?: string }) {
  return (
    <div style={{ fontSize: '0.86rem', lineHeight: 1.6, color: '#c9d1d9' }}>
      {notes && notes.length > 0 && (
        <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {notes.map((n, i) =>
            n.heading ? (
              <li key={i} style={{ listStyle: 'none', marginLeft: '-1.1rem', marginTop: i ? '6px' : 0, color: '#e6edf3', fontWeight: 600, fontSize: '0.8rem' }}>
                <Inline text={n.text} />
              </li>
            ) : (
              <li key={i} style={{ marginLeft: n.level ? '1rem' : 0, listStyle: n.level ? 'circle' : 'disc' }}>
                <Inline text={n.text} />
              </li>
            )
          )}
        </ul>
      )}
      {code && (
        <pre
          style={{
            margin: notes?.length ? '0.8rem 0 0' : 0, padding: '0.7rem 0.85rem', background: '#0d1117', border: '1px solid #30363d',
            borderRadius: '8px', overflowX: 'auto', fontSize: '0.78rem', lineHeight: 1.55, color: '#e6edf3',
            fontFamily: 'var(--font-geist-mono), monospace',
          }}
        >
          {code}
        </pre>
      )}
    </div>
  );
}

function DoneBox({
  item, done, canTrack, onToggle, color,
}: { item: StudyItem; done: boolean; canTrack: boolean; onToggle: (item: StudyItem, done: boolean) => void; color: string }) {
  if (!canTrack && item.progress.kind !== 'checklist') {
    return (
      <a href="/login" title="Log in to track progress" onClick={(e) => e.stopPropagation()} style={{ fontSize: '0.8rem', color: '#6e7681', textDecoration: 'none', width: '16px', textAlign: 'center' }}>
        ○
      </a>
    );
  }
  return (
    <input
      type="checkbox"
      checked={done}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onToggle(item, e.target.checked)}
      title={done ? 'Mark as not revised' : 'Mark as revised'}
      style={{ accentColor: color, cursor: 'pointer', flexShrink: 0 }}
    />
  );
}

// ── Popup ──────────────────────────────────────────────────────────────────

function AnswerPopup({
  items, index, topics, isDone, canTrack, onToggle, onIndex, onClose,
}: {
  items: StudyItem[];
  index: number;
  topics: Record<string, StudyTopic>;
  isDone: (item: StudyItem) => boolean;
  canTrack: boolean;
  onToggle: (item: StudyItem, done: boolean) => void;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const item = items[index];
  const topic = topics[item.topic];
  const color = topic?.color ?? '#58a6ff';
  const done = isDone(item);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.closest?.('input[type=text], textarea')) return;
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight' && index < items.length - 1) onIndex(index + 1);
      else if (e.key === 'ArrowLeft' && index > 0) onIndex(index - 1);
      else if (e.key.toLowerCase() === 'd' && (canTrack || item.progress.kind === 'checklist')) onToggle(item, !done);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [index, items.length, item, done, canTrack, onIndex, onClose, onToggle]);

  const navBtn: React.CSSProperties = {
    background: '#21262d', border: '1px solid #30363d', color: '#c9d1d9', borderRadius: '6px',
    padding: '3px 10px', fontSize: '0.75rem', cursor: 'pointer',
  };

  return (
    <div
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(1,4,9,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      }}
    >
      <div
        role="dialog"
        aria-label={item.title}
        style={{
          width: '100%', maxWidth: '680px', maxHeight: '88vh', background: '#161b22', border: '1px solid #30363d',
          borderTop: `3px solid ${color}`, borderRadius: '12px', boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        <div style={{ padding: '0.9rem 1.1rem 0.7rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', borderBottom: '1px solid #21262d' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.68rem', color: '#8b949e', marginBottom: '4px', flexWrap: 'wrap' }}>
              <span style={{ color }}>{topic?.label ?? item.topic}</span>
              {item.group && <span>· {item.group}</span>}
              <Stars value={item.stars} />
              {item.difficulty && <span style={{ color: DIFF_COLOR[item.difficulty] }}>{item.difficulty}</span>}
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#e6edf3', lineHeight: 1.45 }}>{item.title}</div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', color: '#8b949e', fontSize: '1.2rem', cursor: 'pointer', lineHeight: 1 }}>
            ×
          </button>
        </div>

        <div style={{ padding: '0.9rem 1.1rem', overflowY: 'auto', flex: 1 }}>
          <NotesBody notes={item.notes} code={item.code} />
          {item.links && item.links.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.9rem' }}>
              {item.links.map((l) => (
                <a key={l.href} href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                  style={{ fontSize: '0.75rem', color: '#58a6ff', textDecoration: 'none', border: '1px solid #30363d', borderRadius: '999px', padding: '2px 10px' }}>
                  {l.label}
                </a>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '0.6rem 1.1rem 0.8rem', borderTop: '1px solid #21262d', display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button type="button" style={{ ...navBtn, opacity: index > 0 ? 1 : 0.4 }} disabled={index === 0} onClick={() => onIndex(index - 1)}>← Prev</button>
          <button type="button" style={{ ...navBtn, opacity: index < items.length - 1 ? 1 : 0.4 }} disabled={index >= items.length - 1} onClick={() => onIndex(index + 1)}>Next →</button>
          <span style={{ fontSize: '0.72rem', color: '#6e7681' }}>{index + 1} / {items.length}</span>
          <label style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: done ? '#3fb950' : '#c9d1d9', cursor: 'pointer' }}>
            <DoneBox item={item} done={done} canTrack={canTrack} onToggle={onToggle} color="#3fb950" />
            {done ? 'Revised' : 'Mark revised'}
          </label>
          <span style={{ fontSize: '0.68rem', color: '#6e7681', width: '100%' }}>← → to move · D to mark revised · Esc to close</span>
        </div>
      </div>
    </div>
  );
}

// ── Mode toggle ────────────────────────────────────────────────────────────

const MODE_KEY = 'study:list-mode';

// Notes-popup style is the default (active recall); the choice is remembered.
export function useListMode(): [ListMode, (m: ListMode) => void] {
  const [mode, setMode] = useState<ListMode>('notes');
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (localStorage.getItem(MODE_KEY) === 'inline') setMode('inline');
    } catch {
      // storage blocked — stay on the default
    }
  }, []);
  const set = useCallback((m: ListMode) => {
    setMode(m);
    try { localStorage.setItem(MODE_KEY, m); } catch { /* ignore */ }
  }, []);
  return [mode, set];
}

export function ModeToggle({ mode, onChange }: { mode: ListMode; onChange: (m: ListMode) => void }) {
  const opts: { m: ListMode; label: string; title: string }[] = [
    { m: 'notes', label: '📝 Notes popup', title: 'Questions only — open the answer in a popup (active recall)' },
    { m: 'inline', label: '📄 Q & A', title: 'Show every answer below its question' },
  ];
  return (
    <div style={{ display: 'inline-flex', gap: '2px', border: '1px solid #30363d', borderRadius: '8px', padding: '2px' }}>
      {opts.map((o) => (
        <button key={o.m} type="button" title={o.title} onClick={() => onChange(o.m)}
          style={{
            border: 'none', borderRadius: '6px', padding: '3px 10px', fontSize: '0.74rem', cursor: 'pointer',
            background: mode === o.m ? 'rgba(88,166,255,0.15)' : 'transparent', color: mode === o.m ? '#58a6ff' : '#8b949e',
            fontWeight: mode === o.m ? 600 : 400,
          }}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function SortToggle({ value, onChange }: { value: 'order' | 'stars'; onChange: (v: 'order' | 'stars') => void }) {
  return (
    <button type="button" onClick={() => onChange(value === 'order' ? 'stars' : 'order')}
      title="Toggle ordering"
      style={{ border: '1px solid #30363d', borderRadius: '8px', padding: '4px 10px', fontSize: '0.74rem', cursor: 'pointer', background: 'transparent', color: '#8b949e' }}>
      Sort: <span style={{ color: '#e6edf3' }}>{value === 'stars' ? '★ Importance' : 'Topic order'}</span>
    </button>
  );
}

/** Filter by min stars and optionally sort most-important first (stable). */
export function arrange(items: StudyItem[], minStars: number, sort: 'order' | 'stars'): StudyItem[] {
  const f = minStars > 0 ? items.filter((i) => i.stars >= minStars) : items;
  return sort === 'stars' ? [...f].sort((a, b) => b.stars - a.stars) : f;
}

// ── List ───────────────────────────────────────────────────────────────────

export default function StudyList({
  items, topics, mode, isDone, onToggle, canTrack, showGroups = true, showTopic = false, renderInline,
}: {
  items: StudyItem[];
  topics: Record<string, StudyTopic>;
  mode: ListMode;
  isDone: (item: StudyItem) => boolean;
  onToggle: (item: StudyItem, done: boolean) => void;
  canTrack: boolean;
  showGroups?: boolean;
  showTopic?: boolean;
  /** Return a node to replace an item's inline card (e.g. the admin editor). */
  renderInline?: (item: StudyItem) => React.ReactNode | null;
}) {
  const notesCtx = useContext(NotesCtx);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  // The popup steps only through items that have an answer.
  const answerable = items.filter((it) => it.notes?.length || it.code);
  const close = useCallback(() => setOpenIdx(null), []);

  const openItem = (item: StudyItem) => {
    const i = answerable.indexOf(item);
    if (i >= 0) setOpenIdx(i);
    else if (item.noteId) {
      const has = !!notesCtx.notes[item.noteId]?.body.trim();
      notesCtx.open({ id: item.noteId, title: item.title, context: item.group, mode: has ? 'view' : 'edit' });
    }
  };

  return (
    <div>
      {items.map((item, idx) => {
        const topic = topics[item.topic];
        const color = topic?.color ?? '#58a6ff';
        const done = isDone(item);
        const groupHeader = showGroups && item.group && item.group !== items[idx - 1]?.group ? item.group : null;
        const header = groupHeader ? (
          <div style={{ fontSize: '0.7rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.07em', margin: `${idx ? '1rem' : '0.2rem'} 0 0.35rem` }}>
            {groupHeader}
          </div>
        ) : null;

        const custom = mode === 'inline' && renderInline ? renderInline(item) : null;
        if (custom) return <div key={item.key}>{header}{custom}</div>;

        const hasAnswer = !!(item.notes?.length || item.code);
        const meta = (
          <>
            {showTopic && topic && (
              <span style={{ fontSize: '0.66rem', color, border: `1px solid ${color}55`, borderRadius: '999px', padding: '0 6px', whiteSpace: 'nowrap' }}>{topic.label}</span>
            )}
            {item.difficulty && <span style={{ fontSize: '0.68rem', color: DIFF_COLOR[item.difficulty], whiteSpace: 'nowrap' }}>{item.difficulty}</span>}
            <Stars value={item.stars} />
          </>
        );

        if (mode === 'inline' && hasAnswer) {
          return (
            <div key={item.key}>
              {header}
              <div style={{ background: '#161b22', border: '1px solid #30363d', borderLeft: `3px solid ${color}`, borderRadius: '10px', marginBottom: '8px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '12px 14px 10px' }}>
                  <span style={{ paddingTop: '3px' }}><DoneBox item={item} done={done} canTrack={canTrack} onToggle={onToggle} color={color} /></span>
                  <div style={{ flex: 1, color: '#e6edf3', fontSize: '0.92rem', fontWeight: 600, lineHeight: 1.5 }}>{item.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '3px' }}>{meta}</div>
                </div>
                <div style={{ padding: '10px 14px 14px', borderTop: '1px solid #21262d' }}>
                  <NotesBody notes={item.notes} code={item.code} />
                  {item.links && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem' }}>
                      {item.links.map((l) => (
                        <a key={l.href} href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" style={{ fontSize: '0.72rem', color: '#58a6ff', textDecoration: 'none' }}>{l.label}</a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        }

        // Notes mode (and answer-less items in either mode): one compact row.
        const note = item.noteId ? notesCtx.notes[item.noteId] : undefined;
        return (
          <div key={item.key}>
            {header}
            <div
              role="button"
              tabIndex={0}
              onClick={() => openItem(item)}
              onKeyDown={(e) => { if (e.key === 'Enter') openItem(item); }}
              className="study-row"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.65rem', borderRadius: '8px',
                cursor: hasAnswer || item.noteId ? 'pointer' : 'default', borderLeft: `2px solid ${done ? '#3fb950' : color}`,
                background: done ? 'rgba(63,185,80,0.05)' : 'transparent', marginBottom: '2px',
              }}
            >
              <DoneBox item={item} done={done} canTrack={canTrack} onToggle={onToggle} color={color} />
              {item.kind && <span style={{ fontSize: '0.72rem' }} title={item.kind}>{KIND_ICON[item.kind] ?? '•'}</span>}
              <span style={{ flex: 1, minWidth: 0, fontSize: '0.86rem', color: done ? '#8b949e' : '#e6edf3', lineHeight: 1.45 }}>{item.title}</span>
              {meta}
              {hasAnswer ? (
                <span style={{ fontSize: '0.7rem', color: '#d29922', border: '1px solid rgba(210,153,34,0.45)', background: 'rgba(210,153,34,0.1)', borderRadius: '999px', padding: '1px 8px', whiteSpace: 'nowrap' }}>
                  📝 Notes
                </span>
              ) : item.noteId ? (
                <NoteButton
                  note={note}
                  onClick={() => notesCtx.open({ id: item.noteId!, title: item.title, context: item.group })}
                  onView={() => notesCtx.open({ id: item.noteId!, title: item.title, context: item.group, mode: 'view' })}
                />
              ) : null}
              {!hasAnswer && item.links?.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                  style={{ fontSize: '0.7rem', color: '#58a6ff', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        );
      })}

      {openIdx !== null && answerable[openIdx] && (
        <AnswerPopup
          items={answerable}
          index={openIdx}
          topics={topics}
          isDone={isDone}
          canTrack={canTrack}
          onToggle={onToggle}
          onIndex={setOpenIdx}
          onClose={close}
        />
      )}
    </div>
  );
}
