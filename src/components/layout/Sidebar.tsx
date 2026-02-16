'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Heart,
  LayoutDashboard,
  MessageCircleHeart,
  StickyNote,
  TrendingUp,
  Bell,
  HandHeart,
  Languages,
  Settings,
} from 'lucide-react'

import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Check-in', href: '/checkin', icon: <MessageCircleHeart className="h-5 w-5" /> },
  { label: 'Notes', href: '/notes', icon: <StickyNote className="h-5 w-5" /> },
  { label: 'Growth', href: '/growth', icon: <TrendingUp className="h-5 w-5" /> },
  { label: 'Reminders', href: '/reminders', icon: <Bell className="h-5 w-5" /> },
  { label: 'Requests', href: '/requests', icon: <HandHeart className="h-5 w-5" /> },
  { label: 'Love Languages', href: '/love-languages', icon: <Languages className="h-5 w-5" /> },
  { label: 'Settings', href: '/settings', icon: <Settings className="h-5 w-5" /> },
]

export function Sidebar(): React.ReactNode {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-[hsl(var(--border))] lg:bg-[hsl(var(--card))]">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-[hsl(var(--border))] px-6">
        <Heart className="h-6 w-6 text-[hsl(var(--primary))]" fill="currentColor" />
        <span className="text-lg font-bold text-gradient-primary">QC</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-primary'
                  : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]',
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[hsl(var(--border))] p-4">
        <p className="text-xs text-[hsl(var(--muted-foreground))]">Strengthen your relationship</p>
      </div>
    </aside>
  )
}
