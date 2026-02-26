import { type Page } from '@playwright/test'
import { test, expect } from './auth'

/**
 * Navigate to /checkin and ensure we start from the landing page.
 * If a previous check-in session is still active, abandon it first.
 * Waits for async data loading to stabilize before returning.
 */
async function goToCheckinLanding(page: Page): Promise<void> {
  await page.goto('/checkin')
  await page.waitForURL('**/checkin')

  // Wait for network requests to settle so the CheckInProvider finishes
  // loading any active session from the database.
  await page.waitForLoadState('networkidle')

  const landingHeading = page.getByRole('heading', { name: /relationship check-in/i })

  // Check if the wizard is active by looking for the "categories selected" text
  // which only appears in the CategorySelectionStep within the wizard.
  const wizardIndicator = page.getByText(/categories selected/i)

  // Wait for either the landing heading or the wizard indicator to appear
  await expect(landingHeading.or(wizardIndicator)).toBeVisible({ timeout: 15000 })

  if (await wizardIndicator.isVisible()) {
    // Wizard is active -- click the Cancel (back) button to abandon the session.
    // Use force:true because Framer Motion animations may cause the button
    // to be detached and re-created during rendering.
    await page.getByRole('button', { name: /cancel/i }).click({ force: true })
    // After abandoning, reload the page to ensure a clean state
    await page.goto('/checkin')
    await page.waitForURL('**/checkin')
    await page.waitForLoadState('networkidle')
    await expect(landingHeading).toBeVisible({ timeout: 15000 })
  }
}

test.describe('Check-In Flow - Landing Page', () => {
  test.describe('Check-in landing page (authenticated with couple)', () => {
    test('renders main heading', async ({ authedPage: page }) => {
      await goToCheckinLanding(page)

      await expect(page.getByRole('heading', { name: /relationship check-in/i })).toBeVisible()
    })

    test('displays introductory description', async ({ authedPage: page }) => {
      await goToCheckinLanding(page)

      await expect(page.getByText(/take a few minutes to reflect on your relationship/i)).toBeVisible()
    })

    test('displays quick start section', async ({ authedPage: page }) => {
      await goToCheckinLanding(page)

      await expect(page.getByRole('heading', { name: /quick check-in/i })).toBeVisible()
      await expect(page.getByText(/typically takes 5-10 minutes/i)).toBeVisible()
      await expect(page.getByText(/best done together/i)).toBeVisible()
    })

    test('start now button is visible', async ({ authedPage: page }) => {
      await goToCheckinLanding(page)

      await expect(page.getByRole('button', { name: /now/i })).toBeVisible()
    })

    test('displays all check-in categories', async ({ authedPage: page }) => {
      await goToCheckinLanding(page)

      await expect(page.getByRole('heading', { name: 'Communication', exact: true })).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Quality Time', exact: true })).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Future Planning', exact: true })).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Challenges', exact: true })).toBeVisible()
    })

    test('displays category descriptions', async ({ authedPage: page }) => {
      await goToCheckinLanding(page)

      await expect(page.getByText(/how we talk and listen to each other/i)).toBeVisible()
      await expect(page.getByText(/spending meaningful time together/i)).toBeVisible()
      await expect(page.getByText(/goals, dreams, and plans ahead/i)).toBeVisible()
      await expect(page.getByText(/issues or concerns we need to address/i)).toBeVisible()
    })

    test('displays topic exploration heading', async ({ authedPage: page }) => {
      await goToCheckinLanding(page)

      await expect(page.getByText(/choose a specific topic to explore/i)).toBeVisible()
    })

    test('can select a category and see start discussion prompt', async ({ authedPage: page }) => {
      await goToCheckinLanding(page)

      // Click on Communication category
      await page.getByRole('heading', { name: 'Communication', exact: true }).click()

      // Should show the "Ready to explore" prompt
      await expect(page.getByText(/ready to explore communication/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /start discussion/i })).toBeVisible()
    })

    test('can deselect a category by clicking it again', async ({ authedPage: page }) => {
      await goToCheckinLanding(page)

      // Select and then deselect
      await page.getByRole('heading', { name: 'Communication', exact: true }).click()
      await expect(page.getByText(/ready to explore/i)).toBeVisible()

      await page.getByRole('heading', { name: 'Communication', exact: true }).click()
      await expect(page.getByText(/ready to explore/i)).not.toBeVisible()
    })

    test('prepare topics button is visible when no topics prepared', async ({ authedPage: page }) => {
      await goToCheckinLanding(page)

      await expect(page.getByRole('button', { name: /topics/i })).toBeVisible()
    })
  })
})

