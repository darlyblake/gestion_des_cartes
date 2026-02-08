/**
 * Composant d'accessibilité pour focus management
 * - Skip to main content link
 * - Focus trap dans modales
 * - Gestion du focus au retour
 */

'use client'

import { useEffect, useRef, useCallback } from 'react'

interface FocusTrapProps {
  active: boolean
  onEscape?: () => void
  children: React.ReactNode
}

/**
 * Focus Trap pour les modales
 * Empêche le focus de sortir de la modale via Tab
 */
export function FocusTrap({ active, onEscape, children }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active || !containerRef.current) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        onEscape()
        return
      }

      if (e.key !== 'Tab') return

      const focusableElements = containerRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )

      if (!focusableElements || focusableElements.length === 0) return

      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
      const activeElement = document.activeElement

      if (e.shiftKey) {
        if (activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [active, onEscape])

  return <div ref={containerRef}>{children}</div>
}

/**
 * Skip to Main Content Link (conformité WCAG)
 * Visible au focus, permettant aux utilisateurs clavier de sauter la navigation
 */
export function SkipLink() {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const main = document.querySelector('main')
    if (main) {
      main.tabIndex = -1
      main.focus()
      main.scrollIntoView()
    }
  }

  return (
    <a
      href="#main-content"
      onClick={handleClick}
      className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-50 focus:bg-primary focus:text-white focus:px-4 focus:py-2"
    >
      Aller au contenu principal
    </a>
  )
}

/**
 * Hook pour restaurer le focus après la fermeture d'une modale
 */
export function useFocusRestore() {
  const triggerRef = useRef<HTMLElement | null>(null)

  const openModal = (element: HTMLElement) => {
    triggerRef.current = element
  }

  const closeModal = () => {
    if (triggerRef.current) {
      triggerRef.current.focus()
      triggerRef.current = null
    }
  }

  return { openModal, closeModal }
}

/**
 * Provider d'accessibilité pour l'app
 * À ajouter en haut de l'app pour support global
 */
export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />
      <main id="main-content">{children}</main>
    </>
  )
}
