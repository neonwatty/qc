'use client'

import { useCallback, useState } from 'react'

import { NoteEditor } from '@/components/notes/NoteEditor'
import { NoteList } from '@/components/notes/NoteList'
import { useRealtimeCouple } from '@/hooks/useRealtimeCouple'
import type { DbNote } from '@/types'

import { deleteNoteById } from './actions'

type Props = {
  notes: DbNote[]
  currentUserId: string
  coupleId: string
}

export function NotesPageContent({ notes: initialNotes, currentUserId, coupleId }: Props) {
  const [notes, setNotes] = useState<DbNote[]>(initialNotes)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<DbNote | null>(null)

  // Realtime sync for shared notes
  useRealtimeCouple<DbNote>({
    table: 'notes',
    coupleId,
    onInsert: (record) => {
      // Only show if it passes privacy filter
      if (record.privacy === 'private' && record.author_id !== currentUserId) return
      if (record.privacy === 'draft' && record.author_id !== currentUserId) return
      setNotes((prev) => [record, ...prev])
    },
    onUpdate: (record) => {
      setNotes((prev) => prev.map((n) => (n.id === record.id ? record : n)))
    },
    onDelete: (record) => {
      setNotes((prev) => prev.filter((n) => n.id !== record.id))
    },
  })

  const handleSelect = useCallback((note: DbNote) => {
    setEditingNote(note)
    setEditorOpen(true)
  }, [])

  const handleDelete = useCallback((note: DbNote) => {
    // Optimistically remove from UI
    setNotes((prev) => prev.filter((n) => n.id !== note.id))

    deleteNoteById(note.id).then(({ error }) => {
      if (error) {
        // Re-add the note on failure
        setNotes((prev) => [...prev, note].sort((a, b) => b.created_at.localeCompare(a.created_at)))
      }
    })
  }, [])

  const handleNewNote = useCallback(() => {
    setEditingNote(null)
    setEditorOpen(true)
  }, [])

  const handleClose = useCallback(() => {
    setEditorOpen(false)
    setEditingNote(null)
  }, [])

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Notes</h1>
          <p className="mt-1 text-sm text-muted-foreground">Keep track of your thoughts, insights, and reflections</p>
        </div>
        <button
          onClick={handleNewNote}
          className="touch-target gradient-primary flex items-center gap-2 rounded-xl px-4 py-2.5 font-semibold text-white transition-opacity hover:opacity-90"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Note
        </button>
      </div>

      {/* Notes list */}
      <NoteList notes={notes} currentUserId={currentUserId} onSelect={handleSelect} onDelete={handleDelete} />

      {/* Editor modal */}
      <NoteEditor note={editingNote} isOpen={editorOpen} onClose={handleClose} />
    </div>
  )
}
