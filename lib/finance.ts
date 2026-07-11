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

export { startOfTodayIso };
