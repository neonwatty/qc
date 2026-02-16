import type { MilestoneCategory, MilestoneRarity } from '@/types'

export interface MilestoneFormData {
  title: string
  description: string
  category: MilestoneCategory | ''
  icon: string
  photoFile: File | null
  rarity: MilestoneRarity
  points: number
}

export const INITIAL_FORM: MilestoneFormData = {
  title: '',
  description: '',
  category: '',
  icon: '',
  photoFile: null,
  rarity: 'common',
  points: 10,
}

export const CATEGORY_OPTIONS: {
  id: MilestoneCategory
  name: string
  icon: string
  color: string
  bgColor: string
  description: string
}[] = [
  {
    id: 'communication',
    name: 'Communication',
    icon: '💬',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    description: 'Milestones related to how you talk and listen',
  },
  {
    id: 'intimacy',
    name: 'Intimacy',
    icon: '❤️',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    description: 'Deepening closeness and emotional bonds',
  },
  {
    id: 'growth',
    name: 'Growth',
    icon: '🌱',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    description: 'Personal and relationship development',
  },
  {
    id: 'relationship',
    name: 'Relationship',
    icon: '🎉',
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    description: 'Special moments and celebrations',
  },
  {
    id: 'adventure',
    name: 'Adventure',
    icon: '⭐',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    description: 'Shared experiences and explorations',
  },
  {
    id: 'milestone',
    name: 'Milestone',
    icon: '🎯',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    description: 'Shared objectives and achievements',
  },
  {
    id: 'custom',
    name: 'Custom',
    icon: '✨',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    description: 'Create your own category',
  },
]

export const RARITY_OPTIONS: { id: MilestoneRarity; name: string; icon: string }[] = [
  { id: 'common', name: 'Common', icon: '⚪' },
  { id: 'rare', name: 'Rare', icon: '🔵' },
  { id: 'epic', name: 'Epic', icon: '🟣' },
  { id: 'legendary', name: 'Legendary', icon: '🟡' },
]
