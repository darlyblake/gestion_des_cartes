/**
 * Template de carte scolaire moderne avec recto-verso
 * Format CR80 (85.6mm x 53.98mm)
 * Design moderne avec gradient et mise en page élégante
 */

'use client'

import { genererQRCodeDataURL, formaterDonneesCarteQR } from '@/lib/qrcode'
import Image from 'next/image'
import type { Eleve, Classe, Etablissement } from '@/lib/types'
import { useEffect, useState } from 'react'

/**
 * Props du composant CarteModerneRectoVerso
 */
interface CarteModerneRectoVersoProps {
  /** Données de l'élève */
  eleve: Eleve
  /** Données de la classe */
  classe: Classe
  /** Données de l'établissement */
  etablissement: Etablissement
  /** Afficher le QR Code */
  avecQrCode?: boolean
  /** Face à afficher */
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
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Éclaircit une couleur hexadécimale
 */
function eclaircirCouleur(hex: string, pourcentage: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, (num >> 16) + Math.round(255 * pourcentage))
  const g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round(255 * pourcentage))
  const b = Math.min(255, (num & 0x0000FF) + Math.round(255 * pourcentage))
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`
}

/**
 * Composant Template Carte Moderne Recto-Verso
 * Dimensions: 323px x 204px (ratio CR80 à 96dpi)
 */
export function CarteModerneRectoVerso({ 
  eleve, 
  classe, 
  etablissement,
  avecQrCode = true,
  face = 'les-deux',
}: CarteModerneRectoVersoProps) {
  // Génération du QR Code
  const donneesQR = formaterDonneesCarteQR(eleve.id ?? '', eleve.matricule ?? '', etablissement.nom ?? '')
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)

  useEffect(() => {
    if (avecQrCode) {
      const url = genererQRCodeDataURL({
        donnees: donneesQR,
        taille: 70,
        couleurModule: '#ffffff',
        couleurFond: 'transparent',
      })
      setQrCodeUrl(url)
    }
  }, [eleve, etablissement, avecQrCode, donneesQR])

  const couleurClaire = eclaircirCouleur(etablissement.couleur, 0.3)

  const renderRecto = () => (
    <div 
      className="carte-scolaire carte-moderne"
      style={{
        width: '323px',
        height: '204px',
        background: `linear-gradient(135deg, ${etablissement.couleur} 0%, ${couleurClaire} 100%)`,
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.2)',
        fontFamily: etablissement.police || 'Arial',
        position: 'relative',
        color: '#ffffff',
      }}
    >
      {/* Motif décoratif */}
      <div
        style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '150px',
          height: '150px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-30px',
          left: '-30px',
          width: '100px',
          height: '100px',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '50%',
        }}
      />

      {/* Contenu */}
      <div style={{ position: 'relative', zIndex: 1, height: '100%', padding: '16px' }}>
        {/* En-tête */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '9px', opacity: 0.8, letterSpacing: '1px', marginBottom: '2px' }}>
              CARTE D'ÉTUDIANT
            </div>
            <div style={{ fontSize: '13px', fontWeight: 'bold' }}>
              {etablissement.nom}
            </div>
          </div>
          <div 
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: '600',
            }}
          >
            {etablissement.anneeScolaire}
          </div>
        </div>

        {/* Zone principale */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
          {/* Photo avec cadre */}
          <div 
            style={{
              width: '75px',
              height: '95px',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              padding: '3px',
              flexShrink: 0,
            }}
          >
            <Image
              src={eleve.photo || '/placeholder.svg?height=89&width=69'}
              alt={`Photo de ${eleve.prenom} ${eleve.nom}`}
              width={69}
              height={89}
              style={{
                objectFit: 'cover',
                borderRadius: '5px',
              }}
            />
          </div>

          {/* Informations */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div 
              style={{ 
                fontSize: '16px', 
                fontWeight: 'bold',
                marginBottom: '8px',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
              }}
            >
              {eleve.prenom} {eleve.nom}
            </div>

            <div style={{ fontSize: '11px', opacity: 0.9, lineHeight: '1.8' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ opacity: 0.7 }}>Matricule</span>
                <span style={{ fontWeight: '600' }}>{eleve.matricule}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ opacity: 0.7 }}>Classe</span>
                <span style={{ fontWeight: '600' }}>{classe.nom} - {classe.niveau}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ opacity: 0.7 }}>Né(e) le</span>
                <span>{formaterDate(eleve.dateNaissance)}</span>
              </div>
            </div>
          </div>

          {/* QR Code */}
          {avecQrCode && qrCodeUrl && (
            <div 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div 
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  padding: '6px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Image
                  src={qrCodeUrl}
                  alt="QR Code"
                  width={55}
                  height={55}
                />
              </div>
              <div style={{ fontSize: '8px', marginTop: '4px', opacity: 0.9 }}>
                Vérification
              </div>
            </div>
          )}
        </div>

        {/* Pied de carte */}
        <div 
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '16px',
            right: '16px',
            fontSize: '8px',
            opacity: 0.7,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>{etablissement.adresse}</span>
          <span>{etablissement.telephone}</span>
        </div>
      </div>
    </div>
  )

  const renderVerso = () => (
    <div 
      className="carte-scolaire carte-moderne-verso"
      style={{
        width: '323px',
        height: '204px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
        fontFamily: etablissement.police || 'Arial',
        position: 'relative',
        color: '#334155',
        border: `1px solid ${etablissement.couleur}20`,
      }}
    >
      {/* Bandeau supérieur */}
      <div
        style={{
          height: '40px',
          background: `linear-gradient(90deg, ${etablissement.couleur} 0%, ${couleurClaire} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold',
          letterSpacing: '0.5px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {etablissement.nom.toUpperCase()}
        <div
          style={{
            position: 'absolute',
            right: '15px',
            fontSize: '10px',
            opacity: 0.8,
          }}
        >
          VERSO
        </div>
      </div>

      {/* Contenu verso */}
      <div style={{ padding: '16px' }}>
        {/* Section informations importantes */}
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              fontSize: '10px',
              fontWeight: 'bold',
              color: etablissement.couleur,
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <div
              style={{
                width: '4px',
                height: '4px',
                backgroundColor: etablissement.couleur,
                borderRadius: '50%',
              }}
            />
            INFORMATIONS IMPORTANTES
          </div>
          <div
            style={{
              fontSize: '9px',
              color: '#475569',
              lineHeight: '1.6',
              marginLeft: '10px',
            }}
          >
            <div>• Cette carte est strictement personnelle et non transférable</div>
            <div>• À présenter à chaque entrée dans l'établissement</div>
            <div>• En cas de perte, signaler immédiatement au secrétariat</div>
            <div>• Conserver cette carte en bon état</div>
            <div>• Valable pour l'année scolaire {etablissement.anneeScolaire}</div>
          </div>
        </div>

        {/* Section contact */}
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              fontSize: '10px',
              fontWeight: 'bold',
              color: etablissement.couleur,
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <div
              style={{
                width: '4px',
                height: '4px',
                backgroundColor: etablissement.couleur,
                borderRadius: '50%',
              }}
            />
            CONTACT & URGENCES
          </div>
          <div style={{ fontSize: '9px', color: '#475569', marginLeft: '10px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '2px' }}>
              <span style={{ minWidth: '60px', color: '#64748b' }}>Secrétariat :</span>
              <span>{etablissement.telephone || 'Non renseigné'}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '2px' }}>
              <span style={{ minWidth: '60px', color: '#64748b' }}>Adresse :</span>
              <span>{etablissement.adresse}</span>
            </div>
            {etablissement.email && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ minWidth: '60px', color: '#64748b' }}>Email :</span>
                <span>{etablissement.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Section code élève */}
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              fontSize: '10px',
              fontWeight: 'bold',
              color: etablissement.couleur,
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <div
              style={{
                width: '4px',
                height: '4px',
                backgroundColor: etablissement.couleur,
                borderRadius: '50%',
              }}
            />
            CODE ÉLÈVE
          </div>
          <div
            style={{
              fontSize: '11px',
              fontFamily: 'monospace',
              color: '#1e293b',
              background: '#f1f5f9',
              padding: '6px 10px',
              borderRadius: '6px',
              borderLeft: `3px solid ${etablissement.couleur}`,
              marginLeft: '10px',
            }}
          >
            {eleve.matricule}
          </div>
        </div>

        {/* Signature et date */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid #e2e8f0',
          }}
        >
          <div>
            <div style={{ fontSize: '8px', color: '#64748b', marginBottom: '2px' }}>
              Délivrée le :
            </div>
            <div style={{ fontSize: '9px', fontWeight: '500' }}>
              {new Date().toLocaleDateString('fr-FR')}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '8px', color: '#64748b', marginBottom: '4px' }}>
              Signature
            </div>
            {etablissement.signature ? (
              <Image
                src={etablissement.signature}
                alt="Signature"
                width={60}
                height={30}
                style={{
                  objectFit: 'contain',
                }}
              />
            ) : (
              <div
                style={{
                  width: '60px',
                  height: '2px',
                  borderBottom: '1px dashed #94a3b8',
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Code-barres décoratif */}
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          left: '16px',
          right: '16px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '1px',
            height: '15px',
            alignItems: 'flex-end',
          }}
        >
          {[2, 4, 1, 3, 5, 2, 4, 1, 3, 5, 2, 4, 1, 3, 5].map((height, index) => (
            <div
              key={index}
              style={{
                width: '3px',
                height: `${height * 3}px`,
                backgroundColor: '#cbd5e1',
                borderRadius: '1px',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )

  const renderLesDeux = () => (
    <div className="carte-moderne-complete">
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        <div style={{ position: 'relative' }}>
          {renderRecto()}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '100%',
              transform: 'translateY(-50%)',
              fontSize: '12px',
              color: '#94a3b8',
              whiteSpace: 'nowrap',
              paddingLeft: '12px',
              fontWeight: '500',
              fontFamily: 'Arial',
            }}
          >
            <div style={{ fontSize: '11px', color: etablissement.couleur }}>RECTO</div>
            <div style={{ fontSize: '9px', opacity: 0.7, marginTop: '2px' }}>Face avant</div>
          </div>
        </div>
        
        <div style={{ position: 'relative' }}>
          {renderVerso()}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              right: '100%',
              transform: 'translateY(-50%)',
              fontSize: '12px',
              color: '#94a3b8',
              whiteSpace: 'nowrap',
              paddingRight: '12px',
              fontWeight: '500',
              fontFamily: 'Arial',
              textAlign: 'right',
            }}
          >
            <div style={{ fontSize: '11px', color: etablissement.couleur }}>VERSO</div>
            <div style={{ fontSize: '9px', opacity: 0.7, marginTop: '2px' }}>Face arrière</div>
          </div>
        </div>
      </div>
      
      <div
        style={{
          marginTop: '12px',
          fontSize: '10px',
          color: '#64748b',
          textAlign: 'center',
          fontStyle: 'italic',
        }}
      >
        Format standard CR80 - Prêt à imprimer
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

/**
 * Composant Template Carte Moderne (version originale)
 */
export function CarteModerne({ 
  eleve, 
  classe, 
  etablissement,
  avecQrCode = true,
}: CarteModerneRectoVersoProps) {
  return (
    <CarteModerneRectoVerso 
      eleve={eleve}
      classe={classe}
      etablissement={etablissement}
      avecQrCode={avecQrCode}
      face="recto"
    />
  )
}