'use client'

import { useCallback, useRef, useState } from 'react'

import { applyFormat, removeFormat, type TextFormat } from '@/lib/text-formatting'

interface EditorSnapshot {
  content: string
  cursorPosition: number
}

interface UseNoteEditorOptions {
  initialContent?: string
  maxUndoHistory?: number
}

interface UseNoteEditorReturn {
  content: string
  setContent: (content: string) => void
  selection: { start: number; end: number }
  setSelection: (start: number, end: number) => void
  applyFormatting: (format: TextFormat) => void
  removeFormatting: () => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  reset: (content?: string) => void
  isDirty: boolean
}

export function useNoteEditor({
  initialContent = '',
  maxUndoHistory = 50,
}: UseNoteEditorOptions = {}): UseNoteEditorReturn {
  const [content, setContentState] = useState(initialContent)
  const [selection, setSelectionState] = useState({ start: 0, end: 0 })

  const undoStack = useRef<EditorSnapshot[]>([{ content: initialContent, cursorPosition: 0 }])
  const redoStack = useRef<EditorSnapshot[]>([])
  const [undoCount, setUndoCount] = useState(1)
  const [redoCount, setRedoCount] = useState(0)
  const initialContentRef = useRef(initialContent)

  const pushSnapshot = useCallback(
    (snapshot: EditorSnapshot) => {
      if (undoStack.current.length >= maxUndoHistory) {
        undoStack.current.shift()
      }
      undoStack.current.push(snapshot)
      redoStack.current = []
      setUndoCount(undoStack.current.length)
      setRedoCount(0)
    },
    [maxUndoHistory],
  )

  const setContent = useCallback(
    (newContent: string) => {
      pushSnapshot({ content: newContent, cursorPosition: selection.start })
      setContentState(newContent)
    },
    [pushSnapshot, selection.start],
  )

  const setSelection = useCallback((start: number, end: number) => {
    setSelectionState({ start, end })
  }, [])

  const applyFormatting = useCallback(
    (format: TextFormat) => {
      const { text } = applyFormat(content, selection.start, selection.end, format)
      pushSnapshot({ content: text, cursorPosition: selection.end })
      setContentState(text)
    },
    [content, selection, pushSnapshot],
  )

  const removeFormatting = useCallback(() => {
    const cleaned = removeFormat(content, selection.start, selection.end)
    pushSnapshot({ content: cleaned, cursorPosition: selection.end })
    setContentState(cleaned)
  }, [content, selection, pushSnapshot])

  const undo = useCallback(() => {
    if (undoStack.current.length <= 1) return

    const current = undoStack.current.pop()
    if (current) {
      redoStack.current.push(current)
    }

    const previous = undoStack.current[undoStack.current.length - 1]
    if (previous) {
      setContentState(previous.content)
      setSelectionState({ start: previous.cursorPosition, end: previous.cursorPosition })
    }

    setUndoCount(undoStack.current.length)
    setRedoCount(redoStack.current.length)
  }, [])

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return

    const next = redoStack.current.pop()
    if (next) {
      undoStack.current.push(next)
      setContentState(next.content)
      setSelectionState({ start: next.cursorPosition, end: next.cursorPosition })
    }

    setUndoCount(undoStack.current.length)
    setRedoCount(redoStack.current.length)
  }, [])

  const reset = useCallback(
    (newContent?: string) => {
      const resetContent = newContent ?? initialContentRef.current
      undoStack.current = [{ content: resetContent, cursorPosition: 0 }]
      redoStack.current = []
      setContentState(resetContent)
      setSelectionState({ start: 0, end: 0 })
      setUndoCount(1)
      setRedoCount(0)
      initialContentRef.current = resetContent
    },
    [],
  )

  const isDirty = content !== initialContentRef.current

  return {
    content,
    setContent,
    selection,
    setSelection,
    applyFormatting,
    removeFormatting,
    undo,
    redo,
    canUndo: undoCount > 1,
    canRedo: redoCount > 0,
    reset,
    isDirty,
  }
}
