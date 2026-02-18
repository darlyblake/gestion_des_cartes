/**
 * Route API pour l'upload d'images
 * POST - Upload une image (photo ou logo) vers Cloudinary
 */

import { NextResponse } from 'next/server'
import { uploadImage } from '@/lib/services/cloudinary'

// NOTE: `maxDuration` n'est pas une propriété reconnue par Next.js route config.
// La gestion du timeout se fait côté plateforme (Vercel) ou via `vercel.json`.
// Nous retirons cet export pour éviter l'avertissement de compilation.

// Simple rate limiter in-memory (per IP) — pour production utilisez un store distribué (Redis)
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 30 // max requests per window per IP
const ipCounters = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string) {
  const now = Date.now()
  const entry = ipCounters.get(ip)
  if (!entry || now > entry.resetAt) {
    ipCounters.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }

  if (entry.count >= RATE_LIMIT_MAX) return true
  entry.count += 1
  return false
}

export async function POST(requete: Request) {
  // Rate limiting
  const ip = (requete.headers.get('x-forwarded-for') || requete.headers.get('host') || 'unknown') as string
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { succes: false, erreur: 'Trop de requêtes — réessayez plus tard' },
      { status: 429 }
    )
  }
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
    let folder = 'school-card/photos'
    if (type === 'logo') folder = 'school-card/logos'
    if (type === 'signature') folder = 'school-card/signatures'

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
