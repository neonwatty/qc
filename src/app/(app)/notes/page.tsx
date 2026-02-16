import { redirect } from 'next/navigation'

import { NotesList } from '@/components/notes/NotesList'
import { requireAuth } from '@/lib/auth'
import { snakeToCamelObject } from '@/lib/utils'
import type { DbNote, Note } from '@/types'

export const metadata = {
  title: 'Notes',
  description: 'Your shared and private notes',
}

export default async function NotesPage() {
  const { user, supabase } = await requireAuth()

  const { data: profile } = await supabase
    .from('profiles')
    .select('couple_id')
    .eq('id', user.id)
    .single()

  if (!profile?.couple_id) {
    redirect('/dashboard')
  }

  const coupleId = profile.couple_id

  const { data: dbNotes, error } = await supabase
    .from('notes')
    .select('*')
    .eq('couple_id', coupleId)
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold">Notes</h1>
        <p className="mt-4 text-muted-foreground">
          Failed to load notes. Please try again.
        </p>
      </div>
    )
  }

  const notes: Note[] = (dbNotes ?? []).map((row: DbNote) =>
    snakeToCamelObject<Note>(row as unknown as Record<string, unknown>),
  )

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <NotesList
        initialNotes={notes}
        coupleId={coupleId}
        currentUserId={user.id}
      />
    </div>
  )
}
