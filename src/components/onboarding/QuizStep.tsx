'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, Clock, MessageCircle } from 'lucide-react'

export type Preferences = {
  communicationStyle: string
  checkInFrequency: string
  sessionStyle: string
}

type QuizStepProps = {
  preferences: Preferences
  updatePreferences: (prefs: Partial<Preferences>) => void
  onNext: () => void
  onBack: () => void
}

const QUESTIONS = [
  {
    id: 'communicationStyle' as const,
    icon: MessageCircle,
    title: 'How do you prefer to discuss important topics?',
    options: [
      { value: 'face-to-face', label: 'Face-to-face', emoji: '👥' },
      { value: 'written', label: 'Written notes', emoji: '📝' },
      { value: 'activities', label: 'During activities', emoji: '🚶' },
      { value: 'mix', label: 'Mix of all', emoji: '🔄' },
    ],
  },
  {
    id: 'checkInFrequency' as const,
    icon: Calendar,
    title: 'How often would you like to check in?',
    options: [
      { value: 'daily', label: 'Daily', emoji: '☀️' },
      { value: 'weekly', label: 'Weekly', emoji: '📅' },
      { value: 'biweekly', label: 'Bi-weekly', emoji: '📆' },
      { value: 'monthly', label: 'Monthly', emoji: '🗓️' },
    ],
  },
  {
    id: 'sessionStyle' as const,
    icon: Clock,
    title: 'What kind of check-in sessions work best?',
    options: [
      { value: 'quick', label: 'Quick & focused (10 min)', emoji: '⚡' },
      { value: 'standard', label: 'Standard (20 min)', emoji: '⏰' },
      { value: 'deep', label: 'Deep dive (30+ min)', emoji: '🏊' },
    ],
  },
]

export function QuizStep({ preferences, updatePreferences, onNext, onBack }: QuizStepProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)

  const question = QUESTIONS[currentQuestion]
  const Icon = question.icon
  const selectedValue = preferences[question.id]

  function handleAnswer(value: string) {
    updatePreferences({ [question.id]: value })
    if (currentQuestion < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300)
    }
  }

  const canProceed = Boolean(preferences.communicationStyle && preferences.checkInFrequency && preferences.sessionStyle)

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Quick Relationship Quiz</h2>
        <p className="text-sm text-muted-foreground">Help us understand your relationship style</p>
      </div>

      <div className="flex justify-center gap-2">
        {QUESTIONS.map((_, index) => (
          <div
            key={index}
            className={`h-2 w-12 rounded-full transition-colors ${
              index === currentQuestion
                ? 'gradient-primary'
                : index < currentQuestion
                  ? 'bg-pink-200 dark:bg-pink-800'
                  : 'bg-muted'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-orange-100 dark:from-pink-900/30 dark:to-orange-900/30">
              <Icon className="h-7 w-7 text-pink-600 dark:text-pink-400" />
            </div>
          </div>

          <h3 className="text-center text-sm font-semibold">{question.title}</h3>

          <div className="grid gap-2">
            {question.options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleAnswer(option.value)}
                className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${
                  selectedValue === option.value
                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                    : 'border-border hover:border-pink-300'
                }`}
              >
                <span className="text-xl">{option.emoji}</span>
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="touch-target flex-1 rounded-xl border border-border px-4 py-3 font-semibold transition-colors hover:bg-muted"
        >
          Back
        </button>
        {currentQuestion > 0 && (
          <button
            type="button"
            onClick={() => setCurrentQuestion(currentQuestion - 1)}
            className="touch-target rounded-xl border border-border px-4 py-3 text-sm font-semibold transition-colors hover:bg-muted"
          >
            Prev Q
          </button>
        )}
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="touch-target gradient-primary flex-1 rounded-xl px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
