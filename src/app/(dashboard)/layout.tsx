import { redirect } from 'next/navigation'

import { getUserOrNull } from '@/lib/auth'
import { SignOutButton } from '@/components/sign-out-button'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUserOrNull()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <a href="/dashboard" className="text-lg font-semibold">
            Template
          </a>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--muted-foreground)]">
              {user.email}
            </span>
            <SignOutButton />
          </div>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  )
}
