import { test, expect } from '@playwright/test'

// TODO: Add auth setup helper
// These tests require an authenticated user WITH a couple_id.
// In CI, this would use a Supabase seed user (TEST_USER from fixtures.ts)
// with a valid auth session cookie injected via storageState or a login helper.

test.describe('Check-In Flow', () => {
  // Skip tests that require auth until auth fixture is implemented
  // Remove .skip and add auth setup when ready
  test.describe.skip('Check-in landing page (authenticated with couple)', () => {
    test('renders main heading', async ({ page }) => {
      await page.goto('/checkin')

      await expect(page.getByRole('heading', { name: /relationship check-in/i })).toBeVisible()
    })

    test('displays introductory description', async ({ page }) => {
      await page.goto('/checkin')

      await expect(page.getByText(/take a few minutes to reflect on your relationship/i)).toBeVisible()
    })

    test('displays quick start section', async ({ page }) => {
      await page.goto('/checkin')

      await expect(page.getByText(/quick check-in/i)).toBeVisible()
      await expect(page.getByText(/typically takes 5-10 minutes/i)).toBeVisible()
      await expect(page.getByText(/best done together/i)).toBeVisible()
    })

    test('start now button is visible', async ({ page }) => {
      await page.goto('/checkin')

      await expect(page.getByRole('button', { name: /now/i })).toBeVisible()
    })

    test('displays all check-in categories', async ({ page }) => {
      await page.goto('/checkin')

      await expect(page.getByText('Emotional Connection')).toBeVisible()
      await expect(page.getByText('Communication')).toBeVisible()
      await expect(page.getByText('Physical & Emotional Intimacy')).toBeVisible()
      await expect(page.getByText('Shared Goals & Future')).toBeVisible()
    })

    test('displays category descriptions', async ({ page }) => {
      await page.goto('/checkin')

      await expect(page.getByText(/how connected and understood do you feel/i)).toBeVisible()
      await expect(page.getByText(/how well are you communicating/i)).toBeVisible()
      await expect(page.getByText(/how satisfied are you with closeness/i)).toBeVisible()
      await expect(page.getByText(/are you aligned on your future/i)).toBeVisible()
    })

    test('displays topic exploration heading', async ({ page }) => {
      await page.goto('/checkin')

      await expect(page.getByText(/choose a specific topic to explore/i)).toBeVisible()
    })

    test('can select a category and see start discussion prompt', async ({ page }) => {
      await page.goto('/checkin')

      // Click on Emotional Connection category
      await page.getByText('Emotional Connection').click()

      // Should show the "Ready to explore" prompt
      await expect(page.getByText(/ready to explore emotional connection/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /start discussion/i })).toBeVisible()
    })

    test('can deselect a category by clicking it again', async ({ page }) => {
      await page.goto('/checkin')

      // Select and then deselect
      await page.getByText('Emotional Connection').click()
      await expect(page.getByText(/ready to explore/i)).toBeVisible()

      await page.getByText('Emotional Connection').click()
      await expect(page.getByText(/ready to explore/i)).not.toBeVisible()
    })

    test('prepare topics button is visible when no topics prepared', async ({ page }) => {
      await page.goto('/checkin')

      await expect(page.getByRole('button', { name: /topics/i })).toBeVisible()
    })
  })

  test.describe.skip('Session rules section (authenticated with couple and settings)', () => {
    test('shows session rules when settings exist', async ({ page }) => {
      await page.goto('/checkin')

      // SessionRulesSection only renders when sessionSettings is truthy
      // This test verifies the heading appears when settings are present
      await expect(page.getByText(/your session rules/i)).toBeVisible()
    })

    test('session rules section has configure link to settings', async ({ page }) => {
      await page.goto('/checkin')

      const configureLink = page.getByRole('link', { name: /configure|edit/i })
      await expect(configureLink).toBeVisible()
    })
  })
})
