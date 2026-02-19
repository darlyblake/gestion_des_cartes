/**
 * =====================================================
 * ROUTE API : GESTION DES ÉLÈVES
 * =====================================================
 * 
 * Cette route gère les opérations CRUD pour les élèves.
 * Support de la PAGINATION pour optimiser les performances.
 * 
 * CONNEXION FRONTEND-BACKEND :
 * Le frontend utilise le service API (/lib/services/api.ts) qui appelle
 * cette route via fetch(). Les données sont échangées en JSON.
 * 
 * MÉTHODES DISPONIBLES :
 * - GET  /api/eleves                              → Récupère les élèves (PAGINÉ)
 * - GET  /api/eleves?classeId=xxx                → Filtre par classe (PAGINÉ)
 * - GET  /api/eleves?etablissementId=xxx         → Filtre par établissement (PAGINÉ)
 * - GET  /api/eleves?page=1&limit=50             → Pagination
 * - GET  /api/eleves?search=nom                  → Recherche (PAGINÉ)
 * - POST /api/eleves                             → Crée un nouvel élève
 * 
 * EXEMPLE D'UTILISATION FRONTEND :
 * ```typescript
 * import { recupererEleves } from '@/lib/services/api'
 * 
 * // Récupérer les élèves paginés
 * const reponse = await recupererEleves({ page: 1, limit: 50 })
 * 
 * // Filtrer par classe avec pagination
 * const reponse = await recupererEleves({ classeId: 'xxx', page: 1, limit: 25 })
 * 
 * // Recherche avec pagination
 * const reponse = await recupererEleves({ search: 'dupont', page: 1, limit: 50 })
 * ```
 * 
 * FORMAT DE RÉPONSE PAGINÉE :
 * {
 *   succes: boolean,
 *   donnees: Eleve[],    // Si succes = true
 *   meta: {
 *     total: number,
 *     page: number,
 *     limit: number,
 *     totalPages: number,
 *     hasNextPage: boolean,
 *     hasPrevPage: boolean
 *   }
 * }
 */

import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { ObjectId } from 'mongodb'
import { getCollection } from '@/lib/services/mongodb'
import type { CreerEleveDonnees } from '@/lib/types'
import { serializeDocument, serializeDocuments, serializeReference } from '@/lib/services/serializers'
import { elevesQuerySchema, generatePaginationMeta } from '@/lib/services/validation'
import { checkRateLimit, checkSensitiveRateLimit } from '@/lib/services/rate-limiter'
import { invalidateCacheAfterChange } from '@/lib/services/api-cache'

/**
 * GET /api/eleves
 * ---------------
 * Récupère la liste des élèves avec pagination, filtres et recherche
 * 
 * @param requete - La requête HTTP entrante
 * @returns Liste des élèves paginée avec métadonnées
 * 
 * Paramètres de requête (query params) :
 * - page (optionnel, défaut: 1) : Numéro de page
 * - limit (optionnel, défaut: 50) : Nombre d'éléments par page (max: 100)
 * - classeId (optionnel) : Filtre les élèves par ID de classe
 * - etablissementId (optionnel) : Filtre les élèves par ID d'établissement
 * - search (optionnel) : Recherche sur nom et prénom
 * - sortBy (optionnel) : Champ de tri (défaut: creeLe)
 * - sortOrder (optionnel, défaut: desc) : Ordre de tri (asc ou desc)
 */
