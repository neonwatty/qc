import { create } from 'zustand'

interface Item {
  id: string
  title: string
  description?: string
  created_at: string
  updated_at: string
}

interface StoreState {
  items: Item[]
  loading: boolean
  error: string | null
  initialized: boolean
}

interface StoreActions {
  fetchItems: () => Promise<void>
  addItem: (item: Omit<Item, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateItem: (id: string, updates: Partial<Pick<Item, 'title' | 'description'>>) => Promise<void>
  deleteItem: (id: string) => Promise<void>
}

type Store = StoreState & StoreActions

let fetchPromise: Promise<void> | null = null

export const useStore = create<Store>((set, get) => ({
  items: [],
  loading: false,
  error: null,
  initialized: false,

  fetchItems: async () => {
    if (fetchPromise) return fetchPromise
    if (get().initialized && !get().error) return

    set({ loading: true, error: null })

    fetchPromise = fetch('/api/items')
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch items')
        }
        const data = await response.json()
        set({ items: data, initialized: true })
      })
      .catch((err: Error) => {
        set({ error: err.message })
      })
      .finally(() => {
        set({ loading: false })
        fetchPromise = null
      })

    return fetchPromise
  },

  addItem: async (item) => {
    set({ loading: true, error: null })

    const response = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    })

    if (!response.ok) {
      set({ loading: false, error: 'Failed to add item' })
      return
    }

    const newItem = await response.json()
    set((state) => ({
      items: [...state.items, newItem],
      loading: false,
    }))
  },

  updateItem: async (id, updates) => {
    set({ loading: true, error: null })

    const response = await fetch(`/api/items/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      set({ loading: false, error: 'Failed to update item' })
      return
    }

    const updated = await response.json()
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? updated : item)),
      loading: false,
    }))
  },

  deleteItem: async (id) => {
    set({ loading: true, error: null })

    const response = await fetch(`/api/items/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      set({ loading: false, error: 'Failed to delete item' })
      return
    }

    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
      loading: false,
    }))
  },
}))
