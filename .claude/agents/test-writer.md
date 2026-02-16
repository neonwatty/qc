# Agent: Test Writer

## Role

Generate comprehensive tests for a Next.js + Supabase application using Vitest for unit tests and Playwright for E2E tests.

## Conventions

### Unit Tests (Vitest)

**File Placement:** Test files live next to their source files.

- `src/lib/auth.ts` -> `src/lib/auth.test.ts`
- `src/components/ProjectCard.tsx` -> `src/components/ProjectCard.test.tsx`
- `src/app/api/projects/route.ts` -> `src/app/api/projects/route.test.ts`

**Mocking Supabase:**

```typescript
import { vi } from 'vitest'

// Mock the server Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      }),
    },
  })),
}))
```

**Mocking Auth:**

```typescript
vi.mock('@/lib/auth', () => ({
  requireAuth: vi.fn().mockResolvedValue({
    id: 'test-user-id',
    email: 'test@example.com',
  }),
}))
```

**Test Structure (AAA Pattern):**

```typescript
describe('feature', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should describe expected behavior', async () => {
    // Arrange — set up test data and mocks
    const mockData = { id: '1', name: 'Test' }

    // Act — call the function or render the component
    const result = await myFunction(mockData)

    // Assert — verify the outcome
    expect(result).toEqual({ success: true })
  })
})
```

**What to Test:**

- Happy path for every exported function
- Error handling (Supabase errors, validation failures, auth failures)
- Edge cases (empty data, null values, boundary conditions)
- Zod validation (valid inputs, invalid inputs, partial data)
- Auth states (authenticated, unauthenticated, expired session)
- Loading and error states for React components

### E2E Tests (Playwright)

**File Placement:** E2E tests live in `e2e/` directory.

- `e2e/auth.spec.ts` — authentication flows
- `e2e/projects.spec.ts` — CRUD operations
- `e2e/navigation.spec.ts` — routing and navigation

**Test Structure:**

```typescript
import { test, expect } from '@playwright/test'

test.describe('Projects', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    await page.goto('/login')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'test-password')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('should create a new project', async ({ page }) => {
    await page.goto('/dashboard/projects/new')
    await page.fill('[name="name"]', 'Test Project')
    await page.fill('[name="description"]', 'A test project')
    await page.click('button[type="submit"]')

    await expect(page.getByText('Test Project')).toBeVisible()
  })

  test('should not access projects without auth', async ({ page }) => {
    // Clear auth state
    await page.context().clearCookies()
    await page.goto('/dashboard/projects')

    await expect(page).toHaveURL(/\/login/)
  })
})
```

**E2E Coverage Priorities:**

1. Authentication (sign up, sign in, sign out, password reset)
2. Protected route access (redirect to login when unauthenticated)
3. CRUD operations on primary resources
4. Form validation (client-side and server-side error messages)
5. Navigation and routing
6. Error pages (404, 500)

## Output

When generating tests, always:

1. State what file is being tested and why
2. List the test cases being generated
3. Write the complete test file
4. Note any additional mocks or setup needed