export async function GET(requete: Request) {
  try {
    // Rate limiting pour les requêtes GET
    const rateLimitError = await checkRateLimit(requete)
    if (rateLimitError) return rateLimitError
    const { searchParams } = new URL(requete.url)
    
    // Valider les paramètres avec Zod
    const paramsResult = elevesQuerySchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      classeId: searchParams.get('classeId'),
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

    const { page, limit, classeId, etablissementId, search, sortBy, sortOrder } = paramsResult.data

    const elevesCollection = await getCollection('eleves')
    const classesCollection = await getCollection('classes')

    // Construire le filtre MongoDB
    const filtre: Record<string, unknown> = {}
    
    if (classeId) {
      filtre.classeId = new ObjectId(classeId)
    }

    if (etablissementId) {
      // Récupérer les classes de l'établissement
      const classesEtablissement = await classesCollection
        .find({ etablissementId: new ObjectId(etablissementId) })
        .project({ _id: 1 })
        .toArray()
      
      const idsClasses = classesEtablissement.map((c) => c._id)
      filtre.classeId = { $in: idsClasses }
    }

    // Ajouter la recherche textuelle sur nom et prénom
    if (search) {
      // Utiliser l'index text pour une recherche plus rapide
      filtre.$text = { $search: search }
    }

    // Calculer le skip pour la pagination
    const skip = (page - 1) * limit

    // Déterminer le champ de tri
    const sortField = sortBy || 'creeLe'
    const sortDirection = sortOrder === 'asc' ? 1 : -1

    // Compter le total AVANT la pagination
    const total = await elevesCollection.countDocuments(filtre)

    // Récupérer les élèves paginés avec les détails de la classe
    const eleves = await elevesCollection
      .aggregate(
        [
          { $match: filtre },
          { $sort: { [sortField]: sortDirection } },
          { $skip: skip },
          { $limit: limit },
          // ⚡ Projection optimisée - sans lookups coûteux
          {
            $project: {
              _id: 1,
              nom: 1,
              prenom: 1,
              email: 1,
              photo: 1,
              numeroMatricule: 1,
              matricule: 1,
              classeId: 1,
              dateNaissance: 1,
              lieuNaissance: 1,
              nationalite: 1,
              sexe: 1,
              creeLe: 1,
            },
          },
        ],
        { maxTimeMS: 5000, allowDiskUse: true }
      )
      .toArray()

    const elevesFormates = eleves.map((eleve) => {
      return {
        ...serializeDocument(eleve),
        classeId: serializeReference(eleve.classeId),
      }
    })

    // Générer les métadonnées de pagination
    const meta = generatePaginationMeta(total, page, limit)

    return NextResponse.json({
      succes: true,
      donnees: elevesFormates,
      meta: {
        ...meta,
        filtreClasse: classeId || null,
        filtreEtablissement: etablissementId || null,
        search: search || null,
      },
    })
  } catch (erreur) {
    console.error('Erreur lors de la récupération des élèves:', erreur)
    return NextResponse.json(
      { succes: false, erreur: 'Erreur serveur lors de la récupération des élèves' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/eleves
 * Crée un nouvel élève
 */
export async function POST(requete: Request) {
  try {
    // Rate limiting stricte pour les créations
    const rateLimitError = await checkSensitiveRateLimit(requete)
    if (rateLimitError) return rateLimitError
    const donnees: CreerEleveDonnees = await requete.json()
    console.log('📝 POST /api/eleves: Données reçues =', { nom: donnees.nom, prenom: donnees.prenom, classeId: donnees.classeId })

    // Validation des données requises
    if (!donnees.nom || !donnees.prenom || !donnees.dateNaissance || !donnees.classeId) {
      return NextResponse.json(
        { succes: false, erreur: 'Données manquantes: nom, prénom, date de naissance et classe sont requis' },
        { status: 400 }
      )
    }

    const elevesCollection = await getCollection('eleves')
    const classesCollection = await getCollection('classes')
    const etablissementsCollection = await getCollection('etablissements')

    // Vérification que la classe existe
    const classeExiste = await classesCollection.findOne({
      _id: new ObjectId(donnees.classeId),
    })

    if (!classeExiste) {
      return NextResponse.json(
        { succes: false, erreur: 'La classe spécifiée n\'existe pas' },
        { status: 400 }
      )
    }

    // Récupération de l'établissement pour l'année scolaire
    const etablissement = await etablissementsCollection.findOne({
      _id: new ObjectId(classeExiste.etablissementId),
    })
    const annee = etablissement?.anneeScolaire?.split('-')[0] || '2025'

    // Génération du matricule unique
    const count = await elevesCollection.countDocuments()
    const matricule = `${annee}${(count + 1).toString().padStart(5, '0')}`

    // Création du nouvel élève
    const nouvelEleve = {
      nom: donnees.nom.toUpperCase(),
      prenom: donnees.prenom,
      dateNaissance: new Date(donnees.dateNaissance),
      lieuNaissance: donnees.lieuNaissance || '',
      nationalite: donnees.nationalite || '',
      sexe: donnees.sexe || 'M',
      photo: donnees.photo || null,
      matricule,
      classeId: new ObjectId(donnees.classeId),
      creeLe: new Date(),
      modifieLe: new Date(),
    }

    const resultat = await elevesCollection.insertOne(nouvelEleve)
    console.log('✅ POST /api/eleves: insertOne réussi, insertedId =', resultat.insertedId.toString())
    
    // Invalider le cache après création
    invalidateCacheAfterChange('eleve')
    
    // Revalidate la page des élèves pour forcer le rafraîchissement
    revalidatePath('/eleves')
    revalidatePath('/api/eleves')

    const classeSerialisee = {
      ...serializeDocument(classeExiste),
      etablissementId: serializeReference(classeExiste.etablissementId),
    }
    const etablissementSerialise = etablissement ? serializeDocument(etablissement) : undefined

    return NextResponse.json({
      succes: true,
      donnees: {
        ...serializeDocument({
          _id: resultat.insertedId,
          ...nouvelEleve,
        }),
        classeId: serializeReference(nouvelEleve.classeId),
        classe: classeSerialisee,
        etablissement: etablissementSerialise,
      },
      message: 'Élève créé avec succès',
    })
  } catct msg = erreur instanceof Error ? erreur.message : String(erreur)
    console.error('❌ POST /api/eleves: Exception levée =', msg)
    consh (erreur) {
    console.error('Erreur lors de la création de l\'élève:', erreur)
    return NextResponse.json(
      { succes: false, erreur: 'Erreur lors de la création de l\'élève' },
      { status: 500 }
    )
  }
}
