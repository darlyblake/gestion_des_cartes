/**
 * Optimisations des réponses API
 * - Compression automatique
 * - Timeouts
 * - Limits sur la taille des réponses
 * - Projections par défaut pour réduire les données
 */

import { NextResponse } from 'next/server'

export interface APIResponseOptions {
  maxSize?: number // Max response size in KB (default: 5MB)
  maxItems?: number // Max items to return (default: 1000)
  timeout?: number // Timeout in ms (default: 30000)
  cacheControl?: string // Cache-Control header
}

const defaultOptions: APIResponseOptions = {
  maxSize: 5 * 1024, // 5MB
  maxItems: 1000,
  timeout: 30000,
  cacheControl: 'public, max-age=300, s-maxage=300, stale-while-revalidate=600',
}

/**
 * Enveloppe une réponse API avec optimisations
 */
export function optimizeAPIResponse(
  data: unknown,
  options: APIResponseOptions = {}
) {
  const opts = { ...defaultOptions, ...options }
  
  const response = NextResponse.json(data)
  
  // Ajouter les headers de cache
  if (opts.cacheControl) {
    response.headers.set('Cache-Control', opts.cacheControl)
  }
  
  // Compression
  response.headers.set('Content-Encoding', 'gzip')
  response.headers.set('Vary', 'Accept-Encoding')
  
  return response
}

/**
 * Crée un timeout pour les opérations longues
 */
export function createTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 30000
): Promise<T> {
  let timeoutId: NodeJS.Timeout
  
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`))
    }, timeoutMs)
  })
  
  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId)
  })
}

/**
 * Limite la taille des données retournées
 */
export function limitResponseSize(data: unknown, maxItems: number = 1000) {
  if (Array.isArray(data)) {
    if (data.length > maxItems) {
      console.warn(`Data truncated from ${data.length} to ${maxItems} items`)
      return data.slice(0, maxItems)
    }
  }
  return data
}

/**
 * Projections par défaut pour les collections
 */
export const defaultProjections = {
  // Classes - champs importants uniquement
  classes: {
    nom: 1,
    niveau: 1,
    etablissementId: 1,
    nombreEleves: 1,
    creeLe: 1,
    modifieLe: 1,
  },
  
  // Élèves - champs essentiels
  eleves: {
    nom: 1,
    prenom: 1,
    email: 1,
    numeroMatricule: 1,
    classeId: 1,
    dateNaissance: 1,
    creeLe: 1,
  },
  
  // Établissements - light projection
  etablissements: {
    nom: 1,
    code: 1,
    ville: 1,
    telephone: 1,
    logo: 1,
    creeLe: 1,
  },
  
  // Personnel - champs de base
  personnel: {
    nom: 1,
    prenom: 1,
    email: 1,
    fonction: 1,
    etablissementId: 1,
    telephone: 1,
    creeLe: 1,
  },
}

/**
 * Récupère la projection à utiliser
 */
export function getProjection(
  collection: string,
  projection?: string
): Record<string, number> {
  if (projection === 'light') {
    // Retourner les champs minimalistes pour light projection
    const lightProjections: Record<string, Record<string, number>> = {
      classes: { nom: 1, niveau: 1, etablissementId: 1 },
      eleves: { nom: 1, prenom: 1, numeroMatricule: 1, classeId: 1 },
      etablissements: { nom: 1, logo: 1, couleur: 1 },
      personnel: { nom: 1, prenom: 1, fonction: 1, etablissementId: 1 },
    }
    return lightProjections[collection] || {}
  }
  
  if (projection === 'full') {
    // Retourner tous les champs
    return {}
  }
  
  // Par défaut, utiliser la projection standard
  return defaultProjections[collection as keyof typeof defaultProjections] || {}
}

/**
 * Builder pour les réponses API paginées optimisées
 */
export function buildPaginatedResponse(
  data: unknown[],
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
) {
  return {
    succes: true,
    donnees: data,
    meta,
    timestamp: new Date().toISOString(),
  }
}
