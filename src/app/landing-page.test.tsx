vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}))

vi.mock('lucide-react', () => ({
  Heart: () => <span data-testid="icon-heart" />,
}))

vi.mock('@/components/Landing/Hero', () => ({ Hero: () => <div data-testid="hero" /> }))
vi.mock('@/components/Landing/HowItWorks', () => ({ HowItWorks: () => <div data-testid="how-it-works" /> }))
vi.mock('@/components/Landing/SocialProof', () => ({ SocialProof: () => <div data-testid="social-proof" /> }))
vi.mock('@/components/Landing/FeatureGrid', () => ({ FeatureGrid: () => <div data-testid="feature-grid" /> }))
vi.mock('@/components/Landing/Footer', () => ({ Footer: () => <div data-testid="footer" /> }))

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('LandingPage', () => {
  async function renderLandingPage() {
    const { LandingPage } = await import('./landing-page')
    return render(<LandingPage />)
  }

  it('renders "QC" brand text', async () => {
    await renderLandingPage()
    expect(screen.getByText('QC')).toBeDefined()
  })

  it('renders "Sign In" link with href="/login"', async () => {
    await renderLandingPage()
    const link = screen.getByText('Sign In').closest('a')
    expect(link).toBeDefined()
    expect(link?.getAttribute('href')).toBe('/login')
  })

  it('renders "Sign Up" link with href="/signup"', async () => {
    await renderLandingPage()
    const link = screen.getByText('Sign Up').closest('a')
    expect(link).toBeDefined()
    expect(link?.getAttribute('href')).toBe('/signup')
  })

  it('renders Hero component', async () => {
    await renderLandingPage()
    expect(screen.getByTestId('hero')).toBeDefined()
  })

  it('renders FeatureGrid component', async () => {
    await renderLandingPage()
    expect(screen.getByTestId('feature-grid')).toBeDefined()
  })

  it('renders Footer component', async () => {
    await renderLandingPage()
    expect(screen.getByTestId('footer')).toBeDefined()
  })
})
