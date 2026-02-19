/**
 * Route API pour un élève spécifique
 * GET - Récupère un élève par son ID
 * PUT - Modifie un élève
 * DELETE - Supprime un élève
 */

import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getCollection } from '@/lib/services/mongodb'
import type { ModifierEleveDonnees } from '@/lib/types'
import { serializeDocument, serializeReference } from '@/lib/services/serializers'
import { invalidateCacheAfterChange } from '@/lib/services/api-cache'

/**
 * GET /api/eleves/[id]
 * Récupère un élève par son ID avec sa classe et son établissement
 */
export async function GET(
  _requete: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { succes: false, erreur: 'Identifiant invalide' },
        { status: 400 }
      )
    }
    const elevesCollection = await getCollection('eleves')

    const eleve = await elevesCollection
      .aggregate([
        { $match: { _id: new ObjectId(id) } },
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
      .next()

    if (!eleve) {
      return NextResponse.json(
        { succes: false, erreur: 'Élève non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      succes: true,
      donnees: {
        ...serializeDocument(eleve),
        classeId: serializeReference(eleve.classeId),
        classe: eleve.classe
          ? {
              ...serializeDocument(eleve.classe),
              etablissementId: serializeReference(eleve.classe.etablissementId),
            }
          : undefined,
        etablissement: eleve.etablissement ? serializeDocument(eleve.etablissement) : undefined,
      },
    })
  } catch (erreur) {
    console.error('Erreur lors de la récupération de l\'élève:', erreur)
    return NextResponse.json(
      { succes: false, erreur: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(
  requete: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { succes: false, erreur: 'Identifiant invalide' },
        { status: 400 }
      )
    }
    const donnees: ModifierEleveDonnees = await requete.json()
    const elevesCollection = await getCollection('eleves')
    const classesCollection = await getCollection('classes')

    // Vérification de la classe si modifiée
    let classeExiste = null
    if (donnees.classeId) {
      classeExiste = await classesCollection.findOne({
        _id: new ObjectId(donnees.classeId),
      })
      if (!classeExiste) {
        return NextResponse.json(
          { succes: false, erreur: 'La classe spécifiée n\'existe pas' },
          { status: 400 }
        )
      }
    }

    // Mise à jour de l'élève
    const updates: Record<string, unknown> = {
      ...donnees,
      modifieLe: new Date(),
    }

    if (donnees.nom) {
      updates.nom = donnees.nom.toUpperCase()
    }

    if (donnees.dateNaissance) {
      updates.dateNaissance = new Date(donnees.dateNaissance)
    }

    if (donnees.classeId) {
      updates.classeId = new ObjectId(donnees.classeId)
    }

    const resultat = await elevesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    )

    if (resultat.matchedCount === 0) {
      return NextResponse.json(
        { succes: false, erreur: 'Élève non trouvé' },
        { status: 404 }
      )
    }

    // Invalider le cache après modification
    invalidateCacheAfterChange('eleve')

    // Récupérer l'élève mis à jour
    const eleveMisAJour = await elevesCollection
      .aggregate([
        { $match: { _id: new ObjectId(id) } },
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
      .next()

    return NextResponse.json({
      succes: true,
      donnees: eleveMisAJour
        ? {
            ...serializeDocument(eleveMisAJour),
            classeId: serializeReference(eleveMisAJour.classeId),
            classe: eleveMisAJour.classe
              ? {
                  ...serializeDocument(eleveMisAJour.classe),
                  etablissementId: serializeReference(eleveMisAJour.classe.etablissementId),
                }
              : undefined,
            etablissement: eleveMisAJour.etablissement ? serializeDocument(eleveMisAJour.etablissement) : undefined,
          }
        : undefined,
      message: 'Élève modifié avec succès',
    })
  } catch (erreur) {
    console.error('Erreur lors de la modification de l\'élève:', erreur)
    return NextResponse.json(
      { succes: false, erreur: 'Erreur lors de la modification' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/eleves/[id]
 * Supprime un élève
 */
export async function DELETE(
  _requete: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('🗑️ DELETE /api/eleves/[id]: id reçu =', id, '| isValid =', ObjectId.isValid(id))
    
    if (!ObjectId.isValid(id)) {
      console.warn('❌ Tentative de suppression avec ID invalide:', id)
      return NextResponse.json(
        { succes: false, erreur: 'Identifiant invalide' },
        { status: 400 }
      )
    }
    const elevesCollection = await getCollection('eleves')

    const resultat = await elevesCollection.deleteOne({
      _id: new ObjectId(id),
    })
    
    console.log('🗑️ DELETE /api/eleves/[id]: deleteOne result =', { deletedCount: resultat.deletedCount })

    if (resultat.deletedCount === 0) {
      console.warn('⚠️ Élève non trouvé pour suppression, id =', id)
      return NextResponse.json(
        { succes: false, erreur: 'Élève non trouvé' },
        { status: 404 }
      )
    }

    // Invalider le cache après suppression
    invalidateCacheAfterChange('eleve')

    return NextResponse.json({
      succes: true,
      message: 'Élève supprimé avec succès',
    })
  } catch (erreur) {
    console.error('Erreur lors de la suppression de l\'élève:', erreur)
    return NextResponse.json(
      { succes: false, erreur: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}
