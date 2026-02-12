/**
 * Template de carte d'examen
 * Format CR80 (85.6mm x 53.98mm)
 * Design officiel pour les examens
 */

'use client'

import { genererQRCodeDataURL, formaterDonneesCarteQR } from '@/lib/qrcode'
import Image from 'next/image'
import type { Eleve, Classe, Etablissement } from '@/lib/types'

/**
 * Props du composant CarteExamen
 */
interface CarteExamenProps {
  /** Données de l'élève */
  eleve: Eleve
  /** Données de la classe */
  classe: Classe
  /** Données de l'établissement */
  etablissement: Etablissement
  /** Afficher le QR Code */
  avecQrCode?: boolean
}

/**
 * Formate une date en français (format long)
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
 * Composant Template Carte Examen
 * Dimensions: 323px x 204px (ratio CR80 à 96dpi)
 */
export function CarteExamen({ 
  eleve, 
  classe, 
  etablissement,
  avecQrCode = true,
}: CarteExamenProps) {
  // Génération du QR Code
  const donneesQR = formaterDonneesCarteQR(eleve.id ?? '', eleve.matricule ?? '', etablissement.nom ?? '')
  const qrCodeUrl = genererQRCodeDataURL({
    donnees: donneesQR,
    taille: 80,
    couleurModule: '#1f2937',
  })

  return (
    <div 
      className="carte-scolaire carte-examen"
      style={{
        width: '323px',
        height: '204px',
        backgroundColor: '#ffffff',
        borderRadius: '4px',
        overflow: 'hidden',
        border: '2px solid #1f2937',
        fontFamily: 'Times New Roman, serif',
        position: 'relative',
      }}
    >
      {/* En-tête officiel */}
      <div 
        style={{
          backgroundColor: '#1f2937',
          color: '#ffffff',
          padding: '6px 12px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '10px', letterSpacing: '2px', marginBottom: '2px' }}>
          CARTE D'EXAMEN
        </div>
        <div style={{ fontSize: '11px', fontWeight: 'bold' }}>
          {etablissement.nom.toUpperCase()}
        </div>
      </div>

      {/* Corps de la carte */}
      <div 
        style={{ 
          padding: '10px 12px',
          display: 'flex',
          gap: '12px',
        }}
      >
        {/* Photo avec cadre officiel */}
        <div 
          style={{
            width: '65px',
            height: '80px',
            border: '1px solid #1f2937',
            flexShrink: 0,
            position: 'relative',
          }}
        >
          <Image
            src={eleve.photo || '/placeholder.svg?height=80&width=65'}
            alt={`Photo de ${eleve.prenom} ${eleve.nom}`}
            width={65}
            height={80}
            style={{
              objectFit: 'cover',
            }}
          />
          {/* Tampon photo */}
          <div
            style={{
              position: 'absolute',
              bottom: '-10px',
              right: '-10px',
              width: '30px',
              height: '30px',
              border: '2px solid #dc2626',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '7px',
              color: '#dc2626',
              fontWeight: 'bold',
              transform: 'rotate(-15deg)',
            }}
          >
            PHOTO
          </div>
        </div>

        {/* Informations de l'élève */}
        <div style={{ flex: 1 }}>
          <table style={{ width: '100%', fontSize: '9px', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '2px 0', color: '#6b7280', width: '70px' }}>NOM</td>
                <td style={{ padding: '2px 0', fontWeight: 'bold' }}>{eleve.nom}</td>
              </tr>
              <tr>
                <td style={{ padding: '2px 0', color: '#6b7280' }}>PRÉNOM(S)</td>
                <td style={{ padding: '2px 0', fontWeight: 'bold' }}>{eleve.prenom}</td>
              </tr>
              <tr>
                <td style={{ padding: '2px 0', color: '#6b7280' }}>NÉ(E) LE</td>
                <td style={{ padding: '2px 0' }}>{formaterDate(eleve.dateNaissance)}</td>
              </tr>
              <tr>
                <td style={{ padding: '2px 0', color: '#6b7280' }}>À</td>
                <td style={{ padding: '2px 0' }}>{eleve.lieuNaissance || '-'}</td>
              </tr>
              <tr>
                <td style={{ padding: '2px 0', color: '#6b7280' }}>SEXE</td>
                <td style={{ padding: '2px 0' }}>{eleve.sexe === 'M' ? 'Masculin' : 'Féminin'}</td>
              </tr>
              <tr>
                <td style={{ padding: '2px 0', color: '#6b7280' }}>CLASSE</td>
                <td style={{ padding: '2px 0', fontWeight: 'bold' }}>{classe.nom}</td>
              </tr>
            </tbody>
          </table>
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
              width={65}
              height={65}
            />
          </div>
        )}
      </div>

      {/* Numéro de matricule */}
      <div
        style={{
          position: 'absolute',
          bottom: '28px',
          left: '12px',
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#1f2937',
          letterSpacing: '2px',
          fontFamily: 'Courier New, monospace',
        }}
      >
        N° {eleve.matricule}
      </div>

      {/* Pied de carte officiel */}
      <div 
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#f9fafb',
          borderTop: '1px solid #e5e7eb',
          padding: '4px 12px',
          fontSize: '7px',
          color: '#6b7280',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>Année scolaire: {etablissement.anneeScolaire}</span>
        <span>Cachet de l'établissement</span>
        <span>Signature du titulaire</span>
      </div>
    </div>
  )
}
