'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Heart, Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

const skeletonVariants = cva('animate-pulse bg-gray-200 rounded', {
  variants: {
    variant: {
      default: '',
      shimmer:
        'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent',
      pulse: 'animate-pulse',
      wave: 'animate-[wave_1.5s_ease-in-out_infinite]',
    },
    size: {
      sm: 'h-4',
      default: 'h-5',
      lg: 'h-6',
      xl: 'h-8',
    },
    shape: {
      default: 'rounded',
      circle: 'rounded-full',
      square: 'rounded-sm',
      none: 'rounded-none',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
    shape: 'default',
  },
})

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof skeletonVariants> {
  width?: string | number
  height?: string | number
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, size, shape, width, height, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(skeletonVariants({ variant, size, shape }), className)}
        style={{ width, height: height || undefined, ...style }}
        {...props}
      />
    )
  },
)
Skeleton.displayName = 'Skeleton'

export function LoadingSpinner({
  size = 'default',
  className,
  showBrand = false,
}: {
  size?: 'sm' | 'default' | 'lg'
  className?: string
  showBrand?: boolean
}) {
  const sizeClasses = { sm: 'h-4 w-4', default: 'h-8 w-8', lg: 'h-12 w-12' }

  if (showBrand) {
    return (
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="relative">
          <div
            className={cn('animate-spin rounded-full border-4 border-pink-200 border-t-pink-600', sizeClasses[size])}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Heart className="h-4 w-4 text-pink-500 animate-pulse" />
          <span className="text-sm font-medium text-gray-700">Quality Control</span>
        </div>
      </div>
    )
  }

  return <Loader2 className={cn('animate-spin text-gray-600', sizeClasses[size], className)} />
}

export function CardSkeleton({
  showHeader = true,
  showContent = true,
  showFooter = false,
  className,
  children,
}: {
  showHeader?: boolean
  showContent?: boolean
  showFooter?: boolean
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 space-y-4', className)}>
      {showHeader && (
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      )}

      {showContent && (
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      )}

      {children}

      {showFooter && (
        <div className="flex space-x-2 pt-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24" />
        </div>
      )}
    </div>
  )
}

export function ListItemSkeleton({
  showAvatar = false,
  showActions = false,
  className,
}: {
  showAvatar?: boolean
  showActions?: boolean
  className?: string
}) {
  return (
    <div className={cn('flex items-center space-x-3 p-3 border-b border-gray-100', className)}>
      {showAvatar && <Skeleton shape="circle" className="h-10 w-10 flex-shrink-0" />}

      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>

      {showActions && (
        <div className="flex space-x-1">
          <Skeleton shape="circle" className="h-8 w-8" />
          <Skeleton shape="circle" className="h-8 w-8" />
        </div>
      )}
    </div>
  )
}

export function FullPageLoading({
  message = 'Loading...',
  showBrand = true,
}: {
  message?: string
  showBrand?: boolean
}) {
  return (
    <div className="flex items-center justify-center min-h-[400px] py-12">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" showBrand={showBrand} />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  )
}

export const shimmerKeyframes = `
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes wave {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}
`

export { Skeleton, skeletonVariants }
