'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface PageHeaderProps {
  title: string
  description?: string
  showBack?: boolean
}

export function PageHeader({ title, description, showBack = true }: PageHeaderProps): React.ReactNode {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-rose-200/40 dark:border-gray-800 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          {showBack && (
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="lg:hidden">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {description && <p className="text-sm text-muted-foreground font-medium mt-1">{description}</p>}
          </div>
        </div>
      </div>
    </header>
  )
}
