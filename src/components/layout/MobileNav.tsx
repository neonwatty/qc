'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  MessageCircleHeart,
  StickyNote,
  TrendingUp,
  MoreHorizontal,
  Bell,
  HandHeart,
  Languages,
  Settings,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const PRIMARY_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Check-in', href: '/checkin', icon: <MessageCircleHeart className="h-5 w-5" /> },
  { label: 'Notes', href: '/notes', icon: <StickyNote className="h-5 w-5" /> },
  { label: 'Growth', href: '/growth', icon: <TrendingUp className="h-5 w-5" /> },
]

const MORE_ITEMS: NavItem[] = [
  { label: 'Reminders', href: '/reminders', icon: <Bell className="h-5 w-5" /> },
  { label: 'Requests', href: '/requests', icon: <HandHeart className="h-5 w-5" /> },
  { label: 'Love Languages', href: '/love-languages', icon: <Languages className="h-5 w-5" /> },
  { label: 'Settings', href: '/settings', icon: <Settings className="h-5 w-5" /> },
]

export function MobileNav(): React.ReactNode {
  const pathname = usePathname()
  const [showMore, setShowMore] = useState(false)

  const isMoreActive = MORE_ITEMS.some((item) => pathname === item.href || pathname.startsWith(item.href + '/'))

  return (
    <>
      {/* More menu overlay */}
      <AnimatePresence>
        {showMore && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              onClick={() => setShowMore(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-x-0 bottom-16 z-50 rounded-t-2xl border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 pb-2 shadow-lg safe-area-bottom lg:hidden"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-[hsl(var(--foreground))]">More</span>
                <button
                  onClick={() => setShowMore(false)}
                  className="touch-target flex items-center justify-center rounded-full p-1 hover:bg-[hsl(var(--muted))]"
                >
                  <X className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {MORE_ITEMS.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setShowMore(false)}
                      className={cn(
                        'flex flex-col items-center gap-1 rounded-xl p-3 text-xs font-medium transition-colors touch-target',
                        isActive
                          ? 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]'
                          : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]',
                      )}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))]/95 backdrop-blur-md safe-area-bottom lg:hidden">
        <div className="flex items-center justify-around px-2 py-1">
          {PRIMARY_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-[10px] font-medium transition-colors touch-target',
                  isActive ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]',
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            )
          })}
          <button
            onClick={() => setShowMore((prev) => !prev)}
            className={cn(
              'flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-[10px] font-medium transition-colors touch-target',
              isMoreActive || showMore ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]',
            )}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span>More</span>
          </button>
        </div>
      </nav>
    </>
  )
}
