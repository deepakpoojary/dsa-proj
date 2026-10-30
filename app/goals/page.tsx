import { getCurrentUser } from '@/lib/auth-helpers';
import { getUserFinance, getTotalEarned } from '@/lib/finance';
import { getStudyStats, TopicStat } from '@/lib/study-stats';
import GoalsView from '@/components/GoalsView';

export const metadata = { title: 'goals' };

export const dynamic = 'force-dynamic';

const sum = (topics: TopicStat[]) =>
  topics.reduce((a, t) => ({ solved: a.solved + t.solved, total: a.total + t.total }), { solved: 0, total: 0 });

export default async function GoalsPage() {
  const user = await getCurrentUser();
  const [finance, totalEarned, stats] = await Promise.all([
    getUserFinance(user?.id),
    getTotalEarned(user?.id),
    getStudyStats(user?.id),
  ]);

  return (
    <GoalsView
      signedIn={!!user}
      ctx={{
        netWorth: finance.startingBalance + totalEarned,
        targetAmount: finance.targetAmount,
        dsa: sum(stats.problemTopics),
        theory: sum(stats.theoryTopics),
      }}
    />
  );
}
