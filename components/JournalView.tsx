'use client';

import Link from 'next/link';
import { useMemo, useState, useSyncExternalStore } from 'react';
import SiteNav from '@/components/SiteNav';
import { useDocs, DOC_STATUS_LABEL } from '@/lib/use-docs';
import { useReviews } from '@/lib/use-reviews';
import { startOfToday } from '@/lib/spaced-repetition';
import {
  JournalEntry, Todo, PROMPTS, withDefaults, dayKey, shiftDay, formatDay, isEntryEmpty, reflectionDone, journalStreak, newId,
} from '@/lib/journal';
import { Goal, areaOf, sortGoals } from '@/lib/goals';

export interface TodayActivity {
  problemsSolved: number;
  theorySolved: number;
  earned: number;
}

const noop = () => () => {};
// The user's local date. Null during SSR so the server's timezone never
// decides which day is "today".
export function useToday(): string | null {
  return useSyncExternalStore(noop, () => dayKey(), () => null);
}

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

export function TodoRow({
  todo, goals, onChange, onDelete,
}: {
  todo: Todo;
  goals: Record<string, Goal>;
  onChange: (t: Todo) => void;
  onDelete?: () => void;
}) {
  const goal = todo.goalId ? goals[todo.goalId] : undefined;
  return (
    <div className="todo-row" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.3rem 0' }}>
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => onChange({ ...todo, done: !todo.done })}
        style={{ width: '16px', height: '16px', accentColor: '#3fb950', cursor: 'pointer', flexShrink: 0 }}
      />
      <span style={{
        flex: 1, minWidth: 0, fontSize: '0.86rem', color: todo.done ? '#6e7681' : '#e6edf3',
        textDecoration: todo.done ? 'line-through' : 'none', wordBreak: 'break-word',
      }}>
        {todo.text}
      </span>
      {goal && (
        <Link
          href="/goals"
          title={`Goal: ${goal.title}`}
          style={{
            fontSize: '0.68rem', color: areaOf(goal.area).color, textDecoration: 'none', whiteSpace: 'nowrap',
            border: `1px solid ${areaOf(goal.area).color}55`, borderRadius: '999px', padding: '1px 8px',
            maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis',
          }}
        >
          🎯 {goal.title}
        </Link>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete todo"
          className="todo-del"
          style={{ background: 'none', border: 'none', color: '#6e7681', cursor: 'pointer', fontSize: '0.95rem', lineHeight: 1 }}
        >
          ×
        </button>
      )}
    </div>
  );
}

export function TodoAdder({ goals, onAdd }: { goals: Record<string, Goal>; onAdd: (t: Todo) => void }) {
  const [text, setText] = useState('');
  const [goalId, setGoalId] = useState('');
  const active = sortGoals(goals).filter(([, g]) => !g.done);

  function submit() {
    const t = text.trim();
    if (!t) return;
    onAdd({ id: newId(), text: t, done: false, ...(goalId && goals[goalId] ? { goalId } : {}) });
    setText('');
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); submit(); }}
      style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a todo and press Enter…"
        style={{ ...input, flex: '1 1 220px' }}
      />
      {active.length > 0 && (
        <select
          value={goalId}
          onChange={(e) => setGoalId(e.target.value)}
          aria-label="Link to goal"
          style={{ ...input, flex: '0 1 180px', color: goalId ? '#e6edf3' : '#8b949e' }}
        >
          <option value="">No goal</option>
          {active.map(([id, g]) => (
            <option key={id} value={id}>{areaOf(g.area).icon} {g.title}</option>
          ))}
        </select>
      )}
      <button type="submit" style={{ ...ghostBtn, color: '#e6edf3', background: '#21262d' }}>Add</button>
    </form>
  );
}

