/**
 * Page de création d'une nouvelle classe
 * Formulaire pour créer une classe
 */

'use client'

import '@/styles/page-classes-nouveau.css'
import React from "react"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChargementPage } from '@/components/chargement'
import { useNotification } from '@/components/notification'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { recupererEtablissementsOptions, creerClasse } from '@/lib/services/api'
import type { Etablissement, CreerClasseDonnees } from '@/lib/types'

/**
 * Niveaux de classe disponibles
 */
const NIVEAUX = [
  '6ème',
  '5ème',
  '4ème',
  '3ème',
  'Seconde',
  'Première',
  'Terminale',
  'Licence 1',
  'Licence 2',
  'Licence 3',
  'Master 1',
  'Master 2',
]

/**
 * Composant de la page création de classe
 */
export default function PageNouvelleClasse() {
  const routeur = useRouter()
  const { afficherNotification } = useNotification()

  // États
  const [etablissements, setEtablissements] = useState<Etablissement[]>([])
  const [nom, setNom] = useState('')
  const [niveau, setNiveau] = useState('')
  const [etablissementId, setEtablissementId] = useState('')
  const [enChargement, setEnChargement] = useState(true)
  const [enSoumission, setEnSoumission] = useState(false)
  const [erreurs, setErreurs] = useState<Record<string, string>>({})
  const [selectOuvert, setSelectOuvert] = useState<'etablissement' | 'niveau' | null>(null)

  // Ferme les sélecteurs personnalisés sur clic extérieur ou touche Échap
  useEffect(() => {
    const fermerSelects = (event: MouseEvent | TouchEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent && event.key === 'Escape') {
        setSelectOuvert(null)
      }

      if (event instanceof MouseEvent || event instanceof TouchEvent) {
        const cible = event.target as HTMLElement | null
        if (!cible?.closest('.class-creation-select')) {
          setSelectOuvert(null)
        }
      }
    }

    document.addEventListener('click', fermerSelects)
    document.addEventListener('touchstart', fermerSelects)
    document.addEventListener('keydown', fermerSelects)

    return () => {
      document.removeEventListener('click', fermerSelects)
      document.removeEventListener('touchstart', fermerSelects)
      document.removeEventListener('keydown', fermerSelects)
    }
  }, [])

  // Chargement des établissements
  useEffect(() => {
    async function chargerEtablissements() {
      try {
        const reponse = await recupererEtablissementsOptions({ projection: 'light' })
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

  /**
   * Valide le formulaire
   */
  const validerFormulaire = (): boolean => {
    const nouvellesErreurs: Record<string, string> = {}

    if (!nom.trim()) nouvellesErreurs.nom = 'Le nom est requis'
    if (!niveau) nouvellesErreurs.niveau = 'Le niveau est requis'
    if (!etablissementId) nouvellesErreurs.etablissementId = 'L\'établissement est requis'

    setErreurs(nouvellesErreurs)
    return Object.keys(nouvellesErreurs).length === 0
  }

  /**
   * Gère la soumission du formulaire
   */
  const gererSoumission = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!validerFormulaire()) return

    setEnSoumission(true)
    try {
      const donnees: CreerClasseDonnees = {
        nom: nom.trim(),
        niveau,
        etablissementId,
      }

      const reponse = await creerClasse(donnees)

      if (reponse.succes) {
        afficherNotification('succes', 'Classe créée avec succès')
        routeur.push('/classes')
      } else {
        afficherNotification('erreur', reponse.erreur || 'Erreur lors de la création')
      }
    } catch (erreur) {
      console.error('Erreur:', erreur)
      afficherNotification('erreur', 'Erreur lors de la création de la classe')
    } finally {
      setEnSoumission(false)
    }
  }

  // Affichage du chargement
  if (enChargement) {
    return <ChargementPage message="Chargement..." />
  }

  return (
    <div className="class-creation-container">
      <div className="container max-w-2xl px-4 py-6 space-y-6">
        {/* En-tête */}
        <div className="class-creation-header">
          <button 
            onClick={() => routeur.back()}
            className="class-creation-back-button"
            aria-label="Retour"
          >
            <ArrowLeft />
          </button>
          <h1 className="class-creation-title">Nouvelle classe</h1>
          <p className="class-creation-subtitle">Créer une nouvelle classe</p>
        </div>

        {/* État sans établissements */}
        {etablissements.length === 0 ? (
          <div className="class-creation-empty-state">
            <p className="class-creation-empty-message">
              Vous devez d'abord créer un établissement avant de créer des classes.
            </p>
            <button 
              onClick={() => routeur.push('/etablissements/nouveau')}
              className="class-creation-empty-button"
            >
              Créer un établissement
            </button>
          </div>
        ) : (
          <>
            {/* Carte du formulaire */}
            <div className="class-creation-card">
              <div className="class-creation-card-header">
                <h2 className="class-creation-card-title">Informations de la classe</h2>
                <p className="class-creation-card-description">
                  Renseignez les informations de votre nouvelle classe
                </p>
              </div>
              <div className="class-creation-card-content">
                <form onSubmit={gererSoumission} className="class-creation-form">
                  {/* Établissement */}
                  <div className="class-creation-field-group">
                    <label htmlFor="etablissement" className="class-creation-label required">
                      Établissement
                    </label>
                    <div className="class-creation-select">
                      <button
                        type="button"
                        id="etablissement"
                        className={`class-creation-select-trigger ${erreurs.etablissementId ? 'error' : ''}`}
                        onClick={() => setSelectOuvert('etablissement')}
                        aria-expanded={selectOuvert === 'etablissement'}
                        aria-haspopup="listbox"
                      >
                        <span>
                          {etablissementId 
                            ? etablissements.find((e) => e._id?.toString() === etablissementId || e.id === etablissementId)?.nom || 'Établissement'
                            : 'Sélectionner un établissement'}
                        </span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </button>
                      {selectOuvert === 'etablissement' && (
                        <div className="class-creation-select-content" role="listbox" aria-label="Sélectionner un établissement">
                          {etablissements.map((etab, idx) => {
                            const value = etab._id?.toString() || etab.id || etab.nom || `etab-${idx}`
                            return (
                              <div
                                key={value}
                                role="option"
                                className={`class-creation-select-item ${etablissementId === value ? 'is-selected' : ''}`}
                                onClick={() => {
                                  setEtablissementId(value)
                                  setSelectOuvert(null)
                                }}
                                aria-selected={etablissementId === value}
                              >
                                {etab.nom}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                    {erreurs.etablissementId && (
                      <div className="class-creation-error-message">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        {erreurs.etablissementId}
                      </div>
                    )}
                  </div>

                  {/* Nom et Niveau */}
                  <div className="class-creation-grid">
                    <div className="class-creation-field-group">
                      <label htmlFor="nom" className="class-creation-label required">
                        Nom de la classe
                      </label>
                      <input
                        id="nom"
                        type="text"
                        placeholder="Terminale S1"
                        value={nom}
                        onChange={(e) => setNom(e.target.value)}
                        className={`class-creation-input ${erreurs.nom ? 'error' : ''} ${nom.trim() ? 'valid' : ''}`}
                      />
                      {erreurs.nom && (
                        <div className="class-creation-error-message">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                          {erreurs.nom}
                        </div>
                      )}
                    </div>
                    <div className="class-creation-field-group">
                      <label htmlFor="niveau" className="class-creation-label required">
                        Niveau
                      </label>
                      <div className="class-creation-select">
                        <button
                          type="button"
                          id="niveau"
                          className={`class-creation-select-trigger ${erreurs.niveau ? 'error' : ''}`}
                          onClick={() => setSelectOuvert('niveau')}
                          aria-expanded={selectOuvert === 'niveau'}
                          aria-haspopup="listbox"
                        >
                          <span>{niveau || 'Sélectionner un niveau'}</span>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        </button>
                        {selectOuvert === 'niveau' && (
                          <div className="class-creation-select-content" role="listbox">
                            {NIVEAUX.map((n) => (
                              <button
                                key={n}
                                type="button"
                                className={`class-creation-select-item ${niveau === n ? 'is-selected' : ''}`}
                                onClick={() => {
                                  setNiveau(n)
                                  setSelectOuvert(null)
                                }}
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {erreurs.niveau && (
                        <div className="class-creation-error-message">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                          {erreurs.niveau}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="class-creation-actions">
                    <button
                      type="button"
                      className="class-creation-cancel-button"
                      onClick={() => routeur.back()}
                      disabled={enSoumission}
                    >
                      Annuler
                    </button>
                    <button 
                      type="submit" 
                      className="class-creation-submit-button"
                      disabled={enSoumission}
                    >
                      {enSoumission ? (
                        <>
                          <Loader2 />
                          Création en cours...
                        </>
                      ) : (
                        'Créer la classe'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Prévisualisation */}
            <div className="class-creation-preview">
              <div className="class-creation-preview-title">Aperçu</div>
              <div className="class-creation-preview-sample">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 10H3" />
                  <path d="M21 6H3" />
                  <path d="M21 14H3" />
                  <path d="M17 18H3" />
                </svg>
                <div className="class-creation-preview-info">
                  <div className="class-creation-preview-name">
                    {nom || 'Nom de la classe'}
                  </div>
                  <div className="class-creation-preview-level">
                    {niveau || 'Niveau'}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
