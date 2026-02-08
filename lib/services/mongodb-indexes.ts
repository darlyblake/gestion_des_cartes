/**
 * Configuration des index MongoDB pour optimiser les requêtes
 * Index composés et text pour les recherches fréquentes
 */

import { getCollection } from './mongodb'

/**
 * Crée tous les index nécessaires pour optimiser les performances
 * Inclut des index composés et text pour les recherches
 */
export async function ensureIndexes() {
  try {
    // ═══════════════════════════════════════════════════════
    // ÉTABLISSEMENTS
    // ═══════════════════════════════════════════════════════
    const etablissementsCollection = await getCollection('etablissements')
    
    await etablissementsCollection.createIndex({ nom: 1 })
    await etablissementsCollection.createIndex({ creeLe: -1 })
    await etablissementsCollection.createIndex({ anneeScolaire: 1 })
    // Index text pour recherche sur nom et adresse
    await etablissementsCollection.createIndex(
      { nom: 'text', adresse: 'text' },
      { default_language: 'french', weights: { nom: 10, adresse: 5 } }
    )

    // ═══════════════════════════════════════════════════════
    // CLASSES
    // ═══════════════════════════════════════════════════════
    const classesCollection = await getCollection('classes')
    
    // Index simples
    await classesCollection.createIndex({ etablissementId: 1 })
    await classesCollection.createIndex({ creeLe: -1 })
    
    // Index composés pour requêtes fréquentes
    await classesCollection.createIndex({ etablissementId: 1, nom: 1 })
    await classesCollection.createIndex({ etablissementId: 1, niveau: 1 })
    await classesCollection.createIndex({ etablissementId: 1, creeLe: -1 })
    
    // Index text pour recherche sur nom et niveau
    await classesCollection.createIndex(
      { nom: 'text', niveau: 'text' },
      { default_language: 'french' }
    )

    // ═══════════════════════════════════════════════════════
    // ÉLÈVES
    // ═══════════════════════════════════════════════════════
    const elevesCollection = await getCollection('eleves')
    
    // Index simples
    await elevesCollection.createIndex({ classeId: 1 })
    await elevesCollection.createIndex({ creeLe: -1 })
    await elevesCollection.createIndex({ matricule: 1 }, { unique: true })
    
    // Index composés pour requêtes fréquentes
    await elevesCollection.createIndex({ classeId: 1, nom: 1 })
    await elevesCollection.createIndex({ classeId: 1, creeLe: -1 })
    await elevesCollection.createIndex({ classeId: 1, nom: 1, prenom: 1 })
    
    // Index pour filtrage par établissement (via classes)
    await elevesCollection.createIndex({ 'classe.etablissementId': 1 })
    
    // Index text pour recherche sur nom, prénom et lieu de naissance
    await elevesCollection.createIndex(
      { nom: 'text', prenom: 'text', lieuNaissance: 'text' },
      { default_language: 'french', weights: { nom: 10, prenom: 8, lieuNaissance: 3 } }
    )

    // ═══════════════════════════════════════════════════════
    // PERSONNEL
    // ═══════════════════════════════════════════════════════
    const personnelCollection = await getCollection('personnel')
    
    // Index simples
    await personnelCollection.createIndex({ etablissementId: 1 })
    await personnelCollection.createIndex({ creeLe: -1 })
    await personnelCollection.createIndex({ role: 1 })
    await personnelCollection.createIndex({ matricule: 1 }, { unique: true, sparse: true })
    
    // Index composés pour requêtes fréquentes
    await personnelCollection.createIndex({ etablissementId: 1, nom: 1 })
    await personnelCollection.createIndex({ etablissementId: 1, role: 1 })
    await personnelCollection.createIndex({ etablissementId: 1, creeLe: -1 })
    await personnelCollection.createIndex({ role: 1, nom: 1 })
    
    // Index text pour recherche sur nom, prénom et fonction
    await personnelCollection.createIndex(
      { nom: 'text', prenom: 'text', fonction: 'text' },
      { default_language: 'french', weights: { nom: 10, prenom: 8, fonction: 5 } }
    )

    console.warn('✅ Index MongoDB créés avec succès')
    console.warn('   - Index simples: OK')
    console.warn('   - Index composés: OK')
    console.warn('   - Index text (recherche): OK')
  } catch (erreur) {
    console.error('❌ Erreur lors de la création des index:', erreur)
  }
}

/**
 * Vérifie les index existants et retourne un rapport
 */
export async function getIndexesReport() {
  const report = {
    etablissements: await getIndexInfo('etablissements'),
    classes: await getIndexInfo('classes'),
    eleves: await getIndexInfo('eleves'),
    personnel: await getIndexInfo('personnel'),
  }
  return report
}

async function getIndexInfo(collectionName: string) {
  try {
    const collection = await getCollection(collectionName)
    const indexes = await collection.indexes()
    return indexes.map((idx: Record<string, unknown>) => ({
      name: idx.name,
      key: idx.key,
      unique: idx.unique || false,
      text: idx.text || false,
    }))
  } catch {
    return []
  }
}
