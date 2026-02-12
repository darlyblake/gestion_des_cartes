/**
 * Route API pour la gestion des classes
 * Support de la PAGINATION pour optimiser les performances.
 * 
 * GET  - Récupère toutes les classes (filtre optionnel par établissement, PAGINÉ)
 * POST - Crée une nouvelle classe
 * 
 * PARAMÈTRES DE PAGINATION :
 * - page (optionnel, défaut: 1) : Numéro de page
 * - limit (optionnel, défaut: 50) : Nombre d'éléments par page (max: 100)
 * - etablissementId (optionnel) : Filtrer par établissement
 * - search (optionnel) : Recherche par nom de classe
 * - sortBy (optionnel) : Champ de tri
 * - sortOrder (optionnel) : Ordre de tri (asc/desc)
 */

import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getCollection } from '@/lib/services/mongodb'
import type { CreerClasseDonnees } from '@/lib/types'
import { serializeDocument, serializeReference } from '@/lib/services/serializers'
import { apiCache, cacheKeys, invalidateCacheAfterChange } from '@/lib/services/api-cache'
import { classesQuerySchema, generatePaginationMeta } from '@/lib/services/validation'
import { checkRateLimit, checkSensitiveRateLimit } from '@/lib/services/rate-limiter'

/* =========================
   GET /api/classes
========================= */
export async function GET(requete: Request) {
  try {
    // Rate limiting pour les requêtes GET
    const rateLimitError = await checkRateLimit(requete)
    if (rateLimitError) return rateLimitError

    const { searchParams } = new URL(requete.url)
    
    // Valider les paramètres avec Zod
    const paramsResult = classesQuerySchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      etablissementId: searchParams.get('etablissementId'),
      search: searchParams.get('search'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
    })

    if (!paramsResult.success) {
      return NextResponse.json(
        { 
          succes: false, 
          erreur: 'Paramètres invalides',
          details: paramsResult.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const { page, limit, etablissementId, search, sortBy, sortOrder } = paramsResult.data

    const classesCollection = await getCollection('classes')

    // Générer la clé de cache appropriée (incluant les paramètres de pagination)
    const cacheKey = cacheKeys.CLASSES_PAR_ETABLISSEMENT(
      etablissementId || 'all'
    ) + `:p${page}:l${limit}:s${search || ''}`

    // Construire le filtre MongoDB
    const filtre: Record<string, unknown> = {}
    if (etablissementId) {
      filtre.etablissementId = new ObjectId(etablissementId)
    }

    // Ajouter la recherche textuelle sur nom et niveau
    if (search) {
      // Utiliser l'index text pour une recherche plus rapide
      filtre.$text = { $search: search }
    }

    // Calculer le skip pour la pagination
    const skip = (page - 1) * limit

    // Déterminer le champ de tri
    const sortField = sortBy || 'creeLe'
    const sortDirection = sortOrder === 'asc' ? 1 : -1

    const donnees = await apiCache.getOrSet(
      cacheKey,
      async () => {
        // Compter le total pour la pagination
        const total = await classesCollection.countDocuments(filtre)

        // ⚡ OPTIMISATION: Récupérer les classes paginées SANS lookups coûteux
        // Les lookups notamment le count d'élèves, sont très coûteux sur grandes collections
        const result = await classesCollection
          .aggregate(
            [
              { $match: filtre },
              { $sort: { [sortField]: sortDirection } },
              { $skip: skip },
              { $limit: limit },
              // Retourner uniquement les champs essentiels
              {
                $project: {
                  _id: 1,
                  nom: 1,
                  niveau: 1,
                  etablissementId: 1,
                  creeLe: 1,
                  modifieLe: 1,
                },
              },
            ],
            { maxTimeMS: 5000, allowDiskUse: true } // Timeout 5s, disk use OK
          )
          .toArray()

        return { 
          classes: result.map((classe) => {
            return {
              ...serializeDocument(classe),
              etablissementId: serializeReference(classe.etablissementId),
            }
          }), 
          total 
        }
      },
      3 * 60 * 1000 // 3 minutes TTL
    )

    // Générer les métadonnées de pagination
    const meta = generatePaginationMeta(donnees.total, page, limit)

    return NextResponse.json(
      {
        succes: true,
        donnees: donnees.classes,
        meta: {
          ...meta,
          filtreEtablissement: etablissementId || null,
          search: search || null,
        },
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
    // Rate limiting stricte pour les créations
    const rateLimitError = await checkSensitiveRateLimit(requete)
    if (rateLimitError) return rateLimitError

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
