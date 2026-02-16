'use client'

import { useCallback } from 'react'
import { Filter, X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { NotePrivacy } from '@/types'

export type SortOption = 'newest' | 'oldest' | 'updated'

export interface NoteFilterState {
  privacy: NotePrivacy | 'all'
  tags: string[]
  sortBy: SortOption
  search: string
}

interface NoteFiltersProps {
  filters: NoteFilterState
  onFiltersChange: (filters: NoteFilterState) => void
  availableTags: string[]
  className?: string
}

const PRIVACY_OPTIONS: { value: NotePrivacy | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'shared', label: 'Shared' },
  { value: 'private', label: 'Private' },
  { value: 'draft', label: 'Drafts' },
]

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'updated', label: 'Recently updated' },
]

export function NoteFilters({
  filters,
  onFiltersChange,
  availableTags,
  className,
}: NoteFiltersProps) {
  const updateFilter = useCallback(
    <K extends keyof NoteFilterState>(key: K, value: NoteFilterState[K]) => {
      onFiltersChange({ ...filters, [key]: value })
    },
    [filters, onFiltersChange],
  )

  const toggleTag = useCallback(
    (tag: string) => {
      const newTags = filters.tags.includes(tag)
        ? filters.tags.filter((t) => t !== tag)
        : [...filters.tags, tag]
      updateFilter('tags', newTags)
    },
    [filters.tags, updateFilter],
  )

  const clearFilters = useCallback(() => {
    onFiltersChange({ privacy: 'all', tags: [], sortBy: 'newest', search: '' })
  }, [onFiltersChange])

  const hasActiveFilters =
    filters.privacy !== 'all' ||
    filters.tags.length > 0 ||
    filters.search !== ''

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Search notes..."
            className="h-9 w-full max-w-xs rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value as SortOption)}
            className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="gap-1"
            >
              <X className="h-3 w-3" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRIVACY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => updateFilter('privacy', opt.value)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
              filters.privacy === opt.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {availableTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {availableTags.map((tag) => (
            <Badge
              key={tag}
              variant={filters.tags.includes(tag) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
