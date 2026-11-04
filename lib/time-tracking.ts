import { dayKey, shiftDay, newId } from './journal';

export interface TimeCategory {
  key: string;
  icon: string;
  label: string;
  color: string;
}

export const DEFAULT_CATEGORIES: TimeCategory[] = [
  { key: 'sleep', icon: '😴', label: 'Sleep', color: '#79c0ff' },
  { key: 'office', icon: '💼', label: 'Office', color: '#58a6ff' },
  { key: 'study', icon: '📚', label: 'Study', color: '#a371f7' },
  { key: 'exercise', icon: '🏋️', label: 'Exercise', color: '#f85149' },
  { key: 'food', icon: '🍽️', label: 'Food', color: '#d29922' },
  { key: 'commute', icon: '🚗', label: 'Commute', color: '#39c5cf' },
  { key: 'chores', icon: '🧹', label: 'Chores', color: '#56d364' },
  { key: 'leisure', icon: '🎮', label: 'Leisure', color: '#ff7b72' },
  { key: 'other', icon: '⬛', label: 'Other', color: '#8b949e' },
];

const OTHER = DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1];

// Built-ins first (minus "Other"), then the user's own, with "Other" last.
export const mergeCategories = (custom: TimeCategory[]): TimeCategory[] => [
  ...DEFAULT_CATEGORIES.slice(0, -1),
  ...custom,
  OTHER,
];

// Unknown keys (e.g. a custom category that was since deleted) show as "Other".
export const categoryOf = (key: string, list: TimeCategory[] = DEFAULT_CATEGORIES): TimeCategory =>
  list.find((c) => c.key === key) ?? OTHER;

export const CUSTOM_COLORS = ['#e3b341', '#db61a2', '#3fb950', '#f0883e', '#bc8cff', '#2f81f7', '#ffa198', '#7ee787'];

export const customCategoryKey = (label: string): string =>
  `c-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'cat'}-${Date.now().toString(36)}`;

export interface TimeBlock {
  id: string;
  category: string;
  start: number; // minutes since local midnight
  end: number; // minutes since local midnight, always > start
  note?: string;
}

export interface DayLog {
  blocks: TimeBlock[];
}

export const EMPTY_DAY: DayLog = { blocks: [] };

export interface RunningTimer {
  category: string;
  startedAt: number; // epoch ms
}

export const DAY_MINUTES = 1440;

export const parseHM = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

export const fmtHM = (minutes: number): string => {
  const m = ((minutes % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

export function formatClock(minutes: number): string {
  const m = ((minutes % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
  const h24 = Math.floor(m / 60);
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m % 60).padStart(2, '0')} ${period}`;
}

export function formatDuration(minutes: number): string {
  const mins = Math.round(minutes);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatElapsed(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export const sortBlocks = (blocks: TimeBlock[]): TimeBlock[] => [...blocks].sort((a, b) => a.start - b.start);

// Gaps left over once every block is laid down (merging overlaps), i.e. the
// parts of the day nothing was logged for.
export function untrackedRanges(blocks: TimeBlock[]): { start: number; end: number }[] {
  const gaps: { start: number; end: number }[] = [];
  let cursor = 0;
  for (const b of sortBlocks(blocks)) {
    const start = Math.max(0, Math.min(DAY_MINUTES, b.start));
    const end = Math.max(0, Math.min(DAY_MINUTES, b.end));
    if (start > cursor) gaps.push({ start: cursor, end: start });
    cursor = Math.max(cursor, end);
  }
  if (cursor < DAY_MINUTES) gaps.push({ start: cursor, end: DAY_MINUTES });
  return gaps;
}

export function trackedMinutes(blocks: TimeBlock[]): number {
  return DAY_MINUTES - untrackedRanges(blocks).reduce((a, g) => a + (g.end - g.start), 0);
}

export function totalsByCategory(blocks: TimeBlock[]): Map<string, number> {
  const out = new Map<string, number>();
  for (const b of blocks) {
    const dur = Math.max(0, Math.min(DAY_MINUTES, b.end) - Math.max(0, b.start));
    if (dur > 0) out.set(b.category, (out.get(b.category) ?? 0) + dur);
  }
  return out;
}

export type DaySegment =
  | { kind: 'block'; start: number; end: number; block: TimeBlock }
  | { kind: 'gap'; start: number; end: number };

export function daySegments(blocks: TimeBlock[]): DaySegment[] {
  const segs: DaySegment[] = [
    ...sortBlocks(blocks).map((block) => ({ kind: 'block' as const, start: block.start, end: block.end, block })),
    ...untrackedRanges(blocks).map((g) => ({ kind: 'gap' as const, start: g.start, end: g.end })),
  ];
  return segs.sort((a, b) => a.start - b.start);
}

// Lays a [start, end) span (end may run past DAY_MINUTES) onto one or more
// calendar days, splitting at each midnight it crosses.
export function splitBlock(day: string, start: number, end: number, category: string, note?: string): { day: string; block: TimeBlock }[] {
  const out: { day: string; block: TimeBlock }[] = [];
  let d = day;
  let s = start;
  let e = end;
  while (e > DAY_MINUTES) {
    if (s < DAY_MINUTES) out.push({ day: d, block: { id: newId(), category, start: s, end: DAY_MINUTES, note } });
    d = shiftDay(d, 1);
    s = 0;
    e -= DAY_MINUTES;
  }
  if (e > s) out.push({ day: d, block: { id: newId(), category, start: s, end: e, note } });
  return out;
}

// Start/end as "HH:MM"; an end at or before start is treated as crossing
// into the next day (e.g. sleep 23:00 -> 07:00).
export function manualBlocks(day: string, startHHMM: string, endHHMM: string, category: string, note?: string) {
  const start = parseHM(startHHMM);
  const end = parseHM(endHHMM);
  return splitBlock(day, start, end <= start ? end + DAY_MINUTES : end, category, note);
}

// Appends a fixed duration right after the latest logged block that day (or
// at midnight if nothing's logged yet).
export function appendDuration(day: string, blocks: TimeBlock[], durationMinutes: number, category: string, note?: string) {
  const cursor = blocks.length ? Math.max(...blocks.map((b) => b.end)) : 0;
  return splitBlock(day, cursor, cursor + durationMinutes, category, note);
}

// Converts a stopped live timer into one or more day blocks, splitting at
// midnight if it ran across days.
export function timerToBlocks(startedAt: number, endedAt: number, category: string, note?: string) {
  const day = dayKey(new Date(startedAt));
  const midnight = new Date(startedAt);
  midnight.setHours(0, 0, 0, 0);
  const startMin = Math.round((startedAt - midnight.getTime()) / 60000);
  const endMin = startMin + Math.max(0, Math.round((endedAt - startedAt) / 60000));
  return splitBlock(day, startMin, endMin, category, note);
}
