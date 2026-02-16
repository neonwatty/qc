'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { CardHeader, CardTitle } from '@/components/ui/card'
import { PhotoUpload } from './PhotoUpload'
import type { MilestoneInput } from '@/hooks/useMilestones'
import type { MilestoneCategory, MilestoneRarity } from '@/types'

interface MilestoneCreatorProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (input: MilestoneInput) => Promise<void>
  isSubmitting?: boolean
  className?: string
}

const CATEGORY_OPTIONS: {
  id: MilestoneCategory
  name: string
  icon: string
  color: string
  bgColor: string
  description: string
}[] = [
  {
    id: 'communication',
    name: 'Communication',
    icon: '💬',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    description: 'Milestones related to how you talk and listen',
  },
  {
    id: 'intimacy',
    name: 'Intimacy',
    icon: '❤️',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    description: 'Deepening closeness and emotional bonds',
  },
  {
    id: 'growth',
    name: 'Growth',
    icon: '🌱',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    description: 'Personal and relationship development',
  },
  {
    id: 'relationship',
    name: 'Relationship',
    icon: '🎉',
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    description: 'Special moments and celebrations',
  },
  {
    id: 'adventure',
    name: 'Adventure',
    icon: '⭐',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    description: 'Shared experiences and explorations',
  },
  {
    id: 'milestone',
    name: 'Milestone',
    icon: '🎯',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    description: 'Shared objectives and achievements',
  },
  {
    id: 'custom',
    name: 'Custom',
    icon: '✨',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    description: 'Create your own category',
  },
]

const RARITY_OPTIONS: { id: MilestoneRarity; name: string; icon: string }[] = [
  { id: 'common', name: 'Common', icon: '⚪' },
  { id: 'rare', name: 'Rare', icon: '🔵' },
  { id: 'epic', name: 'Epic', icon: '🟣' },
  { id: 'legendary', name: 'Legendary', icon: '🟡' },
]

interface FormData {
  title: string
  description: string
  category: MilestoneCategory | ''
  icon: string
  photoFile: File | null
  rarity: MilestoneRarity
  points: number
}

const INITIAL_FORM: FormData = {
  title: '',
  description: '',
  category: '',
  icon: '',
  photoFile: null,
  rarity: 'common',
  points: 10,
}

export function MilestoneCreator({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  className,
}: MilestoneCreatorProps): React.ReactElement | null {
  const [formData, setFormData] = useState<FormData>({ ...INITIAL_FORM })
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

  function updateField(field: keyof FormData, value: unknown): void {
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

            <div className="space-y-6 p-6">
              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="e.g., First Month of Check-ins"
                  className={cn(
                    'w-full rounded-lg border px-4 py-2.5 text-sm transition-colors',
                    'focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20',
                    'dark:bg-gray-800 dark:text-gray-100',
                    errors.title ? 'border-red-300' : 'border-gray-300 dark:border-gray-700',
                  )}
                />
                {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Describe this milestone..."
                  rows={3}
                  className={cn(
                    'w-full resize-none rounded-lg border px-4 py-2.5 text-sm transition-colors',
                    'focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20',
                    'dark:bg-gray-800 dark:text-gray-100',
                    errors.description ? 'border-red-300' : 'border-gray-300 dark:border-gray-700',
                  )}
                />
                {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                {errors.category && <p className="mb-2 text-xs text-red-600">{errors.category}</p>}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {CATEGORY_OPTIONS.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => updateField('category', cat.id)}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border p-3 text-left transition-all',
                        formData.category === cat.id
                          ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                          : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600',
                      )}
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <span className="text-sm font-medium">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rarity */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Rarity</label>
                <div className="flex gap-2">
                  {RARITY_OPTIONS.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => updateField('rarity', r.id)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-all',
                        formData.rarity === r.id
                          ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                          : 'border-gray-200 hover:border-gray-300 dark:border-gray-700',
                      )}
                    >
                      <span>{r.icon}</span>
                      <span>{r.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Points */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Points: {formData.points}
                </label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={formData.points}
                  onChange={(e) => updateField('points', parseInt(e.target.value, 10))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>5</span>
                  <span>100</span>
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Photo / Icon</label>
                <PhotoUpload
                  value={formData.icon || null}
                  onFileSelect={(file) => {
                    updateField('photoFile', file)
                    updateField('icon', URL.createObjectURL(file))
                  }}
                  onEmojiSelect={(emoji) => {
                    updateField('icon', emoji)
                    updateField('photoFile', null)
                  }}
                  onRemove={() => {
                    updateField('icon', '')
                    updateField('photoFile', null)
                  }}
                  variant="compact"
                />
              </div>

              {/* Submit error */}
              {errors.submit && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20">{errors.submit}</div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
                <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                >
                  {isSubmitting ? 'Creating...' : 'Create Milestone'}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
