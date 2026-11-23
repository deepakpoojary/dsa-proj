'use client';

// Habit tracker: tick each habit per day, see streaks, the last 30 days'
// hit rate and a 20-week heatmap. One doc per habit (kind 'habit').

import { useMemo, useState } from 'react';
import SiteNav from './SiteNav';
import { useDocs, DOC_STATUS_LABEL } from '@/lib/use-docs';
import { dayKey, newId, parseDayKey, shiftDay } from '@/lib/journal';
import { bestStreak, completion, currentStreak, HABIT_COLORS, HABIT_ICONS, type Habit } from '@/lib/habits';

const HEAT_WEEKS = 20;

export default function HabitsView({ signedIn }: { signedIn: boolean }) {
  const { docs, setDoc, status } = useDocs<Habit>('habit', signedIn);
  const today = dayKey();
  const [weekOffset, setWeekOffset] = useState(0);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(HABIT_ICONS[0]);
  const [showArchived, setShowArchived] = useState(false);

  const all = useMemo(() => Object.entries(docs).sort(([, a], [, b]) => a.order - b.order || a.createdAt - b.createdAt), [docs]);
  const active = all.filter(([, h]) => !h.archived);
  const archived = all.filter(([, h]) => h.archived);

  const lastDay = shiftDay(today, -7 * weekOffset);
  const days = Array.from({ length: 7 }, (_, i) => shiftDay(lastDay, i - 6));
  const doneToday = active.filter(([, h]) => h.done[today]).length;

  const add = () => {
    const n = name.trim();
    if (!n) return;
    const order = all.reduce((m, [, h]) => Math.max(m, h.order), 0) + 1;
    setDoc(newId(), { name: n, icon, color: HABIT_COLORS[all.length % HABIT_COLORS.length], order, createdAt: Date.now(), done: {} });
    setName('');
  };

  const toggle = (id: string, h: Habit, day: string) => {
    const done = { ...h.done };
    if (done[day]) delete done[day];
    else done[day] = 1;
    setDoc(id, { ...h, done });
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= active.length) return;
    const [aId, a] = active[i];
    const [bId, b] = active[j];
    // Re-number so equal orders can't get stuck.
    setDoc(aId, { ...a, order: j + 1 });
    setDoc(bId, { ...b, order: i + 1 });
    active.forEach(([id, h], k) => { if (k !== i && k !== j && h.order !== k + 1) setDoc(id, { ...h, order: k + 1 }); });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', padding: '2rem 1rem 4rem' }}>
      <style>{CSS}</style>
      <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <SiteNav />
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#e6edf3', margin: 0 }}>🔁 Habits</h1>
          <span style={{ fontSize: '0.75rem', color: '#8b949e' }}>
            {status ? DOC_STATUS_LABEL[status] : signedIn ? 'Saves automatically' : 'Saved on this device · log in to sync'}
          </span>
        </div>

        {active.length > 0 && (
          <div className="hb-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <div className="hb-label">Today</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: doneToday === active.length ? '#3fb950' : '#e6edf3' }}>
                {doneToday} / {active.length}{doneToday === active.length && ' 🎉'}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: '160px', height: '8px', background: '#21262d', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(doneToday / active.length) * 100}%`, background: '#3fb950', transition: 'width 0.3s' }} />
            </div>
          </div>
        )}

        <form className="hb-card" onSubmit={(e) => { e.preventDefault(); add(); }} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={icon} onChange={(e) => setIcon(e.target.value)} aria-label="Icon" className="hb-input" style={{ width: 'auto' }}>
            {HABIT_ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New habit, e.g. Solve 2 DSA problems" aria-label="Habit name" className="hb-input" style={{ flex: 1, minWidth: '180px' }} maxLength={80} />
          <button type="submit" disabled={!name.trim()} className="hb-btn primary">Add habit</button>
        </form>

        {active.length === 0 ? (
          <p style={{ color: '#8b949e', fontSize: '0.9rem', textAlign: 'center', marginTop: '1rem' }}>No habits yet. Add one above, then tick it off each day.</p>
        ) : (
          <div className="hb-card" style={{ padding: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 1rem', borderBottom: '1px solid #21262d' }}>
              <button type="button" className="hb-btn" onClick={() => setWeekOffset((w) => w + 1)}>‹ Earlier</button>
              <span style={{ fontSize: '0.8rem', color: '#8b949e' }}>
                {fmtShort(days[0])} – {fmtShort(days[6])}
              </span>
              <button type="button" className="hb-btn" onClick={() => setWeekOffset((w) => Math.max(0, w - 1))} disabled={weekOffset === 0}>Later ›</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="hb-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Habit</th>
                    {days.map((d) => (
                      <th key={d} className={d === today ? 'today' : ''}>
                        <div style={{ fontSize: '0.65rem' }}>{parseDayKey(d).toLocaleDateString('en-IN', { weekday: 'short' })}</div>
                        <div>{parseDayKey(d).getDate()}</div>
                      </th>
                    ))}
                    <th title="Current streak">🔥</th>
                    <th title="Done in the last 30 days">30d</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {active.map(([id, h], i) => (
                    <HabitRow key={id} id={id} h={h} days={days} today={today} first={i === 0} last={i === active.length - 1}
                      onToggle={(d) => toggle(id, h, d)} onMove={(dir) => move(i, dir)} onSave={(p) => setDoc(id, { ...h, ...p })} onDelete={() => setDoc(id, null)} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {archived.length > 0 && (
          <div>
            <button type="button" className="hb-btn" onClick={() => setShowArchived((s) => !s)}>{showArchived ? '▾' : '▸'} Archived ({archived.length})</button>
            {showArchived && (
              <div className="hb-card" style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {archived.map(([id, h]) => (
                  <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#c9d1d9' }}>
                    <span>{h.icon}</span>
                    <span style={{ flex: 1 }}>{h.name}</span>
                    <span style={{ color: '#6e7681', fontSize: '0.75rem' }}>best {bestStreak(h)}d · {Object.keys(h.done).length} days</span>
                    <button type="button" className="hb-btn" onClick={() => setDoc(id, { ...h, archived: false })}>Restore</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function HabitRow({ id, h, days, today, first, last, onToggle, onMove, onSave, onDelete }: {
  id: string; h: Habit; days: string[]; today: string; first: boolean; last: boolean;
  onToggle: (day: string) => void; onMove: (dir: -1 | 1) => void; onSave: (p: Partial<Habit>) => void; onDelete: () => void;
}) {
  const [menu, setMenu] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(h.name);
  const [confirm, setConfirm] = useState(false);
  const streak = currentStreak(h, today);
  const pct = Math.round(completion(h, 30, today) * 100);
  const created = dayKey(new Date(h.createdAt));

  const saveName = () => {
    const n = draft.trim();
    if (n && n !== h.name) onSave({ name: n });
    else setDraft(h.name);
    setEditing(false);
  };

  return (
    <>
      <tr>
        <td className="hb-name">
          <button type="button" onClick={() => setOpen((o) => !o)} className="hb-chev" aria-label={open ? 'Hide history' : 'Show history'} aria-expanded={open}>{open ? '▾' : '▸'}</button>
          <span style={{ width: '4px', alignSelf: 'stretch', borderRadius: '2px', background: h.color, flexShrink: 0 }} />
          <span>{h.icon}</span>
          {editing ? (
            <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={saveName} maxLength={80}
              onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') { setDraft(h.name); setEditing(false); } }}
              className="hb-input" style={{ padding: '2px 6px', fontSize: '0.85rem' }} aria-label="Habit name" />
          ) : (
            <span onDoubleClick={() => { setDraft(h.name); setEditing(true); }} title="Double-click to rename" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.name}</span>
          )}
        </td>
        {days.map((d) => {
          const done = !!h.done[d];
          const future = d > today;
          return (
            <td key={d} className={d === today ? 'today' : ''}>
              <button type="button" disabled={future} onClick={() => onToggle(d)}
                aria-label={`${h.name} on ${d}: ${done ? 'done' : 'not done'}`} aria-pressed={done}
                className="hb-cell"
                style={{ background: done ? h.color : 'transparent', borderColor: done ? h.color : d < created ? '#21262d' : '#30363d', opacity: future ? 0.25 : 1 }}>
                {done ? '✓' : ''}
              </button>
            </td>
          );
        })}
        <td style={{ color: streak ? '#d29922' : '#6e7681', fontWeight: 600 }}>{streak}</td>
        <td style={{ color: pct >= 80 ? '#3fb950' : pct >= 50 ? '#d29922' : '#8b949e' }}>{pct}%</td>
        <td style={{ position: 'relative', whiteSpace: 'nowrap' }}>
          <button type="button" className="hb-chev" onClick={() => { setMenu((m) => !m); setConfirm(false); }} aria-label="Habit options">⋯</button>
          {menu && (
            <div className="hb-menu" onMouseLeave={() => setMenu(false)}>
              <button type="button" disabled={first} onClick={() => onMove(-1)}>↑ Move up</button>
              <button type="button" disabled={last} onClick={() => onMove(1)}>↓ Move down</button>
              <button type="button" onClick={() => { setDraft(h.name); setEditing(true); setMenu(false); }}>✏️ Rename</button>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '4px 8px' }}>
                {HABIT_ICONS.map((ic) => (
                  <span key={ic} role="button" tabIndex={0} onClick={() => onSave({ icon: ic })} onKeyDown={(e) => { if (e.key === 'Enter') onSave({ icon: ic }); }}
                    style={{ cursor: 'pointer', opacity: ic === h.icon ? 1 : 0.55, fontSize: '0.9rem' }}>{ic}</span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '4px', padding: '4px 8px' }}>
                {HABIT_COLORS.map((c) => (
                  <span key={c} role="button" tabIndex={0} aria-label={`Colour ${c}`} onClick={() => onSave({ color: c })} onKeyDown={(e) => { if (e.key === 'Enter') onSave({ color: c }); }}
                    style={{ width: '14px', height: '14px', borderRadius: '50%', background: c, cursor: 'pointer', outline: c === h.color ? '2px solid #e6edf3' : 'none', outlineOffset: '1px' }} />
                ))}
              </div>
              <button type="button" onClick={() => { onSave({ archived: true }); setMenu(false); }}>🗄 Archive</button>
              {confirm
                ? <button type="button" onClick={onDelete} style={{ color: '#f85149' }}>Delete for good?</button>
                : <button type="button" onClick={() => setConfirm(true)} style={{ color: '#f85149' }}>🗑 Delete</button>}
            </div>
          )}
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={days.length + 4} style={{ padding: '0.4rem 1rem 0.9rem' }}>
            <Heatmap h={h} today={today} id={id} />
          </td>
        </tr>
      )}
    </>
  );
}

function Heatmap({ h, today, id }: { h: Habit; today: string; id: string }) {
  // Columns are weeks (Mon..Sun), ending with the current week.
  const t = parseDayKey(today);
  const dow = (t.getDay() + 6) % 7; // Mon = 0
  const start = shiftDay(today, -dow - (HEAT_WEEKS - 1) * 7);
  const weeks = Array.from({ length: HEAT_WEEKS }, (_, w) => Array.from({ length: 7 }, (_, d) => shiftDay(start, w * 7 + d)));
  const total = Object.keys(h.done).length;
  return (
    <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
      <div style={{ display: 'flex', gap: '3px' }} aria-label={`${h.name}: last ${HEAT_WEEKS} weeks`} id={`heat-${id}`}>
        {weeks.map((wk, w) => (
          <div key={w} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {wk.map((d) => (
              <span key={d} title={`${fmtShort(d)}${h.done[d] ? ' · done' : ''}`}
                style={{ width: '11px', height: '11px', borderRadius: '2px', background: d > today ? 'transparent' : h.done[d] ? h.color : '#21262d' }} />
            ))}
          </div>
        ))}
      </div>
      <div style={{ fontSize: '0.75rem', color: '#8b949e', lineHeight: 1.7 }}>
        <div>Best streak <strong style={{ color: '#e6edf3' }}>{bestStreak(h)}d</strong></div>
        <div>Done <strong style={{ color: '#e6edf3' }}>{total}</strong> day{total === 1 ? '' : 's'} in all</div>
        <div>Since {fmtShort(dayKey(new Date(h.createdAt)))}</div>
      </div>
    </div>
  );
}

function fmtShort(d: string): string {
  return parseDayKey(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

const CSS = `
.hb-card { background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 0.9rem 1rem; }
.hb-label { font-size: 0.68rem; color: #8b949e; letter-spacing: 0.06em; text-transform: uppercase; }
.hb-input { padding: 0.5rem 0.7rem; border-radius: 8px; border: 1px solid #30363d; background: #0d1117; color: #e6edf3; font-size: 0.88rem; outline: none; }
.hb-input:focus { border-color: #58a6ff; }
.hb-btn { padding: 4px 11px; border-radius: 8px; border: 1px solid #30363d; background: #0d1117; color: #c9d1d9; font-size: 0.78rem; cursor: pointer; }
.hb-btn:disabled { opacity: 0.4; cursor: default; }
.hb-btn.primary { background: #238636; border-color: #238636; color: #fff; font-weight: 600; padding: 0.5rem 1rem; }
.hb-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; color: #c9d1d9; }
.hb-table th { font-weight: 500; color: #8b949e; font-size: 0.75rem; padding: 0.5rem 0.3rem; text-align: center; }
.hb-table td { padding: 0.35rem 0.3rem; text-align: center; border-top: 1px solid #21262d; font-variant-numeric: tabular-nums; }
.hb-table .today { background: rgba(88,166,255,0.06); }
.hb-table th.today { color: #58a6ff; }
.hb-name { text-align: left !important; display: flex; align-items: center; gap: 0.45rem; min-width: 180px; max-width: 320px; padding-left: 0.6rem !important; }
.hb-cell { width: 28px; height: 28px; border-radius: 50%; border: 2px solid #30363d; color: #0d1117; font-weight: 800; font-size: 0.8rem; cursor: pointer; transition: transform 0.1s; }
.hb-cell:not(:disabled):hover { transform: scale(1.1); }
.hb-cell:disabled { cursor: default; }
.hb-chev { background: none; border: none; color: #8b949e; cursor: pointer; font-size: 0.85rem; padding: 2px 4px; }
.hb-menu { position: absolute; right: 0; top: 100%; z-index: 20; background: #161b22; border: 1px solid #30363d; border-radius: 10px; padding: 4px 0; min-width: 190px; box-shadow: 0 8px 24px rgba(0,0,0,0.5); display: flex; flex-direction: column; text-align: left; }
.hb-menu > button { background: none; border: none; color: #c9d1d9; text-align: left; padding: 6px 12px; font-size: 0.8rem; cursor: pointer; }
.hb-menu > button:hover:not(:disabled) { background: #1c2128; }
.hb-menu > button:disabled { opacity: 0.4; cursor: default; }
`;
