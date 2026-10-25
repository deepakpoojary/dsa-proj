import { getCurrentUser } from '@/lib/auth-helpers';
import { getStudyStats } from '@/lib/study-stats';
import SalaryRoadmap from '@/components/SalaryRoadmap';

export const dynamic = 'force-dynamic';

export default async function RoadmapPage() {
  const user = await getCurrentUser();
  const stats = await getStudyStats(user?.id);
  return <SalaryRoadmap signedIn={!!user} stats={stats} />;
}
