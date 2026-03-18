/**
 * Index des modales avec lazy loading
 * Export centralisé pour faciliter l'import et le code splitting
 */

// Export des modales avec lazy loading
export { LazyModalSimple } from './lazy-modal-simple'
export { LazyModalConfirmation } from './lazy-modal-confirmation'

// Export des types
export type { ModalSimpleProps } from './lazy-modal-simple'
export type { ModalConfirmationProps } from './lazy-modal-confirmation'

// Import dynamique helper pour les modales
export const loadModalSimple = () => import('./lazy-modal-simple')
export const loadModalConfirmation = () => import('./lazy-modal-confirmation')
