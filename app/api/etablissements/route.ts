/**
 * Route API pour la gestion des établissements
 * Support de la PAGINATION pour optimiser les performances.
 * 
 * GET - Récupère tous les établissements (PAGINÉ, CACHÉ)
 * POST - Crée un nouvel établissement
 * 
 * PARAMÈTRES DE PAGINATION :
 * - page (optionnel, défaut: 1) : Numéro de page
 * - limit (optionnel, défaut: 50) : Nombre d'éléments par page (max: 100)
 * - search (optionnel) : Recherche par nom
 * - projection (optionnel) : 'light' pour les champs minimaux
 * - sortBy (optionnel) : Champ de tri
 * - sortOrder (optionnel) : Ordre de tri (asc/desc)
 */

import { NextResponse } from 'next/server'
import { getCollection } from '@/lib/services/mongodb'
import type { CreerEtablissementDonnees } from '@/lib/types'
import { serializeDocuments, serializeDocument } from '@/lib/services/serializers'
import { apiCache, cacheKeys, invalidateCacheAfterChange } from '@/lib/services/api-cache'
import { etablissementsQuerySchema, generatePaginationMeta } from '@/lib/services/validation'
import { checkRateLimit, checkSensitiveRateLimit } from '@/lib/services/rate-limiter'

/**
 * GET /api/etablissements
 * Récupère la liste de tous les établissements avec pagination et recherche
 */
export async function GET(requete: Request) {
  try {
    // Rate limiting pour les requêtes GET
    const rateLimitError = await checkRateLimit(requete)
    if (rateLimitError) return rateLimitError

    const searchParams = new URL(requete.url).searchParams
    
    // Valider les paramètres avec Zod
    const paramsResult = etablissementsQuerySchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      search: searchParams.get('search'),
      projection: searchParams.get('projection'),
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

    const { page, limit, search, projection, sortBy, sortOrder } = paramsResult.data

    // Générer la clé de cache incluant les paramètres
    const cacheKey = cacheKeys.TOUTES_LES_ETABLISSEMENTS + 
      `:p${page}:l${limit}:proj${projection || 'full'}:s${search || ''}`

    const donnees = await apiCache.getOrSet(
      cacheKey,
      async () => {
        const etablissementsCollection = await getCollection('etablissements')

        // Construire le filtre pour la recherche textuelle
        const filtre: Record<string, unknown> = {}
        if (search) {
          filtre.$text = { $search: search }
        }

        // Déterminer les champs à retourner
        const projectionFields = projection === 'light' 
          ? { nom: 1, logo: 1, couleur: 1 } 
          : {}

        // Déterminer le champ de tri
        const sortField = sortBy || 'creeLe'
        const sortDirection = sortOrder === 'asc' ? 1 : -1

        // Compter le total
        const total = await etablissementsCollection.countDocuments(filtre)

        // Récupérer les établissements paginés
        const etablissements = await etablissementsCollection
          .find(filtre, { 
            projection: projectionFields,
            maxTimeMS: 5000, // ⚡ Timeout 5s pour les recherches
          })
          .sort({ [sortField]: sortDirection })
          .skip((page - 1) * limit)
          .limit(limit)
          .toArray()

        return {
          etablissements: serializeDocuments(etablissements),
          total,
        }
      },
      5 * 60 * 1000 // 5 minutes TTL
    )

    // Générer les métadonnées de pagination
    const meta = generatePaginationMeta(donnees.total, page, limit)

    return NextResponse.json({
      succes: true,
      donnees: donnees.etablissements,
      meta: {
        ...meta,
        projection: projection || 'full',
        search: search || null,
      },
    }, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60'
      }
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
    // Rate limiting stricte pour les créations
    const rateLimitError = await checkSensitiveRateLimit(requete)
    if (rateLimitError) return rateLimitError

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
