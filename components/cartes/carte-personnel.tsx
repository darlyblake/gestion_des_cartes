'use client'

import { genererQRCodeDataURL, formaterDonneesCartePersonnel } from '@/lib/qrcode'
import Image from 'next/image'
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
  const safeId = personnel.id ?? personnel._id ?? ''
  const identifiantPersonnel = (personnel.matricule && personnel.matricule.trim().length > 0)
    ? personnel.matricule.toUpperCase()
    : (safeId.slice(-8) || '').toUpperCase()
  const emailContact = personnel.email || etablissement.email
  const telephoneContact = personnel.telephone || etablissement.telephone
  const siteContact = etablissement.siteWeb

  useEffect(() => {
    if (avecQrCode) {
      const url = genererQRCodeDataURL({
        donnees: formaterDonneesCartePersonnel(personnel.id ?? '', personnel.role ?? 'autre', etablissement.nom ?? ''),
        taille: 120,
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
        fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
        position: 'relative',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e2e8f0',
        fontSize: '9px',
      }}
    >
      {/* Bandeau supérieur institutionnel */}
      <div
        style={{
          height: '28px',
          background: `linear-gradient(90deg, ${etablissement.couleur} 0%, ${etablissement.couleur}80 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            {etablissement.nom.charAt(0)}
          </div>
          <div style={{ 
            fontSize: '10px', 
            fontWeight: '700', 
            color: 'white',
            maxWidth: '170px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {etablissement.nom}
          </div>
        </div>
        <div style={{ 
          fontSize: '10px', 
          color: 'rgba(255, 255, 255, 0.9)', 
          fontWeight: '600',
          letterSpacing: '0.5px'
        }}>
          {etablissement.anneeScolaire}
        </div>
      </div>

      {/* Contenu principal */}
      <div style={{ 
        padding: '10px 12px', 
        display: 'flex', 
        gap: '10px', 
        height: 'calc(100% - 28px)',
        alignItems: 'stretch'
      }}>
        {/* Photo et infos de base */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px', 
          flexShrink: 0,
          width: '65px'
        }}>
          <div
            style={{
              width: '60px',
              height: '70px',
              borderRadius: '6px',
              overflow: 'hidden',
              border: '2px solid #e2e8f0',
              background: '#f1f5f9',
              flexShrink: 0
            }}
          >
            <Image
              src={personnel.photo || '/placeholder.svg?height=75&width=60'}
              alt={`${personnel.prenom} ${personnel.nom}`}
              width={60}
              height={70}
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '8px',
                fontWeight: '700',
                color: '#64748b',
                letterSpacing: '0.5px',
                marginBottom: '2px',
              }}
            >
              ID PERSONNEL
            </div>
            <div
              style={{
                fontSize: '9px',
                fontFamily: "'Courier New', monospace",
                color: '#475569',
                background: '#f8fafc',
                padding: '3px 4px',
                borderRadius: '4px',
                letterSpacing: '0.5px',
                border: '1px solid #e2e8f0',
                wordBreak: 'break-all',
                lineHeight: '1.2'
              }}
            >
              {identifiantPersonnel}
            </div>
          </div>
        </div>

        {/* Informations détaillées */}
        <div style={{ 
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          {/* Nom et prénom */}
          <div>
            <div style={{ 
              fontSize: '9px', 
              fontWeight: '800', 
              color: '#0f172a', 
              lineHeight: '1',
              marginBottom: '2px'
            }}>
              {personnel.prenom.toUpperCase()}
            </div>
            <div style={{ 
              fontSize: '11px', 
              fontWeight: '900', 
              color: '#0f172a', 
              lineHeight: '1.1',
              marginBottom: '3px'
            }}>
              {personnel.nom.toUpperCase()}
            </div>
            <div style={{ 
              fontSize: '10px', 
              color: '#475569', 
              fontWeight: '600',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {personnel.fonction}
            </div>
          </div>

          {/* Rôle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ 
              fontSize: '9px', 
              color: '#64748b', 
              fontWeight: '600',
              minWidth: '35px'
            }}>
              Rôle :
            </span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: '700',
                color: '#1e293b',
                background: `linear-gradient(90deg, ${etablissement.couleur}20, ${etablissement.couleur}10)`,
                padding: '3px 10px',
                borderRadius: '12px',
                border: `1px solid ${etablissement.couleur}30`,
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {roleLabel}
            </span>
          </div>

          {/* Contact */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '4px',
            marginTop: '2px'
          }}>
            {telephoneContact && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ 
                  fontSize: '9px', 
                  color: '#64748b', 
                  fontWeight: '600',
                  minWidth: '35px'
                }}>
                  Tél :
                </span>
                <span style={{ 
                  fontSize: '10px', 
                  fontWeight: '600', 
                  color: '#1e293b',
                  letterSpacing: '0.3px'
                }}>
                  {telephoneContact}
                </span>
              </div>
            )}

            {emailContact && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ 
                  fontSize: '9px', 
                  color: '#64748b', 
                  fontWeight: '600',
                  minWidth: '35px'
                }}>
                  Email :
                </span>
                <span style={{ 
                  fontSize: '8.5px', 
                  fontWeight: '600', 
                  color: '#3b82f6',
                  wordBreak: 'break-all',
                  lineHeight: '1.2'
                }}>
                  {emailContact}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* QR Code ou logo */}
        {avecQrCode && qrCodeUrl ? (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '3px',
            flexShrink: 0,
            width: '50px'
          }}>
            <div
              style={{
                background: 'white',
                padding: '3px',
                borderRadius: '4px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              }}
            >
              <Image
                src={qrCodeUrl}
                alt="QR Code de vérification"
                width={42}
                height={42}
              />
            </div>
            <div style={{ 
              fontSize: '7px', 
              color: '#64748b', 
              textAlign: 'center', 
              lineHeight: '1.1',
              fontWeight: '700',
              letterSpacing: '0.3px'
            }}>
              SCANNER POUR VÉRIFIER
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
              border: '1px dashed #cbd5e1',
              flexShrink: 0,
              alignSelf: 'center'
            }}
          >
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#94a3b8' }}>
              {personnel.nom.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Code-barres en bas */}
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          left: '12px',
          right: '12px',
          height: '16px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '3px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Courier New', monospace",
          fontSize: '9px',
          fontWeight: '600',
          color: '#475569',
          letterSpacing: '1px',
          padding: '0 4px'
        }}
      >
        {(safeId.slice(-12) || 'PERS' + safeId.slice(-8) || '').toUpperCase()}
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
        fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
        position: 'relative',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e2e8f0',
        fontSize: '8px',
      }}
    >
      {/* Bandeau supérieur */}
      <div
        style={{
          height: '20px',
          background: `linear-gradient(90deg, ${etablissement.couleur}30 0%, ${etablissement.couleur}15 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          fontWeight: '800',
          color: '#475569',
          letterSpacing: '0.8px',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        INFORMATIONS IMPORTANTES
      </div>

{/* Contenu verso */}
<div style={{ 
  padding: '4px 5px',
  height: 'calc(100% - 23px)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between'
}}>

  {/* ===== Titre ===== */}
  <div style={{ textAlign: 'center' }}>
    <div style={{
      fontSize: '10px',
      fontWeight: '900',
      letterSpacing: '0.4px',
      color: '#1e293b',
      lineHeight: '1.1'
    }}>
      CARTE PROFESSIONNELLE
    </div>
    <div style={{
      fontSize: '8px',
      fontWeight: '600',
      color: '#475569',
      maxWidth: '80%',
      margin: '0 auto',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }}>
      {etablissement.nom.toUpperCase()}
    </div>
  </div>

  {/* ===== Corps : infos à gauche / signature à droite ===== */}
  <div style={{
    display: 'flex',
    gap: '6px',
    flexGrow: 1
  }}>

    {/* ===== Colonne gauche ===== */}
    <div style={{ flex: 3, display: 'flex', flexDirection: 'column', gap: '6px' }}>
      
      {/* Contact */}
      <div>
        <div style={{
          fontSize: '6px',
          fontWeight: '800',
          color: '#334155',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '2px'
        }}>
          CONTACT
        </div>

        <div style={{ fontSize: '6px', lineHeight: '1.25' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            <span style={{ minWidth: '34px', fontWeight: '700', color: '#64748b' }}>Adresse :</span>
            <span>{etablissement.adresse}</span>
          </div>

          {telephoneContact && (
            <div style={{ display: 'flex', gap: '4px' }}>
              <span style={{ minWidth: '34px', fontWeight: '700', color: '#64748b' }}>Tel :</span>
              <span style={{ fontWeight: '600' }}>{telephoneContact}</span>
            </div>
          )}

          {emailContact && (
            <div style={{ display: 'flex', gap: '4px' }}>
              <span style={{ minWidth: '34px', fontWeight: '700', color: '#64748b' }}>Email :</span>
              <span style={{ fontWeight: '600', color: '#2563eb', wordBreak: 'break-all' }}>
                {emailContact}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Conditions */}
      <div>
        <div style={{
          fontSize: '6px',
          fontWeight: '800',
          color: '#334155',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '2px'
        }}>
          CONDITIONS
        </div>

        <div style={{
          fontSize: '8px',
          lineHeight: '1.3',
          color: '#dc2626'
        }}>
          <div>• Carte personnelle et non transférable</div>
          <div>• Présenter à l’entrée</div>
          <div>• Valable {etablissement.anneeScolaire}</div>
        </div>
      </div>
    </div>

{/* ===== Colonne droite : signature ===== */}
<div style={{
  flex: 2,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  alignItems: 'center',
  borderLeft: '1px dashed #cbd5e1',
  paddingLeft: '6px'
}}>
  <div style={{
    fontSize: '6px',
    fontWeight: '700',
    color: '#64748b',
    marginBottom: '4px'
  }}>
    LA DIRECTION
  </div>

    {etablissement.signature ? (
    <Image
      src={etablissement.signature}
      alt="Signature"
      width={130}
      height={92}
      style={{
        objectFit: 'contain',
        marginBottom: '8px'
      }}
    />
  ) : (
    <div style={{
      width: '90px',
      height: '26px',
      borderBottom: '8px solid #94a3b8',
      marginBottom: '6px'
    }} />
  )}

 
</div>

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
        gap: '20px',
        width: 'fit-content',
        alignItems: 'center'
      }}
    >
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '6px'
      }}>
        {renderRecto()}
        <div style={{ 
          fontSize: '10px', 
          color: '#94a3b8', 
          fontWeight: '700', 
          letterSpacing: '0.5px'
        }}>
          RECTO — FACE AVANT
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '6px'
      }}>
        {renderVerso()}
        <div style={{ 
          fontSize: '10px', 
          color: '#94a3b8', 
          fontWeight: '700', 
          letterSpacing: '0.5px'
        }}>
          VERSO — FACE ARRIÈRE
        </div>
      </div>

      <div
        style={{
          fontSize: '10px',
          color: '#64748b',
          textAlign: 'center',
          fontWeight: '500',
          maxWidth: '200px',
          lineHeight: '1.4'
        }}
      >
        Carte professionnelle format standard CR80 (85.6×54mm)
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