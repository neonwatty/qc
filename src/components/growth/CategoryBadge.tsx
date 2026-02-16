import { cn } from '@/lib/utils'
import type { MilestoneCategory } from '@/types'

interface CategoryBadgeProps {
  category: MilestoneCategory
}

const CATEGORY_CONFIG: Record<MilestoneCategory, { label: string; className: string }> = {
  relationship: { label: 'Relationship', className: 'bg-pink-50 text-pink-700 border-pink-200' },
  communication: { label: 'Communication', className: 'bg-sky-50 text-sky-700 border-sky-200' },
  intimacy: { label: 'Intimacy', className: 'bg-rose-50 text-rose-700 border-rose-200' },
  growth: { label: 'Growth', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  adventure: { label: 'Adventure', className: 'bg-orange-50 text-orange-700 border-orange-200' },
  milestone: { label: 'Milestone', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  custom: { label: 'Custom', className: 'bg-gray-50 text-gray-700 border-gray-200' },
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const config = CATEGORY_CONFIG[category]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
        config.className,
      )}
    >
      {config.label}
    </span>
  )
}
