import { PageContainer } from '@/components/layout/PageContainer'
import { SkeletonGroup } from '@/components/ui/skeleton'

export default function LoveLanguagesLoading() {
  return (
    <PageContainer title="Love Languages" description="Discover and share the unique ways you feel loved">
      <SkeletonGroup count={3} variant="card" className="h-36" />
    </PageContainer>
  )
}
