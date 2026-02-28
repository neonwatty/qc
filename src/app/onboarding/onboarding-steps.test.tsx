import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('StepDisplayName', () => {
  async function load() {
    const mod = await import('./onboarding-steps')
    return mod.StepDisplayName
  }

  it('renders "Your display name" label', async () => {
    const Comp = await load()
    render(<Comp displayName="" setDisplayName={vi.fn()} setStep={vi.fn()} />)
    expect(screen.getByText('Your display name')).toBeDefined()
  })

  it('renders Continue button', async () => {
    const Comp = await load()
    render(<Comp displayName="Alice" setDisplayName={vi.fn()} setStep={vi.fn()} />)
    expect(screen.getByText('Continue')).toBeDefined()
  })

  it('disables Continue when displayName is empty', async () => {
    const Comp = await load()
    render(<Comp displayName="" setDisplayName={vi.fn()} setStep={vi.fn()} />)
    const btn = screen.getByText('Continue').closest('button')
    expect(btn?.disabled).toBe(true)
  })
})

describe('StepPartnerEmail', () => {
  async function load() {
    const mod = await import('./onboarding-steps')
    return mod.StepPartnerEmail
  }

  it('renders "Partner\'s email" label', async () => {
    const Comp = await load()
    render(<Comp partnerEmail="" setPartnerEmail={vi.fn()} setStep={vi.fn()} />)
    expect(screen.getByText("Partner's email")).toBeDefined()
  })

  it('renders Back and Continue buttons', async () => {
    const Comp = await load()
    render(<Comp partnerEmail="a@b.com" setPartnerEmail={vi.fn()} setStep={vi.fn()} />)
    expect(screen.getByText('Back')).toBeDefined()
    expect(screen.getByText('Continue')).toBeDefined()
  })
})

describe('StepRelationshipDate', () => {
  async function load() {
    const mod = await import('./onboarding-steps')
    return mod.StepRelationshipDate
  }

  it('renders "When did your relationship start?" label', async () => {
    const Comp = await load()
    render(<Comp relationshipStartDate="" setRelationshipStartDate={vi.fn()} setStep={vi.fn()} />)
    expect(screen.getByText('When did your relationship start?')).toBeDefined()
  })
})

describe('StepLoveLanguages', () => {
  async function load() {
    const mod = await import('./onboarding-steps')
    return mod.StepLoveLanguages
  }

  it('renders "Your Love Languages" heading', async () => {
    const Comp = await load()
    render(<Comp selectedLanguages={[]} setSelectedLanguages={vi.fn()} setStep={vi.fn()} />)
    expect(screen.getByText('Your Love Languages')).toBeDefined()
  })

  it('renders all 6 language options', async () => {
    const Comp = await load()
    render(<Comp selectedLanguages={[]} setSelectedLanguages={vi.fn()} setStep={vi.fn()} />)
    expect(screen.getByText('Words of Affirmation')).toBeDefined()
    expect(screen.getByText('Acts of Service')).toBeDefined()
    expect(screen.getByText('Receiving Gifts')).toBeDefined()
    expect(screen.getByText('Quality Time')).toBeDefined()
    expect(screen.getByText('Physical Touch')).toBeDefined()
    expect(screen.getByText('Custom')).toBeDefined()
  })
})
