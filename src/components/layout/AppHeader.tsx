'use client'

import { useRouter } from 'next/navigation'
import { LogOut, Moon, Palette, Settings, Sun, User as UserIcon } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/contexts/ThemeContext'
import { createClient } from '@/lib/supabase/client'

interface AppHeaderProps {
  userEmail: string
  displayName: string | null
  avatarUrl: string | null
  coupleName: string | null
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  return email[0].toUpperCase()
}

export function AppHeader({ userEmail, displayName, avatarUrl, coupleName }: AppHeaderProps): React.ReactNode {
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  async function handleSignOut(): Promise<void> {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  function cycleTheme(): void {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
    setTheme(next)
  }

  const themeLabel = theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'System'
  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Palette

  return (
    <header className="flex h-16 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 lg:px-6">
      {/* Left: couple name or app name */}
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold text-[hsl(var(--foreground))] lg:text-lg">{coupleName ?? 'QC'}</h2>
      </div>

      {/* Right: user menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-[hsl(var(--muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]">
            <Avatar className="h-8 w-8">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName ?? userEmail} />}
              <AvatarFallback className="bg-[hsl(var(--primary))] text-xs text-[hsl(var(--primary-foreground))]">
                {getInitials(displayName, userEmail)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium text-[hsl(var(--foreground))] md:inline">
              {displayName ?? userEmail.split('@')[0]}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{displayName ?? 'Account'}</span>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">{userEmail}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/settings')}>
            <UserIcon className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={cycleTheme}>
            <ThemeIcon className="mr-2 h-4 w-4" />
            Theme: {themeLabel}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
