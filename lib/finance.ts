import { supabase as adminSupabase } from '@/lib/supabase';
import { REWARD_TOP150, REWARD_REGULAR } from '@/types';

export interface UserFinance {
  startingBalance: number;
  targetAmount: number;
  targetDays: number;
}

const DEFAULT_FINANCE: UserFinance = {
  startingBalance: 0,
  targetAmount: 0,
  targetDays: 90,
};

export async function getUserFinance(userId: string | undefined): Promise<UserFinance> {
  if (!userId) return DEFAULT_FINANCE;

  const { data } = await adminSupabase
    .from('user_finance')
    .select('starting_balance, target_amount, target_days')
    .eq('user_id', userId)
    .maybeSingle();

  if (!data) return DEFAULT_FINANCE;

  return {
    startingBalance: Number(data.starting_balance),
    targetAmount: Number(data.target_amount),
    targetDays: Number(data.target_days),
  };
}

function startOfTodayIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

// Week starts Monday.
function startOfWeekIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const day = (d.getDay() + 6) % 7; // Mon=0 ... Sun=6
  d.setDate(d.getDate() - day);
  return d.toISOString();
}

function startOfMonthIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(1);
  return d.toISOString();
}

function startOfYearIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setMonth(0, 1);
  return d.toISOString();
}

async function sumProblemRewards(problemIds: string[]): Promise<number> {
  if (problemIds.length === 0) return 0;
  const { data } = await adminSupabase.from('problems').select('is_top150').in('id', problemIds);
  let total = 0;
  for (const row of data ?? []) {
    total += row.is_top150 ? REWARD_TOP150 : REWARD_REGULAR;
  }
  return total;
}

async function sumTheoryRewards(theoryIds: string[]): Promise<number> {
  if (theoryIds.length === 0) return 0;
  const { data } = await adminSupabase.from('theory_questions').select('difficulty').in('id', theoryIds);
  let total = 0;
  for (const row of data ?? []) {
    total += row.difficulty === 'Hard' ? REWARD_TOP150 : REWARD_REGULAR;
  }
  return total;
}

// Domain-specific sums — used so each page can combine a *live, reactive*
// figure for its own domain (recomputed client-side as checkboxes toggle)
// with a static baseline for the *other* domain fetched once at page load.
export async function getProblemsEarned(userId: string | undefined, sinceIso?: string): Promise<number> {
  if (!userId) return 0;
  let query = adminSupabase.from('user_progress').select('problem_id').eq('user_id', userId);
  if (sinceIso) query = query.gte('solved_at', sinceIso);
  const { data } = await query;
  return sumProblemRewards((data ?? []).map((r) => r.problem_id as string));
}

export async function getTheoryEarned(userId: string | undefined, sinceIso?: string): Promise<number> {
  if (!userId) return 0;
  let query = adminSupabase.from('theory_progress').select('question_id').eq('user_id', userId);
  if (sinceIso) query = query.gte('solved_at', sinceIso);
  const { data } = await query;
  return sumTheoryRewards((data ?? []).map((r) => r.question_id as string));
}

export async function getTotalEarned(userId: string | undefined): Promise<number> {
  const [problems, theory] = await Promise.all([getProblemsEarned(userId), getTheoryEarned(userId)]);
  return problems + theory;
}

export async function getEarnedToday(userId: string | undefined): Promise<number> {
  const since = startOfTodayIso();
  const [problems, theory] = await Promise.all([
    getProblemsEarned(userId, since),
    getTheoryEarned(userId, since),
  ]);
  return problems + theory;
}

export interface EarningsBreakdown {
  today: number;
  week: number;
  month: number;
  year: number;
}

export async function getEarningsBreakdown(userId: string | undefined): Promise<EarningsBreakdown> {
  const [today, week, month, year] = await Promise.all([
    startOfTodayIso(),
    startOfWeekIso(),
    startOfMonthIso(),
    startOfYearIso(),
  ].map(async (since) => {
    const [problems, theory] = await Promise.all([
      getProblemsEarned(userId, since),
      getTheoryEarned(userId, since),
    ]);
    return problems + theory;
  }));

  return { today, week, month, year };
}

export type EarningsRange = 'week' | 'month' | 'year';

export interface EarningsPoint {
  label: string;
  value: number;
}

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function ym(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// offsetWindows shifts the whole window back by `offsetWindows * count` days —
// 0 is the trailing window ending today, 1 the one immediately before it, etc.
function buildDayBuckets(count: number, offsetWindows = 0): { key: string; label: string; date: Date }[] {
  const anchor = new Date();
  anchor.setHours(0, 0, 0, 0);
  anchor.setDate(anchor.getDate() - offsetWindows * count);
  const buckets = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(anchor);
    d.setDate(d.getDate() - i);
    buckets.push({ key: ymd(d), label: count <= 7 ? WEEKDAY_LABELS[d.getDay()] : `${d.getDate()}`, date: d });
  }
  return buckets;
}

// offsetWindows shifts back by `offsetWindows * count` months.
function buildMonthBuckets(count: number, offsetWindows = 0): { key: string; label: string; date: Date }[] {
  const today = new Date();
  const anchorMonth = today.getMonth() - offsetWindows * count;
  const buckets = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), anchorMonth - i, 1);
    buckets.push({ key: ym(d), label: MONTH_LABELS[d.getMonth()], date: d });
  }
  return buckets;
}

