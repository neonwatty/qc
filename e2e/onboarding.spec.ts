import { test, expect } from './auth'

test.describe('Onboarding Flow', () => {
  test.describe('Authenticated user without couple', () => {
    test('renders welcome heading and step indicator', async ({ noCoupleAuthedPage: page }) => {
      await expect(page.getByRole('heading', { name: /welcome to qc/i })).toBeVisible()
      await expect(page.getByText(/set up your couple profile/i)).toBeVisible()
    })

    test('step 1: displays name input with continue button', async ({ noCoupleAuthedPage: page }) => {
      await expect(page.getByLabel(/your display name/i)).toBeVisible()
      await expect(page.getByPlaceholder(/how should your partner see you/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /continue/i })).toBeVisible()
    })

    test('step 1: continue button is disabled when name is empty', async ({ noCoupleAuthedPage: page }) => {
      const continueButton = page.getByRole('button', { name: /continue/i })
      await expect(continueButton).toBeDisabled()
    })

    test('step 1: can enter display name and proceed to step 2', async ({ noCoupleAuthedPage: page }) => {
      await page.getByLabel(/your display name/i).fill('Test User')
      await page.getByRole('button', { name: /continue/i }).click()

      // Step 2 should show partner email field
      await expect(page.getByLabel(/partner.*email/i)).toBeVisible()
    })

    test('step 2: displays partner email input', async ({ noCoupleAuthedPage: page }) => {
      // Navigate to step 2
      await page.getByLabel(/your display name/i).fill('Test User')
      await page.getByRole('button', { name: /continue/i }).click()

      await expect(page.getByPlaceholder('partner@example.com')).toBeVisible()
      await expect(page.getByText(/we will send them an invite/i)).toBeVisible()
    })

    test('step 2: has back and continue buttons', async ({ noCoupleAuthedPage: page }) => {
      // Navigate to step 2
      await page.getByLabel(/your display name/i).fill('Test User')
      await page.getByRole('button', { name: /continue/i }).click()

      await expect(page.getByRole('button', { name: /back/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /continue/i })).toBeVisible()
    })

    test('step 2: back button returns to step 1', async ({ noCoupleAuthedPage: page }) => {
      // Navigate to step 2
      await page.getByLabel(/your display name/i).fill('Test User')
      await page.getByRole('button', { name: /continue/i }).click()

      // Go back
      await page.getByRole('button', { name: /back/i }).click()

      // Should see step 1 content again
      await expect(page.getByLabel(/your display name/i)).toBeVisible()
    })

    test('step 3: displays relationship start date input', async ({ noCoupleAuthedPage: page }) => {
      // Navigate through steps 1 and 2
      await page.getByLabel(/your display name/i).fill('Test User')
      await page.getByRole('button', { name: /continue/i }).click()

      await page.getByLabel(/partner.*email/i).fill('partner@example.com')
      await page.getByRole('button', { name: /continue/i }).click()

      // Step 3 content
      await expect(page.getByLabel(/when did your relationship start/i)).toBeVisible()
      await expect(page.getByText(/optional.*milestones/i)).toBeVisible()
    })

    test('step 3: has back and continue buttons', async ({ noCoupleAuthedPage: page }) => {
      // Navigate through steps 1 and 2
      await page.getByLabel(/your display name/i).fill('Test User')
      await page.getByRole('button', { name: /continue/i }).click()

      await page.getByLabel(/partner.*email/i).fill('partner@example.com')
      await page.getByRole('button', { name: /continue/i }).click()

      await expect(page.getByRole('button', { name: /back/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /continue/i })).toBeVisible()
    })

    test('shows step indicator with 7 steps', async ({ noCoupleAuthedPage: page }) => {
      // The step indicator renders 7 progress bars (name, partner, date, love languages, quiz, reminder, tour)
      const stepBars = page.locator('.rounded-full.h-2')
      await expect(stepBars).toHaveCount(7)
    })
  })

  test.describe('Onboarding page structure (no auth)', () => {
    test('unauthenticated user accessing /onboarding is allowed (public route)', async ({ page }) => {
      // /onboarding is in the PUBLIC_ROUTES list in middleware
      // so it should render without redirect to /login
      await page.goto('/onboarding')

      // Should not redirect to login
      await expect(page).not.toHaveURL(/\/login/)
    })
  })
})
