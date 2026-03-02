import Link from 'next/link'
import { FileQuestion } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function NotFound(): React.ReactElement {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center">
      <FileQuestion className="h-16 w-16 text-gray-400 mb-6" />
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">Page not found</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Button asChild>
        <Link href="/dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  )
}
