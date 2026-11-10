import { getProblems, getProblemTopics, getUserOverrides, FREE_TOPIC_COUNT } from '@/lib/data';
import { highlight } from '@/lib/highlight';
import {
  getCurrentUser,
  getIsPaidUser,
  isAdminSession,
  getSolvedProblemIds,
  getSolvedTodayProblemIds,
} from '@/lib/auth-helpers';
import { getUserFinance, getTheoryEarned, startOfTodayIso } from '@/lib/finance';
import { cookies } from 'next/headers';
import ProblemsView from '@/components/ProblemsView';
import CourseDsaView from '@/components/CourseDsaView';
import { SITE_DSA_COOKIE } from '@/lib/study-items';
import { courseDsaItems } from '@/lib/study-items.server';
import { problemStars } from '@/lib/importance';

export const dynamic = 'force-dynamic';

export default async function Home() {
  // The course syllabus is the default DSA list; this site's own problems
  // only load when switched back on (cookie set from either view).
  const showSite = (await cookies()).get(SITE_DSA_COOKIE)?.value === '1';
  if (!showSite) {
    const user = await getCurrentUser();
    return <CourseDsaView items={courseDsaItems()} email={user?.email ?? null} />;
  }

  const [problems, topicOrder, user, hasPaid, isAdmin] = await Promise.all([
    getProblems(),
    getProblemTopics(),
    getCurrentUser(),
    getIsPaidUser(),
    isAdminSession(),
  ]);

  const [solvedIds, solvedTodayIds, finance, otherDomainEarned, otherDomainEarnedToday, overrides] = await Promise.all([
    getSolvedProblemIds(user?.id),
    getSolvedTodayProblemIds(user?.id),
    getUserFinance(user?.id),
    getTheoryEarned(user?.id),
    getTheoryEarned(user?.id, startOfTodayIso()),
    getUserOverrides(user?.id),
  ]);

  const freeTopics = new Set(topicOrder.slice(0, FREE_TOPIC_COUNT));
  const unlocked = hasPaid || isAdmin;

  const enriched = await Promise.all(
    problems.map(async (p) => {
      // A user's personal override, if any, shadows master content —
      // admin edits to master never touch it once it exists.
      const override = overrides.get(p.id);
      const description = override?.description ?? p.description;
      const bruteForce = override?.bruteForce ?? p.bruteForce;
      const optimal = override?.optimal ?? p.optimal;

      return {
        ...p,
        description,
        bruteForce,
        optimal,
        bruteHtml: await highlight(bruteForce.code, bruteForce.language),
        optimalHtml: await highlight(optimal.code, optimal.language),
        isLocked: !unlocked && !freeTopics.has(p.topic),
        solved: solvedIds.has(p.id),
        solvedToday: solvedTodayIds.has(p.id),
        hasOverride: !!override,
        stars: problemStars(p),
      };
    })
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
