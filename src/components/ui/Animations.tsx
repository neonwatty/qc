'use client'

import { motion, AnimatePresence } from 'framer-motion'

export const HoverLift: React.FC<{
  children: React.ReactNode
  className?: string
  lift?: 'sm' | 'md' | 'lg'
}> = ({ children, className, lift = 'md' }) => {
  const liftValues = {
    sm: { y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
    md: { y: -4, boxShadow: '0 8px 25px rgba(0,0,0,0.12)' },
    lg: { y: -8, boxShadow: '0 12px 40px rgba(0,0,0,0.15)' },
  }

  return (
    <motion.div className={className} whileHover={liftValues[lift]} transition={{ duration: 0.2, ease: 'easeOut' }}>
      {children}
    </motion.div>
  )
}

export const TapScale: React.FC<{
  children: React.ReactNode
  className?: string
  scale?: number
}> = ({ children, className, scale = 0.95 }) => {
  return (
    <motion.div className={className} whileTap={{ scale }} transition={{ duration: 0.1 }}>
      {children}
    </motion.div>
  )
}

export const InteractiveElement: React.FC<{
  children: React.ReactNode
  className?: string
  hoverScale?: number
  tapScale?: number
}> = ({ children, className, hoverScale = 1.05, tapScale = 0.95 }) => {
  return (
    <motion.div
      className={className}
      whileHover={{ scale: hoverScale }}
      whileTap={{ scale: tapScale }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

export const StaggerContainer: React.FC<{
  children: React.ReactNode
  className?: string
  staggerDelay?: number
}> = ({ children, className, staggerDelay = 0.1 }) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: staggerDelay, delayChildren: 0.1 },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

export const StaggerItem: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.4, ease: 'easeOut' },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

export const SlideIn: React.FC<{
  children: React.ReactNode
  direction: 'left' | 'right' | 'up' | 'down'
  className?: string
  distance?: number
}> = ({ children, direction, className, distance = 50 }) => {
  const directionMap = {
    left: { x: -distance, y: 0 },
    right: { x: distance, y: 0 },
    up: { x: 0, y: -distance },
    down: { x: 0, y: distance },
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...directionMap[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

export const NotificationSlide: React.FC<{
  children: React.ReactNode
  show: boolean
  side?: 'left' | 'right'
  className?: string
}> = ({ children, show, side = 'right', className }) => {
  const slideValue = side === 'right' ? 400 : -400

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={className}
          initial={{ x: slideValue, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: slideValue, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export const FloatingElement: React.FC<{
  children: React.ReactNode
  className?: string
  intensity?: 'gentle' | 'moderate' | 'strong'
}> = ({ children, className, intensity = 'gentle' }) => {
  const intensityMap = {
    gentle: { y: [-2, 2, -2], duration: 4 },
    moderate: { y: [-4, 4, -4], duration: 3 },
    strong: { y: [-8, 8, -8], duration: 2 },
  }

  const config = intensityMap[intensity]

  return (
    <motion.div
      className={className}
      animate={{ y: config.y }}
      transition={{ duration: config.duration, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}

export const PulseGlow: React.FC<{
  children: React.ReactNode
  className?: string
  color?: string
}> = ({ children, className, color = 'rgb(59, 130, 246)' }) => {
  return (
    <motion.div
      className={className}
      animate={{
        boxShadow: [`0 0 0 0px ${color}00`, `0 0 0 8px ${color}20`, `0 0 0 0px ${color}00`],
      }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}

export const RevealOnView: React.FC<{
  children: React.ReactNode
  className?: string
  threshold?: number
}> = ({ children, className, threshold = 0.1 }) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      viewport={{ once: true, amount: threshold }}
    >
      {children}
    </motion.div>
  )
}
