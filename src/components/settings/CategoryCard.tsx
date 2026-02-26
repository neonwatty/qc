'use client'

import type { Category } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Pencil, GripVertical } from 'lucide-react'

interface CategoryCardProps {
  category: Category
  onEdit: (category: Category) => void
  onToggleActive: (categoryId: string, isActive: boolean) => void
}

export function CategoryCard({ category, onEdit, onToggleActive }: CategoryCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="cursor-grab text-gray-400">
          <GripVertical className="h-5 w-5" />
        </div>
        <div className="text-2xl">{category.icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{category.name}</h4>
            {category.isSystem && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">System</span>
            )}
          </div>
          {category.description && <p className="text-sm text-gray-600">{category.description}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={category.isActive} onCheckedChange={(checked) => onToggleActive(category.id, checked)} />
          {!category.isSystem && (
            <Button variant="ghost" size="icon" onClick={() => onEdit(category)}>
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
