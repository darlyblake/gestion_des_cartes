/**
 * Service API pour communiquer avec le backend
 * Gère toutes les requêtes HTTP vers les routes API
 * Support de la PAGINATION pour optimiser les performances
 */

import type {
  Etablissement,
  CreerEtablissementDonnees,
  ModifierEtablissementDonnees,
  Classe,
  CreerClasseDonnees,
  ModifierClasseDonnees,
  Eleve,
  CreerEleveDonnees,
  ModifierEleveDonnees,
  Personnel,
  CreerPersonnelDonnees,
  ModifierPersonnelDonnees,
  ReponseApi,
  StatistiquesDashboard,
  OptionsGenererCarte,
  CarteGeneree,
  ReponsePaginee,
} from '../types'

// URL de base de l'API
const URL_API = '/api'

// ==================== TYPES DE PAGINATION ====================

/**
 * Métadonnées de pagination retournées par l'API
 */
export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

/**
 * Réponse paginée générique (avec signature d'index pour compatibilité avec meta)
 */
export interface ReponsePaginated<T> {
  succes: boolean
  donnees?: T
  erreur?: string
  message?: string
  meta?: PaginationMeta & Record<string, unknown>
}

// ==================== FONCTIONS UTILITAIRES ====================

/**
 * Fonction utilitaire pour effectuer des requêtes fetch
 * @param url - URL de la requête
 * @param options - Options de la requête fetch
 * @returns Données de la réponse
 */
