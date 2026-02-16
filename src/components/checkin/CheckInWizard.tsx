'use client'

import { useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { useCheckIn } from '@/contexts/CheckInContext'
import { useSessionSettings } from '@/contexts/SessionSettingsContext'
import { slideUp } from '@/lib/animations'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { MoodSelector } from './MoodSelector'
import { CategoryPicker } from './CategoryPicker'
import { DiscussionView } from './DiscussionView'
import { ReflectionForm } from './ReflectionForm'
import { CheckInSummary } from './CheckInSummary'
import { createCheckIn as createCheckInAction } from '@/app/(app)/checkin/actions'

interface CheckInWizardProps {
  coupleId: string
  userId: string
}

export function CheckInWizard({
  coupleId,
  userId,
}: CheckInWizardProps): React.ReactNode {
  const {
    session,
    isLoading,
    startCheckIn,
    completeStep,
    goToStep,
  } = useCheckIn()
  const { settings } = useSessionSettings()

  const handleStartWithMood = useCallback(
    async (mood: number, categories: string[]) => {
      startCheckIn(categories)
      const result = await createCheckInAction({
        categories,
        moodBefore: mood,
      })

      if ('error' in result) {
        console.error('Failed to create check-in:', result.error)
      }
    },
    [startCheckIn],
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!session) {
    return <WelcomeStep onStart={handleStartWithMood} />
  }

  const currentStep = session.progress.currentStep

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Check-in Progress</span>
          <span>{session.progress.percentage}%</span>
        </div>
        <Progress value={session.progress.percentage} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          variants={slideUp}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {currentStep === 'welcome' && (
            <WelcomeStep onStart={handleStartWithMood} />
          )}
          {currentStep === 'category-selection' && (
            <CategoryPicker
              onComplete={(categories) => {
                completeStep('category-selection')
              }}
              selectedCategories={session.selectedCategories}
            />
          )}
          {currentStep === 'category-discussion' && (
            <DiscussionView
              coupleId={coupleId}
              userId={userId}
              sessionDuration={settings?.sessionDuration ?? 30}
              timeoutsPerPartner={settings?.timeoutsPerPartner ?? 2}
              timeoutDuration={settings?.timeoutDuration ?? 3}
              turnBasedMode={settings?.turnBasedMode ?? false}
              onComplete={() => completeStep('category-discussion')}
            />
          )}
          {currentStep === 'reflection' && (
            <ReflectionForm
              coupleId={coupleId}
              userId={userId}
              checkInId={session.baseCheckIn.id}
              onComplete={() => completeStep('reflection')}
            />
          )}
          {currentStep === 'action-items' && (
            <CheckInSummary
              session={session}
              coupleId={coupleId}
              userId={userId}
              onComplete={() => completeStep('action-items')}
            />
          )}
          {currentStep === 'completion' && (
            <CompletionStep onFinish={() => goToStep('welcome')} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

interface WelcomeStepProps {
  onStart: (mood: number, categories: string[]) => void
}

function WelcomeStep({ onStart }: WelcomeStepProps): React.ReactNode {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Start a Check-In</h1>
        <p className="mt-2 text-muted-foreground">
          How are you feeling right now?
        </p>
      </div>
      <MoodSelector
        onSelect={(mood) => onStart(mood, [])}
        label="Your mood before the check-in"
      />
    </div>
  )
}

interface CompletionStepProps {
  onFinish: () => void
}

function CompletionStep({ onFinish }: CompletionStepProps): React.ReactNode {
  return (
    <div className="space-y-6 text-center">
      <div className="text-6xl">🎉</div>
      <h2 className="text-2xl font-bold">Check-In Complete!</h2>
      <p className="text-muted-foreground">
        Great job connecting with your partner. Keep up the great work!
      </p>
      <Button onClick={onFinish} size="lg">
        Done
      </Button>
    </div>
  )
}
