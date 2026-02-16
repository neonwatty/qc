'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { MoreHorizontal, Pencil, Trash2, Upload } from 'lucide-react'

import { scaleIn } from '@/lib/animations'
import type { Milestone } from '@/types'
import { deleteMilestone, uploadPhoto } from '@/app/(app)/growth/actions'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { RarityBadge } from '@/components/growth/RarityBadge'
import { CategoryBadge } from '@/components/growth/CategoryBadge'

interface MilestoneCardProps {
  milestone: Milestone
  onEdit: (milestone: Milestone) => void
}

export function MilestoneCard({ milestone, onEdit }: MilestoneCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this milestone?')) return

    setIsDeleting(true)
    const formData = new FormData()
    formData.append('id', milestone.id)
    await deleteMilestone(formData)
    setIsDeleting(false)
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('milestoneId', milestone.id)
    formData.append('photo', file)
    await uploadPhoto(formData)
    setIsUploading(false)
  }

  return (
    <motion.div variants={scaleIn}>
      <Card variant="elevated" className="overflow-hidden">
        {/* Photo */}
        {milestone.photoUrl && (
          <div className="relative h-48 w-full">
            <Image
              src={milestone.photoUrl}
              alt={milestone.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        )}

        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {/* Title row */}
              <div className="flex items-center gap-2 mb-1">
                {milestone.icon && (
                  <span className="text-lg shrink-0">{milestone.icon}</span>
                )}
                <h3 className="font-semibold text-base truncate">
                  {milestone.title}
                </h3>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2 mb-2">
                <CategoryBadge category={milestone.category} />
                <RarityBadge rarity={milestone.rarity} />
                <span className="text-xs text-muted-foreground">
                  {milestone.points} pts
                </span>
              </div>

              {/* Description */}
              {milestone.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {milestone.description}
                </p>
              )}
            </div>

            {/* Actions menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(milestone)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <label className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploading ? 'Uploading...' : 'Upload Photo'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handlePhotoUpload}
                      disabled={isUploading}
                    />
                  </label>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
