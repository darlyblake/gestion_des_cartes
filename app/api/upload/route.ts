/**
 * Route API pour l'upload d'images
 * POST - Upload une image (photo ou logo) vers Cloudinary
 */

import { NextResponse } from 'next/server'
import { uploadImage } from '@/lib/services/cloudinary'

export async function POST(requete: Request) {
  try {
    const formData = await requete.formData()
    const fichier = formData.get('image') as File | null
    const type = formData.get('type') as string | null

    // Validation du fichier
    if (!fichier) {
      return NextResponse.json(
        { succes: false, erreur: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    // Validation du type de fichier
    const typesAutorises = ['image/jpeg', 'image/png', 'image/webp']
    if (!typesAutorises.includes(fichier.type)) {
      return NextResponse.json(
        { succes: false, erreur: 'Type de fichier non autorisé. Utilisez JPEG, PNG ou WebP' },
        { status: 400 }
      )
    }

    // Validation de la taille (max 5MB)
    const taillMax = 5 * 1024 * 1024 // 5MB
    if (fichier.size > taillMax) {
      return NextResponse.json(
        { succes: false, erreur: 'Le fichier est trop volumineux. Maximum 5MB' },
        { status: 400 }
      )
    }

    // Validation des variables d'environnement
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('❌ Configuration Cloudinary manquante:', {
        cloudName: !!cloudName,
        apiKey: !!apiKey,
        apiSecret: !!apiSecret,
      })
      return NextResponse.json(
        { succes: false, erreur: 'Configuration Cloudinary manquante. Vérifiez les variables d\'environnement.' },
        { status: 500 }
      )
    }

    // Convertir le fichier en buffer
    const bytes = await fichier.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Déterminer le dossier Cloudinary selon le type
    const folder = type === 'logo' ? 'school-card/logos' : 'school-card/photos'

    // Upload vers Cloudinary
    const url = await uploadImage(buffer, fichier.name, folder)

    return NextResponse.json({
      succes: true,
      url,
      message: 'Image uploadée avec succès sur Cloudinary',
    })
  } catch (erreur) {
    const messageErreur = erreur instanceof Error ? erreur.message : 'Erreur inconnue'
    console.error('❌ Erreur lors de l\'upload:', {
      message: messageErreur,
      stack: erreur instanceof Error ? erreur.stack : undefined,
    })
    return NextResponse.json(
      { 
        succes: false, 
        erreur: 'Erreur lors de l\'upload de l\'image',
        detail: process.env.NODE_ENV === 'development' ? messageErreur : undefined,
      },
      { status: 500 }
    )
  }
}
