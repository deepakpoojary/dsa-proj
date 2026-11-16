'use client';

// Today's tally of ticked items (checklist items, theory questions, problems),
// shown beside the study stopwatch. Kept as a set of ids per day, so ticking
// the same item twice counts once and unticking it takes it back off.
// Browser-only: it resets at midnight.

import { dayKey } from './journal';

const KEY = 'daily-checks:v1';
export const DAILY_CHECKS_EVENT = 'daily-checks-change';
export const DAILY_CHECKS_STORAGE_KEY = KEY;

function read(today = dayKey()): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    const v = raw ? (JSON.parse(raw) as { day: string; ids: string[] }) : null;
    return new Set(v && v.day === today ? v.ids : []);
  } catch {
    return new Set();
  }
}

/** Records items being ticked (done = true) or unticked today. */
export function recordChecks(ids: string[], done: boolean, kind = 'item') {
  if (ids.length === 0) return;
  const today = dayKey();
  const set = read(today);
  for (const id of ids) {
    const k = `${kind}:${id}`;
    if (done) set.add(k);
    else set.delete(k);
  }
  try { localStorage.setItem(KEY, JSON.stringify({ day: today, ids: [...set] })); } catch { /* ignore */ }
  try { window.dispatchEvent(new Event(DAILY_CHECKS_EVENT)); } catch { /* ignore */ }
}

/** How many items were ticked today. */
export function checkedToday(): number {
  return read().size;
}
