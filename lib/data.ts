import { supabase } from './supabase';
import { Problem } from '@/types';

export const FREE_TOPIC_COUNT = 2;

type DbRow = {
  id: string;
  title: string;
  slug: string;
  topic: string;
  difficulty: string;
  description: string;
  examples: Problem['examples'];
  brute_force: Problem['bruteForce'];
  optimal: Problem['optimal'];
  created_at: string;
  is_top150: boolean | null;
};

function rowToProblem(row: DbRow): Problem {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    topic: row.topic,
    difficulty: row.difficulty as Problem['difficulty'],
    description: row.description,
    examples: row.examples || [],
    bruteForce: row.brute_force,
    optimal: row.optimal,
    createdAt: row.created_at,
    isTop150: row.is_top150 === true,
  };
}

function problemToRow(p: Problem) {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    topic: p.topic,
    difficulty: p.difficulty,
    description: p.description,
    examples: p.examples || [],
    brute_force: p.bruteForce,
    optimal: p.optimal,
    created_at: p.createdAt,
    is_top150: p.isTop150,
  };
}

export async function getProblem(id: string): Promise<Problem | null> {
  const { data, error } = await supabase
    .from('problems')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return rowToProblem(data as DbRow);
}

export async function getProblems(): Promise<Problem[]> {
  const { data, error } = await supabase
    .from('problems')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data as DbRow[]).map(rowToProblem);
}

// Ordered topic list driving which topics are free. A topic missing from
// `problem_topics` sorts last (locked) rather than failing open.
export async function getProblemTopics(): Promise<string[]> {
  const { data, error } = await supabase
    .from('problem_topics')
    .select('name')
    .order('sort_order', { ascending: true });

  if (error) throw new Error(error.message);
  return (data as { name: string }[]).map((row) => row.name);
}

export async function insertProblem(p: Problem): Promise<void> {
  const { error } = await supabase.from('problems').insert(problemToRow(p));
  if (error) throw new Error(error.message);
}

export async function updateProblem(id: string, p: Problem): Promise<void> {
  const { error } = await supabase
    .from('problems')
    .update(problemToRow(p))
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteProblem(id: string): Promise<void> {
  const { error } = await supabase.from('problems').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export type ProblemOverride = {
  description: string;
  bruteForce: Problem['bruteForce'];
  optimal: Problem['optimal'];
};

type OverrideRow = {
  problem_id: string;
  description: string;
  brute_force: Problem['bruteForce'];
  optimal: Problem['optimal'];
};

function rowToOverride(row: OverrideRow): ProblemOverride {
  return { description: row.description, bruteForce: row.brute_force, optimal: row.optimal };
}

// All of a user's personal overrides, keyed by problem_id — used to merge
// a user's private edits over master data when rendering the problem list.
export async function getUserOverrides(userId: string | undefined): Promise<Map<string, ProblemOverride>> {
  if (!userId) return new Map();

  const { data, error } = await supabase
    .from('user_problem_overrides')
    .select('problem_id, description, brute_force, optimal')
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
  return new Map((data as OverrideRow[]).map((row) => [row.problem_id, rowToOverride(row)]));
}

export async function getUserOverride(userId: string, problemId: string): Promise<ProblemOverride | null> {
  const { data, error } = await supabase
    .from('user_problem_overrides')
    .select('problem_id, description, brute_force, optimal')
    .eq('user_id', userId)
    .eq('problem_id', problemId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? rowToOverride(data as OverrideRow) : null;
}

export async function upsertUserOverride(
  userId: string,
  problemId: string,
  override: ProblemOverride
): Promise<void> {
  const { error } = await supabase.from('user_problem_overrides').upsert(
    {
      user_id: userId,
      problem_id: problemId,
      description: override.description,
      brute_force: override.bruteForce,
      optimal: override.optimal,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,problem_id' }
  );
  if (error) throw new Error(error.message);
}

export async function deleteUserOverride(userId: string, problemId: string): Promise<void> {
  const { error } = await supabase
    .from('user_problem_overrides')
    .delete()
    .eq('user_id', userId)
    .eq('problem_id', problemId);
  if (error) throw new Error(error.message);
}
