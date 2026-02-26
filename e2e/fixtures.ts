/**
 * E2E test fixtures and constants.
 *
 * These UUIDs and credentials match the seed data in supabase/seed.sql.
 * All UUIDs use RFC 4122 v4 format (required by Zod v4 uuid validation).
 */

export const TEST_USER = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  email: 'alice@test.com',
  password: 'password123',
  displayName: 'Alice',
} as const

export const TEST_PARTNER = {
  id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  email: 'bob@test.com',
  password: 'password123',
  displayName: 'Bob',
} as const

export const TEST_COUPLE = {
  id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  name: 'Alice & Bob',
} as const

/**
 * User without a couple_id -- used for onboarding tests.
 * Charlie is seeded with no couple association.
 */
export const TEST_USER_NO_COUPLE = {
  id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  email: 'charlie@test.com',
  password: 'password123',
  displayName: 'Charlie',
} as const

/**
 * User without a couple_id -- used for invite acceptance E2E tests.
 * Diana is seeded with no couple association plus a pending invite from Alice.
 */
export const TEST_USER_INVITE = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'diana@test.com',
  password: 'password123',
  displayName: 'Diana',
} as const

export const TEST_PENDING_INVITE = {
  token: 'aabbccdd-1234-4567-8901-aabbccddeeff',
} as const

export const BASE_URL = 'http://localhost:3000'
