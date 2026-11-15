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

  const end = Math.min(endedAt, s.endsAt);
  if (end - s.startedAt < 60_000) return 0;
  const parts = timerToBlocks(s.startedAt, end, STUDY_CATEGORY, NOTE);

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
  return Math.round((end - s.startedAt) / 60_000);
}
