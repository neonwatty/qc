'use client'

import { motion } from 'framer-motion'
import { Heart, MessageCircle, TrendingUp } from 'lucide-react'
import { staggerContainer, staggerItem } from '@/lib/animations'

const STEPS = [
  {
    number: 1,
    icon: Heart,
    title: 'Sign up & invite your partner',
    description: 'Create your couple profile and send an invite link in seconds.',
  },
  {
    number: 2,
    icon: MessageCircle,
    title: 'Check in together',
    description: 'Guided sessions with timers, turn-taking, and structured topics.',
  },
  {
    number: 3,
    icon: TrendingUp,
    title: 'Track your growth',
    description: 'See patterns, celebrate milestones, and keep building together.',
  },
] as const

export function HowItWorks(): React.ReactNode {
  return (
    <section id="how-it-works" className="py-24 px-2 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.h2
            className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4"
            variants={staggerItem}
          >
            How it works
          </motion.h2>
          <motion.p className="text-lg text-muted-foreground" variants={staggerItem}>
            Get started in three simple steps.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-50px' }}
        >
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-border" />

          {STEPS.map((step) => {
            const Icon = step.icon
            return (
              <motion.div key={step.number} className="text-center relative" variants={staggerItem}>
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[hsl(var(--primary))]/10 mb-6 relative">
                  <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[hsl(var(--primary))] text-white text-sm font-bold flex items-center justify-center">
                    {step.number}
                  </span>
                  <Icon className="w-10 h-10 text-[hsl(var(--primary))]" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">{step.description}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
