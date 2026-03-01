import { test, expect } from './auth'

// Compute month names dynamically to match seed data intervals
// Seed milestones: now()-14d, now()-1mo, now()-2d
function monthLabel(date: Date): RegExp {
  const label = date.toLocaleString('en-US', { month: 'long', year: 'numeric' })
  return new RegExp(label, 'i')
}

const now = new Date()
const minus14d = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
const minus1mo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
const minus2d = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)

// Unique month groups the 3 seed milestones fall into
const seedMonths = [
  ...new Set([minus14d, minus1mo, minus2d].map((d) => d.toLocaleString('en-US', { month: 'long', year: 'numeric' }))),
]
const currentMonth = monthLabel(now)

test.describe('Growth Gallery — Page structure', () => {
  test('renders main heading', async ({ authedPage: page }) => {
    await page.goto('/growth')

    await expect(page.getByRole('heading', { name: /growth gallery/i })).toBeVisible()
  })

  test('renders New Milestone button', async ({ authedPage: page }) => {
    await page.goto('/growth')

    await expect(page.getByRole('button', { name: /new milestone/i })).toBeVisible()
  })

  test('Timeline, Progress, Memories view buttons visible', async ({ authedPage: page }) => {
    await page.goto('/growth')

    await expect(page.getByRole('button', { name: /timeline/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /progress/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /memories/i })).toBeVisible()
  })
})

test.describe('Growth Gallery — Stats grid', () => {
  test('displays Milestones Reached count', async ({ authedPage: page }) => {
    await page.goto('/growth')

    await expect(page.getByText('Milestones Reached').first()).toBeVisible()
  })

  test('displays Total Points count', async ({ authedPage: page }) => {
    await page.goto('/growth')

    await expect(page.getByText('Total Points').first()).toBeVisible()
  })
})

test.describe('Growth Gallery — Timeline view (default)', () => {
  test('displays all 3 seed milestones', async ({ authedPage: page }) => {
    await page.goto('/growth')

    // Expand all month groups that seed milestones fall into
    for (const month of seedMonths) {
      const btn = page.getByRole('button', { name: new RegExp(month, 'i') })
      await expect(btn).toBeVisible({ timeout: 15000 })
      await btn.click()
    }

    await expect(page.getByText(/first check-in/i).first()).toBeVisible()
    await expect(page.getByText(/6-month anniversary/i).first()).toBeVisible()
    await expect(page.getByText(/three in a row/i).first()).toBeVisible()
  })

  test('filter buttons visible', async ({ authedPage: page }) => {
    await page.goto('/growth')

    await expect(page.getByRole('button', { name: /^All/i }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /relationship/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /communication/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /^Growth/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /^Milestone/i })).toBeVisible()
  })

  test('sort buttons visible', async ({ authedPage: page }) => {
    await page.goto('/growth')

    await expect(page.getByRole('button', { name: /newest/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /oldest/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /category/i })).toBeVisible()
  })

  test('clicking Communication filter shows First Check-In', async ({ authedPage: page }) => {
    await page.goto('/growth')

    // Wait for month groups to load
    const firstMonth = page.getByRole('button', { name: monthLabel(minus14d) })
    await expect(firstMonth).toBeVisible({ timeout: 15000 })

    await page.getByRole('button', { name: /communication/i }).click()

    // After filtering, expand the visible month group (First Check-In = now - 14 days)
    const monthBtn = page.getByRole('button', { name: monthLabel(minus14d) })
    await monthBtn.click()

    await expect(page.getByText(/first check-in/i).first()).toBeVisible()
  })

  test('clicking Growth filter shows Three in a Row', async ({ authedPage: page }) => {
    await page.goto('/growth')

    // Wait for milestones to load (month groups appear)
    await expect(page.getByRole('button', { name: monthLabel(minus2d) })).toBeVisible({ timeout: 15000 })

    await page.getByRole('button', { name: /^Growth/i }).click()

    // "Three in a Row" achieved_at is now() - 2 days
    const monthBtn = page.getByRole('button', { name: monthLabel(minus2d) })
    await expect(monthBtn).toBeVisible({ timeout: 10000 })
    await monthBtn.click()

    await expect(page.getByText(/three in a row/i).first()).toBeVisible()
  })
})

test.describe('Growth Gallery — Progress view', () => {
  test('clicking Progress tab shows milestone completion stats', async ({ authedPage: page }) => {
    await page.goto('/growth')

    await page.getByRole('button', { name: /progress/i }).click()

    await expect(page.getByText(/milestones complete/i).first()).toBeVisible({ timeout: 15000 })
    await expect(page.getByText(/milestones upcoming/i).first()).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/completion rate/i).first()).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Growth Gallery — Memories view', () => {
  test('clicking Memories tab shows photos section', async ({ authedPage: page }) => {
    await page.goto('/growth')

    await page.getByRole('button', { name: /memories/i }).click()

    // All 3 milestones have icons but no photos — the gallery shows icon-based items in "All" filter
    await expect(page.getByText(/photos/i).first()).toBeVisible()
  })
})

test.describe('Growth Gallery — New Milestone modal', () => {
  test('clicking New Milestone opens creation modal', async ({ authedPage: page }) => {
    await page.goto('/growth')

    await page.getByRole('button', { name: /new milestone/i }).click()

    await expect(page.getByText(/create new milestone/i)).toBeVisible()
  })

  test('modal shows Title and Description fields', async ({ authedPage: page }) => {
    await page.goto('/growth')

    await page.getByRole('button', { name: /new milestone/i }).click()

    await expect(page.getByPlaceholder(/first month of check-ins/i)).toBeVisible()
    await expect(page.getByPlaceholder(/describe this milestone/i)).toBeVisible()
  })

  test('Cancel button closes the modal', async ({ authedPage: page }) => {
    await page.goto('/growth')

    await page.getByRole('button', { name: /new milestone/i }).click()
    await expect(page.getByText(/create new milestone/i)).toBeVisible()

    await page.getByRole('button', { name: /cancel/i }).click()
    await expect(page.getByText(/create new milestone/i)).not.toBeVisible()
  })
})

test.describe.serial('Growth Gallery — CRUD', () => {
  const testTitle = 'E2E Test Milestone Playwright'
  const testDescription = 'Automated E2E test milestone description here'

  test('creates a new milestone via the form', async ({ authedPage: page }) => {
    await page.goto('/growth')

    await page.getByRole('button', { name: /new milestone/i }).click()
    await expect(page.getByText(/create new milestone/i)).toBeVisible()

    await page.getByPlaceholder(/first month of check-ins/i).fill(testTitle)
    await page.getByPlaceholder(/describe this milestone/i).fill(testDescription)

    // Select a category — target the category grid button inside the modal (has emoji + name)
    const modal = page.locator('[class*="fixed"]').filter({ hasText: /create new milestone/i })
    await modal.locator('button', { hasText: /Communication/ }).click()

    await page.getByRole('button', { name: /create milestone/i }).click()

    // Wait for celebration overlay or modal to close
    await expect(page.getByText(/create new milestone/i)).not.toBeVisible({ timeout: 15000 })
  })

  test('new milestone appears in timeline after reload', async ({ authedPage: page }) => {
    await page.goto('/growth')

    // New milestone will be in the current month group — expand it
    const monthBtn = page.getByRole('button', { name: currentMonth })
    await expect(monthBtn).toBeVisible({ timeout: 15000 })
    await monthBtn.click()

    await expect(page.getByText(testTitle).first()).toBeVisible({ timeout: 15000 })
  })
})
