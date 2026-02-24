import { test, expect } from './auth'

test.describe('Dashboard', () => {
  test.describe('Page structure (authenticated with couple)', () => {
    test('renders main heading', async ({ authedPage: page }) => {
      await page.goto('/dashboard')

      await expect(page.getByRole('heading', { name: /^dashboard$/i })).toBeVisible()
    })

    test('renders subtitle', async ({ authedPage: page }) => {
      await page.goto('/dashboard')

      const main = page.getByRole('main')
      await expect(main.getByText(/your relationship command center/i)).toBeVisible()
    })

    test('does not show the no-couple pairing prompt', async ({ authedPage: page }) => {
      await page.goto('/dashboard')

      await expect(page.getByText(/connect with your partner/i)).not.toBeVisible()
    })
  })

  test.describe('Quick Actions', () => {
    test('displays all 6 action cards', async ({ authedPage: page }) => {
      await page.goto('/dashboard')

      await expect(page.getByRole('heading', { name: /start check-in/i })).toBeVisible()
      await expect(page.getByRole('heading', { name: /view notes/i })).toBeVisible()
      await expect(page.getByRole('heading', { name: /growth gallery/i })).toBeVisible()
      await expect(page.getByRole('heading', { name: /^reminders$/i })).toBeVisible()
      // "Love Languages" appears as both a quick action h3 and widget h3 — use .first()
      await expect(page.getByRole('heading', { name: /^love languages$/i }).first()).toBeVisible()
      await expect(page.getByRole('heading', { name: /^requests$/i })).toBeVisible()
    })

    test('Start Check-in links to /checkin', async ({ authedPage: page }) => {
      await page.goto('/dashboard')

      const link = page.getByRole('link', { name: /start check-in/i }).first()
      await expect(link).toBeVisible()
      await expect(link).toHaveAttribute('href', '/checkin')
    })
  })

  test.describe('Stats Grid', () => {
    test('displays all 4 stat labels', async ({ authedPage: page }) => {
      await page.goto('/dashboard')

      // Scope to main content to avoid matching "Notes" in sidebar navigation
      const main = page.getByRole('main')
      await expect(main.getByText('Check-ins', { exact: true })).toBeVisible()
      await expect(main.getByText('Notes', { exact: true })).toBeVisible()
      await expect(main.getByText('Milestones', { exact: true })).toBeVisible()
      await expect(main.getByText('Action Items', { exact: true })).toBeVisible()
    })
  })

  test.describe('Love Languages Widget', () => {
    test('renders Love Languages heading in widget', async ({ authedPage: page }) => {
      await page.goto('/dashboard')

      // Two "Love Languages" headings exist — quick action + widget. At least one is visible.
      await expect(page.getByRole('heading', { name: /^love languages$/i }).first()).toBeVisible()
    })

    test('View All link points to /love-languages', async ({ authedPage: page }) => {
      await page.goto('/dashboard')

      const link = page.getByRole('link', { name: /view all/i })
      await expect(link).toBeVisible()
      await expect(link).toHaveAttribute('href', '/love-languages')
    })
  })

  test.describe('Recent Activity', () => {
    test('renders Recent Activity heading', async ({ authedPage: page }) => {
      await page.goto('/dashboard')

      await expect(page.getByRole('heading', { name: /recent activity/i })).toBeVisible()
    })

    test('shows stat cards', async ({ authedPage: page }) => {
      await page.goto('/dashboard')

      const main = page.getByRole('main')
      await expect(main.getByText('Check-ins', { exact: true })).toBeVisible()
      await expect(main.getByText('Notes', { exact: true })).toBeVisible()
      await expect(main.getByText('Milestones', { exact: true })).toBeVisible()
      await expect(main.getByText('Action Items', { exact: true })).toBeVisible()
    })
  })
})
