import { PageContainer } from '@/components/layout/PageContainer'
import { Skeleton, SkeletonGroup } from '@/components/ui/skeleton'

export default function RequestsLoading() {
  return (
    <PageContainer title="Requests">
      {/* Tab bar skeleton */}
      <div className="flex gap-2">
        <Skeleton className="h-9 w-28 rounded-lg" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
      {/* Request cards */}
      <SkeletonGroup count={3} variant="card" />
    </PageContainer>
  )
}
