import { connectToDatabase } from '@/lib/services/mongodb'
import { ObjectId } from 'mongodb'
import type { Personnel, CreerPersonnelDonnees } from '@/lib/types'

/**
 * GET /api/personnel
 * Récupère la liste de tout le personnel avec filtres optionnels
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const etablissementId = searchParams.get('etablissementId')
    const role = searchParams.get('role')
    const recherche = searchParams.get('recherche')

    const { db } = await connectToDatabase()
    const personnelCollection = db.collection('personnel')

    // Construire le filtre
    const filtre: any = {}
    if (etablissementId) {
      filtre.etablissementId = new ObjectId(etablissementId)
    }
    if (role) {
      filtre.role = role
    }
    if (recherche) {
      filtre.$or = [
        { nom: { $regex: recherche, $options: 'i' } },
        { prenom: { $regex: recherche, $options: 'i' } },
        { fonction: { $regex: recherche, $options: 'i' } },
      ]
    }

    // Agrégation pour enrichir les données
    const pipeline: any[] = [
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
      { $sort: { creeLe: -1 } },
    ]

    const personnel = await personnelCollection.aggregate(pipeline).toArray()

    // Formater la réponse
    const personnelFormate = personnel.map((p: any) => ({
      id: p._id?.toString(),
      ...p,
      _id: p._id,
    }))

    return Response.json({
      succes: true,
      donnees: personnelFormate,
    })
  } catch (erreur) {
    console.error('Erreur lors de la récupération du personnel:', erreur)
    return Response.json(
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
    const data: CreerPersonnelDonnees = await request.json()

    // Validation
    if (!data.nom || !data.prenom || !data.role || !data.fonction || !data.etablissementId) {
      return Response.json(
        {
          succes: false,
          erreur: 'Données manquantes (nom, prenom, role, fonction, etablissementId)',
        },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const personnelCollection = db.collection('personnel')

    // Créer le nouveau membre du personnel
    const nouveauPersonnel = {
      nom: data.nom,
      prenom: data.prenom,
      role: data.role,
      fonction: data.fonction,
      email: data.email || null,
      telephone: data.telephone || null,
      photo: data.photo || null,
      etablissementId: new ObjectId(data.etablissementId),
      creeLe: new Date(),
      modifieLe: new Date(),
    }

    const resultat = await personnelCollection.insertOne(nouveauPersonnel)

    return Response.json(
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
    return Response.json(
      {
        succes: false,
        erreur: 'Erreur lors de la création du personnel',
      },
      { status: 500 }
    )
  }
}
