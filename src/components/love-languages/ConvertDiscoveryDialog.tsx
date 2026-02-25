'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { LoveLanguageCategory, LoveLanguageImportance } from '@/types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  discoveryText: string
  onConvert: (data: {
    title: string
    description: string
    category: LoveLanguageCategory
    importance: LoveLanguageImportance
  }) => Promise<void>
}

export function ConvertDiscoveryDialog({ open, onOpenChange, discoveryText, onConvert }: Props): React.ReactElement {
  const [title, setTitle] = useState(discoveryText.slice(0, 50))
  const [description, setDescription] = useState(discoveryText)
  const [category, setCategory] = useState<LoveLanguageCategory>('custom')
  const [importance, setImportance] = useState<LoveLanguageImportance>('medium')
  const [converting, setConverting] = useState(false)

  async function handleSubmit(): Promise<void> {
    setConverting(true)
    try {
      await onConvert({ title, description, category, importance })
      onOpenChange(false)
    } finally {
      setConverting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convert Discovery to Love Language</DialogTitle>
          <DialogDescription>
            Transform this discovery into a structured love language profile to track and act on.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Quality time together"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Expand on this discovery..."
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as LoveLanguageCategory)}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="words">Words of Affirmation</SelectItem>
                <SelectItem value="acts">Acts of Service</SelectItem>
                <SelectItem value="gifts">Receiving Gifts</SelectItem>
                <SelectItem value="time">Quality Time</SelectItem>
                <SelectItem value="touch">Physical Touch</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="importance">Importance</Label>
            <Select value={importance} onValueChange={(v) => setImportance(v as LoveLanguageImportance)}>
              <SelectTrigger id="importance">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="essential">Essential</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={converting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={converting || !title.trim()}>
            {converting ? 'Converting...' : 'Convert'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
