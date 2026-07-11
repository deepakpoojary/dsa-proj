import { getTheoryData } from '@/lib/theory'
import { getCurrentUser, getSolvedTheoryIds, getSolvedTodayTheoryIds, isAdminSession } from '@/lib/auth-helpers'
import { getUserFinance, getProblemsEarned, startOfTodayIso } from '@/lib/finance'
import TheoryView from '@/components/TheoryView'

export const dynamic = 'force-dynamic'

export default async function TheoryPage() {
  const [data, user, isAdmin] = await Promise.all([
    getTheoryData(),
    getCurrentUser(),
    isAdminSession(),
  ])

  const [solvedIds, solvedTodayIds, finance, otherDomainEarned, otherDomainEarnedToday] = await Promise.all([
    getSolvedTheoryIds(user?.id),
    getSolvedTodayTheoryIds(user?.id),
    getUserFinance(user?.id),
    getProblemsEarned(user?.id),
    getProblemsEarned(user?.id, startOfTodayIso()),
  ])

  const enrichedData = {
    ...data,
    questions: data.questions.map((q) => ({
      ...q,
      solved: solvedIds.has(q.id),
      solvedToday: solvedTodayIds.has(q.id),
    })),
  }

  return (
    <TheoryView
      data={enrichedData}
      email={user?.email ?? null}
      isAdmin={isAdmin}
      startingBalance={finance.startingBalance}
      otherDomainEarned={otherDomainEarned}
      otherDomainEarnedToday={otherDomainEarnedToday}
    />
  )
}
