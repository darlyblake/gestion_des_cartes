/**
 * Composant Progress Indicator
 * Affiche une barre de progression avec pourcentage et message
 */

import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

/**
 * Props du composant ProgressIndicator
 */
interface ProgressIndicatorProps {
  /** Pourcentage de progression (0-100) */
  progression: number
  /** Label ou message */
  label?: string
  /** État: loading, success, error */
  etat?: 'loading' | 'success' | 'error'
  /** Afficher le pourcentage */
  afficherPourcentage?: boolean
  /** Classe CSS additionnelle */
  className?: string
  /** Texte personnalisé pour la description */
  description?: string
}

/**
 * Composant indicateur de progression
 */
export function ProgressIndicator({
  progression,
  label,
  etat = 'loading',
  afficherPourcentage = true,
  className,
  description,
}: ProgressIndicatorProps) {
  // Assurer que la progression est entre 0 et 100
  const progressionNormalisee = Math.min(Math.max(progression, 0), 100)

  const iconeEtat = {
    loading: <Loader2 className="h-5 w-5 animate-spin text-primary" />,
    success: <CheckCircle2 className="h-5 w-5 text-green-600" />,
    error: <AlertCircle className="h-5 w-5 text-red-600" />,
  }

  const couleurFond = {
    loading: 'bg-blue-50',
    success: 'bg-green-50',
    error: 'bg-red-50',
  }

  return (
    <div className={cn(
      'rounded-lg p-4',
      couleurFond[etat],
      className
    )}>
      {/* En-tête */}
      {label && (
        <div className="mb-3 flex items-center gap-2">
          {iconeEtat[etat]}
          <span className="font-medium text-sm">{label}</span>
        </div>
      )}

      {/* Barre de progression */}
      <div className="space-y-2">
        <Progress value={progressionNormalisee} className="h-2" />

        {/* Info pourcentage */}
        {afficherPourcentage && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {description || 'Progression'}
            </span>
            <span className="text-xs font-medium">
              {progressionNormalisee}%
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Props du composant ProgressSteps
 */
interface ProgressStepsProps {
  /** Liste des étapes */
  etapes: {
    id: string
    label: string
  }[]
  /** Index de l'étape actuelle */
  etapeActuelle: number
  /** Classe CSS additionnelle */
  className?: string
}

/**
 * Affiche les étapes de progression (1, 2, 3...)
 */
export function ProgressSteps({
  etapes,
  etapeActuelle,
  className,
}: ProgressStepsProps) {
  const pourcentageCompletion = ((etapeActuelle + 1) / etapes.length) * 100

  return (
    <div className={cn('space-y-4', className)}>
      {/* Barre principale */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">
            Étape {etapeActuelle + 1} sur {etapes.length}
          </span>
          <span className="text-xs text-muted-foreground">
            {Math.round(pourcentageCompletion)}%
          </span>
        </div>
        <Progress value={pourcentageCompletion} className="h-2" />
      </div>

      {/* Étapes */}
      <div className="flex gap-2">
        {etapes.map((etape, idx) => {
          const isCompleted = idx < etapeActuelle
          const isCurrent = idx === etapeActuelle
          const isUpcoming = idx > etapeActuelle

          return (
            <div key={etape.id} className="flex flex-1 items-center gap-2">
              {/* Cercle étape */}
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors',
                  isCompleted && 'bg-green-600 text-white',
                  isCurrent && 'bg-primary text-white ring-2 ring-primary ring-offset-2',
                  isUpcoming && 'bg-gray-200 text-muted-foreground'
                )}
              >
                {isCompleted ? '✓' : idx + 1}
              </div>

              {/* Ligne vers étape suivante */}
              {idx < etapes.length - 1 && (
                <div
                  className={cn(
                    'h-1 flex-1 rounded',
                    isCompleted ? 'bg-green-600' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Labels des étapes (optionnel, affichage responsive) */}
      <div className="hidden sm:flex justify-between text-xs">
        {etapes.map((etape, idx) => (
          <span
            key={etape.id}
            className={cn(
              'font-medium',
              idx < etapeActuelle && 'text-green-600',
              idx === etapeActuelle && 'text-primary',
              idx > etapeActuelle && 'text-muted-foreground'
            )}
          >
            {etape.label}
          </span>
        ))}
      </div>
    </div>
  )
}

/**
 * Props pour LinearProgress
 */
interface LinearProgressProps {
  /** Valeur en pourcentage */
  value: number
  /** Max value (default 100) */
  max?: number
  /** Label optionnel */
  label?: string
}

/**
 * Barre de progression linéaire simple
 */
export function LinearProgress({
  value,
  max = 100,
  label,
}: LinearProgressProps) {
  const pourcentage = Math.min((value / max) * 100, 100)

  return (
    <div className="w-full">
      {label && (
        <div className="mb-2 flex justify-between text-sm">
          <span>{label}</span>
          <span className="text-muted-foreground">{Math.round(pourcentage)}%</span>
        </div>
      )}
      <Progress value={pourcentage} />
    </div>
  )
}
