/**
 * Composant d'indicateur de chargement
 * Affiche un spinner animé pendant les chargements
 */

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

/**
 * Props du composant Chargement
 */
interface ChargementProps {
  /** Taille du spinner */
  taille?: 'petit' | 'moyen' | 'grand'
  /** Message à afficher */
  message?: string
  /** Classes CSS additionnelles */
  className?: string
  /** Afficher en plein écran */
  pleinEcran?: boolean
}

/**
 * Composant Chargement avec spinner
 */
export function Chargement({ 
  taille = 'moyen', 
  message,
  className,
  pleinEcran = false,
}: ChargementProps) {
  // Tailles du spinner
  const taillesSpinner = {
    petit: 'h-4 w-4',
    moyen: 'h-8 w-8',
    grand: 'h-12 w-12',
  }

  const contenu = (
    <div className={cn(
      'flex flex-col items-center justify-center gap-3',
      className
    )}>
      <Loader2 
        className={cn(
          'animate-spin text-primary',
          taillesSpinner[taille]
        )} 
      />
      {message && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {message}
        </p>
      )}
    </div>
  )

  // Affichage plein écran
  if (pleinEcran) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {contenu}
      </div>
    )
  }

  return contenu
}

/**
 * Composant de chargement pour une page entière
 */
export function ChargementPage({ message = 'Chargement...' }: { message?: string }) {
  return (
    <div className="flex h-[50vh] w-full items-center justify-center">
      <Chargement taille="grand" message={message} />
    </div>
  )
}
