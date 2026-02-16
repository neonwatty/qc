'use client'

import React, { useState } from 'react'
import { Plus, Trash2, Check, Calendar, User, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MotionBox, StaggerContainer, StaggerItem } from '@/components/ui/motion'
import type { ActionItem } from '@/types'

interface ActionItemsProps {
  actionItems: ActionItem[]
  onAddActionItem: (actionItem: Omit<ActionItem, 'id' | 'createdAt'>) => void
  onRemoveActionItem: (actionItemId: string) => void
  onToggleActionItem: (actionItemId: string) => void
  coupleId: string
  onNext?: () => void
  onBack?: () => void
}

export function ActionItems({
  actionItems = [],
  onAddActionItem,
  onRemoveActionItem,
  onToggleActionItem,
  coupleId,
  onNext,
  onBack,
}: ActionItemsProps): React.ReactNode {
  const [newItemTitle, setNewItemTitle] = useState('')
  const [isAddingItem, setIsAddingItem] = useState(false)

  const handleAddItem = (): void => {
    if (newItemTitle.trim()) {
      onAddActionItem({
        coupleId,
        checkInId: null,
        title: newItemTitle.trim(),
        description: null,
        assignedTo: null,
        dueDate: null,
        completed: false,
        completedAt: null,
      })
      setNewItemTitle('')
      setIsAddingItem(false)
    }
  }

  return (
    <MotionBox variant="page" className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Action Items</h2>
        <p className="text-gray-600">Create actionable next steps to strengthen your relationship</p>
      </div>

      <StaggerContainer className="space-y-3">
        {actionItems.map((item) => (
          <StaggerItem key={item.id}>
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => onToggleActionItem(item.id)}
                  className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 transition-colors ${
                    item.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-400'
                  }`}
                >
                  {item.completed && <Check className="w-full h-full text-white p-0.5" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {item.title}
                  </div>
                  {item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                    {item.assignedTo && (
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>Assigned</span>
                      </div>
                    )}
                    {item.dueDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(item.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onRemoveActionItem(item.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                  aria-label="Remove action item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {isAddingItem ? (
        <Card className="p-4 space-y-4">
          <Input
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
            placeholder="e.g., Plan a date night"
            autoFocus
          />
          <div className="flex gap-2">
            <Button onClick={handleAddItem} disabled={!newItemTitle.trim()} className="flex-1">
              Add Action Item
            </Button>
            <Button
              onClick={() => {
                setIsAddingItem(false)
                setNewItemTitle('')
              }}
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </Card>
      ) : (
        <Button onClick={() => setIsAddingItem(true)} variant="outline" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Action Item
        </Button>
      )}

      {actionItems.length > 0 && (
        <Card className="p-4 bg-pink-50 border-pink-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">
                {actionItems.length} action {actionItems.length === 1 ? 'item' : 'items'} created
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {actionItems.filter((i) => i.completed).length} completed,{' '}
                {actionItems.filter((i) => !i.completed).length} remaining
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="flex gap-3 pt-4">
        {onBack && (
          <Button onClick={onBack} variant="outline" className="flex-1">
            Back
          </Button>
        )}
        {onNext && (
          <Button onClick={onNext} className="flex-1">
            Continue
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </MotionBox>
  )
}
