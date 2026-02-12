/**
 * Composant Formulaire Élève
 * Formulaire complet pour créer ou modifier un élève
 */

'use client'

import React from "react"

import Image from 'next/image'
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
import { Camera, Upload, Loader2, User } from 'lucide-react'
import type { Eleve, Classe, Sexe, CreerEleveDonnees, Etablissement } from '@/lib/types'

// URL de l'API
const API_URL = '/api'

/**
 * Uploade une image vers Cloudinary via l'API
 * @param fichier - Le fichier image à uploader
 * @returns L'URL Cloudinary de l'image uploadée
 */
async function uploaderPhotoCloudinary(fichier: File): Promise<string> {
  const formData = new FormData()
  formData.append('image', fichier)
  formData.append('type', 'photo')

  const reponse = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!reponse.ok) {
    const erreur = await reponse.json()
    throw new Error(erreur.erreur || 'Erreur lors de l\'upload de l\'image')
  }

  const donnees = await reponse.json()
  return donnees.url
}

/**
 * Props du composant FormulaireEleve
 */
interface FormulaireEleveProps {
  /** Élève à modifier (undefined pour création) */
  eleve?: Eleve
  /** Liste des classes disponibles */
  classes: Classe[]
  /** Liste des établissements (optionnel) */
  etablissements?: Etablissement[]
  /** Classe pré-sélectionnée */
  classeIdDefaut?: string
  /** Fonction appelée lors de la soumission */
  onSoumettre: (donnees: CreerEleveDonnees) => Promise<void>
  /** Fonction appelée lors de l'annulation */
  onAnnuler: () => void
  /** État de chargement */
  enChargement?: boolean
}

/**
 * Composant Formulaire pour créer ou modifier un élève
 */
