'use client'

import { useState, useCallback } from 'react'
import { Sparkles } from 'lucide-react'
import { MotionBox } from '@/components/ui/motion'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useBookends } from '@/contexts/BookendsContext'
import { ReflectionForm } from '@/components/bookends/ReflectionForm'
import { useCheckInContext } from '@/contexts/CheckInContext'
import { useSessionSettings } from '@/contexts/SessionSettingsContext'
import { CategoryGrid } from '@/components/checkin/CategoryGrid'
import { NavigationControls } from '@/components/checkin/NavigationControls'
import { ActionItems } from '@/components/checkin/ActionItems'
import { CompletionCelebration } from '@/components/checkin/CompletionCelebration'
import { SessionTimer } from '@/components/checkin/SessionTimer'
import { TurnIndicator } from '@/components/checkin/TurnIndicator'

import type { ActionItem } from '@/types'

export { WarmUpStep } from '@/components/checkin/WarmUpStep'

export const CHECK_IN_CATEGORIES = [
  {
    id: 'emotional',
    name: 'Emotional Connection',
    description: 'How connected and understood do you feel?',
    icon: '💕',
    order: 1,
  },
  {
    id: 'communication',
    name: 'Communication',
    description: 'How well are you communicating with each other?',
    icon: '💬',
    order: 2,
  },
  {
    id: 'intimacy',
    name: 'Physical & Emotional Intimacy',
    description: 'How satisfied are you with closeness and intimacy?',
    icon: '🤗',
    order: 3,
  },
  {
    id: 'goals',
    name: 'Shared Goals & Future',
    description: 'Are you aligned on your future together?',
    icon: '🎯',
    order: 4,
  },
]

export function CategorySelectionStep(): React.ReactNode {
  const { session, completeStep, updateCategoryProgress, abandonCheckIn } = useCheckInContext()
  const [selectedCategories, setSelectedCategories] = useState<string[]>(session?.selectedCategories ?? [])

  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }, [])

  const handleStartDiscussion = useCallback(
    (selected: string[]) => {
      for (const categoryId of selected) {
        updateCategoryProgress(categoryId, { isCompleted: false })
      }
      completeStep('category-selection')
    },
    [completeStep, updateCategoryProgress],
  )

  const handleBack = useCallback(() => {
    abandonCheckIn()
  }, [abandonCheckIn])

  return (
    <MotionBox variant="page" className="space-y-6">
      <CategoryGrid
        categories={CHECK_IN_CATEGORIES}
        categoryProgress={session?.categoryProgress}
        selectedCategories={selectedCategories}
        onCategorySelect={handleCategorySelect}
        onStartCheckIn={handleStartDiscussion}
        multiSelect
        showProgress
      />
      <NavigationControls
        currentStep="category-selection"
        canGoBack
        canGoNext={false}
        onBack={handleBack}
        onCancel={abandonCheckIn}
        backLabel="Cancel"
      />
    </MotionBox>
  )
}

export function CategoryDiscussionStep(): React.ReactNode {
  const { completeStep, goToStep, getCurrentCategoryProgress } = useCheckInContext()
  const { getActiveSettings } = useSessionSettings()
  const settings = getActiveSettings()
  const currentCategory = getCurrentCategoryProgress()
  const category = CHECK_IN_CATEGORIES.find((c) => c.id === currentCategory?.categoryId)

  return (
    <MotionBox variant="page" className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-center">
        <SessionTimer durationMinutes={settings.sessionDuration} />
      </div>

      <TurnIndicator />

      <div className="text-center space-y-2">
        <div className="text-4xl">{category?.icon ?? '💬'}</div>
        <h2 className="text-2xl font-bold text-foreground">{category?.name ?? 'Discussion'}</h2>
        <p className="text-muted-foreground">{category?.description ?? 'Share your thoughts with your partner.'}</p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <p className="text-muted-foreground">
          Take turns sharing your thoughts on this topic. Listen actively and respond with empathy.
        </p>
      </div>

      <NavigationControls
        currentStep="category-discussion"
        canGoBack
        canGoNext
        onBack={() => goToStep('warm-up')}
        onNext={() => completeStep('category-discussion')}
        nextLabel="Continue to Reflection"
        variant="floating"
        showProgress
        currentStepIndex={3}
        totalSteps={7}
      />
    </MotionBox>
  )
}

export function ReflectionStep(): React.ReactNode {
  const { session, completeStep, goToStep } = useCheckInContext()
  const { openReflectionModal } = useBookends()

  return (
    <MotionBox variant="page" className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="text-4xl">💭</div>
        <h2 className="text-2xl font-bold text-gray-900">Reflection</h2>
        <p className="text-gray-600">Take a moment to reflect on your check-in together.</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <Button onClick={openReflectionModal} className="w-full" variant="outline">
          <Sparkles className="h-4 w-4 mr-2" />
          Write a Reflection
        </Button>
      </div>

      <ReflectionForm sessionId={session?.id || 'none'} />

      <NavigationControls
        currentStep="reflection"
        canGoBack
        canGoNext
        onBack={() => goToStep('category-discussion')}
        onNext={() => completeStep('reflection')}
        nextLabel="Continue to Action Items"
        variant="floating"
        showProgress
        currentStepIndex={4}
        totalSteps={7}
      />
    </MotionBox>
  )
}

export function ActionItemsStep(): React.ReactNode {
  const { session, completeStep, goToStep, addActionItem, removeActionItem, toggleActionItem } = useCheckInContext()

  const actionItems = session?.draftNotes ? [] : ([] as ActionItem[])

  return (
    <ActionItems
      actionItems={actionItems}
      onAddActionItem={addActionItem}
      onRemoveActionItem={removeActionItem}
      onToggleActionItem={toggleActionItem}
      coupleId={session?.baseCheckIn.coupleId ?? ''}
      onBack={() => goToStep('reflection')}
      onNext={() => completeStep('action-items')}
    />
  )
}

export function CompletionStep(): React.ReactNode {
  const router = useRouter()
  const { session, completeCheckIn } = useCheckInContext()

  const [timeSpent] = useState(() =>
    session ? Math.round((Date.now() - new Date(session.startedAt).getTime()) / 60000) : 0,
  )

  const handleGoHome = useCallback(() => {
    completeCheckIn()
    router.push('/dashboard')
  }, [completeCheckIn, router])

  const handleStartNew = useCallback(() => {
    completeCheckIn()
  }, [completeCheckIn])

  return (
    <CompletionCelebration
      show
      categories={session?.selectedCategories}
      timeSpent={timeSpent}
      actionItemsCount={0}
      notesCount={session?.draftNotes.length ?? 0}
      moodBefore={session?.baseCheckIn.moodBefore}
      moodAfter={session?.baseCheckIn.moodAfter}
      onGoHome={handleGoHome}
      onStartNew={handleStartNew}
    />
  )
}