async function requeteFetch<T>(
  url: string,
  options?: RequestInit
): Promise<ReponseApi<T>> {
  try {
    const reponse = await fetch(`${URL_API}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    // Vérifier le Content-Type avant de parser JSON
    const contentType = reponse.headers.get('content-type')
    let donnees: any = {}

    // Essayer de parser JSON seulement si c'est du JSON
    if (contentType && contentType.includes('application/json')) {
      try {
        donnees = await reponse.json()
      } catch (parseError) {
        console.error('Erreur parsing JSON:', parseError)
        donnees = { erreur: 'Réponse invalide du serveur' }
      }
    } else {
      // Si ce n'est pas du JSON, essayer de lire le texte
      const texte = await reponse.text()
      donnees = { erreur: texte || 'Réponse vide du serveur' }
    }

    if (!reponse.ok) {
      return {
        succes: false,
        erreur: donnees.erreur || `Erreur serveur (${reponse.status})`,
      }
    }

    return {
      succes: true,
      donnees: donnees.donnees || donnees,
    }
  } catch (erreur) {
    console.error('Erreur API:', erreur)
    const message = erreur instanceof Error ? erreur.message : String(erreur)
    return {
      succes: false,
      erreur: `Erreur de connexion au serveur: ${message}`,
    }
  }
}

/**
 * Fonction utilitaire pour effectuer des requêtes fetch paginées
 */
async function requeteFetchPaginee<T>(
  url: string,
  options?: RequestInit
): Promise<ReponsePaginated<T>> {
  try {
    const reponse = await fetch(`${URL_API}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    // Vérifier le Content-Type avant de parser JSON
    const contentType = reponse.headers.get('content-type')
    let donnees: any = {}

    // Essayer de parser JSON seulement si c'est du JSON
    if (contentType && contentType.includes('application/json')) {
      try {
        donnees = await reponse.json()
      } catch (parseError) {
        console.error('Erreur parsing JSON:', parseError)
        donnees = { erreur: 'Réponse invalide du serveur' }
      }
    } else {
      // Si ce n'est pas du JSON, essayer de lire le texte
      const texte = await reponse.text()
      donnees = { erreur: texte || 'Réponse vide du serveur' }
    }

    if (!reponse.ok) {
      return {
        succes: false,
        erreur: donnees.erreur || `Erreur serveur (${reponse.status})`,
      }
    }

    return {
      succes: true,
      donnees: donnees.donnees || [],
      meta: donnees.meta,
    }
  } catch (erreur) {
    console.error('Erreur API paginée:', erreur)
    const message = erreur instanceof Error ? erreur.message : String(erreur)
    return {
      succes: false,
      erreur: `Erreur de connexion au serveur: ${message}`,
    }
  }
}

// ==================== ÉTABLISSEMENTS ====================

/**
 * Options de récupération paginée des établissements
 */
interface OptionsEtablissements {
  /** Projection light (nom, logo) ou full (tous les champs) */
  projection?: 'light' | 'full'
  /** Page pour la pagination (1 par défaut) */
  page?: number
  /** Limite de résultats par page (défaut: 50, max: 100) */
  limit?: number
  /** Recherche textuelle sur nom et adresse */
  search?: string
  /** Champ de tri */
  sortBy?: string
  /** Ordre de tri (asc ou desc) */
  sortOrder?: 'asc' | 'desc'
}

/**
 * Récupère tous les établissements avec pagination
 */
export async function recupererEtablissements(
  options?: OptionsEtablissements
): Promise<ReponsePaginated<Etablissement[]>> {
  const params = new URLSearchParams()
  
  if (options?.projection) params.append('projection', options.projection)
  if (options?.page) params.append('page', String(options.page))
  if (options?.limit) params.append('limit', String(options.limit))
  if (options?.search) params.append('search', options.search)
  if (options?.sortBy) params.append('sortBy', options.sortBy)
  if (options?.sortOrder) params.append('sortOrder', options.sortOrder)

  const query = params.toString() ? `?${params.toString()}` : ''
  return requeteFetchPaginee<Etablissement[]>(`/etablissements${query}`)
}

/**
 * Récupère un établissement par son ID
 * @param id - ID de l'établissement
 */
export async function recupererEtablissement(id: string): Promise<ReponseApi<Etablissement>> {
  return requeteFetch<Etablissement>(`/etablissements/${id}`)
}

/**
 * Crée un nouvel établissement
 * @param donnees - Données de l'établissement à créer
 */
export async function creerEtablissement(
  donnees: CreerEtablissementDonnees
): Promise<ReponseApi<Etablissement>> {
  return requeteFetch<Etablissement>('/etablissements', {
    method: 'POST',
    body: JSON.stringify(donnees),
  })
}

/**
 * Modifie un établissement existant
 * @param id - ID de l'établissement
 * @param donnees - Données à modifier
 */
export async function modifierEtablissement(
  id: string,
  donnees: ModifierEtablissementDonnees
): Promise<ReponseApi<Etablissement>> {
  return requeteFetch<Etablissement>(`/etablissements/${id}`, {
    method: 'PUT',
    body: JSON.stringify(donnees),
  })
}

/**
 * Supprime un établissement
 * @param id - ID de l'établissement à supprimer
 */
export async function supprimerEtablissement(id: string): Promise<ReponseApi<void>> {
  return requeteFetch<void>(`/etablissements/${id}`, {
    method: 'DELETE',
  })
}

// ==================== CLASSES ====================

/**
 * Options de récupération paginée des classes
 */
interface OptionsClasses {
  /** Filtre par ID d'établissement */
  etablissementId?: string
  /** Page pour la pagination (1 par défaut) */
  page?: number
  /** Limite de résultats par page (défaut: 50, max: 100) */
  limit?: number
  /** Recherche textuelle sur nom et niveau */
  search?: string
  /** Champ de tri */
  sortBy?: string
  /** Ordre de tri (asc ou desc) */
  sortOrder?: 'asc' | 'desc'
}

/**
 * Récupère toutes les classes avec pagination
 */
export async function recupererClasses(
  options?: OptionsClasses
): Promise<ReponsePaginated<Classe[]>> {
  const params = new URLSearchParams()
  
  if (options?.etablissementId) params.append('etablissementId', options.etablissementId)
  if (options?.page) params.append('page', String(options.page))
  if (options?.limit) params.append('limit', String(options.limit))
  if (options?.search) params.append('search', options.search)
  if (options?.sortBy) params.append('sortBy', options.sortBy)
  if (options?.sortOrder) params.append('sortOrder', options.sortOrder)

  const query = params.toString() ? `?${params.toString()}` : ''
  return requeteFetchPaginee<Classe[]>(`/classes${query}`)
}

/**
 * Récupère une classe par son ID
 * @param id - ID de la classe
 */
export async function recupererClasse(id: string): Promise<ReponseApi<Classe>> {
  return requeteFetch<Classe>(`/classes/${id}`)
}

/**
 * Crée une nouvelle classe
 * @param donnees - Données de la classe à créer
 */
export async function creerClasse(
  donnees: CreerClasseDonnees
): Promise<ReponseApi<Classe>> {
  return requeteFetch<Classe>('/classes', {
    method: 'POST',
    body: JSON.stringify(donnees),
  })
}

/**
 * Modifie une classe existante
 * @param id - ID de la classe
 * @param donnees - Données à modifier
 */
export async function modifierClasse(
  id: string,
  donnees: ModifierClasseDonnees
): Promise<ReponseApi<Classe>> {
  return requeteFetch<Classe>(`/classes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(donnees),
  })
}

/**
 * Supprime une classe
 * @param id - ID de la classe à supprimer
 */
export async function supprimerClasse(id: string): Promise<ReponseApi<void>> {
  return requeteFetch<void>(`/classes/${id}`, {
    method: 'DELETE',
  })
}

// ==================== ÉLÈVES ====================

/**
 * Options de filtrage et pagination pour récupérer les élèves
 */
interface OptionsEleves {
  /** Filtre par ID de classe */
  classeId?: string
  /** Filtre par ID d'établissement */
  etablissementId?: string
  /** Recherche textuelle sur nom et prénom */
  search?: string
  /** Page pour la pagination (1 par défaut) */
  page?: number
  /** Limite de résultats par page (défaut: 50, max: 100) */
  limit?: number
  /** Projection optimisée (light = champs essentiels) */
  projection?: 'light' | 'full'
  /** Champ de tri */
  sortBy?: string
  /** Ordre de tri (asc ou desc) */
  sortOrder?: 'asc' | 'desc'
}

/**
 * Récupère tous les élèves avec filtres et pagination
 * 
 * CONNEXION BACKEND :
 * Appelle GET /api/eleves avec les paramètres de filtre
 * 
 * EXEMPLES D'UTILISATION :
 * ```typescript
 * // Tous les élèves (paginé, 50 par page)
 * const result = await recupererEleves()
 * 
 * // Élèves d'une classe spécifique (paginé)
 * const result = await recupererEleves({ classeId: 'xxx', page: 1, limit: 25 })
 * 
 * // Recherche avec pagination
 * const result = await recupererEleves({ search: 'dupont', page: 1, limit: 50 })
 * ```
 * 
 * @param options - Options de filtrage et pagination
 * @returns Réponse paginée avec métadonnées
 */
export async function recupererEleves(
  options?: OptionsEleves
): Promise<ReponsePaginated<Eleve[]>> {
  const params = new URLSearchParams()

  if (options?.classeId) {
    params.append('classeId', options.classeId)
  }

  if (options?.etablissementId) {
    params.append('etablissementId', options.etablissementId)
  }

  if (options?.search) {
    params.append('search', options.search)
  }

  if (options?.page) {
    params.append('page', String(options.page))
  }

  if (options?.limit) {
    params.append('limit', String(options.limit))
  }

  if (options?.projection) {
    params.append('projection', options.projection)
  }

  if (options?.sortBy) {
    params.append('sortBy', options.sortBy)
  }

  if (options?.sortOrder) {
    params.append('sortOrder', options.sortOrder)
  }

  const queryString = params.toString()
  const url = queryString ? `/eleves?${queryString}` : '/eleves'

  return requeteFetchPaginee<Eleve[]>(url)
}

/**
 * Récupère un élève par son ID
 * @param id - ID de l'élève
 */
export async function recupererEleve(id: string): Promise<ReponseApi<Eleve>> {
  return requeteFetch<Eleve>(`/eleves/${id}`)
}

/**
 * Crée un nouvel élève
 * @param donnees - Données de l'élève à créer
 */
export async function creerEleve(
  donnees: CreerEleveDonnees
): Promise<ReponseApi<Eleve>> {
  return requeteFetch<Eleve>('/eleves', {
    method: 'POST',
    body: JSON.stringify(donnees),
  })
}

/**
 * Modifie un élève existant
 * @param id - ID de l'élève
 * @param donnees - Données à modifier
 */
export async function modifierEleve(
  id: string,
  donnees: ModifierEleveDonnees
): Promise<ReponseApi<Eleve>> {
  return requeteFetch<Eleve>(`/eleves/${id}`, {
    method: 'PUT',
    body: JSON.stringify(donnees),
  })
}

/**
 * Supprime un élève
 * @param id - ID de l'élève à supprimer
 */
export async function supprimerEleve(id: string): Promise<ReponseApi<void>> {
  return requeteFetch<void>(`/eleves/${id}`, {
    method: 'DELETE',
  })
}

// ==================== CARTES ====================

/**
 * Génère une carte pour un élève
 * @param options - Options de génération de la carte
 */
export async function genererCarte(
  options: OptionsGenererCarte
): Promise<ReponseApi<CarteGeneree>> {
  return requeteFetch<CarteGeneree>('/cartes/generer', {
    method: 'POST',
    body: JSON.stringify(options),
  })
}

/**
 * Récupère la carte d'un élève
 * @param eleveId - ID de l'élève
 */
export async function recupererCarteEleve(
  eleveId: string
): Promise<ReponseApi<CarteGeneree>> {
  return requeteFetch<CarteGeneree>(`/cartes/${eleveId}`)
}

// ==================== STATISTIQUES ====================

/**
 * Récupère les statistiques du dashboard
 */
export async function recupererStatistiques(): Promise<ReponseApi<StatistiquesDashboard>> {
  return requeteFetch<StatistiquesDashboard>('/statistiques')
}

// ==================== UPLOAD ====================

/**
 * Upload une image vers le serveur
 * @param fichier - Fichier image à uploader
 * @param type - Type d'image (photo, logo)
 */
export async function uploaderImage(
  fichier: File,
  type: 'photo' | 'logo'
): Promise<ReponseApi<{ url: string }>> {
  const formData = new FormData()
  formData.append('image', fichier)
  formData.append('type', type)

  try {
    const reponse = await fetch(`${URL_API}/upload`, {
      method: 'POST',
      body: formData,
    })

    // Vérifier le Content-Type avant de parser JSON
    const contentType = reponse.headers.get('content-type')
    let donnees: any = {}

    // Essayer de parser JSON seulement si c'est du JSON
    if (contentType && contentType.includes('application/json')) {
      try {
        donnees = await reponse.json()
      } catch (parseError) {
        console.error('Erreur parsing JSON upload:', parseError)
        donnees = { erreur: 'Réponse invalide du serveur' }
      }
    } else {
      // Si ce n'est pas du JSON, essayer de lire le texte
      const texte = await reponse.text()
      donnees = { erreur: texte || 'Réponse vide du serveur' }
    }

    if (!reponse.ok) {
      return {
        succes: false,
        erreur: donnees.erreur || `Erreur lors de l'upload (${reponse.status})`,
      }
    }

    return {
      succes: true,
      donnees: donnees,
    }
  } catch (erreur) {
    console.error('Erreur upload:', erreur)
    return {
      succes: false,
      erreur: 'Erreur lors de l\'upload de l\'image',
    }
  }
}

