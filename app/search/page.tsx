import { cookies } from 'next/headers';
import { getTheoryData } from '@/lib/theory';
import { getProblems } from '@/lib/data';
import { getCurrentUser, getSolvedProblemIds, getSolvedTheoryIds } from '@/lib/auth-helpers';
import { theoryItems, DSA_TOPIC, LLD_TOPIC, HLD_TOPIC, SITE_DSA_TOPIC, SITE_DSA_COOKIE, StudyItem, StudyTopic } from '@/lib/study-items';
import { bankItems, bankTopics, courseDsaItems, designCourseItems, siteProblemItems } from '@/lib/study-items.server';
import { CATEGORIES, searchItems } from '@/lib/search';
import SearchView from '@/components/SearchView';

export const metadata = { title: 'search' };
export const dynamic = 'force-dynamic';

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw ?? '').slice(0, 200);
  const showSite = (await cookies()).get(SITE_DSA_COOKIE)?.value === '1';

  const [theory, user] = await Promise.all([getTheoryData(), getCurrentUser()]);
  const [solvedTheory, solvedProblems, problems] = await Promise.all([
    getSolvedTheoryIds(user?.id),
    showSite ? getSolvedProblemIds(user?.id) : Promise.resolve(new Set<string>()),
    showSite ? getProblems() : Promise.resolve([]),
  ]);

  const topics: Record<string, StudyTopic> = {};
  for (const [k, t] of Object.entries(theory.topics)) topics[k] = { key: k, label: t.label, color: t.color, source: 'db' };
  for (const t of bankTopics()) topics[t.key] = t;
  topics[DSA_TOPIC.key] = DSA_TOPIC;
  topics[LLD_TOPIC.key] = LLD_TOPIC;
  topics[HLD_TOPIC.key] = HLD_TOPIC;
  if (showSite) topics[SITE_DSA_TOPIC.key] = SITE_DSA_TOPIC;

  const all: StudyItem[] = [
    ...courseDsaItems(),
    ...designCourseItems(),
    ...(showSite ? siteProblemItems(problems.map((p) => ({ ...p, solved: solvedProblems.has(p.id) }))) : []),
    ...theoryItems(theory.questions.map((x) => ({ ...x, solved: solvedTheory.has(x.id) }))),
    ...bankItems(),
  ];

  // Category chips for the empty state, with how many questions each holds.
  const counts = CATEGORIES.map((c) => ({
    key: c.key,
    label: c.label,
    query: c.aliases[0],
    count: all.filter((i) => c.topics.includes(i.topic)).length,
  })).filter((c) => c.count > 0);

  const result = q.trim() ? searchItems(q, all, topics) : null;
  // The raw DB row is only needed by the theory editor — drop it to keep the payload small.
  const items = (result?.items ?? []).map((it) => ({ ...it, theory: undefined }));

  return (
    <SearchView
      q={q}
      items={items}
      topics={topics}
      category={result?.category ? { key: result.category.key, label: result.category.label } : null}
      categories={counts}
      email={user?.email ?? null}
    />
  );
}
