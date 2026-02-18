/**
 * E2E test fixtures and constants.
 *
 * These UUIDs and credentials match the seed data in supabase/seed.sql.
 */

export const TEST_USER = {
  id: '11111111-1111-1111-1111-111111111111',
  email: 'alice@test.com',
  password: 'password123',
  displayName: 'Alice',
} as const

export const TEST_PARTNER = {
  id: '22222222-2222-2222-2222-222222222222',
  email: 'bob@test.com',
  password: 'password123',
  displayName: 'Bob',
} as const

export const TEST_COUPLE = {
  id: '33333333-3333-3333-3333-333333333333',
  name: 'Alice & Bob',
} as const

/**
 * User without a couple_id -- used for onboarding tests.
 * Charlie is seeded with no couple association.
 */
export const TEST_USER_NO_COUPLE = {
  id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
  email: 'charlie@test.com',
  password: 'password123',
  displayName: 'Charlie',
} as const

export const BASE_URL = 'http://localhost:3000'
