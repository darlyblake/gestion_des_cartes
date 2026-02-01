/**
 * Page de modification d'un membre du personnel
 */

'use client'

import '@/styles/page-personnel-modifier.css'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ChargementPage } from '@/components/chargement'
import { FormulaireMembre } from '@/components/formulaire-personnel'
import { recupererPersonnelParId, recupererEtablissements } from '@/lib/services/api'
import type { Personnel, Etablissement } from '@/lib/types'

export default function PageModifierPersonnel() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [personnel, setPersonnel] = useState<Personnel | null>(null)
  const [etablissements, setEtablissements] = useState<Etablissement[]>([])
  const [enChargement, setEnChargement] = useState(true)

  useEffect(() => {
    chargerDonnees()
  }, [id])

  async function chargerDonnees() {
    try {
      const [repPersonnel, repEtablissements] = await Promise.all([
        recupererPersonnelParId(id),
        recupererEtablissements(),
      ])

      if (repPersonnel.succes && repPersonnel.donnees) {
        setPersonnel(repPersonnel.donnees)
      }

      if (repEtablissements.succes && repEtablissements.donnees) {
        setEtablissements(repEtablissements.donnees)
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

  if (!personnel) {
    return (
      <div className="container px-4 py-6">
        <p>Membre du personnel non trouvé</p>
      </div>
    )
  }

  return (
    <div className="container px-4 py-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Modifier le personnel</h1>
        <p className="text-muted-foreground">
          {personnel.prenom} {personnel.nom}
        </p>
      </div>

      <FormulaireMembre
        membre={personnel}
        etablissements={etablissements}
        onSaved={() => {
          router.push('/personnel')
        }}
      />
    </div>
  )
}
