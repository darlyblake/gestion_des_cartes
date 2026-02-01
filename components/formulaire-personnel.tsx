/**
 * Formulaire pour créer/modifier un membre du personnel
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
    etablissementId: membre?.etablissementId?.toString?.() || (etablissements[0]?._id?.toString?.() || ''),
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
      console.log('=== Début demarrerCamera ===')
      console.log('navigator:', typeof navigator)
      console.log('navigator.mediaDevices:', navigator?.mediaDevices)
      
      // Vérifier que nous sommes côté client
      if (typeof window === 'undefined') {
        console.error('Erreur: Code exécuté côté serveur')
        afficherNotification('Erreur: Code exécuté côté serveur', 'error')
        return
      }

      console.log('Window OK')

      // Vérifier que navigator existe
      if (typeof navigator === 'undefined') {
        console.error('navigator est undefined')
        afficherNotification('Erreur: navigator n\'est pas disponible', 'error')
        return
      }

      console.log('Navigator OK')

      // Vérifier la disponibilité de l'API - vérification stricte
      const hasMediaDevices = !!(navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
      console.log('hasMediaDevices:', hasMediaDevices)
      
      if (!hasMediaDevices) {
        console.error('mediaDevices ou getUserMedia n\'est pas disponible')
        console.error('Cela peut être dû à:')
        console.error('1. Le site n\'est pas en HTTPS')
        console.error('2. Le navigateur ne supporte pas l\'API')
        console.error('3. Le protocole n\'est pas secure')
        afficherNotification('La caméra n\'est pas disponible sur votre appareil ou navigateur', 'error')
        return
      }

      console.log('API mediaDevices OK, tentative d\'accès...')

      const constraints = { 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false 
      }
      
      console.log('Contraintes:', constraints)
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      
      console.log('Stream obtenu:', stream)
      
      if (refCamera.current) {
        console.log('Video ref trouvée, assignation du stream')
        refCamera.current.srcObject = stream
        setCameraDemarree(true)
        console.log('Caméra démarrée avec succès')
      } else {
        console.error('refCamera.current est null')
      }
    } catch (erreur: any) {
      console.error('=== Erreur accès caméra ===:', erreur)
      console.error('Nom de l\'erreur:', erreur.name)
      console.error('Message:', erreur.message)
      console.error('Erreur complète:', erreur)
      
      // Messages d'erreur spécifiques
      if (erreur.name === 'NotAllowedError') {
        afficherNotification('Accès à la caméra refusé. Vérifiez les permissions du navigateur', 'error')
      } else if (erreur.name === 'NotFoundError') {
        afficherNotification('Aucune caméra trouvée sur cet appareil', 'error')
      } else if (erreur.name === 'NotReadableError') {
        afficherNotification('La caméra est déjà utilisée par une autre application', 'error')
      } else if (erreur.name === 'SecurityError') {
        afficherNotification('La caméra n\'est disponible que sur HTTPS', 'error')
      } else {
        afficherNotification('Erreur accès caméra: ' + (erreur.message || 'Erreur inconnue'), 'error')
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
        const imageData = refCanvas.current.toDataURL('image/jpeg')
        
        // Convertir en Blob et uploader
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
      afficherNotification('Erreur: ID du membre manquant', 'error')
      return
    }

    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce membre? Cette action est irréversible.')) {
      return
    }

    try {
      setEnChargement(true)
      const reponse = await supprimerPersonnel(membre._id.toString())

      if (reponse.succes) {
        afficherNotification('Membre supprimé avec succès', 'success')
        window.location.href = '/personnel'
      } else {
        afficherNotification(reponse.erreur || 'Erreur lors de la suppression', 'error')
      }
    } catch (erreur) {
      console.error('Erreur:', erreur)
      afficherNotification('Une erreur est survenue', 'error')
    } finally {
      setEnChargement(false)
    }
  }

  async function soumettre(e: React.FormEvent) {
    e.preventDefault()

    if (!donnees.nom || !donnees.prenom || !donnees.role || !donnees.fonction || !donnees.etablissementId) {
      afficherNotification('Veuillez remplir tous les champs obligatoires', 'error')
      return
    }

    try {
      setEnChargement(true)
      let reponse

      if (membre) {
        // Modification
        reponse = await modifierPersonnel(
          membre._id?.toString() || '',
          donnees as ModifierPersonnelDonnees
        )
        if (reponse.succes) {
          afficherNotification('Membre modifié avec succès', 'success')
          onSaved?.(membre)
          window.location.href = '/personnel'
        } else {
          afficherNotification(reponse.erreur || 'Erreur lors de la modification', 'error')
        }
      } else {
        // Création
        const resultat = await creerPersonnel(donnees)
        if (resultat.succes && resultat.donnees) {
          afficherNotification('Membre créé avec succès', 'success')
          onSaved?.(resultat.donnees)
          window.location.href = '/personnel'
        } else {
          afficherNotification(resultat.erreur || 'Erreur lors de la création', 'error')
          return
        }
      }
    } catch (erreur) {
      console.error('Erreur:', erreur)
      afficherNotification('Une erreur est survenue', 'error')
    } finally {
      setEnChargement(false)
    }
  }

  return (
    <form onSubmit={soumettre} className="FormulaireMembre space-y-6">
      {/* Photo */}
      <Card>
        <CardHeader>
          <CardTitle>Photo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!cameraDemarree ? (
            <>
              <div className="flex gap-4">
                <div className="h-32 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <img
                    src={photoPreview || '/placeholder.svg?height=128&width=96'}
                    alt="Aperçu"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-col justify-between gap-2">
                  {/* Galerie */}
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      console.log('Bouton galerie cliqué')
                      refGalerie.current?.click()
                    }}
                    disabled={enChargement}
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Galerie
                  </Button>
                  <input
                    ref={refGalerie}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const fichier = e.target.files?.[0]
                      if (fichier) traiterUploadPhoto(fichier)
                    }}
                  />

                  {/* Caméra - Désactivée en HTTP */}
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      afficherNotification('La caméra nécessite une connexion HTTPS ou n\'est pas disponible sur cet appareil', 'error')
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
              <div className="space-y-2">
                <video
                  ref={refCamera}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg bg-black h-80"
                />
                <canvas
                  ref={refCanvas}
                  width={96}
                  height={128}
                  className="hidden"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  onClick={capturerPhoto}
                  disabled={enChargement}
                  className="flex-1"
                >
                  {enChargement ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                  Capturer
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={arreterCamera}
                  disabled={enChargement}
                  className="flex-1"
                >
                  <X className="mr-2 h-4 w-4" />
                  Annuler
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Informations personnelles */}
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nom">Nom *</Label>
              <Input
                id="nom"
                value={donnees.nom}
                onChange={(e) => setDonnees({ ...donnees, nom: e.target.value })}
                placeholder="Dupont"
                disabled={enChargement}
              />
            </div>
            <div>
              <Label htmlFor="prenom">Prénom *</Label>
              <Input
                id="prenom"
                value={donnees.prenom}
                onChange={(e) => setDonnees({ ...donnees, prenom: e.target.value })}
                placeholder="Jean"
                disabled={enChargement}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations professionnelles */}
      <Card>
        <CardHeader>
          <CardTitle>Informations professionnelles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="etablissement">Établissement *</Label>
            <Select
              value={donnees.etablissementId}
              onValueChange={(value) =>
                setDonnees({ ...donnees, etablissementId: value })
              }
              disabled={enChargement}
            >
              <SelectTrigger id="etablissement">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {etablissements.map((etab, idx) => (
                  <SelectItem
                    key={etab._id?.toString() || etab.nom || `etab-${idx}`}
                    value={etab._id?.toString() || etab.nom || `etab-${idx}`}
                  >
                    {etab.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="role">Rôle *</Label>
            <Select
              value={donnees.role}
              onValueChange={(value) =>
                setDonnees({ ...donnees, role: value as any })
              }
              disabled={enChargement}
            >
              <SelectTrigger id="role">
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

          <div>
            <Label htmlFor="fonction">Fonction *</Label>
            <Input
              id="fonction"
              value={donnees.fonction}
              onChange={(e) => setDonnees({ ...donnees, fonction: e.target.value })}
              placeholder="Directeur général"
              disabled={enChargement}
            />
          </div>
        </CardContent>
      </Card>

      {/* Informations de contact */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={donnees.email}
              onChange={(e) => setDonnees({ ...donnees, email: e.target.value })}
              placeholder="jean.dupont@example.com"
              disabled={enChargement}
            />
          </div>

          <div>
            <Label htmlFor="telephone">Téléphone</Label>
            <Input
              id="telephone"
              type="tel"
              value={donnees.telephone}
              onChange={(e) => setDonnees({ ...donnees, telephone: e.target.value })}
              placeholder="+33 1 23 45 67 89"
              disabled={enChargement}
            />
          </div>
        </CardContent>
      </Card>

      {/* Boutons d'action */}
      <div className="flex gap-4">
        <Button type="submit" disabled={enChargement}>
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
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          disabled={enChargement}
        >
          Annuler
        </Button>
        {membre && (
          <Button
            type="button"
            variant="destructive"
            onClick={supprimerMembre}
            disabled={enChargement}
            className="ml-auto"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        )}
      </div>
    </form>
  )
}
