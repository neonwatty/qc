'use client'

import { useState, type ReactNode } from 'react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LanguageCard } from '@/components/love-languages/LanguageCard'
import type { LoveLanguage, LoveLanguageCategory, LoveLanguagePrivacy } from '@/types'

// --- Props ---

interface LanguageListProps {
  languages: LoveLanguage[]
  currentUserId: string | null
  onEdit?: (language: LoveLanguage) => void
  onDelete?: (id: string) => void
}

const ALL_VALUE = '_all'

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: ALL_VALUE, label: 'All Categories' },
  { value: 'words', label: 'Words of Affirmation' },
  { value: 'acts', label: 'Acts of Service' },
  { value: 'gifts', label: 'Receiving Gifts' },
  { value: 'time', label: 'Quality Time' },
  { value: 'touch', label: 'Physical Touch' },
  { value: 'custom', label: 'Custom' },
]

const PRIVACY_OPTIONS: { value: string; label: string }[] = [
  { value: ALL_VALUE, label: 'All Privacy' },
  { value: 'shared', label: 'Shared' },
  { value: 'private', label: 'Private' },
]

export function LanguageList({
  languages,
  currentUserId,
  onEdit,
  onDelete,
}: LanguageListProps): ReactNode {
  const [categoryFilter, setCategoryFilter] = useState<string>(ALL_VALUE)
  const [privacyFilter, setPrivacyFilter] = useState<string>(ALL_VALUE)

  const filtered = languages.filter((lang) => {
    if (categoryFilter !== ALL_VALUE && lang.category !== categoryFilter) return false
    if (privacyFilter !== ALL_VALUE && lang.privacy !== privacyFilter) return false
    return true
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={privacyFilter} onValueChange={setPrivacyFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Privacy" />
          </SelectTrigger>
          <SelectContent>
            {PRIVACY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <p className="text-lg">No love languages found</p>
          <p className="mt-1 text-sm">
            {languages.length > 0
              ? 'Try adjusting your filters'
              : 'Add your first love language to get started'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((language) => (
            <LanguageCard
              key={language.id}
              language={language}
              isOwn={language.userId === currentUserId}
              onEdit={language.userId === currentUserId ? onEdit : undefined}
              onDelete={language.userId === currentUserId ? onDelete : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}
