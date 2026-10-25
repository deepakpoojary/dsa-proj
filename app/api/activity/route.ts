import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { supabase as adminSupabase } from '@/lib/supabase';

export interface ActivityEvent {
  kind: 'problem' | 'theory' | 'item';
  id: string;
  at: number;          // ms epoch
  title?: string;      // problems / theory only; items are resolved client-side
  context?: string;
  topic?: string;      // problems / theory: their topic key
  href?: string;
}

// Everything the user has completed, with timestamps, for the Activity
// calendar: solved problems, solved theory questions, and checklist items.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [progress, theory, checklist] = await Promise.all([
    adminSupabase.from('user_progress').select('problem_id, solved_at').eq('user_id', user.id),
    adminSupabase.from('theory_progress').select('question_id, solved_at').eq('user_id', user.id),
    adminSupabase.from('user_checklist').select('item_id, checked_at').eq('user_id', user.id),
  ]);

  const problemIds = (progress.data ?? []).map((r) => r.problem_id as string);
  const questionIds = (theory.data ?? []).map((r) => r.question_id as string);

  const [problems, questions] = await Promise.all([
    problemIds.length
      ? adminSupabase.from('problems').select('id, title, slug, topic').in('id', problemIds)
      : Promise.resolve({ data: [] }),
    questionIds.length
      ? adminSupabase.from('theory_questions').select('id, question, topic').in('id', questionIds)
      : Promise.resolve({ data: [] }),
  ]);

  const problemById = new Map(((problems.data ?? []) as { id: string; title: string; slug: string; topic: string; }[]).map((p) => [p.id, p]));
  const questionById = new Map(((questions.data ?? []) as { id: string; question: string; topic: string }[]).map((q) => [q.id, q]));

  const events: ActivityEvent[] = [];

  for (const r of progress.data ?? []) {
    const p = problemById.get(r.problem_id as string);
    if (!p) continue;
    events.push({
      kind: 'problem',
      id: p.id,
      at: new Date(r.solved_at as string).getTime(),
      title: p.title,
      context: `DSA · ${p.topic}`,
      topic: p.topic,
      href: `/#problem-${p.slug}`,
    });
  }

  for (const r of theory.data ?? []) {
    const q = questionById.get(r.question_id as string);
    if (!q) continue;
    events.push({
      kind: 'theory',
      id: q.id,
      at: new Date(r.solved_at as string).getTime(),
      title: q.question,
      context: `Theory · ${q.topic}`,
      topic: q.topic,
      href: `/theory#theory-q-${q.id}`,
    });
  }

  // Missing table (not yet migrated) just means no checklist history.
  for (const r of checklist.data ?? []) {
    events.push({ kind: 'item', id: r.item_id as string, at: new Date(r.checked_at as string).getTime() });
  }

  events.sort((a, b) => b.at - a.at);
  return NextResponse.json({ events });
}
