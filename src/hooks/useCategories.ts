'use client'

import { useCallback, useEffect, useState } from 'react'

import { createClient } from '@/lib/supabase/client'

interface Category {
  id: string
  name: string
  type: 'note' | 'milestone'
  coupleId: string
  createdAt: string
}

interface DbCategory {
  id: string
  name: string
  type: 'note' | 'milestone'
  couple_id: string
  created_at: string
}

interface UseCategoriesReturn {
  categories: Category[]
  isLoading: boolean
  error: string | null
  addCategory: (name: string, type: 'note' | 'milestone') => Promise<void>
  removeCategory: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

function toCategory(db: DbCategory): Category {
  return {
    id: db.id,
    name: db.name,
    type: db.type,
    coupleId: db.couple_id,
    createdAt: db.created_at,
  }
}

export function useCategories(coupleId: string | null): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    if (!coupleId) {
      setCategories([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error: fetchError } = await supabase
      .from('categories')
      .select('*')
      .eq('couple_id', coupleId)
      .order('name')

    if (fetchError) {
      setError(fetchError.message)
      setIsLoading(false)
      return
    }

    setCategories((data as DbCategory[]).map(toCategory))
    setIsLoading(false)
  }, [coupleId])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const addCategory = useCallback(
    async (name: string, type: 'note' | 'milestone') => {
      if (!coupleId) return

      setError(null)
      const supabase = createClient()
      const { error: insertError } = await supabase
        .from('categories')
        .insert({ name, type, couple_id: coupleId })

      if (insertError) {
        setError(insertError.message)
        return
      }

      await fetchCategories()
    },
    [coupleId, fetchCategories],
  )

  const removeCategory = useCallback(
    async (id: string) => {
      setError(null)
      const supabase = createClient()
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (deleteError) {
        setError(deleteError.message)
        return
      }

      await fetchCategories()
    },
    [fetchCategories],
  )

  return {
    categories,
    isLoading,
    error,
    addCategory,
    removeCategory,
    refresh: fetchCategories,
  }
}
