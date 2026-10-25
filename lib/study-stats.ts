import { supabase as adminSupabase } from '@/lib/supabase';

export interface TopicStat {
  key: string;
  label: string;
  total: number;
  solved: number;
  href: string;
}

export interface StudyStats {
  problemTopics: TopicStat[];
  theoryTopics: TopicStat[];
}

// Anchor ids must match ProblemsView / TheoryView's topicId().
const problemAnchor = (topic: string) => `/#topic-${topic.toLowerCase().replace(/\s+/g, '-')}`;
const theoryAnchor = (key: string) => `/theory#theory-${key.toLowerCase()}`;

function countBy<T>(rows: T[], key: (r: T) => string): Map<string, number> {
  const m = new Map<string, number>();
  for (const r of rows) m.set(key(r), (m.get(key(r)) ?? 0) + 1);
  return m;
}

// Per-topic totals and the user's solved counts for the site's own DSA
// problems and theory questions — drives the "This site" DSA source and the
// Core CS lever on the Salary Roadmap.
export async function getStudyStats(userId: string | undefined): Promise<StudyStats> {
  const [problems, topicOrder, theory, theoryTopics, solvedProblems, solvedTheory] = await Promise.all([
    adminSupabase.from('problems').select('id, topic'),
    adminSupabase.from('problem_topics').select('name').order('sort_order', { ascending: true }),
    adminSupabase.from('theory_questions').select('id, topic'),
    adminSupabase.from('theory_topics').select('key, label, enabled'),
    userId
      ? adminSupabase.from('user_progress').select('problem_id').eq('user_id', userId)
      : Promise.resolve({ data: [] as { problem_id: string }[] }),
    userId
      ? adminSupabase.from('theory_progress').select('question_id').eq('user_id', userId)
      : Promise.resolve({ data: [] as { question_id: string }[] }),
  ]);

  const problemRows = (problems.data ?? []) as { id: string; topic: string }[];
  const problemTopicOf = new Map(problemRows.map((p) => [p.id, p.topic]));
  const problemTotals = countBy(problemRows, (p) => p.topic);
  const problemSolved = countBy(
    ((solvedProblems.data ?? []) as { problem_id: string }[]).filter((r) => problemTopicOf.has(r.problem_id)),
    (r) => problemTopicOf.get(r.problem_id)!
  );
  const order = ((topicOrder.data ?? []) as { name: string }[]).map((t) => t.name);
  const orderedTopics = [
    ...order.filter((t) => problemTotals.has(t)),
    ...[...problemTotals.keys()].filter((t) => !order.includes(t)),
  ];

  const theoryRows = (theory.data ?? []) as { id: string; topic: string }[];
  const theoryTopicOf = new Map(theoryRows.map((q) => [q.id, q.topic]));
  const theoryTotals = countBy(theoryRows, (q) => q.topic);
  const theorySolved = countBy(
    ((solvedTheory.data ?? []) as { question_id: string }[]).filter((r) => theoryTopicOf.has(r.question_id)),
    (r) => theoryTopicOf.get(r.question_id)!
  );

  return {
    problemTopics: orderedTopics.map((t) => ({
      key: t,
      label: t,
      total: problemTotals.get(t) ?? 0,
      solved: problemSolved.get(t) ?? 0,
      href: problemAnchor(t),
    })),
    theoryTopics: ((theoryTopics.data ?? []) as { key: string; label: string; enabled: boolean }[])
      .filter((t) => t.enabled && theoryTotals.has(t.key))
      .map((t) => ({
        key: t.key,
        label: t.label,
        total: theoryTotals.get(t.key) ?? 0,
        solved: theorySolved.get(t.key) ?? 0,
        href: theoryAnchor(t.key),
      })),
  };
}