export default function JournalView({ signedIn, activity }: { signedIn: boolean; activity: TodayActivity }) {
  const today = useToday();
  const [picked, setPicked] = useState<string | null>(null);
  const day = picked ?? today;

  const { docs: entries, setDoc, status } = useDocs<JournalEntry>('journal', signedIn);
  const { docs: goals } = useDocs<Goal>('goal', signedIn);
  const { reviews } = useReviews(signedIn);

  const entry = withDefaults(day ? entries[day] : undefined);
  const yesterday = day ? entries[shiftDay(day, -1)] : undefined;
  const isToday = day === today;

  const update = (patch: Partial<JournalEntry>) => {
    if (!day) return;
    const next = { ...entry, ...patch };
    setDoc(day, isEntryEmpty(next) ? null : next);
  };

  const reviewsToday = useMemo(() => {
    const start = startOfToday();
    return Object.values(reviews).filter((r) => r.lastReviewedAt >= start).length;
  }, [reviews]);

  const streak = today ? journalStreak(entries, today) : 0;
  const pastDays = useMemo(
    () => Object.keys(entries).filter((k) => !isEntryEmpty(entries[k])).sort().reverse().slice(0, 30),
    [entries]
  );
  const unfinishedYesterday = (yesterday?.todos ?? []).filter((t) => !t.done && !entry.todos.some((x) => x.text === t.text));

  const activityLine = [
    activity.problemsSolved && `${activity.problemsSolved} DSA problem${activity.problemsSolved === 1 ? '' : 's'}`,
    activity.theorySolved && `${activity.theorySolved} theory question${activity.theorySolved === 1 ? '' : 's'}`,
    reviewsToday && `${reviewsToday} revision review${reviewsToday === 1 ? '' : 's'}`,
  ].filter(Boolean).join(', ');

  if (!day) {
    return <div style={{ minHeight: '100vh', background: '#0d1117' }} />;
  }

  const doneCount = entry.todos.filter((t) => t.done).length;

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', padding: '2rem 1rem 4rem' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <SiteNav />

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#e6edf3', margin: 0 }}>📓 Journal</h1>
            <p style={{ color: '#8b949e', fontSize: '0.85rem', margin: '6px 0 0' }}>
              Daily todos and a three-question reflection.{streak > 0 && <> · 🔥 {streak}-day streak</>}
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

        <div className="journal-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 260px', gap: '1rem', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#e6edf3' }}>{formatDay(day)}</div>
              <div style={{ fontSize: '0.72rem', color: '#6e7681' }}>
                {status ? DOC_STATUS_LABEL[status] : signedIn ? 'Saves automatically' : 'Saved on this device · log in to sync'}
              </div>
            </div>

            {yesterday?.improve.trim() && (
              <div style={{ ...card, borderColor: 'rgba(210,153,34,0.4)', background: 'rgba(210,153,34,0.06)' }}>
                <div style={{ ...label, color: '#d29922' }}>Yesterday you said you&apos;d improve</div>
                <div style={{ fontSize: '0.86rem', color: '#e6edf3', whiteSpace: 'pre-wrap', marginTop: '4px' }}>{yesterday.improve}</div>
              </div>
            )}

            {/* Todos */}
            <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                <div style={label}>✅ Todo list</div>
                {entry.todos.length > 0 && <div style={{ fontSize: '0.75rem', color: '#8b949e' }}>{doneCount}/{entry.todos.length} done</div>}
              </div>
              {entry.todos.length === 0 && (
                <div style={{ fontSize: '0.8rem', color: '#6e7681' }}>Nothing planned yet.</div>
              )}
              <div>
                {entry.todos.map((t) => (
                  <TodoRow
                    key={t.id}
                    todo={t}
                    goals={goals}
                    onChange={(nt) => update({ todos: entry.todos.map((x) => (x.id === t.id ? nt : x)) })}
                    onDelete={() => update({ todos: entry.todos.filter((x) => x.id !== t.id) })}
                  />
                ))}
              </div>
              <TodoAdder goals={goals} onAdd={(t) => update({ todos: [...entry.todos, t] })} />
              {unfinishedYesterday.length > 0 && (
                <button
                  type="button"
                  style={{ ...ghostBtn, alignSelf: 'flex-start' }}
                  onClick={() => update({ todos: [...entry.todos, ...unfinishedYesterday.map((t) => ({ ...t, id: newId() }))] })}
                >
                  ↪ Carry over {unfinishedYesterday.length} unfinished from yesterday
                </button>
              )}
            </div>

            {/* Reflection template */}
            {PROMPTS.map((p) => (
              <div key={p.key} style={{ ...card, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e6edf3' }}>{p.icon} {p.title}</div>
                  {p.key === 'work' && isToday && activityLine && (
                    <button
                      type="button"
                      style={ghostBtn}
                      title="Append today's activity from the site"
                      onClick={() => {
                        const line = `Solved ${activityLine} (+₹${activity.earned.toLocaleString('en-IN')}).`;
                        update({ work: entry.work.trim() ? `${entry.work.trimEnd()}\n${line}` : line });
                      }}
                    >
                      + Add today&apos;s activity
                    </button>
                  )}
                </div>
                <textarea
                  value={entry[p.key]}
                  onChange={(e) => update({ [p.key]: e.target.value })}
                  placeholder={p.placeholder}
                  rows={3}
                  style={{ ...input, resize: 'vertical', minHeight: '84px', lineHeight: 1.55 }}
                />
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <div style={label}>Today on the site</div>
              <Stat icon="🧩" text={`${activity.problemsSolved} problems solved`} href="/" />
              <Stat icon="📖" text={`${activity.theorySolved} theory answered`} href="/theory" />
              <Stat icon="🔁" text={`${reviewsToday} reviews done`} href="/revision" />
              <Stat icon="💰" text={`₹${activity.earned.toLocaleString('en-IN')} earned`} href="/net-worth" />
            </div>

            <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={label}>Active goals</div>
                <Link href="/goals" style={{ fontSize: '0.72rem', color: '#58a6ff', textDecoration: 'none' }}>Manage →</Link>
              </div>
              {sortGoals(goals).filter(([, g]) => !g.done).slice(0, 5).map(([id, g]) => (
                <div key={id} style={{ fontSize: '0.8rem', color: '#e6edf3' }}>{areaOf(g.area).icon} {g.title}</div>
              ))}
              {Object.values(goals).every((g) => g.done) && (
                <Link href="/goals" style={{ fontSize: '0.8rem', color: '#8b949e' }}>Set your first goal</Link>
              )}
            </div>

            <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ ...label, marginBottom: '0.3rem' }}>Past entries</div>
              {pastDays.length === 0 && <div style={{ fontSize: '0.8rem', color: '#6e7681' }}>None yet.</div>}
              {pastDays.map((k) => {
                const e = entries[k];
                const td = e.todos.filter((t) => t.done).length;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setPicked(k === today ? null : k)}
                    className="journal-day"
                    style={{
                      display: 'flex', justifyContent: 'space-between', gap: '0.5rem', textAlign: 'left',
                      background: k === day ? 'rgba(88,166,255,0.1)' : 'none', border: 'none', borderRadius: '6px',
                      padding: '4px 6px', cursor: 'pointer', fontSize: '0.78rem', color: k === day ? '#58a6ff' : '#c9d1d9',
                    }}
                  >
                    <span>{k === today ? 'Today' : formatDay(k).split(',').slice(0, 2).join(',')}</span>
                    <span style={{ color: '#6e7681', whiteSpace: 'nowrap' }}>
                      {e.todos.length > 0 && `✓${td}/${e.todos.length} `}{'●'.repeat(reflectionDone(e))}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, text, href }: { icon: string; text: string; href: string }) {
  return (
    <Link href={href} style={{ fontSize: '0.8rem', color: '#c9d1d9', textDecoration: 'none' }}>
      <span aria-hidden style={{ marginRight: '6px' }}>{icon}</span>{text}
    </Link>
  );
}
