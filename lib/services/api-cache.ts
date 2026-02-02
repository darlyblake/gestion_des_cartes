/**
 * Service de cache en mémoire pour les données fréquemment accédées
 * Réduit les appels BD et améliore la performance des API
 */

interface CacheEntry<T> {
  donnees: T
  timestamp: number
}

const DUREES_TTL = {
  ETABLISSEMENTS: 5 * 60 * 1000, // 5 minutes
  CLASSES: 3 * 60 * 1000, // 3 minutes
  ELEVES: 2 * 60 * 1000, // 2 minutes
  PERSONNEL: 2 * 60 * 1000, // 2 minutes
} as const

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>()

  /**
   * Récupère une valeur du cache si elle n'a pas expiré
   */
  get<T>(cle: string): T | null {
    const entree = this.cache.get(cle)
    if (!entree) return null

    const maintenant = Date.now()
    if (maintenant - entree.timestamp > DUREES_TTL.ETABLISSEMENTS) {
      this.cache.delete(cle)
      return null
    }

    return entree.donnees as T
  }

  /**
   * Stocke une valeur dans le cache
   */
  set<T>(cle: string, donnees: T): void {
    this.cache.set(cle, {
      donnees,
      timestamp: Date.now(),
    })
  }

  /**
   * Efface une clé spécifique
   */
  del(cle: string): void {
    this.cache.delete(cle)
  }

  /**
   * Efface toutes les clés correspondant à un motif
   */
  delPattern(motif: RegExp): void {
    const cles = Array.from(this.cache.keys())
    cles.forEach((cle) => {
      if (motif.test(cle)) {
        this.cache.delete(cle)
      }
    })
  }

  /**
   * Efface tout le cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Récupère ou crée une valeur avec fonction loader
   */
  async getOrSet<T>(
    cle: string,
    loader: () => Promise<T>,
    ttl: number = DUREES_TTL.ETABLISSEMENTS
  ): Promise<T> {
    const cached = this.cache.get(cle)

    if (cached) {
      const maintenant = Date.now()
      if (maintenant - cached.timestamp <= ttl) {
        return cached.donnees as T
      }
    }

    const donnees = await loader()
    this.cache.set(cle, {
      donnees,
      timestamp: Date.now(),
    })

    return donnees
  }

  /**
   * Statistiques du cache (utile pour debugging)
   */
  stats() {
    return {
      totalEntrees: this.cache.size,
      tailleEnBytes: JSON.stringify(Array.from(this.cache.values())).length,
    }
  }
}

export const apiCache = new MemoryCache()

/**
 * Générateur de clés de cache standardisé
 */
export const cacheKeys = {
  TOUTES_LES_ETABLISSEMENTS: 'etab:all',
  ETABLISSEMENT: (id: string) => `etab:${id}`,
  TOUTES_LES_CLASSES: 'class:all',
  CLASSES_PAR_ETABLISSEMENT: (etablissementId: string) => `class:etab:${etablissementId}`,
  CLASSE: (id: string) => `class:${id}`,
  TOUS_LES_ELEVES: 'eleve:all',
  ELEVES_PAR_CLASSE: (classeId: string) => `eleve:class:${classeId}`,
  ELEVES_PAR_ETABLISSEMENT: (etablissementId: string) => `eleve:etab:${etablissementId}`,
  ELEVE: (id: string) => `eleve:${id}`,
  TOUT_LE_PERSONNEL: 'pers:all',
  PERSONNEL_PAR_ETABLISSEMENT: (etablissementId: string) => `pers:etab:${etablissementId}`,
  PERSONNE: (id: string) => `pers:${id}`,
}

/**
 * Invalide les caches affectés quand une entité change
 */
export function invalidateCacheAfterChange(type: 'etablissement' | 'classe' | 'eleve' | 'personnel') {
  switch (type) {
    case 'etablissement':
      apiCache.delPattern(/^etab:/)
      apiCache.delPattern(/^class:/)
      apiCache.delPattern(/^eleve:/)
      apiCache.delPattern(/^pers:/)
      break
    case 'classe':
      apiCache.delPattern(/^class:/)
      apiCache.delPattern(/^eleve:class:/)
      break
    case 'eleve':
      apiCache.delPattern(/^eleve:/)
      break
    case 'personnel':
      apiCache.delPattern(/^pers:/)
      break
  }
}
