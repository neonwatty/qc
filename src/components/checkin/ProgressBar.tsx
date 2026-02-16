'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Check, Circle } from 'lucide-react'
import type { CheckInStep, CheckInProgress } from '@/types/checkin'

interface ProgressBarProps {
  progress: CheckInProgress
  currentStep: CheckInStep
  className?: string
  showLabels?: boolean
}

interface StepInfo {
  id: CheckInStep
  label: string
  shortLabel: string
  icon: string
}

const STEP_INFO: StepInfo[] = [
  { id: 'welcome', label: 'Welcome', shortLabel: 'Start', icon: '👋' },
  { id: 'category-selection', label: 'Choose Topics', shortLabel: 'Topics', icon: '📝' },
  { id: 'category-discussion', label: 'Discussion', shortLabel: 'Discuss', icon: '💬' },
  { id: 'reflection', label: 'Reflection', shortLabel: 'Reflect', icon: '💭' },
  { id: 'action-items', label: 'Action Items', shortLabel: 'Actions', icon: '✅' },
  { id: 'completion', label: 'Complete', shortLabel: 'Done', icon: '🎉' },
]

export function ProgressBar({
  progress,
  currentStep,
  className,
  showLabels = true,
}: ProgressBarProps): React.ReactNode {
  const currentStepIndex = STEP_INFO.findIndex((step) => step.id === currentStep)

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-medium text-gray-900">{progress.percentage}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress.percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>
      </div>

      <div className="relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-300" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-500"
          style={{ width: `${(currentStepIndex / (STEP_INFO.length - 1)) * 100}%` }}
        />
        <div className="relative flex justify-between">
          {STEP_INFO.map((step) => {
            const isCompleted = progress.completedSteps.includes(step.id)
            const isCurrent = step.id === currentStep
            const isPending = !isCompleted && !isCurrent

            return (
              <div key={step.id} className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2',
                    isCompleted && 'bg-gradient-to-r from-pink-500 to-purple-600 border-transparent',
                    isCurrent && 'bg-white border-purple-600 shadow-lg scale-110',
                    isPending && 'bg-white border-gray-300',
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5 text-white" />
                  ) : isCurrent ? (
                    <motion.div
                      className="w-3 h-3 bg-purple-600 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                {showLabels && (
                  <div className="mt-2 text-center">
                    <div
                      className={cn(
                        'text-xs font-medium transition-colors duration-300',
                        isCompleted && 'text-purple-600',
                        isCurrent && 'text-gray-900',
                        isPending && 'text-gray-400',
                      )}
                    >
                      <span className="hidden sm:inline">{step.label}</span>
                      <span className="sm:hidden">{step.shortLabel}</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
