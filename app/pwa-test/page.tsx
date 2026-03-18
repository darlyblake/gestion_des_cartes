/**
 * Page de test PWA
 * Permet de vérifier l'installation et les fonctionnalités PWA
 */

'use client'

import { useState, useEffect } from 'react'
import { Download, Wifi, WifiOff, RefreshCw, CheckCircle, XCircle } from 'lucide-react'

export default function PWATestPage() {
  const [isOnline, setIsOnline] = useState(true)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [serviceWorkerStatus, setServiceWorkerStatus] = useState<'checking' | 'supported' | 'not-supported'>('checking')
  const [cacheStatus, setCacheStatus] = useState<string>('')

  useEffect(() => {
    // Vérifier l'état de connexion
    setIsOnline(navigator.onLine)
    
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Vérifier si l'application est installée
    const checkInstalled = () => {
      const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
      const isInWebAppiOS = (window.navigator as any).standalone === true
      setIsInstalled(isInStandaloneMode || isInWebAppiOS)
    }
    
    // Vérifier si l'installation est possible
    const checkInstallable = () => {
      const hasBeforeInstallPrompt = 'beforeinstallprompt' in window
      setIsInstallable(hasBeforeInstallPrompt)
    }
    
    // Vérifier le service worker
    const checkServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        setServiceWorkerStatus('supported')
        
        try {
          const registration = await navigator.serviceWorker.ready
          console.log('Service Worker actif:', registration.scope)
          
          // Vérifier le cache
          if ('caches' in window) {
            const cacheNames = await caches.keys()
            setCacheStatus(`${cacheNames.length} caches trouvés`)
          }
        } catch (error) {
          console.error('Erreur Service Worker:', error)
        }
      } else {
        setServiceWorkerStatus('not-supported')
      }
    }
    
    checkInstalled()
    checkInstallable()
    checkServiceWorker()
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleInstall = async () => {
    // Simuler l'installation (dans un vrai cas, le beforeinstallprompt serait utilisé)
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        console.log('Service Worker enregistré:', registration)
      } catch (error) {
        console.error('Erreur enregistrement SW:', error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test PWA - School Cards</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* État de connexion */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              {isOnline ? (
                <Wifi className="w-8 h-8 text-green-600" />
              ) : (
                <WifiOff className="w-8 h-8 text-red-600" />
              )}
              <h2 className="text-xl font-semibold">Connexion</h2>
            </div>
            <p className="text-gray-600">
              {isOnline ? 'En ligne' : 'Hors ligne'}
            </p>
          </div>

          {/* Installation */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              {isInstalled ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <Download className="w-8 h-8 text-blue-600" />
              )}
              <h2 className="text-xl font-semibold">Installation</h2>
            </div>
            <p className="text-gray-600 mb-4">
              {isInstalled ? 'Application installée' : 'Non installée'}
            </p>
            {isInstallable && !isInstalled && (
              <button
                onClick={handleInstall}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Installer
              </button>
            )}
          </div>

          {/* Service Worker */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              {serviceWorkerStatus === 'supported' ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600" />
              )}
              <h2 className="text-xl font-semibold">Service Worker</h2>
            </div>
            <p className="text-gray-600">
              {serviceWorkerStatus === 'checking' && 'Vérification...'}
              {serviceWorkerStatus === 'supported' && 'Supporté'}
              {serviceWorkerStatus === 'not-supported' && 'Non supporté'}
            </p>
            {cacheStatus && (
              <p className="text-sm text-gray-500 mt-2">Cache: {cacheStatus}</p>
            )}
          </div>

          {/* Manifest */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Manifest PWA</h2>
            <p className="text-gray-600 mb-4">
              Vérifiez si le manifest est accessible
            </p>
            <a
              href="/manifest.json"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Voir manifest.json
            </a>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-lg shadow p-6 md:col-span-2 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Instructions d'installation</h2>
            <div className="space-y-4 text-gray-600">
              <div>
                <h3 className="font-medium text-gray-900">Chrome/Edge (Desktop):</h3>
                <p>1. Cliquez sur l'icône d'installation dans la barre d'adresse</p>
                <p>2. Cliquez sur "Installer l'application"</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Safari (iOS):</h3>
                <p>1. Appuyez sur le bouton "Partager"</p>
                <p>2. Faites défiler vers le bas et appuyez sur "Ajouter à l'écran d'accueil"</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Chrome (Android):</h3>
                <p>1. Appuyez sur le menu (⋮)</p>
                <p>2. Appuyez sur "Ajouter à l'écran d'accueil"</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Actions rapides</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
            <button
              onClick={() => navigator.serviceWorker?.controller?.postMessage({ type: 'SKIP_WAITING' })}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Mettre à jour SW
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
