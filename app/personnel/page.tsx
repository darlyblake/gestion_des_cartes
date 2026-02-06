/**
 * Page de liste du personnel
 * Affiche tous les membres du personnel avec leurs informations
 */

'use client'

import '@/styles/page-personnel.css'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { ChargementPage } from '@/components/chargement'
import { ModalSimple } from '@/components/modal-simple'
import { useNotification } from '@/components/notification'
import { 
  Plus, 
  Search,
  User,
  Mail,
  Phone,
  Trash2,
  Pencil,
  Sparkles,
  UsersRound,
  Building2,
} from 'lucide-react'
import { recupererPersonnel, supprimerPersonnel } from '@/lib/services/api'
import type { Personnel } from '@/lib/types'

/**
 * Obtenir le label du rôle
 */
function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    directeur: 'Directeur',
    enseignant: 'Enseignant',
    censeur: 'Censeur',
    surveillant: 'Surveillant Général',
    informaticien: 'Informaticien',
    secretaire: 'Secrétaire',
    gestionnaire: 'Gestionnaire',
    infirmier: 'Infirmier',
    bibliothecaire: 'Bibliothécaire',
    stagiaire: 'Stagiaire',
    autre: 'Autre',
  }
  return labels[role] || role
}

export default function PagePersonnel() {
  const { afficherNotification } = useNotification()
  const [personnel, setPersonnel] = useState<Personnel[]>([])
  const [recherche, setRecherche] = useState('')
  const [enChargement, setEnChargement] = useState(true)
  const [roleFiltre, setRoleFiltre] = useState<string>('tous')
  const [membreASupprimer, setMembreASupprimer] = useState<Personnel | null>(null)
  const [enSuppression, setEnSuppression] = useState(false)
  
  // import ModalSimple locally to keep visual parity
  // (ModalSimple will be added to this page via import below)

  // Chargement initial
  useEffect(() => {
    chargerPersonnel()
  }, [])

  async function chargerPersonnel() {
    try {
      setEnChargement(true)
      const reponse = await recupererPersonnel()

      if (reponse.succes && reponse.donnees) {
        setPersonnel(reponse.donnees)
      }
    } catch (erreur) {
      console.error('Erreur:', erreur)
      afficherNotification('error', 'Erreur lors du chargement')
    } finally {
      setEnChargement(false)
    }
  }

  const rolesDisponibles = useMemo(() => {
    const roles = new Set(personnel.map((p) => p.role))
    return Array.from(roles)
  }, [personnel])

  const personnelFiltre = useMemo(() => {
    return personnel.filter((p) => {
      const matchRecherche =
        p.nom.toLowerCase().includes(recherche.toLowerCase()) ||
        p.prenom.toLowerCase().includes(recherche.toLowerCase()) ||
        p.fonction.toLowerCase().includes(recherche.toLowerCase())

      const matchRole = roleFiltre === 'tous' || p.role === roleFiltre

      return matchRecherche && matchRole
    })
  }, [personnel, recherche, roleFiltre])

  async function supprimerMembre(id: string) {
    try {
      const reponse = await supprimerPersonnel(id)

      if (reponse.succes) {
        afficherNotification('success', 'Membre supprimé avec succès')
        setPersonnel((ancien) => ancien.filter((p) => p._id?.toString() !== id))
      } else {
        afficherNotification('error', reponse.erreur || 'Erreur lors de la suppression')
      }
    } catch (erreur) {
      console.error('Erreur:', erreur)
      afficherNotification('error', 'Erreur lors de la suppression')
    }
  }

  if (enChargement) {
    return <ChargementPage message="Chargement du personnel..." />
  }

  return (
    <div className="personnel-container">
      <div className="container personnel-content">
        {/* Hero */}
        <section className="personnel-hero">
          <div className="personnel-hero-card">
            <div className="personnel-hero-card-inner">
              <div className="personnel-status-badge">
                <Sparkles className="personnel-status-icon" />
                Gestion du personnel
              </div>
              <h1 className="personnel-title">Une équipe connectée, organisée et inspirante</h1>
              <p className="personnel-description">
                Filtrez, animez et valorisez vos collaborateurs grâce à une interface moderne,
                totalement responsive et ponctuée d’animations douces.
              </p>
              <div className="personnel-stats">
                <div className="personnel-stat-card">
                  <div className="personnel-stat-label">
                    <UsersRound />
                    Total membres
                  </div>
                  <div className="personnel-stat-value">{personnel.length}</div>
                  <div className="personnel-stat-trend positive">
                    +{Math.max(personnel.length - 5, 0)} ce trimestre
                  </div>
                </div>
                <div className="personnel-stat-card">
                  <div className="personnel-stat-label">
                    <Sparkles />
                    Rôles actifs
                  </div>
                  <div className="personnel-stat-value">{rolesDisponibles.length}</div>
                  <div className="personnel-stat-trend neutral">Equipe pluridisciplinaire</div>
                </div>
              </div>
              <div className="personnel-action-buttons">
                <Link href="/personnel/nouveau" className="personnel-primary-button">
                  <Plus className="personnel-button-icon" />
                  Ajouter un membre
                </Link>
                <button className="personnel-secondary-button" type="button">
                  Exporter la liste
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Filtres */}
        <section className="personnel-filters-section">
          <div className="personnel-filters-card">
            <div className="personnel-search">
              <input
                type="text"
                placeholder="Rechercher par nom, prénom ou fonction..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                className="personnel-search-input"
              />
              <Search className="personnel-search-icon" />
            </div>
            <div className="personnel-filters">
              <span className="personnel-filter-label">Filtrer par rôle :</span>
              <button
                type="button"
                className={`personnel-filter-button ${roleFiltre === 'tous' ? 'active' : ''}`}
                onClick={() => setRoleFiltre('tous')}
              >
                Tous
              </button>
              {rolesDisponibles.map((role) => (
                <button
                  key={role}
                  type="button"
                  className={`personnel-filter-button ${roleFiltre === role ? 'active' : ''}`}
                  onClick={() => setRoleFiltre(role)}
                >
                  {getRoleLabel(role)}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Liste du personnel */}
        {personnelFiltre.length === 0 ? (
          <div className="personnel-empty">
            <div className="personnel-empty-icon">
              <User className="w-full h-full" />
            </div>
            <h2 className="personnel-empty-title">
              {recherche ? 'Aucun résultat' : 'Aucun membre du personnel'}
            </h2>
            <p className="personnel-empty-description">
              {recherche
                ? 'Aucun résultat ne correspond à votre recherche'
                : 'Commencez par ajouter un membre du personnel'}
            </p>
            {!recherche && (
              <Link href="/personnel/nouveau" className="personnel-empty-button">
                <Plus className="personnel-button-icon" />
                Ajouter un membre
              </Link>
            )}
          </div>
        ) : (
          <div className="personnel-grid">
            {personnelFiltre.map((membre, index) => {
              const membreId = membre.id ?? membre._id?.toString() ?? `${membre.nom}-${index}`
              return (
                <div key={membreId} className="personnel-member-card">
                  <div className="personnel-member-content">
                    <div className="personnel-member-header">
                      <div className="personnel-member-photo">
                        <img
                          src={membre.photo || '/placeholder.svg'}
                          alt={`Photo de ${membre.prenom} ${membre.nom}`}
                        />
                        <span className="personnel-member-role">{getRoleLabel(membre.role)}</span>
                      </div>
                      <div className="personnel-member-info">
                        <h3 className="personnel-member-name">
                          {membre.prenom} {membre.nom}
                        </h3>
                        <p className="personnel-member-function">{membre.fonction}</p>
                        <div className="personnel-member-establishment">
                          <Building2 className="personnel-establishment-icon" />
                          <span>{membre.etablissement?.nom || 'Établissement non renseigné'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="personnel-member-contacts">
                      {membre.email && (
                        <a href={`mailto:${membre.email}`} className="personnel-contact-item">
                          <Mail className="personnel-contact-icon" />
                          <span className="personnel-contact-text">{membre.email}</span>
                        </a>
                      )}
                      {membre.telephone && (
                        <a href={`tel:${membre.telephone}`} className="personnel-contact-item">
                          <Phone className="personnel-contact-icon" />
                          <span className="personnel-contact-text">{membre.telephone}</span>
                        </a>
                      )}
                    </div>

                    <div className="personnel-member-actions">
                      <Link
                        href={`/personnel/${membreId}/modifier`}
                        className="personnel-edit-button"
                      >
                        <Pencil className="personnel-edit-icon" />
                        Modifier
                      </Link>
                      <button 
                        type="button" 
                        className="personnel-delete-button"
                        onClick={() => setMembreASupprimer(membre)}
                      >
                        <Trash2 className="personnel-delete-icon" />
                        <span className="sr-only">Supprimer</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Modal de confirmation centralisée pour suppression de membre */}
        <ModalSimple
          ouvert={!!membreASupprimer}
          onFermer={() => setMembreASupprimer(null)}
          onConfirmer={async () => {
            if (!membreASupprimer) return
            setEnSuppression(true)
            const id = membreASupprimer._id?.toString() || membreASupprimer.id || ''
            if (id) {
              await supprimerMembre(id)
            }
            setEnSuppression(false)
            setMembreASupprimer(null)
          }}
          titre="Supprimer le membre"
          description={`Êtes-vous sûr de vouloir supprimer "${membreASupprimer?.prenom} ${membreASupprimer?.nom}" ? Cette action est irréversible.`}
          confirmText="Supprimer"
          enChargement={enSuppression}
        />
      </div>
    </div>
  )
}
