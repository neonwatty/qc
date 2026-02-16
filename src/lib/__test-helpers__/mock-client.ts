import { vi } from 'vitest'

export function buildMockClient() {
  const result: { data: unknown; error: unknown } = { data: null, error: null }

  const methods = {
    from: vi.fn(),
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    or: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
  }

  const client = {
    ...methods,
    then(resolve: (val: unknown) => unknown) {
      return Promise.resolve(resolve({ data: result.data, error: result.error }))
    },
  }

  for (const mock of Object.values(methods)) {
    mock.mockReturnValue(client)
  }

  return { client, result }
}
