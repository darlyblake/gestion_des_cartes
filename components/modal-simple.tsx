/**
 * Modal simple et centrée utilisée pour confirmer les suppressions.
 * Intégrée avec gestion d'accessibilité (focus trap & management)
 */

'use client'

import { createPortal } from 'react-dom'
import { useRef, useEffect } from 'react'
import { FocusTrap } from './accessibility'

interface ModalSimpleProps {
  ouvert: boolean
  onFermer: () => void
  onConfirmer: () => void
  titre: string
  description?: string
  confirmText?: string
  enChargement?: boolean
}

export function ModalSimple({
  ouvert,
  onFermer,
  onConfirmer,
  titre,
  description,
  confirmText = 'Supprimer',
  enChargement = false,
}: ModalSimpleProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  // Gestion du focus au fermeture
  useEffect(() => {
    if (ouvert && dialogRef.current) {
      // Stocker l'élément qui avait le focus avant
      const previousActiveElement = document.activeElement as HTMLElement
      
      // Donner le focus au titre
      const titleElement = dialogRef.current.querySelector('#confirm-title')
      ;(titleElement as HTMLElement)?.focus?.()

      return () => {
        // Restaurer le focus quand la modal se ferme
        previousActiveElement?.focus?.()
      }
    }
  }, [ouvert])

  if (!ouvert || typeof document === 'undefined') return null

  return createPortal(
    <FocusTrap active={ouvert} onEscape={onFermer}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        ref={dialogRef}
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.45)',
          zIndex: 99998,
          padding: 16,
        }}
      >
        <div
          style={{
            width: 'min(480px, 95%)',
            background: 'var(--background, #fff)',
            color: 'var(--foreground, #111827)',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            padding: '1rem 1.25rem',
          }}
        >
          <h3 
            id="confirm-title" 
            tabIndex={-1}
            style={{ margin: 0, marginBottom: 8, fontSize: 18 }}
          >
            {titre}
          </h3>
          {description && (
            <p style={{ margin: 0, marginBottom: 12, color: 'var(--muted, #6b7280)' }}>{description}</p>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
            <button
              type="button"
              onClick={onFermer}
              disabled={enChargement}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: 6,
                border: '1px solid rgba(0,0,0,0.08)',
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={onConfirmer}
              disabled={enChargement}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: 6,
                border: 'none',
                background: 'var(--color-destructive, #dc2626)',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              {enChargement ? 'Suppression...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </FocusTrap>,
    document.body
  )
}
