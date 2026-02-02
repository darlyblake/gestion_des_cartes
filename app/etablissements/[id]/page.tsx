"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChargementPage } from '@/components/chargement'
import { useNotification } from '@/components/notification'
import { Building2, ArrowLeft, Pencil } from 'lucide-react'
import type { Etablissement } from '@/lib/types'

export default function PageEtablissementDetail() {
  const params = useParams() as { id?: string }
  const router = useRouter()
  const { afficherNotification } = useNotification()

  const [enChargement, setEnChargement] = useState(true)
  const [etablissement, setEtablissement] = useState<Etablissement | null>(null)

  const id = params?.id

  useEffect(() => {
    if (!id) {
      afficherNotification('erreur', 'ID manquant')
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
        } else if (res.status === 404) {
          afficherNotification('erreur', json.erreur || 'Établissement introuvable')
          router.push('/etablissements')
        } else {
          afficherNotification('erreur', json.erreur || 'Erreur lors du chargement')
        }
      } catch (err) {
        console.error(err)
        afficherNotification('erreur', 'Erreur réseau lors du chargement')
      } finally {
        setEnChargement(false)
      }
    }

    charger()
  }, [id, afficherNotification, router])

  if (enChargement) return <ChargementPage message="Chargement de l'établissement..." />
  if (!etablissement) return null

  return (
    <div className="container px-4 py-6">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <button onClick={() => router.back()} className="btn" aria-label="Retour">
          <ArrowLeft size={16} />
        </button>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{etablissement.nom}</h1>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          <Link href={`/etablissements/${id}/modifier`} className="btn btn-primary">
            <Pencil size={14} />
            Modifier
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        <div style={{ border: '1px solid #e6edf3', borderRadius: 12, padding: '1rem' }}>
          {etablissement.logo ? (
            <img src={etablissement.logo} alt="Logo" style={{ width: '100%', borderRadius: 8, objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: 8 }}>
              <Building2 size={48} />
            </div>
          )}

          <div style={{ marginTop: '1rem' }}>
            <div style={{ fontSize: '0.9rem', color: '#475569' }}>Adresse</div>
            <div style={{ fontWeight: 600 }}>{etablissement.adresse}</div>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <div style={{ fontSize: '0.9rem', color: '#475569' }}>Téléphone</div>
            <div>{etablissement.telephone}</div>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <div style={{ fontSize: '0.9rem', color: '#475569' }}>Année scolaire</div>
            <div>{etablissement.anneeScolaire}</div>
          </div>

          {etablissement.signature && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 6 }}>Signature enregistrée</div>
              <img src={etablissement.signature} alt="Signature" style={{ maxWidth: '100%', height: 'auto', objectFit: 'contain' }} />
            </div>
          )}
        </div>

        <div style={{ border: '1px solid #e6edf3', borderRadius: 12, padding: '1rem' }}>
          <h2 style={{ marginTop: 0 }}>Détails</h2>
          <dl style={{ display: 'grid', gridTemplateColumns: '150px 1fr', rowGap: '0.75rem' }}>
            <dt style={{ color: '#64748b' }}>Couleur</dt>
            <dd><span style={{ display: 'inline-block', width: 18, height: 18, background: etablissement.couleur, borderRadius: 6, border: '1px solid #e6edf3' }} /></dd>

            <dt style={{ color: '#64748b' }}>Police</dt>
            <dd>{etablissement.police}</dd>

            <dt style={{ color: '#64748b' }}>Nombre de classes</dt>
            <dd>{(etablissement as any).nombreClasses ?? '—'}</dd>

            <dt style={{ color: '#64748b' }}>Nombre d'élèves</dt>
            <dd>{(etablissement as any).nombreEleves ?? '—'}</dd>
          </dl>
        </div>
      </div>
    </div>
  )
}
