/**
 * Template de carte scolaire classique recto-verso
 * Format CR80 (85.6mm x 53.98mm)
 * Design complet self-contained avec recto (élève) et verso (informations établissement)
 */

'use client'

import { genererQRCodeDataURL, formaterDonneesCarteQR } from '@/lib/qrcode'
import Image from 'next/image'
import { normaliserCouleur } from '@/lib/utils'
import type { Eleve, Classe, Etablissement } from '@/lib/types'

/**
 * Props du composant CarteClassique
 */
interface CarteClassiqueProps {
  /** Données de l'élève */
  eleve: Eleve
  /** Données de la classe */
  classe: Classe
  /** Données de l'établissement */
  etablissement: Etablissement
  /** Afficher le QR Code */
  avecQrCode?: boolean
  /** Face à afficher: recto (avant), verso (arrière), ou les-deux */
  face?: 'recto' | 'verso' | 'les-deux'
}

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
 * Composant RECTO de la carte (face avant - informations élève)
 */
function CarteRecto({ 
  eleve, 
  classe, 
  etablissement,
  avecQrCode = true,
}: Omit<CarteClassiqueProps, 'face'>) {
  const couleur = normaliserCouleur(etablissement.couleur)

  const donneesQR = formaterDonneesCarteQR(eleve.id ?? '', eleve.matricule ?? '', etablissement.nom ?? '')
  const qrCodeUrl = genererQRCodeDataURL({
    donnees: donneesQR,
    taille: 60,
    couleurModule: couleur,
  })

  const dateNaissanceRaw: string | undefined =
    (eleve as any).dateNaissance ??
    (eleve as any).date_naissance ??
    (eleve as any).birthDate ??
    (eleve as any).birthdate ??
    undefined

  const lieuNaissanceRaw: string | undefined =
    (eleve as any).lieuNaissance ??
    (eleve as any).lieu_naissance ??
    (eleve as any).placeOfBirth ??
    undefined

  const nationaliteRaw: string | undefined =
    (eleve as any).nationalite ??
    (eleve as any).nationality ??
    undefined

  return (
    <div 
      className="carte-scolaire carte-classique-recto"
      style={{
        width: '323px',
        height: '204px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        fontFamily: etablissement.police || 'Arial',
        position: 'relative',
      }}
    >
      {/* En-tête */}
      <div 
        style={{
          backgroundColor: couleur,
          color: '#ffffff',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div 
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#ffffff',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 'bold',
              color: couleur,
            }}
          >
            {(etablissement.nom ?? 'E').charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 'bold', lineHeight: '1.2' }}>
              {etablissement.nom ?? 'Établissement'}
            </div>
            <div style={{ fontSize: '9px', opacity: 0.9 }}>
              CARTE SCOLAIRE 
            </div>
          </div>
        </div>
        <div style={{ fontSize: '10px', textAlign: 'right', minWidth: '50px' }}>
          {etablissement.anneeScolaire ?? `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`}
        </div>
      </div>

      {/* Corps */}
      <div 
        style={{ 
          padding: '12px',
          display: 'flex',
          gap: '12px',
          height: 'calc(100% - 48px)',
        }}
      >
        {/* Photo */}
        <div 
          style={{
            width: '70px',
            height: '90px',
            backgroundColor: '#f3f4f6',
            borderRadius: '4px',
            overflow: 'hidden',
            flexShrink: 0,
            border: `2px solid ${couleur}`,
          }}
        >
          {eleve.photo ? (
            <Image
              src={eleve.photo}
              alt={`Photo de ${eleve.prenom ?? ''} ${eleve.nom ?? ''}`}
              width={70}
              height={90}
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
              📷
            </div>
          )}
        </div>

        {/* Infos élève */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div 
            style={{ 
              fontSize: '14px', 
              fontWeight: 'bold',
              color: couleur,
              marginBottom: '3px',
            }}
          >
            {`${eleve.prenom ?? ''} ${eleve.nom ?? ''}`.trim() || 'Élève'}
          </div>

          <div style={{ fontSize: '9px', color: '#4b5563', lineHeight: '1.4' }}>
            <div>
              <span style={{ color: '#9ca3af' }}>Matricule: </span>
              <span style={{ fontWeight: '600' }}>{eleve.matricule ?? '-'}</span>
            </div>
            <div>
              <span style={{ color: '#9ca3af' }}>Classe: </span>
              <span style={{ fontWeight: '600' }}>{classe?.nom ?? '-'}</span>
            </div>
            <div>
              <span style={{ color: '#9ca3af' }}>Né(e) le: </span>
              <span>{formaterDate(dateNaissanceRaw)}</span>
            </div>
            <div>
              <span style={{ color: '#9ca3af' }}>À: </span>
              <span>{lieuNaissanceRaw ?? '-'}</span>
            </div>
            <div>
              <span style={{ color: '#9ca3af' }}>Sexe: </span>
              <span>{eleve.sexe === 'M' ? 'Masculin' : 'Féminin'}</span>
            </div>
            <div>
              <span style={{ color: '#9ca3af' }}>Nationalité: </span>
              <span>{nationaliteRaw ?? '-'}</span>
            </div>
          </div>
        </div>

        {/* QR Code */}
        {avecQrCode && (
          <div 
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Image
              src={qrCodeUrl || "/placeholder.svg"}
              alt="QR Code"
              width={60}
              height={60}
            />
            <div style={{ fontSize: '7px', color: '#9ca3af' }}>
              Scan vérif.
            </div>
          </div>
        )}
      </div>

      {/* Pied */}
      <div 
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#f9fafb',
          borderTop: '1px solid #e5e7eb',
          padding: '4px 12px',
          fontSize: '8px',
          color: '#6b7280',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>{etablissement.adresse ?? ''}</span>
        <span>{etablissement.telephone ?? ''}</span>
      </div>

      {/* Indicateur RECTO */}
      <div style={{ position: 'absolute', bottom: '6px', right: '8px', fontSize: '6px', color: '#9ca3af', fontWeight: '700' }}>
        
      </div>
    </div>
  )
}

