import { PageContainer } from '@/components/layout/PageContainer'
import { Skeleton, SkeletonGroup } from '@/components/ui/skeleton'

export default function NotesLoading() {
  return (
    <PageContainer title="Notes" description="Keep track of your thoughts, insights, and reflections">
      {/* Search bar skeleton */}
      <Skeleton variant="rectangular" className="h-10 rounded-xl" />
      {/* Note cards */}
      <SkeletonGroup count={3} variant="card" className="h-32" />
    </PageContainer>
  )
}
