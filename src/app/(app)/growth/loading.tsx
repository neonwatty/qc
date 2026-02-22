import { PageContainer } from '@/components/layout/PageContainer'
import { Skeleton, SkeletonGroup } from '@/components/ui/skeleton'

export default function GrowthLoading() {
  return (
    <PageContainer
      title="Growth Gallery"
      description="Track your relationship journey and celebrate your achievements together."
      className="space-y-8"
    >
      {/* Tab bar skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-lg" />
        ))}
      </div>
      {/* Milestone cards */}
      <SkeletonGroup count={3} variant="card" className="h-40" />
    </PageContainer>
  )
}
