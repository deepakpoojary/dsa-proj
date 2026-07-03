import { getTheoryData } from '@/lib/theory'
import TheoryView from '@/components/TheoryView'

export const dynamic = 'force-dynamic'

export default async function TheoryPage() {
  const data = await getTheoryData()
  return <TheoryView data={data} />
}
