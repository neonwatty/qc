'use client'

import { motion } from 'framer-motion'
import { Shield, Heart, Sparkles, Zap } from 'lucide-react'
import { staggerContainer, staggerItem } from '@/lib/animations'

const TRUST_SIGNALS = [
  { icon: Heart, text: 'Built for couples' },
  { icon: Shield, text: 'Privacy-first design' },
  { icon: Zap, text: 'Free to start' },
  { icon: Sparkles, text: 'No data selling, ever' },
] as const

export function SocialProof(): React.ReactNode {
  return (
    <section className="py-12 px-2 sm:px-6 lg:px-8 bg-muted/50">
      <motion.div
        className="max-w-4xl mx-auto flex flex-wrap justify-center gap-6 sm:gap-10"
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        {TRUST_SIGNALS.map((signal) => {
          const Icon = signal.icon
          return (
            <motion.div key={signal.text} className="flex items-center gap-2" variants={staggerItem}>
              <Icon className="w-4 h-4 text-[hsl(var(--primary))]" />
              <span className="text-sm font-medium text-muted-foreground">{signal.text}</span>
            </motion.div>
          )
        })}
      </motion.div>
    </section>
  )
}
