import { getProblems, getProblemTopics, FREE_TOPIC_COUNT } from '@/lib/data';
import { highlight } from '@/lib/highlight';
import { getCurrentUser, getIsPaidUser, isAdminSession, getSolvedProblemIds } from '@/lib/auth-helpers';
import ProblemsView from '@/components/ProblemsView';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [problems, topicOrder, user, hasPaid, isAdmin] = await Promise.all([
    getProblems(),
    getProblemTopics(),
    getCurrentUser(),
    getIsPaidUser(),
    isAdminSession(),
  ]);

  const solvedIds = await getSolvedProblemIds(user?.id);

  const freeTopics = new Set(topicOrder.slice(0, FREE_TOPIC_COUNT));
  const unlocked = hasPaid || isAdmin;

  const enriched = await Promise.all(
    problems.map(async (p) => ({
      ...p,
      bruteHtml: await highlight(p.bruteForce.code, p.bruteForce.language),
      optimalHtml: await highlight(p.optimal.code, p.optimal.language),
      isLocked: !unlocked && !freeTopics.has(p.topic),
      solved: solvedIds.has(p.id),
    }))
  );

  return (
    <ProblemsView
      problems={enriched}
      topicOrder={topicOrder}
      email={user?.email ?? null}
      hasPaid={hasPaid}
      isAdmin={isAdmin}
    />
  );
}
