import { getCurrentUser } from '@/lib/auth-helpers';
import MileageView from '@/components/MileageView';

export const metadata = { title: 'mileage' };

export const dynamic = 'force-dynamic';

export default async function MileagePage() {
  const user = await getCurrentUser();
  return <MileageView signedIn={!!user} />;
}
