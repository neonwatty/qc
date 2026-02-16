'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

import { fadeIn } from '@/lib/animations'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { MoodSelector } from './MoodSelector'
import { updateCheckIn } from '@/app/(app)/checkin/actions'

interface ReflectionFormProps {
  coupleId: string
  userId: string
  checkInId: string
  onComplete: () => void
}

export function ReflectionForm({
  coupleId,
  userId,
  checkInId,
  onComplete,
}: ReflectionFormProps): React.ReactNode {
  const [moodAfter, setMoodAfter] = useState<number | null>(null)
  const [reflection, setReflection] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(): Promise<void> {
    if (moodAfter === null) return
    setIsSubmitting(true)

    if (checkInId) {
      await updateCheckIn({
        checkInId,
        moodAfter,
        reflection: reflection.trim() || undefined,
      })
    }

    setIsSubmitting(false)
    onComplete()
  }

  return (
    <div className="space-y-6">
      <motion.div variants={fadeIn} initial="initial" animate="animate">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              How are you feeling now?
            </CardTitle>
            <p className="text-center text-sm text-muted-foreground">
              Rate your mood after the discussion
            </p>
          </CardHeader>
          <CardContent>
            <MoodSelector
              onSelect={(mood) => setMoodAfter(mood)}
              label="Your mood after the check-in"
              showConfirm={false}
            />
          </CardContent>
        </Card>
      </motion.div>

      {moodAfter !== null && (
        <motion.div variants={fadeIn} initial="initial" animate="animate">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reflection</CardTitle>
              <p className="text-sm text-muted-foreground">
                What was the most valuable part of this check-in?
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Share your thoughts about this check-in..."
                className="min-h-[120px] resize-none"
                maxLength={2000}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {reflection.length}/2000
                </span>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  size="lg"
                >
                  {isSubmitting ? 'Saving...' : 'Continue'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
