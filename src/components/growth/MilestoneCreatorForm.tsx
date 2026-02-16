'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { PhotoUpload } from './PhotoUpload'
import { CATEGORY_OPTIONS, RARITY_OPTIONS } from './milestone-creator-config'
import type { MilestoneFormData } from './milestone-creator-config'

interface MilestoneCreatorFormProps {
  formData: MilestoneFormData
  errors: Record<string, string>
  isSubmitting: boolean
  onUpdateField: (field: keyof MilestoneFormData, value: unknown) => void
  onSubmit: () => void
  onClose: () => void
}

function CategoryGrid({
  selected,
  onSelect,
}: {
  selected: string
  onSelect: (id: string) => void
}): React.ReactElement {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {CATEGORY_OPTIONS.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={cn(
            'flex items-center gap-2 rounded-lg border p-3 text-left transition-all',
            selected === cat.id
              ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
              : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600',
          )}
        >
          <span className="text-lg">{cat.icon}</span>
          <span className="text-sm font-medium">{cat.name}</span>
        </button>
      ))}
    </div>
  )
}

function RaritySelector({
  selected,
  onSelect,
}: {
  selected: string
  onSelect: (id: string) => void
}): React.ReactElement {
  return (
    <div className="flex gap-2">
      {RARITY_OPTIONS.map((r) => (
        <button
          key={r.id}
          onClick={() => onSelect(r.id)}
          className={cn(
            'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-all',
            selected === r.id
              ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
              : 'border-gray-200 hover:border-gray-300 dark:border-gray-700',
          )}
        >
          <span>{r.icon}</span>
          <span>{r.name}</span>
        </button>
      ))}
    </div>
  )
}

export function MilestoneCreatorForm({
  formData,
  errors,
  isSubmitting,
  onUpdateField,
  onSubmit,
  onClose,
}: MilestoneCreatorFormProps): React.ReactElement {
  return (
    <div className="space-y-6 p-6">
      {/* Title */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => onUpdateField('title', e.target.value)}
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
          onChange={(e) => onUpdateField('description', e.target.value)}
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
        <CategoryGrid selected={formData.category} onSelect={(id) => onUpdateField('category', id)} />
      </div>

      {/* Rarity */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Rarity</label>
        <RaritySelector selected={formData.rarity} onSelect={(id) => onUpdateField('rarity', id)} />
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
          onChange={(e) => onUpdateField('points', parseInt(e.target.value, 10))}
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
            onUpdateField('photoFile', file)
            onUpdateField('icon', URL.createObjectURL(file))
          }}
          onEmojiSelect={(emoji) => {
            onUpdateField('icon', emoji)
            onUpdateField('photoFile', null)
          }}
          onRemove={() => {
            onUpdateField('icon', '')
            onUpdateField('photoFile', null)
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
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
        >
          {isSubmitting ? 'Creating...' : 'Create Milestone'}
        </Button>
      </div>
    </div>
  )
}
