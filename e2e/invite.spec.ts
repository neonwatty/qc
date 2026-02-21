import { test, expect } from './auth'
import { TEST_PENDING_INVITE } from './fixtures'

test.describe('Invite Acceptance Flow', () => {
  const validInviteUrl = `/invite/${TEST_PENDING_INVITE.token}`
  const invalidTokenUrl = '/invite/00000000-0000-4000-8000-000000000000'

  test('unauthenticated user is redirected to signup', async ({ page }) => {
    await page.goto(validInviteUrl)
    await page.waitForURL(/\/signup/, { timeout: 15000 })
    expect(page.url()).toContain('/signup')
    // The redirect param should point back to the invite
    expect(page.url()).toContain(encodeURIComponent(validInviteUrl))
  })

  test('authenticated user sees invite page with accept button', async ({ inviteUserPage: page }) => {
    await page.goto(validInviteUrl)
    await expect(page.getByRole('heading', { name: /you have been invited/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /join as a couple/i })).toBeVisible()
  })

  test('accepting invite redirects to dashboard', async ({ inviteUserPage: page }) => {
    await page.goto(validInviteUrl)
    await expect(page.getByRole('button', { name: /join as a couple/i })).toBeVisible()
    await page.getByRole('button', { name: /join as a couple/i }).click()
    await page.waitForURL('**/dashboard', { timeout: 30000 })
    expect(page.url()).toContain('/dashboard')
  })

  test('invalid token shows error message', async ({ page }) => {
    await page.goto(invalidTokenUrl)
    await expect(page.getByRole('heading', { name: /invalid invite/i })).toBeVisible()
    await expect(page.getByText(/invalid or has expired/i)).toBeVisible()
    await expect(page.getByRole('link', { name: /go to login/i })).toBeVisible()
  })

  test('user already in a couple sees error when accepting', async ({ authedPage: page }) => {
    // Alice is already in a couple with Bob
    await page.goto(validInviteUrl)
    await expect(page.getByRole('button', { name: /join as a couple/i })).toBeVisible()
    await page.getByRole('button', { name: /join as a couple/i }).click()
    // Should show inline error
    await expect(page.getByText(/already in a couple/i)).toBeVisible()
  })
})