function formatDayRangeLabel(start: Date, end: Date): string {
  const sameYear = start.getFullYear() === end.getFullYear();
  const startStr = `${MONTH_LABELS[start.getMonth()]} ${start.getDate()}${sameYear ? '' : `, ${start.getFullYear()}`}`;
  const endStr = `${MONTH_LABELS[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
  return `${startStr} – ${endStr}`;
}

function formatMonthRangeLabel(start: Date, end: Date): string {
  return `${MONTH_LABELS[start.getMonth()]} ${start.getFullYear()} – ${MONTH_LABELS[end.getMonth()]} ${end.getFullYear()}`;
}

async function fetchProblemRows(userId: string, sinceIso: string, untilIso: string): Promise<{ solved_at: string; problem_id: string }[]> {
  const { data } = await adminSupabase
    .from('user_progress')
    .select('solved_at, problem_id')
    .eq('user_id', userId)
    .gte('solved_at', sinceIso)
    .lt('solved_at', untilIso);
  return data ?? [];
}

async function fetchTheoryRows(userId: string, sinceIso: string, untilIso: string): Promise<{ solved_at: string; question_id: string }[]> {
  const { data } = await adminSupabase
    .from('theory_progress')
    .select('solved_at, question_id')
    .eq('user_id', userId)
    .gte('solved_at', sinceIso)
    .lt('solved_at', untilIso);
  return data ?? [];
}

async function problemRewardMap(ids: string[]): Promise<Map<string, number>> {
  if (ids.length === 0) return new Map();
  const { data } = await adminSupabase.from('problems').select('id, is_top150').in('id', ids);
  return new Map((data ?? []).map((r) => [r.id as string, r.is_top150 ? REWARD_TOP150 : REWARD_REGULAR]));
}

async function theoryRewardMap(ids: string[]): Promise<Map<string, number>> {
  if (ids.length === 0) return new Map();
  const { data } = await adminSupabase.from('theory_questions').select('id, difficulty').in('id', ids);
  return new Map((data ?? []).map((r) => [r.id as string, r.difficulty === 'Hard' ? REWARD_TOP150 : REWARD_REGULAR]));
}

export interface EarningsSeries {
  label: string;
  points: EarningsPoint[];
  canGoOlder: boolean;
  canGoNewer: boolean;
}

// Bucketed earnings for the dashboard chart — 'week' is a trailing-7-day
// window (daily), 'month' a trailing-30-day window (daily), 'year' a
// trailing-12-month window (monthly). `offset` pages whole windows into the
// past (0 = ending today/this month, 1 = the window before that, ...).
// Buckets with no solves still appear, at 0.
export async function getEarningsSeries(
  userId: string | undefined,
  range: EarningsRange,
  offset = 0
): Promise<EarningsSeries> {
  const isMonthly = range === 'year';
  const count = range === 'week' ? 7 : range === 'month' ? 30 : 12;
  const buckets = isMonthly ? buildMonthBuckets(count, offset) : buildDayBuckets(count, offset);

  const start = buckets[0].date;
  const end = buckets[buckets.length - 1].date;
  const until = new Date(end);
  if (isMonthly) until.setMonth(until.getMonth() + 1);
  else until.setDate(until.getDate() + 1);

  const label = isMonthly ? formatMonthRangeLabel(start, end) : formatDayRangeLabel(start, end);
  const canGoNewer = offset > 0;

  if (!userId) {
    return { label, points: buckets.map((b) => ({ label: b.label, value: 0 })), canGoOlder: true, canGoNewer };
  }

  const sinceIso = start.toISOString();
  const untilIso = until.toISOString();
  const keyFor = isMonthly ? (iso: string) => ym(new Date(iso)) : (iso: string) => ymd(new Date(iso));

  const [problemRows, theoryRows] = await Promise.all([
    fetchProblemRows(userId, sinceIso, untilIso),
    fetchTheoryRows(userId, sinceIso, untilIso),
  ]);
  const [pMap, tMap] = await Promise.all([
    problemRewardMap(problemRows.map((r) => r.problem_id)),
    theoryRewardMap(theoryRows.map((r) => r.question_id)),
  ]);

  const sums = new Map<string, number>();
  for (const row of problemRows) {
    const k = keyFor(row.solved_at);
    sums.set(k, (sums.get(k) ?? 0) + (pMap.get(row.problem_id) ?? 0));
  }
  for (const row of theoryRows) {
    const k = keyFor(row.solved_at);
    sums.set(k, (sums.get(k) ?? 0) + (tMap.get(row.question_id) ?? 0));
  }

  return {
    label,
    points: buckets.map((b) => ({ label: b.label, value: sums.get(b.key) ?? 0 })),
    canGoOlder: true,
    canGoNewer,
  };
}

export async function getAllEarningsSeries(userId: string | undefined): Promise<Record<EarningsRange, EarningsSeries>> {
  const [week, month, year] = await Promise.all([
    getEarningsSeries(userId, 'week'),
    getEarningsSeries(userId, 'month'),
    getEarningsSeries(userId, 'year'),
  ]);
  return { week, month, year };
}

export { startOfTodayIso };
