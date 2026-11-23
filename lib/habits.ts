// Daily habits for /habits. One doc per habit (kind 'habit'), holding the
// days it was done, so ticking a day on one device syncs to the others.

import { dayKey, shiftDay } from './journal';

export interface Habit {
  name: string;
  icon: string;
  color: string;
  order: number;
  createdAt: number;
  /** Days done, "YYYY-MM-DD" → 1. */
  done: Record<string, 1>;
  archived?: boolean;
}

export const HABIT_COLORS = ['#3fb950', '#58a6ff', '#a371f7', '#d29922', '#f85149', '#39c5cf', '#db61a2', '#f0883e'];
export const HABIT_ICONS = ['✅', '📚', '🏋️', '🧘', '💧', '🚶', '😴', '🥗', '✍️', '💻', '🧠', '🚭', '📵', '🎸', '🌅', '🙏'];

/** Consecutive days done, ending today (or yesterday, if today isn't ticked yet). */
export function currentStreak(h: Habit, today = dayKey()): number {
  let d = h.done[today] ? today : shiftDay(today, -1);
  let n = 0;
  while (h.done[d]) { n++; d = shiftDay(d, -1); }
  return n;
}

export function bestStreak(h: Habit): number {
  const days = Object.keys(h.done).sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of days) {
    run = prev && shiftDay(prev, 1) === d ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}

/** Share of the last `n` days done (counting only days since the habit was created). */
export function completion(h: Habit, n: number, today = dayKey()): number {
  const since = dayKey(new Date(h.createdAt));
  let total = 0;
  let done = 0;
  for (let i = 0; i < n; i++) {
    const d = shiftDay(today, -i);
    if (d < since) break;
    total++;
    if (h.done[d]) done++;
  }
  return total ? done / total : 0;
}
