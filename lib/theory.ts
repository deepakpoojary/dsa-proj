import { supabase } from './supabase';
import { TheoryData, TheoryQuestion, TheoryTopic } from '@/types/theory';

const TOPIC_ORDER = ['OS', 'OOPs', 'CN', 'DBMS', 'SQL'];

export async function getTheoryData(): Promise<TheoryData> {
  const [qRes, tRes] = await Promise.all([
    supabase.from('theory_questions').select('*').order('position', { ascending: true }),
    supabase.from('theory_topics').select('*'),
  ]);

  const topicMap = new Map((tRes.data ?? []).map((r: any) => [r.key, r]));
  const topics: Record<string, TheoryTopic> = {};
  for (const key of TOPIC_ORDER) {
    const t = topicMap.get(key) as any;
    if (t) topics[key] = { label: t.label, enabled: t.enabled, color: t.color };
  }

  const questions: TheoryQuestion[] = (qRes.data ?? []).map((r: any) => ({
    id: r.id,
    topic: r.topic,
    question: r.question,
    answer: r.answer,
    difficulty: r.difficulty as TheoryQuestion['difficulty'],
    createdAt: r.created_at,
    solved: false,
    solvedToday: false,
  }));

  return { topics, questions };
}

export async function addTheoryQuestion(
  topic: string,
  afterId?: string,
  before?: boolean
): Promise<TheoryQuestion> {
  const id = `${topic.toLowerCase().replace(/[^a-z]/g, '')}-${Date.now()}`;
  let position = Date.now();

  if (afterId) {
    const { data: target } = await supabase
      .from('theory_questions')
      .select('position')
      .eq('id', afterId)
      .single();

    if (target) {
      const { data: neighbor } = await supabase
        .from('theory_questions')
        .select('position')
        .filter('position', before ? 'lt' : 'gt', (target as any).position)
        .order('position', { ascending: !before })
        .limit(1)
        .maybeSingle();

      position = neighbor
        ? ((target as any).position + (neighbor as any).position) / 2
        : before
        ? (target as any).position - 500
        : (target as any).position + 500;
    }
  } else {
    const { data: last } = await supabase
      .from('theory_questions')
      .select('position')
      .eq('topic', topic)
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle();

    position = last ? (last as any).position + 1000 : 1000;
  }

  const row = {
    id,
    topic,
    question: 'New Question',
    answer: 'Answer goes here...',
    difficulty: 'Medium',
    created_at: new Date().toISOString().split('T')[0],
    position,
  };

  await supabase.from('theory_questions').insert(row);

  return {
    id: row.id,
    topic: row.topic,
    question: row.question,
    answer: row.answer,
    difficulty: row.difficulty as TheoryQuestion['difficulty'],
    createdAt: row.created_at,
    solved: false,
    solvedToday: false,
  };
}

export async function updateTheoryQuestion(
  id: string,
  updates: Partial<TheoryQuestion>
): Promise<TheoryQuestion | null> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.question !== undefined) dbUpdates.question = updates.question;
  if (updates.answer !== undefined) dbUpdates.answer = updates.answer;
  if (updates.difficulty !== undefined) dbUpdates.difficulty = updates.difficulty;

  const { data } = await supabase
    .from('theory_questions')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (!data) return null;
  const r = data as any;
  return { id: r.id, topic: r.topic, question: r.question, answer: r.answer, difficulty: r.difficulty, createdAt: r.created_at, solved: false, solvedToday: false };
}

export async function deleteTheoryQuestion(id: string): Promise<void> {
  await supabase.from('theory_questions').delete().eq('id', id);
}

export async function setTopicEnabled(key: string, enabled: boolean): Promise<void> {
  await supabase.from('theory_topics').update({ enabled }).eq('key', key);
}
