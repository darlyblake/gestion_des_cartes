"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useNotification } from '@/components/notification'
import { ChargementPage } from '@/components/chargement'
import { ArrowLeft, Save, X, Palette, Building2, MapPin, Phone, Calendar, Type, Image as ImageIcon } from 'lucide-react'
import type { Etablissement } from '@/lib/types'

// Couleurs prédéfinies
const COULEURS_PREDEFINIES = [
  '#3b82f6', // Bleu
  '#10b981', // Vert
  '#ef4444', // Rouge
  '#8b5cf6', // Violet
  '#f59e0b', // Orange
  '#06b6d4', // Cyan
  '#ec4899', // Rose
  '#6366f1', // Indigo
]

// Polices disponibles
const POLICES_DISPONIBLES = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Montserrat',
  'Poppins',
  'Lato',
  'Nunito',
  'Source Sans Pro',
]

export default function PageModifierEtablissement() {
  const params = useParams() as { id?: string }
  const router = useRouter()
  const { afficherNotification } = useNotification()

  const [enChargement, setEnChargement] = useState(true)
  const [enSoumission, setEnSoumission] = useState(false)
  const [etablissement, setEtablissement] = useState<Partial<Etablissement>>({})
  const [erreurs, setErreurs] = useState<Record<string, string>>({})

  const id = params?.id

  useEffect(() => {
    if (!id) {
      afficherNotification('erreur', 'ID de l\'établissement manquant')
      router.push('/etablissements')
      return
    }

    async function charger() {
      setEnChargement(true)
      try {
        const res = await fetch(`/api/etablissements/${id}`)
        const json = await res.json()
        if (res.ok && json.succes && json.donnees) {
          setEtablissement(json.donnees)
        } else {
          afficherNotification('erreur', json.erreur || 'Impossible de récupérer l\'établissement')
          router.push('/etablissements')
        }
      } catch (err) {
        console.error(err)
        afficherNotification('erreur', 'Erreur réseau lors du chargement')
        router.push('/etablissements')
      } finally {
        setEnChargement(false)
      }
    }

    charger()
  }, [id, afficherNotification, router])

  const validerFormulaire = (): boolean => {
    const nouvellesErreurs: Record<string, string> = {}

    if (!etablissement.nom?.trim()) {
      nouvellesErreurs.nom = 'Le nom est requis'
    }

    if (!etablissement.adresse?.trim()) {
      nouvellesErreurs.adresse = 'L\'adresse est requise'
    }

    if (!etablissement.anneeScolaire?.trim()) {
      nouvellesErreurs.anneeScolaire = 'L\'année scolaire est requise'
    }

    setErreurs(nouvellesErreurs)
    return Object.keys(nouvellesErreurs).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEtablissement(prev => ({ ...prev, [name]: value }))
    // Supprimer l'erreur quand l'utilisateur corrige
    if (erreurs[name]) {
      setErreurs(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleColorSelect = (couleur: string) => {
    setEtablissement(prev => ({ ...prev, couleur }))
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validation de base
    if (!file.type.startsWith('image/')) {
      afficherNotification('erreur', 'Veuillez sélectionner une image')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      afficherNotification('erreur', 'L\'image ne doit pas dépasser 5MB')
      return
    }

    try {
      // Ici vous pourriez uploader l'image vers votre serveur
      // Pour l'exemple, on utilise un Data URL
      const reader = new FileReader()
      reader.onload = (event) => {
        setEtablissement(prev => ({ 
          ...prev, 
          logo: event.target?.result as string 
        }))
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Erreur lors du chargement du logo:', error)
      afficherNotification('erreur', 'Erreur lors du chargement du logo')
    }
  }

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validation de base
    if (!file.type.startsWith('image/')) {
      afficherNotification('erreur', 'Veuillez sélectionner une image')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      afficherNotification('erreur', 'L\'image ne doit pas dépasser 5MB')
      return
    }

    try {
      const reader = new FileReader()
      reader.onload = (event) => {
        setEtablissement(prev => ({ 
          ...prev, 
          signature: event.target?.result as string 
        }))
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Erreur lors du chargement de la signature:', error)
      afficherNotification('erreur', 'Erreur lors du chargement de la signature')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!id) {
      afficherNotification('erreur', 'ID de l\'établissement manquant')
      return
    }

    if (!validerFormulaire()) {
      afficherNotification('avertissement', 'Veuillez corriger les erreurs dans le formulaire')
      return
    }

    setEnSoumission(true)
    try {
      const payload: Partial<Etablissement> = {
        nom: etablissement.nom?.trim() || '',
        adresse: etablissement.adresse?.trim() || '',
        telephone: etablissement.telephone?.trim() || '',
        anneeScolaire: etablissement.anneeScolaire?.trim() || '',
        couleur: etablissement.couleur || COULEURS_PREDEFINIES[0],
        police: etablissement.police || POLICES_DISPONIBLES[0],
        logo: etablissement.logo || '',
        signature: etablissement.signature || '',
      }

      const res = await fetch(`/api/etablissements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json()
      if (res.ok && json.succes) {
        afficherNotification('succes', json.message || 'Établissement mis à jour avec succès')
        router.push(`/etablissements/${id}`)
      } else {
        afficherNotification('erreur', json.erreur || 'Erreur lors de la mise à jour')
      }
    } catch (err) {
      console.error(err)
      afficherNotification('erreur', 'Erreur réseau lors de la mise à jour')
    } finally {
      setEnSoumission(false)
    }
  }

  if (enChargement) return <ChargementPage message="Chargement de l'établissement..." />

  // Styles inline
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--color-gray-50) 0%, var(--color-gray-100) 100%)',
      padding: 'var(--space-6) var(--space-4)',
    } as React.CSSProperties,
    content: {
      maxWidth: '48rem',
      margin: '0 auto',
    } as React.CSSProperties,
    header: {
      marginBottom: 'var(--space-8)',
      position: 'relative' as const,
    },
    backButton: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      color: 'var(--color-text-secondary)',
      background: 'transparent',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-2) var(--space-3)',
      marginBottom: 'var(--space-4)',
      cursor: 'pointer',
      transition: 'all var(--duration-fast) var(--ease-out)',
    } as React.CSSProperties,
    title: {
      fontSize: 'var(--text-3xl)',
      fontWeight: 'var(--font-weight-bold)',
      color: 'var(--color-text-primary)',
      marginBottom: 'var(--space-2)',
      background: 'var(--gradient-primary)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    } as React.CSSProperties,
    subtitle: {
      fontSize: 'var(--text-lg)',
      color: 'var(--color-text-secondary)',
    } as React.CSSProperties,
    card: {
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-2xl)',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-lg)',
      overflow: 'hidden' as const,
      marginBottom: 'var(--space-6)',
    } as React.CSSProperties,
    cardHeader: {
      padding: 'var(--space-6)',
      background: 'linear-gradient(135deg, var(--color-primary-50) 0%, transparent 100%)',
      borderBottom: '1px solid var(--color-separator)',
    } as React.CSSProperties,
    cardTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      fontSize: 'var(--text-xl)',
      fontWeight: 'var(--font-weight-semibold)',
      color: 'var(--color-text-primary)',
      marginBottom: 'var(--space-1)',
    } as React.CSSProperties,
    cardDescription: {
      fontSize: 'var(--text-sm)',
      color: 'var(--color-text-tertiary)',
    } as React.CSSProperties,
    form: {
      padding: 'var(--space-6)',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 'var(--space-6)',
    } as React.CSSProperties,
    section: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 'var(--space-4)',
      paddingBottom: 'var(--space-6)',
      borderBottom: '1px solid var(--color-separator)',
    } as React.CSSProperties,
    sectionTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      fontSize: 'var(--text-lg)',
      fontWeight: 'var(--font-weight-semibold)',
      color: 'var(--color-text-primary)',
    } as React.CSSProperties,
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: 'var(--space-4)',
    } as React.CSSProperties,
    fieldGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 'var(--space-2)',
    } as React.CSSProperties,
    label: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-1)',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--font-weight-medium)',
      color: 'var(--color-text-primary)',
    } as React.CSSProperties,
    required: {
      color: 'var(--color-destructive-500)',
    } as React.CSSProperties,
    input: {
      width: '100%',
      padding: 'var(--space-3) var(--space-4)',
      fontSize: 'var(--text-sm)',
      color: 'var(--color-text-primary)',
      background: 'var(--color-surface)',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      transition: 'all var(--duration-fast) var(--ease-out)',
    } as React.CSSProperties,
    select: {
      width: '100%',
      padding: 'var(--space-3) var(--space-4)',
      fontSize: 'var(--text-sm)',
      color: 'var(--color-text-primary)',
      background: 'var(--color-surface)',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      cursor: 'pointer',
      appearance: 'none' as const,
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right var(--space-3) center',
      backgroundSize: '1.25em',
      paddingRight: 'var(--space-10)',
    } as React.CSSProperties,
    error: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-1)',
      fontSize: 'var(--text-xs)',
      color: 'var(--color-destructive-500)',
      marginTop: 'var(--space-1)',
    } as React.CSSProperties,
    colorsContainer: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: 'var(--space-3)',
      marginTop: 'var(--space-2)',
    } as React.CSSProperties,
    colorOption: {
      width: '2.5rem',
      height: '2.5rem',
      borderRadius: 'var(--radius-full)',
      border: '3px solid transparent',
      cursor: 'pointer',
      transition: 'all var(--duration-fast) var(--ease-out)',
    } as React.CSSProperties,
    logoUpload: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-3)',
      width: '12rem',
      height: '12rem',
      background: 'var(--color-surface)',
      border: '2px dashed var(--color-border)',
      borderRadius: 'var(--radius-xl)',
      cursor: 'pointer',
      transition: 'all var(--duration-fast) var(--ease-out)',
      overflow: 'hidden' as const,
    } as React.CSSProperties,
    logoPreview: {
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const,
      borderRadius: 'var(--radius-lg)',
    } as React.CSSProperties,
    actions: {
      display: 'flex',
      gap: 'var(--space-3)',
      justifyContent: 'flex-end' as const,
      paddingTop: 'var(--space-6)',
      borderTop: '1px solid var(--color-separator)',
    } as React.CSSProperties,
    button: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-2)',
      padding: 'var(--space-3) var(--space-6)',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--font-weight-medium)',
      borderRadius: 'var(--radius-lg)',
      cursor: 'pointer',
      transition: 'all var(--duration-fast) var(--ease-out)',
      border: 'none',
    } as React.CSSProperties,
    buttonPrimary: {
      background: 'var(--gradient-primary)',
      color: 'var(--color-primary-foreground)',
      boxShadow: 'var(--shadow-md)',
    } as React.CSSProperties,
    buttonSecondary: {
      background: 'transparent',
      color: 'var(--color-text-secondary)',
      border: '1px solid var(--color-border)',
    } as React.CSSProperties,
    preview: {
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-xl)',
      padding: 'var(--space-6)',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-sm)',
    } as React.CSSProperties,
    previewTitle: {
      fontSize: 'var(--text-lg)',
      fontWeight: 'var(--font-weight-semibold)',
      color: 'var(--color-text-primary)',
      marginBottom: 'var(--space-4)',
    } as React.CSSProperties,
    previewCard: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-4)',
      padding: 'var(--space-4)',
      background: `${etablissement.couleur || COULEURS_PREDEFINIES[0]}10`,
      border: `2px solid ${etablissement.couleur || COULEURS_PREDEFINIES[0]}`,
      borderRadius: 'var(--radius-lg)',
    } as React.CSSProperties,
  }

  const getInputStyle = (field: string, value?: string) => ({
    ...styles.input,
    ...(erreurs[field] ? {
      borderColor: 'var(--color-destructive-500)',
      boxShadow: '0 0 0 1px var(--color-destructive-500)',
    } : value?.trim() ? {
      borderColor: 'var(--color-success-500)',
    } : {}),
    fontFamily: field === 'police' ? etablissement.police : 'inherit',
    ...(enSoumission ? { opacity: 0.7, cursor: 'not-allowed' } : {}),
  })

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <button
            onClick={() => router.back()}
            style={styles.backButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-muted)'
              e.currentTarget.style.borderColor = 'var(--color-primary-300)'
              e.currentTarget.style.color = 'var(--color-primary-600)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'var(--color-border)'
              e.currentTarget.style.color = 'var(--color-text-secondary)'
            }}
          >
            <ArrowLeft size={16} />
            Retour
          </button>
          <h1 style={styles.title}>Modifier l'établissement</h1>
          <p style={styles.subtitle}>Mettez à jour les informations de votre établissement</p>
        </div>

        <div style={styles.grid}>
          {/* Formulaire */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitle}>
                <Building2 size={20} />
                Informations générales
              </div>
              <p style={styles.cardDescription}>
                Modifiez les détails de votre établissement scolaire
              </p>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              {/* Section Informations de base */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>
                  <Building2 size={18} />
                  Informations de base
                </h3>
                
                <div style={styles.grid}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>
                      Nom de l'établissement
                      <span style={styles.required}>*</span>
                    </label>
                    <input
                      name="nom"
                      value={etablissement.nom || ''}
                      onChange={handleChange}
                      placeholder="Lycée Jean Moulin"
                      style={getInputStyle('nom', etablissement.nom)}
                      disabled={enSoumission}
                    />
                    {erreurs.nom && (
                      <div style={styles.error}>
                        <div style={{width: 12, height: 12, borderRadius: '50%', background: 'var(--color-destructive-500)'}} />
                        {erreurs.nom}
                      </div>
                    )}
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>
                      <MapPin size={14} />
                      Adresse
                      <span style={styles.required}>*</span>
                    </label>
                    <input
                      name="adresse"
                      value={etablissement.adresse || ''}
                      onChange={handleChange}
                      placeholder="15 Rue de la République, 75001 Paris"
                      style={getInputStyle('adresse', etablissement.adresse)}
                      disabled={enSoumission}
                    />
                    {erreurs.adresse && (
                      <div style={styles.error}>
                        <div style={{width: 12, height: 12, borderRadius: '50%', background: 'var(--color-destructive-500)'}} />
                        {erreurs.adresse}
                      </div>
                    )}
                  </div>
                </div>

                <div style={styles.grid}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>
                      <Phone size={14} />
                      Téléphone
                    </label>
                    <input
                      name="telephone"
                      value={etablissement.telephone || ''}
                      onChange={handleChange}
                      placeholder="01 42 36 58 96"
                      style={getInputStyle('telephone', etablissement.telephone)}
                      disabled={enSoumission}
                    />
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>
                      <Calendar size={14} />
                      Année scolaire
                      <span style={styles.required}>*</span>
                    </label>
                    <input
                      name="anneeScolaire"
                      value={etablissement.anneeScolaire || ''}
                      onChange={handleChange}
                      placeholder="2025-2026"
                      style={getInputStyle('anneeScolaire', etablissement.anneeScolaire)}
                      disabled={enSoumission}
                    />
                    {erreurs.anneeScolaire && (
                      <div style={styles.error}>
                        <div style={{width: 12, height: 12, borderRadius: '50%', background: 'var(--color-destructive-500)'}} />
                        {erreurs.anneeScolaire}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Section Design */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>
                  <Palette size={18} />
                  Personnalisation
                </h3>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Couleur principale</label>
                  <div style={styles.colorsContainer}>
                    {COULEURS_PREDEFINIES.map((couleur) => (
                      <button
                        key={couleur}
                        type="button"
                        style={{
                          ...styles.colorOption,
                          background: couleur,
                          ...(etablissement.couleur === couleur ? {
                            borderColor: 'var(--color-white)',
                            boxShadow: `0 0 0 2px ${couleur}, 0 4px 12px rgba(0, 0, 0, 0.15)`,
                            transform: 'scale(1.1)',
                          } : {}),
                        }}
                        onClick={() => handleColorSelect(couleur)}
                        onMouseEnter={(e) => {
                          if (etablissement.couleur !== couleur) {
                            e.currentTarget.style.transform = 'scale(1.1)'
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (etablissement.couleur !== couleur) {
                            e.currentTarget.style.transform = 'scale(1)'
                            e.currentTarget.style.boxShadow = 'none'
                          }
                        }}
                      >
                        {etablissement.couleur === couleur && (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'bold',
                          }}>
                            ✓
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={styles.fieldGroup}>
                  <label htmlFor="police-select" style={styles.label}>
                    <Type size={14} />
                    Police d'écriture
                  </label>
                  <select
                    id="police-select"
                    name="police"
                    value={etablissement.police || POLICES_DISPONIBLES[0]}
                    onChange={handleChange}
                    style={{
                      ...styles.select,
                      fontFamily: etablissement.police || POLICES_DISPONIBLES[0],
                    }}
                    disabled={enSoumission}
                    aria-label="Police d'écriture"
                  >
                    {POLICES_DISPONIBLES.map((police) => (
                      <option key={police} value={police}>
                        {police}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Section Logo */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>
                  <ImageIcon size={18} />
                  Logo
                </h3>

                <label style={styles.logoUpload}>
                  {etablissement.logo ? (
                    <>
                      <img 
                        src={etablissement.logo} 
                        alt="Logo" 
                        style={styles.logoPreview}
                      />
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                        Cliquez pour changer le logo
                      </span>
                    </>
                  ) : (
                    <>
                      <ImageIcon size={32} style={{ color: 'var(--color-text-tertiary)' }} />
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                        Cliquez pour ajouter un logo
                      </span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        PNG, JPG - Max 5MB
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    style={{ display: 'none' }}
                    disabled={enSoumission}
                  />
                </label>
              </div>

              {/* Section Signature */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>
                  <ImageIcon size={18} />
                  Signature
                </h3>

                <label style={styles.logoUpload}>
                  {etablissement.signature ? (
                    <>
                      <img 
                        src={etablissement.signature} 
                        alt="Signature" 
                        style={styles.logoPreview}
                      />
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                        Cliquez pour changer la signature
                      </span>
                    </>
                  ) : (
                    <>
                      <ImageIcon size={32} style={{ color: 'var(--color-text-tertiary)' }} />
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                        Cliquez pour ajouter une signature
                      </span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        PNG, JPG - Max 5MB
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSignatureUpload}
                    style={{ display: 'none' }}
                    disabled={enSoumission}
                  />
                </label>
              </div>

              {/* Actions */}
              <div style={styles.actions}>
                <button
                  type="button"
                  style={{
                    ...styles.button,
                    ...styles.buttonSecondary,
                  }}
                  onClick={() => router.push(`/etablissements/${id}`)}
                  disabled={enSoumission}
                  onMouseEnter={(e) => {
                    if (!enSoumission) {
                      e.currentTarget.style.background = 'var(--color-muted)'
                      e.currentTarget.style.borderColor = 'var(--color-border-strong)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!enSoumission) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.borderColor = 'var(--color-border)'
                    }
                  }}
                >
                  <X size={16} />
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{
                    ...styles.button,
                    ...styles.buttonPrimary,
                    ...(enSoumission ? { opacity: 0.7, cursor: 'not-allowed' } : {}),
                  }}
                  disabled={enSoumission}
                  onMouseEnter={(e) => {
                    if (!enSoumission) {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!enSoumission) {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                    }
                  }}
                >
                  <Save size={16} />
                  {enSoumission ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </div>
            </form>
          </div>

          {/* Aperçu */}
          <div style={styles.preview}>
            <h3 style={styles.previewTitle}>Aperçu</h3>
            <div style={styles.previewCard}>
              {etablissement.logo ? (
                <img 
                  src={etablissement.logo} 
                  alt="Logo" 
                  style={{
                    width: '4rem',
                    height: '4rem',
                    borderRadius: 'var(--radius-md)',
                    objectFit: 'cover',
                    border: `2px solid ${etablissement.couleur || COULEURS_PREDEFINIES[0]}`,
                  }}
                />
              ) : (
                <div style={{
                  width: '4rem',
                  height: '4rem',
                  borderRadius: 'var(--radius-md)',
                  background: `${etablissement.couleur || COULEURS_PREDEFINIES[0]}20`,
                  border: `2px solid ${etablissement.couleur || COULEURS_PREDEFINIES[0]}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Building2 size={24} style={{ color: etablissement.couleur || COULEURS_PREDEFINIES[0] }} />
                </div>
              )}
              <div>
                <div style={{
                  fontFamily: etablissement.police || POLICES_DISPONIBLES[0],
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: etablissement.couleur || COULEURS_PREDEFINIES[0],
                }}>
                  {etablissement.nom || 'Nom de l\'établissement'}
                </div>
                <div style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                }}>
                  {etablissement.adresse || 'Adresse'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Styles globaux */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .container {
          animation: fadeIn 0.3s var(--ease-out);
        }

        @media (max-width: 48rem) {
          .grid {
            grid-template-columns: 1fr;
            gap: var(--space-4);
          }
          
          .card-header {
            padding: var(--space-4);
          }
          
          .form {
            padding: var(--space-4);
          }
          
          .actions {
            flex-direction: column;
          }
          
          .logo-upload {
            width: 100%;
            max-width: 12rem;
            margin: 0 auto;
          }
        }

        @media (max-width: 30rem) {
          .header {
            text-align: center;
          }
          
          .back-button {
            margin: 0 auto var(--space-4);
          }
          
          .title {
            font-size: var(--text-2xl);
          }
        }
      `}</style>
    </div>
  )
}