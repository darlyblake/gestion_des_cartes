/**
 * Loader moderne – Cartes scolaires & professionnelles
 * Animation 100% CSS, design institutionnel fluide
 */

'use client'

import { cn } from '@/lib/utils'

interface ChargementProps {
  message?: string
  pleinEcran?: boolean
  className?: string
}

export function Chargement({
  message = 'Chargement en cours',
  pleinEcran = false,
  className,
}: ChargementProps) {
  const contenu = (
    <div className={cn('loader-container', className)}>
      <div className="loader-card-wrapper">
        <div className="loader-glow" />
        <div className="loader-card">
          <span className="loader-avatar" />
          <span className="loader-line short" />
          <span className="loader-line" />
        </div>
        <span className="loader-badge" />
      </div>

      <div className="loader-text">
        <span>{message}</span>
        <span className="dots">
          <i>.</i><i>.</i><i>.</i>
        </span>
      </div>

      <p className="loader-sub">
        Vérification et sécurisation des données
      </p>
    </div>
  )

  if (pleinEcran) {
    return (
      <div className="loader-overlay">
        {contenu}
      </div>
    )
  }

  return contenu
}

/**
 * Chargement plein écran pour les pages
 */
export function ChargementPage({
  message = 'Chargement de la plateforme',
}: {
  message?: string
}) {
  return (
    <div className="loader-page">
      <Chargement message={message} />
    </div>
  )
}
