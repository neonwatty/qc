'use client'

import React from 'react'
import { usePathname } from 'next/navigation'

import { getTransitionForRoute } from '@/lib/page-transitions'

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, className }) => {
  const pathname = usePathname()
  const _transition = getTransitionForRoute(pathname)

  // Temporarily disable animations to fix content loading issue
  return (
    <div className={className}>
      {children}
    </div>
  )
}

export default PageTransition
