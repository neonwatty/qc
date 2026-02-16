'use client'

import { useActionState } from 'react'

import { updateProfile } from '@/app/(app)/settings/actions'
import type { SettingsActionState } from '@/app/(app)/settings/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { DbProfile } from '@/types/database'

interface Props {
  profile: DbProfile | null
  userEmail: string
}

export function ProfileSettings({ profile, userEmail }: Props): React.ReactElement {
  const [formState, formAction, isPending] = useActionState<SettingsActionState, FormData>(updateProfile, {})

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Profile</h2>
        <p className="text-sm text-muted-foreground">Manage your personal information</p>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={userEmail} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">Email cannot be changed here</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_name">Display Name</Label>
            <Input
              id="display_name"
              name="display_name"
              defaultValue={profile?.display_name ?? ''}
              required
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar_url">Avatar URL (optional)</Label>
            <Input
              id="avatar_url"
              name="avatar_url"
              type="url"
              defaultValue={profile?.avatar_url ?? ''}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label>Current Plan</Label>
            <p className="text-sm font-medium capitalize">{profile?.plan ?? 'free'}</p>
          </div>

          {formState.error && <p className="text-sm text-destructive">{formState.error}</p>}
          {formState.success && <p className="text-sm text-green-600">Profile updated successfully</p>}

          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
