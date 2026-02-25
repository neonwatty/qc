'use client'

const LOVE_LANGUAGE_OPTIONS = [
  { category: 'words', emoji: '\u{1F4AC}', label: 'Words of Affirmation' },
  { category: 'acts', emoji: '\u{1F91D}', label: 'Acts of Service' },
  { category: 'gifts', emoji: '\u{1F381}', label: 'Receiving Gifts' },
  { category: 'time', emoji: '\u{23F0}', label: 'Quality Time' },
  { category: 'touch', emoji: '\u{1F917}', label: 'Physical Touch' },
  { category: 'custom', emoji: '\u{2728}', label: 'Custom' },
] as const

type StepDisplayNameProps = {
  displayName: string
  setDisplayName: (value: string) => void
  setStep: (step: number) => void
}

export function StepDisplayName({ displayName, setDisplayName, setStep }: StepDisplayNameProps) {
  return (
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
  )
}

type StepPartnerEmailProps = {
  partnerEmail: string
  setPartnerEmail: (value: string) => void
  setStep: (step: number) => void
}

export function StepPartnerEmail({ partnerEmail, setPartnerEmail, setStep }: StepPartnerEmailProps) {
  return (
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
        <p className="text-xs text-muted-foreground">We will send them an invite to join your couple profile.</p>
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
  )
}

type StepRelationshipDateProps = {
  relationshipStartDate: string
  setRelationshipStartDate: (value: string) => void
  setStep: (step: number) => void
}

export function StepRelationshipDate({
  relationshipStartDate,
  setRelationshipStartDate,
  setStep,
}: StepRelationshipDateProps) {
  return (
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
        <p className="text-xs text-muted-foreground">Optional. Used for milestones and anniversary reminders.</p>
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
          type="button"
          onClick={() => setStep(4)}
          className="touch-target gradient-primary flex-1 rounded-xl px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90"
        >
          Continue
        </button>
      </div>
    </div>
  )
}

type StepLoveLanguagesProps = {
  selectedLanguages: string[]
  setSelectedLanguages: React.Dispatch<React.SetStateAction<string[]>>
  setStep: (step: number) => void
}

export function StepLoveLanguages({ selectedLanguages, setSelectedLanguages, setStep }: StepLoveLanguagesProps) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Your Love Languages</h2>
        <p className="text-sm text-muted-foreground">Select your top 2-3 (optional)</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {LOVE_LANGUAGE_OPTIONS.map((lang) => {
          const isSelected = selectedLanguages.includes(lang.category)
          return (
            <button
              key={lang.category}
              type="button"
              onClick={() => {
                setSelectedLanguages((prev) =>
                  isSelected ? prev.filter((c) => c !== lang.category) : [...prev, lang.category],
                )
              }}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                isSelected ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20' : 'border-border hover:border-pink-300'
              }`}
            >
              <span className="text-2xl">{lang.emoji}</span>
              <span className="text-sm font-medium">{lang.label}</span>
            </button>
          )
        })}
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setStep(3)}
          className="touch-target flex-1 rounded-xl border border-border px-4 py-3 font-semibold transition-colors hover:bg-muted"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => setStep(5)}
          className="touch-target gradient-primary flex-1 rounded-xl px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90"
        >
          {selectedLanguages.length > 0 ? 'Continue' : 'Skip'}
        </button>
      </div>
    </div>
  )
}
