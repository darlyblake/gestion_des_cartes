/**
 * Layout racine de l'application
 * Contient l'en-tête, le fournisseur de notifications et le pied de page
 */

import '../styles/globals.css'
import React from 'react'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Entete } from '@/components/entete'
import { FournisseurNotification } from '@/components/notification'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

/**
 * Métadonnées de l'application
 */
export const metadata: Metadata = {
  title: 'Cartes Scolaires - Gestion et création de cartes',
  description: 'Application de gestion et création de cartes scolaires pour établissements',
  generator: 'Next.js',
  keywords: ['cartes scolaires', 'école', 'gestion élèves', 'cartes étudiants'],
  authors: [{ name: 'CartesScolaires' }],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
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
  return (
    <html lang="fr" data-scroll-behavior="smooth">
      <body className="app-shell">
        <FournisseurNotification>
          <div className="app-layout">
            <Entete />
            <main>{children}</main>
            <footer className="app-footer">
              CartesScolaires - Application de gestion de cartes scolaires
            </footer>
          </div>
        </FournisseurNotification>
        <Analytics />
      </body>
    </html>
  )
}
