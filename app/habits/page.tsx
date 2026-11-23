import { getCurrentUser } from '@/lib/auth-helpers';
import HabitsView from '@/components/HabitsView';

export const metadata = { title: 'habits' };

export const dynamic = 'force-dynamic';

export default async function HabitsPage() {
  const user = await getCurrentUser();
  return <HabitsView signedIn={!!user} />;
}
