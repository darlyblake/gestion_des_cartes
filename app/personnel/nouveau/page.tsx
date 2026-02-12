/**
 * Page de création d'un nouveau membre du personnel
 */

'use client'

import '@/styles/page-personnel-nouveau.css'
import { useRouter } from 'next/navigation'
import { ChargementPage } from '@/components/chargement'
import { FormulaireMembre } from '@/components/formulaire-personnel'
import { recupererEtablissementsList } from '@/lib/services/api'
import { useFetchCached } from '@/hooks/use-fetch-cached'
import type { Etablissement } from '@/lib/types'

export default function PageNouveauPersonnel() {
  const router = useRouter()

  // Utiliser le hook de caching pour récupérer les établissements
  const { data: etablissementsData, isLoading: enChargement } = useFetchCached(
    () => recupererEtablissementsList({ projection: 'light' }),
    'etablissements_list',
    5 * 60 * 1000 // Cache 5 minutes
  )
  const etablissements = (etablissementsData as Etablissement[] | null) ?? []

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
