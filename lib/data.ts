import { supabase } from './supabase';
import { Problem } from '@/types';

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
  };
}

export async function getProblems(): Promise<Problem[]> {
  const { data, error } = await supabase
    .from('problems')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data as DbRow[]).map(rowToProblem);
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
