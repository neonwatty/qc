'use client'

import { useState, useMemo } from 'react'

import type { DbNote } from '@/types'

import { NoteCard } from './NoteCard'

type NoteFilter = 'all' | 'shared' | 'private' | 'draft'

type Props = {
  notes: DbNote[]
  currentUserId: string
  onSelect: (note: DbNote) => void
  onDelete: (note: DbNote) => void
}

export function NoteList({ notes, currentUserId, onSelect, onDelete }: Props) {
  const [filter, setFilter] = useState<NoteFilter>('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return notes.filter((note) => {
      if (filter !== 'all' && note.privacy !== filter) return false
      if (search) {
        const term = search.toLowerCase()
        const matchContent = note.content.toLowerCase().includes(term)
        const matchTag = note.tags.some((t) => t.toLowerCase().includes(term))
        if (!matchContent && !matchTag) return false
      }
      return true
    })
  }, [notes, filter, search])

  const FILTERS: { value: NoteFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'shared', label: 'Shared' },
    { value: 'private', label: 'Private' },
    { value: 'draft', label: 'Drafts' },
  ]

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="search"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mobile-input w-full rounded-xl border border-border bg-input py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`touch-target rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                filter === f.value
                  ? 'gradient-primary text-white'
                  : 'border border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              isOwn={note.author_id === currentUserId}
              onSelect={onSelect}
              onDelete={note.author_id === currentUserId ? onDelete : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <svg
            className="mx-auto mb-4 h-12 w-12 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          <h3 className="mb-1 text-lg font-medium">No notes found</h3>
          <p className="text-sm text-muted-foreground">
            {search ? 'Try adjusting your search terms' : 'Start by creating your first note'}
          </p>
        </div>
      )}
    </div>
  )
}
