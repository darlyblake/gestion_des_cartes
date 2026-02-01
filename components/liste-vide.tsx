'use client';

/**
 * Composant Liste Vide
 * Affiche un message quand une liste est vide
 */

import { Button } from '@/components/ui/button'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Props du composant ListeVide
 */
interface ListeVideProps {
  /** Icône à afficher */
  icone: LucideIcon
  /** Titre du message */
  titre: string
  /** Description du message */
  description?: string
  /** Texte du bouton d'action */
  texteAction?: string
  /** Fonction appelée lors du clic sur le bouton */
  onAction?: () => void
  /** Classes CSS additionnelles */
  className?: string
}

/**
 * Composant d'affichage pour une liste vide
 */
export function ListeVide({
  icone: Icone,
  titre,
  description,
  texteAction,
  onAction,
  className,
}: ListeVideProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center',
      className
    )}>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Icone className="h-7 w-7 text-muted-foreground" />
      </div>
      
      <h3 className="mt-4 text-lg font-semibold">{titre}</h3>
      
      {description && (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      
      {texteAction && onAction && (
        <Button 
          onClick={onAction} 
          className="mt-4"
        >
          {texteAction}
        </Button>
      )}
    </div>
  )
}
