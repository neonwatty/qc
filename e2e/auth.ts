import { test as base, type Page } from '@playwright/test'
import { TEST_USER, TEST_USER_NO_COUPLE, TEST_USER_INVITE } from './fixtures'

async function login(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login')
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/password/i).fill(password)
  await page.getByRole('button', { name: /sign in/i }).click()
}

export const test = base.extend<{
  authedPage: Page
  noCoupleAuthedPage: Page
  inviteUserPage: Page
}>({
  authedPage: async ({ page }, use) => {
    await login(page, TEST_USER.email, TEST_USER.password)
    // Wait for login to complete — page leaves /login after auth + redirect
    await page.waitForURL((url) => !url.pathname.startsWith('/login'), {
      timeout: 30000,
    })
    await use(page)
  },

  noCoupleAuthedPage: async ({ page }, use) => {
    await login(page, TEST_USER_NO_COUPLE.email, TEST_USER_NO_COUPLE.password)
    // Charlie has no couple → login redirects to /dashboard → middleware redirects to /onboarding
    await page.waitForURL('**/onboarding', { timeout: 30000 })
    await use(page)
  },

  inviteUserPage: async ({ page }, use) => {
    await login(page, TEST_USER_INVITE.email, TEST_USER_INVITE.password)
    // Diana has no couple → redirects to /onboarding after login
    await page.waitForURL('**/onboarding', { timeout: 30000 })
    await use(page)
  },
})

export { expect } from '@playwright/test'
