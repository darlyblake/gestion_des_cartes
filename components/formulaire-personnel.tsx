/**
 * Formulaire pour créer/modifier un membre du personnel
 */

'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import '@/styles/formulaire-personnel.css'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useNotification } from '@/components/notification'
import { Upload, Loader2, Camera, Image as ImageIcon, X, Trash2 } from 'lucide-react'
import { creerPersonnel, modifierPersonnel, uploaderImage, supprimerPersonnel } from '@/lib/services/api'
import { ModalSimple } from '@/components/modal-simple'
import type { Personnel, CreerPersonnelDonnees, ModifierPersonnelDonnees, Etablissement, RolePersonnel } from '@/lib/types'

const ROLES: { value: RolePersonnel; label: string }[] = [
  { value: 'directeur', label: 'Directeur' },
  { value: 'enseignant', label: 'Enseignant' },
  { value: 'censeur', label: 'Censeur' },
  { value: 'surveillant', label: 'Surveillant Général' },
  { value: 'informaticien', label: 'Informaticien' },
  { value: 'secretaire', label: 'Secrétaire' },
  { value: 'gestionnaire', label: 'Gestionnaire' },
  { value: 'infirmier', label: 'Infirmier' },
  { value: 'bibliothecaire', label: 'Bibliothécaire' },
  { value: 'autre', label: 'Autre' },
]

interface FormulaireMembresProps {
  membre?: Personnel
  etablissements: Etablissement[]
  onSaved?: (membre: Personnel) => void
}

