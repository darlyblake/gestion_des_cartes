/**
 * Composant de transitions de page
 * Fournit des animations fluides entre les pages
 */

'use client'

import React, { ReactNode } from 'react'

/**
 * Styles CSS pour les transitions
 */
const transitionStyles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .page-transition-fade {
    animation: fadeIn 0.3s ease-in-out;
  }

  .page-transition-up {
    animation: slideInUp 0.3s ease-out;
  }

  .page-transition-down {
    animation: slideInDown 0.3s ease-out;
  }

  .page-exit-fade {
    animation: fadeIn 0.2s ease-in-out reverse;
  }
`

/**
 * Props du composant PageTransition
 */
interface PageTransitionProps {
  /** Contenu de la page */
  children: ReactNode
  /** Type de transition: fade, slideUp, slideDown */
  type?: 'fade' | 'slideUp' | 'slideDown'
  /** Classe CSS additionnelle */
  className?: string
}

/**
 * Wrapper pour les transitions de page
 */
export function PageTransition({
  children,
  type = 'fade',
  className = '',
}: PageTransitionProps) {
  const typeMap = {
    fade: 'page-transition-fade',
    slideUp: 'page-transition-up',
    slideDown: 'page-transition-down',
  }

  React.useEffect(() => {
    // Injecter les styles si pas déjà présents
    if (!document.getElementById('page-transition-styles')) {
      const style = document.createElement('style')
      style.id = 'page-transition-styles'
      style.textContent = transitionStyles
      document.head.appendChild(style)
    }
  }, [])

  return (
    <div className={`${typeMap[type]} ${className}`}>
      {children}
    </div>
  )
}

/**
 * Props du composant PageLayout
 */
interface PageLayoutProps {
  /** Contenu */
  children: ReactNode
  /** Type de transition */
  transition?: 'fade' | 'slideUp' | 'slideDown'
}

/**
 * Layout de page avec transition
 */
export function PageLayout({
  children,
  transition = 'fadeSlideUp',
}: {
  children: ReactNode
  transition?: string
}) {
  return (
    <PageTransition type="slideUp">
      {children}
    </PageTransition>
  )
}

/**
 * Hook pour déclencher une transition
 */
export function usePageTransition() {
  const [isTransitioning, setIsTransitioning] = React.useState(false)

  const triggerTransition = React.useCallback(async (callback: () => void) => {
    setIsTransitioning(true)
    
    // Attendre la fin de l'animation (300ms)
    await new Promise(resolve => setTimeout(resolve, 300))
    
    callback()
    
    setIsTransitioning(false)
  }, [])

  return { isTransitioning, triggerTransition }
}

/**
 * Composant wrapper avec feedback visuel pendant transition
 */
export function TransitionWrapper({
  children,
  isLoading = false,
}: {
  children: ReactNode
  isLoading?: boolean
}) {
  return (
    <div
      className={`transition-opacity duration-200 ${
        isLoading ? 'opacity-60 pointer-events-none' : 'opacity-100'
      }`}
    >
      {children}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-auto">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary" />
        </div>
      )}
    </div>
  )
}

/**
 * Classe CSS pour appliquer aux composants
 * Idéale pour les changements de page
 */
export const pageTransitionClass = {
  enter: 'animate-fade-in duration-300',
  exit: 'animate-fade-out duration-200',
}