/**
 * Composant VERSO de la carte (face arrière - design minimaliste)
 * Design simple et épuré spécifique à la carte classique
 */
function CarteVerso({ etablissement }: Pick<CarteClassiqueProps, 'etablissement'>) {
  const couleur = normaliserCouleur(etablissement.couleur)

  return (
    <div
      className="carte-scolaire carte-classique-verso"
      style={{
        width: '323px',
        height: '204px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 8px 16px -2px rgb(0 0 0 / 0.15)',
        fontFamily: etablissement.police || 'Arial',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${couleur}20`,
      }}
    >
      {/* En-tête coloré premium */}
      <div
        style={{
          background: `linear-gradient(135deg, ${couleur} 0%, ${couleur}dd 100%)`,
          color: '#ffffff',
          padding: '12px 16px',
          textAlign: 'center',
          fontSize: '12px',
          fontWeight: 'bold',
          letterSpacing: '1.5px',
          boxShadow: `0 2px 8px ${couleur}40`,
        }}
      >
        INFORMATIONS IMPORTANTES
      </div>

      {/* Contenu principal avec layout deux colonnes */}
      <div
        style={{
          flex: 1,
          padding: '12px 14px',
          color: '#1f2937',
          display: 'flex',
          gap: '12px',
          fontSize: '9px',
          lineHeight: '1.4',
        }}
      >
        {/* Colonne Gauche */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Contact */}
          <div>
            <div style={{ fontWeight: '700', color: couleur, marginBottom: '4px', fontSize: '9px', borderBottom: `1px solid ${couleur}20`, paddingBottom: '3px' }}>
              📞 CONTACT
            </div>
            <div style={{ color: '#4b5563', fontSize: '8.5px', lineHeight: '1.3' }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '2px' }}>
                <span style={{ fontWeight: '600', minWidth: '28px' }}>Tél:</span>
                <span>{etablissement.telephone?.substring(0, 24) || '—'}</span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ fontWeight: '600', minWidth: '28px' }}>Email:</span>
                <span style={{ fontSize: '7.5px', wordBreak: 'break-all' }}>{etablissement.email?.substring(0, 28) || '—'}</span>
              </div>
            </div>
          </div>

          {/* Conditions */}
          <div>
            <div style={{ fontWeight: '700', color: couleur, marginBottom: '3px', fontSize: '8px', borderBottom: `1px solid ${couleur}20`, paddingBottom: '2px' }}>
              ⚠️ RÈGLES
            </div>
            <div style={{ color: '#4b5563', fontSize: '8px', lineHeight: '1.2' }}>
              <div>• Carte personnelle</div>
              <div>• À présenter à l'entrée</div>
              <div>• Conserver en bon état</div>
            </div>
          </div>
        </div>

        {/* Colonne Droite - Logo */}
        <div
          style={{
            flex: 0.6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderLeft: `1px solid ${couleur}20`,
            paddingLeft: '8px',
            justifyContent: 'flex-start',
            gap: '4px',
          }}
        >
          <div style={{ fontWeight: '700', color: couleur, fontSize: '9px', textAlign: 'center', letterSpacing: '0.3px' }}>
            LOGO
          </div>
          {etablissement.logo ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '2px',
                border: `1px solid ${couleur}20`,
                borderRadius: '2px',
                background: '#fafafa',
                flex: 1,
                minHeight: '30px',
                minWidth: '40px',
                overflow: 'hidden',
              }}
            >
              <img
                src={etablissement.logo}
                alt="Logo"
                style={{
                  objectFit: 'contain',
                  maxWidth: '100%',
                  maxHeight: '100%',
                 
                }}
              />
            </div>
          ) : (
            <div
              style={{
                fontSize: '6px',
                color: '#9ca3af',
                textAlign: 'center',
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderBottom: `1px dashed ${couleur}40`,
                padding: '4px 0',
                minHeight: '30px',
              }}
            >
              —
            </div>
          )}
        </div>
      </div>

      {/* Pied avec statistiques */}
          <div
              style={{
                background: `linear-gradient(90deg, ${couleur}05 0%, ${couleur}10 100%)`,
                padding: '8px 12px',
                borderTop: `2px solid ${couleur}`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '8px',
                color: '#6b7280',
                gap: '12px',
                boxShadow: `inset 0 1px 3px ${couleur}05`,
              }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: '700', color: couleur, marginBottom: '1px' }}>ANNÉE</div>
          <div style={{ fontWeight: '600' }}>{etablissement.anneeScolaire ?? '2025-2026'}</div>
        </div>
        <div style={{ height: '14px', width: '1px', background: `${couleur}30` }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: '700', color: couleur, marginBottom: '1px' }}>VALIDITÉ</div>
          <div style={{ fontWeight: '600' }}>31/08/{etablissement.anneeScolaire?.split('-')[1] || '2026'}</div>
        </div>
      </div>

      {/* Indicateur VERSO */}
      <div style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '8px', color: `${couleur}60`, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
        VERSO
      </div>
    </div>
  )
}

/**
 * Composant principal CarteClassique avec choix de recto, verso ou les deux
 */
export function CarteClassique({ 
  eleve, 
  classe, 
  etablissement,
  avecQrCode = true,
  face = 'recto',
}: CarteClassiqueProps) {
  const renderLesDeux = () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      {/* Recto */}
      <div style={{ textAlign: 'center' }}>
        <CarteRecto eleve={eleve} classe={classe} etablissement={etablissement} avecQrCode={avecQrCode} />
        <div style={{ marginTop: '8px', fontSize: '11px', fontWeight: '600', color: normaliserCouleur(etablissement.couleur) }}>
          RECTO
        </div>
      </div>

      {/* Verso */}
      <div style={{ textAlign: 'center' }}>
        <CarteVerso etablissement={etablissement} />
        <div style={{ marginTop: '8px', fontSize: '11px', fontWeight: '600', color: normaliserCouleur(etablissement.couleur) }}>
          VERSO
        </div>
      </div>
    </div>
  )

  switch (face) {
    case 'recto':
      return <CarteRecto eleve={eleve} classe={classe} etablissement={etablissement} avecQrCode={avecQrCode} />
    case 'verso':
      return <CarteVerso etablissement={etablissement} />
    case 'les-deux':
    default:
      return renderLesDeux()
  }
}
