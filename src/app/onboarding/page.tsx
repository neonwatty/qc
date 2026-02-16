'use client'

import { useState, useTransition } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { updateProfile, createCoupleAndInvite } from './actions'

type Step = 'profile' | 'invite' | 'waiting'

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>('profile')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleProfileSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await updateProfile(formData)
      if (result.success) {
        setStep('invite')
      } else {
        setError(result.error ?? 'Something went wrong')
      }
    })
  }

  function handleInviteSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await createCoupleAndInvite(formData)
      if (result.success) {
        setStep('waiting')
      } else {
        setError(result.error ?? 'Something went wrong')
      }
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <StepIndicator current={step} />

        {step === 'profile' && <ProfileStep onSubmit={handleProfileSubmit} isPending={isPending} error={error} />}

        {step === 'invite' && <InviteStep onSubmit={handleInviteSubmit} isPending={isPending} error={error} />}

        {step === 'waiting' && <WaitingStep />}
      </div>
    </div>
  )
}

// --- Step Indicator ---

interface StepIndicatorProps {
  current: Step
}

function StepIndicator({ current }: StepIndicatorProps) {
  const steps: { key: Step; label: string }[] = [
    { key: 'profile', label: 'Profile' },
    { key: 'invite', label: 'Invite' },
    { key: 'waiting', label: 'Done' },
  ]
  const currentIndex = steps.findIndex((s) => s.key === current)

  return (
    <div className="mb-8 flex items-center justify-center gap-2">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              i <= currentIndex ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            {i + 1}
          </div>
          <span
            className={`hidden text-sm sm:inline ${
              i <= currentIndex ? 'font-medium text-foreground' : 'text-muted-foreground'
            }`}
          >
            {s.label}
          </span>
          {i < steps.length - 1 && <div className={`h-px w-8 ${i < currentIndex ? 'bg-primary' : 'bg-muted'}`} />}
        </div>
      ))}
    </div>
  )
}

// --- Profile Step ---

interface ProfileStepProps {
  onSubmit: (formData: FormData) => void
  isPending: boolean
  error: string | null
}

function ProfileStep({ onSubmit, isPending, error }: ProfileStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome to QC</CardTitle>
        <CardDescription>Let us get to know you. Start by setting up your profile.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display name</Label>
            <Input
              id="displayName"
              name="displayName"
              placeholder="How your partner will see you"
              required
              maxLength={100}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatarUrl">Avatar URL (optional)</Label>
            <Input
              id="avatarUrl"
              name="avatarUrl"
              type="url"
              placeholder="https://example.com/avatar.jpg"
              disabled={isPending}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Saving...' : 'Continue'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// --- Invite Step ---

interface InviteStepProps {
  onSubmit: (formData: FormData) => void
  isPending: boolean
  error: string | null
}

function InviteStep({ onSubmit, isPending, error }: InviteStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite your partner</CardTitle>
        <CardDescription>Enter your partner's email and your relationship start date.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="partnerEmail">Partner's email</Label>
            <Input
              id="partnerEmail"
              name="partnerEmail"
              type="email"
              placeholder="partner@example.com"
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationshipStartDate">Relationship start date</Label>
            <Input id="relationshipStartDate" name="relationshipStartDate" type="date" required disabled={isPending} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Sending invite...' : 'Send invite'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// --- Waiting Step ---

function WaitingStep() {
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </div>
        <CardTitle>Invite sent!</CardTitle>
        <CardDescription>
          We sent an invitation to your partner. Once they accept, you will both be connected and can start using QC
          together.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-muted-foreground">
          You can close this page. We will notify you when your partner joins.
        </p>
      </CardContent>
    </Card>
  )
}
