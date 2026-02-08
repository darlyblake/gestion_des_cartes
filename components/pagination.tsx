/**
 * Composant Pagination
 * Affiche les contrôles de pagination avec boutons précédent/suivant
 */

import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Props du composant Pagination
 */
interface PaginationProps {
  /** Page actuelle (1-indexed) */
  pageActuelle: number
  /** Nombre total de pages */
  totalPages: number
  /** Fonction appelée au changement de page */
  onChangerPage: (page: number) => void
  /** État de chargement */
  enChargement?: boolean
}

/**
 * Composant de Pagination
 */
export function Pagination({
  pageActuelle,
  totalPages,
  onChangerPage,
  enChargement = false,
}: PaginationProps) {
  const peutAller = (page: number) => page >= 1 && page <= totalPages

  const genererPages = (): (number | string)[] => {
    const pages: (number | string)[] = []
    const afficherMax = 5
    const demiPage = Math.floor(afficherMax / 2)

    let debut = Math.max(1, pageActuelle - demiPage)
    let fin = Math.min(totalPages, debut + afficherMax - 1)

    // Ajuster début si on est près de la fin
    if (fin - debut < afficherMax - 1) {
      debut = Math.max(1, fin - afficherMax + 1)
    }

    // Page 1
    if (debut > 1) {
      pages.push(1)
      if (debut > 2) {
        pages.push('...')
      }
    }

    // Pages intermédiaires
    for (let i = debut; i <= fin; i++) {
      pages.push(i)
    }

    // Dernière page
    if (fin < totalPages) {
      if (fin < totalPages - 1) {
        pages.push('...')
      }
      pages.push(totalPages)
    }

    return pages
  }

  const pages = genererPages()

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {/* Bouton Précédent */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChangerPage(pageActuelle - 1)}
        disabled={!peutAller(pageActuelle - 1) || enChargement}
        aria-label="Page précédente"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Numéros de page */}
      <div className="flex gap-1">
        {pages.map((page, idx) => {
          if (page === '...') {
            return (
              <span key={`dots-${idx}`} className="px-2 py-1 text-muted-foreground">
                {page}
              </span>
            )
          }

          return (
            <Button
              key={page}
              variant={pageActuelle === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => onChangerPage(page as number)}
              disabled={enChargement}
              aria-current={pageActuelle === page ? 'page' : undefined}
              className={cn(
                'h-8 w-8 p-0',
                pageActuelle === page && 'cursor-default'
              )}
            >
              {page}
            </Button>
          )
        })}
      </div>

      {/* Bouton Suivant */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChangerPage(pageActuelle + 1)}
        disabled={!peutAller(pageActuelle + 1) || enChargement}
        aria-label="Page suivante"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Info pagination */}
      <span className="hidden text-sm text-muted-foreground sm:inline">
        Page {pageActuelle} sur {totalPages}
      </span>
    </div>
  )
}

/**
 * Props du composant PaginationInfo
 */
interface PaginationInfoProps {
  /** Nombre d'éléments actuels */
  itemsActuels: number
  /** Nombre total d'éléments */
  totalItems: number
  /** Éléments par page */
  itemsParPage: number
  /** Page actuelle */
  pageActuelle: number
}

/**
 * Affiche les informations de pagination (ex: "1-50 sur 1234")
 */
export function PaginationInfo({
  itemsActuels,
  totalItems,
  itemsParPage,
  pageActuelle,
}: PaginationInfoProps) {
  const debut = (pageActuelle - 1) * itemsParPage + 1
  const fin = Math.min(pageActuelle * itemsParPage, totalItems)

  return (
    <p className="text-sm text-muted-foreground">
      Affichage <span className="font-medium">{debut}</span> à{' '}
      <span className="font-medium">{fin}</span> sur{' '}
      <span className="font-medium">{totalItems}</span> entrées
    </p>
  )
}
