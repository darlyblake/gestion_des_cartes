/**
 * Route API pour un établissement spécifique
 * GET - Récupère un établissement par son ID
 * PUT - Modifie un établissement
 * DELETE - Supprime un établissement
 */

import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getCollection } from '@/lib/services/mongodb'
import type { ModifierEtablissementDonnees } from '@/lib/types'
import { serializeDocument, serializeDocuments, serializeOptionalDocument } from '@/lib/services/serializers'

/**
 * GET /api/etablissements/[id]
 * Récupère un établissement par son ID
 */
export async function GET(
  _requete: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const etablissementsCollection = await getCollection('etablissements')
    const classesCollection = await getCollection('classes')
    const elevesCollection = await getCollection('eleves')

    const etablissement = await etablissementsCollection.findOne({
      _id: new ObjectId(id),
    })

    if (!etablissement) {
      return NextResponse.json(
        { succes: false, erreur: 'Établissement non trouvé' },
        { status: 404 }
      )
    }

    // Récupération des classes associées
    const classesEtablissement = await classesCollection
      .find({ etablissementId: new ObjectId(id) })
      .toArray()

    // Compte des élèves
    let totalEleves = 0
    for (const classe of classesEtablissement) {
      const count = await elevesCollection.countDocuments({
        classeId: classe._id,
      })
      totalEleves += count
    }

    return NextResponse.json({
      succes: true,
      donnees: {
        ...serializeDocument(etablissement),
        nombreClasses: classesEtablissement.length,
        nombreEleves: totalEleves,
        classes: serializeDocuments(classesEtablissement),
      },
    })
  } catch (erreur) {
    console.error('Erreur lors de la récupération de l\'établissement:', erreur)
    return NextResponse.json(
      { succes: false, erreur: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/etablissements/[id]
 * Modifie un établissement existant
 */
export async function PUT(
  requete: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const donnees: ModifierEtablissementDonnees = await requete.json()
    const etablissementsCollection = await getCollection('etablissements')

    // Mise à jour de l'établissement
    const resultat = await etablissementsCollection.updateOne(
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
        { succes: false, erreur: 'Établissement non trouvé' },
        { status: 404 }
      )
    }

    // Récupérer l'établissement mis à jour
    const etablissementMisAJour = await etablissementsCollection.findOne({
      _id: new ObjectId(id),
    })

    return NextResponse.json({
      succes: true,
      donnees: serializeOptionalDocument(etablissementMisAJour),
      message: 'Établissement modifié avec succès',
    })
  } catch (erreur) {
    console.error('Erreur lors de la modification de l\'établissement:', erreur)
    return NextResponse.json(
      { succes: false, erreur: 'Erreur lors de la modification' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/etablissements/[id]
 * Supprime un établissement
 */
export async function DELETE(
  _requete: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const etablissementsCollection = await getCollection('etablissements')
    const classesCollection = await getCollection('classes')

    // Vérification des classes liées
    const classesLiees = await classesCollection.countDocuments({
      etablissementId: new ObjectId(id),
    })

    if (classesLiees > 0) {
      return NextResponse.json(
        { succes: false, erreur: 'Impossible de supprimer: des classes sont liées à cet établissement' },
        { status: 400 }
      )
    }

    // Suppression de l'établissement
    const resultat = await etablissementsCollection.deleteOne({
      _id: new ObjectId(id),
    })

    if (resultat.deletedCount === 0) {
      return NextResponse.json(
        { succes: false, erreur: 'Établissement non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      succes: true,
      message: 'Établissement supprimé avec succès',
    })
  } catch (erreur) {
    console.error('Erreur lors de la suppression de l\'établissement:', erreur)
    return NextResponse.json(
      { succes: false, erreur: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}
