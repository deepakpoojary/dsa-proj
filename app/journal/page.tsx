import { getCurrentUser, getSolvedTodayProblemIds, getSolvedTodayTheoryIds } from '@/lib/auth-helpers';
import { getEarnedToday } from '@/lib/finance';
import JournalView from '@/components/JournalView';

export const metadata = { title: 'journal' };

export const dynamic = 'force-dynamic';

export default async function JournalPage() {
  const user = await getCurrentUser();
  const [problems, theory, earned] = await Promise.all([
    getSolvedTodayProblemIds(user?.id),
    getSolvedTodayTheoryIds(user?.id),
    getEarnedToday(user?.id),
  ]);

  return (
    <JournalView
      signedIn={!!user}
      activity={{ problemsSolved: problems.size, theorySolved: theory.size, earned }}
    />
  );
}
