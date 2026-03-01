import { PageContainer } from '@/components/layout/PageContainer'
import { Skeleton, SkeletonGroup } from '@/components/ui/skeleton'

export default function RemindersLoading() {
  return (
    <PageContainer title="Reminders" description="Stay connected with thoughtful reminders for your relationship">
      {/* Filter tabs skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      {/* Reminder cards */}
      <SkeletonGroup count={3} variant="card" />
    </PageContainer>
  )
}
