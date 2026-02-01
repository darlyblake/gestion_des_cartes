/**
 * Composant En-tête de l'application
 * Affiche le logo, le titre et la navigation
 */

'use client'

import '@/styles/navbar.css'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  School, 
  Users, 
  BookOpen, 
  CreditCard, 
  Menu,
  X 
} from 'lucide-react'
import { useState } from 'react'

/**
 * Liens de navigation de l'application
 */
const liensNavigation = [
  { nom: 'Tableau de bord', href: '/', icone: School },
  { nom: 'Établissements', href: '/etablissements', icone: BookOpen },
  { nom: 'Classes', href: '/classes', icone: Users },
  { nom: 'Élèves', href: '/eleves', icone: Users },
  { nom: 'Personnel', href: '/personnel', icone: Users },
  { nom: 'Cartes', href: '/cartes', icone: CreditCard },
]

/**
 * Composant En-tête principal - Navbar moderne
 */
export function Entete() {
  // État pour le menu mobile
  const [menuOuvert, setMenuOuvert] = useState(false)
  const cheminActuel = usePathname()

  return (
    <header id="navbar">
      <div className="navbar-scroll-progress" id="scroll-progress"></div>
      <div className="navbar-container">
        {/* Logo et branding */}
        <Link href="/" className="navbar-brand">
          <div className="navbar-logo-badge">
            <CreditCard className="h-6 w-6" />
          </div>
          <span className="navbar-logo-title">CartesScolaires</span>
        </Link>

        {/* Navigation desktop */}
        <nav className="navbar-nav">
          {liensNavigation.map((lien) => {
            const estActif = cheminActuel === lien.href || 
              (lien.href !== '/' && cheminActuel.startsWith(lien.href))
            const Icone = lien.icone

            return (
              <Link 
                key={lien.href} 
                href={lien.href}
                className={cn('navbar-link', estActif && 'active')}
                aria-current={estActif ? 'page' : undefined}
              >
                <Icone className="h-5 w-5" />
                {lien.nom}
                <span className="navbar-link.active-indicator"></span>
              </Link>
            )
          })}
        </nav>

        {/* Bouton menu mobile */}
        <button
          className={cn('navbar-menu-toggle', menuOuvert && 'open')}
          onClick={() => setMenuOuvert(!menuOuvert)}
          aria-label={menuOuvert ? 'Fermer le menu' : 'Ouvrir le menu'}
          type="button"
        >
          {menuOuvert ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Menu mobile */}
      {menuOuvert && (
        <>
          <div className="navbar-mobile-menu open">
            {liensNavigation.map((lien, idx) => {
              const estActif = cheminActuel === lien.href || 
                (lien.href !== '/' && cheminActuel.startsWith(lien.href))
              const Icone = lien.icone

              return (
                <Link
                  key={lien.href}
                  href={lien.href}
                  className={cn('navbar-mobile-link', estActif && 'active')}
                  onClick={() => setMenuOuvert(false)}
                >
                  <Icone className="h-5 w-5" />
                  {lien.nom}
                </Link>
              )
            })}
          </div>
          <div 
            className="navbar-overlay open"
            onClick={() => setMenuOuvert(false)}
            role="presentation"
          ></div>
        </>
      )}
    </header>
  )
}
