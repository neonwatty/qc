'use client'

import { useActionState } from 'react'
import { User } from 'lucide-react'

import type { DbProfile } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateProfile } from '@/app/(app)/settings/actions'

interface ProfileSettingsProps {
  profile: DbProfile
}

function profileAction(
  _prev: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  return updateProfile(formData)
}

export function ProfileSettings({ profile }: ProfileSettingsProps) {
  const [state, action, isPending] = useActionState(profileAction, {
    error: null,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile
        </CardTitle>
        <CardDescription>
          Manage your personal profile information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              name="displayName"
              defaultValue={profile.display_name ?? ''}
              placeholder="Enter your display name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              disabled
              className="opacity-60"
            />
            <p className="text-xs text-muted-foreground">
              Email is managed through your authentication provider
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatarUrl">Avatar URL</Label>
            <Input
              id="avatarUrl"
              name="avatarUrl"
              defaultValue={profile.avatar_url ?? ''}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
