import { getCurrentUser } from '@/lib/auth-helpers';
import { getStudyStats } from '@/lib/study-stats';
import RevisionView from '@/components/RevisionView';

export const dynamic = 'force-dynamic';

export default async function RevisionPage() {
  const user = await getCurrentUser();
  const stats = await getStudyStats(user?.id);
  return <RevisionView signedIn={!!user} stats={stats} />;
}
