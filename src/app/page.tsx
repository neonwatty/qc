import { redirect } from 'next/navigation'

import { getUserOrNull } from '@/lib/auth'

export default async function HomePage() {
  const user = await getUserOrNull()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Next.js Supabase Template
        </h1>
        <p className="mt-4 text-lg text-[var(--muted-foreground)]">
          A production-ready starter with authentication, payments, and email built in.
        </p>
      </div>
      <div className="flex gap-4">
        <a
          href="/login"
          className="rounded-lg bg-[var(--primary)] px-6 py-3 text-sm font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90"
        >
          Sign In
        </a>
        <a
          href="/signup"
          className="rounded-lg border px-6 py-3 text-sm font-medium transition-opacity hover:opacity-90"
        >
          Sign Up
        </a>
      </div>
    </main>
  )
}
