import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.describe('Login Page', () => {
    test('renders with email and password fields', async ({ page }) => {
      await page.goto('/login')

      await expect(page.getByRole('heading', { name: /sign in to your account/i })).toBeVisible()
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByLabel(/password/i)).toBeVisible()
    })

    test('renders sign in button', async ({ page }) => {
      await page.goto('/login')

      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
    })

    test('has link to signup page', async ({ page }) => {
      await page.goto('/login')

      const signupLink = page.getByRole('link', { name: /create a new account/i })
      await expect(signupLink).toBeVisible()
      await expect(signupLink).toHaveAttribute('href', '/signup')
    })

    test('displays OAuth buttons for Google and GitHub', async ({ page }) => {
      await page.goto('/login')

      await expect(page.getByRole('button', { name: /google/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /github/i })).toBeVisible()
    })

    test('shows error for invalid credentials', async ({ page }) => {
      await page.goto('/login')

      await page.getByLabel(/email/i).fill('invalid@example.com')
      await page.getByLabel(/password/i).fill('wrongpassword')
      await page.getByRole('button', { name: /sign in/i }).click()

      // Wait for the error message to appear
      const errorMessage = page.locator('[class*="bg-red"]')
      await expect(errorMessage).toBeVisible({ timeout: 10000 })
    })

    test('email field has correct placeholder', async ({ page }) => {
      await page.goto('/login')

      await expect(page.getByPlaceholder('you@example.com')).toBeVisible()
    })

    test('password field has correct placeholder', async ({ page }) => {
      await page.goto('/login')

      await expect(page.getByPlaceholder('Your password')).toBeVisible()
    })

    test('sign in button shows loading state on submit', async ({ page }) => {
      await page.goto('/login')

      await page.getByLabel(/email/i).fill('test@example.com')
      await page.getByLabel(/password/i).fill('testpassword')
      await page.getByRole('button', { name: /sign in/i }).click()

      // The button text should change to "Signing in..." while loading
      await expect(page.getByRole('button', { name: /signing in/i })).toBeVisible()
    })
  })

  test.describe('Signup Page', () => {
    test('renders with display name, email, and password fields', async ({ page }) => {
      await page.goto('/signup')

      await expect(page.getByRole('heading', { name: /create your account/i })).toBeVisible()
      await expect(page.getByLabel(/display name/i)).toBeVisible()
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByLabel(/password/i)).toBeVisible()
    })

    test('renders create account button', async ({ page }) => {
      await page.goto('/signup')

      await expect(page.getByRole('button', { name: /create account/i })).toBeVisible()
    })

    test('has link to login page', async ({ page }) => {
      await page.goto('/signup')

      const loginLink = page.getByRole('link', { name: /sign in/i })
      await expect(loginLink).toBeVisible()
      await expect(loginLink).toHaveAttribute('href', '/login')
    })

    test('password field requires minimum 8 characters', async ({ page }) => {
      await page.goto('/signup')

      const passwordInput = page.getByLabel(/password/i)
      await expect(passwordInput).toHaveAttribute('minlength', '8')
    })

    test('display name placeholder is correct', async ({ page }) => {
      await page.goto('/signup')

      await expect(page.getByPlaceholder('Your name')).toBeVisible()
    })

    test('email placeholder is correct', async ({ page }) => {
      await page.goto('/signup')

      await expect(page.getByPlaceholder('you@example.com')).toBeVisible()
    })

    test('password placeholder is correct', async ({ page }) => {
      await page.goto('/signup')

      await expect(page.getByPlaceholder('At least 8 characters')).toBeVisible()
    })
  })

  test.describe('Route Protection', () => {
    test('redirects to login when accessing /dashboard unauthenticated', async ({ page }) => {
      await page.goto('/dashboard')

      await expect(page).toHaveURL(/\/login\?redirect=%2Fdashboard/)
    })

    test('redirects to login when accessing /settings unauthenticated', async ({ page }) => {
      await page.goto('/settings')

      await expect(page).toHaveURL(/\/login\?redirect=%2Fsettings/)
    })

    test('redirects to login when accessing /notes unauthenticated', async ({ page }) => {
      await page.goto('/notes')

      await expect(page).toHaveURL(/\/login\?redirect=%2Fnotes/)
    })

    test('login redirect param preserves the original path', async ({ page }) => {
      await page.goto('/dashboard')

      await expect(page).toHaveURL(/redirect=%2Fdashboard/)
      await expect(page.getByRole('heading', { name: /sign in to your account/i })).toBeVisible()
    })
  })
})
