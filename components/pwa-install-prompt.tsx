/**
 * Composant d'invite d'installation PWA
 * Affiche une bannière pour encourager l'installation de l'application
 */

'use client'

import { useState, useEffect } from 'react'
import { X, Download, Smartphone } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Vérifier si l'application est déjà installée
    const checkIfInstalled = () => {
      const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
      const isInWebAppiOS = (window.navigator as any).standalone === true
      setIsInstalled(isInStandaloneMode || isInWebAppiOS)
    }

    // Vérifier si c'est un appareil iOS
    const checkIfIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase()
      const isIOSDevice = /iphone|ipad|ipod/.test(userAgent)
      setIsIOS(isIOSDevice)
    }

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallPrompt(true)
    }

    // Écouter l'événement d'installation réussie
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    }

    checkIfInstalled()
    checkIfIOS()

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setIsInstalled(true)
      }
      
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    } catch (error) {
      console.error('Erreur lors de l\'installation PWA:', error)
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Stocker en localStorage pour ne plus montrer pendant 7 jours
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  // Ne pas afficher si déjà installé ou si l'utilisateur a refusé récemment
  useEffect(() => {
    const dismissedTime = localStorage.getItem('pwa-install-dismissed')
    if (dismissedTime) {
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
      if (parseInt(dismissedTime) > sevenDaysAgo) {
        setShowInstallPrompt(false)
      }
    }
  }, [])

  if (isInstalled || !showInstallPrompt) {
    return null
  }

  // Instructions spécifiques pour iOS
  if (isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md">
        <div className="bg-blue-600 text-white rounded-lg shadow-lg p-4 flex items-start gap-3">
          <Smartphone className="w-6 h-6 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">Installez l'application</h3>
            <p className="text-xs opacity-90 mb-2">
              Appuyez sur <span className="font-semibold">Partager</span> puis 
              <span className="font-semibold"> "Ajouter à l'écran d'accueil"</span> pour installer l'application.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-blue-700 rounded transition-colors"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  // Bouton d'installation pour Android/Desktop
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg p-4 flex items-start gap-3">
        <Download className="w-6 h-6 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">Installez School Cards</h3>
          <p className="text-xs opacity-90 mb-2">
            Installez l'application pour un accès rapide et une expérience hors ligne.
          </p>
          <button
            onClick={handleInstallClick}
            className="bg-white text-blue-600 px-4 py-2 rounded text-sm font-medium hover:bg-blue-50 transition-colors"
          >
            Installer maintenant
          </button>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 hover:bg-blue-800 rounded transition-colors"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
