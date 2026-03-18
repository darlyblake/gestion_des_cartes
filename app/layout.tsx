/**
 * Layout racine de l'application
 * Contient l'en-tête, le fournisseur de notifications et le pied de page
 */

import '../styles/globals.css'
import '../styles/buttons.css'
import '../styles/forms.css'
import React from 'react'
import type { Metadata, Viewport } from 'next'
import { Entete } from '@/components/entete'
import { FournisseurNotification } from '@/components/notification'
import { PWAInstallPrompt } from '@/components/pwa-install-prompt'
import { PWAOfflineIndicator } from '@/components/pwa-offline-indicator'
import { PWAUpdatePrompt } from '@/components/pwa-update-prompt'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

/**
 * Métadonnées de l'application
 */
export const metadata: Metadata = {
  title: {
    default: 'School Card Application',
    template: '%s | School Card Application'
  },
  description: 'Application de gestion et création de cartes scolaires pour établissements',
  keywords: ['cartes scolaires', 'établissement', 'élèves', 'personnel', 'éducation'],
  authors: [{ name: 'School Card Team' }],
  creator: 'School Card Team',
  publisher: 'School Card Application',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://school-cards.vercel.app'),
  alternates: {
    canonical: '/',
    languages: {
      'fr-FR': '/fr',
      'en-US': '/en',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://school-cards.vercel.app',
    title: 'School Card Application',
    description: 'Application de gestion et création de cartes scolaires pour établissements',
    siteName: 'School Card Application',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'School Card Application',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'School Card Application',
    description: 'Application de gestion et création de cartes scolaires pour établissements',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/apple-icon-167x167.png', sizes: '167x167', type: 'image/png' },
      { url: '/icons/apple-icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'School Cards',
    'application-name': 'School Cards',
    'msapplication-TileColor': '#1e40af',
    'msapplication-config': '/browserconfig.xml',
  },
}

/**
 * Configuration du viewport pour mobile
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1e40af',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const isProduction = process.env.NODE_ENV === 'production'

  return (
    <html lang="fr" data-scroll-behavior="smooth">
      <body className="app-shell">
        <PWAInstallPrompt />
        <PWAOfflineIndicator />
        <PWAUpdatePrompt />
        <FournisseurNotification>
          <div className="app-layout">
            <Entete />
            <main>{children}</main>
            <footer className="app-footer">
              CartesScolaires - Application de gestion de cartes scolaires
            </footer>
          </div>
        </FournisseurNotification>
        {/* Charger Analytics seulement en production */}
        {isProduction && (
          <>
            <script
              async
              src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', 'GA_MEASUREMENT_ID');
                `,
              }}
            />
          </>
        )}
      </body>
    </html>
  )
}
