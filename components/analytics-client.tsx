/**
 * Composant client pour charger l'Analytics de Vercel de façon différée
 * Utilise next/dynamic pour éviter de bloquer le rendu initial
 */

'use client'

import dynamic from 'next/dynamic'

// Charger l'Analytics de manière lazy et sans SSR
const Analytics = dynamic(
  () => import('@vercel/analytics/next').then(mod => mod.Analytics),
  { ssr: false }
)

export function AnalyticsClient() {
  return <Analytics />
}
