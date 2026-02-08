/**
 * Script pour créer les index MongoDB
 * À exécuter une fois lors du déploiement ou manuellement
 * 
 * Usage: npx tsx scripts/create-indexes.ts
 */

import { connectToDatabase, closeDatabase } from '../lib/services/mongodb'
import { ensureIndexes } from '../lib/services/mongodb-indexes'

async function main() {
  console.log('🚀 Début de la création des index MongoDB...\n')

  try {
    // Connexion à la base de données
    await connectToDatabase()
    console.log('✓ Connexion à MongoDB établie\n')

    // Création des index
    await ensureIndexes()

    console.log('\n✅ Tous les index ont été créés avec succès !')
    console.log('\n📊 Index créés:')
    console.log('   - Établissements: nom, creeLe, anneeScolaire, text')
    console.log('   - Classes: etablissementId, nom, niveau, text')
    console.log('   - Élèves: classeId, matricule (unique), text')
    console.log('   - Personnel: etablissementId, role, matricule (unique), text')
    console.log('\n💡 Les index composés optimisent les requêtes fréquentes.')

  } catch (erreur) {
    console.error('\n❌ Erreur:', erreur)
    process.exit(1)
  } finally {
    await closeDatabase()
  }
}

main()
