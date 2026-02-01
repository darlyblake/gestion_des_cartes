/**
 * Composant Modal de confirmation
 * Utilisé pour confirmer des actions importantes (suppression, etc.)
 */

'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AlertTriangle, Loader2 } from 'lucide-react'

/**
 * Props du composant ModalConfirmation
 */
interface ModalConfirmationProps {
  /** État d'ouverture de la modal */
  ouvert: boolean
  /** Fonction de fermeture */
  onFermer: () => void
  /** Fonction de confirmation */
  onConfirmer: () => void
  /** Titre de la modal */
  titre: string
  /** Description/message de la modal */
  description: string
  /** Texte du bouton de confirmation */
  texteConfirmation?: string
  /** Texte du bouton d'annulation */
  texteAnnulation?: string
  /** Variante du bouton de confirmation */
  variante?: 'default' | 'destructive'
  /** État de chargement */
  enChargement?: boolean
}

/**
 * Composant Modal de confirmation
 */
export function ModalConfirmation({
  ouvert,
  onFermer,
  onConfirmer,
  titre,
  description,
  texteConfirmation = 'Confirmer',
  texteAnnulation = 'Annuler',
  variante = 'destructive',
  enChargement = false,
}: ModalConfirmationProps) {
  return (
    <Dialog open={ouvert} onOpenChange={onFermer}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {variante === 'destructive' && (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            )}
            <div>
              <DialogTitle>{titre}</DialogTitle>
              <DialogDescription className="mt-1">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onFermer}
            disabled={enChargement}
          >
            {texteAnnulation}
          </Button>
          <Button
            variant={variante}
            onClick={onConfirmer}
            disabled={enChargement}
          >
            {enChargement && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {texteConfirmation}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
