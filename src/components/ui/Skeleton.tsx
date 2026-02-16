'use client'

import * as React from 'react'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  animated?: boolean
  variant?: 'pulse' | 'shimmer' | 'wave'
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  animated = true,
  variant = 'shimmer',
}) => {
  const getAnimationProps = () => {
    if (!animated) return {}

    switch (variant) {
      case 'pulse':
        return {
          animate: { opacity: [0.5, 1, 0.5] },
          transition: { duration: 2, repeat: Infinity },
        }
      case 'wave':
        return {
          animate: { x: [-100, 200] },
          transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
        }
      case 'shimmer':
      default:
        return {
          style: {
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s infinite',
          },
        }
    }
  }

  return (
    <motion.div
      className={cn(
        'bg-gray-200 rounded animate-pulse',
        variant === 'shimmer' && 'shimmer',
        className,
      )}
      {...getAnimationProps()}
    />
  )
}

export const SkeletonText: React.FC<{
  lines?: number
  className?: string
  animated?: boolean
}> = ({ lines = 3, className, animated = true }) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={cn('h-4', i === lines - 1 ? 'w-3/4' : 'w-full')}
        animated={animated}
      />
    ))}
  </div>
)

export const SkeletonCard: React.FC<{
  className?: string
  showAvatar?: boolean
  showImage?: boolean
  animated?: boolean
}> = ({ className, showAvatar = false, showImage = false, animated = true }) => (
  <div className={cn('p-6 bg-white rounded-lg border border-gray-200', className)}>
    <div className="flex items-start space-x-3 mb-4">
      {showAvatar && (
        <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" animated={animated} />
      )}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" animated={animated} />
        <Skeleton className="h-4 w-1/2" animated={animated} />
      </div>
    </div>

    {showImage && (
      <Skeleton className="h-48 w-full mb-4" animated={animated} />
    )}

    <div className="space-y-2">
      <Skeleton className="h-4 w-full" animated={animated} />
      <Skeleton className="h-4 w-5/6" animated={animated} />
      <Skeleton className="h-4 w-3/4" animated={animated} />
    </div>

    <div className="flex justify-between items-center mt-4">
      <Skeleton className="h-4 w-20" animated={animated} />
      <Skeleton className="h-8 w-16 rounded" animated={animated} />
    </div>
  </div>
)

export const SkeletonList: React.FC<{
  items?: number
  className?: string
  itemClassName?: string
  animated?: boolean
}> = ({ items = 5, className, itemClassName, animated = true }) => (
  <div className={cn('space-y-4', className)}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className={cn('flex items-center space-x-3 p-3', itemClassName)}>
        <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" animated={animated} />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" animated={animated} />
          <Skeleton className="h-3 w-1/2" animated={animated} />
        </div>
        <Skeleton className="h-6 w-16 rounded" animated={animated} />
      </div>
    ))}
  </div>
)

export const SkeletonGrid: React.FC<{
  columns?: 1 | 2 | 3 | 4
  items?: number
  className?: string
  animated?: boolean
}> = ({ columns = 2, items = 6, className, animated = true }) => (
  <div className={cn(
    'grid gap-4',
    columns === 1 && 'grid-cols-1',
    columns === 2 && 'grid-cols-1 sm:grid-cols-2',
    columns === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    columns === 4 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    className,
  )}>
    {Array.from({ length: items }).map((_, i) => (
      <SkeletonCard key={i} animated={animated} />
    ))}
  </div>
)

export const DashboardSkeleton: React.FC<{ animated?: boolean }> = ({ animated = true }) => (
  <div className="space-y-8">
    <div className="text-center space-y-4">
      <Skeleton className="h-10 w-2/3 mx-auto" animated={animated} />
      <Skeleton className="h-6 w-1/2 mx-auto" animated={animated} />
    </div>

    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Skeleton className="w-8 h-8 rounded" animated={animated} />
            <Skeleton className="h-6 w-32 ml-3" animated={animated} />
          </div>
          <Skeleton className="h-4 w-full mb-4" animated={animated} />
          <Skeleton className="h-10 w-full rounded" animated={animated} />
        </div>
      ))}
    </div>

    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <Skeleton className="h-8 w-16 mx-auto mb-2" animated={animated} />
          <Skeleton className="h-4 w-20 mx-auto" animated={animated} />
        </div>
      ))}
    </div>
  </div>
)

export const PageSkeleton: React.FC<{
  type: 'dashboard' | 'custom'
  children?: React.ReactNode
  animated?: boolean
  className?: string
}> = ({ type, children, animated = true, className }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'dashboard':
        return <DashboardSkeleton animated={animated} />
      default:
        return children
    }
  }

  return (
    <div className={cn('animate-pulse', className)}>
      {renderSkeleton()}
    </div>
  )
}

export default Skeleton
