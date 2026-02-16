'use client'

import { useState, type FormEvent, type ReactNode } from 'react'

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
import type {
  LoveAction,
  LoveLanguage,
  LoveActionStatus,
  LoveActionFrequency,
  LoveActionDifficulty,
} from '@/types'

// --- Props ---

interface ActionFormProps {
  initialData?: LoveAction | null
  languages: LoveLanguage[]
  onSubmit: (data: ActionFormData) => Promise<void>
  onCancel: () => void
  submitting?: boolean
}

export interface ActionFormData {
  linkedLanguageId: string | null
  title: string
  description: string | null
  status: LoveActionStatus
  frequency: LoveActionFrequency
  difficulty: LoveActionDifficulty
}

const NONE_VALUE = '_none'

const STATUS_OPTIONS: { value: LoveActionStatus; label: string }[] = [
  { value: 'suggested', label: 'Suggested' },
  { value: 'planned', label: 'Planned' },
  { value: 'completed', label: 'Completed' },
  { value: 'recurring', label: 'Recurring' },
]

const FREQUENCY_OPTIONS: { value: LoveActionFrequency; label: string }[] = [
  { value: 'once', label: 'One-time' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'surprise', label: 'Surprise' },
]

const DIFFICULTY_OPTIONS: { value: LoveActionDifficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'challenging', label: 'Challenging' },
]

export function ActionForm({
  initialData,
  languages,
  onSubmit,
  onCancel,
  submitting = false,
}: ActionFormProps): ReactNode {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [linkedLanguageId, setLinkedLanguageId] = useState<string>(
    initialData?.linkedLanguageId ?? NONE_VALUE,
  )
  const [status, setStatus] = useState<LoveActionStatus>(initialData?.status ?? 'suggested')
  const [frequency, setFrequency] = useState<LoveActionFrequency>(
    initialData?.frequency ?? 'once',
  )
  const [difficulty, setDifficulty] = useState<LoveActionDifficulty>(
    initialData?.difficulty ?? 'easy',
  )

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await onSubmit({
      title: title.trim(),
      description: description.trim() || null,
      linkedLanguageId: linkedLanguageId === NONE_VALUE ? null : linkedLanguageId,
      status,
      frequency,
      difficulty,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="action-title">Title</Label>
        <Input
          id="action-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Write a love note"
          required
          maxLength={200}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="action-description">Description</Label>
        <Textarea
          id="action-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What does this action involve?"
          maxLength={2000}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Linked Love Language</Label>
        <Select value={linkedLanguageId} onValueChange={setLinkedLanguageId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE_VALUE}>None</SelectItem>
            {languages.map((lang) => (
              <SelectItem key={lang.id} value={lang.id}>
                {lang.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as LoveActionStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Frequency</Label>
          <Select value={frequency} onValueChange={(v) => setFrequency(v as LoveActionFrequency)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FREQUENCY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Difficulty</Label>
          <Select
            value={difficulty}
            onValueChange={(v) => setDifficulty(v as LoveActionDifficulty)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting || !title.trim()}>
          {submitting ? 'Saving...' : initialData ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  )
}
