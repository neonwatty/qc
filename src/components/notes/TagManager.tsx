'use client'

import { useCallback, useRef, useState } from 'react'
import { X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface TagManagerProps {
  tags: string[]
  allTags: string[]
  onAddTag: (tag: string) => void
  onRemoveTag: (tag: string) => void
  getSuggestions: (query: string) => string[]
  placeholder?: string
  maxTags?: number
  disabled?: boolean
}

export function TagManager({
  tags,
  allTags,
  onAddTag,
  onRemoveTag,
  getSuggestions,
  placeholder = 'Add a tag...',
  maxTags = 20,
  disabled = false,
}: TagManagerProps) {
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  const suggestions = getSuggestions(inputValue)

  const handleAddTag = useCallback(
    (tag: string) => {
      if (tags.length >= maxTags) return
      onAddTag(tag)
      setInputValue('')
      setShowSuggestions(false)
      setHighlightedIndex(-1)
      inputRef.current?.focus()
    },
    [tags.length, maxTags, onAddTag],
  )

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        handleAddTag(suggestions[highlightedIndex])
      } else if (inputValue.trim()) {
        handleAddTag(inputValue.trim())
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onRemoveTag(tags[tags.length - 1])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0,
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1,
      )
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setHighlightedIndex(-1)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1 pr-1">
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => onRemoveTag(tag)}
                className="rounded-full p-0.5 hover:bg-muted"
                aria-label={`Remove tag ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}
      </div>

      {!disabled && tags.length < maxTags && (
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
              setShowSuggestions(true)
              setHighlightedIndex(-1)
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              setTimeout(() => setShowSuggestions(false), 200)
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />

          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded-md border bg-popover p-1 shadow-md">
              {suggestions.map((suggestion, index) => (
                <li key={suggestion}>
                  <button
                    type="button"
                    className={cn(
                      'w-full rounded-sm px-2 py-1.5 text-left text-sm',
                      index === highlightedIndex
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-accent/50',
                    )}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      handleAddTag(suggestion)
                    }}
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tags.length >= maxTags && (
        <p className="text-xs text-muted-foreground">
          Maximum of {maxTags} tags reached
        </p>
      )}
    </div>
  )
}
