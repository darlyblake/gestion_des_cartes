/**
 * Route API pour la gestion des classes
 * GET  - Récupère toutes les classes (filtre optionnel par établissement, CACHÉE)
 * POST - Crée une nouvelle classe
 */

import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getCollection } from '@/lib/services/mongodb'
import type { CreerClasseDonnees } from '@/lib/types'
import { serializeDocument, serializeDocuments, serializeReference } from '@/lib/services/serializers'
import { apiCache, cacheKeys, invalidateCacheAfterChange } from '@/lib/services/api-cache'

/* =========================
   GET /api/classes
========================= */
export async function GET(requete: Request) {
  try {
    const { searchParams } = new URL(requete.url)
    const etablissementId = searchParams.get('etablissementId')

    const classesCollection = await getCollection('classes')

    // Générer la clé de cache appropriée
    const cacheKey = etablissementId
      ? cacheKeys.CLASSES_PAR_ETABLISSEMENT(etablissementId)
      : cacheKeys.TOUTES_LES_CLASSES

    const filtre: any = {}
    if (etablissementId) {
      filtre.etablissementId = new ObjectId(etablissementId)
    }

    const donnees = await apiCache.getOrSet(
      cacheKey,
      async () => {
        const result = await classesCollection
          .aggregate([
            { $match: filtre },
            {
              $lookup: {
                from: 'etablissements',
                localField: 'etablissementId',
                foreignField: '_id',
                as: 'etablissement',
              },
            },
            {
              $unwind: {
                path: '$etablissement',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: 'eleves',
                localField: '_id',
                foreignField: 'classeId',
                as: 'eleves',
              },
            },
            {
              $addFields: {
                nombreEleves: { $size: '$eleves' },
              },
            },
            {
              $project: {
                eleves: 0,
              },
            },
          ])
          .toArray()

        return result.map((classe) => {
          const { etablissement, ...rest } = classe
          return {
            ...serializeDocument(rest),
            etablissement: etablissement ? serializeDocument(etablissement) : undefined,
            etablissementId: serializeReference(rest.etablissementId),
            nombreEleves: classe.nombreEleves || 0,
          }
        })
      },
      3 * 60 * 1000 // 3 minutes TTL
    )

    return NextResponse.json(
      {
        succes: true,
        donnees,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=180, s-maxage=360',
        },
      }
    )
  } catch (erreur) {
    console.error('Erreur lors de la récupération des classes:', erreur)
    return NextResponse.json(
      { succes: false, erreur: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/* =========================
   POST /api/classes
========================= */
export async function POST(requete: Request) {
  try {
    const donnees = (await requete.json()) as CreerClasseDonnees

    if (!donnees.nom || !donnees.niveau || !donnees.etablissementId) {
      return NextResponse.json(
        {
          succes: false,
          erreur: 'Données manquantes: nom, niveau et établissement sont requis',
        },
        { status: 400 }
      )
    }

    const classesCollection = await getCollection('classes')
    const etablissementsCollection = await getCollection('etablissements')

    // Vérifier que l'établissement existe
    const etablissement = await etablissementsCollection.findOne({
      _id: new ObjectId(donnees.etablissementId),
    })

    if (!etablissement) {
      return NextResponse.json(
        { succes: false, erreur: "L'établissement spécifié n'existe pas" },
        { status: 400 }
      )
    }

    const nouvelleClasse = {
      nom: donnees.nom,
      niveau: donnees.niveau,
      etablissementId: new ObjectId(donnees.etablissementId),
      creeLe: new Date(),
      modifieLe: new Date(),
    }

    const resultat = await classesCollection.insertOne(nouvelleClasse)

    // Invalider les caches affectés
    invalidateCacheAfterChange('classe')

    return NextResponse.json({
      succes: true,
      donnees: {
        ...serializeDocument({
          _id: resultat.insertedId,
          ...nouvelleClasse,
        }),
        etablissement: serializeDocument(etablissement),
        nombreEleves: 0,
      },
      message: 'Classe créée avec succès',
    })
  } catch (erreur) {
    console.error('Erreur lors de la création de la classe:', erreur)
    return NextResponse.json(
      { succes: false, erreur: 'Erreur lors de la création de la classe' },
      { status: 500 }
    )
  }
}
