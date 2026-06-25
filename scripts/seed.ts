import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function seed() {
  const raw = fs.readFileSync(path.join(process.cwd(), 'data', 'problems.json'), 'utf-8');
  const { problems } = JSON.parse(raw);

  console.log(`Seeding ${problems.length} problems...`);

  for (const p of problems) {
    const { error } = await supabase.from('problems').upsert({
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
    });

    if (error) {
      console.error(`Failed: ${p.title}`, error.message);
    } else {
      console.log(`✓ ${p.title}`);
    }
  }

  console.log('Done!');
}

seed().catch(console.error);
