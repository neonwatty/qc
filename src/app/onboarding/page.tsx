'use client'

import { Heart } from 'lucide-react'
import { useActionState, useState } from 'react'

import { completeOnboarding } from './actions'
import type { OnboardingState } from './actions'
import {
  StepDisplayName,
  StepFeatureTour,
  StepLoveLanguages,
  StepPartnerEmail,
  StepRelationshipDate,
} from './onboarding-steps'

const TOTAL_STEPS = 5

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
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])

  const [state, formAction, isPending] = useActionState<OnboardingState, FormData>(completeOnboarding, {
    error: null,
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 to-orange-50 p-4 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-card p-8 shadow-lg">
        <div className="space-y-2 text-center">
          <Heart className="mx-auto h-10 w-10 text-pink-500 transition-transform hover:scale-110" />
          <h1 className="text-gradient-primary text-2xl font-bold">Welcome to QC</h1>
          <p className="text-sm text-muted-foreground">Set up your couple profile in a few quick steps</p>
          <p className="text-xs text-muted-foreground">Takes about 2 minutes</p>
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
          <input type="hidden" name="selectedLanguages" value={JSON.stringify(selectedLanguages)} />

          {step === 1 && (
            <StepDisplayName displayName={displayName} setDisplayName={setDisplayName} setStep={setStep} />
          )}
          {step === 2 && (
            <StepPartnerEmail partnerEmail={partnerEmail} setPartnerEmail={setPartnerEmail} setStep={setStep} />
          )}
          {step === 3 && (
            <StepRelationshipDate
              relationshipStartDate={relationshipStartDate}
              setRelationshipStartDate={setRelationshipStartDate}
              setStep={setStep}
            />
          )}
          {step === 4 && (
            <StepLoveLanguages
              selectedLanguages={selectedLanguages}
              setSelectedLanguages={setSelectedLanguages}
              setStep={setStep}
            />
          )}
          {step === 5 && <StepFeatureTour isPending={isPending} setStep={setStep} />}
        </form>
      </div>
    </div>
  )
}
