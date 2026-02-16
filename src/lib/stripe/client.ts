import Stripe from 'stripe'

import type { SubscriptionPlan } from '@/types'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

interface PlanConfig {
  name: string
  maxCheckInsPerMonth: number
  maxNotes: number
  maxMilestones: number
  maxPhotoUploads: number
  maxReminderEmails: number
  maxLoveLanguages: number
  canExport: boolean
}

export const PLAN_CONFIG: Record<SubscriptionPlan, PlanConfig> = {
  free: {
    name: 'Free',
    maxCheckInsPerMonth: 4,
    maxNotes: 20,
    maxMilestones: 5,
    maxPhotoUploads: 0,
    maxReminderEmails: 0,
    maxLoveLanguages: 3,
    canExport: false,
  },
  pro: {
    name: 'Pro',
    maxCheckInsPerMonth: Infinity,
    maxNotes: Infinity,
    maxMilestones: Infinity,
    maxPhotoUploads: Infinity,
    maxReminderEmails: Infinity,
    maxLoveLanguages: Infinity,
    canExport: true,
  },
} as const
