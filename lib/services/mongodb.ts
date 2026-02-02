/**
 * Service MongoDB Atlas
 * Gère la connexion à MongoDB Atlas et les opérations CRUD
 */

import { MongoClient, Db } from 'mongodb'

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

/**
 * Connecte à MongoDB Atlas
 */
async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    throw new Error('MONGODB_URI n\'est pas défini dans les variables d\'environnement')
  }

  // Retourner la connexion en cache si elle existe
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  try {
    const client = new MongoClient(uri)
    await client.connect()

    const db = client.db(process.env.MONGODB_DB_NAME || 'school-card')

    cachedClient = client
    cachedDb = db

    console.warn('✓ Connecté à MongoDB Atlas')
    return { client, db }
  } catch (error) {
    console.error('✗ Erreur de connexion à MongoDB:', error)
    throw error
  }
}

/**
 * Ferme la connexion à MongoDB
 */
async function closeDatabase(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close()
    cachedClient = null
    cachedDb = null
    console.warn('✓ Déconnecté de MongoDB Atlas')
  }
}

/**
 * Récupère la collection spécifiée
 */
async function getCollection(collectionName: string) {
  const { db } = await connectToDatabase()
  return db.collection(collectionName)
}

export { connectToDatabase, closeDatabase, getCollection }
