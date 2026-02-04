/**
 * Page de création d'un nouveau membre du personnel
 */

'use client'

import '@/styles/page-personnel-nouveau.css'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChargementPage } from '@/components/chargement'
import { FormulaireMembre } from '@/components/formulaire-personnel'
import { recupererEtablissementsOptions } from '@/lib/services/api'
import type { Etablissement } from '@/lib/types'

export default function PageNouveauPersonnel() {
  const router = useRouter()
  const [etablissements, setEtablissements] = useState<Etablissement[]>([])
  const [enChargement, setEnChargement] = useState(true)

  useEffect(() => {
    chargerEtablissements()
  }, [])

  async function chargerEtablissements() {
    try {
      const reponse = await recupererEtablissementsOptions({ projection: 'light' })
      if (reponse.succes && reponse.donnees) {
        setEtablissements(reponse.donnees)
      }
    } catch (erreur) {
      console.error('Erreur:', erreur)
    } finally {
      setEnChargement(false)
    }
  }

  if (enChargement) {
    return <ChargementPage message="Chargement..." />
  }

  return (
    <div className="container px-4 py-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Ajouter un membre du personnel</h1>
        <p className="text-muted-foreground">
          Créez un nouveau profil pour un enseignant, directeur, ou autre personnel
        </p>
      </div>

      <FormulaireMembre
        etablissements={etablissements}
        onSaved={() => {
          router.push('/personnel')
        }}
      />
    </div>
  )
}
