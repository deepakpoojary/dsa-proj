import { getProblems } from '@/lib/data';
import { highlight } from '@/lib/highlight';
import ProblemsView from '@/components/ProblemsView';

export const revalidate = 30;

export default async function Home() {
  const problems = await getProblems();

  const enriched = await Promise.all(
    problems.map(async (p) => ({
      ...p,
      bruteHtml: await highlight(p.bruteForce.code, p.bruteForce.language),
      optimalHtml: await highlight(p.optimal.code, p.optimal.language),
    }))
  );

  return <ProblemsView problems={enriched} />;
}
