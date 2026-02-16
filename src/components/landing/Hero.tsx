'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { fadeIn, slideUp } from '@/lib/animations'

export function Hero(): React.ReactNode {
  return (
    <section className="relative overflow-hidden px-4 py-20 sm:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 gradient-romantic opacity-50" />
      <div className="absolute -right-40 -top-40 -z-10 h-80 w-80 rounded-full bg-[hsl(var(--primary)/0.08)] blur-3xl" />
      <div className="absolute -bottom-40 -left-40 -z-10 h-80 w-80 rounded-full bg-[hsl(var(--accent)/0.08)] blur-3xl" />

      <div className="mx-auto max-w-3xl text-center">
        <motion.div
          variants={fadeIn}
          initial="initial"
          animate="animate"
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2 text-sm text-[hsl(var(--muted-foreground))]"
        >
          <Heart className="h-4 w-4 text-[hsl(var(--primary))]" fill="currentColor" />
          Relationship wellness, reimagined
        </motion.div>

        <motion.h1
          variants={slideUp}
          initial="initial"
          animate="animate"
          className="text-4xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-5xl lg:text-6xl"
        >
          Grow closer, <span className="text-gradient-primary">together</span>
        </motion.h1>

        <motion.p
          variants={slideUp}
          initial="initial"
          animate="animate"
          className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[hsl(var(--muted-foreground))]"
        >
          QC helps couples strengthen their bond through guided check-ins, shared notes, love language insights, and
          meaningful milestones. Your relationship deserves intention.
        </motion.p>

        <motion.div
          variants={slideUp}
          initial="initial"
          animate="animate"
          className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
        >
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/signup">Get Started Free</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href="/login">Sign In</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
