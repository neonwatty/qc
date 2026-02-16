'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trophy } from 'lucide-react'

import { staggerContainer } from '@/lib/animations'
import type { Milestone, MilestoneCategory } from '@/types'
import { useMilestones } from '@/hooks/useMilestones'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { GrowthStats } from '@/components/growth/GrowthStats'
import { MilestoneTimeline } from '@/components/growth/MilestoneTimeline'
import { MilestoneForm } from '@/components/growth/MilestoneForm'
import { PhotoGallery } from '@/components/growth/PhotoGallery'
import { CategoryFilter } from '@/components/growth/CategoryFilter'

interface GrowthPageClientProps {
  milestones: Milestone[]
  coupleId: string
}

export function GrowthPageClient({ milestones, coupleId }: GrowthPageClientProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null)
  const [activeTab, setActiveTab] = useState<'timeline' | 'gallery'>('timeline')

  const {
    filtered,
    categoryFilter,
    setCategoryFilter,
    sortOrder,
    setSortOrder,
  } = useMilestones(milestones)

  const photosWithMilestones = milestones.filter((m) => m.photoUrl)

  function handleEdit(milestone: Milestone) {
    setEditingMilestone(milestone)
    setIsFormOpen(true)
  }

  function handleCloseForm() {
    setIsFormOpen(false)
    setEditingMilestone(null)
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Growth Gallery</h1>
            <p className="text-sm text-muted-foreground">
              Track your relationship milestones and growth together
            </p>
          </div>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Milestone
        </Button>
      </div>

      {/* Stats */}
      <GrowthStats milestones={milestones} />

      {/* Tab Switcher */}
      <div className="flex gap-2 border-b pb-2">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${
            activeTab === 'timeline'
              ? 'bg-primary/10 text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Timeline
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${
            activeTab === 'gallery'
              ? 'bg-primary/10 text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Photo Gallery ({photosWithMilestones.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'timeline' ? (
        <div className="space-y-4">
          <CategoryFilter
            value={categoryFilter}
            onChange={setCategoryFilter}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
          />
          <MilestoneTimeline
            milestones={filtered}
            onEdit={handleEdit}
          />
        </div>
      ) : (
        <PhotoGallery milestones={photosWithMilestones} onEdit={handleEdit} />
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMilestone ? 'Edit Milestone' : 'New Milestone'}
            </DialogTitle>
            <DialogDescription>
              {editingMilestone
                ? 'Update the details of your milestone.'
                : 'Record a new milestone in your relationship journey.'}
            </DialogDescription>
          </DialogHeader>
          <MilestoneForm
            milestone={editingMilestone}
            coupleId={coupleId}
            onClose={handleCloseForm}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
