/**
 * Composant d'indicateur de connexion hors ligne
 * Affiche l'état de la connexion et les fonctionnalités disponibles
 */

'use client'

import { useState, useEffect } from 'react'
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react'

export function PWAOfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showOfflineMessage, setShowOfflineMessage] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowOfflineMessage(false)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOfflineMessage(true)
    }

    // Vérifier l'état initial
    setIsOnline(navigator.onLine)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRefresh = () => {
    window.location.reload()
  }

  // Ne pas afficher si en ligne et pas de message récent
  if (isOnline && !showOfflineMessage) {
    return null
  }

  // Indicateur permanent en mode hors ligne
  if (!isOnline) {
    return (
      <div className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-md">
        <div className="bg-orange-100 border border-orange-200 text-orange-800 rounded-lg shadow-lg p-4 flex items-center gap-3">
          <WifiOff className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-medium text-sm mb-1">Mode hors ligne</h4>
            <p className="text-xs">
              L'application fonctionne en mode limité. Certaines fonctionnalités peuvent être indisponibles.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-orange-200 rounded transition-colors"
            title="Actualiser"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  // Message de retour en ligne
  return (
    <div className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-md">
      <div className="bg-green-100 border border-green-200 text-green-800 rounded-lg shadow-lg p-4 flex items-center gap-3">
        <Wifi className="w-5 h-5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-medium text-sm mb-1">Connexion rétablie</h4>
          <p className="text-xs">
            L'application est de nouveau en ligne et toutes les fonctionnalités sont disponibles.
          </p>
        </div>
        <button
          onClick={() => setShowOfflineMessage(false)}
          className="p-2 hover:bg-green-200 rounded transition-colors"
          title="Fermer"
        >
          ×
        </button>
      </div>
    </div>
  )
}
