'use client'

import { useActionState } from 'react'
import { useEffect, useRef } from 'react'

import type { Milestone, MilestoneCategory, MilestoneRarity } from '@/types'
import { createMilestone, updateMilestone } from '@/app/(app)/growth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface MilestoneFormProps {
  milestone: Milestone | null
  coupleId: string
  onClose: () => void
}

const CATEGORIES: { value: MilestoneCategory; label: string }[] = [
  { value: 'relationship', label: 'Relationship' },
  { value: 'communication', label: 'Communication' },
  { value: 'intimacy', label: 'Intimacy' },
  { value: 'growth', label: 'Growth' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'milestone', label: 'Milestone' },
  { value: 'custom', label: 'Custom' },
]

const RARITIES: { value: MilestoneRarity; label: string; points: number }[] = [
  { value: 'common', label: 'Common', points: 10 },
  { value: 'rare', label: 'Rare', points: 25 },
  { value: 'epic', label: 'Epic', points: 50 },
  { value: 'legendary', label: 'Legendary', points: 100 },
]

const ICONS = ['🌟', '💕', '🎯', '🏆', '🌈', '🔥', '💎', '🎉', '🌱', '✨', '🦋', '🌸']

interface FormState {
  success: boolean
  error?: string
}

const initialState: FormState = { success: false }

async function formAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const id = formData.get('id') as string
  const result = id
    ? await updateMilestone(formData)
    : await createMilestone(formData)
  return result
}

export function MilestoneForm({ milestone, coupleId, onClose }: MilestoneFormProps) {
  const [state, dispatch, isPending] = useActionState(formAction, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.success) {
      onClose()
    }
  }, [state.success, onClose])

  const defaultRarity = milestone?.rarity ?? 'common'
  const defaultPoints = milestone?.points ?? RARITIES.find((r) => r.value === defaultRarity)?.points ?? 10

  return (
    <form ref={formRef} action={dispatch} className="space-y-4">
      {milestone && <input type="hidden" name="id" value={milestone.id} />}

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          required
          maxLength={200}
          defaultValue={milestone?.title ?? ''}
          placeholder="e.g., First Anniversary"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          maxLength={2000}
          defaultValue={milestone?.description ?? ''}
          placeholder="What makes this milestone special?"
          rows={3}
        />
      </div>

      {/* Category + Rarity row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            name="category"
            defaultValue={milestone?.category ?? 'relationship'}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Rarity</Label>
          <Select name="rarity" defaultValue={defaultRarity}>
            <SelectTrigger>
              <SelectValue placeholder="Select rarity" />
            </SelectTrigger>
            <SelectContent>
              {RARITIES.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label} ({r.points} pts)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Icon picker */}
      <div className="space-y-2">
        <Label>Icon</Label>
        <input type="hidden" name="icon" id="icon-input" defaultValue={milestone?.icon ?? '🌟'} />
        <div className="flex flex-wrap gap-2">
          {ICONS.map((icon) => (
            <IconButton key={icon} icon={icon} defaultIcon={milestone?.icon ?? '🌟'} />
          ))}
        </div>
      </div>

      {/* Date */}
      <div className="space-y-2">
        <Label htmlFor="achievedAt">Date Achieved</Label>
        <Input
          id="achievedAt"
          name="achievedAt"
          type="date"
          defaultValue={
            milestone?.achievedAt
              ? new Date(milestone.achievedAt).toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0]
          }
        />
      </div>

      {/* Points (hidden, auto-set from rarity) */}
      <input type="hidden" name="points" value={defaultPoints} />

      {/* Error display */}
      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? milestone ? 'Saving...' : 'Creating...'
            : milestone ? 'Save Changes' : 'Create Milestone'}
        </Button>
      </div>
    </form>
  )
}

interface IconButtonProps {
  icon: string
  defaultIcon: string
}

function IconButton({ icon, defaultIcon }: IconButtonProps) {
  function handleClick() {
    const input = document.getElementById('icon-input') as HTMLInputElement
    if (input) input.value = icon

    // Update visual selection
    document.querySelectorAll('[data-icon-btn]').forEach((el) => {
      el.classList.remove('ring-2', 'ring-primary', 'bg-primary/10')
    })
    const btn = document.querySelector(`[data-icon-btn="${icon}"]`)
    btn?.classList.add('ring-2', 'ring-primary', 'bg-primary/10')
  }

  return (
    <button
      type="button"
      data-icon-btn={icon}
      onClick={handleClick}
      className={`flex h-9 w-9 items-center justify-center rounded-md border text-lg transition-colors hover:bg-muted ${
        icon === defaultIcon ? 'ring-2 ring-primary bg-primary/10' : ''
      }`}
    >
      {icon}
    </button>
  )
}
