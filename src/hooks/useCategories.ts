import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRealtimeCouple } from '@/hooks/useRealtimeCouple'
import type { Category } from '@/types'
import type { DbCategory } from '@/types/database'

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

export function useCategories(coupleId: string | null) {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadCategories() {
      if (!coupleId) {
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('couple_id', coupleId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) {
        console.error('Failed to load categories:', error)
        setIsLoading(false)
        return
      }

      if (data) {
        setCategories(data.map(mapDbToCategory))
      }
      setIsLoading(false)
    }

    loadCategories()
  }, [coupleId, supabase])

  // Realtime subscription
  useRealtimeCouple<DbCategory>({
    table: 'categories',
    coupleId: coupleId || '',
    onInsert: (record) => {
      const category = mapDbToCategory(record)
      if (category.isActive) {
        setCategories((prev) => [...prev, category].sort((a, b) => a.sortOrder - b.sortOrder))
      }
    },
    onUpdate: (record) => {
      const category = mapDbToCategory(record)
      setCategories((prev) => {
        if (!category.isActive) {
          return prev.filter((c) => c.id !== category.id)
        }
        return prev.map((c) => (c.id === category.id ? category : c)).sort((a, b) => a.sortOrder - b.sortOrder)
      })
    },
    onDelete: (oldRecord) => {
      setCategories((prev) => prev.filter((c) => c.id !== oldRecord.id))
    },
  })

  return { categories, isLoading }
}
