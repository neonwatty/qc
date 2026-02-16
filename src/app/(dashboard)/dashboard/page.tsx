import { requireAuth } from '@/lib/auth'

export default async function DashboardPage() {
  const { user } = await requireAuth()

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2 text-[var(--muted-foreground)]">
        Welcome back, {user.email}
      </p>
      <div className="mt-8 rounded-lg border p-6">
        <p className="text-sm text-[var(--muted-foreground)]">
          Your dashboard content goes here. This is a protected page that requires authentication.
        </p>
      </div>
    </div>
  )
}
