'use client'

import { cn } from '@/lib/utils'

interface MotionBoxProps {
  variant?: 'fade' | 'slideUp' | 'slideRight' | 'scale' | 'page'
  delay?: number
  children: React.ReactNode
  className?: string
}

export const MotionBox: React.FC<MotionBoxProps> = ({ children, className }) => {
  // Temporarily disable animations to fix content loading issue
  return <div className={cn(className)}>{children}</div>
}

interface StaggerContainerProps {
  staggerDelay?: number
  children: React.ReactNode
  className?: string
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({ children, className }) => {
  // Temporarily disable animations to fix content loading issue
  return <div className={cn(className)}>{children}</div>
}

interface StaggerItemProps {
  children: React.ReactNode
  className?: string
}

export const StaggerItem: React.FC<StaggerItemProps> = ({ children, className }) => {
  // Temporarily disable animations to fix content loading issue
  return <div className={cn(className)}>{children}</div>
}
