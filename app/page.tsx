import { getProblems, getProblemTopics, FREE_TOPIC_COUNT } from '@/lib/data';
import { highlight } from '@/lib/highlight';
import {
  getCurrentUser,
  getIsPaidUser,
  isAdminSession,
  getSolvedProblemIds,
  getSolvedTodayProblemIds,
} from '@/lib/auth-helpers';
import { getUserFinance, getTheoryEarned, startOfTodayIso } from '@/lib/finance';
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

  const [solvedIds, solvedTodayIds, finance, otherDomainEarned, otherDomainEarnedToday] = await Promise.all([
    getSolvedProblemIds(user?.id),
    getSolvedTodayProblemIds(user?.id),
    getUserFinance(user?.id),
    getTheoryEarned(user?.id),
    getTheoryEarned(user?.id, startOfTodayIso()),
  ]);

  const freeTopics = new Set(topicOrder.slice(0, FREE_TOPIC_COUNT));
  const unlocked = hasPaid || isAdmin;

  const enriched = await Promise.all(
    problems.map(async (p) => ({
      ...p,
      bruteHtml: await highlight(p.bruteForce.code, p.bruteForce.language),
      optimalHtml: await highlight(p.optimal.code, p.optimal.language),
      isLocked: !unlocked && !freeTopics.has(p.topic),
      solved: solvedIds.has(p.id),
      solvedToday: solvedTodayIds.has(p.id),
    }))
  );

  return (
    <ProblemsView
      problems={enriched}
      topicOrder={topicOrder}
      email={user?.email ?? null}
      hasPaid={hasPaid}
      isAdmin={isAdmin}
      startingBalance={finance.startingBalance}
      otherDomainEarned={otherDomainEarned}
      otherDomainEarnedToday={otherDomainEarnedToday}
    />
  );
}
