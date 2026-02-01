/**
 * Types TypeScript pour l'application de gestion de cartes scolaires
 * Définition de toutes les interfaces et types utilisés dans l'application
 */

// ==================== ÉTABLISSEMENT ====================
/**
 * Interface représentant un établissement scolaire
 */
export interface Etablissement {
  _id?: string
  id?: string
  nom: string
  logo: string
  adresse: string
  telephone: string
  email?: string
  siteWeb?: string
  anneeScolaire: string
  couleur: string
  police: string
  creeLe?: Date
  modifieLe?: Date
}

/**
 * Données pour créer un nouvel établissement
 */
export interface CreerEtablissementDonnees {
  nom: string
  logo?: string
  adresse: string
  telephone: string
  email?: string
  siteWeb?: string
  anneeScolaire: string
  couleur: string
  police: string
}

/**
 * Données pour modifier un établissement existant
 */
export interface ModifierEtablissementDonnees extends Partial<CreerEtablissementDonnees> {}

// ==================== CLASSE ====================
/**
 * Interface représentant une classe
 */
export interface Classe {
  _id?: string
  id?: string
  nom: string
  niveau: string
  etablissementId: string
  etablissement?: Etablissement
  eleves?: Eleve[]
  creeLe?: Date
  modifieLe?: Date
}

/**
 * Données pour créer une nouvelle classe
 */
export interface CreerClasseDonnees {
  nom: string
  niveau: string
  etablissementId: string
}

/**
 * Données pour modifier une classe existante
 */
export interface ModifierClasseDonnees extends Partial<CreerClasseDonnees> {}

// ==================== ÉLÈVE ====================
/**
 * Enum pour le sexe de l'élève
 */
export type Sexe = 'M' | 'F'

/**
 * Interface représentant un élève
 */
export interface Eleve {
  _id?: string
  id?: string
  nom: string
  prenom: string
  dateNaissance?: Date
  lieuNaissance: string
  sexe: Sexe
  photo?: string
  matricule?: string
  classeId?: string
  classe?: Classe
  creeLe?: Date
  modifieLe?: Date
}

/**
 * Données pour créer un nouvel élève
 */
export interface CreerEleveDonnees {
  nom: string
  prenom: string
  dateNaissance: string
  lieuNaissance: string
  sexe: Sexe
  photo?: string
  classeId: string
}

/**
 * Données pour modifier un élève existant
 */
export interface ModifierEleveDonnees extends Partial<CreerEleveDonnees> {}

// ==================== PERSONNEL ====================
/**
 * Types de rôles pour le personnel
 */
export type RolePersonnel = 'directeur' | 'enseignant' | 'censeur' | 'surveillant' | 'informaticien' | 'secretaire' | 'gestionnaire' | 'infirmier' | 'bibliothecaire' | 'autre'

/**
 * Interface représentant un membre du personnel
 */
export interface Personnel {
  _id?: string
  id?: string
  nom: string
  prenom: string
  role: RolePersonnel
  fonction: string
  matricule?: string
  email?: string
  telephone?: string
  photo?: string
  etablissementId?: string
  etablissement?: Etablissement
  creeLe?: Date
  modifieLe?: Date
}

/**
 * Données pour créer un nouveau membre du personnel
 */
export interface CreerPersonnelDonnees {
  nom: string
  prenom: string
  role: RolePersonnel
  fonction: string
  email?: string
  telephone?: string
  photo?: string
  etablissementId: string
}

/**
 * Données pour modifier un membre du personnel existant
 */
export interface ModifierPersonnelDonnees extends Partial<CreerPersonnelDonnees> {}

// ==================== CARTE ====================
/**
 * Types de templates de carte disponibles
 */
export type TypeTemplate = 'classique' | 'moderne' | 'examen' | 'recto-verso'

/**
 * Interface pour les options de génération de carte
 */
export interface OptionsGenererCarte {
  eleveId: string
  template: TypeTemplate
  avecQrCode: boolean
}

/**
 * Interface représentant une carte générée
 */
export interface CarteGeneree {
  id: string
  eleveId: string
  eleve: Eleve
  template: TypeTemplate
  urlImage: string
  urlPdf?: string
  creeLe: Date
}

// ==================== RÉPONSES API ====================
/**
 * Structure de réponse standard de l'API
 */
export interface ReponseApi<T> {
  succes: boolean
  donnees?: T
  erreur?: string
  message?: string
  meta?: Record<string, unknown>
}

/**
 * Structure de réponse paginée
 */
export interface ReponsePaginee<T> {
  succes: boolean
  donnees: T[]
  total: number
  page: number
  parPage: number
  totalPages: number
}

// ==================== STATISTIQUES ====================
/**
 * Interface pour les statistiques du dashboard
 */
export interface StatistiquesDashboard {
  totalEtablissements: number
  totalClasses: number
  totalEleves: number
  cartesGenerees: number
}

// ==================== UPLOAD ====================
/**
 * Interface pour la réponse d'upload d'image
 */
export interface ReponseUploadImage {
  succes: boolean
  url?: string
  erreur?: string
}
