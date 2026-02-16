import { z } from 'zod'

export const emailSchema = z.string().email('Please enter a valid email address').min(1, 'Email is required')

export const nameSchema = z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less')

export const createItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  description: z.string().max(2000, 'Description must be 2000 characters or less').optional(),
})

export const updateItemSchema = createItemSchema.partial()

interface ValidateSuccess<T> {
  data: T
  error?: undefined
}

interface ValidateError {
  data?: undefined
  error: string
}

type ValidateResult<T> = ValidateSuccess<T> | ValidateError

export function validate<T>(schema: z.ZodSchema<T>, input: unknown): ValidateResult<T> {
  const result = schema.safeParse(input)

  if (result.success) {
    return { data: result.data }
  }

  const message = result.error.issues.map((e: { message: string }) => e.message).join(', ')
  return { error: message }
}
