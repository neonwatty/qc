'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { requireAuth } from '@/lib/auth'
import { sendEmail, shouldSendEmail } from '@/lib/email/send'
import { RequestNotificationEmail } from '@/lib/email/templates/request-notification'
import { validate } from '@/lib/validation'

const requestSchema = z.object({
  requested_for: z.string().uuid('Invalid partner ID'),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  category: z.enum(['activity', 'task', 'reminder', 'conversation', 'date-night', 'custom']),
  priority: z.enum(['low', 'medium', 'high']),
  suggested_date: z.string().optional(),
})

export interface RequestActionState {
  error?: string
  success?: boolean
}

export async function createRequest(_prev: RequestActionState, formData: FormData): Promise<RequestActionState> {
  const { user, supabase } = await requireAuth()

  const { data: profile } = await supabase.from('profiles').select('couple_id').eq('id', user.id).single()

  if (!profile?.couple_id) {
    return { error: 'You must be in a couple to create requests' }
  }

  const raw = {
    requested_for: formData.get('requested_for'),
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    category: formData.get('category'),
    priority: formData.get('priority'),
    suggested_date: formData.get('suggested_date') || undefined,
  }

  const { data, error: validationError } = validate(requestSchema, raw)
  if (validationError || !data) return { error: validationError ?? 'Validation failed' }

  const { error } = await supabase.from('requests').insert({
    couple_id: profile.couple_id,
    requested_by: user.id,
    requested_for: data.requested_for,
    title: data.title,
    description: data.description ?? null,
    category: data.category,
    priority: data.priority,
    status: 'pending',
    suggested_date: data.suggested_date ?? null,
  })

  if (error) return { error: error.message }

  // Send email notification to partner
  try {
    const { data: partnerProfile } = await supabase
      .from('profiles')
      .select('email, display_name')
      .eq('id', data.requested_for)
      .single()

    const { data: requesterProfile } = await supabase.from('profiles').select('display_name').eq('id', user.id).single()

    if (partnerProfile?.email) {
      const canSend = await shouldSendEmail(partnerProfile.email)
      if (canSend) {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
        await sendEmail({
          to: partnerProfile.email,
          subject: `New request from ${requesterProfile?.display_name ?? 'your partner'}`,
          react: RequestNotificationEmail({
            partnerName: requesterProfile?.display_name ?? 'Your partner',
            title: data.title,
            category: data.category,
            priority: data.priority,
            requestsUrl: `${baseUrl}/requests`,
          }),
        })
      }
    }
  } catch {
    // Email send failed -- non-blocking, request was created successfully
  }

  revalidatePath('/requests')
  return { success: true }
}

export async function respondToRequest(
  requestId: string,
  status: 'accepted' | 'declined',
): Promise<{ error?: string }> {
  const { supabase } = await requireAuth()

  const { error } = await supabase.from('requests').update({ status }).eq('id', requestId)

  if (error) return { error: error.message }

  revalidatePath('/requests')
  return {}
}

export async function deleteRequest(requestId: string): Promise<{ error?: string }> {
  const { supabase } = await requireAuth()

  const { error } = await supabase.from('requests').delete().eq('id', requestId)

  if (error) return { error: error.message }

  revalidatePath('/requests')
  return {}
}

// WT-4 Cross-Feature Linking: Convert request to reminder
const categoryMapping: Record<string, 'habit' | 'check-in' | 'action-item' | 'special-date' | 'custom'> = {
  activity: 'custom',
  task: 'action-item',
  reminder: 'custom',
  conversation: 'check-in',
  'date-night': 'special-date',
  custom: 'custom',
}

export async function convertRequestToReminder(requestId: string): Promise<{ error?: string; reminderId?: string }> {
  const { user, supabase } = await requireAuth()

  // Fetch the request with couple_id check
  const { data: request, error: fetchError } = await supabase.from('requests').select('*').eq('id', requestId).single()

  if (fetchError) return { error: fetchError.message }
  if (!request) return { error: 'Request not found' }

  // Verify request belongs to user's couple
  const { data: profile } = await supabase.from('profiles').select('couple_id').eq('id', user.id).single()

  if (!profile?.couple_id) {
    return { error: 'You must be in a couple to convert requests' }
  }

  if (request.couple_id !== profile.couple_id) {
    return { error: 'Request does not belong to your couple' }
  }

  // Only allow conversion of accepted requests
  if (request.status !== 'accepted') {
    return { error: 'Only accepted requests can be converted to reminders' }
  }

  // Create the reminder from request data
  const { data: reminder, error: insertError } = await supabase
    .from('reminders')
    .insert({
      couple_id: request.couple_id,
      created_by: user.id,
      title: request.title,
      message: request.description,
      category: categoryMapping[request.category] || 'custom',
      frequency: 'once',
      scheduled_for: request.suggested_date || new Date().toISOString(),
      is_active: true,
      notification_channel: 'in-app',
      assigned_to: request.requested_for,
      converted_from_request_id: request.id,
    })
    .select('id')
    .single()

  if (insertError) return { error: insertError.message }
  if (!reminder) return { error: 'Failed to create reminder' }

  // Update the request to mark it as converted
  const { error: updateError } = await supabase
    .from('requests')
    .update({
      status: 'converted',
      converted_to_reminder_id: reminder.id,
    })
    .eq('id', requestId)

  if (updateError) return { error: updateError.message }

  revalidatePath('/requests')
  revalidatePath('/reminders')
  return { reminderId: reminder.id }
}
