'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { cn } from '@/lib/utils'
import {
  pageTransition,
  fadeIn,
  slideUp,
  slideInFromRight,
  scaleIn,
  smoothSpring,
} from '@/lib/animations'

interface MotionBoxProps {
  variant?: 'fade' | 'slideUp' | 'slideRight' | 'scale' | 'page'
  delay?: number
  children: React.ReactNode
  className?: string
}

export const MotionBox: React.FC<MotionBoxProps> = ({
  children,
  className,
}) => {
  // Temporarily disable animations to fix content loading issue
  return (
    <div className={cn(className)}>
      {children}
    </div>
  )
}

interface StaggerContainerProps {
  staggerDelay?: number
  children: React.ReactNode
  className?: string
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className,
}) => {
  // Temporarily disable animations to fix content loading issue
  return (
    <div className={cn(className)}>
      {children}
    </div>
  )
}

interface StaggerItemProps {
  children: React.ReactNode
  className?: string
}

export const StaggerItem: React.FC<StaggerItemProps> = ({
  children,
  className,
}) => {
  // Temporarily disable animations to fix content loading issue
  return (
    <div className={cn(className)}>
      {children}
    </div>
  )
}

interface PageTransitionProps {
  children: React.ReactNode
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full"
    >
      {children}
    </motion.div>
  )
}

interface FadePresenceProps {
  show: boolean
  children: React.ReactNode
}

export const FadePresence: React.FC<FadePresenceProps> = ({ show, children }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          variants={fadeIn}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export const transitions = {
  spring: { type: 'spring', stiffness: 500, damping: 30 },
  smoothSpring,
  gentle: { duration: 0.4, ease: 'easeOut' },
  quick: { duration: 0.2, ease: 'easeInOut' },
  slow: { duration: 0.6, ease: 'easeOut' },
}

interface MotionButtonProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export const MotionButton: React.FC<MotionButtonProps> = ({
  children,
  className,
  onClick,
}) => {
  return (
    <motion.button
      className={cn(className)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={smoothSpring as unknown as Record<string, unknown>}
      onClick={onClick}
    >
      {children}
    </motion.button>
  )
}

interface MotionCardProps {
  children: React.ReactNode
  className?: string
  hoverable?: boolean
}

export const MotionCard: React.FC<MotionCardProps> = ({
  children,
  className,
  hoverable = true,
}) => {
  return (
    <motion.div
      className={cn(className)}
      whileHover={hoverable ? { y: -4, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' } : undefined}
      transition={transitions.gentle as unknown as Record<string, unknown>}
    >
      {children}
    </motion.div>
  )
}
