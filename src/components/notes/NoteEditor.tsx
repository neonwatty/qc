'use client'

import { useCallback, useRef, useState, useTransition } from 'react'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Save,
  Strikethrough,
  Undo2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { TagManager } from '@/components/notes/TagManager'
import { useNoteEditor } from '@/hooks/useNoteEditor'
import { useNoteTags } from '@/hooks/useNoteTags'
import { countWords } from '@/lib/text-formatting'
import { cn } from '@/lib/utils'
import type { Note, NotePrivacy } from '@/types'

interface NoteEditorProps {
  coupleId: string
  note?: Note | null
  onSave: (data: {
    content: string
    privacy: NotePrivacy
    tags: string[]
  }) => Promise<void>
  onCancel: () => void
}

const PRIVACY_OPTIONS: { value: NotePrivacy; label: string; description: string }[] = [
  { value: 'shared', label: 'Shared', description: 'Visible to your partner' },
  { value: 'private', label: 'Private', description: 'Only you can see this' },
  { value: 'draft', label: 'Draft', description: 'Work in progress' },
]

export function NoteEditor({ coupleId, note, onSave, onCancel }: NoteEditorProps) {
  const [privacy, setPrivacy] = useState<NotePrivacy>(note?.privacy ?? 'shared')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const editor = useNoteEditor({ initialContent: note?.content ?? '' })
  const tagManager = useNoteTags({ coupleId })

  // Initialize tags from note if editing
  if (note && tagManager.selectedTags.length === 0 && note.tags.length > 0) {
    tagManager.setSelectedTags(note.tags)
  }

  const handleFormat = useCallback(
    (type: string) => {
      const textarea = textareaRef.current
      if (!textarea) return

      editor.setSelection(textarea.selectionStart, textarea.selectionEnd)

      switch (type) {
        case 'bold':
          editor.applyFormatting({ bold: true })
          break
        case 'italic':
          editor.applyFormatting({ italic: true })
          break
        case 'strikethrough':
          editor.applyFormatting({ strikethrough: true })
          break
        case 'bullet':
          editor.applyFormatting({ list: 'bullet' })
          break
        case 'ordered':
          editor.applyFormatting({ list: 'ordered' })
          break
        case 'blockquote':
          editor.applyFormatting({ blockquote: true })
          break
      }

      textarea.focus()
    },
    [editor],
  )

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const isMod = e.metaKey || e.ctrlKey

    if (isMod && e.key === 'b') {
      e.preventDefault()
      handleFormat('bold')
    } else if (isMod && e.key === 'i') {
      e.preventDefault()
      handleFormat('italic')
    } else if (isMod && e.key === 'z') {
      e.preventDefault()
      if (e.shiftKey) {
        editor.redo()
      } else {
        editor.undo()
      }
    } else if (isMod && e.key === 's') {
      e.preventDefault()
      handleSave()
    }
  }

  function handleSave() {
    if (!editor.content.trim()) {
      setError('Note content cannot be empty')
      return
    }

    setError(null)
    startTransition(async () => {
      try {
        await onSave({
          content: editor.content,
          privacy,
          tags: tagManager.selectedTags,
        })
      } catch {
        setError('Failed to save note. Please try again.')
      }
    })
  }

  const wordCount = countWords(editor.content)

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1 rounded-md border bg-muted/50 p-1">
        <FormatButton icon={Bold} label="Bold" onClick={() => handleFormat('bold')} />
        <FormatButton icon={Italic} label="Italic" onClick={() => handleFormat('italic')} />
        <FormatButton
          icon={Strikethrough}
          label="Strikethrough"
          onClick={() => handleFormat('strikethrough')}
        />
        <div className="mx-1 h-5 w-px bg-border" />
        <FormatButton icon={List} label="Bullet list" onClick={() => handleFormat('bullet')} />
        <FormatButton
          icon={ListOrdered}
          label="Numbered list"
          onClick={() => handleFormat('ordered')}
        />
        <FormatButton icon={Quote} label="Quote" onClick={() => handleFormat('blockquote')} />
        <div className="mx-1 h-5 w-px bg-border" />
        <FormatButton
          icon={Undo2}
          label="Undo"
          onClick={editor.undo}
          disabled={!editor.canUndo}
        />
        <FormatButton
          icon={Redo2}
          label="Redo"
          onClick={editor.redo}
          disabled={!editor.canRedo}
        />
      </div>

      <textarea
        ref={textareaRef}
        value={editor.content}
        onChange={(e) => editor.setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        onSelect={(e) => {
          const target = e.target as HTMLTextAreaElement
          editor.setSelection(target.selectionStart, target.selectionEnd)
        }}
        placeholder="Write your note... (supports **bold**, *italic*, - lists)"
        className="min-h-[200px] w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        rows={8}
      />

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
        <span>{editor.content.length} / 10,000 characters</span>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Privacy</label>
        <div className="flex flex-wrap gap-2">
          {PRIVACY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPrivacy(opt.value)}
              className={cn(
                'rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                privacy === opt.value
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border hover:bg-muted/50',
              )}
            >
              <div className="font-medium">{opt.label}</div>
              <div className="text-xs text-muted-foreground">{opt.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Tags</label>
        <TagManager
          tags={tagManager.selectedTags}
          allTags={tagManager.allTags}
          onAddTag={tagManager.addTag}
          onRemoveTag={tagManager.removeTag}
          getSuggestions={tagManager.getSuggestions}
          placeholder="Add tags to organize your notes..."
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isPending} className="gap-1">
          <Save className="h-4 w-4" />
          {isPending ? 'Saving...' : note ? 'Update Note' : 'Create Note'}
        </Button>
      </div>
    </div>
  )
}

interface FormatButtonProps {
  icon: typeof Bold
  label: string
  onClick: () => void
  disabled?: boolean
}

function FormatButton({ icon: Icon, label, onClick, disabled }: FormatButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={cn(
        'rounded p-1.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground',
        disabled && 'cursor-not-allowed opacity-40',
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}
