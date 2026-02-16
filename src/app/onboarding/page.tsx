'use client'

import { useActionState, useState } from 'react'

import { completeOnboarding } from './actions'
import type { OnboardingState } from './actions'

const TOTAL_STEPS = 3

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-2 flex-1 rounded-full transition-colors ${i < current ? 'gradient-primary' : 'bg-muted'}`}
        />
      ))}
    </div>
  )
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [displayName, setDisplayName] = useState('')
  const [partnerEmail, setPartnerEmail] = useState('')
  const [relationshipStartDate, setRelationshipStartDate] = useState('')

  const [state, formAction, isPending] = useActionState<OnboardingState, FormData>(completeOnboarding, {
    error: null,
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 to-orange-50 p-4 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-card p-8 shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-gradient-primary text-2xl font-bold">Welcome to QC</h1>
          <p className="text-sm text-muted-foreground">Set up your couple profile in a few quick steps</p>
        </div>

        <StepIndicator current={step} total={TOTAL_STEPS} />

        {state.error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {state.error}
          </div>
        )}

        <form action={formAction}>
          <input type="hidden" name="displayName" value={displayName} />
          <input type="hidden" name="partnerEmail" value={partnerEmail} />
          <input type="hidden" name="relationshipStartDate" value={relationshipStartDate} />

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="displayName" className="text-sm font-medium">
                  Your display name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How should your partner see you?"
                  className="mobile-input w-full rounded-xl border border-border bg-input px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                  autoFocus
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (displayName.trim()) setStep(2)
                }}
                disabled={!displayName.trim()}
                className="touch-target gradient-primary w-full rounded-xl px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="partnerEmail" className="text-sm font-medium">
                  Partner&apos;s email
                </label>
                <input
                  id="partnerEmail"
                  type="email"
                  value={partnerEmail}
                  onChange={(e) => setPartnerEmail(e.target.value)}
                  placeholder="partner@example.com"
                  className="mobile-input w-full rounded-xl border border-border bg-input px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  We will send them an invite to join your couple profile.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="touch-target flex-1 rounded-xl border border-border px-4 py-3 font-semibold transition-colors hover:bg-muted"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (partnerEmail.trim()) setStep(3)
                  }}
                  disabled={!partnerEmail.trim()}
                  className="touch-target gradient-primary flex-1 rounded-xl px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="relationshipStartDate" className="text-sm font-medium">
                  When did your relationship start?
                </label>
                <input
                  id="relationshipStartDate"
                  type="date"
                  value={relationshipStartDate}
                  onChange={(e) => setRelationshipStartDate(e.target.value)}
                  className="mobile-input w-full rounded-xl border border-border bg-input px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  Optional. Used for milestones and anniversary reminders.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="touch-target flex-1 rounded-xl border border-border px-4 py-3 font-semibold transition-colors hover:bg-muted"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="touch-target gradient-primary flex-1 rounded-xl px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {isPending ? 'Setting up...' : 'Get Started'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
