vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}))

vi.mock('lucide-react', () => ({
  Heart: () => <span data-testid="icon-heart" />,
}))

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Footer', () => {
  async function renderFooter() {
    const { Footer } = await import('./Footer')
    return render(<Footer />)
  }

  it('renders "QC" brand name', async () => {
    await renderFooter()
    expect(screen.getByText('QC')).toBeDefined()
  })

  it('renders brand description containing "Quality Control for your relationship"', async () => {
    await renderFooter()
    expect(
      screen.getByText('Quality Control for your relationship. Simple tools to build a stronger connection together.'),
    ).toBeDefined()
  })

  it('renders "Product" section heading', async () => {
    await renderFooter()
    expect(screen.getByText('Product')).toBeDefined()
  })

  it('renders Features and How It Works anchor links', async () => {
    await renderFooter()
    const featuresLink = screen.getByText('Features').closest('a')
    expect(featuresLink?.getAttribute('href')).toBe('#features')
    const howLink = screen.getByText('How It Works').closest('a')
    expect(howLink?.getAttribute('href')).toBe('#how-it-works')
  })

  it('renders Sign Up link to /signup and Sign In link to /login', async () => {
    await renderFooter()
    const signUpLink = screen.getByText('Sign Up').closest('a')
    expect(signUpLink?.getAttribute('href')).toBe('/signup')
    const signInLink = screen.getByText('Sign In').closest('a')
    expect(signInLink?.getAttribute('href')).toBe('/login')
  })

  it('renders Legal section with Privacy Policy and Terms of Service links', async () => {
    await renderFooter()
    expect(screen.getByText('Legal')).toBeDefined()
    const privacyLink = screen.getByText('Privacy Policy').closest('a')
    expect(privacyLink?.getAttribute('href')).toBe('/privacy')
    const termsLink = screen.getByText('Terms of Service').closest('a')
    expect(termsLink?.getAttribute('href')).toBe('/terms')
  })

  it('renders copyright text with current year', async () => {
    await renderFooter()
    const year = new Date().getFullYear()
    expect(screen.getByText(`\u00A9 ${year} QC. All rights reserved.`)).toBeDefined()
  })
})
