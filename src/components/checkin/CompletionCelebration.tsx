'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Sparkles, Trophy, Home, RefreshCw, Calendar } from 'lucide-react'

interface CompletionCelebrationProps {
  show: boolean
  categories?: string[]
  timeSpent?: number
  actionItemsCount?: number
  onClose?: () => void
  onGoHome?: () => void
  onStartNew?: () => void
  className?: string
}

export function CompletionCelebration({
  show,
  categories = [],
  timeSpent = 0,
  actionItemsCount = 0,
  onClose,
  onGoHome,
  onStartNew,
  className,
}: CompletionCelebrationProps): React.ReactNode {
  const [showStats, setShowStats] = useState(false)

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => setShowStats(true), 1500)
      return () => clearTimeout(timer)
    }
    setShowStats(false)
  }, [show])

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes} minutes`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={cn(
            'fixed inset-0 z-50 flex items-center justify-center p-4',
            'bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100',
            className,
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-full max-w-lg"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="relative bg-gradient-to-r from-pink-500 to-purple-600 p-8 text-white">
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <Sparkles className="h-64 w-64" />
                </div>
                <div className="relative z-10 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.5, stiffness: 300 }}
                  >
                    <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-300" />
                  </motion.div>
                  <motion.h2
                    className="text-3xl font-bold mb-2"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    Check-in Complete!
                  </motion.h2>
                  <motion.p
                    className="text-lg opacity-95"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    Great job taking time for your relationship!
                  </motion.p>
                </div>
              </div>

              <AnimatePresence>
                {showStats && (
                  <motion.div
                    className="p-6 bg-gray-50 border-t border-gray-100"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Session Summary</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{categories.length}</div>
                        <div className="text-xs text-gray-600">Topics Discussed</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-pink-600">{formatTime(timeSpent)}</div>
                        <div className="text-xs text-gray-600">Time Together</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-indigo-600">{actionItemsCount}</div>
                        <div className="text-xs text-gray-600">Action Items</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="p-6 space-y-3">
                <div className="flex gap-3">
                  {onGoHome && (
                    <Button variant="outline" onClick={onGoHome} className="flex-1 gap-2">
                      <Home className="h-4 w-4" />
                      Go Home
                    </Button>
                  )}
                  {onStartNew && (
                    <Button
                      onClick={onStartNew}
                      className="flex-1 gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Start Another
                    </Button>
                  )}
                </div>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>

            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              <p className="text-sm text-gray-600">Your next check-in is recommended in</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-purple-600">7 days</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
