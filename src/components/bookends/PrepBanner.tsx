'use client'

import { motion } from 'framer-motion'

import { slideDown } from '@/lib/animations'
import { useBookends } from '@/contexts/BookendsContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { QUICK_TOPICS } from '@/types/bookends'

export function PrepBanner(): React.ReactNode {
  const {
    hasSeenPrepReminder,
    markPrepReminderSeen,
    preparation,
    addTopic,
    openPreparation,
  } = useBookends()

  if (hasSeenPrepReminder) return null

  const topicCount = preparation?.myTopics.length ?? 0

  return (
    <motion.div
      variants={slideDown}
      initial="initial"
      animate="animate"
      exit="exit"
      className="mb-6"
    >
      <Card variant="filled">
        <CardContent className="space-y-4 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">Prepare for Your Check-In</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Take a moment to think about what you want to discuss
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={markPrepReminderSeen}
              aria-label="Dismiss preparation banner"
            >
              ✕
            </Button>
          </div>

          {topicCount === 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Quick topic suggestions:
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK_TOPICS.map((topic) => (
                  <Button
                    key={topic.id}
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      addTopic({
                        content: topic.label,
                        authorId: '',
                        isQuickTopic: true,
                      })
                    }
                  >
                    {topic.icon} {topic.label}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                You have {topicCount}{' '}
                {topicCount === 1 ? 'topic' : 'topics'} prepared
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openPreparation}
                >
                  Edit Topics
                </Button>
                <Button size="sm" onClick={markPrepReminderSeen}>
                  Ready to Start
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
