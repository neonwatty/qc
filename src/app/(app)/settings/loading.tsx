import { PageContainer } from '@/components/layout/PageContainer'
import { SkeletonGroup } from '@/components/ui/skeleton'

export default function SettingsLoading() {
  return (
    <PageContainer title="Settings">
      <SkeletonGroup count={3} variant="card" className="h-48" />
    </PageContainer>
  )
}
