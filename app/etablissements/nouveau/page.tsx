/**
 * Page de création d'un nouvel établissement
 * Formulaire complet pour créer un établissement
 */

'use client'

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
  const [logo, setLogo] = useState('')
  const [signature, setSignature] = useState('')
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
   * Gère l'upload du logo
   */
  const gererUploadLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      afficherNotification('erreur', 'Veuillez sélectionner une image')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      afficherNotification('erreur', 'L\'image ne doit pas dépasser 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setLogo(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  /**
   * Gère l'upload de la signature
   */
  const gererUploadSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      afficherNotification('erreur', 'Veuillez sélectionner une image')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      afficherNotification('erreur', 'L\'image ne doit pas dépasser 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setSignature(event.target?.result as string)
    }
    reader.readAsDataURL(file)
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
        logo,
        signature,
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

  // Styles inline
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      padding: '2rem 1rem',
    } as React.CSSProperties,
    content: {
      maxWidth: '42rem',
      margin: '0 auto',
      padding: '1.5rem 1rem',
    } as React.CSSProperties,
    header: {
      textAlign: 'center' as const,
      marginBottom: '3rem',
      position: 'relative' as const,
    },
    backButton: {
      position: 'absolute' as const,
      left: 0,
      top: '50%',
      transform: 'translateY(-50%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '3rem',
      height: '3rem',
      borderRadius: '0.75rem',
      border: '2px solid #e2e8f0',
      background: 'white',
      color: '#64748b',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
    } as React.CSSProperties,
    title: {
      fontSize: '2.5rem',
      fontWeight: 800,
      background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: '0.5rem',
      letterSpacing: '-0.025em',
    } as React.CSSProperties,
    subtitle: {
      color: '#64748b',
      fontSize: '1.125rem',
      maxWidth: '32rem',
      margin: '0 auto',
      lineHeight: 1.6,
    } as React.CSSProperties,
    card: {
      background: 'white',
      borderRadius: '1.5rem',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
      overflow: 'hidden' as const,
      border: '1px solid #f1f5f9',
      marginBottom: '2rem',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    } as React.CSSProperties,
    cardHeader: {
      padding: '2rem 2rem 0.5rem',
      borderBottom: '1px solid #f8fafc',
    } as React.CSSProperties,
    cardTitle: {
      fontSize: '1.5rem',
      fontWeight: 700,
      color: '#1e293b',
      marginBottom: '0.5rem',
    } as React.CSSProperties,
    cardDescription: {
      color: '#64748b',
      fontSize: '0.95rem',
    } as React.CSSProperties,
    cardContent: {
      padding: '2rem',
    } as React.CSSProperties,
    form: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '2rem',
    } as React.CSSProperties,
    fieldGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
    } as React.CSSProperties,
    label: {
      fontSize: '0.875rem',
      fontWeight: 600,
      color: '#334155',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
    } as React.CSSProperties,
    input: {
      padding: '1rem 1.25rem',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: '#e2e8f0',
      borderRadius: '0.875rem',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      background: 'white',
      color: '#1e293b',
    } as React.CSSProperties,
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1.5rem',
    } as React.CSSProperties,
    errorMessage: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: '#ef4444',
      fontSize: '0.875rem',
      fontWeight: 500,
      marginTop: '0.25rem',
      padding: '0.5rem',
      background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0) 100%)',
      borderRadius: '0.5rem',
    } as React.CSSProperties,
    colorsContainer: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '0.75rem',
      alignItems: 'center',
    } as React.CSSProperties,
    colorOption: {
      width: '2.5rem',
      height: '2.5rem',
      borderRadius: '0.75rem',
      border: '3px solid transparent',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      position: 'relative' as const,
    } as React.CSSProperties,
    colorPicker: {
      width: '2.5rem',
      height: '2.5rem',
      border: 'none',
      borderRadius: '0.75rem',
      cursor: 'pointer',
      background: 'linear-gradient(45deg, #f8fafc, #e2e8f0)',
      padding: '0.25rem',
      transition: 'all 0.3s ease',
    } as React.CSSProperties,
    uploadBox: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
      width: '8rem',
      height: '8rem',
      background: 'white',
      border: '2px dashed #e2e8f0',
      borderRadius: '0.875rem',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      overflow: 'hidden' as const,
    } as React.CSSProperties,
    uploadImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const,
      borderRadius: '0.75rem',
    } as React.CSSProperties,
    select: {
      padding: '1rem 1.25rem',
      border: '2px solid #e2e8f0',
      borderRadius: '0.875rem',
      fontSize: '1rem',
      background: 'white',
      color: '#1e293b',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      appearance: 'none' as const,
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 1rem center',
      backgroundSize: '1.25em',
      paddingRight: '3rem',
    } as React.CSSProperties,
    actions: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'flex-end' as const,
      paddingTop: '1rem',
      borderTop: '1px solid #f1f5f9',
      marginTop: '1rem',
    } as React.CSSProperties,
    cancelButton: {
      padding: '1rem 2rem',
      border: '2px solid #e2e8f0',
      borderRadius: '0.875rem',
      background: 'white',
      color: '#64748b',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    } as React.CSSProperties,
    submitButton: {
      padding: '1rem 2rem',
      border: 'none',
      borderRadius: '0.875rem',
      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      color: 'white',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
    } as React.CSSProperties,
    preview: {
      background: 'white',
      borderRadius: '1.5rem',
      padding: '1.5rem',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
      border: '1px solid #f1f5f9',
    } as React.CSSProperties,
    previewTitle: {
      fontSize: '0.875rem',
      fontWeight: 600,
      color: '#64748b',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      marginBottom: '1rem',
    } as React.CSSProperties,
    previewSample: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '1rem 1.5rem',
      borderRadius: '1rem',
      border: '2px solid',
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      fontSize: '1.125rem',
      fontWeight: 600,
      transition: 'all 0.3s ease',
    } as React.CSSProperties,
  }

  // Fonction pour générer le style dynamique des boutons de couleur
  const getColorOptionStyle = (c: string) => ({
    ...styles.colorOption,
    backgroundColor: c,
    ...(couleur === c ? {
      borderColor: 'white',
      boxShadow: '0 0 0 2px #1e293b, 0 4px 12px rgba(0, 0, 0, 0.15)',
      transform: 'scale(1.1)',
    } : {}),
  })

  // Fonction pour obtenir le style d'input avec validation
  const getInputStyle = (field: string, value: string) => ({
    ...styles.input,
    ...(erreurs[field] ? {
      borderColor: '#ef4444',
      background: 'linear-gradient(0deg, rgba(239, 68, 68, 0.02) 0%, rgba(239, 68, 68, 0) 100%)',
    } : value.trim() ? {
      borderColor: '#10b981',
      background: 'linear-gradient(0deg, rgba(16, 185, 129, 0.02) 0%, rgba(16, 185, 129, 0) 100%)',
    } : {}),
    ...(enChargement ? { opacity: 0.5, cursor: 'not-allowed', background: '#f8fafc' } : {}),
  })

  // Style pour le bouton de retour au survol
  const getBackButtonStyle = () => ({
    ...styles.backButton,
    ':hover': {
      background: '#f8fafc',
      borderColor: '#3b82f6',
      color: '#3b82f6',
      transform: 'translateY(-50%) translateX(-4px)',
    },
  })

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* En-tête */}
        <div style={styles.header}>
          <button 
            onClick={() => routeur.back()}
            style={getBackButtonStyle()}
            aria-label="Retour"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f8fafc'
              e.currentTarget.style.borderColor = '#3b82f6'
              e.currentTarget.style.color = '#3b82f6'
              e.currentTarget.style.transform = 'translateY(-50%) translateX(-4px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white'
              e.currentTarget.style.borderColor = '#e2e8f0'
              e.currentTarget.style.color = '#64748b'
              e.currentTarget.style.transform = 'translateY(-50%)'
            }}
          >
            <ArrowLeft />
          </button>
          <h1 style={styles.title}>Nouvel établissement</h1>
          <p style={styles.subtitle}>Créer un nouvel établissement scolaire</p>
        </div>

        {/* Carte du formulaire */}
        <div 
          style={styles.card}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.03)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)'
          }}
        >
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Informations de l'établissement</h2>
            <p style={styles.cardDescription}>
              Remplissez les informations de votre nouvel établissement
            </p>
          </div>
          <div style={styles.cardContent}>
            <form onSubmit={gererSoumission} style={styles.form}>
              {/* Nom */}
              <div style={styles.fieldGroup}>
                <label htmlFor="nom" style={styles.label}>
                  Nom de l'établissement
                  <span style={{color: '#ef4444', fontSize: '1.2em', marginLeft: '0.25rem'}}>*</span>
                </label>
                <input
                  id="nom"
                  type="text"
                  placeholder="Lycée Jean Moulin"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  style={getInputStyle('nom', nom)}
                  disabled={enChargement}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6'
                    e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)'
                    e.target.style.transform = 'translateY(-1px)'
                  }}
                  onBlur={(e) => {
                    if (!erreurs.nom && !nom.trim()) {
                      e.target.style.borderColor = '#e2e8f0'
                    }
                    e.target.style.boxShadow = 'none'
                    e.target.style.transform = 'translateY(0)'
                  }}
                />
                {erreurs.nom && (
                  <div style={styles.errorMessage}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {erreurs.nom}
                  </div>
                )}
              </div>

              {/* Adresse */}
              <div style={styles.fieldGroup}>
                <label htmlFor="adresse" style={styles.label}>
                  Adresse
                  <span style={{color: '#ef4444', fontSize: '1.2em', marginLeft: '0.25rem'}}>*</span>
                </label>
                <input
                  id="adresse"
                  type="text"
                  placeholder="15 Rue de la République, 75001 Paris"
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  style={getInputStyle('adresse', adresse)}
                  disabled={enChargement}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6'
                    e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)'
                    e.target.style.transform = 'translateY(-1px)'
                  }}
                  onBlur={(e) => {
                    if (!erreurs.adresse && !adresse.trim()) {
                      e.target.style.borderColor = '#e2e8f0'
                    }
                    e.target.style.boxShadow = 'none'
                    e.target.style.transform = 'translateY(0)'
                  }}
                />
                {erreurs.adresse && (
                  <div style={styles.errorMessage}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {erreurs.adresse}
                  </div>
                )}
              </div>

              {/* Téléphone et Année scolaire */}
              <div style={styles.grid}>
                <div style={styles.fieldGroup}>
                  <label htmlFor="telephone" style={styles.label}>
                    Téléphone
                  </label>
                  <input
                    id="telephone"
                    type="tel"
                    placeholder="01 42 36 58 96"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    style={getInputStyle('telephone', telephone)}
                    disabled={enChargement}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6'
                      e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)'
                      e.target.style.transform = 'translateY(-1px)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0'
                      e.target.style.boxShadow = 'none'
                      e.target.style.transform = 'translateY(0)'
                    }}
                  />
                </div>
                <div style={styles.fieldGroup}>
                  <label htmlFor="anneeScolaire" style={styles.label}>
                    Année scolaire
                    <span style={{color: '#ef4444', fontSize: '1.2em', marginLeft: '0.25rem'}}>*</span>
                  </label>
                  <input
                    id="anneeScolaire"
                    type="text"
                    placeholder="2025-2026"
                    value={anneeScolaire}
                    onChange={(e) => setAnneeScolaire(e.target.value)}
                    style={getInputStyle('anneeScolaire', anneeScolaire)}
                    disabled={enChargement}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6'
                      e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)'
                      e.target.style.transform = 'translateY(-1px)'
                    }}
                    onBlur={(e) => {
                      if (!erreurs.anneeScolaire && !anneeScolaire.trim()) {
                        e.target.style.borderColor = '#e2e8f0'
                      }
                      e.target.style.boxShadow = 'none'
                      e.target.style.transform = 'translateY(0)'
                    }}
                  />
                  {erreurs.anneeScolaire && (
                    <div style={styles.errorMessage}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444">
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
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Couleur principale</label>
                <div style={styles.colorsContainer}>
                  {COULEURS_PREDEFINIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      style={getColorOptionStyle(c)}
                      onClick={() => setCouleur(c)}
                      aria-label={`Sélectionner la couleur ${c}`}
                      onMouseEnter={(e) => {
                        if (couleur !== c) {
                          e.currentTarget.style.transform = 'scale(1.1)'
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (couleur !== c) {
                          e.currentTarget.style.transform = 'scale(1)'
                          e.currentTarget.style.boxShadow = 'none'
                        }
                      }}
                    >
                      {couleur === c && (
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.875rem',
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                        }}>
                          ✓
                        </div>
                      )}
                    </button>
                  ))}
                  <input
                    type="color"
                    value={couleur}
                    onChange={(e) => setCouleur(e.target.value)}
                    style={styles.colorPicker}
                    title="Choisir une couleur personnalisée"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                </div>
              </div>

              {/* Police */}
              <div style={styles.fieldGroup}>
                <label htmlFor="police" style={styles.label}>
                  Police d'écriture
                </label>
                <select
                  id="police"
                  value={police}
                  onChange={(e) => setPolice(e.target.value)}
                  style={{...styles.select, fontFamily: police}}
                  disabled={enChargement}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6'
                    e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0'
                    e.target.style.boxShadow = 'none'
                  }}
                >
                  {POLICES_DISPONIBLES.map((p) => (
                    <option key={p} value={p} style={{ fontFamily: p }}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Logo */}
              <div style={styles.fieldGroup}>
                <label htmlFor="logo-upload" style={styles.label}>
                  Logo
                </label>
                <label htmlFor="logo-upload" style={{...styles.uploadBox, cursor: 'pointer'}}>
                  {logo ? (
                    <>
                      <img src={logo} alt="Logo" style={styles.uploadImage} />
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Cliquez pour changer</span>
                    </>
                  ) : (
                    <>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Ajouter un logo</span>
                    </>
                  )}
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={gererUploadLogo}
                    style={{ display: 'none' }}
                    disabled={enChargement}
                  />
                </label>
              </div>

              {/* Signature */}
              <div style={styles.fieldGroup}>
                <label htmlFor="signature-upload" style={styles.label}>
                  Signature
                </label>
                <label htmlFor="signature-upload" style={{...styles.uploadBox, cursor: 'pointer'}}>
                  {signature ? (
                    <>
                      <img src={signature} alt="Signature" style={styles.uploadImage} />
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Cliquez pour changer</span>
                    </>
                  ) : (
                    <>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Ajouter une signature</span>
                    </>
                  )}
                  <input
                    id="signature-upload"
                    type="file"
                    accept="image/*"
                    onChange={gererUploadSignature}
                    style={{ display: 'none' }}
                    disabled={enChargement}
                  />
                </label>
              </div>

              {/* Actions */}
              <div style={styles.actions}>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={() => routeur.back()}
                  disabled={enChargement}
                  onMouseEnter={(e) => {
                    if (!enChargement) {
                      e.currentTarget.style.background = '#f8fafc'
                      e.currentTarget.style.borderColor = '#94a3b8'
                      e.currentTarget.style.color = '#475569'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!enChargement) {
                      e.currentTarget.style.background = 'white'
                      e.currentTarget.style.borderColor = '#e2e8f0'
                      e.currentTarget.style.color = '#64748b'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }
                  }}
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  style={styles.submitButton}
                  disabled={enChargement}
                  onMouseEnter={(e) => {
                    if (!enChargement) {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.3)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!enChargement) {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }
                  }}
                >
                  {enChargement ? (
                    <>
                      <Loader2 style={{opacity: 0.8}} />
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
        <div style={styles.preview}>
          <div style={styles.previewTitle}>Aperçu</div>
          <div 
            style={{
              ...styles.previewSample,
              backgroundColor: `${couleur}20`,
              color: couleur,
              borderColor: couleur,
              fontFamily: police,
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width: '1.5rem', height: '1.5rem', flexShrink: 0}}>
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