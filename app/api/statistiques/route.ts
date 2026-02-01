/**
 * Route API pour les statistiques du dashboard
 * GET - Récupère les statistiques globales
 */

import { NextResponse } from 'next/server'
import { getCollection } from '@/lib/services/mongodb'

/**
 * GET /api/statistiques
 * Récupère les statistiques du dashboard depuis MongoDB
 */
export async function GET() {
  try {
    const etablissementsCollection = await getCollection('etablissements')
    const classesCollection = await getCollection('classes')
    const elevesCollection = await getCollection('eleves')

    // Calcul des statistiques depuis MongoDB
    const totalEtablissements = await etablissementsCollection.countDocuments()
    const totalClasses = await classesCollection.countDocuments()
    const totalEleves = await elevesCollection.countDocuments()

    const statistiques = {
      totalEtablissements,
      totalClasses,
      totalEleves,
      cartesGenerees: totalEleves, // Les cartes générées = nombre d'élèves
    }

    return NextResponse.json({
      succes: true,
      donnees: statistiques,
    })
  } catch (erreur) {
    console.error('Erreur lors de la récupération des statistiques:', erreur)
    return NextResponse.json(
      { succes: false, erreur: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
