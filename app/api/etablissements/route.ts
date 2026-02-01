/**
 * Route API pour la gestion des établissements
 * GET - Récupère tous les établissements
 * POST - Crée un nouvel établissement
 */

import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getCollection } from '@/lib/services/mongodb'
import type { CreerEtablissementDonnees } from '@/lib/types'
import { serializeDocuments, serializeDocument } from '@/lib/services/serializers'

/**
 * GET /api/etablissements
 * Récupère la liste de tous les établissements
 */
export async function GET() {
  try {
    const etablissementsCollection = await getCollection('etablissements')
    const etablissements = await etablissementsCollection.find().toArray()

    return NextResponse.json({
      succes: true,
      donnees: serializeDocuments(etablissements),
    })
  } catch (erreur) {
    console.error('Erreur lors de la récupération des établissements:', erreur)
    return NextResponse.json(
      { succes: false, erreur: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/etablissements
 * Crée un nouvel établissement
 */
export async function POST(requete: Request) {
  try {
    const donnees: CreerEtablissementDonnees = await requete.json()

    // Validation des données requises
    if (!donnees.nom || !donnees.adresse || !donnees.anneeScolaire) {
      return NextResponse.json(
        { succes: false, erreur: 'Données manquantes: nom, adresse et année scolaire sont requis' },
        { status: 400 }
      )
    }

    const etablissementsCollection = await getCollection('etablissements')

    // Création du nouvel établissement
    const nouvelEtablissement = {
      nom: donnees.nom,
      logo: donnees.logo || null,
      adresse: donnees.adresse,
      telephone: donnees.telephone || '',
      anneeScolaire: donnees.anneeScolaire,
      couleur: donnees.couleur || '#1e40af',
      police: donnees.police || 'Arial',
      creeLe: new Date(),
      modifieLe: new Date(),
    }

    const resultat = await etablissementsCollection.insertOne(nouvelEtablissement)
    const etablissementCree = serializeDocument({
      _id: resultat.insertedId,
      ...nouvelEtablissement,
    })

    return NextResponse.json({
      succes: true,
      donnees: etablissementCree,
      message: 'Établissement créé avec succès',
    })
  } catch (erreur) {
    console.error('Erreur lors de la création de l\'établissement:', erreur)
    return NextResponse.json(
      { succes: false, erreur: 'Erreur lors de la création de l\'établissement' },
      { status: 500 }
    )
  }
}
