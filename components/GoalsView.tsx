'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import SiteNav from '@/components/SiteNav';
import { useToday } from '@/components/JournalView';
import { useDocs, DOC_STATUS_LABEL } from '@/lib/use-docs';
import { JournalEntry, newId } from '@/lib/journal';
import { AREAS, Goal, GoalArea, areaOf, daysLeft, goalProgress, linkedTodos, sortGoals } from '@/lib/goals';

export interface GoalContext {
  netWorth: number;
  targetAmount: number;
  dsa: { solved: number; total: number };
  theory: { solved: number; total: number };
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

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

function Bar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ height: '6px', borderRadius: '999px', background: '#21262d', overflow: 'hidden' }}>
      <div style={{ width: `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%`, height: '100%', background: color }} />
    </div>
  );
}

// Where each area's real progress lives elsewhere on the site.
function AreaLink({ area, ctx }: { area: GoalArea; ctx: GoalContext }) {
  const style: React.CSSProperties = { fontSize: '0.75rem', color: '#8b949e', textDecoration: 'none' };
  if (area === 'money') {
    return <Link href="/net-worth" style={style}>💰 Net worth {inr(ctx.netWorth)}{ctx.targetAmount > 0 && ` of ${inr(ctx.targetAmount)}`} →</Link>;
  }
  if (area === 'learning') {
    return (
      <span style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
        <Link href="/" style={style}>🧩 DSA {ctx.dsa.solved}/{ctx.dsa.total} →</Link>
        <Link href="/theory" style={style}>📖 Theory {ctx.theory.solved}/{ctx.theory.total} →</Link>
      </span>
    );
  }
  if (area === 'career') return <Link href="/roadmap" style={style}>💸 Salary Roadmap →</Link>;
  return null;
}

type GoalFields = Pick<Goal, 'title' | 'area' | 'targetDate' | 'why'>;

// Creates a goal (no `initial`) or edits an existing one's fields in place.
function GoalForm({
  initial, onSubmit, onCancel,
}: {
  initial?: GoalFields;
  onSubmit: (f: GoalFields) => void;
  onCancel?: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [area, setArea] = useState<GoalArea>(initial?.area ?? 'career');
  const [targetDate, setTargetDate] = useState(initial?.targetDate ?? '');
  const [why, setWhy] = useState(initial?.why ?? '');
  const editing = !!initial;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) return;
        onSubmit({ title: title.trim(), why: why.trim(), area, targetDate });
        if (!editing) {
          setTitle('');
          setWhy('');
          setTargetDate('');
        }
      }}
      onKeyDown={(e) => { if (e.key === 'Escape' && onCancel) onCancel(); }}
      style={editing ? { display: 'flex', flexDirection: 'column', gap: '0.6rem' } : { ...card, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}
    >
      {!editing && <div style={label}>New goal</div>}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Land a ₹20 LPA backend role"
        aria-label="Goal title"
        autoFocus={editing}
        style={input}
      />
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <select value={area} onChange={(e) => setArea(e.target.value as GoalArea)} aria-label="Area" style={{ ...input, flex: '1 1 140px' }}>
          {AREAS.map((a) => <option key={a.key} value={a.key}>{a.icon} {a.label}</option>)}
        </select>
        <input
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          aria-label="Target date"
          style={{ ...input, flex: '1 1 140px', colorScheme: 'dark' }}
        />
      </div>
      <textarea value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Why this matters to you (optional)" rows={2} style={{ ...input, resize: 'vertical' }} />
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="submit" style={{ ...ghostBtn, color: '#fff', background: '#238636', borderColor: '#238636' }}>
          {editing ? 'Save' : 'Add goal'}
        </button>
        {onCancel && <button type="button" onClick={onCancel} style={ghostBtn}>Cancel</button>}
      </div>
    </form>
  );
}

