/**
 * Page d'accueil / Dashboard
 * Affiche les statistiques générales et les raccourcis
 */

'use client'

import '@/styles/page-dashboard.css'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { normaliserCouleur } from '@/lib/utils'
import { ChargementPage } from '@/components/chargement'
import { 
  School, 
  Users, 
  BookOpen, 
  CreditCard,
  Plus,
  ArrowRight,
  Building2,
} from 'lucide-react'
import { recupererStatistiques, recupererEtablissements } from '@/lib/services/api'
import type { StatistiquesDashboard, Etablissement } from '@/lib/types'

/**
 * Composant de la page Dashboard
 */
export default function PageDashboard() {
  // États
  const [statistiques, setStatistiques] = useState<StatistiquesDashboard | null>(null)
  const [etablissements, setEtablissements] = useState<Etablissement[]>([])
  const [enChargement, setEnChargement] = useState(true)

  // Chargement des données au montage
  useEffect(() => {
    async function chargerDonnees() {
      try {
        const [repStats, repEtab] = await Promise.all([
          recupererStatistiques(),
          recupererEtablissements(),
        ])

        if (repStats.succes && repStats.donnees) {
          setStatistiques(repStats.donnees)
        }

        if (repEtab.succes && repEtab.donnees) {
          setEtablissements(repEtab.donnees)
        }
      } catch (erreur) {
        console.error('Erreur lors du chargement des données:', erreur)
      } finally {
        setEnChargement(false)
      }
    }

    chargerDonnees()
  }, [])

  // Affichage du chargement
  if (enChargement) {
    return <ChargementPage message="Chargement du tableau de bord..." />
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-inner">
        {/* En-tête de la page */}
        <div className="dashboard-header">
          <div className="dashboard-header-content">
            <h1 className="dashboard-title">Tableau de bord</h1>
            <p className="dashboard-subtitle">
              Bienvenue sur votre application de gestion de cartes scolaires
            </p>
          </div>
          <Link href="/etablissements/nouveau" className="dashboard-primary-button">
            <Plus className="h-5 w-5" />
            Nouvel établissement
          </Link>
        </div>

        {/* Cartes statistiques */}
        <div className="stats-grid">
          {[
            {
              titre: 'Établissements',
              valeur: statistiques?.totalEtablissements || 0,
              description: 'Établissements enregistrés',
              icone: Building2,
              couleur: 'bleu',
            },
            {
              titre: 'Classes',
              valeur: statistiques?.totalClasses || 0,
              description: 'Classes créées',
              icone: BookOpen,
              couleur: 'vert',
            },
            {
              titre: 'Élèves',
              valeur: statistiques?.totalEleves || 0,
              description: 'Élèves inscrits',
              icone: Users,
              couleur: 'orange',
            },
            {
              titre: 'Cartes générées',
              valeur: statistiques?.cartesGenerees || 0,
              description: 'Cartes créées',
              icone: CreditCard,
              couleur: 'violet',
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="stats-card"
              data-color={stat.couleur}
            >
              <div className="stats-card-icon">
                <stat.icone />
              </div>
              <div className="stats-card-value">{stat.valeur}</div>
              <div className="stats-card-title">{stat.titre}</div>
              <div className="stats-card-description">{stat.description}</div>
            </div>
          ))}
        </div>

        {/* Actions rapides */}
        <div className="quick-actions-grid">
          <div className="action-card">
            <div className="action-card-header">
              <div className="action-card-icon blue">
                <School />
              </div>
              <h3 className="action-card-title">Établissements</h3>
            </div>
            <p className="action-card-description">
              Gérer vos établissements scolaires
            </p>
            <Link href="/etablissements" className="action-card-button">
              Voir les établissements
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="action-card">
            <div className="action-card-header">
              <div className="action-card-icon green">
                <Users />
              </div>
              <h3 className="action-card-title">Élèves</h3>
            </div>
            <p className="action-card-description">
              Gérer les inscriptions des élèves
            </p>
            <Link href="/eleves" className="action-card-button">
              Voir les élèves
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="action-card">
            <div className="action-card-header">
              <div className="action-card-icon purple">
                <CreditCard />
              </div>
              <h3 className="action-card-title">Cartes scolaires</h3>
            </div>
            <p className="action-card-description">
              Générer et imprimer des cartes
            </p>
            <Link href="/cartes" className="action-card-button">
              Générer des cartes
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Établissements récents */}
        <div className="establishments-section">
          <div className="establishments-card">
            <div className="establishments-header">
              <h2 className="establishments-title">Établissements récents</h2>
              <Link href="/etablissements" className="establishments-see-all">
                Voir tout
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="establishments-content">
              {etablissements.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <Building2 />
                  </div>
                  <h3 className="empty-state-title">Aucun établissement</h3>
                  <p className="empty-state-description">
                    Commencez par créer votre premier établissement
                  </p>
                </div>
              ) : (
                <div className="establishments-list">
                  {etablissements.slice(0, 3).map((etablissement, idx) => (
                    <Link
                      key={etablissement._id?.toString() ?? `etab-${idx}`}
                      href={`/etablissements/${etablissement._id?.toString() ?? idx}`}
                      className="establishment-item"
                    >
                      <div
                        className="establishment-icon"
                        style={{
                          backgroundColor: `${normaliserCouleur(
                            etablissement.couleur
                          )}20`,
                        }}
                      >
                        <School
                          style={{
                            color: normaliserCouleur(etablissement.couleur),
                          }}
                        />
                      </div>
                      <div className="establishment-info">
                        <h3 className="establishment-name">{etablissement.nom}</h3>
                        <p className="establishment-address">
                          {etablissement.adresse}
                        </p>
                      </div>
                      <div className="establishment-year">
                        {etablissement.anneeScolaire}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