export const FormulaireEleve = React.memo(function FormulaireEleve({
  eleve,
  classes,
  etablissements = [],
  classeIdDefaut,
  onSoumettre,
  onAnnuler,
  enChargement = false,
}: FormulaireEleveProps) {
  // États du formulaire
  const [nom, setNom] = useState(eleve?.nom || '')
  const [prenom, setPrenom] = useState(eleve?.prenom || '')
  const [dateNaissance, setDateNaissance] = useState(
    eleve?.dateNaissance 
      ? new Date(eleve.dateNaissance).toISOString().split('T')[0] 
      : ''
  )
  const [lieuNaissance, setLieuNaissance] = useState(eleve?.lieuNaissance || '')
  const [sexe, setSexe] = useState<Sexe>(eleve?.sexe || 'M')
  const [classeId, setClasseId] = useState(eleve?.classeId || classeIdDefaut || '')
  const [etablissementId, setEtablissementId] = useState<string>('')
  const [photo, setPhoto] = useState(eleve?.photo || '')
  const [photoPreview, setPhotoPreview] = useState(eleve?.photo || '')
  const [photoEnUpload, setPhotoEnUpload] = useState(false)
  const [photoFichier, setPhotoFichier] = useState<File | null>(null)
  const [erreurs, setErreurs] = useState<Record<string, string>>({})

  // Référence pour l'input file
  const inputFichierRef = useRef<HTMLInputElement>(null)

  /**
   * Valide un champ individuel en temps réel
   */
  const validerChamp = (nomChamp: string, valeur: string): string => {
    switch (nomChamp) {
      case 'nom':
        return !valeur.trim() ? 'Le nom est requis' : ''
      case 'prenom':
        return !valeur.trim() ? 'Le prénom est requis' : ''
      case 'dateNaissance':
        return !valeur ? 'La date de naissance est requise' : ''
      case 'etablissementId':
        return !valeur ? 'L\'établissement est requis' : ''
      case 'classeId':
        return !valeur ? 'La classe est requise' : ''
      default:
        return ''
    }
  }

  /**
   * Gère la perte de focus d'un champ (validation onBlur)
   */
  const gererBlur = (nomChamp: string, valeur: string) => {
    const erreur = validerChamp(nomChamp, valeur)
    if (erreur) {
      setErreurs(prev => ({ ...prev, [nomChamp]: erreur }))
    } else {
      setErreurs(prev => {
        const nouvellesErreurs = { ...prev }
        delete nouvellesErreurs[nomChamp]
        return nouvellesErreurs
      })
    }
  }

  /**
   * Gère la sélection d'une photo depuis la galerie
   * L'upload Cloudinary se fait lors de la soumission du formulaire
   */
  const gererSelectionPhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fichier = event.target.files?.[0]
    if (!fichier) return

    // Vérification du type
    if (!fichier.type.startsWith('image/')) {
      setErreurs(prev => ({ ...prev, photo: 'Veuillez sélectionner une image' }))
      return
    }

    // Vérification de la taille (5MB max)
    if (fichier.size > 5 * 1024 * 1024) {
      setErreurs(prev => ({ ...prev, photo: 'L\'image est trop volumineuse (max 5MB)' }))
      return
    }

    // Création de l'aperçu local immédiatement (sans upload)
    const lecteur = new FileReader()
    lecteur.onload = (e) => {
      setPhotoPreview(e.target?.result as string)
    }
    lecteur.readAsDataURL(fichier)

    // Stocker le fichier pour l'upload lors de la soumission
    setPhotoFichier(fichier)

    // Effacer l'erreur photo si elle existe
    setErreurs(prev => {
      const { photo, ...reste } = prev
      return reste
    })
  }

  /**
   * Valide le formulaire
   */
  const validerFormulaire = (): boolean => {
    const nouvellesErreurs: Record<string, string> = {}

    if (!nom.trim()) nouvellesErreurs.nom = 'Le nom est requis'
    if (!prenom.trim()) nouvellesErreurs.prenom = 'Le prénom est requis'
    if (!dateNaissance) nouvellesErreurs.dateNaissance = 'La date de naissance est requise'
    if (!etablissementId) nouvellesErreurs.etablissementId = 'L\'établissement est requis'
    if (!classeId) nouvellesErreurs.classeId = 'La classe est requise'

    setErreurs(nouvellesErreurs)
    return Object.keys(nouvellesErreurs).length === 0
  }

  /**
   * Gère la soumission du formulaire
   */
  const gererSoumission = async (event: React.FormEvent) => {
    event.preventDefault()
    console.warn('FormulaireEleve: soumission déclenchée')

    if (!validerFormulaire()) {
      console.warn('FormulaireEleve: validation échouée', { erreurs })
      return
    }

    try {
      setPhotoEnUpload(true)
      console.warn('FormulaireEleve: début upload Cloudinary')

      // Upload vers Cloudinary si une photo a été sélectionnée
      let photoUrl = eleve?.photo || ''
      if (photoFichier) {
        console.warn('FormulaireEleve: upload en cours...')
        photoUrl = await uploaderPhotoCloudinary(photoFichier)
        console.warn('FormulaireEleve: upload terminé', photoUrl)
      }

      const donnees: CreerEleveDonnees = {
        nom: nom.trim(),
        prenom: prenom.trim(),
        dateNaissance,
        lieuNaissance: lieuNaissance.trim(),
        sexe,
        classeId,
        photo: photoUrl || undefined,
      }

      console.warn('FormulaireEleve: création élève...', donnees)
      await onSoumettre(donnees)
      console.warn('FormulaireEleve: élève créé avec succès')
    } catch (err) {
      console.error('FormulaireEleve: erreur complète:', err)
      throw err
    } finally {
      setPhotoEnUpload(false)
    }
  }

  // Si une classe par défaut est fournie, tenter de pré-sélectionner l'établissement
  useEffect(() => {
    // 1) Si on a une classe par défaut passée en prop (création depuis une classe)
    if (!etablissementId && classeIdDefaut) {
      const c = classes.find(cl => (cl.id || cl._id?.toString()) === classeIdDefaut)
      if (c?.etablissementId) {
        setEtablissementId(c.etablissementId)
        return
      }
    }

    // 2) Si on est en modification et que le formulaire a une classe sélectionnée,
    //    dériver l'établissement à partir de cette classe.
    if (!etablissementId && classeId) {
      const c2 = classes.find(cl => (cl.id || cl._id?.toString()) === classeId)
      if (c2?.etablissementId) {
        setEtablissementId(c2.etablissementId)
      }
    }
  }, [classeIdDefaut, classes, etablissementId])

  // Debug: log les établissements reçus
  useEffect(() => {
    console.log('FormulaireEleve - établissements reçus:', etablissements?.length || 0)
    console.log('FormulaireEleve - etablissementId actuel:', etablissementId)
  }, [etablissements, etablissementId])

  const etablissementsAffiche = etablissements && etablissements.length > 0 ? etablissements : []
  const classesAffichees = etablissementId
    ? classes.filter(c => c.etablissementId === etablissementId)
    : classes

  return (
    <Card className="formulaire-card">
      <CardHeader className="formulaire-header">
        <CardTitle className="text-2xl font-bold">
          {eleve ? '✏️ Modifier l\'élève' : '➕ Nouvel élève'}
        </CardTitle>
      </CardHeader>
      <CardContent className="formulaire-content">
        <form onSubmit={gererSoumission} className="space-y-6 form-animate-in">
          {/* Section Photo */}
          <div className="form-section">
            <h3 className="form-section-title">
              <span>📷</span>
              <span>Photo</span>
            </h3>
            <div className="flex flex-col items-center gap-4 pt-2">
              <div className="relative">
                <div className="h-40 w-32 photo-preview">
                  {photoPreview ? (
                    <img 
                      src={photoPreview} 
                      alt="Aperçu de la photo"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
              <label htmlFor="photo-input" className="sr-only">
                Sélectionner une photo
              </label>
              <input
                id="photo-input"
                type="file"
                ref={inputFichierRef}
                accept="image/*"
                className="hidden"
                onChange={gererSelectionPhoto}
                disabled={photoEnUpload}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => inputFichierRef.current?.click()}
                disabled={photoEnUpload}
              >
                {photoEnUpload ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Galerie
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  // Activer la caméra sur mobile
                  if (inputFichierRef.current) {
                    inputFichierRef.current.capture = 'environment'
                    inputFichierRef.current.click()
                  }
                }}
                disabled={photoEnUpload}
              >
                {photoEnUpload ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="mr-2 h-4 w-4" />
                )}
                Caméra
              </Button>
            </div>
            {erreurs.photo && (
              <p className="text-sm text-destructive">{erreurs.photo}</p>
            )}
            </div>
          </div>

          {/* Section Informations Personnelles */}
          <div className="form-section">
            <h3 className="form-section-title">
              <span>👤</span>
              <span>Informations personnelles</span>
            </h3>
            
            <div className="form-grid pt-2">
              <div className="form-group">
                <Label htmlFor="nom">Nom *</Label>
                <Input
                  id="nom"
                  placeholder="DUPONT"
                  value={nom}
                  onChange={(e) => setNom(e.target.value.toUpperCase())}
                  onBlur={() => gererBlur('nom', nom)}
                  aria-invalid={!!erreurs.nom}
                  aria-describedby={erreurs.nom ? 'nom-error' : undefined}
                  className={erreurs.nom ? 'form-control form-error-field' : 'form-control'}
                />
                {erreurs.nom && (
                  <p id="nom-error" className="form-error" role="alert">{erreurs.nom}</p>
                )}
              </div>
              
              <div className="form-group">
                <Label htmlFor="prenom">Prénom *</Label>
                <Input
                  id="prenom"
                  placeholder="Marie"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  onBlur={() => gererBlur('prenom', prenom)}
                  aria-invalid={!!erreurs.prenom}
                  aria-describedby={erreurs.prenom ? 'prenom-error' : undefined}
                  className={erreurs.prenom ? 'form-control form-error-field' : 'form-control'}
                />
                {erreurs.prenom && (
                  <p id="prenom-error" className="form-error" role="alert">{erreurs.prenom}</p>
                )}
              </div>
            </div>
          </div>

          {/* Date et Lieu de naissance */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dateNaissance">Date de naissance *</Label>
              <Input
                id="dateNaissance"
                type="date"
                value={dateNaissance}
                onChange={(e) => setDateNaissance(e.target.value)}
                onBlur={() => gererBlur('dateNaissance', dateNaissance)}
                aria-invalid={!!erreurs.dateNaissance}
                aria-describedby={erreurs.dateNaissance ? 'dateNaissance-error' : undefined}
                className={erreurs.dateNaissance ? 'border-destructive' : ''}
              />
              {erreurs.dateNaissance && (
                <p id="dateNaissance-error" className="form-error" role="alert">{erreurs.dateNaissance}</p>
              )}
              {erreurs.dateNaissance && (
                <p className="text-sm text-destructive">{erreurs.dateNaissance}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lieuNaissance">Lieu de naissance</Label>
              <Input
                id="lieuNaissance"
                placeholder="Paris"
                value={lieuNaissance}
                onChange={(e) => setLieuNaissance(e.target.value)}
              />
            </div>
          </div>

          {/* Sexe et Classe */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sexe">Sexe *</Label>
              <Select value={sexe || ''} onValueChange={(v) => setSexe(v as Sexe)}>
                <SelectTrigger id="sexe">
                  <SelectValue placeholder="Sélectionner le sexe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Masculin</SelectItem>
                  <SelectItem value="F">Féminin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="etablissement">Établissement *</Label>
                <Select 
                  value={etablissementId} 
                  onValueChange={(v) => setEtablissementId(v)}
                >
                  <SelectTrigger id="etablissement">
                    <SelectValue placeholder={etablissementsAffiche.length === 0 ? "Aucun établissement disponible" : "Sélectionner un établissement"} />
                  </SelectTrigger>
                  <SelectContent>
                    {etablissementsAffiche.length > 0 ? (
                      etablissementsAffiche.map((etab, idx) => (
                        <SelectItem 
                          key={etab.id || etab._id?.toString() || `etab-${idx}`} 
                          value={etab.id || etab._id?.toString() || ''}
                        >
                          {etab.nom}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        Aucun établissement trouvé
                      </div>
                    )}
                  </SelectContent>
                </Select>
                {erreurs.etablissementId && (
                  <p className="text-sm text-destructive">{erreurs.etablissementId}</p>
                )}

                <Label htmlFor="classe">Classe *</Label>
              <Select 
                value={classeId} 
                onValueChange={setClasseId}
                disabled={classesAffichees.length === 0}
              >
                <SelectTrigger 
                  id="classe"
                  className={erreurs.classeId ? 'border-destructive' : ''}
                  disabled={classesAffichees.length === 0}
                >
                  <SelectValue placeholder="Sélectionner une classe" />
                </SelectTrigger>
                <SelectContent>
                    {classesAffichees.map((classe, idx) => (
                      <SelectItem
                        key={classe.id || classe._id?.toString() || `classe-${idx}`}
                        value={classe.id || classe._id?.toString() || `classe-${idx}`}
                      >
                        {classe.nom} - {classe.niveau}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {classesAffichees.length === 0 && (
                <p className="text-sm text-muted" style={{ marginTop: 8 }}>
                  Aucune classe disponible pour cet établissement.
                </p>
              )}
              {erreurs.classeId && (
                <p className="text-sm text-destructive">{erreurs.classeId}</p>
              )}
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onAnnuler}
              disabled={enChargement || photoEnUpload}
              className="flex-1 sm:flex-none"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={enChargement || classesAffichees.length === 0 || photoEnUpload}
              className="flex-1 sm:flex-none"
              size="lg"
            >
              {(enChargement || photoEnUpload) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {photoEnUpload ? 'Upload...' : eleve ? 'Enregistrer' : 'Créer l\'élève'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
})
