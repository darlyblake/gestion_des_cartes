/**
 * Page de création d'un nouvel établissement
 * Formulaire complet pour créer un établissement
 */

'use client'

import '@/styles/page-etablissements-nouveau.css'
import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useNotification } from '@/components/notification'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { creerEtablissement } from '@/lib/services/api'
import type { CreerEtablissementDonnees } from '@/lib/types'

/**
 * Couleurs prédéfinies pour les établissements
 */
const COULEURS_PREDEFINIES = [
  '#1e40af', // Bleu
  '#059669', // Vert
  '#dc2626', // Rouge
  '#7c3aed', // Violet
  '#ea580c', // Orange
  '#0891b2', // Cyan
]

/**
 * Polices disponibles
 */
const POLICES_DISPONIBLES = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
]

/**
 * Composant de la page création d'établissement
 */
export default function PageNouvelEtablissement() {
  const routeur = useRouter()
  const { afficherNotification } = useNotification()

  // États du formulaire
  const [nom, setNom] = useState('')
  const [adresse, setAdresse] = useState('')
  const [telephone, setTelephone] = useState('')
  const [anneeScolaire, setAnneeScolaire] = useState('2025-2026')
  const [couleur, setCouleur] = useState(COULEURS_PREDEFINIES[0])
  const [police, setPolice] = useState(POLICES_DISPONIBLES[0])
  const [enChargement, setEnChargement] = useState(false)
  const [erreurs, setErreurs] = useState<Record<string, string>>({})

  /**
   * Valide le formulaire
   */
  const validerFormulaire = (): boolean => {
    const nouvellesErreurs: Record<string, string> = {}

    if (!nom.trim()) nouvellesErreurs.nom = 'Le nom est requis'
    if (!adresse.trim()) nouvellesErreurs.adresse = 'L\'adresse est requise'
    if (!anneeScolaire.trim()) nouvellesErreurs.anneeScolaire = 'L\'année scolaire est requise'

    setErreurs(nouvellesErreurs)
    return Object.keys(nouvellesErreurs).length === 0
  }

  /**
   * Gère la soumission du formulaire
   */
  const gererSoumission = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!validerFormulaire()) return

    setEnChargement(true)
    try {
      const donnees: CreerEtablissementDonnees = {
        nom: nom.trim(),
        adresse: adresse.trim(),
        telephone: telephone.trim(),
        anneeScolaire: anneeScolaire.trim(),
        couleur,
        police,
      }

      const reponse = await creerEtablissement(donnees)

      if (reponse.succes) {
        afficherNotification('succes', 'Établissement créé avec succès')
        routeur.push('/etablissements')
      } else {
        afficherNotification('erreur', reponse.erreur || 'Erreur lors de la création')
      }
    } catch (erreur) {
      console.error('Erreur:', erreur)
      afficherNotification('erreur', 'Erreur lors de la création de l\'établissement')
    } finally {
      setEnChargement(false)
    }
  }

  return (
    <div className="creation-container">
      <div className="container max-w-2xl px-4 py-6 space-y-6">
        {/* En-tête */}
        <div className="creation-header">
          <button 
            onClick={() => routeur.back()}
            className="creation-back-button"
            aria-label="Retour"
          >
            <ArrowLeft />
          </button>
          <h1 className="creation-title">Nouvel établissement</h1>
          <p className="creation-subtitle">Créer un nouvel établissement scolaire</p>
        </div>

        {/* Carte du formulaire */}
        <div className="creation-card">
          <div className="creation-card-header">
            <h2 className="creation-card-title">Informations de l'établissement</h2>
            <p className="creation-card-description">
              Remplissez les informations de votre nouvel établissement
            </p>
          </div>
          <div className="creation-card-content">
            <form onSubmit={gererSoumission} className="creation-form">
              {/* Nom */}
              <div className="creation-field-group">
                <label htmlFor="nom" className="creation-label required">
                  Nom de l'établissement
                </label>
                <input
                  id="nom"
                  type="text"
                  placeholder="Lycée Jean Moulin"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className={`creation-input ${erreurs.nom ? 'error' : ''} ${nom.trim() ? 'valid' : ''}`}
                />
                {erreurs.nom && (
                  <div className="creation-error-message">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {erreurs.nom}
                  </div>
                )}
              </div>

              {/* Adresse */}
              <div className="creation-field-group">
                <label htmlFor="adresse" className="creation-label required">
                  Adresse
                </label>
                <input
                  id="adresse"
                  type="text"
                  placeholder="15 Rue de la République, 75001 Paris"
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  className={`creation-input ${erreurs.adresse ? 'error' : ''} ${adresse.trim() ? 'valid' : ''}`}
                />
                {erreurs.adresse && (
                  <div className="creation-error-message">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {erreurs.adresse}
                  </div>
                )}
              </div>

              {/* Téléphone et Année scolaire */}
              <div className="creation-grid">
                <div className="creation-field-group">
                  <label htmlFor="telephone" className="creation-label">
                    Téléphone
                  </label>
                  <input
                    id="telephone"
                    type="tel"
                    placeholder="01 42 36 58 96"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className={`creation-input ${telephone.trim() ? 'valid' : ''}`}
                  />
                </div>
                <div className="creation-field-group">
                  <label htmlFor="anneeScolaire" className="creation-label required">
                    Année scolaire
                  </label>
                  <input
                    id="anneeScolaire"
                    type="text"
                    placeholder="2025-2026"
                    value={anneeScolaire}
                    onChange={(e) => setAnneeScolaire(e.target.value)}
                    className={`creation-input ${erreurs.anneeScolaire ? 'error' : ''} ${anneeScolaire.trim() ? 'valid' : ''}`}
                  />
                  {erreurs.anneeScolaire && (
                    <div className="creation-error-message">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {erreurs.anneeScolaire}
                    </div>
                  )}
                </div>
              </div>

              {/* Couleur */}
              <div className="creation-field-group">
                <label className="creation-label">Couleur principale</label>
                <div className="creation-colors">
                  {COULEURS_PREDEFINIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`creation-color-option ${couleur === c ? 'selected' : ''}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setCouleur(c)}
                      aria-label={`Sélectionner la couleur ${c}`}
                    />
                  ))}
                  <input
                    type="color"
                    value={couleur}
                    onChange={(e) => setCouleur(e.target.value)}
                    className="creation-color-picker"
                    title="Choisir une couleur personnalisée"
                  />
                </div>
              </div>

              {/* Police */}
              <div className="creation-field-group">
                <label htmlFor="police" className="creation-label">
                  Police d'écriture
                </label>
                <select
                  id="police"
                  value={police}
                  onChange={(e) => setPolice(e.target.value)}
                  className="creation-select"
                  style={{ fontFamily: police }}
                >
                  {POLICES_DISPONIBLES.map((p) => (
                    <option key={p} value={p} style={{ fontFamily: p }}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="creation-actions">
                <button
                  type="button"
                  className="creation-cancel-button"
                  onClick={() => routeur.back()}
                  disabled={enChargement}
               >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="creation-submit-button"
                  disabled={enChargement}
                >
                  {enChargement ? (
                    <>
                      <Loader2 />
                      Création en cours...
                    </>
                  ) : (
                    "Créer l'établissement"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Prévisualisation */}
        <div className="creation-preview">
          <div className="creation-preview-title">Aperçu</div>
          <div 
            className="creation-preview-sample"
            style={{ 
              backgroundColor: `${couleur}20`,
              color: couleur,
              borderColor: couleur,
              fontFamily: police 
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>{nom || "Nom de l'établissement"}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
