'use client'

import { ArrowDownAZ, ArrowUpAZ } from 'lucide-react'

import type { MilestoneCategory } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CategoryFilterProps {
  value: MilestoneCategory | 'all'
  onChange: (value: MilestoneCategory | 'all') => void
  sortOrder: 'newest' | 'oldest'
  onSortChange: (value: 'newest' | 'oldest') => void
}

const FILTER_OPTIONS: { value: MilestoneCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'relationship', label: 'Relationship' },
  { value: 'communication', label: 'Communication' },
  { value: 'intimacy', label: 'Intimacy' },
  { value: 'growth', label: 'Growth' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'milestone', label: 'Milestone' },
  { value: 'custom', label: 'Custom' },
]

export function CategoryFilter({ value, onChange, sortOrder, onSortChange }: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-3">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by category" />
        </SelectTrigger>
        <SelectContent>
          {FILTER_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onSortChange(sortOrder === 'newest' ? 'oldest' : 'newest')}
        className="gap-1"
      >
        {sortOrder === 'newest' ? (
          <>
            <ArrowDownAZ className="h-4 w-4" />
            Newest
          </>
        ) : (
          <>
            <ArrowUpAZ className="h-4 w-4" />
            Oldest
          </>
        )}
      </Button>
    </div>
  )
}
