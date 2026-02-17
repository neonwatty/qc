'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, GripVertical, Users, Clock } from 'lucide-react'
import { useBookends } from '@/contexts/BookendsContext'
import { QUICK_TOPICS } from '@/types/bookends'
import { cn } from '@/lib/utils'

import type { PreparationTopic } from '@/types/bookends'

interface QuickTopicsGridProps {
  myTopics: PreparationTopic[]
  onQuickTopicClick: (topic: (typeof QUICK_TOPICS)[number]) => void
}

function QuickTopicsGrid({ myTopics, onQuickTopicClick }: QuickTopicsGridProps): React.ReactNode {
  return (
    <div>
      <h3 className="text-sm font-medium text-rose-700 mb-3">Quick Topics</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {QUICK_TOPICS.map((topic) => {
          const isAdded = myTopics.some((t) => t.isQuickTopic && t.content === topic.label)
          return (
            <motion.button
              key={topic.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onQuickTopicClick(topic)}
              className={cn(
                'flex items-center gap-2 p-3 rounded-lg border transition-all text-left',
                isAdded ? 'bg-pink-50 border-pink-300 text-pink-700' : 'bg-white border-gray-200 hover:border-gray-300',
              )}
              disabled={isAdded}
            >
              <span className="text-xl">{topic.icon}</span>
              <span className="text-sm">{topic.label}</span>
              {isAdded && <span className="text-xs ml-auto">✓</span>}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

interface MyTopicsListProps {
  topics: PreparationTopic[]
  onRemove: (id: string) => void
}

function MyTopicsList({ topics, onRemove }: MyTopicsListProps): React.ReactNode {
  if (topics.length === 0) return null
  return (
    <div>
      <h3 className="text-sm font-medium text-rose-700 mb-3">Your Topics ({topics.length})</h3>
      <div className="space-y-2">
        <AnimatePresence>
          {topics.map((topic) => (
            <motion.div
              key={topic.id}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="flex items-center gap-2 p-3 bg-pink-50 rounded-lg border border-pink-200"
            >
              <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
              <span className="flex-1 text-sm">{topic.content}</span>
              <button onClick={() => onRemove(topic.id)} className="text-gray-500 hover:text-red-500 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

interface AgendaPreviewProps {
  myCount: number
  partnerCount: number
}

function AgendaPreview({ myCount, partnerCount }: AgendaPreviewProps): React.ReactNode {
  const total = myCount + partnerCount
  if (total === 0) return null
  return (
    <Card className="p-4 bg-gradient-to-r from-pink-50 to-blue-50">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-4 w-4 text-gray-600" />
        <h3 className="text-sm font-medium text-rose-700">Session Agenda</h3>
        <span className="text-xs text-gray-500 ml-auto">{total} topics total</span>
      </div>
      <div className="text-xs text-gray-600">
        <p>- {myCount} topics from you</p>
        <p>- {partnerCount} topics from your partner</p>
        <p className="mt-2 text-gray-500">
          Estimated time: {total * 3}-{total * 5} minutes
        </p>
      </div>
    </Card>
  )
}

export function PreparationModal(): React.ReactNode {
  const { preparation, isPreparationModalOpen, closePreparationModal, addMyTopic, removeMyTopic } = useBookends()

  const [customTopic, setCustomTopic] = useState('')

  const handleAddCustomTopic = (): void => {
    if (customTopic.trim()) {
      addMyTopic(customTopic.trim(), false)
      setCustomTopic('')
    }
  }

  const handleQuickTopicClick = (topic: (typeof QUICK_TOPICS)[number]): void => {
    const isAdded = myTopics.some((t) => t.isQuickTopic && t.content === topic.label)
    if (!isAdded) {
      addMyTopic(topic.label, true)
    }
  }

  const myTopics = preparation?.myTopics || []
  const partnerTopics = preparation?.partnerTopics || []

  return (
    <Dialog open={isPreparationModalOpen} onOpenChange={closePreparationModal}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md border-rose-200/40">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            Prepare for Your Check-In
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Select topics you&apos;d like to discuss. Your partner can add their own topics too.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <QuickTopicsGrid myTopics={myTopics} onQuickTopicClick={handleQuickTopicClick} />

          {/* Custom Topic Input */}
          <div>
            <h3 className="text-sm font-medium text-rose-700 mb-3">Add Custom Topic</h3>
            <div className="flex gap-2">
              <Input
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomTopic()}
                placeholder="Something specific you want to discuss..."
                className="flex-1"
              />
              <Button onClick={handleAddCustomTopic} disabled={!customTopic.trim()} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <MyTopicsList topics={myTopics} onRemove={removeMyTopic} />

          {/* Partner Topics */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-medium text-rose-700">Partner&apos;s Topics</h3>
            </div>
            {partnerTopics.length > 0 ? (
              <div className="space-y-2">
                {partnerTopics.map((topic) => (
                  <div key={topic.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="text-sm">{topic.content}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-500">No topics from your partner yet</p>
              </div>
            )}
          </div>

          <AgendaPreview myCount={myTopics.length} partnerCount={partnerTopics.length} />

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t border-rose-100">
            <Button
              variant="outline"
              onClick={closePreparationModal}
              className="border-rose-200 text-rose-600 hover:bg-rose-50"
            >
              Save for Later
            </Button>
            <Button
              onClick={closePreparationModal}
              disabled={myTopics.length === 0}
              className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white border-0"
            >
              Start Check-In with Topics
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
