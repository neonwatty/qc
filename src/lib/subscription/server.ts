import type { Subscription, SubscriptionPlan } from '@/types'
import { PLAN_CONFIG } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'

interface ServerSubscription {
  plan: SubscriptionPlan
  limits: {
    maxItems: number
    features: string[]
  }
  isPro: boolean
  isFree: boolean
  subscription: Subscription | null
}

export async function getServerSubscription(userId: string): Promise<ServerSubscription> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()

  const plan: SubscriptionPlan = data?.plan === 'pro' && data?.status === 'active'
    ? 'pro'
    : 'free'

  const config = PLAN_CONFIG[plan]

  return {
    plan,
    limits: {
      maxItems: config.maxItems,
      features: config.features,
    },
    isPro: plan === 'pro',
    isFree: plan === 'free',
    subscription: data as Subscription | null,
  }
}

export async function canUserDoAction(
  userId: string,
  currentCount: number,
): Promise<{ allowed: boolean, reason?: string }> {
  const { limits, plan } = await getServerSubscription(userId)

  if (currentCount >= limits.maxItems) {
    return {
      allowed: false,
      reason: `You have reached the limit of ${limits.maxItems} items on the ${plan} plan. Upgrade to add more.`,
    }
  }

  return { allowed: true }
}
