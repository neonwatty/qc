import { test, expect } from './auth'

test.describe('Reminders — Page structure', () => {
  test('renders heading', async ({ authedPage: page }) => {
    await page.goto('/reminders')

    await expect(page.getByRole('heading', { name: /^reminders$/i })).toBeVisible()
  })

  test('renders New Reminder button', async ({ authedPage: page }) => {
    await page.goto('/reminders')

    await expect(page.getByRole('button', { name: /new reminder/i })).toBeVisible()
  })

  test('filter tabs visible: all, active, inactive', async ({ authedPage: page }) => {
    await page.goto('/reminders')

    await expect(page.getByRole('button', { name: /^all$/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /^active$/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /^inactive$/i })).toBeVisible()
  })
})

test.describe('Reminders — Seed display', () => {
  test('displays "Weekly Check-In" reminder', async ({ authedPage: page }) => {
    await page.goto('/reminders')

    await expect(page.getByText(/weekly check-in/i).first()).toBeVisible()
  })

  test('displays "Anniversary Coming Up!" reminder', async ({ authedPage: page }) => {
    await page.goto('/reminders')

    await expect(page.getByText(/anniversary coming up/i).first()).toBeVisible()
  })

  test('shows category badge on reminders', async ({ authedPage: page }) => {
    await page.goto('/reminders')

    await expect(page.getByText('check-in', { exact: true })).toBeVisible()
    await expect(page.getByText('special-date', { exact: true })).toBeVisible()
  })

  test('shows frequency info on reminders', async ({ authedPage: page }) => {
    await page.goto('/reminders')

    await expect(page.getByText('Weekly').first()).toBeVisible()
    await expect(page.getByText('One-time').first()).toBeVisible()
  })
})

test.describe('Reminders — Filtering', () => {
  test('active filter shows both reminders (both active)', async ({ authedPage: page }) => {
    await page.goto('/reminders')

    await page.getByRole('button', { name: /^active$/i }).click()

    await expect(page.getByText(/weekly check-in/i).first()).toBeVisible()
    await expect(page.getByText(/anniversary coming up/i).first()).toBeVisible()
  })

  test('inactive filter shows empty state', async ({ authedPage: page }) => {
    await page.goto('/reminders')

    await page.getByRole('button', { name: /^inactive$/i }).click()

    await expect(page.getByText(/no inactive reminders/i)).toBeVisible()
  })
})

test.describe('Reminders — New Reminder form', () => {
  test('clicking New Reminder reveals form', async ({ authedPage: page }) => {
    await page.goto('/reminders')

    await page.getByRole('button', { name: /new reminder/i }).click()

    await expect(page.getByRole('heading', { name: /new reminder/i })).toBeVisible()
  })

  test('form shows title, category, frequency, scheduled for inputs', async ({ authedPage: page }) => {
    await page.goto('/reminders')

    await page.getByRole('button', { name: /new reminder/i }).click()

    await expect(page.getByLabel(/^title$/i)).toBeVisible()
    await expect(page.getByLabel(/category/i)).toBeVisible()
    await expect(page.getByLabel(/frequency/i)).toBeVisible()
    await expect(page.getByLabel(/scheduled for/i)).toBeVisible()
  })

  test('form shows Create Reminder submit button', async ({ authedPage: page }) => {
    await page.goto('/reminders')

    await page.getByRole('button', { name: /new reminder/i }).click()

    await expect(page.getByRole('button', { name: /create reminder/i })).toBeVisible()
  })

  test('clicking Cancel hides the form', async ({ authedPage: page }) => {
    await page.goto('/reminders')

    await page.getByRole('button', { name: /new reminder/i }).click()
    await expect(page.getByRole('heading', { name: /new reminder/i })).toBeVisible()

    // The button toggles between "New Reminder" and "Cancel"
    await page.getByRole('button', { name: /cancel/i }).click()
    await expect(page.getByRole('heading', { name: /new reminder/i })).not.toBeVisible()
  })
})

test.describe.serial('Reminders — CRUD', () => {
  const testTitle = 'E2E Test Reminder Playwright'

  test('creates a new reminder via the form', async ({ authedPage: page }) => {
    await page.goto('/reminders')

    await page.getByRole('button', { name: /new reminder/i }).click()

    await page.getByLabel(/^title$/i).fill(testTitle)

    // Set scheduled_for to a future date
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateStr = tomorrow.toISOString().slice(0, 16) // YYYY-MM-DDTHH:mm
    await page.getByLabel(/scheduled for/i).fill(dateStr)

    await page.getByRole('button', { name: /create reminder/i }).click()

    // Form should close after successful creation
    await expect(page.getByRole('heading', { name: /new reminder/i })).not.toBeVisible({ timeout: 15000 })
  })

  test('new reminder appears in list after reload', async ({ authedPage: page }) => {
    await page.goto('/reminders')

    await expect(page.getByText(testTitle).first()).toBeVisible({ timeout: 15000 })
  })

  test('pauses the created reminder (Pause button)', async ({ authedPage: page }) => {
    await page.goto('/reminders')

    // Wait for the test reminder to be visible
    await expect(page.getByText(testTitle).first()).toBeVisible({ timeout: 15000 })

    // Find the card containing the test reminder
    const card = page.locator('.rounded-lg', { has: page.getByText(testTitle) }).first()
    await card.getByRole('button', { name: /pause/i }).click()

    // After pausing, the button text should change to "Resume"
    await expect(card.getByRole('button', { name: /resume/i })).toBeVisible({ timeout: 10000 })

    // Reload to verify the pause persisted to the database
    await page.reload()
    await expect(page.getByText(testTitle).first()).toBeVisible({ timeout: 15000 })
    const reloadedCard = page.locator('.rounded-lg', { has: page.getByText(testTitle) }).first()
    await expect(reloadedCard.getByRole('button', { name: /resume/i })).toBeVisible({ timeout: 10000 })
  })

  test('inactive filter shows the paused reminder', async ({ authedPage: page }) => {
    await page.goto('/reminders')

    // Wait for reminders to load before filtering
    await expect(page.getByText(/weekly check-in/i).first()).toBeVisible({ timeout: 15000 })

    await page.getByRole('button', { name: /^inactive$/i }).click()

    await expect(page.getByText(testTitle).first()).toBeVisible({ timeout: 15000 })
  })

  test('deletes the created reminder', async ({ authedPage: page }) => {
    await page.goto('/reminders')

    // The reminder was paused in the previous test — switch to inactive to find it
    await page.getByRole('button', { name: /^inactive$/i }).click()
    await expect(page.getByText(testTitle).first()).toBeVisible({ timeout: 15000 })

    const card = page.locator('.rounded-lg', { has: page.getByText(testTitle) }).first()
    await card.getByRole('button', { name: /delete/i }).click()

    await page.reload()
    await page.getByRole('button', { name: /^inactive$/i }).click()
    await expect(page.getByText(testTitle)).not.toBeVisible({ timeout: 10000 })
  })
})
