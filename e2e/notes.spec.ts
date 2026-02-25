import { test, expect } from './auth'

test.describe('Notes — Page structure', () => {
  test('renders heading', async ({ authedPage: page }) => {
    await page.goto('/notes')

    await expect(page.getByRole('heading', { name: /^notes$/i })).toBeVisible()
  })

  test('renders New Note button', async ({ authedPage: page }) => {
    await page.goto('/notes')

    await expect(page.getByRole('button', { name: /new note/i })).toBeVisible()
  })

  test('search input visible with placeholder', async ({ authedPage: page }) => {
    await page.goto('/notes')

    await expect(page.getByPlaceholder(/search notes/i).first()).toBeVisible()
  })
})

test.describe('Notes — Filter controls', () => {
  test('All, Shared, Private, Drafts filter buttons visible', async ({ authedPage: page }) => {
    await page.goto('/notes')

    await expect(page.getByRole('button', { name: /^all$/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /^shared$/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /^private$/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /^drafts$/i })).toBeVisible()
  })
})

test.describe('Notes — Seed note display', () => {
  test('displays the communication shared note', async ({ authedPage: page }) => {
    await page.goto('/notes')

    await expect(page.getByText(/pausing before reacting/i).first()).toBeVisible()
  })

  test('displays the finances shared note', async ({ authedPage: page }) => {
    await page.goto('/notes')

    await expect(page.getByText(/savings target/i).first()).toBeVisible()
  })

  test("does not display Bob's private note content", async ({ authedPage: page }) => {
    await page.goto('/notes')

    await expect(page.getByText(/plan something special for our anniversary/i)).not.toBeVisible()
  })

  test('shows Shared privacy badge', async ({ authedPage: page }) => {
    await page.goto('/notes')

    const badges = page.getByText('Shared', { exact: true })
    await expect(badges.first()).toBeVisible()
  })
})

test.describe('Notes — Filtering', () => {
  test('Shared filter shows only shared notes', async ({ authedPage: page }) => {
    await page.goto('/notes')

    await page.getByRole('button', { name: /^shared$/i }).click()

    await expect(page.getByText(/pausing before reacting/i).first()).toBeVisible()
    await expect(page.getByText(/savings target/i).first()).toBeVisible()
  })

  test('Private filter shows empty state', async ({ authedPage: page }) => {
    await page.goto('/notes')

    await page.getByRole('button', { name: /^private$/i }).click()

    await expect(page.getByRole('heading', { name: /no notes found/i })).toBeVisible()
  })

  test('Drafts filter shows empty state', async ({ authedPage: page }) => {
    await page.goto('/notes')

    await page.getByRole('button', { name: /^drafts$/i }).click()

    await expect(page.getByRole('heading', { name: /no notes found/i })).toBeVisible()
  })
})

test.describe('Notes — Search', () => {
  test('search filters notes by content keyword', async ({ authedPage: page }) => {
    await page.goto('/notes')

    await page
      .getByPlaceholder(/search notes/i)
      .first()
      .fill('savings')

    await expect(page.getByText(/savings target/i).first()).toBeVisible()
    await expect(page.getByText(/pausing before reacting/i)).not.toBeVisible()
  })

  test('no-match search shows empty state', async ({ authedPage: page }) => {
    await page.goto('/notes')

    await page
      .getByPlaceholder(/search notes/i)
      .first()
      .fill('xyznonexistent')

    await expect(page.getByRole('heading', { name: /no notes found/i })).toBeVisible()
  })
})

