/**
 * Optimisations pour les requêtes MongoDB
 * - Timeouts sur les opérations longues
 * - Projections pour réduire la taille des données
 * - Caching agressif pour les requêtes coûteuses
 */

import { Db } from 'mongodb'

export interface QueryOptimizationOptions {
  maxTimeMS?: number // Timeout en millisecondes
  projection?: Record<string, 1 | 0> // Champs à inclure/exclure
  limit?: number // Limite de résultats
  allowDiskUse?: boolean // Permettre l'utilisation du disque pour les agrégations
}

const DEFAULT_TIMEOUT = 5000 // 5 secondes max
const DEFAULT_LIMIT = 1000 // Max 1000 résultats

/**
 * Applique les optimisations de requête à une agrégation
 */
export function getOptimizedAggregationOptions(
  options: QueryOptimizationOptions = {}
): Record<string, unknown> {
  return {
    maxTimeMS: options.maxTimeMS || DEFAULT_TIMEOUT,
    allowDiskUse: options.allowDiskUse ?? true,
    batchSize: 1000, // Charger par batch de 1000 docs
  }
}

/**
 * Vérifie si une requête a dépassé le timeout
 */
export function checkQueryTimeout(startTime: number, maxMs: number = 5000): boolean {
  const elapsed = Date.now() - startTime
  return elapsed > maxMs
}

/**
 * Projections optimisées par collection
 */
export const optimizedProjections = {
  // Classes - minimum nécessaire
  classes: {
    _id: 1,
    nom: 1,
    niveau: 1,
    etablissementId: 1,
    creeLe: 1,
    modifieLe: 1,
  },

  // Élèves - champs essentiels uniquement
  eleves: {
    _id: 1,
    nom: 1,
    prenom: 1,
    email: 1,
    numeroMatricule: 1,
    classeId: 1,
    dateNaissance: 1,
    creeLe: 1,
  },

  // Établissements - light
  etablissements: {
    _id: 1,
    nom: 1,
    code: 1,
    ville: 1,
    telephone: 1,
    couleur: 1,
    creeLe: 1,
  },

  // Personnel - light
  personnel: {
    _id: 1,
    nom: 1,
    prenom: 1,
    email: 1,
    fonction: 1,
    etablissementId: 1,
    creeLe: 1,
  },
}

/**
 * Simplifie les agrégations en supprimant les lookups coûteux
 * et en les remplaçant par des références simples si nécessaire
 */
export function buildOptimizedPipeline(
  filtre: Record<string, unknown>,
  options: {
    sortField?: string
    sortDirection?: number
    skip?: number
    limit?: number
    projectionFields?: Record<string, 1 | 0>
  } = {}
) {
  const pipeline: Record<string, unknown>[] = []

  // 1. Match - appliquer le filtre
  pipeline.push({ $match: filtre })

  // 2. Optionnel - Sort avant limit pour performance
  if (options.sortField) {
    pipeline.push({
      $sort: { [options.sortField]: options.sortDirection || -1 },
    })
  }

  // 3. Optionnel - Skip/Limit pour pagination
  if (options.skip !== undefined) {
    pipeline.push({ $skip: options.skip })
  }
  if (options.limit) {
    pipeline.push({ $limit: options.limit })
  }

  // 4. Projection finale pour réduire la taille
  if (options.projectionFields) {
    pipeline.push({ $project: options.projectionFields })
  }

  return pipeline
}

/**
 * Créer un wrapper pour les opérations Mongoose avec timeout
 */
export async function executeQueryWithTimeout<T>(
  queryFn: () => Promise<T>,
  timeoutMs: number = 5000,
  fallbackValue?: T
): Promise<T> {
  try {
    const timeoutPromise = new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Query timeout after ${timeoutMs}ms`))
      }, timeoutMs)
    })

    return await Promise.race([queryFn(), timeoutPromise])
  } catch (error) {
    if (fallbackValue !== undefined) {
      console.warn(
        `Query failed with timeout, returning fallback value:`,
        error instanceof Error ? error.message : String(error)
      )
      return fallbackValue
    }
    throw error
  }
}

/**
 * Dénormalise une collection de documents pour éviter les lookups
 */
export function denormalizeDocuments<T extends Record<string, unknown>>(
  documents: T[],
  inclusionMap: Record<string, keyof T[]>
) {
  return documents.map((doc) => {
    const result = { ...doc }
    Object.entries(inclusionMap).forEach(([key, sourceFields]) => {
      if (sourceFields && Array.isArray(sourceFields)) {
        // Inclure uniquement les champs spécifiés
        const filtered: Record<string, unknown> = {}
        sourceFields.forEach((field) => {
          if (doc[field] !== undefined) {
            filtered[field] = doc[field]
          }
        })
        result[key] = filtered
      }
    })
    return result
  })
}
