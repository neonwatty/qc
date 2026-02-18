import { test as base, type Page } from '@playwright/test'
import { TEST_USER, TEST_USER_NO_COUPLE } from './fixtures'

async function login(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login')
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/password/i).fill(password)
  await page.getByRole('button', { name: /sign in/i }).click()
}

export const test = base.extend<{
  authedPage: Page
  noCoupleAuthedPage: Page
}>({
  authedPage: async ({ page }, use) => {
    await login(page, TEST_USER.email, TEST_USER.password)
    await page.waitForURL('/dashboard', { timeout: 15000 })
    await use(page)
  },

  noCoupleAuthedPage: async ({ page }, use) => {
    await login(page, TEST_USER_NO_COUPLE.email, TEST_USER_NO_COUPLE.password)
    await page.waitForURL('/onboarding', { timeout: 15000 })
    await use(page)
  },
})

export { expect } from '@playwright/test'
