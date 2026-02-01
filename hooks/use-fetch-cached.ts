/**
 * Hook de caching avec déduplication et optimisation
 * Évite les appels API dupliqués et met en cache les données
 */

import { useEffect, useState, useRef } from 'react'
import type { ReponseApi } from '@/lib/types'

// Cache en mémoire avec timestamps
const memoryCache = new Map<string, { data: any; timestamp: number }>()
const requestCache = new Map<string, Promise<any>>()

// Durée du cache par défaut (5 minutes)
const DEFAULT_CACHE_DURATION = 5 * 60 * 1000

/**
 * Hook pour récupérer des données avec caching et déduplication
 * @param fetcher - Fonction pour récupérer les données
 * @param cacheKey - Clé de cache unique
 * @param cacheDuration - Durée du cache en ms (défaut 5min)
 */
export function useFetchCached<T>(
  fetcher: () => Promise<ReponseApi<T>>,
  cacheKey: string,
  cacheDuration = DEFAULT_CACHE_DURATION
) {
  const [data, setData] = useState<T | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true

    const chargerDonnees = async () => {
      try {
        setIsLoading(true)

        // Vérifier le cache mémoire
        const cached = memoryCache.get(cacheKey)
        const now = Date.now()

        if (cached && now - cached.timestamp < cacheDuration) {
          // Données en cache valides
          if (isMountedRef.current) {
            setData(cached.data)
            setErreur(null)
            setIsLoading(false)
          }
          return
        }

        // Vérifier les requêtes en cours (déduplication)
        if (requestCache.has(cacheKey)) {
          const reponse = await requestCache.get(cacheKey)
          if (isMountedRef.current) {
            if (reponse.succes) {
              setData(reponse.donnees)
              setErreur(null)
            } else {
              setErreur(reponse.erreur)
            }
            setIsLoading(false)
          }
          return
        }

        // Créer la requête
        const promise = fetcher()
        requestCache.set(cacheKey, promise)

        const reponse = await promise

        // Nettoyer le cache de requête
        requestCache.delete(cacheKey)

        if (isMountedRef.current) {
          if (reponse.succes && reponse.donnees) {
            // Mettre en cache
            memoryCache.set(cacheKey, {
              data: reponse.donnees,
              timestamp: Date.now(),
            })
            setData(reponse.donnees)
            setErreur(null)
          } else {
            setErreur(reponse.erreur || 'Erreur inconnue')
          }
          setIsLoading(false)
        }
      } catch (err) {
        if (isMountedRef.current) {
          setErreur(err instanceof Error ? err.message : 'Erreur')
          setIsLoading(false)
        }
      }
    }

    chargerDonnees()

    return () => {
      isMountedRef.current = false
    }
  }, [cacheKey, fetcher, cacheDuration])

  return { data, erreur, isLoading }
}

/**
 * Invalide le cache pour une clé donnée
 */
export function invalidateCache(cacheKey: string) {
  memoryCache.delete(cacheKey)
}

/**
 * Vide tout le cache
 */
export function clearAllCache() {
  memoryCache.clear()
  requestCache.clear()
}
