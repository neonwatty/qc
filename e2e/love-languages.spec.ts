import { test, expect } from './auth'

test.describe('Love Languages — Page structure', () => {
  test('renders main heading', async ({ authedPage: page }) => {
    await page.goto('/love-languages')

    await expect(page.getByRole('heading', { level: 1, name: /love languages/i })).toBeVisible({ timeout: 15000 })
  })

  test('renders subtitle about feeling loved', async ({ authedPage: page }) => {
    await page.goto('/love-languages')

    await expect(page.getByText(/discover and share the unique ways you feel loved/i)).toBeVisible()
  })

  test('renders Add Language button', async ({ authedPage: page }) => {
    await page.goto('/love-languages')

    await expect(page.getByRole('button', { name: /add language/i })).toBeVisible()
  })

  test('My Languages and Partner tabs visible', async ({ authedPage: page }) => {
    await page.goto('/love-languages')

    await expect(page.getByRole('tab', { name: /my languages/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /partner/i })).toBeVisible()
  })
})

test.describe('Love Languages — My Languages tab (default)', () => {
  test('shows Alice\'s "Words of Affirmation" card', async ({ authedPage: page }) => {
    await page.goto('/love-languages')

    await expect(page.getByText(/words of affirmation/i).first()).toBeVisible()
  })

  test('shows Alice\'s "Quality Time" card', async ({ authedPage: page }) => {
    await page.goto('/love-languages')

    await expect(page.getByText(/quality time/i).first()).toBeVisible()
  })

  test('shows importance badge (essential) on Words card', async ({ authedPage: page }) => {
    await page.goto('/love-languages')

    await expect(page.getByText('essential', { exact: true }).first()).toBeVisible()
  })

  test('shows Edit button on own cards', async ({ authedPage: page }) => {
    await page.goto('/love-languages')

    await expect(page.getByRole('button', { name: /edit/i }).first()).toBeVisible()
  })
})

test.describe("Love Languages — Partner's tab", () => {
  test("clicking Partner's tab shows Bob's languages", async ({ authedPage: page }) => {
    await page.goto('/love-languages')

    await page.getByRole('tab', { name: /partner/i }).click()

    await expect(page.getByText(/acts of service/i).first()).toBeVisible()
  })

  test('shows "Physical Touch" card', async ({ authedPage: page }) => {
    await page.goto('/love-languages')

    await page.getByRole('tab', { name: /partner/i }).click()

    await expect(page.getByText(/physical touch/i).first()).toBeVisible()
  })

  test('shows Suggest Action button (not edit/delete)', async ({ authedPage: page }) => {
    await page.goto('/love-languages')

    await page.getByRole('tab', { name: /partner/i }).click()

    await expect(page.getByRole('button', { name: /suggest action/i }).first()).toBeVisible()
  })
})

test.describe('Love Languages — Add Language dialog', () => {
  test('clicking Add Language opens dialog', async ({ authedPage: page }) => {
    await page.goto('/love-languages')

    await page.getByRole('button', { name: /add language/i }).click()

    await expect(page.getByRole('heading', { name: /add love language/i })).toBeVisible()
  })

  test('dialog shows Title and Description fields', async ({ authedPage: page }) => {
    await page.goto('/love-languages')

    await page.getByRole('button', { name: /add language/i }).click()

    await expect(page.getByLabel(/title/i)).toBeVisible()
    await expect(page.getByLabel(/description/i)).toBeVisible()
  })

  test('Cancel button closes the dialog', async ({ authedPage: page }) => {
    await page.goto('/love-languages')

    await page.getByRole('button', { name: /add language/i }).click()
    await expect(page.getByRole('heading', { name: /add love language/i })).toBeVisible()

    await page.getByRole('button', { name: /cancel/i }).click()
    await expect(page.getByRole('heading', { name: /add love language/i })).not.toBeVisible()
  })
})

test.describe.serial('Love Languages — CRUD', () => {
  const testTitle = 'E2E Test Language Playwright'

  test('creates a new love language via dialog form', async ({ authedPage: page }) => {
    await page.goto('/love-languages')

    await page.getByRole('button', { name: /add language/i }).click()
    await expect(page.getByRole('heading', { name: /add love language/i })).toBeVisible()

    await page.getByLabel(/title/i).fill(testTitle)

    await page.getByRole('button', { name: /add love language/i }).click()

    // Dialog should close
    await expect(page.getByRole('heading', { name: /add love language/i })).not.toBeVisible({ timeout: 15000 })
  })

  test('new language appears in My Languages after reload', async ({ authedPage: page }) => {
    await page.goto('/love-languages')

    await expect(page.getByText(testTitle).first()).toBeVisible({ timeout: 15000 })
  })
})
