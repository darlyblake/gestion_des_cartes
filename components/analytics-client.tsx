/**
 * Composant client pour charger l'Analytics de Vercel de façon différée
 * Utilise next/dynamic pour éviter de bloquer le rendu initial
 */

'use client'

import { Analytics } from '@vercel/analytics/react'

export function AnalyticsClient() {
  return <Analytics />
}
