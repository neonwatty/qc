import { redirect } from 'next/navigation'

import { getUserOrNull } from '@/lib/auth'
import { Hero } from '@/components/landing/Hero'
import { FeatureGrid } from '@/components/landing/FeatureGrid'

export default async function HomePage(): Promise<React.ReactNode> {
  const user = await getUserOrNull()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen bg-[hsl(var(--background))]">
      <Hero />
      <FeatureGrid />

      {/* Footer */}
      <footer className="border-t border-[hsl(var(--border))] px-4 py-8 text-center">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          &copy; {new Date().getFullYear()} QC. Built with love for your love.
        </p>
      </footer>
    </main>
  )
}
