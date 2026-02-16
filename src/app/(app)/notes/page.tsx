import { requireAuth } from '@/lib/auth'

import { NotesPageContent } from './notes-content'

export default async function NotesPage() {
  const { user, supabase } = await requireAuth()

  const { data: profile } = await supabase.from('profiles').select('couple_id').eq('id', user.id).single()

  if (!profile?.couple_id) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-bold">No couple found</h2>
          <p className="text-sm text-muted-foreground">Complete onboarding to start using notes.</p>
        </div>
      </div>
    )
  }

  // Fetch notes for the couple
  // RLS ensures only couple members can see notes
  // Private notes: RLS + UI filter ensures only author sees them
  const { data: notes } = await supabase
    .from('notes')
    .select('*')
    .eq('couple_id', profile.couple_id)
    .order('created_at', { ascending: false })

  // Filter private notes to only show own private notes
  const visibleNotes = (notes ?? []).filter((note) => {
    if (note.privacy === 'private' && note.author_id !== user.id) return false
    if (note.privacy === 'draft' && note.author_id !== user.id) return false
    return true
  })

  return <NotesPageContent notes={visibleNotes} currentUserId={user.id} coupleId={profile.couple_id} />
}
