/**
 * Modal simple avec lazy loading pour optimiser le bundle
 * Utilise Next.js dynamic import pour charger la modal uniquement quand nécessaire
 */

'use client'

import { lazy, Suspense } from 'react'
import { Loader2 } from 'lucide-react'

// Import dynamique de la modal
const ModalSimpleLazy = lazy(() => 
  import('../modal-simple').then(module => ({ 
    default: module.ModalSimple 
  }))
)

interface ModalSimpleProps {
  ouvert: boolean
  onFermer: () => void
  onConfirmer: () => void
  titre: string
  description?: string
  confirmText?: string
  enChargement?: boolean
}

// Composant de chargement pour la modal
function ModalLoader() {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Chargement..."
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
          width: 'min(320px, 95%)',
          background: 'var(--background, #fff)',
          color: 'var(--foreground, #111827)',
          borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <Loader2 
          style={{ 
            width: 32, 
            height: 32, 
            animation: 'spin 1s linear infinite',
            color: 'var(--color-primary, #1e40af)'
          }} 
        />
        <div style={{ textAlign: 'center', fontSize: 14, color: 'var(--muted, #6b7280)' }}>
          Chargement...
        </div>
      </div>
    </div>
  )
}

// Wrapper avec lazy loading
export function LazyModalSimple(props: ModalSimpleProps) {
  if (!props.ouvert) return null

  return (
    <Suspense fallback={<ModalLoader />}>
      <ModalSimpleLazy {...props} />
    </Suspense>
  )
}

// Export du type pour TypeScript
export type { ModalSimpleProps }
