/**
 * Route API pour une classe spécifique
 * GET    - Récupère une classe par son ID
 * PUT    - Modifie une classe
 * DELETE - Supprime une classe
 */

import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getCollection } from '@/lib/services/mongodb'
import type { ModifierClasseDonnees } from '@/lib/types'
import {
  serializeDocument,
  serializeDocuments,
  serializeOptionalDocument,
  serializeReference,
} from '@/lib/services/serializers'
import { invalidateCacheAfterChange } from '@/lib/services/api-cache'

/* -------------------------------------------------------------------------- */
/*                                   GET                                      */
/* -------------------------------------------------------------------------- */

export async function GET(
  _requete: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const classesCollection = await getCollection('classes')
    const elevesCollection = await getCollection('eleves')

    const classe = await classesCollection
      .aggregate([
        { $match: { _id: new ObjectId(id) } },
        {
          $lookup: {
            from: 'etablissements',
            localField: 'etablissementId',
            foreignField: '_id',
            as: 'etablissement',
          },
        },
        { $unwind: { path: '$etablissement', preserveNullAndEmptyArrays: true } },
      ])
      .next()

    if (!classe) {
      return NextResponse.json(
        { succes: false, erreur: 'Classe non trouvée' },
        { status: 404 }
      )
    }

    const eleves = await elevesCollection
      .find({ classeId: new ObjectId(id) })
      .toArray()

    return NextResponse.json({
      succes: true,
      donnees: {
        ...serializeDocument(classe),
        etablissement: classe.etablissement ? serializeDocument(classe.etablissement) : undefined,
        etablissementId: serializeReference(classe.etablissementId),
        eleves: serializeDocuments(eleves),
        nombreEleves: eleves.length,
      },
    })
  } catch (erreur) {
    console.error('Erreur GET classe:', erreur)
    return NextResponse.json(
      { succes: false, erreur: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/* -------------------------------------------------------------------------- */
/*                                   PUT                                      */
/* -------------------------------------------------------------------------- */

export async function PUT(
  requete: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const donnees: ModifierClasseDonnees = await requete.json()

    const classesCollection = await getCollection('classes')
    const etablissementsCollection = await getCollection('etablissements')

    // Vérification établissement si modifié
    if (donnees.etablissementId) {
      const etablissementExiste = await etablissementsCollection.findOne({
        _id: new ObjectId(donnees.etablissementId),
      })

      if (!etablissementExiste) {
        return NextResponse.json(
          { succes: false, erreur: "L'établissement spécifié n'existe pas" },
          { status: 400 }
        )
      }
    }

    const resultat = await classesCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...donnees,
          modifieLe: new Date(),
        },
      }
    )

    if (resultat.matchedCount === 0) {
      return NextResponse.json(
        { succes: false, erreur: 'Classe non trouvée' },
        { status: 404 }
      )
    }

    // Invalider le cache après modification
    invalidateCacheAfterChange('classe')

    const classeMiseAJour = await classesCollection
      .aggregate([
        { $match: { _id: new ObjectId(id) } },
        {
          $lookup: {
            from: 'etablissements',
            localField: 'etablissementId',
            foreignField: '_id',
            as: 'etablissement',
          },
        },
        { $unwind: { path: '$etablissement', preserveNullAndEmptyArrays: true } },
      ])
      .next()

    return NextResponse.json({
      succes: true,
      donnees: serializeOptionalDocument(classeMiseAJour),
      message: 'Classe modifiée avec succès',
    })
  } catch (erreur) {
    console.error('Erreur PUT classe:', erreur)
    return NextResponse.json(
      { succes: false, erreur: 'Erreur lors de la modification' },
      { status: 500 }
    )
  }
}

/* -------------------------------------------------------------------------- */
/*                                  DELETE                                    */
/* -------------------------------------------------------------------------- */

export async function DELETE(
  _requete: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const classesCollection = await getCollection('classes')
    const elevesCollection = await getCollection('eleves')

    // Vérifier les élèves liés - classeId peut être string ou ObjectId
    const objectId = new ObjectId(id)
    const elevesLies = await elevesCollection.countDocuments({
      $or: [
        { classeId: objectId },
        { classeId: id },
      ],
    })

    if (elevesLies > 0) {
      return NextResponse.json(
        {
          succes: false,
          erreur: 'Impossible de supprimer : des élèves sont inscrits dans cette classe',
        },
        { status: 400 }
      )
    }

    const resultat = await classesCollection.deleteOne({
      _id: new ObjectId(id),
    })

    // Invalider le cache après suppression
    invalidateCacheAfterChange('classe')

    if (resultat.deletedCount === 0) {
      return NextResponse.json(
        { succes: false, erreur: 'Classe non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      succes: true,
      message: 'Classe supprimée avec succès',
    })
  } catch (erreur) {
    console.error('Erreur DELETE classe:', erreur)
    return NextResponse.json(
      { succes: false, erreur: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}
