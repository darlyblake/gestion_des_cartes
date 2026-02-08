/**
 * Page de liste des classes
 * Affiche toutes les classes avec leurs élèves
 */

'use client'

import '@/styles/page-classes.css'
import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useDebounce } from 'use-debounce'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChargementPage } from '@/components/chargement'
import { ModalSimple } from '@/components/modal-simple'
import { SkeletonList } from '@/components/skeleton-loader'
import { useNotification } from '@/components/notification'
import { 
  Plus, 
  Search, 
  BookOpen,
  Pencil,
  Trash2,
  Users,
  School,
} from 'lucide-react'
import { recupererClassesList, recupererEtablissementsList, supprimerClasse } from '@/lib/services/api'
import type { Classe, Etablissement } from '@/lib/types'

/**
 * Type étendu pour classe avec infos supplémentaires
 */
interface ClasseAvecDetails extends Classe {
  etablissement?: Etablissement
  nombreEleves?: number
}

/**
 * Composant de la page liste des classes
 */
export default function PageClasses() {
  // États
  const [classes, setClasses] = useState<ClasseAvecDetails[]>([])
  const [etablissements, setEtablissements] = useState<Etablissement[]>([])
  const [recherche, setRecherche] = useState('')
  const [debouncedRecherche] = useDebounce(recherche, 300)
  const [filtreEtablissement, setFiltreEtablissement] = useState<string>('tous')
  const [enChargement, setEnChargement] = useState(true)
  const [classeASupprimer, setClasseASupprimer] = useState<ClasseAvecDetails | null>(null)
  const [enSuppression, setEnSuppression] = useState(false)

  // Hook de notification
  const { afficherNotification } = useNotification()

  // Chargement des données
  useEffect(() => {
    async function chargerDonnees() {
      try {
        const [classesData, etablissementsData] = await Promise.all([
          recupererClassesList(),
          recupererEtablissementsList({ projection: 'light' }),
        ])

        setClasses(classesData as ClasseAvecDetails[])
        setEtablissements(etablissementsData)
      } catch (erreur) {
        console.error('Erreur:', erreur)
        afficherNotification('erreur', 'Erreur lors du chargement des données')
      } finally {
        setEnChargement(false)
      }
    }

    chargerDonnees()
  }, [afficherNotification])

  // Filtrage des classes
  const classesFiltrees = useMemo(() => {
    return classes.filter(c => {
      const correspondRecherche = 
        c.nom.toLowerCase().includes(debouncedRecherche.toLowerCase()) ||
        c.niveau.toLowerCase().includes(debouncedRecherche.toLowerCase())
      
      const correspondEtablissement = 
        filtreEtablissement === 'tous' || c.etablissementId === filtreEtablissement

      return correspondRecherche && correspondEtablissement
    })
  }, [classes, debouncedRecherche, filtreEtablissement])

  // Gestion de la suppression
  const gererSuppression = async () => {
    if (!classeASupprimer) return

    setEnSuppression(true)
    try {
      const idClasse = classeASupprimer._id || classeASupprimer.id || ''
      if (!idClasse) throw new Error('ID de la classe manquant')

      const reponse = await supprimerClasse(idClasse)

      if (reponse.succes) {
        setClasses(prev => prev.filter(c => (c._id || c.id) !== idClasse))
        afficherNotification('succes', 'Classe supprimée avec succès')
      } else {
        afficherNotification('erreur', reponse.erreur || 'Erreur lors de la suppression')
      }
    } catch (erreur) {
      console.error('❌ Erreur suppression:', erreur)
      afficherNotification('erreur', 'Erreur lors de la suppression')
    } finally {
      setEnSuppression(false)
      setClasseASupprimer(null)
    }
  }

  // Affichage du chargement
  if (enChargement) {
    return (
      <div className="classes-container">
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1rem' }}>
          <div className="space-y-3 mb-6">
            <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          </div>
          <SkeletonList count={6} />
        </div>
      </div>
    )
  }

  return (
    <div className="classes-container">
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1rem' }}>
        {/* En-tête */}
        <div className="classes-header">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div>
              <h1 className="classes-title">
                Classes
              </h1>
              <p className="classes-count">
                {classes.length} classe{classes.length > 1 ? 's' : ''} créée{classes.length > 1 ? 's' : ''}
              </p>
            </div>
            <Link href="/classes/nouveau" className="classes-primary-button">
              <Plus />
              Nouvelle classe
            </Link>
          </div>
        </div>

        {/* Filtres */}
        <div className="classes-filters">
          <div className="classes-search">
            <input
              type="text"
              placeholder="Rechercher une classe..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="classes-search-input"
            />
            <Search className="classes-search-icon" />
          </div>
          <div className="classes-filter-select">
            <Select value={filtreEtablissement} onValueChange={setFiltreEtablissement}>
              <SelectTrigger className="classes-filter-trigger">
                <SelectValue placeholder="Filtrer par établissement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les établissements</SelectItem>
                {etablissements.map((etab) => {
                  const identifiant = etab.id ?? etab._id?.toString() ?? `etab-${etab.nom}`
                  return (
                    <SelectItem key={identifiant} value={identifiant}>
                      {etab.nom}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Liste des classes */}
        {classesFiltrees.length === 0 ? (
          <div className="classes-grid">
            <div className="classes-empty">
              <BookOpen className="classes-empty-icon" />
              <h3 className="classes-empty-title">
                {recherche || filtreEtablissement !== 'tous' ? 'Aucun résultat' : 'Aucune classe'}
              </h3>
              <p className="classes-empty-description">
                {recherche || filtreEtablissement !== 'tous'
                  ? 'Aucune classe ne correspond à vos critères'
                  : 'Commencez par créer votre première classe'}
              </p>
              {!recherche && filtreEtablissement === 'tous' && (
                <Link href="/classes/nouveau" className="classes-empty-button">
                  <Plus />
                  Créer une classe
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="classes-grid">
            {classesFiltrees.map((classe, idx) => {
              const identifiantClasse = classe.id ?? classe._id?.toString() ?? `classe-${idx}`
              return (
                <div
                  key={identifiantClasse}
                  className="class-card"
                  onClick={() => console.warn('🖱️ clic sur carte', identifiantClasse)}
                >
                  <div className="class-card-header">
                    <div className="class-card-title-section">
                      <div className="class-card-icon">
                        <BookOpen />
                      </div>
                      <div className="class-card-info">
                        <h3 className="class-card-name">{classe.nom}</h3>
                        <span className="class-card-level">{classe.niveau}</span>
                      </div>
                    </div>
                  </div>
                  <div className="class-card-content">
                    <div className="class-details">
                      {classe.etablissement && (
                        <div className="class-detail-item">
                          <School />
                          <span className="class-detail-text">{classe.etablissement.nom}</span>
                        </div>
                      )}
                      <div className="class-detail-item">
                        <Users />
                        <span className="class-detail-text">
                          {classe.nombreEleves || 0} élève{(classe.nombreEleves || 0) > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    <div className="class-actions">
                      <button 
                        type="button"
                                onClick={() => {
                                  const classeId = classe._id || classe.id
                                  window.location.href = `/eleves/nouveau?classeId=${classeId}`
                                }}
                        className="class-action-button primary"
                      >
                        <Plus size={16} />
                        Ajouter élève
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          const classeId = classe._id || classe.id
                          window.location.href = `/classes/${classeId}/modifier`
                        }}
                        className="class-action-icon edit"
                        title="Modifier"
                      >
                        <Pencil size={20} />
                        <span className="sr-only">Modifier</span>
                      </button>
                      <button 
                        type="button"
                        className="class-action-icon delete"
                        onClick={() => {
                          const nb = classe.nombreEleves || 0
                          if (nb > 0) {
                            afficherNotification('erreur', 'Impossible de supprimer : des élèves sont inscrits dans cette classe')
                            return
                          }
                          setClasseASupprimer(classe)
                        }}
                        title="Supprimer"
                      >
                        <Trash2 size={20} />
                        <span className="sr-only">Supprimer</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <ModalSimple
        ouvert={!!classeASupprimer}
        onFermer={() => setClasseASupprimer(null)}
        onConfirmer={gererSuppression}
        titre="Supprimer la classe"
        description={`Êtes-vous sûr de vouloir supprimer la classe "${classeASupprimer?.nom}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        enChargement={enSuppression}
      />

     
    </div>
  )
}
