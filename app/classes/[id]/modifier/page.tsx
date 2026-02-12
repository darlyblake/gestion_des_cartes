"use client"

import '@/styles/page-classes-nouveau.css'
import React from 'react'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ChargementPage } from '@/components/chargement'
import { useNotification } from '@/components/notification'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { recupererEtablissements, recupererClasse, modifierClasse } from '@/lib/services/api'
import type { Etablissement, ModifierClasseDonnees } from '@/lib/types'

const NIVEAUX = [
  '5ème année','6ème','5ème','4ème','3ème','Seconde','Première','Terminale','Licence 1','Licence 2','Licence 3','Master 1','Master 2'
]

export default function PageModifierClasse() {
  const params = useParams() as { id?: string }
  const id = params?.id
  const router = useRouter()
  const { afficherNotification } = useNotification()

  const [etablissements, setEtablissements] = useState<Etablissement[]>([])
  const [nom, setNom] = useState('')
  const [niveau, setNiveau] = useState('')
  const [etablissementId, setEtablissementId] = useState('')
  const [enChargement, setEnChargement] = useState(true)
  const [enSoumission, setEnSoumission] = useState(false)
  const [erreurs, setErreurs] = useState<Record<string, string>>({})

  useEffect(() => {
    async function charger() {
      setEnChargement(true)
      try {
        const [repEtab, repClasse] = await Promise.all([
          recupererEtablissements(),
          id ? recupererClasse(id) : Promise.resolve({ succes: false } as any),
        ])

        if (repEtab.succes && repEtab.donnees) setEtablissements(repEtab.donnees)

        if (repClasse.succes && repClasse.donnees) {
          const c = repClasse.donnees as any
          setNom(c.nom || '')
          setNiveau(c.niveau || '')
          // etablissement peut venir sous forme d'objet ou d'id
          const etabId = c.etablissementId || c.etablissement?._id || c.etablissement?.id || ''
          setEtablissementId(etabId)
        } else if (id && !repClasse.succes) {
          afficherNotification('erreur', repClasse.erreur || 'Classe introuvable')
          router.push('/classes')
        }
      } catch (err) {
        console.error(err)
        afficherNotification('erreur', 'Erreur lors du chargement')
        router.push('/classes')
      } finally {
        setEnChargement(false)
      }
    }

    charger()
  }, [id, afficherNotification, router])

  const validerFormulaire = (): boolean => {
    const nouvellesErreurs: Record<string, string> = {}
    if (!nom.trim()) nouvellesErreurs.nom = 'Le nom est requis'
    if (!niveau) nouvellesErreurs.niveau = 'Le niveau est requis'
    if (!etablissementId) nouvellesErreurs.etablissementId = 'L\'établissement est requis'
    setErreurs(nouvellesErreurs)
    return Object.keys(nouvellesErreurs).length === 0
  }

  const gererSoumission = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    if (!validerFormulaire()) return
    setEnSoumission(true)
    try {
      const donnees: ModifierClasseDonnees = {
        nom: nom.trim(),
        niveau,
        etablissementId,
      }

      const reponse = await modifierClasse(id, donnees)
      if (reponse.succes) {
        afficherNotification('succes', 'Classe modifiée avec succès')
        router.refresh() // Recharger les données de la page précédente
        router.push('/classes')
      } else {
        afficherNotification('erreur', reponse.erreur || 'Erreur lors de la modification')
      }
    } catch (err) {
      console.error(err)
      afficherNotification('erreur', 'Erreur lors de la modification')
    } finally {
      setEnSoumission(false)
    }
  }

  if (enChargement) return <ChargementPage message="Chargement..." />

  return (
    <div className="class-creation-container">
      <div className="container max-w-2xl px-4 py-6 space-y-6">
        <div className="class-creation-header">
          <button onClick={() => router.back()} className="class-creation-back-button" aria-label="Retour">
            <ArrowLeft />
          </button>
          <h1 className="class-creation-title">Modifier la classe</h1>
          <p className="class-creation-subtitle">Mettez à jour les informations de la classe</p>
        </div>

        <div className="class-creation-card">
          <div className="class-creation-card-header">
            <h2 className="class-creation-card-title">Informations de la classe</h2>
          </div>
          <div className="class-creation-card-content">
            <form onSubmit={gererSoumission} className="class-creation-form">
              <div className="class-creation-field-group">
                <label htmlFor="etablissement" className="class-creation-label required">Établissement</label>
                <select id="etablissement" value={etablissementId} onChange={(e) => setEtablissementId(e.target.value)} className="class-creation-input">
                  <option value="">Sélectionner un établissement</option>
                  {etablissements.map((etab) => (
                    <option key={etab._id ?? etab.id ?? etab.nom} value={etab._id?.toString() ?? etab.id ?? ''}>{etab.nom}</option>
                  ))}
                </select>
                {erreurs.etablissementId && <div className="class-creation-error-message">{erreurs.etablissementId}</div>}
              </div>

              <div className="class-creation-grid">
                <div className="class-creation-field-group">
                  <label htmlFor="nom" className="class-creation-label required">Nom de la classe</label>
                  <input id="nom" type="text" value={nom} onChange={(e) => setNom(e.target.value)} className={`class-creation-input ${erreurs.nom ? 'error' : ''} ${nom.trim() ? 'valid' : ''}`} />
                  {erreurs.nom && <div className="class-creation-error-message">{erreurs.nom}</div>}
                </div>

                <div className="class-creation-field-group">
                  <label htmlFor="niveau" className="class-creation-label required">Niveau</label>
                  <select id="niveau" value={niveau} onChange={(e) => setNiveau(e.target.value)} className="class-creation-input">
                    <option value="">Sélectionner un niveau</option>
                    {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                  {erreurs.niveau && <div className="class-creation-error-message">{erreurs.niveau}</div>}
                </div>
              </div>

              <div className="class-creation-actions">
                <button type="button" className="class-creation-cancel-button" onClick={() => router.back()} disabled={enSoumission}>Annuler</button>
                <button type="submit" className="class-creation-submit-button" disabled={enSoumission}>{enSoumission ? (<><Loader2 />Enregistrement...</>) : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
