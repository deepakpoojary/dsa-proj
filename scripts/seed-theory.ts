import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function main() {
  const raw = fs.readFileSync(path.join(process.cwd(), 'data', 'theory.json'), 'utf-8');
  const data = JSON.parse(raw);

  // Upsert topics
  const topicRows = Object.entries(data.topics).map(([key, t]: [string, any]) => ({
    key,
    label: t.label,
    enabled: t.enabled,
    color: t.color,
  }));

  const { error: topicsErr } = await supabase.from('theory_topics').upsert(topicRows);
  if (topicsErr) { console.error('Topics error:', topicsErr.message); process.exit(1); }
  console.log(`✓ Upserted ${topicRows.length} topics`);

  // Upsert questions with position
  const questionRows = data.questions.map((q: any, i: number) => ({
    id: q.id,
    topic: q.topic,
    question: q.question,
    answer: q.answer,
    difficulty: q.difficulty,
    created_at: q.createdAt,
    position: (i + 1) * 1000,
  }));

  // Insert in batches of 50
  for (let i = 0; i < questionRows.length; i += 50) {
    const batch = questionRows.slice(i, i + 50);
    const { error } = await supabase.from('theory_questions').upsert(batch);
    if (error) { console.error(`Batch ${i} error:`, error.message); process.exit(1); }
    console.log(`✓ Upserted questions ${i + 1}–${Math.min(i + 50, questionRows.length)}`);
  }

  console.log(`\nDone. ${questionRows.length} questions in Supabase.`);
}

main();
