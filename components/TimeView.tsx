'use client';

import { useEffect, useState } from 'react';
import SiteNav from '@/components/SiteNav';
import { useDocs, DOC_STATUS_LABEL } from '@/lib/use-docs';
import { shiftDay, formatDay } from '@/lib/journal';
import { useToday } from '@/components/JournalView';
import {
  DayLog, RunningTimer, TimeBlock, TimeCategory, EMPTY_DAY, DEFAULT_CATEGORIES, categoryOf,
  mergeCategories, CUSTOM_COLORS, customCategoryKey,
  daySegments, sortBlocks, trackedMinutes, totalsByCategory, formatClock, formatDuration,
  formatElapsed, manualBlocks, appendDuration, timerToBlocks,
} from '@/lib/time-tracking';

const card: React.CSSProperties = {
  background: '#161b22', border: '1px solid #30363d', borderRadius: '12px', padding: '1rem 1.1rem',
};
const label: React.CSSProperties = {
  fontSize: '0.68rem', color: '#8b949e', letterSpacing: '0.06em', textTransform: 'uppercase',
};
const input: React.CSSProperties = {
  padding: '0.5rem 0.65rem', borderRadius: '8px', border: '1px solid #30363d', background: '#0d1117',
  color: '#e6edf3', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none',
};
const ghostBtn: React.CSSProperties = {
  background: 'none', border: '1px solid #30363d', color: '#8b949e', borderRadius: '8px',
  padding: '0.35rem 0.7rem', fontSize: '0.75rem', cursor: 'pointer',
};
const UNTRACKED = 'repeating-linear-gradient(45deg, #21262d, #21262d 4px, #161b22 4px, #161b22 8px)';
const DURATION_PRESETS = [15, 30, 60, 120];

