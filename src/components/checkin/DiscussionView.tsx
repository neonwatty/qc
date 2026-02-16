'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'
import { fadeIn } from '@/lib/animations'
import { useCheckIn } from '@/contexts/CheckInContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { addNote } from '@/app/(app)/checkin/actions'

interface DiscussionViewProps {
  coupleId: string
  userId: string
  sessionDuration: number
  timeoutsPerPartner: number
  timeoutDuration: number
  turnBasedMode: boolean
  onComplete: () => void
}

export function DiscussionView({
  coupleId,
  userId,
  sessionDuration,
  timeoutsPerPartner,
  timeoutDuration,
  turnBasedMode,
  onComplete,
}: DiscussionViewProps): React.ReactNode {
  const { session, addDraftNote } = useCheckIn()
  const [timeLeft, setTimeLeft] = useState(sessionDuration * 60)
  const [isPaused, setIsPaused] = useState(false)
  const [timeoutsUsed, setTimeoutsUsed] = useState(0)
  const [noteContent, setNoteContent] = useState('')
  const [isMyTurn, setIsMyTurn] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isPaused || timeLeft <= 0) return

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPaused, timeLeft])

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  function handleTimeout(): void {
    if (timeoutsUsed >= timeoutsPerPartner) return
    setIsPaused(true)
    setTimeoutsUsed((prev) => prev + 1)

    setTimeout(() => {
      setIsPaused(false)
    }, timeoutDuration * 60 * 1000)
  }

  function handleToggleTurn(): void {
    setIsMyTurn((prev) => !prev)
  }

  async function handleAddNote(): Promise<void> {
    if (!noteContent.trim() || !session) return

    addDraftNote({
      coupleId,
      authorId: userId,
      checkInId: session.baseCheckIn.id,
      content: noteContent.trim(),
      privacy: 'shared',
      tags: [],
      categoryId: null,
    })

    if (session.baseCheckIn.id) {
      await addNote({
        checkInId: session.baseCheckIn.id,
        content: noteContent.trim(),
        privacy: 'shared',
        tags: [],
        categoryId: null,
      })
    }

    setNoteContent('')
  }

  const timerPercentage = (timeLeft / (sessionDuration * 60)) * 100
  const isLowTime = timeLeft < 300
  const categories = session?.selectedCategories ?? []

  return (
    <div className="space-y-4">
      {/* Timer */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Time Remaining</p>
              <p
                className={cn(
                  'text-3xl font-bold tabular-nums',
                  isLowTime && 'text-red-500',
                  isPaused && 'text-amber-500',
                )}
              >
                {formatTime(timeLeft)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPaused((p) => !p)}
              >
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleTimeout}
                disabled={timeoutsUsed >= timeoutsPerPartner}
              >
                Timeout ({timeoutsPerPartner - timeoutsUsed})
              </Button>
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              className={cn(
                'h-full rounded-full',
                isLowTime ? 'bg-red-500' : 'bg-primary',
              )}
              style={{ width: `${timerPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Turn indicator */}
      {turnBasedMode && (
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <p className="text-sm font-medium">
              {isMyTurn ? "It's your turn to share" : "It's your partner's turn"}
            </p>
            <Button variant="outline" size="sm" onClick={handleToggleTurn}>
              Switch Turn
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Categories */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Discussion Topics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Badge key={cat} variant="secondary">
                {cat}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Jot down a thought or key point..."
            className="min-h-[80px] resize-none"
          />
          <Button
            onClick={handleAddNote}
            size="sm"
            disabled={!noteContent.trim()}
          >
            Add Note
          </Button>

          {session?.draftNotes && session.draftNotes.length > 0 && (
            <motion.div
              variants={fadeIn}
              initial="initial"
              animate="animate"
              className="mt-4 space-y-2"
            >
              {session.draftNotes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-lg bg-muted/50 p-3 text-sm"
                >
                  {note.content}
                </div>
              ))}
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Complete */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onComplete}>
          Skip Discussion
        </Button>
        <Button onClick={onComplete}>
          Finish Discussion
        </Button>
      </div>
    </div>
  )
}