// ==================== PERSONNEL ====================

/**
 * Options de récupération paginée du personnel
 */
interface OptionsPersonnel {
  /** ID de l'établissement (optionnel) */
  etablissementId?: string
  /** Rôle du personnel (optionnel) */
  role?: string
  /** Terme de recherche (optionnel) */
  search?: string
  /** Page pour la pagination (1 par défaut) */
  page?: number
  /** Limite de résultats par page (défaut: 50, max: 100) */
  limit?: number
  /** Champ de tri */
  sortBy?: string
  /** Ordre de tri (asc ou desc) */
  sortOrder?: 'asc' | 'desc'
}

/**
 * Récupère la liste du personnel avec pagination, filtres et recherche
 */
export async function recupererPersonnel(
  options?: OptionsPersonnel
): Promise<ReponsePaginated<Personnel[]>> {
  const params = new URLSearchParams()
  
  if (options?.etablissementId) params.append('etablissementId', options.etablissementId)
  if (options?.role) params.append('role', options.role)
  if (options?.search) params.append('search', options.search)
  if (options?.page) params.append('page', String(options.page))
  if (options?.limit) params.append('limit', String(options.limit))
  if (options?.sortBy) params.append('sortBy', options.sortBy)
  if (options?.sortOrder) params.append('sortOrder', options.sortOrder)

  return requeteFetchPaginee<Personnel[]>(`/personnel?${params.toString()}`)
}

