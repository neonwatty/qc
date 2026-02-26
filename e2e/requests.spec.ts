import { test, expect } from './auth'

// Serial: CRUD tests mutate shared seed data (accept request), which races with parallel Received tab tests
test.describe.configure({ mode: 'serial' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

// Reset seed data before tests so the suite is idempotent across runs
test.beforeAll(async () => {
  if (!SERVICE_KEY) return
  const headers = { 'Content-Type': 'application/json', apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` }
  await fetch(`${SUPABASE_URL}/rest/v1/requests?title=eq.Plan a Surprise Date Night`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status: 'pending' }),
  })
  await fetch(`${SUPABASE_URL}/rest/v1/requests?title=like.E2E Test Request*`, { method: 'DELETE', headers })
})

test.describe('Requests — Page structure', () => {
  test('renders heading', async ({ authedPage: page }) => {
    await page.goto('/requests')

    await expect(page.getByRole('heading', { name: /^requests$/i })).toBeVisible()
  })

  test('renders New Request button', async ({ authedPage: page }) => {
    await page.goto('/requests')

    await expect(page.getByRole('button', { name: /new request/i })).toBeVisible()
  })

  test('received and sent tab buttons visible', async ({ authedPage: page }) => {
    await page.goto('/requests')

    await expect(page.getByRole('button', { name: /received/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /sent/i })).toBeVisible()
  })
})

test.describe('Requests — Received tab (default)', () => {
  test('displays "Plan a Surprise Date Night" request', async ({ authedPage: page }) => {
    await page.goto('/requests')

    await expect(page.getByText(/plan a surprise date night/i).first()).toBeVisible()
  })

  test('shows pending status badge', async ({ authedPage: page }) => {
    await page.goto('/requests')

    await expect(page.getByText('pending', { exact: true }).first()).toBeVisible()
  })

  test('shows high priority badge', async ({ authedPage: page }) => {
    await page.goto('/requests')

    await expect(page.getByText('high', { exact: true }).first()).toBeVisible()
  })

  test('shows Accept and Decline buttons', async ({ authedPage: page }) => {
    await page.goto('/requests')

    await expect(page.getByRole('button', { name: /accept/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /decline/i })).toBeVisible()
  })
})

test.describe('Requests — Sent tab', () => {
  test('clicking sent tab shows sent requests', async ({ authedPage: page }) => {
    await page.goto('/requests')

    await page.getByRole('button', { name: /sent/i }).click()

    await expect(page.getByText(/talk about summer travel/i)).toBeVisible()
  })

  test('shows accepted status badge', async ({ authedPage: page }) => {
    await page.goto('/requests')

    await page.getByRole('button', { name: /sent/i }).click()

    await expect(page.getByText('accepted', { exact: true })).toBeVisible()
  })

  test('shows Delete button (sender can delete)', async ({ authedPage: page }) => {
    await page.goto('/requests')

    await page.getByRole('button', { name: /sent/i }).click()

    await expect(page.getByRole('button', { name: /delete/i }).first()).toBeVisible()
  })
})

test.describe('Requests — New Request form', () => {
  test('clicking New Request reveals form', async ({ authedPage: page }) => {
    await page.goto('/requests')

    const newRequestBtn = page.getByRole('button', { name: /new request/i })
    await expect(newRequestBtn).toBeEnabled({ timeout: 15000 })
    await newRequestBtn.click()

    await expect(page.getByRole('heading', { name: /new request for bob/i })).toBeVisible()
  })

  test('form shows title, description, category, priority inputs', async ({ authedPage: page }) => {
    await page.goto('/requests')

    const newRequestBtn = page.getByRole('button', { name: /new request/i })
    await expect(newRequestBtn).toBeEnabled({ timeout: 15000 })
    await newRequestBtn.click()

    await expect(page.getByLabel(/^title$/i)).toBeVisible()
    await expect(page.getByLabel(/description/i)).toBeVisible()
    await expect(page.getByLabel(/category/i)).toBeVisible()
    await expect(page.getByLabel(/priority/i)).toBeVisible()
  })

  test('form shows Send Request submit button', async ({ authedPage: page }) => {
    await page.goto('/requests')

    const newRequestBtn = page.getByRole('button', { name: /new request/i })
    await expect(newRequestBtn).toBeEnabled({ timeout: 15000 })
    await newRequestBtn.click()

    await expect(page.getByRole('button', { name: /send request/i })).toBeVisible()
  })

  test('clicking Cancel hides the form', async ({ authedPage: page }) => {
    await page.goto('/requests')

    const newRequestBtn = page.getByRole('button', { name: /new request/i })
    await expect(newRequestBtn).toBeEnabled({ timeout: 15000 })
    await newRequestBtn.click()
    await expect(page.getByRole('heading', { name: /new request for bob/i })).toBeVisible()

    // The button toggles between "New Request" and "Cancel"
    await page.getByRole('button', { name: /cancel/i }).click()
    await expect(page.getByRole('heading', { name: /new request for bob/i })).not.toBeVisible()
  })
})

test.describe.serial('Requests — CRUD', () => {
  const testTitle = `E2E Test Request ${Date.now()}`

  test('creates a new request via the form', async ({ authedPage: page }) => {
    await page.goto('/requests')

    const newRequestBtn = page.getByRole('button', { name: /new request/i })
    await expect(newRequestBtn).toBeEnabled({ timeout: 15000 })
    await newRequestBtn.click()

    await page.getByLabel(/^title$/i).fill(testTitle)

    await page.getByRole('button', { name: /send request/i }).click()

    // Form should close after successful creation
    await expect(page.getByRole('heading', { name: /new request for bob/i })).not.toBeVisible({ timeout: 15000 })
  })

  test('new request appears in sent tab after reload', async ({ authedPage: page }) => {
    await page.goto('/requests')

    await page.getByRole('button', { name: /sent/i }).click()

    await expect(page.getByText(testTitle).first()).toBeVisible({ timeout: 15000 })
  })

  test('deletes the created request', async ({ authedPage: page }) => {
    await page.goto('/requests')

    await page.getByRole('button', { name: /sent/i }).click()
    await expect(page.getByText(testTitle).first()).toBeVisible({ timeout: 15000 })

    const card = page
      .locator('.rounded-lg.border')
      .filter({ has: page.getByRole('heading', { name: testTitle }) })
      .first()
    await card.getByRole('button', { name: /delete/i }).click()

    // Wait for the server action to complete (toast confirms DB delete finished)
    await expect(page.getByText('Request deleted')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(testTitle)).not.toBeVisible({ timeout: 10000 })

    // Verify persistence after reload
    await page.reload()
    await page.getByRole('button', { name: /sent/i }).click()
    await expect(page.getByText(testTitle)).not.toBeVisible({ timeout: 10000 })
  })

  test("accepts Bob's pending request (Accept button)", async ({ authedPage: page }) => {
    await page.goto('/requests')

    // On received tab (default), Bob's pending request is visible
    await expect(page.getByText(/plan a surprise date night/i).first()).toBeVisible()

    await page.getByRole('button', { name: /accept/i }).click()

    // After accepting, the status should change — optimistic UI update
    await expect(page.getByText('accepted', { exact: true }).first()).toBeVisible({ timeout: 10000 })
  })
})
