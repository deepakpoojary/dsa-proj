'use client';

import { useContext, useEffect, useState } from 'react';
import type { CatalogItem } from '@/lib/item-catalog';
import { formatInterval, previewIntervals, Grade, ReviewState } from '@/lib/spaced-repetition';
import { NotesCtx } from '@/components/Notes';

const KIND_ICON: Record<string, string> = { reading: '📄', quiz: '❓', video: '🎬', test: '🧪' };

const GRADES: { key: Grade; label: string; color: string; hotkey: string }[] = [
  { key: 'again', label: 'Again', color: '#f85149', hotkey: '1' },
  { key: 'hard', label: 'Hard', color: '#d29922', hotkey: '2' },
  { key: 'good', label: 'Good', color: '#3fb950', hotkey: '3' },
  { key: 'easy', label: 'Easy', color: '#58a6ff', hotkey: '4' },
];

// One focused review pass over `initial`. "Again" sends the item to the back
// of this session's queue so it comes round once more before you finish.
export default function ReviewSession({
  initial,
  reviews,
  onGrade,
  onClose,
  noteOpen,
}: {
  initial: CatalogItem[];
  reviews: Record<string, ReviewState>;
  onGrade: (id: string, grade: Grade) => void;
  onClose: () => void;
  noteOpen: boolean;
}) {
  const { notes, open } = useContext(NotesCtx);
  const [queue, setQueue] = useState<CatalogItem[]>(initial);
  const [revealed, setRevealed] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const total = initial.length;
  const item = queue[0];

  function rate(g: Grade) {
    if (!item) return;
    onGrade(item.id, g);
    setReviewed((n) => n + 1);
    setRevealed(false);
    setQueue((q) => (g === 'again' ? [...q.slice(1), q[0]] : q.slice(1)));
  }

  useEffect(() => {
    if (noteOpen) return; // typing in the note popup must not trigger shortcuts
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onClose();
      if (!item) return;
      if (!revealed && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        setRevealed(true);
        return;
      }
      if (revealed) {
        const g = GRADES.find((x) => x.hotkey === e.key);
        if (g) rate(g.key);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const note = item ? notes[item.id] : undefined;
  const hasNote = !!note && note.body.trim() !== '';
  const intervals = item ? previewIntervals(reviews[item.id]) : null;
  const context = item ? [item.area, item.section].filter(Boolean).join(' · ') : '';
  const remaining = queue.length;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 90, background: '#0d1117',
        display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.25rem 1rem',
        overflowY: 'auto',
      }}
    >
      <div style={{ width: '100%', maxWidth: '640px', display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
        <button
          type="button"
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#8b949e', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}
        >
          ✕ End
        </button>
        <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: '#21262d', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${total ? Math.min(100, ((total - Math.min(remaining, total)) / total) * 100) : 100}%`, background: '#3fb950', transition: 'width 0.3s' }} />
        </div>
        <span style={{ fontSize: '0.75rem', color: '#8b949e', whiteSpace: 'nowrap' }}>{remaining} left</span>
      </div>

      {!item ? (
        <div style={{ margin: 'auto', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem' }}>✅</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#e6edf3', marginTop: '0.5rem' }}>Session done</div>
          <p style={{ color: '#8b949e', fontSize: '0.85rem' }}>{reviewed} review{reviewed === 1 ? '' : 's'}. Come back when more are due.</p>
          <button
            type="button"
            onClick={onClose}
            style={{ marginTop: '0.5rem', padding: '0.55rem 1.4rem', borderRadius: '8px', border: 'none', background: '#238636', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
          >
            Back to Revision
          </button>
        </div>
      ) : (
        <div style={{ width: '100%', maxWidth: '640px', margin: 'auto 0', padding: '2rem 0' }}>
          <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '14px', padding: '1.75rem 1.5rem' }}>
            <div style={{ fontSize: '0.72rem', color: '#8b949e', letterSpacing: '0.04em' }}>{context}</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#e6edf3', margin: '0.4rem 0 0.2rem', lineHeight: 1.3 }}>
              {item.kind && <span style={{ fontSize: '1rem', marginRight: '8px' }}>{KIND_ICON[item.kind]}</span>}
              {item.title}
            </div>
            {!reviews[item.id] && <span style={{ fontSize: '0.68rem', color: '#58a6ff' }}>NEW</span>}

            {!revealed ? (
              <div style={{ marginTop: '1.5rem' }}>
                <p style={{ color: '#8b949e', fontSize: '0.85rem', margin: '0 0 1rem' }}>
                  Recall the approach, key idea and edge cases. Then check.
                </p>
                <button
                  type="button"
                  onClick={() => setRevealed(true)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #30363d', background: '#21262d', color: '#e6edf3', fontSize: '0.9rem', cursor: 'pointer' }}
                >
                  {hasNote ? 'Show my note' : 'Done recalling'} <span style={{ color: '#6e7681', fontSize: '0.75rem' }}>· Space</span>
                </button>
              </div>
            ) : (
              <div style={{ marginTop: '1.25rem' }}>
                {hasNote ? (
                  <div
                    onClick={() => open({ id: item.id, title: item.title, context })}
                    title="Click to edit"
                    style={{
                      padding: '0.85rem 1rem', borderRadius: '10px', background: '#0d1117', border: '1px solid #30363d',
                      color: '#c9d1d9', fontSize: '0.88rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', cursor: 'text',
                      maxHeight: '45vh', overflowY: 'auto',
                    }}
                  >
                    {note!.body}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => open({ id: item.id, title: item.title, context })}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', border: '1px dashed #30363d', background: 'transparent', color: '#8b949e', fontSize: '0.82rem', cursor: 'pointer' }}
                  >
                    ✎ No note yet. Write what you recalled so next time is easier.
                  </button>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginTop: '1.25rem' }}>
                  {GRADES.map((g) => (
                    <button
                      key={g.key}
                      type="button"
                      onClick={() => rate(g.key)}
                      style={{
                        padding: '0.6rem 0.25rem', borderRadius: '10px', cursor: 'pointer',
                        border: `1px solid ${g.color}55`, background: `${g.color}14`, color: '#e6edf3',
                      }}
                    >
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: g.color }}>{g.label}</div>
                      <div style={{ fontSize: '0.7rem', color: '#8b949e', marginTop: '2px' }}>
                        {formatInterval(intervals![g.key])} · {g.hotkey}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
