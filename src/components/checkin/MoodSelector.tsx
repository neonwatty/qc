'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'
import { scaleIn, staggerContainer, staggerItem } from '@/lib/animations'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FEELING_EMOJIS } from '@/types/bookends'

interface MoodSelectorProps {
  onSelect: (mood: number) => void
  label?: string
  initialValue?: number
  showConfirm?: boolean
}

const MOOD_COLORS = [
  'bg-red-100 border-red-300 text-red-800',
  'bg-orange-100 border-orange-300 text-orange-800',
  'bg-yellow-100 border-yellow-300 text-yellow-800',
  'bg-green-100 border-green-300 text-green-800',
  'bg-emerald-100 border-emerald-300 text-emerald-800',
] as const

export function MoodSelector({
  onSelect,
  label = 'How are you feeling?',
  initialValue,
  showConfirm = true,
}: MoodSelectorProps): React.ReactNode {
  const [selected, setSelected] = useState<number | null>(initialValue ?? null)

  function handleConfirm(): void {
    if (selected !== null) {
      onSelect(selected)
    }
  }

  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <p className="text-center text-sm font-medium text-muted-foreground">
          {label}
        </p>

        <motion.div
          className="flex justify-center gap-3"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {FEELING_EMOJIS.map((item) => (
            <motion.button
              key={item.value}
              variants={staggerItem}
              type="button"
              onClick={() => setSelected(item.value)}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all',
                'hover:scale-105 active:scale-95',
                'min-w-[60px] touch-manipulation',
                selected === item.value
                  ? MOOD_COLORS[item.value - 1]
                  : 'border-transparent bg-muted/50',
              )}
              aria-label={`Mood: ${item.label}`}
              aria-pressed={selected === item.value}
            >
              <span className="text-2xl">{item.emoji}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {selected !== null && (
          <motion.div
            variants={scaleIn}
            initial="initial"
            animate="animate"
            className="text-center"
          >
            <p className="mb-3 text-sm text-muted-foreground">
              You selected:{' '}
              <span className="font-semibold">
                {FEELING_EMOJIS[selected - 1].emoji}{' '}
                {FEELING_EMOJIS[selected - 1].label}
              </span>
            </p>
            {showConfirm && (
              <Button onClick={handleConfirm} size="lg">
                Continue
              </Button>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