test.describe('Notes — NoteEditor modal', () => {
  test('New Note button opens modal with heading', async ({ authedPage: page }) => {
    await page.goto('/notes')

    await page.getByRole('button', { name: /new note/i }).click()

    await expect(page.getByRole('heading', { name: /new note/i })).toBeVisible()
  })

  test('modal shows textarea with placeholder', async ({ authedPage: page }) => {
    await page.goto('/notes')

    await page.getByRole('button', { name: /new note/i }).click()

    await expect(page.getByPlaceholder(/what's on your mind/i)).toBeVisible()
  })

  test('Save button is disabled when textarea is empty', async ({ authedPage: page }) => {
    await page.goto('/notes')

    await page.getByRole('button', { name: /new note/i }).click()

    await expect(page.getByRole('button', { name: /^save$/i })).toBeDisabled()
  })

  test('clicking seed note card opens Edit Note modal', async ({ authedPage: page }) => {
    await page.goto('/notes')

    await page
      .getByRole('button')
      .filter({ hasText: /pausing before reacting/i })
      .click()

    await expect(page.getByRole('heading', { name: /edit note/i })).toBeVisible()
  })

  test('Cancel button closes the editor', async ({ authedPage: page }) => {
    await page.goto('/notes')

    await page.getByRole('button', { name: /new note/i }).click()
    await expect(page.getByRole('heading', { name: /new note/i })).toBeVisible()

    await page.getByRole('button', { name: /cancel/i }).click()
    await expect(page.getByRole('heading', { name: /new note/i })).not.toBeVisible()
  })
})

test.describe.serial('Notes — CRUD', () => {
  const testContent = 'E2E test note — automated playwright test content'
  const updatedContent = 'E2E test note — updated by playwright'

  test('creates a new note and it appears in the list', async ({ authedPage: page }) => {
    await page.goto('/notes')

    await page.getByRole('button', { name: /new note/i }).click()
    await page.getByPlaceholder(/what's on your mind/i).fill(testContent)
    // Wait for Save button to be enabled (React state updated from fill)
    await expect(page.getByRole('button', { name: /^save$/i })).toBeEnabled()
    await page.getByRole('button', { name: /^save$/i }).click()

    // Wait for modal to close (confirms server action completed and onClose fired)
    await expect(page.getByRole('heading', { name: /new note/i })).not.toBeVisible({ timeout: 15000 })
    // Reload to get fresh server-rendered list (don't rely on Realtime in CI)
    await page.reload()
    await expect(page.getByText(testContent).first()).toBeVisible({ timeout: 10000 })
  })

  test('clicking owned note opens edit modal, Update saves changes', async ({ authedPage: page }) => {
    await page.goto('/notes')

    // Use .first() to handle duplicates from retried create test
    await page.getByRole('button').filter({ hasText: testContent }).first().click()
    await expect(page.getByRole('heading', { name: /edit note/i })).toBeVisible()

    const textarea = page.getByPlaceholder(/what's on your mind/i)
    await textarea.clear()
    await textarea.fill(updatedContent)
    await expect(page.getByRole('button', { name: /^update$/i })).toBeEnabled()
    await page.getByRole('button', { name: /^update$/i }).click()

    // Wait for modal to close, then reload for fresh data
    await expect(page.getByRole('heading', { name: /edit note/i })).not.toBeVisible({ timeout: 15000 })
    await page.reload()
    await expect(page.getByText(updatedContent).first()).toBeVisible({ timeout: 10000 })
  })

  test('hovering owned note reveals delete button', async ({ authedPage: page }) => {
    await page.goto('/notes')

    const noteCard = page.getByRole('button').filter({ hasText: updatedContent }).first()
    await noteCard.hover()

    await expect(page.getByLabel(/delete note/i).first()).toBeVisible()
  })

  test('deleting owned note removes it from the list', async ({ authedPage: page }) => {
    await page.goto('/notes')

    const noteCards = page.getByRole('button').filter({ hasText: updatedContent })
    await expect(noteCards.first()).toBeVisible()
    const countBefore = await noteCards.count()

    await noteCards.first().hover()
    await page
      .getByLabel(/delete note/i)
      .first()
      .click()

    // Reload and verify at least one copy was removed
    await page.reload()
    const countAfter = await page.getByRole('button').filter({ hasText: updatedContent }).count()
    expect(countAfter).toBeLessThan(countBefore)
  })
})
