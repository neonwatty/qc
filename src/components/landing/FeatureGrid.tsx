'use client'

import { MessageCircleHeart, StickyNote, TrendingUp, Bell, HandHeart, Languages, Trophy, Shield } from 'lucide-react'
import { motion } from 'framer-motion'

import { staggerContainer, staggerItem } from '@/lib/animations'

interface Feature {
  title: string
  description: string
  icon: React.ReactNode
}

const FEATURES: Feature[] = [
  {
    title: 'Guided Check-ins',
    description: 'Structured conversations that help you connect on what matters most.',
    icon: <MessageCircleHeart className="h-6 w-6" />,
  },
  {
    title: 'Shared Notes',
    description: 'Capture thoughts, memories, and reflections together or privately.',
    icon: <StickyNote className="h-6 w-6" />,
  },
  {
    title: 'Growth Tracking',
    description: 'See how your relationship evolves with insights and trends over time.',
    icon: <TrendingUp className="h-6 w-6" />,
  },
  {
    title: 'Smart Reminders',
    description: 'Never forget date nights, anniversaries, or the little things.',
    icon: <Bell className="h-6 w-6" />,
  },
  {
    title: 'Gentle Requests',
    description: 'Express needs and desires in a thoughtful, structured way.',
    icon: <HandHeart className="h-6 w-6" />,
  },
  {
    title: 'Love Languages',
    description: 'Discover and track how you and your partner give and receive love.',
    icon: <Languages className="h-6 w-6" />,
  },
  {
    title: 'Milestones',
    description: 'Celebrate achievements and special moments in your journey.',
    icon: <Trophy className="h-6 w-6" />,
  },
  {
    title: 'Private & Secure',
    description: 'Your relationship data is encrypted and never shared with third parties.',
    icon: <Shield className="h-6 w-6" />,
  },
]

export function FeatureGrid(): React.ReactNode {
  return (
    <section className="px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-3xl">
            Everything you need to <span className="text-gradient-primary">nurture your love</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[hsl(var(--muted-foreground))]">
            Simple, intentional tools designed to help couples communicate better and grow stronger.
          </p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.title}
              variants={staggerItem}
              className="group rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl gradient-primary text-white">
                {feature.icon}
              </div>
              <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">{feature.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
