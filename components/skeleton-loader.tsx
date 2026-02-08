/**
 * Composant Skeleton Loader
 * Affiche un placeholder animé pendant le chargement
 * Remplace les spinners génériques par une structure réelle
 */

import { cn } from '@/lib/utils'

/**
 * Props du composant Skeleton
 */
interface SkeletonProps {
  className?: string
}

/**
 * Composant Skeleton basique
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200',
        className
      )}
    />
  )
}

/**
 * Skeleton pour une ligne de table
 */
export function SkeletonTableRow() {
  return (
    <tr className="border-b border-gray-200">
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-32" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-28" />
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </td>
    </tr>
  )
}

/**
 * Skeleton pour une carte
 */
export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-gray-200 p-4 space-y-3">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-20 rounded" />
        <Skeleton className="h-8 w-20 rounded" />
      </div>
    </div>
  )
}

/**
 * Skeleton pour un formulaire
 */
export function SkeletonForm() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
      <div className="flex gap-2 pt-4">
        <Skeleton className="h-10 w-24 rounded-md" />
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>
    </div>
  )
}

/**
 * Skeleton pour une liste
 */
export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-md" />
      ))}
    </div>
  )
}

/**
 * Skeleton pour une photo
 */
export function SkeletonAvatar() {
  return (
    <Skeleton className="h-12 w-12 rounded-full" />
  )
}

/**
 * Composant de chargement page entière avec skeleton adapté
 */
export function ChargementPageAvecSkeleton({ 
  type = 'list',
  message = 'Chargement...',
  count = 5,
}: { 
  type?: 'list' | 'form' | 'card'
  message?: string
  count?: number
}) {
  return (
    <div className="flex h-full w-full flex-col gap-4 p-4">
      {message && (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
          <span className="text-sm text-muted-foreground">{message}</span>
        </div>
      )}
      
      {type === 'list' && <SkeletonList count={count} />}
      {type === 'form' && <SkeletonForm />}
      {type === 'card' && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}
    </div>
  )
}
