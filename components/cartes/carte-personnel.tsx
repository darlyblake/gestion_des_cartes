'use client'

import { genererQRCodeDataURL, formaterDonneesCartePersonnel } from '@/lib/qrcode'
import type { Etablissement, Personnel, RolePersonnel } from '@/lib/types'
import { useEffect, useState } from 'react'

export const ROLE_PERSONNEL_LABELS: Record<RolePersonnel, string> = {
  directeur: 'Directeur',
  enseignant: 'Enseignant',
  censeur: 'Censeur',
  surveillant: 'Surveillant Général',
  informaticien: 'Informaticien',
  secretaire: 'Secrétaire',
  gestionnaire: 'Gestionnaire',
  infirmier: 'Infirmier',
  bibliothecaire: 'Bibliothécaire',
  autre: 'Autre',
}

interface CartePersonnelRectoVersoProps {
  personnel: Personnel
  etablissement: Etablissement
  avecQrCode?: boolean
  face?: 'recto' | 'verso' | 'les-deux'
}

export function CartePersonnelRectoVerso({
  personnel,
  etablissement,
  avecQrCode = true,
  face = 'les-deux'
}: CartePersonnelRectoVersoProps) {
  const roleLabel = ROLE_PERSONNEL_LABELS[personnel.role] ?? personnel.role
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const identifiantPersonnel = (personnel.matricule && personnel.matricule.trim().length > 0)
    ? personnel.matricule.toUpperCase()
    : personnel.id.slice(-8).toUpperCase()
  const emailContact = personnel.email || etablissement.email
  const telephoneContact = personnel.telephone || etablissement.telephone
  const siteContact = etablissement.siteWeb

  useEffect(() => {
    if (avecQrCode) {
      const url = genererQRCodeDataURL({
        donnees: formaterDonneesCartePersonnel(personnel.id, personnel.role, etablissement.nom),
        taille: 100,
        couleurFond: 'transparent',
        couleurModule: '#1e293b',
      })
      setQrCodeUrl(url)
    }
  }, [personnel, etablissement, avecQrCode])

  const renderRecto = () => (
    <div
      className="carte-personnel-recto"
      style={{
        width: '85.6mm',
        height: '54mm',
        borderRadius: '12px',
        overflow: 'hidden',
        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
        color: '#1e293b',
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        position: 'relative',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e2e8f0',
      }}
    >
      {/* Bandeau supérieur institutionnel */}
      <div
        style={{
          height: '40px',
          background: `linear-gradient(90deg, ${etablissement.couleur} 0%, ${etablissement.couleur}80 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            {etablissement.nom.charAt(0)}
          </div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>
            {etablissement.nom}
          </div>
        </div>
        <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '500' }}>
          {etablissement.anneeScolaire}
        </div>
      </div>

      {/* Contenu principal */}
      <div style={{ padding: '16px 2px', display: 'flex', gap: '20px', height: 'calc(100% - 40px)' }}>
        {/* Photo et infos de base */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0 }}>
          <div
            style={{
              width: '60px',
              height: '75px',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '2px solid #e2e8f0',
              background: '#f1f5f9',
            }}
          >
            <img
              src={personnel.photo || '/placeholder.svg?height=75&width=60'}
              alt={`${personnel.prenom} ${personnel.nom}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '10px',
                fontWeight: '600',
                color: '#64748b',
                letterSpacing: '0.05em',
                marginBottom: '2px',
              }}
            >
              ID PERSONNEL
            </div>
            <div
              style={{
                fontSize: '9px',
                fontFamily: 'monospace',
                color: '#475569',
                background: '#f1f5f9',
                padding: '3px 6px',
                borderRadius: '4px',
                letterSpacing: '1px',
              }}
            >
              {identifiantPersonnel}
            </div>
          </div>
        </div>

        {/* Informations détaillées */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: '1px' }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#1e293b', lineHeight: '1.1' }}>
              {personnel.prenom.toUpperCase()}
            </div>
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', lineHeight: '1' }}>
              {personnel.nom.toUpperCase()}
            </div>
            <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px', fontWeight: '500' }}>
              {personnel.fonction}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '10px', color: '#64748b', minWidth: '50px' }}>Rôle :</span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#1e293b',
                  background: 'linear-gradient(90deg, #f1f5f9, #e2e8f0)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                }}
              >
                {roleLabel}
              </span>
            </div>

            {telephoneContact && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '10px', color: '#64748b', minWidth: '50px' }}>Tél :</span>
                <span style={{ fontSize: '11px', fontWeight: '500', color: '#1e293b' }}>
                  {telephoneContact}
                </span>
              </div>
            )}

            {emailContact && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '10px', color: '#64748b', minWidth: '50px' }}>Email :</span>
                <span style={{ fontSize: '10px', fontWeight: '600', color: '#3b82f6' }}>
                  {emailContact}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* QR Code ou logo */}
        {avecQrCode && qrCodeUrl ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
            <div
              style={{
                background: 'white',
                padding: '2px',
                borderRadius: '1px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              }}
            >
              <img
                src={qrCodeUrl}
                alt="QR Code de vérification"
                style={{ width: '48px', height: '48px' }}
              />
            </div>
            <div style={{ fontSize: '8px', color: '#64748b', textAlign: 'center', lineHeight: '1.2' }}>
              SCANNER POUR<br />VÉRIFIER
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
              border: '1px dashed #cbd5e1',
            }}
          >
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#94a3b8' }}>
              {personnel.nom.charAt(0)}
            </span>
          </div>
        )}
      </div>
    </div>
  )

  const renderVerso = () => (
    <div
      className="carte-personnel-verso"
      style={{
        width: '85.6mm',
        height: '54mm',
        borderRadius: '12px',
        overflow: 'hidden',
        background: 'linear-gradient(145deg, #f8fafc 0%, #ffffff 100%)',
        color: '#1e293b',
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        position: 'relative',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e2e8f0',
      }}
    >
      {/* Bandeau supérieur */}
      <div
        style={{
          height: '24px',
          background: `linear-gradient(90deg, ${etablissement.couleur}40 0%, ${etablissement.couleur}20 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          fontWeight: '600',
          color: '#475569',
          letterSpacing: '0.1em',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        INFORMATIONS IMPORTANTES
      </div>

      {/* Contenu verso */}
      <div style={{ padding: '1px 20px', height: 'calc(100% - 24px)' }}>
        {/* Titre */}
        <div style={{ textAlign: 'center', marginBottom: '1px' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#1e293b', marginBottom: '1px' }}>
            CARTE PROFESSIONNELLE
          </div>
          <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '500' }}>
            {etablissement.nom.toUpperCase()}
          </div>
        </div>

        {/* Informations de contact institution */}
        <div style={{ marginBottom: '1px' }}>
          <div style={{ fontSize: '10px', fontWeight: '600', color: '#475569', marginBottom: '1px' }}>
            CONTACT INSTITUTIONNEL
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '8px', display: 'flex' }}>
              <span style={{ minWidth: '70px', color: '#64748b' }}>Adresse :</span>
              <span style={{ fontWeight: '500' }}>{etablissement.adresse}</span>
            </div>
            {telephoneContact && (
              <div style={{ fontSize: '8px', display: 'flex' }}>
                <span style={{ minWidth: '70px', color: '#64748b' }}>Téléphone :</span>
                <span style={{ fontWeight: '500' }}>{telephoneContact}</span>
              </div>
            )}
            {emailContact && (
              <div style={{ fontSize: '8px', display: 'flex' }}>
                <span style={{ minWidth: '70px', color: '#64748b' }}>Email :</span>
                <span style={{ fontWeight: '600', color: '#2563eb' }}>{emailContact}</span>
              </div>
            )}
            {siteContact && (
              <div style={{ fontSize: '8px', display: 'flex' }}>
                <span style={{ minWidth: '70px', color: '#64748b' }}>Site web :</span>
                <span
                  style={{
                    fontWeight: '600',
                    color: '#2563eb',
                    fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", monospace',
                    letterSpacing: '0.5px',
                    wordBreak: 'break-all',
                  }}
                >
                  {siteContact}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Conditions d'utilisation */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '10px', fontWeight: '600', color: '#475569', marginBottom: '2px' }}>
            CONDITIONS D'UTILISATION
          </div>
          <div style={{ fontSize: '4px', color: '#b11515ff', lineHeight: '1.4' }}>
            • Cette carte est strictement personnelle et non transférable<br />
            • À présenter à l'entrée de l'établissement<br />
            • À conserver en bon état<br />
            • Signaler toute perte immédiatement<br />
            • Valide pour l'année scolaire {etablissement.anneeScolaire}
          </div>
        </div>

        {/* Signature et date */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: '9px', color: '#64748b', marginBottom: '1px' }}>Délivrée le :</div>
            <div style={{ fontSize: '10px', fontWeight: '500' }}>
              {new Date().toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '9px',
                color: '#64748b',
                borderTop: '1px solid #cbd5e1',
                paddingTop: '2px',
                marginBottom: '2px',
              }}
            >
              Signature du directeur
            </div>
            <div
              style={{
                height: '20px',
                width: '80px',
                borderBottom: '1px dashed #94a3b8',
                margin: '0 auto',
              }}
            />
          </div>
        </div>

        {/* Code-barres ou logo */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '20px',
            fontSize: '8px',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>ID:</span>
          <span style={{ fontFamily: 'monospace', letterSpacing: '1px' }}>
            {personnel.id.slice(-12).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Effets décoratifs */}
      <div
        style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          height: '3px',
          background: `linear-gradient(90deg, ${etablissement.couleur}, ${etablissement.couleur}80)`,
        }}
      />
    </div>
  )

  const renderLesDeux = () => (
    <div
      className="carte-personnel-double"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        width: 'fit-content',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        {renderRecto()}
        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', letterSpacing: '0.08em' }}>
          RECTO — Face avant
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        {renderVerso()}
        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', letterSpacing: '0.08em' }}>
          VERSO — Face arrière
        </div>
      </div>

      <div
        style={{
          fontSize: '11px',
          color: '#64748b',
          textAlign: 'center',
          fontStyle: 'italic',
        }}
      >
        Carte professionnelle format standard CR80 (85.6×54mm) – Impression recto/verso alignée
      </div>
    </div>
  )

  switch (face) {
    case 'recto':
      return renderRecto()
    case 'verso':
      return renderVerso()
    case 'les-deux':
    default:
      return renderLesDeux()
  }
}

// Version légère pour affichage unique
export function CartePersonnelProfessionnel({ personnel, etablissement, avecQrCode = true }: CartePersonnelRectoVersoProps) {
  return <CartePersonnelRectoVerso personnel={personnel} etablissement={etablissement} avecQrCode={avecQrCode} face="recto" />
}

// Alias pour compatibilité avec les imports existants
export const CartePersonnel = CartePersonnelRectoVerso