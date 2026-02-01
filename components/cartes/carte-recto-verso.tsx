/**
 * Template de carte scolaire recto-verso
 * Format CR80 (85.6mm x 53.98mm)
 * Affiche le recto (informations élève) et le verso (informations établissement)
 */

'use client'

import { genererQRCodeDataURL, formaterDonneesCarteQR } from '@/lib/qrcode'
import { normaliserCouleur } from '@/lib/utils'
import type { Eleve, Classe, Etablissement } from '@/lib/types'

/**
 * Props du composant CarteRectoVerso
 */
interface CarteRectoVersoProps {
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
function formaterDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Composant Recto de la carte
 * Contient : photo, nom, matricule, classe, date de naissance
 */
function CarteRecto({ 
  eleve, 
  classe, 
  etablissement,
  avecQrCode = true,
}: Omit<CarteRectoVersoProps, 'face'>) {
  // Normaliser la couleur
  const couleur = normaliserCouleur(etablissement.couleur)

  // Génération du QR Code
  const donneesQR = formaterDonneesCarteQR(eleve.id, eleve.matricule, etablissement.nom)
  const qrCodeUrl = genererQRCodeDataURL({
    donnees: donneesQR,
    taille: 60,
    couleurModule: couleur,
  })

  return (
    <div 
      className="carte-scolaire carte-recto"
      style={{
        width: '323px',
        height: '204px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        fontFamily: etablissement.police || 'Arial',
        position: 'relative',
        border: '1px solid #e5e7eb',
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
              CARTE D'ÉTUDIANT - RECTO
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
          <img
            src={eleve.photo || '/placeholder.svg?height=90&width=70'}
            alt={`Photo de ${eleve.prenom} ${eleve.nom}`}
            style={{
              width: '100%',
              height: '100%',
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
              <span style={{ fontWeight: '600' }}>{classe.nom} - {classe.niveau}</span>
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
            <div>
              <span style={{ color: '#9ca3af' }}>Sexe: </span>
              <span>{eleve.sexe === 'M' ? 'Masculin' : 'Féminin'}</span>
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
            <img
              src={qrCodeUrl || '/placeholder.svg'}
              alt="QR Code"
              style={{
                width: '60px',
                height: '60px',
              }}
            />
            <div style={{ fontSize: '7px', color: '#9ca3af', textAlign: 'center' }}>
              Scanner pour<br/>vérifier
            </div>
          </div>
        )}
      </div>

      {/* Indicateur RECTO */}
      <div 
        style={{
          position: 'absolute',
          bottom: '4px',
          right: '8px',
          fontSize: '7px',
          color: '#9ca3af',
          fontWeight: '500',
        }}
      >
        RECTO
      </div>
    </div>
  )
}

/**
 * Composant Verso de la carte
 * Contient : règlement, coordonnées établissement, signature
 */
function CarteVerso({ 
  etablissement,
}: Pick<CarteRectoVersoProps, 'etablissement'>) {
  // Normaliser la couleur
  const couleur = normaliserCouleur(etablissement.couleur)

  return (
    <div 
      className="carte-scolaire carte-verso"
      style={{
        width: '323px',
        height: '204px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        fontFamily: etablissement.police || 'Arial',
        position: 'relative',
        border: '1px solid #e5e7eb',
      }}
    >
      {/* En-tête */}
      <div 
        style={{
          backgroundColor: couleur,
          color: '#ffffff',
          padding: '6px 12px',
          textAlign: 'center',
          fontSize: '10px',
          fontWeight: 'bold',
        }}
      >
        INFORMATIONS IMPORTANTES
      </div>

      {/* Corps */}
      <div style={{ padding: '10px 12px', fontSize: '8px', color: '#4b5563' }}>
        {/* Règlement */}
        <div style={{ marginBottom: '4px' }}>
          <div style={{ fontWeight: 'bold', color: couleur, marginBottom: '1px', fontSize: '9px' }}>
            Règlement :
          </div>
          <ul style={{ paddingLeft: '8px', margin: 0, lineHeight: '1.5' }}>
            <li>Cette carte est personnelle et incessible</li>
            <li>Elle doit être présentée à toute demande</li>
            <li>En cas de perte, prévenir immédiatement l'administration</li>
            <li>Toute falsification sera sanctionnée</li>
          </ul>
        </div>

        {/* Coordonnées établissement */}
        <div style={{ marginBottom: '1px' }}>
          <div style={{ fontWeight: 'bold', color: couleur, marginBottom: '1px', fontSize: '9px' }}>
            Coordonnées :
          </div>
          <div style={{ lineHeight: '1.5' }}>
            <div><strong>{etablissement.nom}</strong></div>
            <div>{etablissement.adresse}</div>
            <div>Tél: {etablissement.telephone}</div>
          </div>
        </div>

        {/* Zone signature */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1px' }}>
          {/* Cachet */}
          <div style={{ textAlign: 'center' }}>
            <div 
              style={{
                width: '40px',
                height: '40px',
                border: `2px dashed ${couleur}`,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '6px',
                color: '#9ca3af',
              }}
            >
              Cachet
            </div>
          </div>

          {/* Signature */}
          <div style={{ textAlign: 'center' }}>
            <div 
              style={{
                width: '80px',
                height: '30px',
                borderBottom: '1px solid #9ca3af',
                marginBottom: '4px',
              }}
            />
            <div style={{ fontSize: '7px', color: '#9ca3af' }}>
              Signature du Directeur
            </div>
          </div>

          {/* Date validité */}
          <div style={{ textAlign: 'right', fontSize: '7px' }}>
            <div style={{ color: '#9ca3af' }}>Valide jusqu'au</div>
            <div style={{ fontWeight: 'bold', color: couleur }}>
              31/08/{etablissement.anneeScolaire.split('-')[1]}
            </div>
          </div>
        </div>
      </div>

     
    </div>
  )
}

/**
 * Composant Template Carte Recto-Verso
 * Affiche le recto, le verso ou les deux faces selon le paramètre
 */
export function CarteRectoVerso({ 
  eleve, 
  classe, 
  etablissement,
  avecQrCode = true,
  face = 'les-deux',
}: CarteRectoVersoProps) {
  if (face === 'recto') {
    return (
      <CarteRecto 
        eleve={eleve} 
        classe={classe} 
        etablissement={etablissement} 
        avecQrCode={avecQrCode} 
      />
    )
  }

  if (face === 'verso') {
    return <CarteVerso etablissement={etablissement} />
  }

  // Afficher les deux faces
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <CarteRecto 
        eleve={eleve} 
        classe={classe} 
        etablissement={etablissement} 
        avecQrCode={avecQrCode} 
      />
      <CarteVerso etablissement={etablissement} />
    </div>
  )
}

export type { CarteRectoVersoProps }
