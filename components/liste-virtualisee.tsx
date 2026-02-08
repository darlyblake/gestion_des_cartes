/**
 * Composantes pour optimiser le rendu de listes longues
 * Option 1: Pagination simple (recommandé pour plupart des cas)
 * Option 2: Virtual scrolling (pour 5000+ items)
 */

'use client'

import { ReactNode, useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ListePagineeProps<T> {
  items: T[]
  itemsPerPage?: number
  renderItem: (item: T, index: number) => ReactNode
  className?: string
}

/**
 * Composant liste paginée - meilleure performance que virtualization pour UI simple
 * Usage: <ListePaginee items={eleves} itemsPerPage={20} renderItem={(item) => <div>{item.nom}</div>} />
 */
export function ListePaginee<T>({
  items,
  itemsPerPage = 50,
  renderItem,
  className = '',
}: ListePagineeProps<T>) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(items.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const displayedItems = items.slice(startIdx, startIdx + itemsPerPage)

  return (
    <div className={className}>
      <div className="space-y-4">
        {displayedItems.map((item, idx) => (
          <div key={startIdx + idx}>{renderItem(item, startIdx + idx)}</div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="text-sm text-gray-600">
            Page {currentPage} sur {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}


/**
 * Hook utilitaire pour paginer au lieu de virtualiser
 * Plus simple que virtual scrolling pour plupart des cas
 * À utiliser avec useState en composant client
 */
export function getPaginatedItems<T>(
  items: T[],
  page: number,
  itemsPerPage: number = 50
) {
  const totalPages = Math.ceil(items.length / itemsPerPage)
  const start = (page - 1) * itemsPerPage
  const end = start + itemsPerPage
  const paginatedItems = items.slice(start, end)

  return {
    items: paginatedItems,
    page,
    totalPages,
    itemsPerPage,
  }
}

