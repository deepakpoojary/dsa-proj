'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { UserFinance } from '@/lib/finance';
import type { StudyStats, TopicStat } from '@/lib/study-stats';
import { useChecklist } from '@/lib/use-checklist';
import { useNotes } from '@/lib/use-notes';
import { useReviews } from '@/lib/use-reviews';
import SiteNav from '@/components/SiteNav';
import UserNav from '@/components/UserNav';
import { TodoAdder, TodoRow, useToday } from '@/components/JournalView';
import { useDocs } from '@/lib/use-docs';
import { JournalEntry, CORE_PROMPTS, withDefaults, isEntryEmpty, journalStreak, reflectionDone } from '@/lib/journal';
import { Goal, areaOf, daysLeft, goalProgress, sortGoals } from '@/lib/goals';

function formatInr(n: number) {
  const sign = n < 0 ? '-' : '';
  return `${sign}₹${Math.abs(Math.round(n)).toLocaleString('en-IN')}`;
}

function sum(topics: TopicStat[]) {
  return topics.reduce((a, t) => ({ solved: a.solved + t.solved, total: a.total + t.total }), { solved: 0, total: 0 });
}

// First topic that's started but unfinished, else the first untouched one.
function nextTopic(topics: TopicStat[]): TopicStat | undefined {
  return topics.find((t) => t.solved > 0 && t.solved < t.total) ?? topics.find((t) => t.solved < t.total);
}

const card: React.CSSProperties = {
  background: '#161b22', border: '1px solid #30363d', borderRadius: '12px', padding: '1rem 1.1rem',
};

const label: React.CSSProperties = {
  fontSize: '0.68rem', color: '#8b949e', letterSpacing: '0.06em', textTransform: 'uppercase',
};

function Bar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ height: '6px', borderRadius: '999px', background: '#21262d', overflow: 'hidden' }}>
      <div style={{ width: `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%`, height: '100%', background: color, borderRadius: '999px' }} />
    </div>
  );
}

