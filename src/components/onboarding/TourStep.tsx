'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Heart, MessageCircle, StickyNote, TrendingUp } from 'lucide-react'
import { useState } from 'react'

const TOUR_SLIDES = [
  {
    icon: MessageCircle,
    title: 'Check-Ins',
    description:
      'Connect with your partner through guided conversations. Share your thoughts, feelings, and experiences in a structured and meaningful way.',
    illustration: '💬',
  },
  {
    icon: StickyNote,
    title: 'Notes & Privacy',
    description:
      'Keep shared memories and private thoughts. Create notes together or keep personal reflections. Full control over what you share.',
    illustration: '📝',
  },
  {
    icon: TrendingUp,
    title: 'Growth Tracking',
    description:
      'Celebrate your journey together. Track milestones, achievements, and special moments. Watch your relationship grow over time.',
    illustration: '🌱',
  },
  {
    icon: Heart,
    title: 'Love Languages',
    description:
      'Discover how you and your partner express love. Create custom actions and reminders based on what matters most to both of you.',
    illustration: '❤️',
  },
] as const

type TourStepProps = {
  isPending: boolean
  onBack: () => void
  onComplete: () => void
}

export function TourStep({ isPending, onBack, onComplete }: TourStepProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')

  function handleNext() {
    if (currentSlide < TOUR_SLIDES.length - 1) {
      setDirection('forward')
      setCurrentSlide((prev) => prev + 1)
    } else {
      onComplete()
    }
  }

  function handlePrev() {
    if (currentSlide > 0) {
      setDirection('backward')
      setCurrentSlide((prev) => prev - 1)
    } else {
      onBack()
    }
  }

  const slideVariants = {
    enter: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? -300 : 300,
      opacity: 0,
    }),
  }

  const currentSlideData = TOUR_SLIDES[currentSlide]
  const Icon = currentSlideData.icon

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Here's what awaits you</h2>
        <p className="text-xs text-muted-foreground">
          {currentSlide + 1} of {TOUR_SLIDES.length}
        </p>
      </div>

      <div className="relative min-h-[280px] overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="space-y-4"
          >
            <div className="flex justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-100 to-orange-100 dark:from-pink-900/30 dark:to-orange-900/30">
                <Icon className="h-12 w-12 text-pink-600 dark:text-pink-400" />
              </div>
            </div>

            <div className="text-center">
              <div className="mb-2 text-4xl">{currentSlideData.illustration}</div>
              <h3 className="mb-2 text-xl font-bold text-foreground">{currentSlideData.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{currentSlideData.description}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-center gap-2">
        {/* eslint-disable-next-line security/detect-object-injection */}
        {TOUR_SLIDES.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => {
              setDirection(index > currentSlide ? 'forward' : 'backward')
              setCurrentSlide(index)
            }}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide ? 'w-8 bg-pink-500' : 'w-2 bg-muted hover:bg-pink-300'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handlePrev}
          className="touch-target flex items-center justify-center gap-1 rounded-xl border border-border px-4 py-3 font-semibold transition-colors hover:bg-muted"
        >
          <ChevronLeft className="h-4 w-4" />
          {currentSlide === 0 ? 'Back' : 'Previous'}
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={isPending}
          className="touch-target gradient-primary flex flex-1 items-center justify-center gap-1 rounded-xl px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {currentSlide === TOUR_SLIDES.length - 1 ? (
            isPending ? (
              'Setting up...'
            ) : (
              'Get Started'
            )
          ) : (
            <>
              Next
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
