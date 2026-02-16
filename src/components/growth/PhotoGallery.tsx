'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

import { scaleIn, fadeIn } from '@/lib/animations'
import type { Milestone } from '@/types'
import { RarityBadge } from '@/components/growth/RarityBadge'
import { CategoryBadge } from '@/components/growth/CategoryBadge'

interface PhotoGalleryProps {
  milestones: Milestone[]
  onEdit: (milestone: Milestone) => void
}

export function PhotoGallery({ milestones, onEdit }: PhotoGalleryProps) {
  const [selected, setSelected] = useState<Milestone | null>(null)

  if (milestones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <span className="text-3xl">📸</span>
        </div>
        <h3 className="text-lg font-semibold mb-2">No photos yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Upload photos to your milestones to build your visual memory gallery.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {milestones.map((milestone) => (
          <motion.button
            key={milestone.id}
            variants={scaleIn}
            initial="initial"
            animate="animate"
            onClick={() => setSelected(milestone)}
            className="group relative aspect-square overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <Image
              src={milestone.photoUrl!}
              alt={milestone.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-xs font-medium text-white truncate">
                {milestone.title}
              </p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <PhotoLightbox
            milestone={selected}
            onClose={() => setSelected(null)}
            onEdit={onEdit}
          />
        )}
      </AnimatePresence>
    </>
  )
}

interface PhotoLightboxProps {
  milestone: Milestone
  onClose: () => void
  onEdit: (milestone: Milestone) => void
}

function PhotoLightbox({ milestone, onClose, onEdit }: PhotoLightboxProps) {
  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      exit="exit"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative max-w-3xl w-full bg-background rounded-lg overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Image */}
        <div className="relative aspect-video">
          <Image
            src={milestone.photoUrl!}
            alt={milestone.title}
            fill
            className="object-contain bg-black"
            sizes="(max-width: 768px) 100vw, 75vw"
            priority
          />
        </div>

        {/* Details */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-lg">{milestone.title}</h3>
              {milestone.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {milestone.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <CategoryBadge category={milestone.category} />
                <RarityBadge rarity={milestone.rarity} />
              </div>
            </div>
            <button
              onClick={() => {
                onClose()
                onEdit(milestone)
              }}
              className="text-sm text-primary hover:underline shrink-0"
            >
              Edit
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
