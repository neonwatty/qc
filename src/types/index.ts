export type SubscriptionPlan = 'free' | 'pro'

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing'

export interface Profile {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  plan: SubscriptionPlan
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  current_period_end: string | null
  created_at: string
  updated_at: string
}
