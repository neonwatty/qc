'use client'

import { cn } from '@/lib/utils'

interface FooterProps {
  className?: string
}

export function Footer({ className = '' }: FooterProps): React.ReactNode {
  return (
    <footer role="contentinfo" className={cn('hidden lg:block', className)}>
      <div className="w-full py-6 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">Quality Control &mdash; Relationship Wellness</p>
        </div>
      </div>
    </footer>
  )
}