function GoalCard({
  goal, today, ctx, linked, onChange, onDelete,
}: {
  goal: Goal;
  today: string;
  ctx: GoalContext;
  linked?: { done: number; total: number };
  onChange: (g: Goal) => void;
  onDelete: () => void;
}) {
  const [milestone, setMilestone] = useState('');
  const [open, setOpen] = useState(!goal.done);
  const [editing, setEditing] = useState(false);
  const area = areaOf(goal.area);
  const progress = goalProgress(goal);
  const left = daysLeft(goal, today);

  if (editing) {
    return (
      <div style={{ ...card, borderLeft: `3px solid ${area.color}` }}>
        <GoalForm
          initial={goal}
          onSubmit={(f) => { onChange({ ...goal, ...f }); setEditing(false); }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '0.65rem', opacity: goal.done ? 0.7 : 1, borderLeft: `3px solid ${area.color}` }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
        <input
          type="checkbox"
          checked={goal.done}
          onChange={() => onChange({ ...goal, done: !goal.done })}
          aria-label="Mark goal achieved"
          style={{ width: '17px', height: '17px', marginTop: '2px', accentColor: '#3fb950', cursor: 'pointer' }}
        />
        <button
          type="button"
          onClick={() => setOpen(!open)}
          style={{ flex: 1, minWidth: 0, background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}
        >
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e6edf3', textDecoration: goal.done ? 'line-through' : 'none' }}>
            {goal.title}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#8b949e', marginTop: '2px', display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
            <span style={{ color: area.color }}>{area.icon} {area.label}</span>
            {left !== null && !goal.done && (
              <span style={{ color: left < 0 ? '#f85149' : left <= 7 ? '#d29922' : '#8b949e' }}>
                {left < 0 ? `${-left}d overdue` : left === 0 ? 'Due today' : `${left}d left`}
              </span>
            )}
            {goal.milestones.length > 0 && <span>{goal.milestones.filter((m) => m.done).length}/{goal.milestones.length} milestones</span>}
            {linked && <span>📓 {linked.done}/{linked.total} journal todos</span>}
            {goal.done && <span style={{ color: '#3fb950' }}>Achieved ✓</span>}
          </div>
        </button>
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label="Edit goal"
          title="Edit goal"
          style={{ background: 'none', border: 'none', color: '#6e7681', cursor: 'pointer', fontSize: '0.85rem', lineHeight: 1 }}
        >
          ✎
        </button>
        <button
          type="button"
          onClick={() => { if (confirm(`Delete "${goal.title}"?`)) onDelete(); }}
          aria-label="Delete goal"
          style={{ background: 'none', border: 'none', color: '#6e7681', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}
        >
          ×
        </button>
      </div>

      <Bar value={progress} color={goal.done ? '#3fb950' : area.color} />

      {open && (
        <>
          {goal.why && <div style={{ fontSize: '0.8rem', color: '#c9d1d9', fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>“{goal.why}”</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {goal.milestones.map((m) => (
              <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.83rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={m.done}
                  onChange={() => onChange({ ...goal, milestones: goal.milestones.map((x) => (x.id === m.id ? { ...x, done: !x.done } : x)) })}
                  style={{ accentColor: '#3fb950' }}
                />
                <span style={{ flex: 1, color: m.done ? '#6e7681' : '#e6edf3', textDecoration: m.done ? 'line-through' : 'none' }}>{m.text}</span>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); onChange({ ...goal, milestones: goal.milestones.filter((x) => x.id !== m.id) }); }}
                  aria-label="Remove milestone"
                  style={{ background: 'none', border: 'none', color: '#6e7681', cursor: 'pointer' }}
                >
                  ×
                </button>
              </label>
            ))}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const t = milestone.trim();
                if (!t) return;
                onChange({ ...goal, milestones: [...goal.milestones, { id: newId(), text: t, done: false }] });
                setMilestone('');
              }}
            >
              <input
                value={milestone}
                onChange={(e) => setMilestone(e.target.value)}
                placeholder="+ Add a milestone"
                style={{ ...input, width: '100%', fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
              />
            </form>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <AreaLink area={goal.area} ctx={ctx} />
            <Link href="/journal" style={{ fontSize: '0.75rem', color: '#58a6ff', textDecoration: 'none' }}>Plan today&apos;s work in Journal →</Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function GoalsView({ signedIn, ctx }: { signedIn: boolean; ctx: GoalContext }) {
  const today = useToday();
  const { docs: goals, setDoc, status } = useDocs<Goal>('goal', signedIn);
  const { docs: entries } = useDocs<JournalEntry>('journal', signedIn);
  const [filter, setFilter] = useState<GoalArea | 'all'>('all');

  const linked = useMemo(() => linkedTodos(entries), [entries]);
  const sorted = sortGoals(goals).filter(([, g]) => filter === 'all' || g.area === filter);
  const activeCount = Object.values(goals).filter((g) => !g.done).length;
  const doneCount = Object.values(goals).length - activeCount;

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', padding: '2rem 1rem 4rem' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <SiteNav />

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#e6edf3', margin: 0 }}>🎯 Goals</h1>
            <p style={{ color: '#8b949e', fontSize: '0.85rem', margin: '6px 0 0' }}>
              {activeCount} active · {doneCount} achieved. Link journal todos to a goal to see daily work add up.
            </p>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#6e7681' }}>
            {status ? DOC_STATUS_LABEL[status] : signedIn ? 'Saves automatically' : 'Saved on this device · log in to sync'}
          </div>
        </div>

        <div className="journal-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '1rem', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {[{ key: 'all' as const, icon: '✦', label: 'All', color: '#58a6ff' }, ...AREAS].map((a) => {
                const on = filter === a.key;
                return (
                  <button
                    key={a.key}
                    type="button"
                    onClick={() => setFilter(a.key)}
                    style={{
                      ...ghostBtn, borderRadius: '999px', padding: '3px 10px',
                      color: on ? a.color : '#8b949e', borderColor: on ? `${a.color}88` : '#30363d',
                      background: on ? `${a.color}18` : 'none',
                    }}
                  >
                    {a.icon} {a.label}
                  </button>
                );
              })}
            </div>

            {sorted.length === 0 && (
              <div style={{ ...card, fontSize: '0.85rem', color: '#8b949e' }}>
                {Object.keys(goals).length === 0 ? 'No goals yet. Add your first one →' : 'No goals in this area.'}
              </div>
            )}
            {today && sorted.map(([id, g]) => (
              <GoalCard
                key={id}
                goal={g}
                today={today}
                ctx={ctx}
                linked={linked.get(id)}
                onChange={(ng) => setDoc(id, ng)}
                onDelete={() => setDoc(id, null)}
              />
            ))}
          </div>

          <GoalForm onSubmit={(f) => setDoc(newId(), { ...f, milestones: [], done: false, createdAt: Date.now() })} />
        </div>
      </div>
    </div>
  );
}
