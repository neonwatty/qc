import { PageContainer } from '@/components/layout/PageContainer'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <PageContainer title="Dashboard" description="Your relationship command center" className="space-y-8">
      {/* Quick Actions skeleton */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} variant="card" className="h-24" />
        ))}
      </div>

      {/* Reminders + Activity skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton variant="card" className="h-48" />
        <Skeleton variant="card" className="h-48" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} variant="card" className="h-28" />
        ))}
      </div>
    </PageContainer>
  )
}
