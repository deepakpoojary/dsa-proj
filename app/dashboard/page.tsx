import { getCurrentUser, getIsPaidUser, isAdminSession } from '@/lib/auth-helpers';
import { getUserFinance, getTotalEarned, getEarnedToday } from '@/lib/finance';
import { getStudyStats } from '@/lib/study-stats';
import Dashboard from '@/components/Dashboard';

export const metadata = { title: 'dashboard' };

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [user, hasPaid, isAdmin] = await Promise.all([getCurrentUser(), getIsPaidUser(), isAdminSession()]);

  const [finance, totalEarned, earnedToday, stats] = await Promise.all([
    getUserFinance(user?.id),
    getTotalEarned(user?.id),
    getEarnedToday(user?.id),
    getStudyStats(user?.id),
  ]);

  return (
    <Dashboard
      email={user?.email ?? null}
      hasPaid={hasPaid}
      isAdmin={isAdmin}
      finance={finance}
      totalEarned={totalEarned}
      earnedToday={earnedToday}
      stats={stats}
    />
  );
}
