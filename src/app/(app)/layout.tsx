import { redirect } from 'next/navigation'

import { getUserOrNull } from '@/lib/auth'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUserOrNull()

  if (!user) {
    redirect('/login')
  }

  return <>{children}</>
}
