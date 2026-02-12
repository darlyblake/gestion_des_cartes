/**
 * Script pour créer les indexes MongoDB nécessaires aux optimisations
 * Run: node scripts/create-text-indexes.mjs
 */

import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not set in environment')
  process.exit(1)
}

async function createIndexes() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    const db = client.db()

    console.log('📝 Création des indexes texte MongoDB...\n')

    // Index texte pour recherche sur établissements
    console.log('📌 Création index texte for établissements...')
    await db.collection('etablissements').createIndex({
      nom: 'text',
      ville: 'text',
      code: 'text',
    })
    console.log('✅ Index créé: etablissements (nom, ville, code)\n')

    // Index texte pour recherche sur classes
    console.log('📌 Création index texte for classes...')
    await db.collection('classes').createIndex({
      nom: 'text',
      niveau: 'text',
    })
    console.log('✅ Index créé: classes (nom, niveau)\n')

    // Index texte pour recherche sur élèves
    console.log('📌 Création index texte for eleves...')
    await db.collection('eleves').createIndex({
      nom: 'text',
      prenom: 'text',
      email: 'text',
      numeroMatricule: 'text',
    })
    console.log('✅ Index créé: eleves (nom, prenom, email, numeroMatricule)\n')

    // Index texte pour recherche sur personnel
    console.log('📌 Création index texte for personnel...')
    await db.collection('personnel').createIndex({
      nom: 'text',
      prenom: 'text',
      email: 'text',
      fonction: 'text',
    })
    console.log('✅ Index créé: personnel (nom, prenom, email, fonction)\n')

    // Indexes simples pour pagination et filtrage
    console.log('📌 Création indexes simples pour filtrage...')

    // Classes
    await db.collection('classes').createIndex({ etablissementId: 1, creeLe: -1 })
    console.log('✅ Index créé: classes (etablissementId, creeLe)')

    // Élèves
    await db.collection('eleves').createIndex({ classeId: 1, creeLe: -1 })
    await db.collection('eleves').createIndex({ etablissementId: 1, creeLe: -1 })
    console.log('✅ Index créé: eleves (classeId, etablissementId)')

    // Établissements
    await db.collection('etablissements').createIndex({ creeLe: -1 })
    console.log('✅ Index créé: etablissements (creeLe)')

    // Personnel
    await db.collection('personnel').createIndex({ etablissementId: 1, creeLe: -1 })
    console.log('✅ Index créé: personnel (etablissementId)')

    console.log('\n╔═══════════════════════════════════════════════════════════════╗')
    console.log('║           ✅ TOUS LES INDEXES ONT ÉTÉ CRÉÉS              ║')
    console.log('╚═══════════════════════════════════════════════════════════════╝\n')
  } catch (error) {
    console.error('❌ Erreur lors de la création des indexes:', error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

createIndexes()