/**
 * Récupère un membre du personnel par son ID
 * @param id - ID du personnel
 */
export async function recupererPersonnelParId(
  id: string
): Promise<ReponseApi<Personnel>> {
  return requeteFetch<Personnel>(`/personnel/${id}`)
}

/**
 * Crée un nouveau membre du personnel
 * @param donnees - Données du personnel à créer
 */
export async function creerPersonnel(
  donnees: CreerPersonnelDonnees
): Promise<ReponseApi<Personnel>> {
  return requeteFetch<Personnel>('/personnel', {
    method: 'POST',
    body: JSON.stringify(donnees),
  })
}

/**
 * Met à jour un membre du personnel
 * @param id - ID du personnel
 * @param donnees - Données à mettre à jour
 */
export async function modifierPersonnel(
  id: string,
  donnees: ModifierPersonnelDonnees
): Promise<ReponseApi<void>> {
  return requeteFetch<void>(`/personnel/${id}`, {
    method: 'PUT',
    body: JSON.stringify(donnees),
  })
}

/**
 * Supprime un membre du personnel
 * @param id - ID du personnel
 */
export async function supprimerPersonnel(
  id: string
): Promise<ReponseApi<void>> {
  return requeteFetch<void>(`/personnel/${id}`, {
    method: 'DELETE',
  })
}

