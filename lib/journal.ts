export interface Todo {
  id: string;
  text: string;
  done: boolean;
  // Optional link to a goal (lib/goals.ts) so daily work rolls up to it.
  goalId?: string;
}

// One per local day, doc id = dayKey(). The reflection fields are the daily
// template; todos are that day's list.
export interface JournalEntry {
  todos: Todo[];
  grateful: string;
  work: string;
  improve: string;
  random: string;
}

export const EMPTY_ENTRY: JournalEntry = { todos: [], grateful: '', work: '', improve: '', random: '' };

// Entries saved before a field existed lack it; fill the gaps.
export function withDefaults(e: Partial<JournalEntry> | undefined): JournalEntry {
  return { ...EMPTY_ENTRY, ...e };
}

type PromptKey = 'grateful' | 'work' | 'improve' | 'random';

// `optional` prompts don't count towards the reflection score or streak.
export const PROMPTS: { key: PromptKey; icon: string; title: string; placeholder: string; optional?: boolean }[] = [
  { key: 'grateful', icon: '🙏', title: "What I'm grateful for", placeholder: 'Three things, big or small…' },
  { key: 'work', icon: '🛠', title: 'What I worked on today', placeholder: 'Problems solved, lessons finished, things shipped…' },
  { key: 'improve', icon: '📈', title: 'How I can improve tomorrow', placeholder: 'One or two concrete changes…' },
  { key: 'random', icon: '💭', title: "What's on my mind", placeholder: 'Anything at all: thoughts, ideas, worries, random stuff…', optional: true },
];

export const CORE_PROMPTS = PROMPTS.filter((p) => !p.optional);

export function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseDayKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function shiftDay(key: string, days: number): string {
  const d = parseDayKey(key);
  d.setDate(d.getDate() + days);
  return dayKey(d);
}

export function formatDay(key: string): string {
  return parseDayKey(key).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
}

export function isEntryEmpty(e: JournalEntry | undefined): boolean {
  if (!e) return true;
  const full = withDefaults(e);
  return full.todos.length === 0 && PROMPTS.every((p) => !full[p.key].trim());
}

export function reflectionDone(e: JournalEntry | undefined): number {
  if (!e) return 0;
  const full = withDefaults(e);
  return CORE_PROMPTS.filter((p) => full[p.key].trim() !== '').length;
}

// Consecutive days, ending today (or yesterday if today isn't written yet),
// with at least one reflection field filled in.
export function journalStreak(entries: Record<string, JournalEntry>, today: string): number {
  let key = reflectionDone(entries[today]) > 0 ? today : shiftDay(today, -1);
  let n = 0;
  while (reflectionDone(entries[key]) > 0) {
    n++;
    key = shiftDay(key, -1);
  }
  return n;
}

export function newId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
