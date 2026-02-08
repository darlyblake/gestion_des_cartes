/**
 * Composant Carte Statistique
 * Affiche une statistique avec son icône et sa valeur
 */

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

/**
 * Props du composant CarteStatistique
 */
interface CarteStatistiqueProps {
  /** Titre de la statistique */
  titre: string
  /** Valeur de la statistique */
  valeur: number | string
  /** Description ou sous-titre */
  description?: string
  /** Icône à afficher */
  icone: LucideIcon
  /** Couleur de fond de l'icône */
  couleurIcone?: 'bleu' | 'vert' | 'orange' | 'violet'
  /** Tendance (optionnel) */
  tendance?: {
    valeur: number
    estPositif: boolean
  }
}

/**
 * Composant Carte Statistique pour le dashboard
 */
export const CarteStatistique = React.memo(function CarteStatistique({
  titre,
  valeur,
  description,
  icone: Icone,
  couleurIcone = 'bleu',
  tendance,
}: CarteStatistiqueProps) {
  // Classes de couleur pour l'icône
  const couleursIcone = {
    bleu: 'bg-blue-100 text-blue-600',
    vert: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    violet: 'bg-purple-100 text-purple-600',
  }

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {titre}
        </CardTitle>
        <div className={cn(
          'flex h-9 w-9 items-center justify-center rounded-lg',
          couleursIcone[couleurIcone]
        )}>
          <Icone className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">{valeur}</span>
          {tendance && (
            <span className={cn(
              'text-sm font-medium',
              tendance.estPositif ? 'text-green-600' : 'text-red-600'
            )}>
              {tendance.estPositif ? '+' : ''}{tendance.valeur}%
            </span>
          )}
        </div>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
})
