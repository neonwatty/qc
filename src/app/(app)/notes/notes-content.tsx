'use client'

import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import { NoteEditor } from '@/components/notes/NoteEditor'
import { NoteList } from '@/components/notes/NoteList'
import { PageContainer } from '@/components/layout/PageContainer'
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
        toast.error('Failed to delete note')
        // Re-add the note on failure
        setNotes((prev) => [...prev, note].sort((a, b) => b.created_at.localeCompare(a.created_at)))
      } else {
        toast.success('Note deleted')
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

  const newNoteButton = (
    <button
      onClick={handleNewNote}
      className="touch-target gradient-primary flex items-center gap-2 rounded-xl px-4 py-2.5 font-semibold text-white transition-opacity hover:opacity-90"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      New Note
    </button>
  )

  return (
    <PageContainer
      title="Notes"
      description="Keep track of your thoughts, insights, and reflections"
      action={newNoteButton}
    >
      {/* Notes list */}
      <NoteList notes={notes} currentUserId={currentUserId} onSelect={handleSelect} onDelete={handleDelete} />

      {/* Editor modal */}
      <NoteEditor note={editingNote} isOpen={editorOpen} onClose={handleClose} />
    </PageContainer>
  )
}
