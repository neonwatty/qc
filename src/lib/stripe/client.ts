import Stripe from 'stripe'

import type { SubscriptionPlan } from '@/types'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

interface PlanConfig {
  name: string
  maxItems: number
  features: string[]
}

export const PLAN_CONFIG: Record<SubscriptionPlan, PlanConfig> = {
  free: {
    name: 'Free',
    maxItems: 10,
    features: [
      'Up to 10 items',
      'Basic analytics',
      'Community support',
    ],
  },
  pro: {
    name: 'Pro',
    maxItems: 1000,
    features: [
      'Up to 1,000 items',
      'Advanced analytics',
      'Priority support',
      'Custom integrations',
      'API access',
    ],
  },
}
