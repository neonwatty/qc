'use client'

import { useCallback, useState, type FormEvent, type ReactNode } from 'react'
import { X } from 'lucide-react'

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
import { Badge } from '@/components/ui/badge'
import type {
  LoveLanguage,
  LoveLanguageCategory,
  LoveLanguagePrivacy,
  LoveLanguageImportance,
} from '@/types'

// --- Props ---

interface LanguageFormProps {
  initialData?: LoveLanguage | null
  onSubmit: (data: LanguageFormData) => Promise<void>
  onCancel: () => void
  submitting?: boolean
}

export interface LanguageFormData {
  title: string
  description: string | null
  category: LoveLanguageCategory
  privacy: LoveLanguagePrivacy
  importance: LoveLanguageImportance
  examples: string[]
  tags: string[]
}

const CATEGORIES: { value: LoveLanguageCategory; label: string }[] = [
  { value: 'words', label: 'Words of Affirmation' },
  { value: 'acts', label: 'Acts of Service' },
  { value: 'gifts', label: 'Receiving Gifts' },
  { value: 'time', label: 'Quality Time' },
  { value: 'touch', label: 'Physical Touch' },
  { value: 'custom', label: 'Custom' },
]

const IMPORTANCE_LEVELS: { value: LoveLanguageImportance; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'essential', label: 'Essential' },
]

export function LanguageForm({
  initialData,
  onSubmit,
  onCancel,
  submitting = false,
}: LanguageFormProps): ReactNode {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [category, setCategory] = useState<LoveLanguageCategory>(initialData?.category ?? 'words')
  const [privacy, setPrivacy] = useState<LoveLanguagePrivacy>(initialData?.privacy ?? 'shared')
  const [importance, setImportance] = useState<LoveLanguageImportance>(
    initialData?.importance ?? 'medium',
  )
  const [examples, setExamples] = useState<string[]>(initialData?.examples ?? [])
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? [])
  const [newExample, setNewExample] = useState('')
  const [newTag, setNewTag] = useState('')

  const addExample = useCallback(() => {
    const trimmed = newExample.trim()
    if (trimmed && !examples.includes(trimmed)) {
      setExamples((prev) => [...prev, trimmed])
      setNewExample('')
    }
  }, [newExample, examples])

  const removeExample = useCallback((index: number) => {
    setExamples((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const addTag = useCallback(() => {
    const trimmed = newTag.trim().toLowerCase()
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed])
      setNewTag('')
    }
  }, [newTag, tags])

  const removeTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await onSubmit({
      title: title.trim(),
      description: description.trim() || null,
      category,
      privacy,
      importance,
      examples,
      tags,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Morning encouragement texts"
          required
          maxLength={200}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what this means to you..."
          maxLength={2000}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as LoveLanguageCategory)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Importance</Label>
          <Select
            value={importance}
            onValueChange={(v) => setImportance(v as LoveLanguageImportance)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {IMPORTANCE_LEVELS.map((i) => (
                <SelectItem key={i.value} value={i.value}>
                  {i.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Privacy</Label>
        <Select value={privacy} onValueChange={(v) => setPrivacy(v as LoveLanguagePrivacy)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="shared">Shared with partner</SelectItem>
            <SelectItem value="private">Private (only you)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Examples */}
      <div className="space-y-2">
        <Label>Examples</Label>
        <div className="flex gap-2">
          <Input
            value={newExample}
            onChange={(e) => setNewExample(e.target.value)}
            placeholder="Add an example..."
            maxLength={500}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addExample()
              }
            }}
          />
          <Button type="button" variant="outline" size="sm" onClick={addExample}>
            Add
          </Button>
        </div>
        {examples.length > 0 && (
          <ul className="space-y-1">
            {examples.map((ex, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <span className="flex-1">&bull; {ex}</span>
                <button
                  type="button"
                  onClick={() => removeExample(i)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add a tag..."
            maxLength={50}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addTag()
              }
            }}
          />
          <Button type="button" variant="outline" size="sm" onClick={addTag}>
            Add
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="gap-1 pr-1 text-xs">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="rounded-full hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
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
