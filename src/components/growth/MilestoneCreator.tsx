'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { CardHeader, CardTitle } from '@/components/ui/card'
import { MilestoneCreatorForm } from './MilestoneCreatorForm'
import { INITIAL_FORM } from './milestone-creator-config'
import type { MilestoneFormData } from './milestone-creator-config'
import type { MilestoneInput } from '@/hooks/useMilestones'
import type { MilestoneCategory } from '@/types'

interface MilestoneCreatorProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (input: MilestoneInput) => Promise<void>
  isSubmitting?: boolean
  className?: string
}

export function MilestoneCreator({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  className,
}: MilestoneCreatorProps): React.ReactElement | null {
  const [formData, setFormData] = useState<MilestoneFormData>({ ...INITIAL_FORM })
  const [showCelebration, setShowCelebration] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(): Promise<void> {
    if (!validateForm()) return

    try {
      await onSubmit({
        title: formData.title,
        description: formData.description,
        category: formData.category as MilestoneCategory,
        icon: formData.icon || '🏆',
        rarity: formData.rarity,
        points: formData.points,
        photoFile: formData.photoFile ?? undefined,
      })

      setShowCelebration(true)
      setTimeout(() => {
        handleClose()
      }, 2000)
    } catch {
      setErrors({ submit: 'Failed to create milestone. Please try again.' })
    }
  }

  function handleClose(): void {
    setFormData({ ...INITIAL_FORM })
    setErrors({})
    setShowCelebration(false)
    onClose()
  }

  function updateField(field: keyof MilestoneFormData, value: unknown): void {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose()
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={cn(
            'relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-900',
            className,
          )}
        >
          {/* Celebration overlay */}
          <AnimatePresence>
            {showCelebration && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-r from-purple-500/90 to-pink-500/90"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className="text-center text-white"
                >
                  <div className="mb-4 text-6xl">🎉</div>
                  <h2 className="mb-2 text-2xl font-bold">Milestone Created!</h2>
                  <p className="text-lg opacity-90">Congratulations on your achievement!</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <CardHeader className="border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 p-2">
                    <Plus className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl">Create New Milestone</CardTitle>
                </div>
                <Button variant="ghost" size="sm" onClick={handleClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>

            <MilestoneCreatorForm
              formData={formData}
              errors={errors}
              isSubmitting={isSubmitting}
              onUpdateField={updateField}
              onSubmit={handleSubmit}
              onClose={handleClose}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
