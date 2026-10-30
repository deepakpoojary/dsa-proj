import type { JournalEntry } from './journal';

export type GoalArea = 'career' | 'learning' | 'money' | 'health' | 'personal';

export const AREAS: { key: GoalArea; icon: string; label: string; color: string }[] = [
  { key: 'career', icon: '💼', label: 'Career', color: '#58a6ff' },
  { key: 'learning', icon: '📚', label: 'Learning', color: '#a371f7' },
  { key: 'money', icon: '💰', label: 'Money', color: '#3fb950' },
  { key: 'health', icon: '💪', label: 'Health', color: '#f85149' },
  { key: 'personal', icon: '🌱', label: 'Personal', color: '#d29922' },
];

export const areaOf = (key: GoalArea) => AREAS.find((a) => a.key === key) ?? AREAS[0];

export interface Milestone {
  id: string;
  text: string;
  done: boolean;
}

export interface Goal {
  title: string;
  why: string;
  area: GoalArea;
  targetDate: string; // YYYY-MM-DD or ''
  milestones: Milestone[];
  done: boolean;
  createdAt: number;
}

export function goalProgress(g: Goal): number {
  if (g.done) return 1;
  if (g.milestones.length === 0) return 0;
  return g.milestones.filter((m) => m.done).length / g.milestones.length;
}

export function daysLeft(g: Goal, today: string): number | null {
  if (!g.targetDate) return null;
  const [y, m, d] = g.targetDate.split('-').map(Number);
  const [ty, tm, td] = today.split('-').map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(ty, tm - 1, td)) / 86400000);
}

// Journal todos linked to each goal, across every day.
export function linkedTodos(entries: Record<string, JournalEntry>): Map<string, { done: number; total: number }> {
  const out = new Map<string, { done: number; total: number }>();
  for (const e of Object.values(entries)) {
    for (const t of e.todos) {
      if (!t.goalId) continue;
      const c = out.get(t.goalId) ?? { done: 0, total: 0 };
      c.total++;
      if (t.done) c.done++;
      out.set(t.goalId, c);
    }
  }
  return out;
}

// Active first (soonest deadline first), finished last.
export function sortGoals(goals: Record<string, Goal>): [string, Goal][] {
  return Object.entries(goals).sort(([, a], [, b]) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    const ad = a.targetDate || '9999', bd = b.targetDate || '9999';
    return ad === bd ? a.createdAt - b.createdAt : ad < bd ? -1 : 1;
  });
}