function SectionCard({
  href, icon, title, color, big, sub, progress, footer,
}: {
  href: string;
  icon: string;
  title: string;
  color: string;
  big: string;
  sub: string;
  progress?: number;
  footer?: React.ReactNode;
}) {
  return (
    <Link href={href} className="dash-card" style={{ ...card, display: 'flex', flexDirection: 'column', gap: '0.6rem', textDecoration: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span aria-hidden style={{ fontSize: '1.05rem' }}>{icon}</span>
        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e6edf3', flex: 1 }}>{title}</span>
        <span style={{ fontSize: '0.75rem', color: '#6e7681' }}>Open →</span>
      </div>
      <div>
        <div style={{ fontSize: '1.45rem', fontWeight: 700, color }}>{big}</div>
        <div style={{ fontSize: '0.75rem', color: '#8b949e' }}>{sub}</div>
      </div>
      {progress !== undefined && <Bar value={progress} color={color} />}
      {footer && <div style={{ fontSize: '0.75rem', color: '#8b949e', marginTop: 'auto' }}>{footer}</div>}
    </Link>
  );
}

function TopicList({ title, topics, color }: { title: string; topics: TopicStat[]; color: string }) {
  // Started-but-unfinished first, then untouched, finished last.
  const rank = (t: TopicStat) => (t.solved >= t.total ? 2 : t.solved > 0 ? 0 : 1);
  const shown = [...topics].sort((a, b) => rank(a) - rank(b)).slice(0, 6);
  return (
    <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
      <div style={label}>{title}</div>
      {shown.length === 0 && <div style={{ fontSize: '0.8rem', color: '#6e7681' }}>Nothing here yet.</div>}
      {shown.map((t) => (
        <Link key={t.key} href={t.href} className="dash-row" style={{ display: 'flex', flexDirection: 'column', gap: '4px', textDecoration: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', fontSize: '0.8rem' }}>
            <span style={{ color: t.solved >= t.total ? '#8b949e' : '#e6edf3' }}>{t.label}</span>
            <span style={{ color: '#8b949e', whiteSpace: 'nowrap' }}>{t.solved}/{t.total}</span>
          </div>
          <Bar value={t.total ? t.solved / t.total : 0} color={t.solved >= t.total ? '#3fb950' : color} />
        </Link>
      ))}
    </div>
  );
}

export default function Dashboard({
  email, hasPaid, isAdmin, finance, totalEarned, earnedToday, stats,
}: {
  email: string | null;
  hasPaid: boolean;
  isAdmin: boolean;
  finance: UserFinance;
  totalEarned: number;
  earnedToday: number;
  stats: StudyStats;
}) {
  const signedIn = !!email;
  const { checked } = useChecklist(signedIn);
  const { notes } = useNotes(signedIn);
  const { reviews } = useReviews(signedIn);
  const { docs: entries, setDoc: setEntry } = useDocs<JournalEntry>('journal', signedIn);
  const { docs: goals } = useDocs<Goal>('goal', signedIn);
  const today = useToday();
  const todayEntry = withDefaults(today ? entries[today] : undefined);
  const updateToday = (patch: Partial<JournalEntry>) => {
    if (!today) return;
    const next = { ...todayEntry, ...patch };
    setEntry(today, isEntryEmpty(next) ? null : next);
  };
  const reflected = reflectionDone(todayEntry);
  const streak = today ? journalStreak(entries, today) : 0;
  const activeGoals = sortGoals(goals).filter(([, g]) => !g.done);

  const dsa = sum(stats.problemTopics);
  const theory = sum(stats.theoryTopics);
  const nextDsa = nextTopic(stats.problemTopics);
  const nextTheory = nextTopic(stats.theoryTopics);

  const netWorth = finance.startingBalance + totalEarned;
  const hasTarget = finance.targetAmount > 0;
  const targetProgress = useMemo(() => {
    const span = finance.targetAmount - finance.startingBalance;
    if (span <= 0) return 1;
    return (netWorth - finance.startingBalance) / span;
  }, [finance, netWorth]);

  const noteCount = Object.values(notes).filter((n) => n.body.trim() !== '').length;
  const [now] = useState(() => Date.now());
  const dueCount = useMemo(() => Object.values(reviews).filter((r) => r.dueAt <= now).length, [reviews, now]);

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', padding: '2rem 1rem 4rem' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <SiteNav />

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#e6edf3', margin: 0 }}>🏠 Dashboard</h1>
            <p style={{ color: '#8b949e', fontSize: '0.85rem', margin: '6px 0 0' }}>
              Everything in one place: what you&apos;ve done, and what&apos;s next.
            </p>
          </div>
          <div style={{ width: '260px', maxWidth: '100%' }}>
            <UserNav email={email} hasPaid={hasPaid} />
          </div>
        </div>

        {/* Today: journal todos + reflection, and goals */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0.75rem' }}>
          <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
              <div style={label}>📓 Today</div>
              <Link href="/journal" style={{ fontSize: '0.72rem', color: '#58a6ff', textDecoration: 'none' }}>Open journal →</Link>
            </div>
            {today && (
              <>
                {todayEntry.todos.length === 0 && <div style={{ fontSize: '0.8rem', color: '#6e7681' }}>No todos yet. What&apos;s the plan today?</div>}
                <div>
                  {todayEntry.todos.map((t) => (
                    <TodoRow
                      key={t.id}
                      todo={t}
                      goals={goals}
                      onChange={(nt) => updateToday({ todos: todayEntry.todos.map((x) => (x.id === t.id ? nt : x)) })}
                    />
                  ))}
                </div>
                <TodoAdder goals={goals} onAdd={(t) => updateToday({ todos: [...todayEntry.todos, t] })} />
                <Link
                  href="/journal"
                  style={{
                    display: 'flex', justifyContent: 'space-between', gap: '0.5rem', fontSize: '0.78rem', textDecoration: 'none',
                    color: reflected === CORE_PROMPTS.length ? '#3fb950' : '#d29922', borderTop: '1px solid #21262d', paddingTop: '0.6rem',
                  }}
                >
                  <span>
                    {reflected === CORE_PROMPTS.length ? '✓ Reflection written' : `✍ Reflection ${reflected}/${CORE_PROMPTS.length}: grateful · work · improve`}
                  </span>
                  {streak > 0 && <span>🔥 {streak}d</span>}
                </Link>
              </>
            )}
          </div>

          <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
              <div style={label}>🎯 Goals</div>
              <Link href="/goals" style={{ fontSize: '0.72rem', color: '#58a6ff', textDecoration: 'none' }}>All goals →</Link>
            </div>
            {activeGoals.length === 0 && (
              <Link href="/goals" style={{ fontSize: '0.8rem', color: '#8b949e' }}>No active goals. Set one →</Link>
            )}
            {today && activeGoals.slice(0, 4).map(([id, g]) => {
              const a = areaOf(g.area);
              const left = daysLeft(g, today);
              return (
                <Link key={id} href="/goals" className="dash-row" style={{ display: 'flex', flexDirection: 'column', gap: '4px', textDecoration: 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', fontSize: '0.8rem' }}>
                    <span style={{ color: '#e6edf3' }}>{a.icon} {g.title}</span>
                    {left !== null && (
                      <span style={{ color: left < 0 ? '#f85149' : left <= 7 ? '#d29922' : '#8b949e', whiteSpace: 'nowrap' }}>
                        {left < 0 ? `${-left}d late` : `${left}d`}
                      </span>
                    )}
                  </div>
                  <Bar value={goalProgress(g)} color={a.color} />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Money */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          <Link href="/net-worth" className="dash-card" style={{ ...card, textDecoration: 'none' }}>
            <div style={label}>Net Worth</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, color: netWorth < 0 ? '#f85149' : '#3fb950' }}>{formatInr(netWorth)}</div>
            <div style={{ fontSize: '0.75rem', color: '#8b949e' }}>{formatInr(totalEarned)} earned studying</div>
          </Link>
          <div style={card}>
            <div style={label}>Earned Today</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#58a6ff' }}>{formatInr(earnedToday)}</div>
            <div style={{ fontSize: '0.75rem', color: '#8b949e' }}>From problems and theory</div>
          </div>
          <Link href="/net-worth" className="dash-card" style={{ ...card, textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={label}>Target</div>
            {hasTarget ? (
              <>
                <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#d29922' }}>{formatInr(finance.targetAmount)}</div>
                <Bar value={targetProgress} color="#d29922" />
                <div style={{ fontSize: '0.75rem', color: '#8b949e' }}>
                  {targetProgress >= 1 ? 'Reached 🎉' : `${Math.round(Math.max(0, targetProgress) * 100)}% of the way`}
                </div>
              </>
            ) : (
              <div style={{ fontSize: '0.8rem', color: '#8b949e' }}>No target yet. Set one on Net Worth →</div>
            )}
          </Link>
        </div>

        {/* Sections */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.75rem' }}>
          <SectionCard
            href="/"
            icon="🧩"
            title="DSA Problems"
            color="#58a6ff"
            big={`${dsa.solved}/${dsa.total}`}
            sub="problems solved"
            progress={dsa.total ? dsa.solved / dsa.total : 0}
            footer={nextDsa ? <>Next: <span style={{ color: '#e6edf3' }}>{nextDsa.label}</span></> : dsa.total ? 'All done ✓' : undefined}
          />
          <SectionCard
            href="/theory"
            icon="📖"
            title="Theory Q&A"
            color="#a371f7"
            big={`${theory.solved}/${theory.total}`}
            sub="questions answered"
            progress={theory.total ? theory.solved / theory.total : 0}
            footer={nextTheory ? <>Next: <span style={{ color: '#e6edf3' }}>{nextTheory.label}</span></> : theory.total ? 'All done ✓' : undefined}
          />
          <SectionCard
            href="/roadmap"
            icon="💸"
            title="Salary Roadmap"
            color="#3fb950"
            big={String(checked.size)}
            sub={checked.size === 1 ? 'lesson ticked off' : 'lessons ticked off'}
            footer="Plan what to learn for your next hike"
          />
          <SectionCard
            href="/revision"
            icon="🔁"
            title="Revision"
            color="#d29922"
            big={String(dueCount)}
            sub={dueCount === 1 ? 'review due now' : 'reviews due now'}
            footer={`${noteCount} ${noteCount === 1 ? 'note' : 'notes'} saved`}
          />
        </div>

        {/* Topic progress */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
          <TopicList title="DSA topics" topics={stats.problemTopics} color="#58a6ff" />
          <TopicList title="Theory topics" topics={stats.theoryTopics} color="#a371f7" />
        </div>

        {isAdmin && (
          <Link href="/admin" style={{ alignSelf: 'flex-start', fontSize: '0.78rem', color: '#8b949e' }}>⚙ Admin</Link>
        )}
      </div>
    </div>
  );
}
