import { describe, it, expect } from 'vitest'

import { emailSchema, nameSchema, createItemSchema, updateItemSchema, validate } from '@/lib/validation'

describe('emailSchema', () => {
  it('accepts valid email addresses', () => {
    expect(emailSchema.safeParse('user@example.com').success).toBe(true)
    expect(emailSchema.safeParse('test+tag@sub.domain.co').success).toBe(true)
  })

  it('rejects empty string', () => {
    const result = emailSchema.safeParse('')
    expect(result.success).toBe(false)
  })

  it('rejects invalid email format', () => {
    expect(emailSchema.safeParse('not-an-email').success).toBe(false)
    expect(emailSchema.safeParse('missing@').success).toBe(false)
    expect(emailSchema.safeParse('@no-local.com').success).toBe(false)
  })
})

describe('nameSchema', () => {
  it('accepts valid names', () => {
    expect(nameSchema.safeParse('Alice').success).toBe(true)
    expect(nameSchema.safeParse('A').success).toBe(true)
    expect(nameSchema.safeParse('a'.repeat(100)).success).toBe(true)
  })

  it('rejects empty string', () => {
    const result = nameSchema.safeParse('')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Name is required')
    }
  })

  it('rejects names over 100 characters', () => {
    const result = nameSchema.safeParse('a'.repeat(101))
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Name must be 100 characters or less')
    }
  })
})

describe('createItemSchema', () => {
  it('accepts a valid item with title and description', () => {
    const result = createItemSchema.safeParse({ title: 'My item', description: 'Details here' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({ title: 'My item', description: 'Details here' })
    }
  })

  it('accepts an item without description (optional)', () => {
    const result = createItemSchema.safeParse({ title: 'No description' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.description).toBeUndefined()
    }
  })

  it('rejects empty title', () => {
    const result = createItemSchema.safeParse({ title: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Title is required')
    }
  })

  it('rejects title over 200 characters', () => {
    const result = createItemSchema.safeParse({ title: 'x'.repeat(201) })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Title must be 200 characters or less')
    }
  })

  it('rejects description over 2000 characters', () => {
    const result = createItemSchema.safeParse({ title: 'Valid', description: 'd'.repeat(2001) })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Description must be 2000 characters or less')
    }
  })
})

describe('updateItemSchema', () => {
  it('accepts an empty object (all fields optional)', () => {
    const result = updateItemSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('accepts partial updates with only title', () => {
    const result = updateItemSchema.safeParse({ title: 'Updated title' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({ title: 'Updated title' })
    }
  })

  it('accepts partial updates with only description', () => {
    const result = updateItemSchema.safeParse({ description: 'Updated description' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({ description: 'Updated description' })
    }
  })

  it('still validates constraints on provided fields', () => {
    const result = updateItemSchema.safeParse({ title: '' })
    expect(result.success).toBe(false)
  })
})

describe('validate', () => {
  it('returns { data } on successful validation', () => {
    const result = validate(nameSchema, 'Alice')
    expect(result).toEqual({ data: 'Alice' })
    expect(result.data).toBe('Alice')
    expect(result.error).toBeUndefined()
  })

  it('returns { error } on failed validation', () => {
    const result = validate(nameSchema, '')
    expect(result.error).toBeDefined()
    expect(typeof result.error).toBe('string')
    expect(result.data).toBeUndefined()
  })

  it('joins multiple error messages with commas', () => {
    const result = validate(createItemSchema, { title: '', description: 'd'.repeat(2001) })
    expect(result.error).toBeDefined()
    expect(result.error).toContain('Title is required')
    expect(result.error).toContain('Description must be 2000 characters or less')
    expect(result.error).toContain(', ')
  })

  it('works with complex schemas', () => {
    const result = validate(createItemSchema, { title: 'Test', description: 'A description' })
    expect(result.data).toEqual({ title: 'Test', description: 'A description' })
  })
})
