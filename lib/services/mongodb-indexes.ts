/**
 * Configuration des index MongoDB pour optimiser les requêtes
 * Doit être exécuté une fois au démarrage de l'application
 */

import { getCollection } from './mongodb'

/**
 * Crée tous les index nécessaires pour optimiser les performances
 */
export async function ensureIndexes() {
  try {
    // Index pour les classes
    const classesCollection = await getCollection('classes')
    await classesCollection.createIndex({ etablissementId: 1 })
    await classesCollection.createIndex({ nom: 1 })
    await classesCollection.createIndex({ creeLe: -1 }) // Pour les tris récents

    // Index pour les élèves
    const elevesCollection = await getCollection('eleves')
    await elevesCollection.createIndex({ classeId: 1 })
    await elevesCollection.createIndex({ nom: 1, prenom: 1 })
    await elevesCollection.createIndex({ creeLe: -1 })

    // Index pour le personnel
    const personnelCollection = await getCollection('personnel')
    await personnelCollection.createIndex({ etablissementId: 1 })
    await personnelCollection.createIndex({ nom: 1, prenom: 1 })
    await personnelCollection.createIndex({ creeLe: -1 })

    // Index pour les établissements
    const etablissementsCollection = await getCollection('etablissements')
    await etablissementsCollection.createIndex({ nom: 1 })
    await etablissementsCollection.createIndex({ creeLe: -1 })

    console.warn('✅ Index MongoDB créés avec succès')
  } catch (erreur) {
    console.error('❌ Erreur lors de la création des index:', erreur)
  }
}
