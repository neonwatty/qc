'use client'

import { useCallback, useState } from 'react'
import { Edit2, Eye, EyeOff, FileText, Lock, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { toPlainText } from '@/lib/text-formatting'
import { cn } from '@/lib/utils'
import type { Note, NotePrivacy } from '@/types'

interface NoteCardProps {
  note: Note
  isAuthor: boolean
  onEdit: (note: Note) => void
  onDelete: (noteId: string) => void
  selected?: boolean
  onSelect?: (noteId: string) => void
}

const PRIVACY_CONFIG: Record<NotePrivacy, { icon: typeof Eye; label: string; className: string }> = {
  shared: {
    icon: Eye,
    label: 'Shared',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  private: {
    icon: Lock,
    label: 'Private',
    className: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  draft: {
    icon: EyeOff,
    label: 'Draft',
    className: 'bg-gray-100 text-gray-600 border-gray-200',
  },
}

const PREVIEW_LENGTH = 150

export function NoteCard({
  note,
  isAuthor,
  onEdit,
  onDelete,
  selected = false,
  onSelect,
}: NoteCardProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  const privacyInfo = PRIVACY_CONFIG[note.privacy]
  const PrivacyIcon = privacyInfo.icon
  const plainContent = toPlainText(note.content)
  const preview =
    plainContent.length > PREVIEW_LENGTH
      ? plainContent.slice(0, PREVIEW_LENGTH) + '...'
      : plainContent

  const formattedDate = new Date(note.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const handleDelete = useCallback(() => {
    if (showConfirmDelete) {
      onDelete(note.id)
      setShowConfirmDelete(false)
    } else {
      setShowConfirmDelete(true)
      setTimeout(() => setShowConfirmDelete(false), 3000)
    }
  }, [showConfirmDelete, onDelete, note.id])

  return (
    <Card
      className={cn(
        'group relative transition-all',
        selected && 'ring-2 ring-primary',
        !isAuthor && 'opacity-90',
      )}
    >
      {onSelect && (
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(note.id)}
          className="absolute left-3 top-3 z-10 h-4 w-4 rounded border-gray-300"
          aria-label={`Select note`}
        />
      )}

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <Badge
              variant="outline"
              className={cn('gap-1 text-xs', privacyInfo.className)}
            >
              <PrivacyIcon className="h-3 w-3" />
              {privacyInfo.label}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground">{formattedDate}</span>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {preview}
        </p>

        {note.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {note.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      {isAuthor && (
        <CardFooter className="gap-2 pt-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(note)}
            className="gap-1"
          >
            <Edit2 className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant={showConfirmDelete ? 'destructive' : 'ghost'}
            size="sm"
            onClick={handleDelete}
            className="gap-1"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {showConfirmDelete ? 'Confirm' : 'Delete'}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
