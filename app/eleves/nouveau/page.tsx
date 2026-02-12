'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { FormulaireEleve } from '@/components/formulaire-eleve'
import { ChargementPage } from '@/components/chargement'
import { useNotification } from '@/components/notification'
import { ArrowLeft } from 'lucide-react'
import { recupererClassesList, recupererEtablissementsList, creerEleve } from '@/lib/services/api'
import { useFetchCached, invalidateCache } from '@/hooks/use-fetch-cached'
import type { CreerEleveDonnees, Etablissement, Classe } from '@/lib/types'
import '@/styles/page-eleves-nouveau.css'

export default function PageNouvelEleve() {
  const routeur = useRouter()
  const parametres = useSearchParams()
  const classeIdDefaut = parametres.get('classeId') || undefined
  const { afficherNotification } = useNotification()

  const [enSoumission, setEnSoumission] = useState(false)

  // Utiliser le hook de caching pour recuperer les classes et établissements
  const { data: classesData, isLoading: enChargementClasses } = useFetchCached(
    () => recupererClassesList(),
    'classes_list',
    5 * 60 * 1000 // Cache 5 minutes
  )
  const classes = (classesData as Classe[] | null) ?? []

  const { data: etablissementsData } = useFetchCached(
    () => recupererEtablissementsList({ projection: 'light' }),
    'etablissements_list',
    5 * 60 * 1000
  )
  const etablissements = (etablissementsData as Etablissement[] | null) ?? []
  
  const enChargement = enChargementClasses

  const gererSoumission = useCallback(async (donnees: CreerEleveDonnees) => {
    setEnSoumission(true)
    try {
      const reponse = await creerEleve(donnees)
      if (reponse.succes) {
        afficherNotification('succes', 'Eleve inscrit avec succes')
        invalidateCache('classes_list')
        // Redirection avec replace pour éviter que l'utilisateur puisse revenir en arrière
        routeur.replace('/eleves')
      } else {
        afficherNotification('erreur', reponse.erreur || 'Erreur lors de linscription')
      }
    } catch (err) {
      console.error(err)
      afficherNotification('erreur', 'Erreur lors de linscription')
    } finally {
      setEnSoumission(false)
    }
  }, [afficherNotification, routeur])

  if (enChargement) {
    return <ChargementPage message="Chargement..." />
  }

  return (
    <div className="page-eleve-nouveau">
      <header className="page-header">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => routeur.back()}
        >
          <ArrowLeft />
          <span className="sr-only">Retour</span>
        </Button>

        <div className="header-text">
          <h1>Nouvel eleve</h1>
          <p>Inscrire un nouvel eleve</p>
        </div>
      </header>

      <main className="page-content">
        {!classes || classes.length === 0 ? (
          <div className="etat-vide">
            <p>
              Vous devez dabord creer une classe avant dinscrire des eleves.
            </p>
            <Button onClick={() => routeur.push('/classes/nouveau')}>
              Creer une classe
            </Button>
          </div>
        ) : (
          <FormulaireEleve
            classes={classes}
            etablissements={etablissements}
            classeIdDefaut={classeIdDefaut}
            onSoumettre={gererSoumission}
            onAnnuler={() => routeur.back()}
            enChargement={enSoumission}
          />
        )}
      </main>
    </div>
  )
}
