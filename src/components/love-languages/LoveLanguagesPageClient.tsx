'use client'

import { useCallback, useState, type ReactNode } from 'react'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useLoveLanguages } from '@/contexts/LoveLanguagesContext'
import { LanguageList } from '@/components/love-languages/LanguageList'
import { LanguageForm, type LanguageFormData } from '@/components/love-languages/LanguageForm'
import {
  createLanguage,
  updateLanguage,
  deleteLanguage,
} from '@/app/(app)/love-languages/server-actions'
import type { LoveLanguage } from '@/types'

export function LoveLanguagesPageClient(): ReactNode {
  const {
    languages,
    loading,
    error,
    currentUserId,
    coupleId,
    myLanguages,
    partnerSharedLanguages,
    refreshLanguages,
  } = useLoveLanguages()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingLanguage, setEditingLanguage] = useState<LoveLanguage | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleCreate = useCallback(() => {
    setEditingLanguage(null)
    setDialogOpen(true)
  }, [])

  const handleEdit = useCallback((language: LoveLanguage) => {
    setEditingLanguage(language)
    setDialogOpen(true)
  }, [])

  const handleDelete = useCallback(
    async (id: string) => {
      const result = await deleteLanguage(id)
      if (result.error) {
        console.error('Failed to delete language:', result.error)
        return
      }
      await refreshLanguages()
    },
    [refreshLanguages],
  )

  const handleSubmit = useCallback(
    async (data: LanguageFormData) => {
      if (!coupleId) return

      setSubmitting(true)
      try {
        if (editingLanguage) {
          const result = await updateLanguage(editingLanguage.id, data)
          if (result.error) {
            console.error('Failed to update language:', result.error)
            return
          }
        } else {
          const result = await createLanguage({ ...data, coupleId })
          if (result.error) {
            console.error('Failed to create language:', result.error)
            return
          }
        }
        setDialogOpen(false)
        setEditingLanguage(null)
        await refreshLanguages()
      } finally {
        setSubmitting(false)
      }
    },
    [coupleId, editingLanguage, refreshLanguages],
  )

  if (loading) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Loading love languages...
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-12 text-center text-destructive">
        <p>Failed to load love languages</p>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    )
  }

  if (!coupleId) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <p className="text-lg">Join a couple to use love languages</p>
        <p className="mt-1 text-sm">Invite your partner or accept an invitation first.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Your Languages</h2>
          <p className="text-sm text-muted-foreground">
            {myLanguages.length} language{myLanguages.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Language
        </Button>
      </div>

      <LanguageList
        languages={myLanguages}
        currentUserId={currentUserId}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {partnerSharedLanguages.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Partner&apos;s Shared Languages</h2>
            <p className="text-sm text-muted-foreground">
              {partnerSharedLanguages.length} shared language
              {partnerSharedLanguages.length !== 1 ? 's' : ''}
            </p>
          </div>

          <LanguageList
            languages={partnerSharedLanguages}
            currentUserId={currentUserId}
          />
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingLanguage ? 'Edit Love Language' : 'Add Love Language'}
            </DialogTitle>
            <DialogDescription>
              {editingLanguage
                ? 'Update the details of your love language.'
                : 'Describe how you prefer to give or receive love.'}
            </DialogDescription>
          </DialogHeader>
          <LanguageForm
            initialData={editingLanguage}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
            submitting={submitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