export default function TimeView({ signedIn }: { signedIn: boolean }) {
  const today = useToday();
  const [picked, setPicked] = useState<string | null>(null);
  const day = picked ?? today;
  const isToday = day === today;

  const { docs: days, setDoc: setDay, status } = useDocs<DayLog>('time', signedIn);
  const { docs: timers, setDoc: setTimerDoc } = useDocs<RunningTimer>('time-timer', signedIn);
  const timer = timers.current;
  const { docs: customDocs, setDoc: setCategoryDoc } = useDocs<TimeCategory & { createdAt: number }>('time-category', signedIn);
  const customCategories = Object.values(customDocs).sort((a, b) => a.createdAt - b.createdAt);
  const categories = mergeCategories(customCategories);

  const [newCatOpen, setNewCatOpen] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🏷️');
  const [newCatColor, setNewCatColor] = useState(CUSTOM_COLORS[0]);

  const [elapsedMs, setElapsedMs] = useState(0);
  useEffect(() => {
    if (!timer) return;
    const tick = () => setElapsedMs(Date.now() - timer.startedAt);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timer]);

  const [timerCategory, setTimerCategory] = useState(DEFAULT_CATEGORIES[0].key);
  const [durCategory, setDurCategory] = useState(DEFAULT_CATEGORIES[0].key);
  const [durAmount, setDurAmount] = useState('0.5');
  const [rangeCategory, setRangeCategory] = useState(DEFAULT_CATEGORIES[0].key);
  const [rangeStart, setRangeStart] = useState('09:00');
  const [rangeEnd, setRangeEnd] = useState('17:00');
  const [mode, setMode] = useState<'duration' | 'range'>('duration');

  if (!day) {
    return <div style={{ minHeight: '100vh', background: '#0d1117' }} />;
  }

  const log = days[day] ?? EMPTY_DAY;
  const blocks = log.blocks;
  const tracked = trackedMinutes(blocks);
  const untracked = 1440 - tracked;
  const totals = totalsByCategory(blocks.map((b) => ({ ...b, category: categoryOf(b.category, categories).key })));

  const addParts = (parts: { day: string; block: TimeBlock }[]) => {
    for (const p of parts) {
      const existing = days[p.day] ?? EMPTY_DAY;
      setDay(p.day, { blocks: [...existing.blocks, p.block] });
    }
  };

  const deleteBlock = (id: string) => {
    const next = blocks.filter((b) => b.id !== id);
    setDay(day, next.length ? { blocks: next } : null);
  };

  const startTimer = () => setTimerDoc('current', { category: timerCategory, startedAt: Date.now() });
  const stopTimer = () => {
    if (!timer) return;
    addParts(timerToBlocks(timer.startedAt, Date.now(), timer.category));
    setTimerDoc('current', null);
  };
  const discardTimer = () => setTimerDoc('current', null);

  const submitDuration = (e: React.FormEvent) => {
    e.preventDefault();
    const minutes = Math.round(Number(durAmount) * 60);
    if (!minutes || minutes <= 0) return;
    addParts(appendDuration(day, blocks, minutes, durCategory));
  };

  const submitRange = (e: React.FormEvent) => {
    e.preventDefault();
    addParts(manualBlocks(day, rangeStart, rangeEnd, rangeCategory));
  };

  const submitCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCatLabel.trim();
    if (!name) return;
    const key = customCategoryKey(name);
    setCategoryDoc(key, { key, label: name, icon: newCatIcon.trim() || '🏷️', color: newCatColor, createdAt: Date.now() });
    setDurCategory(key);
    setRangeCategory(key);
    setTimerCategory(key);
    setNewCatLabel('');
    setNewCatIcon('🏷️');
    setNewCatColor(CUSTOM_COLORS[(customCategories.length + 1) % CUSTOM_COLORS.length]);
    setNewCatOpen(false);
  };

  // Blocks already logged under a removed category fall back to "Other".
  const deleteCategory = (key: string) => {
    setCategoryDoc(key, null);
    const fallback = DEFAULT_CATEGORIES[0].key;
    if (durCategory === key) setDurCategory(fallback);
    if (rangeCategory === key) setRangeCategory(fallback);
    if (timerCategory === key) setTimerCategory(fallback);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', padding: '2rem 1rem 4rem' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <SiteNav />

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#e6edf3', margin: 0 }}>⏱ Time</h1>
            <p style={{ color: '#8b949e', fontSize: '0.85rem', margin: '6px 0 0' }}>
              Log where the day went, and see what&apos;s untracked.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button type="button" style={ghostBtn} onClick={() => setPicked(shiftDay(day, -1))} aria-label="Previous day">←</button>
            <button
              type="button"
              style={{ ...ghostBtn, color: isToday ? '#58a6ff' : '#8b949e', borderColor: isToday ? 'rgba(88,166,255,0.45)' : '#30363d' }}
              onClick={() => setPicked(null)}
            >
              Today
            </button>
            <button type="button" style={ghostBtn} onClick={() => setPicked(shiftDay(day, 1))} aria-label="Next day" disabled={isToday}>→</button>
          </div>
        </div>

        {/* Live timer, independent of the day being viewed */}
        <div style={{ ...card, display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
          {timer ? (
            <>
              <span
                aria-hidden
                style={{
                  width: '10px', height: '10px', borderRadius: '50%', background: categoryOf(timer.category, categories).color,
                  boxShadow: `0 0 0 4px ${categoryOf(timer.category, categories).color}33`, flexShrink: 0,
                }}
              />
              <span style={{ fontSize: '0.9rem', color: '#e6edf3', fontWeight: 600 }}>
                {categoryOf(timer.category, categories).icon} {categoryOf(timer.category, categories).label}
              </span>
              <span style={{ fontSize: '1.1rem', color: '#58a6ff', fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>
                {formatElapsed(elapsedMs)}
              </span>
              <div style={{ flex: 1 }} />
              <button type="button" onClick={stopTimer} style={{ ...ghostBtn, color: '#3fb950', borderColor: 'rgba(63,185,80,0.45)' }}>
                ■ Stop &amp; log
              </button>
              <button type="button" onClick={discardTimer} style={ghostBtn}>Discard</button>
            </>
          ) : (
            <>
              <span style={label}>Start a timer</span>
              <select value={timerCategory} onChange={(e) => setTimerCategory(e.target.value)} style={{ ...input, flex: '0 1 160px' }}>
                {categories.map((c) => (
                  <option key={c.key} value={c.key}>{c.icon} {c.label}</option>
                ))}
              </select>
              <button type="button" onClick={startTimer} style={{ ...ghostBtn, color: '#e6edf3', background: '#21262d' }}>▶ Start</button>
            </>
          )}
        </div>

        <div className="journal-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 260px', gap: '1rem', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#e6edf3' }}>{formatDay(day)}</div>
              <div style={{ fontSize: '0.72rem', color: '#6e7681' }}>
                {status ? DOC_STATUS_LABEL[status] : signedIn ? 'Saves automatically' : 'Saved on this device · log in to sync'}
              </div>
            </div>

            {/* Day timeline */}
            <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.82rem', color: '#e6edf3' }}>
                  <strong>{formatDuration(tracked)}</strong> tracked
                </span>
                <span style={{ fontSize: '0.82rem', color: '#6e7681' }}>
                  {untracked > 0 ? <><strong style={{ color: '#8b949e' }}>{formatDuration(untracked)}</strong> untracked</> : 'Fully tracked ✓'}
                </span>
              </div>
              <div style={{ display: 'flex', height: '30px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #30363d' }}>
                {daySegments(blocks).map((s, i) =>
                  s.kind === 'block' ? (
                    <div
                      key={i}
                      title={`${categoryOf(s.block.category, categories).label} · ${formatClock(s.start)}–${formatClock(s.end)}`}
                      style={{ flexGrow: s.end - s.start, flexBasis: 0, background: categoryOf(s.block.category, categories).color }}
                    />
                  ) : (
                    <div key={i} title={`Untracked · ${formatClock(s.start)}–${formatClock(s.end)}`} style={{ flexGrow: s.end - s.start, flexBasis: 0, background: UNTRACKED }} />
                  )
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#6e7681' }}>
                {[0, 3, 6, 9, 12, 15, 18, 21, 24].map((h) => <span key={h}>{h}</span>)}
              </div>
            </div>

            {/* Blocks list + add form */}
            <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div style={label}>Logged blocks</div>
                <button
                  type="button"
                  onClick={() => setNewCatOpen((o) => !o)}
                  aria-expanded={newCatOpen}
                  style={{ ...ghostBtn, padding: '0.2rem 0.55rem', fontSize: '0.7rem', color: newCatOpen ? '#58a6ff' : '#8b949e' }}
                >
                  {newCatOpen ? 'Close' : '+ Category'}
                </button>
              </div>

              {newCatOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.6rem', border: '1px dashed #30363d', borderRadius: '10px' }}>
                  <form onSubmit={submitCategory} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <input
                      value={newCatIcon} onChange={(e) => setNewCatIcon(e.target.value)} aria-label="Category icon"
                      maxLength={4} style={{ ...input, width: '3.2rem', textAlign: 'center' }}
                    />
                    <input
                      value={newCatLabel} onChange={(e) => setNewCatLabel(e.target.value)} aria-label="Category name"
                      placeholder="Category name, e.g. Reading" maxLength={30} autoFocus style={{ ...input, flex: '1 1 160px' }}
                    />
                    <div role="radiogroup" aria-label="Category colour" style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {CUSTOM_COLORS.map((col) => (
                        <button
                          key={col} type="button" role="radio" aria-checked={newCatColor === col} aria-label={col}
                          onClick={() => setNewCatColor(col)}
                          style={{
                            width: '18px', height: '18px', borderRadius: '50%', background: col, cursor: 'pointer', padding: 0,
                            border: newCatColor === col ? '2px solid #e6edf3' : '2px solid transparent',
                          }}
                        />
                      ))}
                    </div>
                    <button type="submit" disabled={!newCatLabel.trim()} style={{ ...ghostBtn, color: '#e6edf3', background: '#21262d' }}>Add category</button>
                  </form>
                  {customCategories.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {customCategories.map((c) => (
                        <span
                          key={c.key}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#e6edf3',
                            border: `1px solid ${c.color}66`, background: `${c.color}1a`, borderRadius: '999px', padding: '2px 4px 2px 8px',
                          }}
                        >
                          {c.icon} {c.label}
                          <button
                            type="button" onClick={() => deleteCategory(c.key)} aria-label={`Remove category ${c.label}`}
                            style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: '0.85rem', lineHeight: 1 }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {blocks.length === 0 && <div style={{ fontSize: '0.8rem', color: '#6e7681' }}>Nothing logged yet.</div>}
              <div>
                {sortBlocks(blocks).map((b) => {
                  const c = categoryOf(b.category, categories);
                  return (
                    <div key={b.id} className="time-row" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.3rem 0' }}>
                      <span aria-hidden style={{ width: '9px', height: '9px', borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '0.86rem', color: '#e6edf3', flex: 1 }}>{c.icon} {c.label}</span>
                      <span style={{ fontSize: '0.78rem', color: '#8b949e', whiteSpace: 'nowrap' }}>
                        {formatClock(b.start)}–{formatClock(b.end)} · {formatDuration(b.end - b.start)}
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteBlock(b.id)}
                        aria-label="Delete block"
                        className="time-del"
                        style={{ background: 'none', border: 'none', color: '#6e7681', cursor: 'pointer', fontSize: '0.95rem', lineHeight: 1 }}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>

              <div role="group" aria-label="Add mode" style={{ display: 'flex', border: '1px solid #30363d', borderRadius: '8px', overflow: 'hidden', alignSelf: 'flex-start', marginTop: '0.2rem' }}>
                {(['duration', 'range'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={mode === m}
                    onClick={() => setMode(m)}
                    style={{
                      background: mode === m ? 'rgba(88,166,255,0.12)' : 'none', border: 'none', cursor: 'pointer',
                      color: mode === m ? '#58a6ff' : '#8b949e', fontSize: '0.72rem', padding: '3px 9px',
                    }}
                  >
                    {m === 'duration' ? '+ Duration' : '⏰ Time range'}
                  </button>
                ))}
              </div>

              {mode === 'duration' ? (
                <form onSubmit={submitDuration} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <select value={durCategory} onChange={(e) => setDurCategory(e.target.value)} style={{ ...input, flex: '0 1 150px' }}>
                    {categories.map((c) => (
                      <option key={c.key} value={c.key}>{c.icon} {c.label}</option>
                    ))}
                  </select>
                  <input
                    type="number" min="0.25" step="0.25" value={durAmount} onChange={(e) => setDurAmount(e.target.value)}
                    aria-label="Hours" style={{ ...input, width: '80px' }}
                  />
                  <span style={{ fontSize: '0.8rem', color: '#8b949e' }}>hours</span>
                  {DURATION_PRESETS.map((m) => (
                    <button key={m} type="button" style={ghostBtn} onClick={() => setDurAmount(String(m / 60))}>
                      {m < 60 ? `${m}m` : `${m / 60}h`}
                    </button>
                  ))}
                  <button type="submit" style={{ ...ghostBtn, color: '#e6edf3', background: '#21262d' }}>Add</button>
                </form>
              ) : (
                <form onSubmit={submitRange} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <select value={rangeCategory} onChange={(e) => setRangeCategory(e.target.value)} style={{ ...input, flex: '0 1 150px' }}>
                    {categories.map((c) => (
                      <option key={c.key} value={c.key}>{c.icon} {c.label}</option>
                    ))}
                  </select>
                  <input type="time" value={rangeStart} onChange={(e) => setRangeStart(e.target.value)} aria-label="Start time" style={input} />
                  <span style={{ color: '#6e7681' }}>→</span>
                  <input type="time" value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} aria-label="End time" style={input} />
                  <button type="submit" style={{ ...ghostBtn, color: '#e6edf3', background: '#21262d' }}>Add</button>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar: category breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={label}>Breakdown</div>
              {categories.filter((c) => totals.has(c.key)).map((c) => {
                const mins = totals.get(c.key) ?? 0;
                return (
                  <div key={c.key} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: '#e6edf3' }}>{c.icon} {c.label}</span>
                      <span style={{ color: '#8b949e' }}>{formatDuration(mins)}</span>
                    </div>
                    <div style={{ height: '5px', borderRadius: '999px', background: '#21262d', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.round((mins / 1440) * 100)}%`, height: '100%', background: c.color, borderRadius: '999px' }} />
                    </div>
                  </div>
                );
              })}
              {untracked > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', paddingTop: '0.3rem', borderTop: '1px solid #21262d' }}>
                  <span style={{ color: '#6e7681' }}>⬛ Untracked</span>
                  <span style={{ color: '#6e7681' }}>{formatDuration(untracked)}</span>
                </div>
              )}
              {totals.size === 0 && <div style={{ fontSize: '0.8rem', color: '#6e7681' }}>Nothing logged yet.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
