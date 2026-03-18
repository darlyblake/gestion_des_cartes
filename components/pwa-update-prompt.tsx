/**
 * Composant d'invite de mise à jour PWA
 * Notifie l'utilisateur qu'une nouvelle version est disponible
 */

'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, X, Download } from 'lucide-react'

export function PWAUpdatePrompt() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    // Écouter les mises à jour du service worker
    const handleSWUpdate = (event: CustomEvent) => {
      setShowUpdatePrompt(true)
    }

    window.addEventListener('sw-update', handleSWUpdate as EventListener)

    return () => {
      window.removeEventListener('sw-update', handleSWUpdate as EventListener)
    }
  }, [])

  const handleUpdate = async () => {
    setIsUpdating(true)
    
    try {
      // Notifier le service worker de sauter l'attente
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        }
      }

      // Attendre un peu pour que le service worker se mette à jour
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      setIsUpdating(false)
    }
  }

  const handleDismiss = () => {
    setShowUpdatePrompt(false)
    // Rappeler plus tard (dans 1 heure)
    setTimeout(() => {
      setShowUpdatePrompt(true)
    }, 60 * 60 * 1000)
  }

  if (!showUpdatePrompt) {
    return null
  }

  return (
    <div className="fixed top-20 left-4 right-4 z-50 mx-auto max-w-md">
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow-lg p-4 flex items-start gap-3">
        <Download className="w-6 h-6 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">Mise à jour disponible</h3>
          <p className="text-xs opacity-90 mb-2">
            Une nouvelle version de l'application est disponible avec des améliorations et corrections.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="bg-white text-green-600 px-3 py-1.5 rounded text-sm font-medium hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3" />
                  Mettre à jour
                </>
              )}
            </button>
            <button
              onClick={handleDismiss}
              className="bg-green-700 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-green-800 transition-colors"
            >
              Plus tard
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 hover:bg-green-800 rounded transition-colors"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
