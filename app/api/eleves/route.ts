/**
 * =====================================================
 * ROUTE API : GESTION DES ÉLÈVES
 * =====================================================
 * 
 * Cette route gère les opérations CRUD pour les élèves.
 * 
 * CONNEXION FRONTEND-BACKEND :
 * Le frontend utilise le service API (/lib/services/api.ts) qui appelle
 * cette route via fetch(). Les données sont échangées en JSON.
 * 
 * MÉTHODES DISPONIBLES :
 * - GET  /api/eleves                          → Récupère tous les élèves
 * - GET  /api/eleves?classeId=xxx             → Filtre par classe
 * - GET  /api/eleves?etablissementId=xxx      → Filtre par établissement
 * - GET  /api/eleves?classeId=xxx&etablissementId=yyy → Filtre combiné
 * - POST /api/eleves                          → Crée un nouvel élève
 * 
 * EXEMPLE D'UTILISATION FRONTEND :
 * ```typescript
 * import { recupererEleves } from '@/lib/services/api'
 * 
 * // Récupérer tous les élèves
 * const reponse = await recupererEleves()
 * 
 * // Filtrer par classe
 * const reponse = await recupererEleves({ classeId: 'xxx' })
 * 
 * // Filtrer par établissement
 * const reponse = await recupererEleves({ etablissementId: 'yyy' })
 * ```
 * 
 * FORMAT DE RÉPONSE :
 * {
 *   succes: boolean,
 *   donnees: Eleve[],    // Si succes = true
 *   erreur: string       // Si succes = false
 * }
 */

import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getCollection } from '@/lib/services/mongodb'
import type { CreerEleveDonnees } from '@/lib/types'
import { serializeDocument, serializeDocuments, serializeReference } from '@/lib/services/serializers'

/**
 * GET /api/eleves
 * ---------------
 * Récupère la liste de tous les élèves avec filtres optionnels
 * 
 * @param requete - La requête HTTP entrante
 * @returns Liste des élèves avec leurs détails (classe, établissement)
 * 
 * Paramètres de requête (query params) :
 * - classeId (optionnel) : Filtre les élèves par ID de classe
 * - etablissementId (optionnel) : Filtre les élèves par ID d'établissement
 * 
 * Les deux filtres peuvent être combinés pour un filtrage plus précis.
 */
export async function GET(requete: Request) {
  try {
    const { searchParams } = new URL(requete.url)
    const classeId = searchParams.get('classeId')
    const etablissementId = searchParams.get('etablissementId')

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

    // Récupérer les élèves avec les détails de la classe
    const eleves = await elevesCollection
      .aggregate([
        { $match: filtre },
        {
          $lookup: {
            from: 'classes',
            localField: 'classeId',
            foreignField: '_id',
            as: 'classe',
          },
        },
        { $unwind: { path: '$classe', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'etablissements',
            localField: 'classe.etablissementId',
            foreignField: '_id',
            as: 'etablissement',
          },
        },
        { $unwind: { path: '$etablissement', preserveNullAndEmptyArrays: true } },
      ])
      .toArray()

    const elevesFormates = eleves.map((eleve) => {
      const { classe, etablissement, ...rest } = eleve
      return {
        ...serializeDocument(rest),
        classeId: serializeReference(rest.classeId),
        classe: classe
          ? {
              ...serializeDocument(classe),
              etablissementId: serializeReference(classe.etablissementId),
            }
          : undefined,
        etablissement: etablissement ? serializeDocument(etablissement) : undefined,
      }
    })

    return NextResponse.json({
      succes: true,
      donnees: elevesFormates,
      meta: {
        total: eleves.length,
        filtreClasse: classeId || null,
        filtreEtablissement: etablissementId || null,
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
    const donnees: CreerEleveDonnees = await requete.json()

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
      sexe: donnees.sexe || 'M',
      photo: donnees.photo || null,
      matricule,
      classeId: new ObjectId(donnees.classeId),
      creeLe: new Date(),
      modifieLe: new Date(),
    }

    const resultat = await elevesCollection.insertOne(nouvelEleve)
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
  } catch (erreur) {
    console.error('Erreur lors de la création de l\'élève:', erreur)
    return NextResponse.json(
      { succes: false, erreur: 'Erreur lors de la création de l\'élève' },
      { status: 500 }
    )
  }
}
