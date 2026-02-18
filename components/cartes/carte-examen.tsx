/**
 * Template de carte d'examen (corrigé)
 * Format CR80 (85.6mm x 53.98mm)
 */

'use client'

import Image from 'next/image'
import type { Eleve, Classe, Etablissement } from '@/lib/types'
import { genererQRCodeDataURL, formaterDonneesCarteQR } from '@/lib/qrcode'

interface CarteExamenProps {
  eleve: Eleve
  classe: Classe
  etablissement: Etablissement
  avecQrCode?: boolean
}

function formaterDate(date?: Date | string | undefined): string {
  if (!date) return '—'
  const d = new Date(date)
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function CarteExamen({ eleve, classe, etablissement, avecQrCode = true }: CarteExamenProps) {
  const donneesQR = formaterDonneesCarteQR(eleve.id ?? '', eleve.matricule ?? '', etablissement.nom ?? '')
  const qrCodeUrl = genererQRCodeDataURL({ donnees: donneesQR, taille: 150, couleurModule: '#1e3a5f' })

  const dateNaissanceRaw: string | undefined =
    (eleve as any).dateNaissance ?? (eleve as any).date_naissance ?? (eleve as any).birthDate ?? undefined
  const lieuNaissanceRaw: string | undefined = (eleve as any).lieuNaissance ?? (eleve as any).lieu_naissance ?? undefined

  return (
    <div
      className="carte-scolaire carte-examen"
      style={{
        width: 323,
        height: 204,
        background: 'linear-gradient(145deg,#ffffff 0%,#f8fafc 100%)',
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        position: 'relative',
      }}
    >
      {/* bande gauche */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 6,
          background: 'linear-gradient(180deg,#2563eb 0%,#1e3a5f 100%)',
        }}
      />

      {/* en-tête */}
      <div
        style={{
          background: 'linear-gradient(135deg,#1e3a5f 0%,#2d4b7a 100%)',
          color: '#fff',
          padding: '8px 16px 8px 22px',
          textAlign: 'center',
          borderBottom: '2px solid #fbbf24',
        }}
      >
        <div style={{ fontSize: 9, letterSpacing: '2.5px', marginBottom: 2, opacity: 0.9, fontWeight: 500, textTransform: 'uppercase' }}>
          République du Cameroun
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{etablissement.nom}</div>
        <div
          style={{
            position: 'absolute',
            right: 12,
            top: 8,
            fontSize: 8,
            background: '#fbbf24',
            color: '#1e3a5f',
            padding: '2px 6px',
            borderRadius: 12,
            fontWeight: 'bold',
            letterSpacing: 0.5,
          }}
        >
          EXAMEN
        </div>
      </div>

      {/* corps */}
      <div style={{ padding: '12px 16px 12px 22px', display: 'flex', gap: 14, height: 132 }}>
        {/* photo */}
        <div style={{ width: 70, height: 88, borderRadius: 8, overflow: 'hidden', border: '2px solid #e2e8f0', background: '#f1f5f9', flexShrink: 0, position: 'relative' }}>
          {eleve.photo ? (
            <Image src={eleve.photo} alt={`Photo de ${eleve.prenom} ${eleve.nom}`} width={70} height={88} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', color: '#64748b', fontSize: 24, fontWeight: 300 }}>📷</div>
          )}

          <div style={{ position: 'absolute', bottom: 4, right: 4, width: 18, height: 18, borderRadius: '50%', background: '#fff', border: '1.5px solid #2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#2563eb', fontSize: 9 }}>RC</div>
        </div>

        {/* infos */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '65px 1fr', gap: 6, fontSize: 9 }}>
            <div style={{ color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.3 }}>Nom</div>
            <div style={{ fontWeight: 600, color: '#0f172a' }}>{eleve.nom}</div>

            <div style={{ color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.3 }}>Prénom</div>
            <div style={{ fontWeight: 600, color: '#0f172a' }}>{eleve.prenom}</div>

            <div style={{ color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.3 }}>Né(e) le</div>
            <div style={{ color: '#334155' }}>{formaterDate(dateNaissanceRaw)}</div>

            <div style={{ color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.3 }}>À</div>
            <div style={{ color: '#334155' }}>{lieuNaissanceRaw || '-'}</div>

            <div style={{ color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.3 }}>Sexe</div>
            <div style={{ color: '#334155' }}>{eleve.sexe === 'M' ? 'Masculin' : 'Féminin'}</div>

            <div style={{ color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.3 }}>Classe</div>
            <div style={{ fontWeight: 700, color: '#2563eb' }}>{classe?.nom || '-'}</div>
          </div>
        </div>

        {/* QR */}
        {avecQrCode && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#fff', padding: '6px 8px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <Image src={qrCodeUrl || '/placeholder.svg'} alt="QR Code" width={60} height={60} style={{ borderRadius: 4 }} />
            <span style={{ fontSize: 8, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.3 }}>Scan pour validation</span>
          </div>
        )}
      </div>

      {/* matricule */}
      <div style={{ position: 'absolute', bottom: 24, left: 22, fontSize: 11, fontWeight: 700, color: '#1e3a5f', letterSpacing: 1.5, fontFamily: 'JetBrains Mono, monospace', padding: '2px 8px', borderLeft: '3px solid #fbbf24', background: 'linear-gradient(90deg,#f8fafc 0%,transparent 100%)' }}>
        N° {eleve.matricule}
      </div>

      {/* pied */}
      <div style={{ position: 'absolute', bottom: 0, left: 6, right: 0, background: '#f8fafc', borderTop: '1px solid #e2e8f0', height: 24, display: 'flex', alignItems: 'center', paddingLeft: 22, color: '#64748b', fontSize: 9 }}>
        {etablissement.adresse || ''}
      </div>
    </div>
  )
}

export default CarteExamen