test.describe('Check-In Flow - Wizard', () => {
  test.describe('Check-in wizard flow', () => {
    // Wizard tests create check-in sessions that must be cleaned up between tests.
    // Run serially so sessions don't interfere with each other.
    test.describe.configure({ mode: 'serial' })

    test('clicking Start Now begins a check-in session', async ({ authedPage: page }) => {
      await goToCheckinLanding(page)

      // Wait for categories to load (ensures the landing page is fully rendered)
      await expect(page.getByRole('heading', { name: 'Communication', exact: true })).toBeVisible({ timeout: 10000 })

      await page.getByRole('button', { name: /now/i }).click()

      // Landing heading should disappear and category selection step should appear
      await expect(page.getByRole('heading', { name: /relationship check-in/i })).not.toBeVisible({ timeout: 10000 })
      // Quick start pre-selects all 4 categories
      await expect(page.getByText(/4 categories selected/i)).toBeVisible({ timeout: 10000 })
    })

    test('category selection step shows categories and navigation', async ({ authedPage: page }) => {
      await goToCheckinLanding(page)
      await expect(page.getByRole('heading', { name: 'Communication', exact: true })).toBeVisible({ timeout: 10000 })
      await page.getByRole('button', { name: /now/i }).click()

      // Wait for category selection to load
      await expect(page.getByText(/4 categories selected/i)).toBeVisible({ timeout: 10000 })

      // All 4 seeded categories should be visible
      await expect(page.getByRole('heading', { name: 'Communication', exact: true })).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Quality Time', exact: true })).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Future Planning', exact: true })).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Challenges', exact: true })).toBeVisible()

      // Cancel button should be visible in NavigationControls
      await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible()
    })

    test('progresses through warm-up to discussion step', async ({ authedPage: page }) => {
      await goToCheckinLanding(page)
      await expect(page.getByRole('heading', { name: 'Communication', exact: true })).toBeVisible({ timeout: 10000 })
      await page.getByRole('button', { name: /now/i }).click()

      // Wait for category selection (all pre-selected from quick start)
      await expect(page.getByText(/4 categories selected/i)).toBeVisible({ timeout: 10000 })

      // Start discussion (categories are already selected by quick start)
      // The session starts on the 'welcome' step. The first click advances to 'category-selection',
      // the second click advances to 'warm-up'. Both steps render the CategorySelectionStep.
      const startButton = page.getByRole('button', { name: /start discussion/i })
      await expect(startButton).toBeVisible({ timeout: 10000 })
      await startButton.click()
      // Wait for the button to reappear (step advances to 'category-selection', same component re-renders)
      await expect(startButton).toBeVisible({ timeout: 10000 })
      await startButton.click()

      // Warm-up step should appear (session_settings has warm_up_questions=true)
      await expect(page.getByRole('heading', { name: /warm-up questions/i })).toBeVisible({ timeout: 10000 })
      await expect(page.getByRole('button', { name: /shuffle/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /skip/i })).toBeVisible()

      // Continue through warm-up to discussion
      await page
        .getByRole('button', { name: /continue/i })
        .first()
        .click()

      // Discussion step should appear
      await expect(page.getByRole('button', { name: /continue to reflection/i })).toBeVisible({ timeout: 10000 })
    })

    test('completes full wizard from start to completion celebration', async ({ authedPage: page }) => {
      await goToCheckinLanding(page)
      await expect(page.getByRole('heading', { name: 'Communication', exact: true })).toBeVisible({ timeout: 10000 })
      await page.getByRole('button', { name: /now/i }).click()

      // Category selection: all pre-selected, click Start Discussion
      // First click advances from 'welcome' to 'category-selection', second from 'category-selection' to 'warm-up'
      await expect(page.getByText(/4 categories selected/i)).toBeVisible({ timeout: 10000 })
      const startBtn = page.getByRole('button', { name: /start discussion/i })
      await expect(startBtn).toBeVisible({ timeout: 10000 })
      await startBtn.click()
      await expect(startBtn).toBeVisible({ timeout: 10000 })
      await startBtn.click()

      // Warm-up: continue
      await expect(page.getByRole('heading', { name: /warm-up questions/i })).toBeVisible({ timeout: 10000 })
      await page
        .getByRole('button', { name: /continue/i })
        .first()
        .click()

      // Discussion: continue to reflection
      await expect(page.getByRole('button', { name: /continue to reflection/i })).toBeVisible({ timeout: 10000 })
      await page.getByRole('button', { name: /continue to reflection/i }).click()

      // Reflection: continue to action items
      await expect(page.getByRole('heading', { name: /reflection/i })).toBeVisible({ timeout: 10000 })
      await page.getByRole('button', { name: /continue to action items/i }).click()

      // Action items: continue to completion
      await expect(page.getByRole('heading', { name: /action items/i })).toBeVisible({ timeout: 10000 })
      await page.getByRole('button', { name: /continue/i }).click()

      // Completion celebration
      await expect(page.getByRole('heading', { name: /check-in complete/i })).toBeVisible({ timeout: 10000 })
      await expect(page.getByRole('button', { name: /go home/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /start another/i })).toBeVisible()
    })
  })
})

test.describe('Check-In Flow - Session Rules', () => {
  test.describe('Session rules section (authenticated with couple and settings)', () => {
    test('shows session rules when settings exist', async ({ authedPage: page }) => {
      await goToCheckinLanding(page)

      // SessionRulesSection only renders when sessionSettings is truthy
      // This test verifies the heading appears when settings are present
      await expect(page.getByText(/your session rules/i)).toBeVisible()
    })

    test('session rules section has configure link to settings', async ({ authedPage: page }) => {
      await goToCheckinLanding(page)

      const configureLink = page.getByRole('link', { name: /configure|edit/i })
      await expect(configureLink).toBeVisible()
    })
  })
})
