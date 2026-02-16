import type { Subscription, SubscriptionPlan } from '@/types'
import { PLAN_CONFIG } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'

type ActionType = 'check-in' | 'note' | 'milestone' | 'photo-upload' | 'reminder-email' | 'love-language' | 'export'

interface ServerSubscription {
  plan: SubscriptionPlan
  limits: {
    maxCheckInsPerMonth: number
    maxNotes: number
    maxMilestones: number
    maxPhotoUploads: number
    maxReminderEmails: number
    maxLoveLanguages: number
    canExport: boolean
  }
  isPro: boolean
  isFree: boolean
  subscription: Subscription | null
}

export async function getServerSubscription(userId: string): Promise<ServerSubscription> {
  const supabase = await createClient()

  const { data } = await supabase.from('subscriptions').select('*').eq('user_id', userId).single()

  const plan: SubscriptionPlan = data?.plan === 'pro' && data?.status === 'active' ? 'pro' : 'free'

  const config = PLAN_CONFIG[plan]

  return {
    plan,
    limits: {
      maxCheckInsPerMonth: config.maxCheckInsPerMonth,
      maxNotes: config.maxNotes,
      maxMilestones: config.maxMilestones,
      maxPhotoUploads: config.maxPhotoUploads,
      maxReminderEmails: config.maxReminderEmails,
      maxLoveLanguages: config.maxLoveLanguages,
      canExport: config.canExport,
    },
    isPro: plan === 'pro',
    isFree: plan === 'free',
    subscription: data as Subscription | null,
  }
}

const ACTION_LIMIT_MAP: Record<ActionType, keyof ServerSubscription['limits'] | null> = {
  'check-in': 'maxCheckInsPerMonth',
  note: 'maxNotes',
  milestone: 'maxMilestones',
  'photo-upload': 'maxPhotoUploads',
  'reminder-email': 'maxReminderEmails',
  'love-language': 'maxLoveLanguages',
  export: null,
}

const ACTION_LABELS: Record<ActionType, string> = {
  'check-in': 'check-ins this month',
  note: 'notes',
  milestone: 'milestones',
  'photo-upload': 'photo uploads',
  'reminder-email': 'reminder emails',
  'love-language': 'love languages',
  export: 'exports',
}

export async function canUserDoAction(
  userId: string,
  action: ActionType,
  currentCount: number,
): Promise<{ allowed: boolean; reason?: string }> {
  const { limits, plan } = await getServerSubscription(userId)

  if (action === 'export') {
    if (!limits.canExport) {
      return {
        allowed: false,
        reason: `Export is not available on the ${plan} plan. Upgrade to Pro to export your data.`,
      }
    }
    return { allowed: true }
  }

  const limitKey = ACTION_LIMIT_MAP[action]
  if (!limitKey) {
    return { allowed: true }
  }

  const limit = limits[limitKey]
  if (typeof limit === 'number' && currentCount >= limit) {
    return {
      allowed: false,
      reason: `You have reached the limit of ${limit} ${ACTION_LABELS[action]} on the ${plan} plan. Upgrade to add more.`,
    }
  }

  return { allowed: true }
}
