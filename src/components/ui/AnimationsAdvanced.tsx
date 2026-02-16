'use client'

import React from 'react'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'

export const CountUp: React.FC<{
  from: number
  to: number
  duration?: number
  className?: string
}> = ({ to, duration = 1, className }) => {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.span
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration, ease: 'easeOut' }}
      >
        {to}
      </motion.span>
    </motion.span>
  )
}

export const MagneticHover: React.FC<{
  children: React.ReactNode
  className?: string
  strength?: number
}> = ({ children, className, strength = 0.3 }) => {
  return (
    <motion.div
      className={className}
      whileHover={{ scale: 1 + strength * 0.1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      {children}
    </motion.div>
  )
}

export const ShakeAnimation: React.FC<{
  children: React.ReactNode
  className?: string
  trigger: boolean
}> = ({ children, className, trigger }) => {
  return (
    <motion.div
      className={className}
      animate={trigger ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}

export const TypewriterText: React.FC<{
  text: string
  className?: string
  speed?: number
}> = ({ text, className, speed = 50 }) => {
  const [displayedText, setDisplayedText] = React.useState('')

  React.useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1))
        i++
      } else {
        clearInterval(timer)
      }
    }, speed)

    return () => clearInterval(timer)
  }, [text, speed])

  return (
    <span className={className}>
      {displayedText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      >
        |
      </motion.span>
    </span>
  )
}

export const ProgressCircle: React.FC<{
  progress: number
  size?: number
  strokeWidth?: number
  className?: string
}> = ({ progress, size = 60, strokeWidth = 4, className }) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = `${circumference} ${circumference}`
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className={cn('relative', className)} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          className="text-primary"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-semibold">{Math.round(progress)}%</span>
      </div>
    </div>
  )
}
