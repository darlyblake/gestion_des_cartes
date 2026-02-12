/**
 * Template de carte scolaire classique
 * Format CR80 (85.6mm x 53.98mm)
 * Design traditionnel avec photo, informations et QR Code
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
 * Composant Template Carte Classique
 * Dimensions: 323px x 204px (ratio CR80 à 96dpi)
 */
export function CarteClassique({ 
  eleve, 
  classe, 
  etablissement,
  avecQrCode = true,
}: CarteClassiqueProps) {
  // Normaliser la couleur pour éviter les erreurs de parsing
  const couleur = normaliserCouleur(etablissement.couleur)

  // Génération du QR Code
  const donneesQR = formaterDonneesCarteQR(eleve.id ?? '', eleve.matricule ?? '', etablissement.nom ?? '')
  const qrCodeUrl = genererQRCodeDataURL({
    donnees: donneesQR,
    taille: 60,
    couleurModule: couleur,
  })

  return (
    <div 
      className="carte-scolaire carte-classique"
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
      {/* En-tête avec couleur de l'établissement */}
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
            {etablissement.nom.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 'bold', lineHeight: '1.2' }}>
              {etablissement.nom}
            </div>
            <div style={{ fontSize: '9px', opacity: 0.9 }}>
              CARTE D'ÉTUDIANT
            </div>
          </div>
        </div>
        <div style={{ fontSize: '10px', textAlign: 'right' }}>
          {etablissement.anneeScolaire}
        </div>
      </div>

      {/* Corps de la carte */}
      <div 
        style={{ 
          padding: '12px',
          display: 'flex',
          gap: '12px',
          height: 'calc(100% - 48px)',
        }}
      >
        {/* Photo de l'élève */}
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
          <Image
            src={eleve.photo || '/placeholder.svg?height=90&width=70'}
            alt={`Photo de ${eleve.prenom} ${eleve.nom}`}
            width={70}
            height={90}
            style={{
              objectFit: 'cover',
            }}
          />
        </div>

        {/* Informations de l'élève */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div 
            style={{ 
              fontSize: '14px', 
              fontWeight: 'bold',
              color: couleur,
              marginBottom: '4px',
            }}
          >
            {eleve.prenom} {eleve.nom}
          </div>

          <div style={{ fontSize: '10px', color: '#4b5563', lineHeight: '1.6' }}>
            <div>
              <span style={{ color: '#9ca3af' }}>Matricule: </span>
              <span style={{ fontWeight: '600' }}>{eleve.matricule}</span>
            </div>
            <div>
              <span style={{ color: '#9ca3af' }}>Classe: </span>
              <span style={{ fontWeight: '600' }}>{classe.nom}</span>
            </div>
            <div>
              <span style={{ color: '#9ca3af' }}>Né(e) le: </span>
              <span>{formaterDate(eleve.dateNaissance)}</span>
            </div>
            {eleve.lieuNaissance && (
              <div>
                <span style={{ color: '#9ca3af' }}>À: </span>
                <span>{eleve.lieuNaissance}</span>
              </div>
            )}
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
              Scanner pour vérifier
            </div>
          </div>
        )}
      </div>

      {/* Pied de carte */}
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
        <span>{etablissement.adresse}</span>
        <span>{etablissement.telephone}</span>
      </div>
    </div>
  )
}
