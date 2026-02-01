/**
 * Service API pour communiquer avec le backend
 * Gère toutes les requêtes HTTP vers les routes API
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
} from '../types'

// URL de base de l'API
const URL_API = '/api'

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

    const donnees = await reponse.json()

    if (!reponse.ok) {
      return {
        succes: false,
        erreur: donnees.erreur || 'Une erreur est survenue',
      }
    }

    return {
      succes: true,
      donnees: donnees.donnees || donnees,
    }
  } catch (erreur) {
    console.error('Erreur API:', erreur)
    return {
      succes: false,
      erreur: 'Erreur de connexion au serveur',
    }
  }
}

// ==================== ÉTABLISSEMENTS ====================

/**
 * Récupère tous les établissements
 */
export async function recupererEtablissements(): Promise<ReponseApi<Etablissement[]>> {
  return requeteFetch<Etablissement[]>('/etablissements')
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
 * Récupère toutes les classes
 * @param etablissementId - Optionnel, filtre par établissement
 */
export async function recupererClasses(
  etablissementId?: string
): Promise<ReponseApi<Classe[]>> {
  const url = etablissementId
    ? `/classes?etablissementId=${etablissementId}`
    : '/classes'
  return requeteFetch<Classe[]>(url)
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
 * Options de filtrage pour récupérer les élèves
 */
interface OptionsFiltreEleves {
  /** Filtre par ID de classe */
  classeId?: string
  /** Filtre par ID d'établissement */
  etablissementId?: string
  /** Recherche textuelle sur nom/prénom/matricule */
  recherche?: string
  /** Page pour la pagination (1 par défaut) */
  page?: number
  /** Limite de résultats par page */
  limit?: number
  /** Projection optimisée (light = champs essentiels) */
  projection?: 'light' | 'full'
}

/**
 * Récupère tous les élèves avec filtres optionnels
 * 
 * CONNEXION BACKEND :
 * Appelle GET /api/eleves avec les paramètres de filtre
 * 
 * EXEMPLES D'UTILISATION :
 * ```typescript
 * // Tous les élèves
 * const eleves = await recupererEleves()
 * 
 * // Élèves d'une classe spécifique
 * const eleves = await recupererEleves({ classeId: 'xxx' })
 * 
 * // Élèves d'un établissement
 * const eleves = await recupererEleves({ etablissementId: 'yyy' })
 * 
 * // Filtre combiné
 * const eleves = await recupererEleves({ classeId: 'xxx', etablissementId: 'yyy' })
 * ```
 * 
 * @param filtres - Options de filtrage optionnelles
 */
export async function recupererEleves(
  filtres?: OptionsFiltreEleves
): Promise<ReponseApi<Eleve[]>> {
  const params = new URLSearchParams()

  if (filtres?.classeId) {
    params.append('classeId', filtres.classeId)
  }

  if (filtres?.etablissementId) {
    params.append('etablissementId', filtres.etablissementId)
  }

  if (filtres?.recherche) {
    params.append('recherche', filtres.recherche)
  }

  if (filtres?.page) {
    params.append('page', String(filtres.page))
  }

  if (filtres?.limit) {
    params.append('limit', String(filtres.limit))
  }

  if (filtres?.projection) {
    params.append('projection', filtres.projection)
  }

  const queryString = params.toString()
  const url = queryString ? `/eleves?${queryString}` : '/eleves'

  return requeteFetch<Eleve[]>(url)
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

    const donnees = await reponse.json()

    if (!reponse.ok) {
      return {
        succes: false,
        erreur: donnees.erreur || 'Erreur lors de l\'upload',
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
 * Récupère la liste du personnel avec filtres optionnels
 * @param etablissementId - ID de l'établissement (optionnel)
 * @param role - Rôle du personnel (optionnel)
 * @param recherche - Terme de recherche (optionnel)
 */
export async function recupererPersonnel(
  etablissementId?: string,
  role?: string,
  recherche?: string
): Promise<ReponseApi<Personnel[]>> {
  const params = new URLSearchParams()
  if (etablissementId) params.append('etablissementId', etablissementId)
  if (role) params.append('role', role)
  if (recherche) params.append('recherche', recherche)

  return requeteFetch<Personnel[]>(`/personnel?${params.toString()}`)
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

