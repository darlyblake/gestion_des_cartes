/**
 * Route API de diagnostic pour vérifier l'état du cache
 * GET /api/cache-stats - Affiche les statistiques du cache
 */

import { NextResponse } from 'next/server'
import { apiCache } from '@/lib/services/api-cache'

export async function GET() {
  try {
    const stats = apiCache.stats()

    return NextResponse.json({
      succes: true,
      cache: {
        status: 'online',
        totalEntrees: stats.totalEntrees,
        tailleEnBytes: stats.tailleEnBytes,
        tailleEnMB: (stats.tailleEnBytes / 1024 / 1024).toFixed(2),
        message: 'Cache en mémoire actif',
      },
      ttls: {
        etablissements: '5 minutes',
        classes: '3 minutes',
        eleves: '2 minutes',
        personnel: '2 minutes',
      },
    })
  } catch (erreur) {
    console.error('Erreur lors de la récupération des stats du cache:', erreur)
    return NextResponse.json(
      { succes: false, erreur: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
