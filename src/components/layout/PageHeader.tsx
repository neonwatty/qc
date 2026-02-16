'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  backHref?: string
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  showBack = false,
  backHref,
  actions,
  className,
}: PageHeaderProps): React.ReactNode {
  const router = useRouter()

  function handleBack(): void {
    if (backHref) {
      router.push(backHref)
    } else {
      router.back()
    }
  }

  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="flex items-start gap-3">
        {showBack && (
          <button
            onClick={handleBack}
            className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[hsl(var(--muted))] touch-target"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
          </button>
        )}
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-2xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
