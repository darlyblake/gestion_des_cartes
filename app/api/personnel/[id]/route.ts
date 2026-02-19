import { connectToDatabase } from '@/lib/services/mongodb'
import { ObjectId } from 'mongodb'
import type { ModifierPersonnelDonnees } from '@/lib/types'

/**
 * GET /api/personnel/[id]
 * Récupère un membre du personnel par son ID
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { db } = await connectToDatabase()
    const personnelCollection = db.collection('personnel')

    const membre = await personnelCollection.aggregate([
      { $match: { _id: new ObjectId(id) } },
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
    ]).toArray()

    if (membre.length === 0) {
      return Response.json(
        {
          succes: false,
          erreur: 'Membre du personnel non trouvé',
        },
        { status: 404 }
      )
    }

    const p = membre[0]
    return Response.json({
      succes: true,
      donnees: {
        id: p._id?.toString(),
        ...p,
      },
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
 * PUT /api/personnel/[id]
 * Met à jour un membre du personnel
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data: ModifierPersonnelDonnees = await request.json()

    const { db } = await connectToDatabase()
    const personnelCollection = db.collection('personnel')

    // Préparer les données de mise à jour
    const miseAJour: any = {
      modifieLe: new Date(),
    }

    if (data.nom) miseAJour.nom = data.nom
    if (data.prenom) miseAJour.prenom = data.prenom
    if (data.role) miseAJour.role = data.role
    if (data.fonction) miseAJour.fonction = data.fonction
    if (data.email !== undefined) miseAJour.email = data.email
    if (data.telephone !== undefined) miseAJour.telephone = data.telephone
    if (data.photo) miseAJour.photo = data.photo
    if (data.dateNaissance !== undefined) miseAJour.dateNaissance = data.dateNaissance
    if (data.lieuNaissance !== undefined) miseAJour.lieuNaissance = data.lieuNaissance
    if (data.nationalite !== undefined) miseAJour.nationalite = data.nationalite
    if (data.etablissementId) miseAJour.etablissementId = new ObjectId(data.etablissementId)

    const resultat = await personnelCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: miseAJour }
    )

    if (resultat.matchedCount === 0) {
      return Response.json(
        {
          succes: false,
          erreur: 'Membre du personnel non trouvé',
        },
        { status: 404 }
      )
    }

    return Response.json({
      succes: true,
      message: 'Membre du personnel mis à jour avec succès',
    })
  } catch (erreur) {
    console.error('Erreur lors de la mise à jour du personnel:', erreur)
    return Response.json(
      {
        succes: false,
        erreur: 'Erreur lors de la mise à jour du personnel',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/personnel/[id]
 * Supprime un membre du personnel
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('🗑️ DELETE /api/personnel/[id]: id reçu =', id, '| isValid =', ObjectId.isValid(id))
    
    const { db } = await connectToDatabase()
    const personnelCollection = db.collection('personnel')

    const resultat = await personnelCollection.deleteOne({
      _id: new ObjectId(id),
    })
    
    console.log('🗑️ DELETE /api/personnel/[id]: deleteOne result =', { deletedCount: resultat.deletedCount })

    if (resultat.deletedCount === 0) {
      console.warn('⚠️ Membre du personnel non trouvé pour suppression, id =', id)
      return Response.json(
        {
          succes: false,
          erreur: 'Membre du personnel non trouvé',
        },
        { status: 404 }
      )
    }

    return Response.json({
      succes: true,
      message: 'Membre du personnel supprimé avec succès',
    })
  } catch (erreur) {
    console.error('Erreur lors de la suppression du personnel:', erreur)
    return Response.json(
      {
        succes: false,
        erreur: 'Erreur lors de la suppression du personnel',
      },
      { status: 500 }
    )
  }
}
