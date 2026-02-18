/**
 * Template de carte scolaire recto-verso
 * Format CR80 (85.6mm x 53.98mm)
 * Affiche le recto (informations élève) et le verso (informations établissement)
 */

'use client'

import { genererQRCodeDataURL, formaterDonneesCarteQR } from '@/lib/qrcode'
import Image from 'next/image'
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
  const donneesQR = formaterDonneesCarteQR(eleve.id ?? '', eleve.matricule ?? '', etablissement.nom ?? '')
  const qrCodeUrl = genererQRCodeDataURL({
    donnees: donneesQR,
    taille: 48,
    couleurModule: couleur,
    couleurFond: 'transparent'
  })

  // Support pour différents noms possibles des champs date/lieu/nationalité
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
      className="carte-scolaire carte-recto"
      style={{
        width: '85.6mm',
        height: '53.98mm',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        fontFamily: `${etablissement.police || 'Inter'}, -apple-system, sans-serif`,
        position: 'relative',
        border: '1px solid #e5e7eb',
        fontSize: '8px',
      }}
    >
      {/* En-tête avec couleur de l'établissement */}
      <div 
        style={{
          backgroundColor: couleur,
          color: '#ffffff',
          padding: '6px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '22px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div 
            style={{
              width: '18px',
              height: '18px',
              backgroundColor: '#ffffff',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 'bold',
              color: couleur,
              flexShrink: 0
            }}
          >
            {etablissement.nom.charAt(0)}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ 
              fontSize: '9px', 
              fontWeight: 'bold', 
              lineHeight: '1.1',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {etablissement.nom}
            </div>
            <div style={{ fontSize: '7px', opacity: 0.9 }}>
              CARTE SCOLAIRE
            </div>
          </div>
        </div>
        <div style={{ 
          fontSize: '9px', 
          textAlign: 'right',
          fontWeight: '600'
        }}>
          {etablissement.anneeScolaire}
        </div>
      </div>

      {/* Corps de la carte */}
      <div 
        style={{ 
          padding: '8px 10px',
          display: 'flex',
          gap: '8px',
          height: 'calc(100% - 22px)',
        }}
      >
        {/* Photo de l'élève */}
        <div 
          style={{
            width: '50px',
            height: '62px',
            backgroundColor: '#f3f4f6',
            borderRadius: '4px',
            overflow: 'hidden',
            flexShrink: 0,
            border: `2px solid ${couleur}40`,
            alignSelf: 'center'
          }}
        >
          <Image
            src={eleve.photo || '/placeholder.svg?height=62&width=50'}
            alt={`Photo de ${eleve.prenom} ${eleve.nom}`}
            width={50}
            height={62}
            style={{
              objectFit: 'cover',
            }}
          />
        </div>

        {/* Informations de l'élève */}
        <div style={{ 
          flex: 1, 
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          {/* Nom et prénom */}
          <div>
            <div style={{ 
              fontSize: '9px', 
              fontWeight: '800',
              color: couleur,
              lineHeight: '1',
              marginBottom: '1px',
              letterSpacing: '0.3px'
            }}>
              {(eleve.prenom ?? '').toString().toUpperCase()}
            </div>
            <div style={{ 
              fontSize: '11px', 
              fontWeight: '900',
              color: '#111827',
              lineHeight: '1.1',
              marginBottom: '2px'
            }}>
              {(eleve.nom ?? '').toString().toUpperCase()}
            </div>
          </div>

          {/* Informations détaillées */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '2px',
            fontSize: '8px',
            color: '#4b5563',
            lineHeight: '1.2'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ 
                color: '#9ca3af', 
                minWidth: '45px',
                fontSize: '7px',
                fontWeight: '600'
              }}>
                Matricule :
              </span>
              <span style={{ 
                fontWeight: '700',
                fontFamily: "'Courier New', monospace",
                letterSpacing: '0.5px'
              }}>
                {eleve.matricule ?? '-'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ 
                color: '#9ca3af', 
                minWidth: '45px',
                fontSize: '7px',
                fontWeight: '600'
              }}>
                Classe :
              </span>
              <span style={{ fontWeight: '700' }}>
                {(classe?.nom ?? '-') + (classe?.niveau ? ` - ${classe.niveau}` : '')}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ 
                color: '#9ca3af', 
                minWidth: '45px',
                fontSize: '7px',
                fontWeight: '600'
              }}>
                Né(e) le :
              </span>
              <span>{formaterDate(dateNaissanceRaw)}</span>
            </div>
            {lieuNaissanceRaw && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ 
                  color: '#9ca3af', 
                  minWidth: '45px',
                  fontSize: '7px',
                  fontWeight: '600'
                }}>
                  À :
                </span>
                <span style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {lieuNaissanceRaw}
                </span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ 
                color: '#9ca3af', 
                minWidth: '45px',
                fontSize: '7px',
                fontWeight: '600'
              }}>
                Sexe :
              </span>
              <span>{eleve.sexe === 'M' ? 'Masculin' : 'Féminin'}</span>
            </div>
            {nationaliteRaw && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ 
                  color: '#9ca3af', 
                  minWidth: '45px',
                  fontSize: '7px',
                  fontWeight: '600'
                }}>
                  Nationalité :
                </span>
                <span style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {nationaliteRaw}
                </span>
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
              gap: '2px',
              flexShrink: 0,
              alignSelf: 'center'
            }}
          >
            <div style={{
              background: 'white',
              padding: '2px',
              borderRadius: '4px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <Image
                src={qrCodeUrl || '/placeholder.svg'}
                alt="QR Code de vérification"
                width={40}
                height={40}
              />
            </div>
            <div style={{ 
              fontSize: '6px', 
              color: '#9ca3af', 
              textAlign: 'center',
              fontWeight: '700',
              letterSpacing: '0.3px',
              lineHeight: '1.1'
            }}>
              SCANNER POUR<br/>VÉRIFIER
            </div>
          </div>
        )}
      </div>

      {/* Code-barres */}
      <div 
        style={{
          position: 'absolute',
          bottom: '6px',
          left: '10px',
          right: '10px',
          height: '12px',
          background: '#f8fafc',
          border: '1px solid #e5e7eb',
          borderRadius: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Courier New', monospace",
          fontSize: '7px',
          fontWeight: '600',
          color: '#475569',
          letterSpacing: '1px',
          padding: '0 4px'
        }}
      >
        {(eleve.id?.slice(-12) || eleve.matricule?.slice(-12) || 'ID-' + Date.now().toString().slice(-8)).toUpperCase()}
      </div>

      {/* Indicateur RECTO */}
      <div 
        style={{
          position: 'absolute',
          bottom: '4px',
          right: '8px',
          fontSize: '6px',
          color: '#9ca3af',
          fontWeight: '700',
          letterSpacing: '0.5px'
        }}
      >
        RECTO
      </div>
    </div>
  )
}

