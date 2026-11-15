'use client';

// Focus-session storage + logging. A finished session becomes a "Study" block
// in the Time tracker's day log (doc kind 'time'), so per-day study time shows
// up on /time and syncs like the rest of it.

import { dayKey, shiftDay } from './journal';
import { sortBlocks, timerToBlocks, type DayLog } from './time-tracking';

export interface Session {
  startedAt: number;
  endsAt: number;
  minutes: number;
  /** Last time an open tab saw this session running (to bill a closed tab fairly). */
  lastSeenAt?: number;
  /** When it actually stopped (time ran out, ended early, or the tab was closed). */
  endedAt?: number;
  /** Set once its time has been written to the day log. */
  recorded?: boolean;
}

const KEY = 'study-session:v1';
const TIME_DOCS = 'docs:time:v1';
export const STUDY_CATEGORY = 'study';
const NOTE = 'Focus session';

export function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function writeSession(s: Session | null) {
  try {
    if (s) localStorage.setItem(KEY, JSON.stringify(s));
    else localStorage.removeItem(KEY);
  } catch { /* storage blocked: the session still runs in this tab */ }
}

type Stored = Record<string, { data: DayLog; updatedAt: number }>;

function readLocalDays(): Stored {
  try {
    const raw = localStorage.getItem(TIME_DOCS);
    return raw ? (JSON.parse(raw) as Stored) : {};
  } catch {
    return {};
  }
}

async function readServerDays(): Promise<Stored | null> {
  try {
    const res = await fetch('/api/docs?kind=time', { cache: 'no-store' });
    if (!res.ok) return null; // signed out → browser copy only
    const { docs } = (await res.json()) as { docs: { docId: string; data: DayLog; updatedAt: number }[] };
    return Object.fromEntries(docs.map((d) => [d.docId, { data: d.data, updatedAt: d.updatedAt }]));
  } catch {
    return null;
  }
}

/** Day logs, newest copy of each day from the browser and (if signed in) the server. */
export async function loadDays(): Promise<{ days: Stored; signedIn: boolean }> {
  const local = readLocalDays();
  const server = await readServerDays();
  if (!server) return { days: local, signedIn: false };
  const merged: Stored = { ...local };
  for (const [id, d] of Object.entries(server)) if (!merged[id] || d.updatedAt >= merged[id].updatedAt) merged[id] = d;
  return { days: merged, signedIn: true };
}

/** Minutes of Study per day for the last `n` days (oldest first), from day logs. */
export function studyByDay(days: Stored, n: number, today = dayKey()): { day: string; minutes: number }[] {
  return Array.from({ length: n }, (_, i) => {
    const day = shiftDay(today, i - n + 1);
    const minutes = (days[day]?.data.blocks ?? [])
      .filter((b) => b.category === STUDY_CATEGORY)
      .reduce((a, b) => a + (b.end - b.start), 0);
    return { day, minutes };
  });
}

/**
 * Writes the session's studied time into the day log(s) — split at midnight —
 * exactly once, even with several tabs open. Returns the minutes logged.
 */
export async function recordSession(endedAt: number): Promise<number> {
  const s = readSession();
  if (!s || s.recorded) return 0;
  writeSession({ ...s, recorded: true }); // claim it before any await

  return logStudy(s.startedAt, Math.min(endedAt, s.endsAt), NOTE);
}

/** Adds [start, end) as Study time to the day log(s), split at midnight. Returns minutes logged. */
export async function logStudy(start: number, end: number, note: string): Promise<number> {
  if (end - start < 60_000) return 0;
  const parts = timerToBlocks(start, end, STUDY_CATEGORY, note);

  const { days, signedIn } = await loadDays();
  const local = readLocalDays();
  const now = Date.now();
  for (const { day, block } of parts) {
    const base = days[day]?.data ?? { blocks: [] };
    const doc = { data: { ...base, blocks: sortBlocks([...base.blocks, block]) }, updatedAt: now };
    local[day] = doc;
    if (signedIn) {
      try {
        await fetch('/api/docs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kind: 'time', docId: day, data: doc.data, updatedAt: doc.updatedAt }),
        });
      } catch { /* offline: the browser copy is pushed next time /time loads */ }
    }
  }
  try { localStorage.setItem(TIME_DOCS, JSON.stringify(local)); } catch { /* ignore */ }
  return Math.round((end - start) / 60_000);
}

// ── Daily study stopwatch (start / stop, any number of times a day) ────────

const STOPWATCH_KEY = 'study-stopwatch:v1';
/** Daily study goal, in minutes. */
export const DAILY_GOAL_MIN = 4 * 60;

/** When the running stopwatch was started, or null when stopped. */
export function readStopwatch(): number | null {
  try {
    const raw = localStorage.getItem(STOPWATCH_KEY);
    return raw ? (JSON.parse(raw) as { startedAt: number }).startedAt : null;
  } catch {
    return null;
  }
}

export function writeStopwatch(startedAt: number | null) {
  try {
    if (startedAt) localStorage.setItem(STOPWATCH_KEY, JSON.stringify({ startedAt }));
    else localStorage.removeItem(STOPWATCH_KEY);
  } catch { /* ignore */ }
}

export const STOPWATCH_STORAGE_KEY = STOPWATCH_KEY;

// The day log only holds whole minutes, so the leftover seconds of each stop
// are carried into the next stretch the same day (2m 10s → stop → resumes at 2m 10s).
const CARRY_KEY = 'study-stopwatch-carry:v1';

export function readCarry(today = dayKey()): number {
  try {
    const raw = localStorage.getItem(CARRY_KEY);
    const c = raw ? (JSON.parse(raw) as { day: string; ms: number }) : null;
    return c && c.day === today ? c.ms : 0;
  } catch {
    return 0;
  }
}

function writeCarry(ms: number, day = dayKey()) {
  try { localStorage.setItem(CARRY_KEY, JSON.stringify({ day, ms })); } catch { /* ignore */ }
}

/**
 * Stops a stretch that ran from `startedAt` to `endedAt`: logs its whole
 * minutes (plus any carried seconds) and keeps the remainder for next time.
 * Returns the minutes logged.
 */
export async function stopStretch(startedAt: number, endedAt: number): Promise<number> {
  const total = endedAt - startedAt + readCarry(dayKey(new Date(endedAt)));
  const whole = Math.floor(total / 60_000);
  writeCarry(total - whole * 60_000, dayKey(new Date(endedAt)));
  if (whole <= 0) return 0;
  // Ends at the stop time; starts early enough to hold the carried seconds too.
  const start = endedAt - whole * 60_000;
  return logStudy(start, endedAt, 'Study stopwatch');
}
