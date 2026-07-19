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

function buildDayBuckets(count: number): { key: string; label: string; date: Date }[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const buckets = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    buckets.push({ key: ymd(d), label: count <= 7 ? WEEKDAY_LABELS[d.getDay()] : `${d.getDate()}`, date: d });
  }
  return buckets;
}

function buildMonthBuckets(count: number): { key: string; label: string; date: Date }[] {
  const today = new Date();
  const buckets = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    buckets.push({ key: ym(d), label: MONTH_LABELS[d.getMonth()], date: d });
  }
  return buckets;
}

async function fetchProblemRows(userId: string, sinceIso: string): Promise<{ solved_at: string; problem_id: string }[]> {
  const { data } = await adminSupabase
    .from('user_progress')
    .select('solved_at, problem_id')
    .eq('user_id', userId)
    .gte('solved_at', sinceIso);
  return data ?? [];
}

async function fetchTheoryRows(userId: string, sinceIso: string): Promise<{ solved_at: string; question_id: string }[]> {
  const { data } = await adminSupabase
    .from('theory_progress')
    .select('solved_at, question_id')
    .eq('user_id', userId)
    .gte('solved_at', sinceIso);
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

// Bucketed earnings for the dashboard chart — 'week' is the trailing 7 days
// (daily), 'month' the trailing 30 days (daily), 'year' the trailing 12
// months (monthly). Buckets with no solves still appear, at 0.
export async function getEarningsSeries(userId: string | undefined, range: EarningsRange): Promise<EarningsPoint[]> {
  const buckets = range === 'year' ? buildMonthBuckets(12) : buildDayBuckets(range === 'week' ? 7 : 30);
  if (!userId) return buckets.map((b) => ({ label: b.label, value: 0 }));

  const sinceIso = buckets[0].date.toISOString();
  const keyFor = range === 'year' ? (iso: string) => ym(new Date(iso)) : (iso: string) => ymd(new Date(iso));

  const [problemRows, theoryRows] = await Promise.all([
    fetchProblemRows(userId, sinceIso),
    fetchTheoryRows(userId, sinceIso),
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

  return buckets.map((b) => ({ label: b.label, value: sums.get(b.key) ?? 0 }));
}

export async function getAllEarningsSeries(userId: string | undefined): Promise<Record<EarningsRange, EarningsPoint[]>> {
  const [week, month, year] = await Promise.all([
    getEarningsSeries(userId, 'week'),
    getEarningsSeries(userId, 'month'),
    getEarningsSeries(userId, 'year'),
  ]);
  return { week, month, year };
}

export { startOfTodayIso };
