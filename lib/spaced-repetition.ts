// SM-2-style scheduler (the algorithm behind Anki), simplified for revising
// lessons and notes rather than single-fact flashcards.

export type Grade = 'again' | 'hard' | 'good' | 'easy';

export interface ReviewState {
  ease: number;          // interval multiplier, 1.3 – 3.0
  intervalDays: number;  // last interval; 0 = still learning
  reps: number;          // successful reviews in a row
  lapses: number;        // times forgotten
  dueAt: number;         // ms epoch
  firstReviewedAt: number;
  lastReviewedAt: number;
  updatedAt: number;
}

export const NEW_PER_DAY = 15;

const DAY = 24 * 60 * 60 * 1000;
const RELEARN_MS = 10 * 60 * 1000;
const MIN_EASE = 1.3;
const MAX_EASE = 3.0;

export function startOfToday(now = Date.now()): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

// Next interval in days for each grade, without mutating anything — used both
// to schedule and to label the buttons ("Good · 3d").
export function previewIntervals(s: ReviewState | undefined): Record<Grade, number> {
  const ease = s?.ease ?? 2.5;
  const reps = s?.reps ?? 0;
  const prev = s?.intervalDays ?? 0;
  const good = reps === 0 ? 1 : reps === 1 ? 3 : Math.round(prev * ease);
  return {
    again: 0,
    hard: Math.max(1, reps === 0 ? 1 : Math.round(prev * 1.2)),
    good: Math.max(1, good),
    easy: Math.max(reps === 0 ? 4 : good + 1, Math.round(good * 1.3)),
  };
}

export function schedule(s: ReviewState | undefined, grade: Grade, now = Date.now()): ReviewState {
  const base: ReviewState = s ?? {
    ease: 2.5, intervalDays: 0, reps: 0, lapses: 0, dueAt: now,
    firstReviewedAt: now, lastReviewedAt: now, updatedAt: now,
  };
  const next = previewIntervals(s)[grade];
  const easeDelta = { again: -0.2, hard: -0.15, good: 0, easy: 0.15 }[grade];
  const ease = Math.min(MAX_EASE, Math.max(MIN_EASE, base.ease + easeDelta));

  if (grade === 'again') {
    return { ...base, ease, intervalDays: 0, reps: 0, lapses: base.lapses + 1, dueAt: now + RELEARN_MS, lastReviewedAt: now, updatedAt: now };
  }
  // Due at the start of the target day so it shows up first thing, not at
  // the exact time of day you last reviewed it.
  return {
    ...base,
    ease,
    intervalDays: next,
    reps: base.reps + 1,
    dueAt: startOfToday(now) + next * DAY,
    lastReviewedAt: now,
    updatedAt: now,
  };
}

export function formatInterval(days: number): string {
  if (days <= 0) return '10m';
  if (days < 30) return `${days}d`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return `${(days / 365).toFixed(1)}y`;
}

export function dueLabel(s: ReviewState | undefined, now = Date.now()): string {
  if (!s) return 'New';
  if (s.dueAt <= now) return 'Due';
  if (s.dueAt < startOfToday(now) + DAY) return 'Later today';
  const days = Math.ceil((s.dueAt - startOfToday(now)) / DAY);
  return days <= 1 ? 'Tomorrow' : `In ${formatInterval(days)}`;
}

// Today's session: everything due (oldest first), then up to the remaining
// new-item allowance in the order given.
export function buildQueue(
  candidateIds: string[],
  reviews: Record<string, ReviewState>,
  now = Date.now()
): { due: string[]; fresh: string[] } {
  const today = startOfToday(now);
  const introducedToday = Object.values(reviews).filter((r) => r.firstReviewedAt >= today).length;
  const allowance = Math.max(0, NEW_PER_DAY - introducedToday);
  const due = candidateIds
    .filter((id) => reviews[id] && reviews[id].dueAt <= now)
    .sort((a, b) => reviews[a].dueAt - reviews[b].dueAt);
  const fresh = candidateIds.filter((id) => !reviews[id]).slice(0, allowance);
  return { due, fresh };
}
