'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'
import { fadeIn, scaleIn } from '@/lib/animations'
import { useBookends } from '@/contexts/BookendsContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { FEELING_EMOJIS } from '@/types/bookends'

interface QuickReflectionProps {
  sessionId: string
  userId: string
}

export function QuickReflection({
  sessionId,
  userId,
}: QuickReflectionProps): React.ReactNode {
  const { submitReflection, isReflectionModalOpen, closeReflection } =
    useBookends()
  const [feelingAfter, setFeelingAfter] = useState<number | null>(null)
  const [gratitude, setGratitude] = useState('')
  const [keyTakeaway, setKeyTakeaway] = useState('')
  const [shareWithPartner, setShareWithPartner] = useState(true)

  if (!isReflectionModalOpen) return null

  function handleSubmit(): void {
    if (feelingAfter === null) return

    submitReflection({
      sessionId,
      authorId: userId,
      feelingBefore: 3,
      feelingAfter,
      gratitude: gratitude.trim(),
      keyTakeaway: keyTakeaway.trim(),
      shareWithPartner,
    })
  }

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      exit="exit"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <motion.div variants={scaleIn} className="w-full max-w-lg">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Quick Reflection</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeReflection}
                aria-label="Close reflection"
              >
                ✕
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              A quick reflection to close out your session
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Feeling after */}
            <div className="space-y-2">
              <p className="text-sm font-medium">
                How do you feel after this check-in?
              </p>
              <div className="flex justify-center gap-2">
                {FEELING_EMOJIS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setFeelingAfter(item.value)}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-lg border-2 p-2 transition-all',
                      'hover:scale-105 active:scale-95 touch-manipulation',
                      feelingAfter === item.value
                        ? 'border-primary bg-primary/5'
                        : 'border-transparent bg-muted/50',
                    )}
                  >
                    <span className="text-xl">{item.emoji}</span>
                    <span className="text-[10px]">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Gratitude */}
            <div className="space-y-2">
              <p className="text-sm font-medium">
                One thing you appreciate about your partner
              </p>
              <Textarea
                value={gratitude}
                onChange={(e) => setGratitude(e.target.value)}
                placeholder="I appreciate that..."
                className="min-h-[60px] resize-none"
                maxLength={500}
              />
            </div>

            {/* Key takeaway */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Key takeaway</p>
              <Textarea
                value={keyTakeaway}
                onChange={(e) => setKeyTakeaway(e.target.value)}
                placeholder="The most important thing from this check-in was..."
                className="min-h-[60px] resize-none"
                maxLength={500}
              />
            </div>

            {/* Share toggle */}
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={shareWithPartner}
                onChange={(e) => setShareWithPartner(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm">Share reflection with partner</span>
            </label>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={closeReflection}
              >
                Skip
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={feelingAfter === null}
              >
                Save Reflection
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
