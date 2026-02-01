/**
 * Composant de notification toast
 * Affiche des messages de succès, erreur, info
 */

'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Types de notification disponibles
 */
type TypeNotification = 'succes' | 'erreur' | 'info' | 'success' | 'error'

/**
 * Interface d'une notification
 */
interface Notification {
  id: string
  type: TypeNotification
  message: string
  duree?: number
}

/**
 * Contexte des notifications
 */
interface ContexteNotification {
  afficherNotification: (type: TypeNotification, message: string, duree?: number) => void
  fermerNotification: (id: string) => void
}

const ContexteNotificationReact = createContext<ContexteNotification | null>(null)

/**
 * Hook pour utiliser les notifications
 */
export function useNotification() {
  const contexte = useContext(ContexteNotificationReact)
  if (!contexte) {
    throw new Error('useNotification doit être utilisé dans un FournisseurNotification')
  }
  return contexte
}

/**
 * Props du fournisseur de notifications
 */
interface FournisseurNotificationProps {
  children: ReactNode
}

/**
 * Fournisseur de contexte pour les notifications
 */
export function FournisseurNotification({ children }: FournisseurNotificationProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Fonction pour afficher une notification
  const afficherNotification = useCallback((
    type: TypeNotification, 
    message: string, 
    duree = 5000
  ) => {
    const id = Date.now().toString()
    // Normaliser les types
    const typeNormalise = (type === 'error' ? 'erreur' : type === 'success' ? 'succes' : type) as TypeNotification
    const nouvelleNotification: Notification = { id, type: typeNormalise, message, duree }

    setNotifications(prev => [...prev, nouvelleNotification])

    // Suppression automatique après la durée
    if (duree > 0) {
      setTimeout(() => {
        fermerNotification(id)
      }, duree)
    }
  }, [])

  // Fonction pour fermer une notification
  const fermerNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  return (
    <ContexteNotificationReact.Provider value={{ afficherNotification, fermerNotification }}>
      {children}
      
      {/* Conteneur des notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onFermer={() => fermerNotification(notification.id)}
          />
        ))}
      </div>
    </ContexteNotificationReact.Provider>
  )
}

/**
 * Props d'un élément de notification
 */
interface NotificationItemProps {
  notification: Notification
  onFermer: () => void
}

/**
 * Composant d'affichage d'une notification individuelle
 */
function NotificationItem({ notification, onFermer }: NotificationItemProps) {
  // Configuration des styles par type
  const configurations = {
    succes: {
      icone: CheckCircle,
      classes: 'bg-green-50 border-green-200 text-green-800',
      iconeClasses: 'text-green-500',
    },
    erreur: {
      icone: AlertCircle,
      classes: 'bg-red-50 border-red-200 text-red-800',
      iconeClasses: 'text-red-500',
    },
    info: {
      icone: Info,
      classes: 'bg-blue-50 border-blue-200 text-blue-800',
      iconeClasses: 'text-blue-500',
    },
  }

  const config = configurations[notification.type]
  const Icone = config?.icone

  if (!config || !Icone) {
    return null
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4 shadow-lg animate-in slide-in-from-right-full duration-300',
        config.classes
      )}
      role="alert"
    >
      <Icone className={cn('h-5 w-5 flex-shrink-0 mt-0.5', config.iconeClasses)} />
      <p className="flex-1 text-sm font-medium">{notification.message}</p>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 flex-shrink-0 hover:bg-transparent"
        onClick={onFermer}
        aria-label="Fermer la notification"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
