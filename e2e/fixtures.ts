/**
 * E2E test fixtures and constants.
 *
 * These UUIDs and credentials should match the seed data
 * in supabase/seed.sql when fully populated for E2E testing.
 */

export const TEST_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'test@example.com',
  password: 'testpassword123',
  displayName: 'Test User',
} as const

export const TEST_PARTNER = {
  id: '00000000-0000-0000-0000-000000000002',
  email: 'partner@example.com',
  password: 'testpassword123',
  displayName: 'Test Partner',
} as const

export const TEST_COUPLE = {
  id: '00000000-0000-0000-0000-000000000010',
  name: 'Test Couple',
} as const

/**
 * User without a couple_id -- used for onboarding tests.
 */
export const TEST_USER_NO_COUPLE = {
  id: '00000000-0000-0000-0000-000000000003',
  email: 'newuser@example.com',
  password: 'testpassword123',
  displayName: 'New User',
} as const

export const BASE_URL = 'http://localhost:3000'
