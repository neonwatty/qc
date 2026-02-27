import { describe, it, expect, vi, afterEach } from 'vitest'

const mockCreateClient = vi.fn().mockReturnValue({})

vi.mock('@supabase/supabase-js', () => ({
  createClient: (...args: unknown[]) => mockCreateClient(...args),
}))

const { createAdminClient } = await import('./admin')

afterEach(() => {
  vi.clearAllMocks()
  vi.unstubAllEnvs()
})

describe('createAdminClient', () => {
  it('throws when SUPABASE_SERVICE_ROLE_KEY is not set', () => {
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '')
    expect(() => createAdminClient()).toThrow('SUPABASE_SERVICE_ROLE_KEY is required for admin operations')
  })

  it('creates client with service role key', () => {
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')

    createAdminClient()

    expect(mockCreateClient).toHaveBeenCalledWith('https://test.supabase.co', 'test-service-key', {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  })

  it('falls back to dev URL when NEXT_PUBLIC_SUPABASE_URL is not set', () => {
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key')
    delete process.env.NEXT_PUBLIC_SUPABASE_URL

    createAdminClient()

    expect(mockCreateClient).toHaveBeenCalledWith('http://127.0.0.1:54321', 'test-service-key', expect.any(Object))
  })
})
