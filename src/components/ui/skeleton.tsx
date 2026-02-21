import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'card' | 'circle' | 'rectangular'
}

export function Skeleton({ className, variant = 'text' }: SkeletonProps): React.ReactNode {
  const variantStyles = {
    text: 'h-4 w-full rounded',
    card: 'h-32 w-full rounded-lg',
    circle: 'h-10 w-10 rounded-full',
    rectangular: 'h-20 w-full rounded-md',
  }

  // eslint-disable-next-line security/detect-object-injection -- variant is typed as a union literal
  return <div className={cn('animate-pulse bg-gray-200 dark:bg-gray-700', variantStyles[variant], className)} />
}

interface SkeletonGroupProps {
  count?: number
  variant?: SkeletonProps['variant']
  className?: string
  gap?: string
}

export function SkeletonGroup({
  count = 3,
  variant = 'text',
  className,
  gap = 'gap-3',
}: SkeletonGroupProps): React.ReactNode {
  return (
    <div className={cn('flex flex-col', gap, className)}>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} variant={variant} />
      ))}
    </div>
  )
}
