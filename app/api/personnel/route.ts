/**
 * Route API pour la gestion du personnel
 * Support de la PAGINATION pour optimiser les performances.
 * 
 * GET - Récupère tout le personnel (PAGINÉ, FILTRÉ)
 * POST - Crée un nouveau membre du personnel
 * 
 * PARAMÈTRES DE PAGINATION :
 * - page (optionnel, défaut: 1) : Numéro de page
 * - limit (optionnel, défaut: 50) : Nombre d'éléments par page (max: 100)
 * - etablissementId (optionnel) : Filtrer par établissement
 * - role (optionnel) : Filtrer par rôle
 * - search (optionnel) : Recherche par nom, prénom ou fonction
 * - sortBy (optionnel) : Champ de tri
 * - sortOrder (optionnel) : Ordre de tri (asc/desc)
 */

import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getCollection } from '@/lib/services/mongodb'
import type { CreerPersonnelDonnees } from '@/lib/types'
import { serializeDocument, serializeReference } from '@/lib/services/serializers'
import { personnelQuerySchema, generatePaginationMeta } from '@/lib/services/validation'
import { checkRateLimit, checkSensitiveRateLimit } from '@/lib/services/rate-limiter'

/**
 * GET /api/personnel
 * Récupère la liste du personnel avec pagination, filtres et recherche
 */
export async function GET(request: Request) {
  try {
    // Rate limiting pour les requêtes GET
    const rateLimitError = await checkRateLimit(request)
    if (rateLimitError) return rateLimitError

    const { searchParams } = new URL(request.url)
    
    // Valider les paramètres avec Zod
    const paramsResult = personnelQuerySchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      etablissementId: searchParams.get('etablissementId'),
      role: searchParams.get('role'),
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

    const { page, limit, etablissementId, role, search, sortBy, sortOrder } = paramsResult.data

    const personnelCollection = await getCollection('personnel')

    // Construire le filtre MongoDB
    const filtre: Record<string, unknown> = {}
    
    if (etablissementId) {
      filtre.etablissementId = new ObjectId(etablissementId)
    }
    
    if (role) {
      filtre.role = role
    }

    // Ajouter la recherche textuelle sur nom, prénom et fonction
    if (search) {
      // Utiliser l'index text pour une recherche plus rapide
      filtre.$text = { $search: search }
    }

    // Calculer le skip pour la pagination
    const skip = (page - 1) * limit

    // Déterminer le champ de tri
    const sortField = sortBy || 'creeLe'
    const sortDirection = sortOrder === 'asc' ? 1 : -1

    // Compter le total
    const total = await personnelCollection.countDocuments(filtre)

    // Agrégation pour enrichir les données avec pagination
    const pipeline = [
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
      { $sort: { [sortField]: sortDirection } },
      { $skip: skip },
      { $limit: limit },
    ]

    const personnel = await personnelCollection.aggregate(pipeline).toArray()

    // Formater la réponse
    const personnelFormate = personnel.map((p) => {
      const { etablissement, ...rest } = p
      return {
        ...serializeDocument(rest),
        etablissementId: serializeReference(rest.etablissementId),
        etablissement: etablissement ? serializeDocument(etablissement) : undefined,
      }
    })

    // Générer les métadonnées de pagination
    const meta = generatePaginationMeta(total, page, limit)

    return NextResponse.json({
      succes: true,
      donnees: personnelFormate,
      meta: {
        ...meta,
        filtreEtablissement: etablissementId || null,
        filtreRole: role || null,
        search: search || null,
      },
    })
  } catch (erreur) {
    console.error('Erreur lors de la récupération du personnel:', erreur)
    return NextResponse.json(
      {
        succes: false,
        erreur: 'Erreur lors de la récupération du personnel',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/personnel
 * Crée un nouveau membre du personnel
 */
export async function POST(request: Request) {
  try {
    // Rate limiting stricte pour les créations
    const rateLimitError = await checkSensitiveRateLimit(request)
    if (rateLimitError) return rateLimitError

    const data: CreerPersonnelDonnees = await request.json()

    // Validation basique
    if (!data.nom || !data.prenom || !data.role || !data.fonction || !data.etablissementId) {
      return NextResponse.json(
        {
          succes: false,
          erreur: 'Données manquantes (nom, prenom, role, fonction, etablissementId)',
        },
        { status: 400 }
      )
    }

    const personnelCollection = await getCollection('personnel')

    // Créer le nouveau membre du personnel
    const nouveauPersonnel = {
      nom: data.nom,
      prenom: data.prenom,
      role: data.role,
      fonction: data.fonction,
      email: data.email || null,
      telephone: data.telephone || null,
      photo: data.photo || null,
      dateNaissance: data.dateNaissance || null,
      lieuNaissance: data.lieuNaissance || null,
      nationalite: data.nationalite || null,
      etablissementId: new ObjectId(data.etablissementId),
      creeLe: new Date(),
      modifieLe: new Date(),
    }

    const resultat = await personnelCollection.insertOne(nouveauPersonnel)

    return NextResponse.json(
      {
        succes: true,
        donnees: {
          id: resultat.insertedId.toString(),
          ...nouveauPersonnel,
          _id: resultat.insertedId,
        },
        message: 'Membre du personnel créé avec succès',
      },
      { status: 201 }
    )
  } catch (erreur) {
    console.error('Erreur lors de la création du personnel:', erreur)
    return NextResponse.json(
      {
        succes: false,
        erreur: 'Erreur lors de la création du personnel',
      },
      { status: 500 }
    )
  }
}