/**
 * Composant Verso de la carte (VERSION AMÉLIORÉE)
 * Contient : règlement, coordonnées établissement, logo
 */
function CarteVerso({
  etablissement,
}: Pick<CarteRectoVersoProps, 'etablissement'>) {
  const couleur = normaliserCouleur(etablissement.couleur)

  return (
    <div
      className="carte-scolaire carte-verso"
      style={{
        width: '85.6mm',
        height: '53.98mm',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        fontFamily: `${etablissement.police || 'Inter'}, -apple-system, sans-serif`,
        position: 'relative',
        border: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        fontSize: '9px',
      }}
    >
      {/* En-tête */}
      <div
        style={{
          backgroundColor: couleur,
          color: '#ffffff',
          padding: '6px 10px',
          textAlign: 'center',
          fontSize: '8px',
          fontWeight: 800,
          letterSpacing: '0.5px',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        INFORMATIONS IMPORTANTES
      </div>

      {/* Corps */}
      <div
        style={{
          flex: 1,
          padding: '8px 10px',
          color: '#374151',
          display: 'flex',
          gap: '8px',
          fontSize: '9px',
          lineHeight: '1.3'
        }}
      >
        {/* Colonne gauche */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          
          {/* Contact */}
          <div>
            <div
              style={{
                fontWeight: 800,
                color: couleur,
                marginBottom: '2px',
                fontSize: '7px',
                borderBottom: `1px solid #e5e7eb`,
                paddingBottom: '1px'
              }}
            >
              CONTACT
            </div>
            <div style={{ fontSize: '9px', lineHeight: '1.2' }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '2px' }}>
                <span style={{ fontWeight: 700, minWidth: '24px' }}>Tél:</span>
                <span>{etablissement.telephone?.substring(0, 24) || '—'}</span>
              </div>
              <div style={{ display: 'flex', gap: '6px', fontSize: '9px' }}>
                <span style={{ fontWeight: 700, minWidth: '24px' }}>Email:</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {etablissement.email || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Règlement */}
          <div>
            <div
              style={{
                fontWeight: 800,
                color: couleur,
                marginBottom: '2px',
                fontSize: '7px',
                borderBottom: `1px solid #EBE5E5`,
                paddingBottom: '1px'
              }}
            >
              RÈGLEMENT
            </div>
            <div style={{ fontSize: '9px', lineHeight: '1.5' }}>
              <div>• Carte personnelle et incessible</div>
            <div>• À présenter à toute demande</div>
            <div>• Perte : informer l'administration</div>
            <div>• Toute falsification est sanctionnée</div>
            <div>• Conserver en bon état</div>
            </div>
          </div>
        </div>

        {/* Colonne droite - Logo */}
        <div
          style={{
            flex: 0.7,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderLeft: `1px solid #e5e7eb`,
            paddingLeft: '6px',
            justifyContent: 'flex-start',
            gap: '2px'
          }}
        >
          <div
            style={{
              fontSize: '6px',
              fontWeight: 800,
              color: couleur,
              textAlign: 'center',
              letterSpacing: '0.3px'
            }}
          >
            LA DIRECTION
          </div>
          
          {etablissement.logo ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '2px',
                border: `1px solid #e5e7eb`,
                borderRadius: '2px',
                background: '#fafafa',
                flex: 1,
                minHeight: '20px',
                minWidth: '30px',
                overflow: 'hidden'
              }}
            >
              <img
                src={etablissement.logo}
                alt="Logo"
                style={{
                  objectFit: 'contain',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  width: 'auto',
                  height: 'auto'
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
                borderBottom: `1px dashed #cbd5e1`,
                padding: '2px 0',
                minHeight: '20px'
              }}
            >
              —
            </div>
          )}
        </div>
      </div>

      {/* Pied */}
      <div
        style={{
          padding: '6px 8px',
          borderTop: `1px solid #e5e7eb`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '8px',
          color: '#6b7280',
          background: '#f9fafb'
        }}
      >
        <div style={{ fontWeight: 700 }}>
          ANNÉE: {etablissement.anneeScolaire?.split('-')[0] || '2025'}
        </div>
        <div style={{ fontWeight: 700 }}>
          VALIDE: 31/08/{etablissement.anneeScolaire?.split('-')[1] || '2026'}
        </div>
      </div>

      {/* Indicateur VERSO */}
      <div 
        style={{
          position: 'absolute',
          bottom: '6px',
          right: '8px',
          fontSize: '8px',
          color: '#9ca3af',
          fontWeight: '700',
          letterSpacing: '0.5px'
        }}
      >
        VERSO
      </div>

      {/* Ligne de séparation */}
      <div
        style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          height: '2px',
          background: couleur,
        }}
      />
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
  const renderLesDeux = () => (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '12px',
      alignItems: 'center'
    }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '4px'
      }}>
        {CarteRecto({ eleve, classe, etablissement, avecQrCode })}
        <div style={{ 
          fontSize: '9px', 
          color: '#9ca3af', 
          fontWeight: '700', 
          letterSpacing: '0.5px'
        }}>
          RECTO
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '4px'
      }}>
        {CarteVerso({ etablissement })}
        <div style={{ 
          fontSize: '9px', 
          color: '#9ca3af', 
          fontWeight: '700', 
          letterSpacing: '0.5px'
        }}>
          VERSO
        </div>
      </div>
    </div>
  )

  if (face === 'recto') {
    return CarteRecto({ eleve, classe, etablissement, avecQrCode })
  }

  if (face === 'verso') {
    return CarteVerso({ etablissement })
  }

  return renderLesDeux()
}

export type { CarteRectoVersoProps }