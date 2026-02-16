'use client'

import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, CheckCircle, Users } from 'lucide-react'
import { StaggerContainer } from '@/components/ui/motion'
import { Button } from '@/components/ui/button'
import { CategoryCard } from './CategoryCard'
import type { CategoryProgress } from '@/types/checkin'
import { cn } from '@/lib/utils'

interface Category {
  id: string
  name: string
  description: string
  icon: string
  order: number
}

interface CategoryGridProps {
  categories: Category[]
  categoryProgress?: CategoryProgress[]
  selectedCategories?: string[]
  completedCategories?: string[]
  onCategorySelect: (categoryId: string) => void
  onStartCheckIn?: (selectedCategories: string[]) => void
  multiSelect?: boolean
  showProgress?: boolean
  maxSelections?: number
  className?: string
}

export function CategoryGrid({
  categories,
  categoryProgress = [],
  selectedCategories = [],
  completedCategories = [],
  onCategorySelect,
  onStartCheckIn,
  multiSelect = false,
  showProgress = false,
  maxSelections,
  className,
}: CategoryGridProps): React.ReactNode {
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => a.order - b.order)
  }, [categories])

  const getCategoryProgress = (categoryId: string): CategoryProgress | undefined => {
    return categoryProgress.find((cp) => cp.categoryId === categoryId)
  }

  const handleCategoryAction = (categoryId: string): void => {
    if (multiSelect) {
      if (!selectedCategories.includes(categoryId) && maxSelections && selectedCategories.length >= maxSelections) {
        return
      }
    }
    onCategorySelect(categoryId)
  }

  const canStartCheckIn = selectedCategories.length > 0
  const completedCount = completedCategories.length
  const totalCount = categories.length

  return (
    <div className={cn('space-y-6', className)}>
      {multiSelect && (
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Users className="h-5 w-5 text-gray-500" />
            <span className="text-lg font-medium text-gray-900">
              {selectedCategories.length === 0
                ? 'Choose categories to discuss'
                : `${selectedCategories.length} categor${selectedCategories.length === 1 ? 'y' : 'ies'} selected`}
            </span>
          </div>
          {showProgress && completedCount > 0 && (
            <div className="flex items-center justify-center space-x-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>
                {completedCount} of {totalCount} completed
              </span>
            </div>
          )}
        </div>
      )}

      <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedCategories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            progress={getCategoryProgress(category.id)}
            isSelected={selectedCategories.includes(category.id)}
            isCompleted={completedCategories.includes(category.id)}
            onSelect={handleCategoryAction}
          />
        ))}
      </StaggerContainer>

      <AnimatePresence>
        {canStartCheckIn && onStartCheckIn && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.6, duration: 0.4 } }}
            exit={{ opacity: 0, y: 20 }}
            className="flex flex-col items-center space-y-4"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg px-8 py-4"
                onClick={() => onStartCheckIn(selectedCategories)}
              >
                <span className="text-lg font-semibold">Start Discussion</span>
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </motion.div>
            <div className="text-xs text-gray-500 text-center">
              Estimated time: {selectedCategories.length * 3}-{selectedCategories.length * 5} minutes
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
