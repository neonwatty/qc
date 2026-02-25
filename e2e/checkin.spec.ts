import { test, expect } from './auth'

test.describe('Check-In Flow', () => {
  test.describe('Check-in landing page (authenticated with couple)', () => {
    test('renders main heading', async ({ authedPage: page }) => {
      await page.goto('/checkin')

      await expect(page.getByRole('heading', { name: /relationship check-in/i })).toBeVisible()
    })

    test('displays introductory description', async ({ authedPage: page }) => {
      await page.goto('/checkin')

      await expect(page.getByText(/take a few minutes to reflect on your relationship/i)).toBeVisible()
    })

    test('displays quick start section', async ({ authedPage: page }) => {
      await page.goto('/checkin')

      await expect(page.getByRole('heading', { name: /quick check-in/i })).toBeVisible()
      await expect(page.getByText(/typically takes 5-10 minutes/i)).toBeVisible()
      await expect(page.getByText(/best done together/i)).toBeVisible()
    })

    test('start now button is visible', async ({ authedPage: page }) => {
      await page.goto('/checkin')

      await expect(page.getByRole('button', { name: /now/i })).toBeVisible()
    })

    test('displays all check-in categories', async ({ authedPage: page }) => {
      await page.goto('/checkin')

      await expect(page.getByRole('heading', { name: 'Communication', exact: true })).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Quality Time', exact: true })).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Future Planning', exact: true })).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Challenges', exact: true })).toBeVisible()
    })

    test('displays category descriptions', async ({ authedPage: page }) => {
      await page.goto('/checkin')

      await expect(page.getByText(/how we talk and listen to each other/i)).toBeVisible()
      await expect(page.getByText(/spending meaningful time together/i)).toBeVisible()
      await expect(page.getByText(/goals, dreams, and plans ahead/i)).toBeVisible()
      await expect(page.getByText(/issues or concerns we need to address/i)).toBeVisible()
    })

    test('displays topic exploration heading', async ({ authedPage: page }) => {
      await page.goto('/checkin')

      await expect(page.getByText(/choose a specific topic to explore/i)).toBeVisible()
    })

    test('can select a category and see start discussion prompt', async ({ authedPage: page }) => {
      await page.goto('/checkin')

      // Click on Communication category
      await page.getByRole('heading', { name: 'Communication', exact: true }).click()

      // Should show the "Ready to explore" prompt
      await expect(page.getByText(/ready to explore communication/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /start discussion/i })).toBeVisible()
    })

    test('can deselect a category by clicking it again', async ({ authedPage: page }) => {
      await page.goto('/checkin')

      // Select and then deselect
      await page.getByRole('heading', { name: 'Communication', exact: true }).click()
      await expect(page.getByText(/ready to explore/i)).toBeVisible()

      await page.getByRole('heading', { name: 'Communication', exact: true }).click()
      await expect(page.getByText(/ready to explore/i)).not.toBeVisible()
    })

    test('prepare topics button is visible when no topics prepared', async ({ authedPage: page }) => {
      await page.goto('/checkin')

      await expect(page.getByRole('button', { name: /topics/i })).toBeVisible()
    })
  })

  test.describe('Session rules section (authenticated with couple and settings)', () => {
    test('shows session rules when settings exist', async ({ authedPage: page }) => {
      await page.goto('/checkin')

      // SessionRulesSection only renders when sessionSettings is truthy
      // This test verifies the heading appears when settings are present
      await expect(page.getByText(/your session rules/i)).toBeVisible()
    })

    test('session rules section has configure link to settings', async ({ authedPage: page }) => {
      await page.goto('/checkin')

      const configureLink = page.getByRole('link', { name: /configure|edit/i })
      await expect(configureLink).toBeVisible()
    })
  })
})
