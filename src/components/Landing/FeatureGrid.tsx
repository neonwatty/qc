'use client'

import { motion } from 'framer-motion'
import { MessageSquare, Heart, TrendingUp, Shield, Sparkles, Bell } from 'lucide-react'
import { staggerContainer, staggerItem } from '@/lib/animations'
import { Card } from '@/components/ui/card'

const FEATURES = [
  {
    icon: MessageSquare,
    title: 'Guided Check-ins',
    description: 'Structured conversations that help you identify and address what needs attention.',
    gradient: 'from-blue-500/10 to-cyan-500/10',
    iconColor: 'text-blue-600',
  },
  {
    icon: Bell,
    title: 'Relationship Reminders',
    description: 'Smart scheduling, progress tracking, and categories for habits, check-ins, and special moments.',
    gradient: 'from-pink-500/10 to-rose-500/10',
    iconColor: 'text-pink-600',
  },
  {
    icon: Heart,
    title: 'Pattern Recognition',
    description: "Track moods and responses to understand each other's patterns better.",
    gradient: 'from-rose-500/10 to-pink-500/10',
    iconColor: 'text-rose-600',
  },
  {
    icon: TrendingUp,
    title: 'Progress Metrics',
    description: 'Visualize your journey with meaningful data and celebrate improvements.',
    gradient: 'from-green-500/10 to-emerald-500/10',
    iconColor: 'text-green-600',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Your conversations stay private. Share only what you choose with flexible privacy controls.',
    gradient: 'from-purple-500/10 to-violet-500/10',
    iconColor: 'text-purple-600',
  },
  {
    icon: Sparkles,
    title: 'Action Items',
    description: 'Turn insights into concrete next steps with built-in accountability.',
    gradient: 'from-yellow-500/10 to-orange-500/10',
    iconColor: 'text-yellow-600',
  },
] as const

export function FeatureGrid(): React.ReactNode {
  return (
    <section
      id="features"
      className="py-24 px-2 sm:px-6 lg:px-8 bg-gradient-to-b from-[hsl(var(--background))] to-[hsl(var(--muted))]/30"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-20"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6" variants={staggerItem}>
            For lovers who like
            <span className="text-[hsl(var(--primary))] block sm:inline sm:ml-3">systems</span>
          </motion.h2>

          <motion.p className="text-lg text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto" variants={staggerItem}>
            For couples who like to solve problems together.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-50px' }}
        >
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div key={index} variants={staggerItem}>
                <Card
                  className={`p-6 h-full bg-gradient-to-br ${feature.gradient} border-0 shadow-sm hover:shadow-lg transition-all duration-300`}
                >
                  <div className="flex flex-col h-full">
                    <div
                      className={`w-12 h-12 rounded-xl bg-white/50 flex items-center justify-center mb-4 ${feature.iconColor}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-[hsl(var(--foreground))]">{feature.title}</h3>
                    <p className="text-[hsl(var(--muted-foreground))] leading-relaxed flex-grow">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-20"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <motion.div className="max-w-2xl mx-auto" variants={staggerItem}>
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">Ready to engineer a better relationship?</h3>
            <p className="text-[hsl(var(--muted-foreground))] mb-8">
              Start your systematic approach to relationship improvement.
            </p>
            <motion.a
              href="/signup"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-lg bg-[hsl(var(--primary))] text-white hover:opacity-90 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get started free
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
