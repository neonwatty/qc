// Re-export all settings actions from their respective modules
// NOTE: no 'use server' here — each sub-module has its own directive.
export type { SettingsActionState } from './actions/profile'

export {
  updateProfile,
  leaveCoupleAction,
  resendInviteAction,
  updateCoupleSettings,
  exportUserData,
} from './actions/profile'

export { updateSessionSettings } from './actions/proposals'

export { createCategory, updateCategory, toggleCategoryActive } from './actions/categories'

export { updateCategoryPrompts } from './actions/prompts'

export { updateReminderSchedule, toggleReminderActive } from './actions/reminders'

export { updatePersonalization } from './actions/personalization'

export { redoOnboarding } from './actions/onboarding'
