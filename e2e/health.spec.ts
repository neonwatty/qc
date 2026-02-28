import { test, expect } from '@playwright/test'

test.describe('Health & Smoke Tests', () => {
  test.describe('API Health', () => {
    test('GET /api/health returns 200 with status ok', async ({ request }) => {
      const response = await request.get('/api/health')

      expect(response.status()).toBe(200)

      const body = await response.json()
      expect(body.status).toBe('ok')
      expect(body.timestamp).toBeDefined()
    })
  })

  test.describe('Landing Page', () => {
    test('loads with main headline', async ({ page }) => {
      await page.goto('/')

      await expect(page.getByRole('heading', { name: /quality control/i })).toBeVisible()
    })

    test('displays navigation with sign in and sign up links', async ({ page }) => {
      await page.goto('/')

      const nav = page.getByRole('navigation')
      await expect(nav.getByRole('link', { name: /sign in/i })).toBeVisible()
      await expect(nav.getByRole('link', { name: /sign up/i })).toBeVisible()
    })

    test('displays hero subtitle text', async ({ page }) => {
      await page.goto('/')

      await expect(page.getByText(/simple tools to build a stronger relationship together/i)).toBeVisible()
    })

    test('displays feature pills', async ({ page }) => {
      await page.goto('/')

      await expect(page.getByText('Structured Sessions').first()).toBeVisible()
      await expect(page.getByText('Relationship Reminders').first()).toBeVisible()
      await expect(page.getByText('Progress Tracking').first()).toBeVisible()
    })

    test('displays call-to-action buttons', async ({ page }) => {
      await page.goto('/')

      await expect(page.getByRole('link', { name: /start your journey/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /learn more/i })).toBeVisible()
    })

    test('start your journey links to signup', async ({ page }) => {
      await page.goto('/')

      const ctaLink = page.getByRole('link', { name: /start your journey/i })
      await expect(ctaLink).toHaveAttribute('href', '/signup')
    })

    test('displays feature grid section', async ({ page }) => {
      await page.goto('/')

      await expect(page.getByText('Guided Check-ins')).toBeVisible()
      await expect(page.getByText('Action Items')).toBeVisible()
      await expect(page.getByText('Privacy First')).toBeVisible()
    })
  })
})
