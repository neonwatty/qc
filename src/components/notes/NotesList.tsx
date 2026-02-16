'use client'

import { useCallback, useMemo, useState, useTransition } from 'react'
import { Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { NoteCard } from '@/components/notes/NoteCard'
import { NoteEditor } from '@/components/notes/NoteEditor'
import { NoteFilters, type NoteFilterState } from '@/components/notes/NoteFilters'
import { useRealtimeCouple } from '@/hooks/useRealtimeCouple'
import { snakeToCamelObject } from '@/lib/utils'
import type { DbNote, Note, NotePrivacy } from '@/types'

import {
  createNote,
  updateNote,
  deleteNote,
  bulkDeleteNotes,
} from '@/app/(app)/notes/actions'

interface NotesListProps {
  initialNotes: Note[]
  coupleId: string
  currentUserId: string
}

export function NotesList({ initialNotes, coupleId, currentUserId }: NotesListProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  const [filters, setFilters] = useState<NoteFilterState>({
    privacy: 'all',
    tags: [],
    sortBy: 'newest',
    search: '',
  })

  // Realtime subscriptions
  useRealtimeCouple<DbNote>({
    table: 'notes',
    coupleId,
    onInsert: (record) => {
      const note = snakeToCamelObject<Note>(record as unknown as Record<string, unknown>)
      setNotes((prev) => {
        if (prev.some((n) => n.id === note.id)) return prev
        return [note, ...prev]
      })
    },
    onUpdate: (record) => {
      const note = snakeToCamelObject<Note>(record as unknown as Record<string, unknown>)
      setNotes((prev) => prev.map((n) => (n.id === note.id ? note : n)))
    },
    onDelete: (record) => {
      setNotes((prev) => prev.filter((n) => n.id !== record.id))
    },
  })

  // Collect all tags from notes for filter options
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>()
    for (const note of notes) {
      for (const tag of note.tags) {
        tagSet.add(tag)
      }
    }
    return Array.from(tagSet).sort()
  }, [notes])

  // Apply filters and sorting
  const filteredNotes = useMemo(() => {
    let result = [...notes]

    if (filters.privacy !== 'all') {
      result = result.filter((n) => n.privacy === filters.privacy)
    }

    if (filters.tags.length > 0) {
      result = result.filter((n) =>
        filters.tags.some((tag) => n.tags.includes(tag)),
      )
    }

    if (filters.search) {
      const query = filters.search.toLowerCase()
      result = result.filter(
        (n) =>
          n.content.toLowerCase().includes(query) ||
          n.tags.some((t) => t.toLowerCase().includes(query)),
      )
    }

    switch (filters.sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case 'updated':
        result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        break
    }

    return result
  }, [notes, filters])

  const toggleSelect = useCallback((noteId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(noteId)) {
        next.delete(noteId)
      } else {
        next.add(noteId)
      }
      return next
    })
  }, [])

  const handleCreate = useCallback(
    async (data: { content: string; privacy: NotePrivacy; tags: string[] }) => {
      const result = await createNote({
        coupleId,
        content: data.content,
        privacy: data.privacy,
        tags: data.tags,
        checkInId: null,
        categoryId: null,
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      setIsCreating(false)
    },
    [coupleId],
  )

  const handleUpdate = useCallback(
    async (data: { content: string; privacy: NotePrivacy; tags: string[] }) => {
      if (!editingNote) return

      const result = await updateNote({
        id: editingNote.id,
        content: data.content,
        privacy: data.privacy,
        tags: data.tags,
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      setEditingNote(null)
    },
    [editingNote],
  )

  const handleDelete = useCallback(async (noteId: string) => {
    const result = await deleteNote({ id: noteId })
    if (!result.success) {
      console.error('Failed to delete note:', result.error)
    }
  }, [])

  const handleBulkDelete = useCallback(() => {
    if (selectedIds.size === 0) return

    startTransition(async () => {
      const result = await bulkDeleteNotes({ ids: Array.from(selectedIds) })
      if (result.success) {
        setSelectedIds(new Set())
      }
    })
  }, [selectedIds])

  const isEditorOpen = isCreating || editingNote !== null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notes</h1>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={isPending}
              className="gap-1"
            >
              <Trash2 className="h-4 w-4" />
              Delete {selectedIds.size}
            </Button>
          )}
          <Button onClick={() => setIsCreating(true)} className="gap-1">
            <Plus className="h-4 w-4" />
            New Note
          </Button>
        </div>
      </div>

      <NoteFilters
        filters={filters}
        onFiltersChange={setFilters}
        availableTags={availableTags}
      />

      {filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <p className="text-muted-foreground">
            {notes.length === 0 ? 'No notes yet' : 'No notes match your filters'}
          </p>
          {notes.length === 0 && (
            <Button
              variant="outline"
              onClick={() => setIsCreating(true)}
              className="mt-4 gap-1"
            >
              <Plus className="h-4 w-4" />
              Create your first note
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              isAuthor={note.authorId === currentUserId}
              onEdit={setEditingNote}
              onDelete={handleDelete}
              selected={selectedIds.has(note.id)}
              onSelect={toggleSelect}
            />
          ))}
        </div>
      )}

      <Dialog open={isEditorOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreating(false)
          setEditingNote(null)
        }
      }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingNote ? 'Edit Note' : 'New Note'}
            </DialogTitle>
          </DialogHeader>
          {isEditorOpen && (
            <NoteEditor
              coupleId={coupleId}
              note={editingNote}
              onSave={editingNote ? handleUpdate : handleCreate}
              onCancel={() => {
                setIsCreating(false)
                setEditingNote(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
