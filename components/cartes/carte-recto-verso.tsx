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
          <img
            src={eleve.photo || '/placeholder.svg?height=62&width=50'}
            alt={`Photo de ${eleve.prenom} ${eleve.nom}`}
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
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
              {eleve.prenom.toUpperCase()}
            </div>
            <div style={{ 
              fontSize: '11px', 
              fontWeight: '900',
              color: '#111827',
              lineHeight: '1.1',
              marginBottom: '2px'
            }}>
              {eleve.nom.toUpperCase()}
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
                {eleve.matricule}
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
                {classe.nom} {classe.niveau}
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
              <span>{formaterDate(eleve.dateNaissance)}</span>
            </div>
            {eleve.lieuNaissance && (
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
                  {eleve.lieuNaissance}
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
              <img
                src={qrCodeUrl || '/placeholder.svg'}
                alt="QR Code de vérification"
                style={{
                  width: '40px',
                  height: '40px',
                }}
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
 * Contient : règlement, coordonnées établissement, signature
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
        fontSize: '7px',
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
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '8px'
        }}
      >
        {/* Règlement */}
        <div>
          <div
            style={{
              fontWeight: 800,
              color: couleur,
              marginBottom: '4px',
              fontSize: '8px',
              borderBottom: '1px solid #e5e7eb',
              paddingBottom: '2px'
            }}
          >
            RÈGLEMENT
          </div>
          <div
            style={{
              lineHeight: '1.3',
              fontSize: '6.5px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
            }}
          >
            <div>• Carte personnelle et incessible</div>
            <div>• À présenter à toute demande</div>
            <div>• Perte : informer l'administration</div>
            <div>• Toute falsification est sanctionnée</div>
            <div>• Conserver en bon état</div>
          </div>
        </div>

        {/* Coordonnées */}
        <div>
          <div
            style={{
              fontWeight: 800,
              color: couleur,
              marginBottom: '4px',
              fontSize: '8px',
              borderBottom: '1px solid #e5e7eb',
              paddingBottom: '2px'
            }}
          >
            ÉTABLISSEMENT
          </div>
          <div style={{ 
            lineHeight: '1.3',
            fontSize: '7px'
          }}>
            <div style={{ 
              fontWeight: 700,
              fontSize: '7.5px',
              marginBottom: '1px'
            }}>
              {etablissement.nom}
            </div>
            <div style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              marginBottom: '1px'
            }}>
              {etablissement.adresse}
            </div>
            {etablissement.telephone && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ 
                  minWidth: '20px',
                  color: '#9ca3af'
                }}>
                  Tél :
                </span>
                <span style={{ fontWeight: 600 }}>
                  {etablissement.telephone}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bas : cachet + signature + validité */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginTop: '4px',
            paddingTop: '6px',
            borderTop: '1px dashed #e5e7eb'
          }}
        >
          {/* Cachet */}
          <div style={{ textAlign: 'center', width: '50px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                border: `2px dashed ${couleur}60`,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '5px',
                color: '#9ca3af',
                fontWeight: 600,
                margin: '0 auto 2px'
              }}
            >
              CACHET
            </div>
          </div>

          {/* Signature */}
          <div style={{ textAlign: 'center', flex: 1, maxWidth: '70px' }}>
            {etablissement.signature ? (
              <img
                src={etablissement.signature}
                alt="Signature du Directeur"
                style={{
                  width: '60px',
                  height: '20px',
                  objectFit: 'contain',
                  margin: '0 auto 2px',
                }}
              />
            ) : (
              <div
                style={{
                  width: '60px',
                  height: '20px',
                  borderBottom: '2px dashed #9ca3af',
                  margin: '0 auto 2px',
                }}
              />
            )}
            <div
              style={{
                fontSize: '6px',
                color: '#6b7280',
                fontWeight: 700,
                letterSpacing: '0.3px'
              }}
            >
              LE DIRECTEUR
            </div>
          </div>

          {/* Validité */}
          <div style={{ 
            textAlign: 'right', 
            width: '50px',
            fontSize: '6.5px'
          }}>
            <div style={{ 
              color: '#9ca3af',
              fontWeight: 600,
              marginBottom: '1px'
            }}>
              VALIDE JUSQU'AU
            </div>
            <div style={{ 
              fontWeight: 800, 
              color: couleur,
              fontSize: '7px'
            }}>
              31/08/{etablissement.anneeScolaire.split('-')[1]}
            </div>
          </div>
        </div>
      </div>

      {/* Indicateur VERSO */}
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