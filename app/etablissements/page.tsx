/**
 * Page de liste des établissements
 * Affiche tous les établissements avec leurs statistiques
 */

'use client'

import '@/styles/page-etablissements.css'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChargementPage } from '@/components/chargement'
import { ModalConfirmation } from '@/components/modal-confirmation'
import { useNotification } from '@/components/notification'
import { normaliserCouleur } from '@/lib/utils'
import { 
  Plus, 
  Search, 
  School,
  Pencil,
  Trash2,
  Users,
  BookOpen,
} from 'lucide-react'
import { recupererEtablissements, supprimerEtablissement } from '@/lib/services/api'
import type { Etablissement } from '@/lib/types'

/**
 * Composant de la page liste des établissements
 */
export default function PageEtablissements() {
  // États
  const [etablissements, setEtablissements] = useState<Etablissement[]>([])
  const [recherche, setRecherche] = useState('')
  const [enChargement, setEnChargement] = useState(true)
  const [etablissementASupprimer, setEtablissementASupprimer] = useState<Etablissement | null>(null)
  const [enSuppression, setEnSuppression] = useState(false)

  // Hook de notification
  const { afficherNotification } = useNotification()

  // Chargement des établissements
  useEffect(() => {
    async function chargerEtablissements() {
      try {
        const reponse = await recupererEtablissements()
        if (reponse.succes && reponse.donnees) {
          setEtablissements(reponse.donnees)
        }
      } catch (erreur) {
        console.error('Erreur:', erreur)
        afficherNotification('erreur', 'Erreur lors du chargement des établissements')
      } finally {
        setEnChargement(false)
      }
    }

    chargerEtablissements()
  }, [afficherNotification])

  // Filtrage par recherche
  const etablissementsFiltres = etablissements.filter(e =>
    e.nom.toLowerCase().includes(recherche.toLowerCase()) ||
    e.adresse.toLowerCase().includes(recherche.toLowerCase())
  )

  // Gestion de la suppression
  const gererSuppression = async () => {
    if (!etablissementASupprimer) return

    setEnSuppression(true)
    try {
      const reponse = await supprimerEtablissement(etablissementASupprimer.id)
      if (reponse.succes) {
        setEtablissements(prev => prev.filter(e => e.id !== etablissementASupprimer.id))
        afficherNotification('succes', 'Établissement supprimé avec succès')
      } else {
        afficherNotification('erreur', reponse.erreur || 'Erreur lors de la suppression')
      }
    } catch (erreur) {
      console.error('Erreur:', erreur)
      afficherNotification('erreur', 'Erreur lors de la suppression')
    } finally {
      setEnSuppression(false)
      setEtablissementASupprimer(null)
    }
  }

  // Affichage du chargement
  if (enChargement) {
    return <ChargementPage message="Chargement des établissements..." />
  }

  return (
    <div className="establishments-container">
      <div className="container px-4 py-6 space-y-6">
        {/* En-tête */}
        <div className="establishments-header">
          <h1 className="establishments-title">Établissements</h1>
          <p className="establishments-count">
            {etablissements.length} établissement{etablissements.length > 1 ? 's' : ''} enregistré{etablissements.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="establishments-search">
          <Search className="establishments-search-icon" />
          <input
            type="text"
            placeholder="Rechercher un établissement..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="establishments-search-input"
          />
        </div>

        {/* Liste des établissements */}
        {etablissementsFiltres.length === 0 ? (
          <div className="establishments-empty">
            <div className="establishments-empty-icon">
              <School className="w-full h-full" />
            </div>
            <h2 className="establishments-empty-title">
              {recherche ? 'Aucun résultat' : 'Aucun établissement'}
            </h2>
            <p className="establishments-empty-description">
              {recherche
                ? 'Aucun établissement ne correspond à votre recherche'
                : 'Commencez par créer votre premier établissement'
              }
            </p>
            {!recherche && (
              <Link href="/etablissements/nouveau" className="establishments-empty-button">
                <Plus className="establishments-empty-button-icon" />
                Créer un établissement
              </Link>
            )}
          </div>
        ) : (
          <div className="establishments-grid">
            {etablissementsFiltres.map((etablissement, idx) => (
              <div 
                key={etablissement._id?.toString() || etablissement.nom || `etab-${idx}`}
                className="establishment-card"
              >
                {/* Header coloré */}
                <div 
                  className="establishment-card-header"
                  style={{ backgroundColor: normaliserCouleur(etablissement.couleur) }}
                />
                
                <div className="establishment-card-content">
                  {/* Logo et nom */}
                  <div className="establishment-logo-section">
                    <div 
                      className="establishment-logo"
                      style={{ color: normaliserCouleur(etablissement.couleur) }}
                    >
                      <School className="establishment-logo-icon" />
                    </div>
                    <div className="establishment-info">
                      <h3 className="establishment-name">{etablissement.nom}</h3>
                      <p className="establishment-address">{etablissement.adresse}</p>
                    </div>
                  </div>

                  {/* Métriques */}
                  <div className="establishment-metrics">
                    <div className="establishment-metric">
                      <BookOpen className="establishment-metric-icon" />
                      <span className="establishment-metric-value">{etablissement.anneeScolaire}</span>
                    </div>
                    <div className="establishment-metric">
                      <Users className="establishment-metric-icon" />
                      <span className="establishment-metric-value">{etablissement.telephone}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="establishment-actions">
                    <button 
                      type="button"
                      onClick={() => {
                        const etabId = etablissement._id?.toString() || etablissement.id
                        console.log('Voir détails:', etabId)
                        window.location.href = `/etablissements/${etabId}`
                      }}
                      className="establishment-action-button details"
                    >
                      Voir détails
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        const etabId = etablissement._id?.toString() || etablissement.id
                        console.log('Modifier établissement:', etabId)
                        window.location.href = `/etablissements/${etabId}/modifier`
                      }}
                      className="establishment-action-icon edit"
                      title="Modifier"
                    >
                      <Pencil className="establishment-action-icon-svg" />
                    </button>
                    <button 
                      type="button"
                      className="establishment-action-icon delete"
                      onClick={() => {
                        console.log('Supprimer établissement:', etablissement)
                        setEtablissementASupprimer(etablissement)
                      }}
                      title="Supprimer"
                    >
                      <Trash2 className="establishment-action-icon-svg" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de confirmation de suppression */}
        <ModalConfirmation
          ouvert={!!etablissementASupprimer}
          onFermer={() => setEtablissementASupprimer(null)}
          onConfirmer={gererSuppression}
          titre="Supprimer l'établissement"
          description={`Êtes-vous sûr de vouloir supprimer "${etablissementASupprimer?.nom}" ? Cette action est irréversible.`}
          texteConfirmation="Supprimer"
          variante="destructive"
          enChargement={enSuppression}
        />
      </div>
    </div>
  )
}
