'use client';

// Automatic screen time: while this window has focus, every second is billed
// to the topic on screen (the section marked `data-screen-topic` nearest the
// top of the viewport), or to the page itself when it has no topic sections.
// Stored per day in localStorage; only the focused tab counts, so several
// open tabs never double-bill.

import { dayKey, shiftDay } from './journal';

const KEY = 'screen-time:v1';
export const SCREEN_TIME_STORAGE_KEY = KEY;
const KEEP_DAYS = 60;

/** day → topic label → seconds */
type Store = Record<string, Record<string, number>>;

function readStore(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

function writeStore(s: Store) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage blocked */ }
}

/** Seconds per topic for a day. */
export function readDay(day = dayKey()): Record<string, number> {
  return readStore()[day] ?? {};
}

/** Adds `secs` to `topic` for today, pruning days older than KEEP_DAYS. */
export function addSeconds(topic: string, secs: number, day = dayKey()) {
  const s = readStore();
  const d = (s[day] ??= {});
  d[topic] = (d[topic] ?? 0) + secs;
  const oldest = shiftDay(day, -KEEP_DAYS);
  for (const k of Object.keys(s)) if (k < oldest) delete s[k];
  writeStore(s);
}

const PAGE_LABELS: Record<string, string> = {
  '/': 'DSA',
  '/theory': 'Theory',
  '/revision': 'Revision',
  '/glossary': 'Glossary',
  '/search': 'Search',
  '/roadmap': 'Roadmap',
  '/resume': 'Resume',
  '/journal': 'Journal',
  '/goals': 'Goals',
  '/habits': 'Habits',
  '/notes': 'Notes',
  '/time': 'Time',
  '/dashboard': 'Dashboard',
  '/salaries': 'Salaries',
  '/net-worth': 'Net worth',
  '/mileage': 'Mileage',
};

function pageLabel(pathname: string): string {
  if (PAGE_LABELS[pathname]) return PAGE_LABELS[pathname];
  const seg = pathname.split('/').filter(Boolean)[0] ?? '';
  return seg ? seg[0].toUpperCase() + seg.slice(1) : 'Home';
}

/** The topic currently on screen: the last tagged section whose top is above ~a third of the viewport. */
export function currentTopic(pathname: string): string {
  const line = window.innerHeight * 0.35;
  let found: string | null = null;
  for (const el of document.querySelectorAll<HTMLElement>('[data-screen-topic]')) {
    const r = el.getBoundingClientRect();
    if (r.height === 0) continue;
    if (r.top <= line && r.bottom > 0) found = el.dataset.screenTopic ?? null;
  }
  return found || pageLabel(pathname);
}

export function fmtSecs(secs: number, withSecs = false): string {
  const t = Math.max(0, Math.floor(secs));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  if (withSecs) return h ? `${h}h ${String(m).padStart(2, '0')}m` : m ? `${m}m ${String(s).padStart(2, '0')}s` : `${s}s`;
  return h ? `${h}h ${m}m` : m ? `${m}m` : `${s}s`;
}
