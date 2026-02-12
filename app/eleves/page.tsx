/**
 * Page de liste des élèves
 * Affiche tous les élèves avec filtrage par établissement et par classe
 * Permet la gestion et l'accès aux cartes scolaires
 */

'use client'

import '@/styles/page-eleves.css'
import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
// ModalConfirmation remplacé par une modal inline pour un contrôle visuel direct
import { useNotification } from '@/components/notification'
import { 
  Plus, 
  Search, 
  Users,
  Pencil,
  Trash2,
  CreditCard,
  Calendar,
  MapPin,
  Building2,
  Filter,
} from 'lucide-react'
import { 
  recupererEleves, 
  recupererClasses, 
  recupererEtablissements,
  supprimerEleve 
} from '@/lib/services/api'
import type { Eleve, Classe, Etablissement } from '@/lib/types'

/**
 * Formate une date en français
 */
function formaterDate(date?: Date | string | undefined): string {
  if (!date) return '—'
  const d = new Date(date)
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Type étendu pour élève avec détails
 */
interface EleveAvecDetails extends Eleve {
  classe?: Classe
  etablissement?: Etablissement
}

/**
 * Composant de la page liste des élèves
 */
export default function PageEleves() {
  // États des données
  const [eleves, setEleves] = useState<EleveAvecDetails[]>([])
  const [classes, setClasses] = useState<Classe[]>([])
  const [etablissements, setEtablissements] = useState<Etablissement[]>([])
  
  // États des filtres
  const [recherche, setRecherche] = useState('')
  const [debouncedRecherche] = useDebounce(recherche, 300)
  const [filtreEtablissement, setFiltreEtablissement] = useState<string>('tous')
  const [filtreClasse, setFiltreClasse] = useState<string>('tous')
  
  // États de chargement et actions
  const [enChargement, setEnChargement] = useState(true)
  const [eleveASupprimer, setEleveASupprimer] = useState<EleveAvecDetails | null>(null)
  const [enSuppression, setEnSuppression] = useState(false)

  // Hook de notification
  const { afficherNotification } = useNotification()

  /**
   * Charge les données initiales (établissements et classes)
   */
  useEffect(() => {
    async function chargerDonneesInitiales() {
      try {
        const [repEtab, repClasses] = await Promise.all([
          recupererEtablissements(),
          recupererClasses(),
        ])

        if (repEtab.succes && repEtab.donnees) {
          setEtablissements(repEtab.donnees)
        }

        if (repClasses.succes && repClasses.donnees) {
          setClasses(repClasses.donnees)
        }
      } catch (erreur) {
        console.error('Erreur chargement données initiales:', erreur)
      }
    }

    chargerDonneesInitiales()
  }, [])

  /**
   * Charge les élèves avec les filtres appliqués
   * Appelle le backend avec les paramètres de filtre
   */
  const chargerEleves = useCallback(async () => {
    setEnChargement(true)
    try {
      // Construction des filtres pour l'API
      const filtres: { classeId?: string; etablissementId?: string } = {}
      
      if (filtreEtablissement !== 'tous') {
        filtres.etablissementId = filtreEtablissement
      }
      
      if (filtreClasse !== 'tous') {
        filtres.classeId = filtreClasse
      }

      // Appel API avec les filtres
      const reponse = await recupererEleves(filtres)

      if (reponse.succes && reponse.donnees) {
        setEleves(reponse.donnees as EleveAvecDetails[])
      } else {
        afficherNotification('erreur', reponse.erreur || 'Erreur lors du chargement')
      }
    } catch (erreur) {
      console.error('Erreur:', erreur)
      afficherNotification('erreur', 'Erreur lors du chargement des élèves')
    } finally {
      setEnChargement(false)
    }
  }, [filtreEtablissement, filtreClasse, afficherNotification])

  // Recharge les élèves quand les filtres changent
  useEffect(() => {
    chargerEleves()
  }, [chargerEleves])

  /**
   * Réinitialise le filtre de classe quand l'établissement change
   */
  useEffect(() => {
    setFiltreClasse('tous')
  }, [filtreEtablissement])

  // Filtrage local par recherche textuelle (avec debounce)
  const elevesFiltres = useMemo(() => {
    return eleves.filter(e => {
      const correspondRecherche = 
        e.nom.toLowerCase().includes(debouncedRecherche.toLowerCase()) ||
        e.prenom.toLowerCase().includes(debouncedRecherche.toLowerCase()) ||
        (e.matricule?.toLowerCase().includes(debouncedRecherche.toLowerCase()) ?? false)
      
      return correspondRecherche
    })
  }, [eleves, debouncedRecherche])

  // Classes filtrées par établissement sélectionné
  const classesFiltrees = useMemo(() => {
    return filtreEtablissement !== 'tous'
      ? classes.filter(c => c.etablissementId === filtreEtablissement)
      : classes
  }, [classes, filtreEtablissement])

  // Gestion de la suppression
  const gererSuppression = async () => {
    if (!eleveASupprimer) return

    const id = eleveASupprimer.id || eleveASupprimer._id || ''
    if (!id) {
      afficherNotification('erreur', 'ID de l\'élève manquant')
      setEleveASupprimer(null)
      return
    }

    setEnSuppression(true)
    try {
      const reponse = await supprimerEleve(id)
      if (reponse.succes) {
        setEleves(prev => prev.filter(e => (e.id || e._id) !== id))
        afficherNotification('succes', 'Élève supprimé avec succès')
      } else {
        afficherNotification('erreur', reponse.erreur || 'Erreur lors de la suppression')
      }
    } catch (erreur) {
      console.error('❌ Erreur suppression:', erreur)
      afficherNotification('erreur', 'Erreur lors de la suppression')
    } finally {
      setEnSuppression(false)
      setEleveASupprimer(null)
    }
  }

  // Affichage du chargement
  if (enChargement && eleves.length === 0) {
    return (
      <div className="students-container">
        <div className="container px-4 py-6 space-y-6">
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          </div>
          <SkeletonList count={8} />
        </div>
      </div>
    )
  }

  return (
    <div className="students-container">
      <div className="container px-4 py-6 space-y-6">
        {/* En-tête */}
        <div className="students-header">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="students-title">Élèves</h1>
              <p className="students-count">
                {elevesFiltres.length} élève{elevesFiltres.length > 1 ? 's' : ''}
                {filtreEtablissement !== 'tous' || filtreClasse !== 'tous' ? ' (filtré)' : ''}
              </p>
            </div>

            <div className="students-action-buttons">
              {filtreClasse !== 'tous' && elevesFiltres.length > 0 && (
                <Link
                  href={`/cartes?classeId=${filtreClasse}&mode=classe`}
                  className="generate-cards-badge"
                >
                  <CreditCard className="w-4 h-4" />
                  Cartes de la classe
                </Link>
              )}

              <Link href="/eleves/nouveau" className="students-primary-button">
                <Plus className="students-button-icon" />
                Nouvel élève
              </Link>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="students-filters-card">
          <div className="students-filters-header">
            <Filter className="students-filters-icon" />
            <h2 className="students-filters-title">Filtres</h2>
          </div>

          <div className="students-filters-grid">
            {/* Barre de recherche */}
            <div className="students-search">
              <Search className="students-search-icon" />
              <input
                type="text"
                placeholder="Rechercher un élève..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                className="students-search-input"
              />
            </div>

            {/* Filtre par établissement */}
            <Select value={filtreEtablissement} onValueChange={setFiltreEtablissement}>
              <SelectTrigger className="students-select-trigger">
                <div className="flex items-center gap-2">
                  <Building2 className="students-select-icon" />
                  <SelectValue placeholder="Tous les établissements" />
                </div>
              </SelectTrigger>
              <SelectContent className="students-select-content">
                <SelectItem value="tous">Tous les établissements</SelectItem>
                {etablissements.map((etab, idx) => (
                  <SelectItem key={etab.id || etab.nom} value={etab.id || etab.nom || `etab-${idx}`} className="students-select-item">
                    {etab.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtre par classe */}
            <div className="students-select">
              <button
                className="students-select-trigger"
                disabled={classesFiltrees.length === 0}
              >
                <div className="flex items-center gap-2">
                  <Users className="students-select-icon" />
                  <span>
                    {filtreClasse === 'tous'
                      ? 'Toutes les classes'
                      : classes.find(c => c.id === filtreClasse)?.nom || 'Classe'}
                  </span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Liste des élèves */}
        {elevesFiltres.length === 0 ? (
          <div className="students-empty">
            <div className="students-empty-icon">
              <Users className="w-full h-full" />
            </div>

            <h2 className="students-empty-title">
              {recherche || filtreClasse !== 'tous' || filtreEtablissement !== 'tous'
                ? 'Aucun résultat'
                : 'Aucun élève'}
            </h2>

            <p className="students-empty-description">
              {recherche || filtreClasse !== 'tous' || filtreEtablissement !== 'tous'
                ? 'Aucun élève ne correspond à vos critères de recherche'
                : 'Commencez par inscrire votre premier élève'
              }
            </p>

            {!recherche && filtreClasse === 'tous' && filtreEtablissement === 'tous' && (
              <Link href="/eleves/nouveau" className="students-empty-button">
                <Plus className="students-empty-button-icon" />
                Inscrire un élève
              </Link>
            )}
          </div>
        ) : (
          <div className="students-grid">
            {elevesFiltres.map((eleve, idx) => (
              <div
                key={eleve.id || eleve.matricule || `${eleve.prenom}-${eleve.nom}-${idx}`}
                className="student-card"
              >
                <div className="student-card-content">
                  {/* Header avec photo */}
                  <div className="student-header">
                    <div className="student-photo">
                      <Image
                        src={eleve.photo || '/placeholder.svg'}
                        alt={`Photo de ${eleve.prenom} ${eleve.nom}`}
                        width={64}
                        height={64}
                        className="student-photo-image"
                      />
                    </div>

                    <div className="student-info">
                      <h3 className="student-name">
                        {eleve.prenom} {eleve.nom}
                      </h3>
                      <p className="student-matricule">{eleve.matricule}</p>

                      <div className="student-badges">
                        {eleve.classe && (
                          <span className="student-class-badge">
                            {eleve.classe.nom}
                          </span>
                        )}
                      </div>

                      {eleve.etablissement && (
                        <p className="student-establishment">
                          {eleve.etablissement.nom}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Informations supplémentaires */}
                  <div className="student-details">
                    <div className="student-detail-item">
                      <Calendar className="student-detail-icon" />
                      <span className="student-detail-text">
                        Né(e) le {formaterDate(eleve.dateNaissance)}
                      </span>
                    </div>

                    {eleve.lieuNaissance && (
                      <div className="student-detail-item">
                        <MapPin className="student-detail-icon" />
                        <span className="student-detail-text">
                          {eleve.lieuNaissance}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="student-actions">
                    <Link
                      href={`/cartes?eleveId=${eleve.id}`}
                      className="student-card-button card-action"
                    >
                      <CreditCard className="student-action-icon-svg" />
                      Carte
                    </Link>

                    <Link
                      href={`/eleves/${eleve.id}/modifier`}
                      className="student-action-icon edit"
                      title="Modifier l'élève"
                    >
                      <Pencil className="student-action-icon-svg" />
                    </Link>

                    <button
                      className="student-action-icon delete"
                      onClick={() => setEleveASupprimer(eleve)}
                      title="Supprimer l'élève"
                    >
                      <Trash2 className="student-action-icon-svg" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ModalSimple
        ouvert={!!eleveASupprimer}
        onFermer={() => setEleveASupprimer(null)}
        onConfirmer={gererSuppression}
        titre="Supprimer l'élève"
        description={`Êtes-vous sûr de vouloir supprimer "${eleveASupprimer?.prenom} ${eleveASupprimer?.nom}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        enChargement={enSuppression}
      />
    </div>
  )
}
