import { redirect } from 'next/navigation'

import { getUserOrNull } from '@/lib/auth'
import { LandingPage } from './landing-page'

export default async function HomePage() {
  const user = await getUserOrNull()

  if (user) {
    redirect('/dashboard')
  }

  return <LandingPage />
}
