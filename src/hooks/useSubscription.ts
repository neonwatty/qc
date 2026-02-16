'use client'

import { useEffect, useState } from 'react'

import type { SubscriptionPlan } from '@/types'

interface SubscriptionState {
  plan: SubscriptionPlan
  limits: {
    maxItems: number
    features: string[]
  }
  isPro: boolean
  isFree: boolean
  loading: boolean
  error: string | null
}

const DEFAULT_STATE: SubscriptionState = {
  plan: 'free',
  limits: { maxItems: 10, features: [] },
  isPro: false,
  isFree: true,
  loading: true,
  error: null,
}

export function useSubscription(): SubscriptionState {
  const [state, setState] = useState<SubscriptionState>(DEFAULT_STATE)

  useEffect(() => {
    let cancelled = false

    async function fetchSubscription(): Promise<void> {
      const response = await fetch('/api/subscription')

      if (cancelled) return

      if (!response.ok) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: 'Failed to fetch subscription',
        }))
        return
      }

      const data = await response.json()

      if (cancelled) return

      setState({
        plan: data.plan,
        limits: data.limits,
        isPro: data.plan === 'pro',
        isFree: data.plan === 'free',
        loading: false,
        error: null,
      })
    }

    fetchSubscription()

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
