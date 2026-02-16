'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Clock, Edit } from 'lucide-react'
import type { CategoryProgress } from '@/types/checkin'
import { cn } from '@/lib/utils'

interface Category {
  id: string
  name: string
  description: string
  icon: string
}

interface CategoryCardProps {
  category: Category
  progress?: CategoryProgress
  isSelected?: boolean
  isCompleted?: boolean
  onSelect: (categoryId: string) => void
  className?: string
}

const COLOR_MAP: Record<string, { border: string; bg: string; text: string; ring: string; icon: string }> = {
  pink: {
    border: 'border-pink-500',
    bg: 'bg-pink-50',
    text: 'text-pink-600',
    ring: 'ring-pink-500/20',
    icon: 'text-pink-500',
  },
  blue: {
    border: 'border-blue-500',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    ring: 'ring-blue-500/20',
    icon: 'text-blue-500',
  },
  purple: {
    border: 'border-purple-500',
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    ring: 'ring-purple-500/20',
    icon: 'text-purple-500',
  },
  green: {
    border: 'border-green-500',
    bg: 'bg-green-50',
    text: 'text-green-600',
    ring: 'ring-green-500/20',
    icon: 'text-green-500',
  },
}

function getColorKey(icon: string): string {
  if (icon === '💕') return 'pink'
  if (icon === '💬') return 'blue'
  if (icon === '🤗') return 'purple'
  if (icon === '🎯') return 'green'
  return 'pink'
}

export function CategoryCard({
  category,
  progress,
  isSelected = false,
  isCompleted = false,
  onSelect,
  className,
}: CategoryCardProps): React.ReactNode {
  const colors = COLOR_MAP[getColorKey(category.icon)] || COLOR_MAP.pink
  const timeSpent = progress?.timeSpent || 0
  const noteCount = progress?.notes?.length || 0
  const hasContent = timeSpent > 0 || noteCount > 0

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
      className={cn('relative', className)}
    >
      <div
        className={cn(
          'relative bg-white rounded-xl border-2 p-6 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md',
          isSelected
            ? `${colors.border} ${colors.bg} ring-4 ${colors.ring} shadow-lg`
            : 'border-gray-200 hover:border-gray-300',
          isCompleted && 'ring-2 ring-green-500/20 bg-green-50/50',
        )}
        onClick={() => onSelect(category.id)}
      >
        {isCompleted && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
            className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1.5 shadow-lg z-10"
          >
            <Check className="h-4 w-4 text-white" />
          </motion.div>
        )}

        <div className="flex items-start space-x-4 mb-4">
          <div className="text-3xl">{category.icon}</div>
          <div className="flex-1 min-w-0">
            <h3 className={cn('text-lg font-semibold', isSelected ? colors.text : 'text-gray-900')}>{category.name}</h3>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{category.description}</p>
          </div>
          <ArrowRight
            className={cn(
              'h-5 w-5 transition-all duration-200 flex-shrink-0',
              isSelected ? `${colors.icon} translate-x-1` : 'text-gray-400',
            )}
          />
        </div>

        {hasContent && (
          <div className="border-t border-gray-200 pt-3 mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-3">
                {timeSpent > 0 && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{Math.round(timeSpent / 60000)} min</span>
                  </div>
                )}
                {noteCount > 0 && (
                  <div className="flex items-center space-x-1">
                    <Edit className="h-3 w-3" />
                    <span>
                      {noteCount} note{noteCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
