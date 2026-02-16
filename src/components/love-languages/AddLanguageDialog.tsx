'use client'

import { useState, useEffect } from 'react'
import type { LoveLanguage, LoveLanguageCategory, LoveLanguageImportance, LoveLanguagePrivacy } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Plus, X } from 'lucide-react'

interface AddLanguageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (language: {
    title: string
    description: string | null
    category: LoveLanguageCategory
    privacy: LoveLanguagePrivacy
    importance: LoveLanguageImportance
    examples: string[]
    tags: string[]
  }) => void
  initialLanguage?: LoveLanguage
}

const CATEGORY_OPTIONS: { value: LoveLanguageCategory; label: string; emoji: string }[] = [
  { value: 'words', label: 'Words of Affirmation', emoji: '\uD83D\uDCAC' },
  { value: 'acts', label: 'Acts of Service', emoji: '\uD83E\uDD1D' },
  { value: 'gifts', label: 'Receiving Gifts', emoji: '\uD83C\uDF81' },
  { value: 'time', label: 'Quality Time', emoji: '\u23F0' },
  { value: 'touch', label: 'Physical Touch', emoji: '\uD83E\uDD17' },
  { value: 'custom', label: 'Custom', emoji: '\u2728' },
]

export function AddLanguageDialog({
  open,
  onOpenChange,
  onSubmit,
  initialLanguage,
}: AddLanguageDialogProps): React.ReactNode {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<LoveLanguageCategory>('custom')
  const [importance, setImportance] = useState<LoveLanguageImportance>('medium')
  const [privacy, setPrivacy] = useState<LoveLanguagePrivacy>('private')
  const [examples, setExamples] = useState<string[]>([''])
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    if (initialLanguage) {
      setTitle(initialLanguage.title)
      setDescription(initialLanguage.description ?? '')
      setCategory(initialLanguage.category)
      setImportance(initialLanguage.importance)
      setPrivacy(initialLanguage.privacy)
      setExamples(initialLanguage.examples.length > 0 ? initialLanguage.examples : [''])
      setTags(initialLanguage.tags)
    } else {
      setTitle('')
      setDescription('')
      setCategory('custom')
      setImportance('medium')
      setPrivacy('private')
      setExamples([''])
      setTags([])
    }
  }, [initialLanguage, open])

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault()
    const filteredExamples = examples.filter((ex) => ex.trim() !== '')
    onSubmit({
      title,
      description: description || null,
      category,
      importance,
      privacy,
      examples: filteredExamples,
      tags,
    })
    onOpenChange(false)
  }

  function addExample(): void {
    setExamples([...examples, ''])
  }

  function updateExample(index: number, value: string): void {
    const next = [...examples]
    next[index] = value
    setExamples(next)
  }

  function removeExample(index: number): void {
    setExamples(examples.filter((_, i) => i !== index))
  }

  function addTag(): void {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{initialLanguage ? 'Edit' : 'Add'} Love Language</DialogTitle>
            <DialogDescription>Describe a specific way you feel loved and appreciated</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="ll-title">Title *</Label>
              <Input
                id="ll-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Morning words of encouragement"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ll-desc">Description</Label>
              <Textarea
                id="ll-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this means to you..."
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as LoveLanguageCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="flex items-center gap-2">
                        <span>{opt.emoji}</span>
                        <span>{opt.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Importance</Label>
              <RadioGroup value={importance} onValueChange={(v) => setImportance(v as LoveLanguageImportance)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="ll-low" />
                  <Label htmlFor="ll-low">Low</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="ll-med" />
                  <Label htmlFor="ll-med">Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="ll-hi" />
                  <Label htmlFor="ll-hi">High</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="essential" id="ll-ess" />
                  <Label htmlFor="ll-ess">Essential</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid gap-2">
              <Label>Privacy</Label>
              <RadioGroup value={privacy} onValueChange={(v) => setPrivacy(v as LoveLanguagePrivacy)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="ll-priv" />
                  <Label htmlFor="ll-priv">Private</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="shared" id="ll-shared" />
                  <Label htmlFor="ll-shared">Shared with partner</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid gap-2">
              <Label>Examples (optional)</Label>
              {examples.map((example, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={example}
                    onChange={(e) => updateExample(index, e.target.value)}
                    placeholder="Add a specific example..."
                  />
                  {examples.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeExample(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addExample} className="w-fit">
                <Plus className="h-4 w-4 mr-1" />
                Add Example
              </Button>
            </div>

            <div className="grid gap-2">
              <Label>Tags (optional)</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                      <button
                        type="button"
                        onClick={() => setTags(tags.filter((t) => t !== tag))}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title}>
              {initialLanguage ? 'Save Changes' : 'Add Love Language'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
