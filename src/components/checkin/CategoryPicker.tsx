'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/lib/animations'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const CATEGORIES = [
  { id: 'communication', label: 'Communication', icon: '💬', color: 'bg-blue-50' },
  { id: 'intimacy', label: 'Intimacy', icon: '❤️', color: 'bg-pink-50' },
  { id: 'finances', label: 'Finances', icon: '💰', color: 'bg-green-50' },
  { id: 'household', label: 'Household', icon: '🏠', color: 'bg-amber-50' },
  { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦', color: 'bg-purple-50' },
  { id: 'goals', label: 'Goals', icon: '🎯', color: 'bg-indigo-50' },
  { id: 'recreation', label: 'Recreation', icon: '🎉', color: 'bg-orange-50' },
  { id: 'health', label: 'Health', icon: '🧘', color: 'bg-teal-50' },
  { id: 'work-life', label: 'Work-Life', icon: '⚖️', color: 'bg-slate-50' },
  { id: 'appreciation', label: 'Appreciation', icon: '🌟', color: 'bg-yellow-50' },
] as const

interface CategoryPickerProps {
  onComplete: (categories: string[]) => void
  selectedCategories?: string[]
}

export function CategoryPicker({
  onComplete,
  selectedCategories: initialCategories = [],
}: CategoryPickerProps): React.ReactNode {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(initialCategories),
  )

  function toggleCategory(id: string): void {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function handleContinue(): void {
    onComplete([...selected])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">
          What would you like to discuss?
        </CardTitle>
        <p className="text-center text-sm text-muted-foreground">
          Select one or more categories for your check-in
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <motion.div
          className="grid grid-cols-2 gap-3"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {CATEGORIES.map((category) => {
            const isSelected = selected.has(category.id)
            return (
              <motion.button
                key={category.id}
                variants={staggerItem}
                type="button"
                onClick={() => toggleCategory(category.id)}
                className={cn(
                  'flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all',
                  'hover:shadow-md active:scale-[0.98] touch-manipulation',
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-transparent bg-muted/50 hover:bg-muted',
                )}
                aria-pressed={isSelected}
              >
                <span className="text-2xl">{category.icon}</span>
                <span className="text-sm font-medium">{category.label}</span>
              </motion.button>
            )
          })}
        </motion.div>

        {selected.size > 0 && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {[...selected].map((id) => {
                const cat = CATEGORIES.find((c) => c.id === id)
                return cat ? (
                  <Badge key={id} variant="secondary">
                    {cat.icon} {cat.label}
                  </Badge>
                ) : null
              })}
            </div>
            <Button
              onClick={handleContinue}
              size="lg"
              className="w-full"
            >
              Continue with {selected.size}{' '}
              {selected.size === 1 ? 'category' : 'categories'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
