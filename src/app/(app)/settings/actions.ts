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

export { updateSessionSettings, proposeSessionSettings, respondToProposal } from './actions/proposals'

export {
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryActive,
  reorderCategories,
} from './actions/categories'
