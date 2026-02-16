'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

import { staggerContainer, staggerItem } from '@/lib/animations'
import { useCheckIn } from '@/contexts/CheckInContext'
import { useBookends } from '@/contexts/BookendsContext'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { FEELING_EMOJIS } from '@/types/bookends'
import type { CheckInSession } from '@/types/checkin'
import {
  completeCheckIn as completeCheckInAction,
  addActionItem as addActionItemAction,
} from '@/app/(app)/checkin/actions'

interface CheckInSummaryProps {
  session: CheckInSession
  coupleId: string
  userId: string
  onComplete: () => void
}

export function CheckInSummary({
  session,
  coupleId,
  userId,
  onComplete,
}: CheckInSummaryProps): React.ReactNode {
  const { completeCheckIn } = useCheckIn()
  const { openReflection } = useBookends()
  const [newActionTitle, setNewActionTitle] = useState('')
  const [isCompleting, setIsCompleting] = useState(false)
  const [actionItems, setActionItems] = useState<
    Array<{ id: string; title: string }>
  >([])

  async function handleAddAction(): Promise<void> {
    if (!newActionTitle.trim()) return

    const result = await addActionItemAction({
      checkInId: session.baseCheckIn.id,
      title: newActionTitle.trim(),
    })

    if ('id' in result) {
      setActionItems((prev) => [
        ...prev,
        { id: result.id, title: newActionTitle.trim() },
      ])
    }

    setNewActionTitle('')
  }

  async function handleComplete(): Promise<void> {
    setIsCompleting(true)

    if (session.baseCheckIn.id) {
      await completeCheckInAction({
        checkInId: session.baseCheckIn.id,
        moodAfter: session.baseCheckIn.moodAfter ?? 3,
        reflection: session.baseCheckIn.reflection ?? undefined,
      })
    }

    completeCheckIn()
    openReflection()
    setIsCompleting(false)
    onComplete()
  }

  const moodBefore = session.baseCheckIn.moodBefore
  const moodAfter = session.baseCheckIn.moodAfter
  const moodBeforeEmoji = moodBefore
    ? FEELING_EMOJIS[moodBefore - 1]
    : null
  const moodAfterEmoji = moodAfter
    ? FEELING_EMOJIS[moodAfter - 1]
    : null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Check-In Summary</CardTitle>
          <CardDescription>
            Review your session before completing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mood comparison */}
          <div className="flex items-center justify-around rounded-lg bg-muted/50 p-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Before</p>
              {moodBeforeEmoji && (
                <p className="text-2xl">{moodBeforeEmoji.emoji}</p>
              )}
              <p className="text-xs font-medium">
                {moodBeforeEmoji?.label ?? 'Not set'}
              </p>
            </div>
            <div className="text-2xl text-muted-foreground">→</div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">After</p>
              {moodAfterEmoji && (
                <p className="text-2xl">{moodAfterEmoji.emoji}</p>
              )}
              <p className="text-xs font-medium">
                {moodAfterEmoji?.label ?? 'Not set'}
              </p>
            </div>
          </div>

          {/* Categories discussed */}
          <div>
            <p className="mb-2 text-sm font-medium">Topics Discussed</p>
            <div className="flex flex-wrap gap-2">
              {session.selectedCategories.map((cat) => (
                <Badge key={cat} variant="secondary">
                  {cat}
                </Badge>
              ))}
            </div>
          </div>

          {/* Notes */}
          {session.draftNotes.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium">
                Notes ({session.draftNotes.length})
              </p>
              <motion.div
                className="space-y-2"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {session.draftNotes.map((note) => (
                  <motion.div
                    key={note.id}
                    variants={staggerItem}
                    className="rounded-lg bg-muted/50 p-3 text-sm"
                  >
                    {note.content}
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}

          {/* Reflection */}
          {session.baseCheckIn.reflection && (
            <div>
              <p className="mb-2 text-sm font-medium">Reflection</p>
              <p className="rounded-lg bg-muted/50 p-3 text-sm">
                {session.baseCheckIn.reflection}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Action Items</CardTitle>
          <CardDescription>
            Add any follow-up tasks from your discussion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Textarea
              value={newActionTitle}
              onChange={(e) => setNewActionTitle(e.target.value)}
              placeholder="e.g., Plan a date night this weekend"
              className="min-h-[44px] resize-none"
              rows={1}
            />
            <Button
              onClick={handleAddAction}
              size="sm"
              disabled={!newActionTitle.trim()}
            >
              Add
            </Button>
          </div>

          {actionItems.length > 0 && (
            <ul className="space-y-2">
              {actionItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-sm"
                >
                  <span className="text-primary">✓</span>
                  {item.title}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Button
        onClick={handleComplete}
        size="lg"
        className="w-full"
        disabled={isCompleting}
      >
        {isCompleting ? 'Completing...' : 'Complete Check-In'}
      </Button>
    </div>
  )
}
