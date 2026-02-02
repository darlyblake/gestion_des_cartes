/**
 * Route API pour la gestion des établissements
 * GET - Récupère tous les établissements (CACHÉE)
 * POST - Crée un nouvel établissement
 */

import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getCollection } from '@/lib/services/mongodb'
import type { CreerEtablissementDonnees } from '@/lib/types'
import { serializeDocuments, serializeDocument } from '@/lib/services/serializers'
import { apiCache, cacheKeys, invalidateCacheAfterChange } from '@/lib/services/api-cache'

/**
 * GET /api/etablissements
 * Récupère la liste de tous les établissements
 * Utilise le cache en mémoire pour réduire les appels BD
 */
export async function GET() {
  try {
    const donnees = await apiCache.getOrSet(
      cacheKeys.TOUTES_LES_ETABLISSEMENTS,
      async () => {
        const etablissementsCollection = await getCollection('etablissements')
        const etablissements = await etablissementsCollection.find().toArray()
        return serializeDocuments(etablissements)
      },
      5 * 60 * 1000 // 5 minutes TTL
    )

    return NextResponse.json({
      succes: true,
      donnees,
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
      signature: donnees.signature || null,
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

    // Invalider le cache des établissements
    invalidateCacheAfterChange('etablissement')

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