// ==================== FONCTIONS UNWRAPPED POUR useFetchCached ====================

/**
 * Récupère tous les établissements avec pagination
 * Version unwrapped pour compatibilité avec useFetchCached
 */
export async function recupererEtablissementsList(
  options?: OptionsEtablissements
): Promise<ReponseApi<Etablissement[]>> {
  const result = await recupererEtablissements(options)
  if (result.succes && result.donnees) {
    return { succes: true, donnees: result.donnees }
  }
  return { succes: false, erreur: result.erreur || 'Erreur' }
}

/**
 * Récupère toutes les classes avec pagination
 * Version unwrapped pour compatibilité avec useFetchCached
 */
export async function recupererClassesList(
  options?: OptionsClasses
): Promise<ReponseApi<Classe[]>> {
  const result = await recupererClasses(options)
  if (result.succes && result.donnees) {
    return { succes: true, donnees: result.donnees }
  }
  return { succes: false, erreur: result.erreur || 'Erreur' }
}

/**
 * Récupère tous les élèves avec pagination
 * Version unwrapped pour compatibilité avec useFetchCached
 */
export async function recupererElevesList(
  options?: OptionsEleves
): Promise<Eleve[]> {
  const result = await recupererEleves(options)
  if (result.succes && result.donnees) {
    return result.donnees
  }
  return []
}

/**
 * Récupère tout le personnel avec pagination
 * Version unwrapped pour compatibilité avec useFetchCached
 */
export async function recupererPersonnelList(
  options?: OptionsPersonnel
): Promise<Personnel[]> {
  const result = await recupererPersonnel(options)
  if (result.succes && result.donnees) {
    return result.donnees
  }
  return []
}

