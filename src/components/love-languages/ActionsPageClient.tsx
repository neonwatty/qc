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
import { ActionList } from '@/components/love-languages/ActionList'
import { ActionForm, type ActionFormData } from '@/components/love-languages/ActionForm'
import {
  createAction,
  updateAction,
  completeAction,
} from '@/app/(app)/love-languages/server-actions'
import type { LoveAction } from '@/types'

export function ActionsPageClient(): ReactNode {
  const {
    actions,
    languages,
    loading,
    error,
    coupleId,
    refreshActions,
  } = useLoveLanguages()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAction, setEditingAction] = useState<LoveAction | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleCreate = useCallback(() => {
    setEditingAction(null)
    setDialogOpen(true)
  }, [])

  const handleEdit = useCallback((action: LoveAction) => {
    setEditingAction(action)
    setDialogOpen(true)
  }, [])

  const handleDelete = useCallback(
    async (id: string) => {
      const result = await updateAction(id, { status: 'completed' })
      if (result.error) {
        console.error('Failed to delete action:', result.error)
      }
      await refreshActions()
    },
    [refreshActions],
  )

  const handleComplete = useCallback(
    async (id: string) => {
      const result = await completeAction(id)
      if (result.error) {
        console.error('Failed to complete action:', result.error)
        return
      }
      await refreshActions()
    },
    [refreshActions],
  )

  const handleSubmit = useCallback(
    async (data: ActionFormData) => {
      if (!coupleId) return

      setSubmitting(true)
      try {
        if (editingAction) {
          const result = await updateAction(editingAction.id, data)
          if (result.error) {
            console.error('Failed to update action:', result.error)
            return
          }
        } else {
          const result = await createAction({ ...data, coupleId })
          if (result.error) {
            console.error('Failed to create action:', result.error)
            return
          }
        }
        setDialogOpen(false)
        setEditingAction(null)
        await refreshActions()
      } finally {
        setSubmitting(false)
      }
    },
    [coupleId, editingAction, refreshActions],
  )

  if (loading) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Loading love actions...
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-12 text-center text-destructive">
        <p>Failed to load love actions</p>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    )
  }

  if (!coupleId) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <p className="text-lg">Join a couple to use love actions</p>
        <p className="mt-1 text-sm">Invite your partner or accept an invitation first.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Love Actions</h2>
          <p className="text-sm text-muted-foreground">
            {actions.length} action{actions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Action
        </Button>
      </div>

      <ActionList
        actions={actions}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onComplete={handleComplete}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingAction ? 'Edit Love Action' : 'Add Love Action'}
            </DialogTitle>
            <DialogDescription>
              {editingAction
                ? 'Update the details of this love action.'
                : 'Create a new action to express love.'}
            </DialogDescription>
          </DialogHeader>
          <ActionForm
            initialData={editingAction}
            languages={languages}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
            submitting={submitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
