/**
 * Export centralisé des composants de cartes
 * 
 * UTILISATION :
 * ```typescript
 * import { CarteClassique, CarteRectoVerso, TEMPLATES_CARTES } from '@/components/cartes'
 * ```
 */

export { CarteClassique } from './carte-classique'
export { CarteModerne } from './carte-moderne'
export { CarteExamen } from './carte-examen'
export { CarteRectoVerso } from './carte-recto-verso'
export { CartePersonnel } from './carte-personnel'

/**
 * Types de templates disponibles
 */
export type TypeTemplate = 'classique' | 'moderne' | 'examen' | 'recto-verso'

/**
 * Liste des templates avec leurs métadonnées
 */
export const TEMPLATES_CARTES = [
  {
    id: 'classique' as TypeTemplate,
    nom: 'Classique',
    description: 'Design traditionnel avec mise en page structurée',
    rectoVerso: false,
  },
  {
    id: 'moderne' as TypeTemplate,
    nom: 'Moderne',
    description: 'Design contemporain avec gradient et style épuré',
    rectoVerso: false,
  },
  {
    id: 'examen' as TypeTemplate,
    nom: 'Examen',
    description: 'Format officiel pour les examens et concours',
    rectoVerso: false,
  },
  {
    id: 'recto-verso' as TypeTemplate,
    nom: 'Recto-Verso',
    description: 'Carte complète avec informations et règlement au verso',
    rectoVerso: true,
  },
]
