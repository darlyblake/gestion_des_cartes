/**
 * Page de modification d'un élève
 */

'use client'

import '@/styles/page-eleves-nouveau.css'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ChargementPage } from '@/components/chargement'
import { FormulaireEleve } from '@/components/formulaire-eleve'
import { useNotification } from '@/components/notification'
import { recupererEleve, recupererClasses, recupererEtablissements, modifierEleve } from '@/lib/services/api'
import type { Eleve, Classe, Etablissement, ModifierEleveDonnees } from '@/lib/types'

export default function PageModifierEleve() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [eleve, setEleve] = useState<Eleve | null>(null)
  const [classes, setClasses] = useState<Classe[]>([])
  const [etablissements, setEtablissements] = useState<Etablissement[]>([])
  const [enChargement, setEnChargement] = useState(true)

  const { afficherNotification } = useNotification()
  const [enEnvoi, setEnEnvoi] = useState(false)

  useEffect(() => {
    chargerDonnees()
  }, [id])

  async function chargerDonnees() {
    try {
      const [repEleve, repClasses, repEtab] = await Promise.all([
        recupererEleve(id),
        recupererClasses(),
        recupererEtablissements(),
      ])

      if (repEleve.succes && repEleve.donnees) {
        setEleve(repEleve.donnees)
      }

      if (repClasses.succes && repClasses.donnees) {
        setClasses(repClasses.donnees)
      }

      if (repEtab.succes && repEtab.donnees) {
        setEtablissements(repEtab.donnees)
      }
    } catch (erreur) {
      console.error('Erreur:', erreur)
      afficherNotification('erreur', 'Erreur lors du chargement des données')
    } finally {
      setEnChargement(false)
    }
  }

  if (enChargement) {
    return <ChargementPage message="Chargement..." />
  }

  if (!eleve) {
    return (
      <div className="container px-4 py-6">
        <p>Élève non trouvé</p>
      </div>
    )
  }

  return (
    <div className="page-eleve-nouveau">
      <div className="page-content">
        <div className="page-header">
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
            <button aria-label="Retour" onClick={() => router.back()}>
              ←
            </button>
            <div className="header-text">
              <h1>Modifier l'élève</h1>
              <p className="muted">{eleve.prenom} {eleve.nom}</p>
            </div>
          </div>
        </div>

        <FormulaireEleve
          eleve={eleve}
          classes={classes}
          etablissements={etablissements}
          onSoumettre={async (donnees: ModifierEleveDonnees) => {
            setEnEnvoi(true)
            try {
              // retry simple: 3 tentatives sur erreurs réseau
              let attempts = 0
              let lastResponse = null
              while (attempts < 3) {
                attempts += 1
                lastResponse = await modifierEleve(id, donnees)
                if (lastResponse.succes) break

                const errMsg = (lastResponse.erreur || '').toLowerCase()
                // si erreur réseau probable, attendre et retenter
                if (errMsg.includes('connexion') || errMsg.includes('failed to fetch') || errMsg.includes('network')) {
                  const delay = 300 * attempts
                  await new Promise((r) => setTimeout(r, delay))
                  continue
                }
                // autre erreur => ne pas retenter
                break
              }

              if (lastResponse?.succes) {
                afficherNotification('succes', 'Élève modifié avec succès')
                // navigation client-side; utiliser localhost si l'IP réseau pose problème
                router.push('/eleves')
              } else {
                const message = lastResponse?.erreur || 'Erreur lors de la modification'
                afficherNotification('erreur', message)
              }
            } catch (err) {
              console.error('Erreur lors de la modification élève:', err)
              afficherNotification('erreur', String((err as Error)?.message || 'Erreur inconnue'))
            } finally {
              setEnEnvoi(false)
            }
          }}
          onAnnuler={() => router.back()}
          enChargement={enEnvoi}
        />
      </div>
    </div>
  )
}
