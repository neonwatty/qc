'use client'

import { useMemo, useState } from 'react'

import type { Milestone, MilestoneCategory } from '@/types'

type SortOrder = 'newest' | 'oldest'
type CategoryFilter = MilestoneCategory | 'all'

interface UseMilestonesReturn {
  filtered: Milestone[]
  categoryFilter: CategoryFilter
  setCategoryFilter: (value: CategoryFilter) => void
  sortOrder: SortOrder
  setSortOrder: (value: SortOrder) => void
}

export function useMilestones(milestones: Milestone[]): UseMilestonesReturn {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')

  const filtered = useMemo(() => {
    let result = [...milestones]

    // Filter by category
    if (categoryFilter !== 'all') {
      result = result.filter((m) => m.category === categoryFilter)
    }

    // Sort by achieved_at
    result.sort((a, b) => {
      const dateA = a.achievedAt ? new Date(a.achievedAt).getTime() : 0
      const dateB = b.achievedAt ? new Date(b.achievedAt).getTime() : 0

      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
    })

    return result
  }, [milestones, categoryFilter, sortOrder])

  return {
    filtered,
    categoryFilter,
    setCategoryFilter,
    sortOrder,
    setSortOrder,
  }
}
