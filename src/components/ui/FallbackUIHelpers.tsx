'use client'

import { FileX, HelpCircle, Home, ChevronRight } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
  actionHref,
  icon: IconComponent = FileX,
  className,
}: {
  title: string
  message: string
  actionLabel?: string
  onAction?: () => void
  actionHref?: string
  icon?: React.ComponentType<{ className?: string }>
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-6 text-center', className)}>
      <div className="bg-gray-100 rounded-full p-3 mb-4">
        <IconComponent className="h-8 w-8 text-gray-400" />
      </div>

      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm">{message}</p>

      {actionLabel &&
        (onAction || actionHref) &&
        (actionHref ? (
          <Link href={actionHref}>
            <Button>{actionLabel}</Button>
          </Link>
        ) : (
          <Button onClick={onAction}>{actionLabel}</Button>
        ))}
    </div>
  )
}

export function HelpFallback({
  issue,
  suggestions = [],
  contactSupport = true,
  className,
}: {
  issue: string
  suggestions?: string[]
  contactSupport?: boolean
  className?: string
}) {
  return (
    <div className={cn('max-w-2xl mx-auto p-6', className)}>
      <div className="text-center mb-8">
        <div className="bg-blue-100 rounded-full p-3 w-fit mx-auto mb-4">
          <HelpCircle className="h-8 w-8 text-blue-600" />
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-2">Need Help?</h2>
        <p className="text-gray-600">{issue}</p>
      </div>

      {suggestions.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Try these suggestions:</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-3">
                <ChevronRight className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{suggestion}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={() => window.history.back()} variant="outline">
          Go Back
        </Button>

        <Link href="/dashboard">
          <Button variant="outline" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Dashboard
          </Button>
        </Link>

        {contactSupport && (
          <Link href="/support">
            <Button>Contact Support</Button>
          </Link>
        )}
      </div>
    </div>
  )
}
