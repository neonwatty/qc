'use client'

import { useActionState } from 'react'
import { Heart, Users } from 'lucide-react'

import type { DbCouple, DbProfile } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateCoupleSettings } from '@/app/(app)/settings/actions'

interface CoupleSettingsProps {
  couple: DbCouple | null
  partner: DbProfile | null
}

function coupleAction(
  _prev: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  return updateCoupleSettings(formData)
}

export function CoupleSettings({ couple, partner }: CoupleSettingsProps) {
  const [state, action, isPending] = useActionState(coupleAction, {
    error: null,
  })

  if (!couple) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Couple
          </CardTitle>
          <CardDescription>
            You are not currently part of a couple. Invite your partner to get
            started.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Couple Settings
        </CardTitle>
        <CardDescription>
          Manage your relationship details and preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Couple Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={couple.name ?? ''}
              placeholder="e.g. The Smiths"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationshipStartDate">
              Relationship Start Date
            </Label>
            <Input
              id="relationshipStartDate"
              name="relationshipStartDate"
              type="date"
              defaultValue={couple.relationship_start_date ?? ''}
            />
          </div>

          {partner && (
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4" />
                Partner
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {partner.display_name ?? partner.email}
              </p>
              <p className="text-xs text-muted-foreground">{partner.email}</p>
            </div>
          )}

          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Couple Settings'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
