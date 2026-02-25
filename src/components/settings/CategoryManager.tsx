'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/types'
import type { DbCategory } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Plus, Pencil, GripVertical } from 'lucide-react'
import { useRealtimeCouple } from '@/hooks/useRealtimeCouple'
import { CategoryFormDialog } from './CategoryFormDialog'

interface CategoryManagerProps {
  coupleId: string
}

function mapDbToCategory(row: DbCategory): Category {
  return {
    id: row.id,
    coupleId: row.couple_id,
    name: row.name,
    description: row.description,
    icon: row.icon,
    isActive: row.is_active,
    isSystem: row.is_system,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  }
}

export function CategoryManager({ coupleId }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '💬',
  })
  const supabase = createClient()

  useEffect(() => {
    async function loadCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('couple_id', coupleId)
        .order('sort_order', { ascending: true })

      if (error) {
        console.error('Failed to load categories:', error)
        return
      }

      if (data) {
        setCategories(data.map(mapDbToCategory))
      }
    }
    loadCategories()
  }, [coupleId, supabase])

  // Realtime subscription
  useRealtimeCouple<DbCategory>({
    table: 'categories',
    coupleId,
    onInsert: (record) => {
      const category = mapDbToCategory(record)
      setCategories((prev) => [...prev, category].sort((a, b) => a.sortOrder - b.sortOrder))
    },
    onUpdate: (record) => {
      const category = mapDbToCategory(record)
      setCategories((prev) =>
        prev.map((c) => (c.id === category.id ? category : c)).sort((a, b) => a.sortOrder - b.sortOrder),
      )
    },
    onDelete: (oldRecord) => {
      setCategories((prev) => prev.filter((c) => c.id !== oldRecord.id))
    },
  })

  function openCreateDialog() {
    setEditingCategory(null)
    setFormData({ name: '', description: '', icon: '💬' })
    setIsDialogOpen(true)
  }

  function openEditDialog(category: Category) {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon,
    })
    setIsDialogOpen(true)
  }

  async function handleSubmit() {
    if (editingCategory) {
      await supabase
        .from('categories')
        .update({
          name: formData.name,
          description: formData.description,
          icon: formData.icon,
        })
        .eq('id', editingCategory.id)
    } else {
      const maxOrder = Math.max(...categories.map((c) => c.sortOrder), 0)
      await supabase.from('categories').insert({
        couple_id: coupleId,
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        sort_order: maxOrder + 1,
      })
    }
    setIsDialogOpen(false)
  }

  async function handleToggleActive(categoryId: string, isActive: boolean) {
    await supabase.from('categories').update({ is_active: isActive }).eq('id', categoryId)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Discussion Categories</h3>
          <p className="text-sm text-gray-600">Customize categories for your check-in sessions</p>
        </div>
        <Button onClick={openCreateDialog} size="sm">
          <Plus className="mr-1 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <CategoryFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingCategory={editingCategory}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
      />

      <div className="space-y-2">
        {categories.map((category) => (
          <Card key={category.id} className="p-4">
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
                <Switch
                  checked={category.isActive}
                  onCheckedChange={(checked) => handleToggleActive(category.id, checked)}
                />
                {!category.isSystem && (
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(category)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
