'use client'

import { useSyncExternalStore } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  fadeIn,
  pageTransition,
  scaleIn,
  slideInFromRight,
  slideUp,
  staggerContainer,
  staggerItem,
} from '@/lib/animations'

// Re-export AnimatePresence for convenient use
export { AnimatePresence }

const emptySubscribe = (): (() => void) => () => {}
const returnTrue = (): boolean => true
const returnFalse = (): boolean => false

function useIsMounted(): boolean {
  return useSyncExternalStore(emptySubscribe, returnTrue, returnFalse)
}

function resolveVariants(key: MotionBoxProps['variant']): Variants {
  switch (key) {
    case 'fade':
      return fadeIn
    case 'slideUp':
      return slideUp
    case 'page':
      return pageTransition
    case 'slideRight':
      return slideInFromRight
    case 'scale':
      return scaleIn
    default:
      return slideUp
  }
}

interface MotionBoxProps {
  variant?: 'fade' | 'slideUp' | 'slideRight' | 'scale' | 'page'
  delay?: number
  children: React.ReactNode
  className?: string
}

export const MotionBox: React.FC<MotionBoxProps> = ({ variant = 'slideUp', delay = 0, children, className }) => {
  const mounted = useIsMounted()

  if (!mounted) {
    return (
      <div className={cn(className)} style={{ opacity: 0 }}>
        {children}
      </div>
    )
  }

  const variants = resolveVariants(variant)

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={{ delay }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}

interface StaggerContainerProps {
  staggerDelay?: number
  children: React.ReactNode
  className?: string
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({ staggerDelay = 0.1, children, className }) => {
  const mounted = useIsMounted()

  if (!mounted) {
    return <div className={cn(className)}>{children}</div>
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{
        ...staggerContainer,
        animate: {
          ...staggerContainer.animate,
          transition: { staggerChildren: staggerDelay },
        },
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}

interface StaggerItemProps {
  children: React.ReactNode
  className?: string
}

export const StaggerItem: React.FC<StaggerItemProps> = ({ children, className }) => {
  return (
    <motion.div variants={staggerItem} className={cn(className)}>
      {children}
    </motion.div>
  )
}