export function FormulaireMembre({ 
  membre, 
  etablissements,
  onSaved 
}: FormulaireMembresProps) {
  const { afficherNotification } = useNotification()
  const [enChargement, setEnChargement] = useState(false)
  const [ouvrirSuppression, setOuvrirSuppression] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string>(membre?.photo || '')
  const [cameraDemarree, setCameraDemarree] = useState(false)
  const refGalerie = useRef<HTMLInputElement>(null)
  const refCamera = useRef<HTMLVideoElement>(null)
  const refCanvas = useRef<HTMLCanvasElement>(null)
  const [donnees, setDonnees] = useState<CreerPersonnelDonnees>({
    nom: membre?.nom || '',
    prenom: membre?.prenom || '',
    role: membre?.role || 'autre',
    fonction: membre?.fonction || '',
    email: membre?.email || '',
    telephone: membre?.telephone || '',
    photo: membre?.photo || '',
    etablissementId: membre?.etablissementId?.toString?.() || etablissements[0]?.id || '',
  })

  async function traiterUploadPhoto(fichier: File) {
    try {
      setEnChargement(true)
      const reponse = await uploaderImage(fichier, 'photo')

      if (reponse.succes && reponse.donnees?.url) {
        setPhotoPreview(reponse.donnees.url)
        setDonnees({ ...donnees, photo: reponse.donnees.url })
        afficherNotification('succes' as any, 'Photo téléchargée avec succès')
      } else {
        afficherNotification('erreur' as any, reponse.erreur || 'Erreur lors de l\'upload')
      }
    } catch (erreur) {
      console.error('Erreur:', erreur)
      afficherNotification('erreur' as any, 'Erreur lors de l\'upload')
    } finally {
      setEnChargement(false)
    }
  }

  async function demarrerCamera() {
    try {
      if (typeof window === 'undefined') {
        console.error('Erreur: Code exécuté côté serveur')
        afficherNotification('error', 'Erreur: Code exécuté côté serveur')
        return
      }
      if (typeof navigator === 'undefined') {
        console.error('navigator est undefined')
        afficherNotification('error', 'Erreur: navigator n\'est pas disponible')
        return
      }
      const hasMediaDevices = !!(navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
      
      if (!hasMediaDevices) {
        console.error('mediaDevices ou getUserMedia n\'est pas disponible')
        afficherNotification('error', 'La caméra n\'est pas disponible sur votre appareil ou navigateur')
        return
      }

      const constraints = { 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false 
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      if (refCamera.current) {
        refCamera.current.srcObject = stream
        setCameraDemarree(true)
      } else {
        console.error('refCamera.current est null')
      }
    } catch (erreur: any) {
      console.error('=== Erreur accès caméra ===:', erreur)
      if (erreur.name === 'NotAllowedError') {
        afficherNotification('error', 'Accès à la caméra refusé. Vérifiez les permissions du navigateur')
      } else if (erreur.name === 'NotFoundError') {
        afficherNotification('error', 'Aucune caméra trouvée sur cet appareil')
      } else if (erreur.name === 'NotReadableError') {
        afficherNotification('error', 'La caméra est déjà utilisée par une autre application')
      } else if (erreur.name === 'SecurityError') {
        afficherNotification('error', 'La caméra n\'est disponible que sur HTTPS')
      } else {
        afficherNotification('error', 'Erreur accès caméra: ' + (erreur.message || 'Erreur inconnue'))
      }
    }
  }

  async function arreterCamera() {
    if (refCamera.current && refCamera.current.srcObject) {
      const tracks = (refCamera.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
      setCameraDemarree(false)
    }
  }

  async function capturerPhoto() {
    if (refCamera.current && refCanvas.current) {
      const context = refCanvas.current.getContext('2d')
      if (context) {
        context.drawImage(refCamera.current, 0, 0, refCanvas.current.width, refCanvas.current.height)
        
        refCanvas.current.toBlob(async (blob) => {
          if (blob) {
            const fichier = new File([blob], 'photo_camera.jpg', { type: 'image/jpeg' })
            await traiterUploadPhoto(fichier)
            arreterCamera()
          }
        }, 'image/jpeg', 0.9)
      }
    }
  }

  async function supprimerMembre() {
    if (!membre?._id?.toString()) {
      afficherNotification('error', 'Erreur: ID du membre manquant')
      return
    }

    try {
      setEnChargement(true)
      const reponse = await supprimerPersonnel(membre._id.toString())

      if (reponse.succes) {
        afficherNotification('success', 'Membre supprimé avec succès')
        window.location.href = '/personnel'
      } else {
        afficherNotification('error', reponse.erreur || 'Erreur lors de la suppression')
      }
    } catch (erreur) {
      console.error('Erreur:', erreur)
      afficherNotification('error', 'Une erreur est survenue')
    } finally {
      setEnChargement(false)
    }
  }

  async function soumettre(e: React.FormEvent) {
    e.preventDefault()

    if (!donnees.nom || !donnees.prenom || !donnees.role || !donnees.fonction || !donnees.etablissementId) {
      afficherNotification('error', 'Veuillez remplir tous les champs obligatoires')
      return
    }

    try {
      setEnChargement(true)
      let reponse

      if (membre) {
        reponse = await modifierPersonnel(
          membre._id?.toString() || '',
          donnees as ModifierPersonnelDonnees
        )
        if (reponse.succes) {
          afficherNotification('success', 'Membre modifié avec succès')
          onSaved?.(membre)
          window.location.href = '/personnel'
        } else {
          afficherNotification('error', reponse.erreur || 'Erreur lors de la modification')
        }
      } else {
        const resultat = await creerPersonnel(donnees)
        if (resultat.succes && resultat.donnees) {
          afficherNotification('success', 'Membre créé avec succès')
          onSaved?.(resultat.donnees)
          window.location.href = '/personnel'
        } else {
          afficherNotification('error', resultat.erreur || 'Erreur lors de la création')
          return
        }
      }
    } catch (erreur) {
      console.error('Erreur:', erreur)
      afficherNotification('error', 'Une erreur est survenue')
    } finally {
      setEnChargement(false)
    }
  }

  return (
    <form onSubmit={soumettre} className="FormulaireMembre">
      {/* Photo */}
      <Card className="card">
        <CardHeader className="card-header">
          <CardTitle className="card-title">Photo</CardTitle>
        </CardHeader>
        <CardContent className="card-content photo-upload-section">
          {!cameraDemarree ? (
            <>
              <div className="photo-container">
                <div className="photo-preview-wrapper">
                  <img
                    src={photoPreview || '/placeholder.svg?height=128&width=96'}
                    alt="Aperçu"
                    className="photo-preview"
                  />
                </div>
                <div className="photo-controls">
                  <input
                    ref={refGalerie}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    title="Sélectionner une photo depuis la galerie"
                    onChange={(e) => {
                      const fichier = e.target.files?.[0]
                      if (fichier) {
                        traiterUploadPhoto(fichier)
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="photo-button"
                    onClick={() => refGalerie.current?.click()}
                    disabled={enChargement}
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Galerie
                  </Button>

                  <Button 
                    type="button" 
                    variant="outline" 
                    className="photo-button camera-disabled"
                    onClick={() => {
                      afficherNotification('error', 'La caméra nécessite une connexion HTTPS ou n\'est pas disponible sur cet appareil')
                    }}
                    disabled={true}
                    title="La caméra nécessite HTTPS"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Caméra (non disponible)
                  </Button>
                  
                  <p className="text-xs text-muted-foreground">JPG, PNG, max 5MB</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="camera-active">
                <video
                  ref={refCamera}
                  autoPlay
                  playsInline
                  className="camera-view"
                />
                <canvas
                  ref={refCanvas}
                  width={96}
                  height={128}
                  className="hidden"
                />
                <div className="camera-controls">
                  <Button 
                    type="button" 
                    onClick={capturerPhoto}
                    disabled={enChargement}
                    className="capture-button"
                  >
                    {enChargement ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={arreterCamera}
                    disabled={enChargement}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Annuler
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Informations personnelles */}
      <Card className="card">
        <CardHeader className="card-header">
          <CardTitle className="card-title">Informations personnelles</CardTitle>
        </CardHeader>
        <CardContent className="card-content">
          <div className="form-grid">
            <div className="form-field-group">
              <Label htmlFor="nom" className="form-label">Nom <span className="form-label-required">*</span></Label>
              <Input
                id="nom"
                value={donnees.nom}
                onChange={(e) => setDonnees({ ...donnees, nom: e.target.value })}
                placeholder="Dupont"
                disabled={enChargement}
                className="form-input"
              />
            </div>
            <div className="form-field-group">
              <Label htmlFor="prenom" className="form-label">Prénom <span className="form-label-required">*</span></Label>
              <Input
                id="prenom"
                value={donnees.prenom}
                onChange={(e) => setDonnees({ ...donnees, prenom: e.target.value })}
                placeholder="Jean"
                disabled={enChargement}
                className="form-input"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations professionnelles */}
      <Card className="card">
        <CardHeader className="card-header">
          <CardTitle className="card-title">Informations professionnelles</CardTitle>
        </CardHeader>
        <CardContent className="card-content">
          <div className="space-y-4">
            <div className="form-field-group">
              <Label htmlFor="etablissement" className="form-label">Établissement <span className="form-label-required">*</span></Label>
              {etablissements && etablissements.length > 0 ? (
                <Select
                  value={donnees.etablissementId || ''}
                  onValueChange={(value) =>
                    setDonnees({ ...donnees, etablissementId: value })
                  }
                  disabled={enChargement}
                >
                  <SelectTrigger id="etablissement" className="form-select-trigger">
                    <SelectValue placeholder="Sélectionnez un établissement" />
                  </SelectTrigger>
                  <SelectContent>
                    {etablissements.map((etab) => (
                      <SelectItem
                        key={etab.id ?? ''}
                        value={etab.id ?? ''}
                      >
                        {etab.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="form-info-message">
                  Aucun établissement disponible. 
                  <Link href="/etablissements/nouveau">
                    Créer un établissement
                  </Link>
                </div>
              )}
            </div>

            <div className="form-field-group">
              <Label htmlFor="role" className="form-label">Rôle <span className="form-label-required">*</span></Label>
              <Select
                value={donnees.role}
                onValueChange={(value) =>
                  setDonnees({ ...donnees, role: value as any })
                }
                disabled={enChargement}
              >
                <SelectTrigger id="role" className="form-select-trigger">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="form-field-group">
              <Label htmlFor="fonction" className="form-label">Fonction <span className="form-label-required">*</span></Label>
              <Input
                id="fonction"
                value={donnees.fonction}
                onChange={(e) => setDonnees({ ...donnees, fonction: e.target.value })}
                placeholder="Directeur général"
                disabled={enChargement}
                className="form-input"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations de contact */}
      <Card className="card">
        <CardHeader className="card-header">
          <CardTitle className="card-title">Informations de contact</CardTitle>
        </CardHeader>
        <CardContent className="card-content">
          <div className="space-y-4">
            <div className="form-field-group">
              <Label htmlFor="email" className="form-label">Email</Label>
              <Input
                id="email"
                type="email"
                value={donnees.email}
                onChange={(e) => setDonnees({ ...donnees, email: e.target.value })}
                placeholder="jean.dupont@example.com"
                disabled={enChargement}
                className="form-input"
              />
            </div>

            <div className="form-field-group">
              <Label htmlFor="telephone" className="form-label">Téléphone</Label>
              <Input
                id="telephone"
                type="tel"
                value={donnees.telephone}
                onChange={(e) => setDonnees({ ...donnees, telephone: e.target.value })}
                placeholder="+33 1 23 45 67 89"
                disabled={enChargement}
                className="form-input"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Boutons d'action */}
      <div className="form-actions">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          disabled={enChargement}
          className="action-button action-button--secondary"
        >
          Annuler
        </Button>
        <Button 
          type="submit" 
          disabled={enChargement}
          className="action-button action-button--primary action-button--lg"
        >
          {enChargement ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Chargement...
            </>
          ) : membre ? (
            'Modifier'
          ) : (
            'Créer'
          )}
        </Button>
        {membre && (
          <Button
            type="button"
            variant="destructive"
            onClick={() => setOuvrirSuppression(true)}
            disabled={enChargement}
            className="action-button action-button--destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        )}
        {membre && (
          <ModalSimple
            ouvert={ouvrirSuppression}
            onFermer={() => setOuvrirSuppression(false)}
            onConfirmer={async () => {
              await supprimerMembre()
            }}
            titre="Supprimer le membre"
            description={`Êtes-vous sûr de vouloir supprimer "${membre.prenom} ${membre.nom}" ? Cette action est irréversible.`}
            confirmText="Supprimer"
            enChargement={enChargement}
          />
        )}
      </div>
    </form>
  )
}
