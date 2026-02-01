/**
 * Store de données en mémoire pour simuler une base de données
 * Utilisé côté serveur dans les routes API
 * Dans un environnement de production, ceci serait remplacé par MongoDB + Prisma
 */

import type { Etablissement, Classe, Eleve, CarteGeneree } from './types'

// ==================== DONNÉES INITIALES ====================

/**
 * Données d'exemple pour les établissements
 */
export const etablissements: Etablissement[] = [
  {
    id: '1',
    nom: 'Lycée Jean Moulin',
    logo: '/placeholder.svg?height=100&width=100',
    adresse: '15 Rue de la République, 75001 Paris',
    telephone: '01 42 36 58 96',
    anneeScolaire: '2025-2026',
    couleur: '#1e40af',
    police: 'Arial',
    creeLe: new Date('2024-09-01'),
    modifieLe: new Date('2024-09-01'),
  },
  {
    id: '2',
    nom: 'Collège Victor Hugo',
    logo: '/placeholder.svg?height=100&width=100',
    adresse: '28 Avenue des Champs-Élysées, 75008 Paris',
    telephone: '01 45 62 78 34',
    anneeScolaire: '2025-2026',
    couleur: '#059669',
    police: 'Helvetica',
    creeLe: new Date('2024-09-01'),
    modifieLe: new Date('2024-09-01'),
  },
]

/**
 * Données d'exemple pour les classes
 */
export const classes: Classe[] = [
  {
    id: '1',
    nom: 'Terminale S1',
    niveau: 'Terminale',
    etablissementId: '1',
    creeLe: new Date('2024-09-01'),
    modifieLe: new Date('2024-09-01'),
  },
  {
    id: '2',
    nom: 'Première S2',
    niveau: 'Première',
    etablissementId: '1',
    creeLe: new Date('2024-09-01'),
    modifieLe: new Date('2024-09-01'),
  },
  {
    id: '3',
    nom: '3ème A',
    niveau: '3ème',
    etablissementId: '2',
    creeLe: new Date('2024-09-01'),
    modifieLe: new Date('2024-09-01'),
  },
]

/**
 * Données d'exemple pour les élèves
 */
export const eleves: Eleve[] = [
  {
    id: '1',
    nom: 'DUPONT',
    prenom: 'Marie',
    dateNaissance: new Date('2007-03-15'),
    lieuNaissance: 'Paris',
    sexe: 'F',
    photo: '/placeholder.svg?height=150&width=120',
    matricule: 'MAT-2025-001',
    classeId: '1',
    creeLe: new Date('2024-09-01'),
    modifieLe: new Date('2024-09-01'),
  },
  {
    id: '2',
    nom: 'MARTIN',
    prenom: 'Lucas',
    dateNaissance: new Date('2007-07-22'),
    lieuNaissance: 'Lyon',
    sexe: 'M',
    photo: '/placeholder.svg?height=150&width=120',
    matricule: 'MAT-2025-002',
    classeId: '1',
    creeLe: new Date('2024-09-01'),
    modifieLe: new Date('2024-09-01'),
  },
  {
    id: '3',
    nom: 'BERNARD',
    prenom: 'Emma',
    dateNaissance: new Date('2008-11-08'),
    lieuNaissance: 'Marseille',
    sexe: 'F',
    photo: '/placeholder.svg?height=150&width=120',
    matricule: 'MAT-2025-003',
    classeId: '2',
    creeLe: new Date('2024-09-01'),
    modifieLe: new Date('2024-09-01'),
  },
  {
    id: '4',
    nom: 'PETIT',
    prenom: 'Thomas',
    dateNaissance: new Date('2010-05-30'),
    lieuNaissance: 'Bordeaux',
    sexe: 'M',
    photo: '/placeholder.svg?height=150&width=120',
    matricule: 'MAT-2025-004',
    classeId: '3',
    creeLe: new Date('2024-09-01'),
    modifieLe: new Date('2024-09-01'),
  },
]

/**
 * Cartes générées
 */
export const cartesGenerees: CarteGeneree[] = []

// ==================== FONCTIONS UTILITAIRES ====================

/**
 * Génère un nouvel ID unique
 */
export function genererNouvelId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * Génère un nouveau matricule unique
 * @param annee - Année scolaire
 */
export function genererMatricule(annee: string = '2025'): string {
  const numero = (eleves.length + 1).toString().padStart(3, '0')
  return `MAT-${annee}-${numero}`
}

/**
 * Récupère l'établissement d'une classe
 * @param classeId - ID de la classe
 */
export function recupererEtablissementDeClasse(classeId: string): Etablissement | undefined {
  const classe = classes.find(c => c.id === classeId)
  if (!classe) return undefined
  return etablissements.find(e => e.id === classe.etablissementId)
}

/**
 * Récupère la classe d'un élève avec son établissement
 * @param eleveId - ID de l'élève
 */
export function recupererClasseAvecEtablissement(eleveId: string): { 
  classe: Classe | undefined
  etablissement: Etablissement | undefined 
} {
  const eleve = eleves.find(e => e.id === eleveId)
  if (!eleve) return { classe: undefined, etablissement: undefined }
  
  const classe = classes.find(c => c.id === eleve.classeId)
  if (!classe) return { classe: undefined, etablissement: undefined }
  
  const etablissement = etablissements.find(e => e.id === classe.etablissementId)
  return { classe, etablissement }
}
