// Re-export all database row types
export type {
  DbCouple,
  DbProfile,
  DbCoupleInvite,
  DbCheckIn,
  DbNote,
  DbActionItem,
  DbMilestone,
  DbReminder,
  DbRequest,
  DbLoveLanguage,
  DbLoveAction,
  DbSessionSettings,
} from './database'

// --- Type unions matching CHECK constraints ---

export type CheckInStatus = 'in-progress' | 'completed' | 'abandoned'
export type NotePrivacy = 'private' | 'shared' | 'draft'

export type MilestoneCategory =
  | 'relationship'
  | 'communication'
  | 'intimacy'
  | 'growth'
  | 'adventure'
  | 'milestone'
  | 'custom'

export type MilestoneRarity = 'common' | 'rare' | 'epic' | 'legendary'

export type ReminderCategory = 'habit' | 'check-in' | 'action-item' | 'special-date' | 'custom'
export type ReminderFrequency = 'once' | 'daily' | 'weekly' | 'monthly' | 'custom'
export type NotificationChannel = 'in-app' | 'email' | 'both' | 'none'

export type RequestCategory = 'activity' | 'task' | 'reminder' | 'conversation' | 'date-night' | 'custom'
export type RequestPriority = 'low' | 'medium' | 'high'
export type RequestStatus = 'pending' | 'accepted' | 'declined' | 'converted'

export type LoveLanguageCategory = 'words' | 'acts' | 'gifts' | 'time' | 'touch' | 'custom'
export type LoveLanguagePrivacy = 'private' | 'shared'
export type LoveLanguageImportance = 'low' | 'medium' | 'high' | 'essential'

export type LoveActionStatus = 'suggested' | 'planned' | 'completed' | 'recurring'
export type LoveActionFrequency = 'once' | 'weekly' | 'monthly' | 'surprise'
export type LoveActionDifficulty = 'easy' | 'moderate' | 'challenging'

export type InviteStatus = 'pending' | 'accepted' | 'expired'

export type SessionTemplate = 'quick' | 'standard' | 'deep-dive' | 'custom'

// --- Domain interfaces (camelCase, adapted for Supabase UUIDs) ---

export interface Profile {
  id: string
  email: string
  displayName: string | null
  avatarUrl: string | null
  plan: string
  coupleId: string | null
  createdAt: string
  updatedAt: string
}

export interface Couple {
  id: string
  name: string | null
  relationshipStartDate: string | null
  settings: Record<string, unknown>
  createdAt: string
}

export interface CoupleInvite {
  id: string
  coupleId: string
  invitedBy: string
  invitedEmail: string
  token: string
  status: InviteStatus
  createdAt: string
  expiresAt: string
}

export interface Note {
  id: string
  coupleId: string
  authorId: string
  checkInId: string | null
  content: string
  privacy: NotePrivacy
  tags: string[]
  categoryId: string | null
  createdAt: string
  updatedAt: string
}

export interface ActionItem {
  id: string
  coupleId: string
  checkInId: string | null
  title: string
  description: string | null
  assignedTo: string | null
  dueDate: string | null
  completed: boolean
  completedAt: string | null
  createdAt: string
}

export interface CheckIn {
  id: string
  coupleId: string
  startedAt: string
  completedAt: string | null
  status: CheckInStatus
  categories: string[]
  moodBefore: number | null
  moodAfter: number | null
  reflection: string | null
}

export interface Milestone {
  id: string
  coupleId: string
  title: string
  description: string | null
  category: MilestoneCategory
  icon: string | null
  achievedAt: string | null
  rarity: MilestoneRarity
  points: number
  photoUrl: string | null
}

export interface Reminder {
  id: string
  coupleId: string
  createdBy: string
  title: string
  message: string | null
  category: ReminderCategory
  frequency: ReminderFrequency
  scheduledFor: string
  isActive: boolean
  notificationChannel: NotificationChannel
  customSchedule: Record<string, unknown> | null
  isSnoozed: boolean
  snoozeUntil: string | null
  lastNotifiedAt: string | null
  assignedTo: string | null
  relatedCheckInId: string | null
  relatedActionItemId: string | null
}

export interface RelationshipRequest {
  id: string
  coupleId: string
  requestedBy: string
  requestedFor: string
  title: string
  description: string | null
  category: RequestCategory
  priority: RequestPriority
  status: RequestStatus
  suggestedDate: string | null
  createdAt: string
}

export interface LoveLanguage {
  id: string
  coupleId: string
  userId: string
  title: string
  description: string | null
  category: LoveLanguageCategory
  privacy: LoveLanguagePrivacy
  importance: LoveLanguageImportance
  examples: string[]
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface LoveAction {
  id: string
  coupleId: string
  linkedLanguageId: string | null
  title: string
  description: string | null
  status: LoveActionStatus
  frequency: LoveActionFrequency
  difficulty: LoveActionDifficulty
  completedCount: number
  lastCompletedAt: string | null
  createdAt: string
}

export interface SessionSettings {
  id: string
  coupleId: string
  sessionDuration: number
  timeoutsPerPartner: number
  timeoutDuration: number
  turnBasedMode: boolean
  turnDuration: number
  allowExtensions: boolean
  warmUpQuestions: boolean
  coolDownTime: number
  pauseNotifications: boolean
  autoSaveDrafts: boolean
}

export interface AppState {
  currentUserId: string | null
  currentCoupleId: string | null
  activeCheckInId: string | null
  isLoading: boolean
  error: string | null
}
