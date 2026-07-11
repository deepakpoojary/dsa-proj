import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { supabase as adminSupabase } from '@/lib/supabase';

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getIsPaidUser(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const { data } = await adminSupabase
    .from('profiles')
    .select('has_paid')
    .eq('id', user.id)
    .single();

  return data?.has_paid === true;
}

export async function isAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get('admin_session')?.value === 'authenticated';
}

export async function getSolvedProblemIds(userId: string | undefined): Promise<Set<string>> {
  if (!userId) return new Set();

  const { data } = await adminSupabase
    .from('user_progress')
    .select('problem_id')
    .eq('user_id', userId);

  return new Set((data ?? []).map((row) => row.problem_id as string));
}

export async function getSolvedTheoryIds(userId: string | undefined): Promise<Set<string>> {
  if (!userId) return new Set();

  const { data } = await adminSupabase
    .from('theory_progress')
    .select('question_id')
    .eq('user_id', userId);

  return new Set((data ?? []).map((row) => row.question_id as string));
}

function startOfTodayIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function getSolvedTodayProblemIds(userId: string | undefined): Promise<Set<string>> {
  if (!userId) return new Set();

  const { data } = await adminSupabase
    .from('user_progress')
    .select('problem_id')
    .eq('user_id', userId)
    .gte('solved_at', startOfTodayIso());

  return new Set((data ?? []).map((row) => row.problem_id as string));
}

export async function getSolvedTodayTheoryIds(userId: string | undefined): Promise<Set<string>> {
  if (!userId) return new Set();

  const { data } = await adminSupabase
    .from('theory_progress')
    .select('question_id')
    .eq('user_id', userId)
    .gte('solved_at', startOfTodayIso());

  return new Set((data ?? []).map((row) => row.question_id as string));
}
