/**
 * Route API pour les opérations bulk sur les élèves
 * Permet l'import massif d'élèves via CSV ou tableau JSON
 * 
 * POST /api/eleves/bulk - Import multiple d'élèves
 * GET  /api/eleves/bulk/template - Téléchargement du modèle CSV
 */

import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getCollection } from '@/lib/services/mongodb'
import { checkSensitiveRateLimit } from '@/lib/services/rate-limiter'
import { creerEleveSchema } from '@/lib/services/validation'
import { serializeDocument, serializeReference } from '@/lib/services/serializers'

/**
 * POST /api/eleves/bulk
 * Import multiple d'élèves en une seule requête
 * 
 * Body:
 * {
 *   eleves: [
 *     { nom: "DUPONT", prenom: "Jean", dateNaissance: "2010-05-15", classeId: "..." },
 *     ...
 *   ]
 * }
 * 
 * Réponse:
 * {
 *   succes: true,
 *   donnees: {
 *     importes: 45,
 *     erreurs: 2,
 *     details: [...]
 *   }
 * }
 */
export async function POST(requete: Request) {
  try {
    // Rate limiting stricte pour les imports massifs
    const rateLimitError = await checkSensitiveRateLimit(requete)
    if (rateLimitError) return rateLimitError

    const body = await requete.json()
    const { eleves, options } = body

    // Validation du format
    if (!Array.isArray(eleves) || eleves.length === 0) {
      return NextResponse.json(
        { succes: false, erreur: 'Le tableau eleves est requis et ne doit pas être vide' },
        { status: 400 }
      )
    }

    if (eleves.length > 1000) {
      return NextResponse.json(
        { succes: false, erreur: 'Maximum 1000 élèves par import' },
        { status: 400 }
      )
    }

    const elevesCollection = await getCollection('eleves')
    const classesCollection = await getCollection('classes')

    const resultats = {
      importes: 0,
      erreurs: 0,
      details: [] as Array<{ index: number; erreur: string; eleve?: Record<string, unknown> }>,
    }

    // Vérifier que la classe existe pour chaque élève
    const classeIds = [...new Set(eleves.map((e: Record<string, unknown>) => String(e.classeId)))]
    const classesValides = await classesCollection
      .find({ _id: { $in: classeIds.map((id: string) => new ObjectId(id)) } })
      .toArray()
    
    const classesValidesMap = new Set(classesValides.map((c) => c._id.toString()))

    // Préparer les opérations bulk
    const operations: Array<{
      insertOne: { document: Record<string, unknown> }
    }> = []

    eleves.forEach((eleveData: Record<string, unknown>, index: number) => {
      // Validation individuelle avec Zod
      const validation = creerEleveSchema.safeParse(eleveData)
      
      if (!validation.success || !classesValidesMap.has(String(eleveData.classeId))) {
        resultats.erreurs++
        resultats.details.push({
          index,
          eleve: eleveData,
          erreur: validation.success 
            ? 'Classe invalide' 
            : 'Données invalides: ' + validation.error.issues.map((i) => i.message).join(', '),
        })
        return
      }

      const data = validation.data
      operations.push({
        insertOne: {
          document: {
            nom: data.nom.toUpperCase(),
            prenom: data.prenom,
            dateNaissance: new Date(data.dateNaissance),
            lieuNaissance: data.lieuNaissance || '',
            nationalite: (data as any).nationalite || '',
            sexe: data.sexe || 'M',
            photo: data.photo || null,
            classeId: new ObjectId(data.classeId),
            creeLe: new Date(),
            modifieLe: new Date(),
          },
        }
      })
    })

    // Exécuter les opérations bulk si des validés
    if (operations.length > 0) {
      const bulkResult = await elevesCollection.bulkWrite(operations)
      resultats.importes = bulkResult.insertedCount
    }

    return NextResponse.json({
      succes: true,
      donnees: {
        totalRecu: eleves.length,
        importes: resultats.importes,
        erreurs: resultats.erreurs,
        tauxReussite: Math.round((resultats.importes / eleves.length) * 100),
        details: resultats.details.slice(0, 10), // Limiter les détails à 10
      },
      message: `Import terminé: ${resultats.importes}/${eleves.length} élèves importés`,
    })
  } catch (erreur) {
    console.error('Erreur lors de l\'import bulk:', erreur)
    return NextResponse.json(
      { succes: false, erreur: 'Erreur lors de l\'import massif' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/eleves/bulk/template
 * Retourne un modèle CSV pour les imports
 */
export async function GET() {
  const template = {
    colonnes: [
      { nom: 'nom', obligatoire: true, exemple: 'DUPONT', description: 'Nom de famille en majuscules' },
      { nom: 'prenom', obligatoire: true, exemple: 'Jean', description: 'Prénom' },
      { nom: 'dateNaissance', obligatoire: true, exemple: '2010-05-15', description: 'Format: AAAA-MM-JJ' },
      { nom: 'lieuNaissance', obligatoire: true, exemple: 'Paris', description: 'Lieu de naissance' },
      { nom: 'nationalite', obligatoire: false, exemple: 'Française', description: 'Nationalité' },
      { nom: 'sexe', obligatoire: true, exemple: 'M ou F', description: 'Sexe' },
      { nom: 'classeId', obligatoire: true, exemple: '507f1f77bcf86cd799439011', description: 'ID MongoDB de la classe' },
      { nom: 'photo', obligatoire: false, exemple: 'https://...', description: 'URL de la photo' },
    ],
    exemple: [
      { nom: 'DUPONT', prenom: 'Jean', dateNaissance: '2010-05-15', lieuNaissance: 'Paris', nationalite: 'Française', sexe: 'M', classeId: '507f1f77bcf86cd799439011' },
      { nom: 'MARTIN', prenom: 'Marie', dateNaissance: '2010-08-20', lieuNaissance: 'Lyon', nationalite: 'Française', sexe: 'F', classeId: '507f1f77bcf86cd799439011' },
    ],
    instructions: [
      '1. Remplir le fichier CSV avec les données des élèves',
      '2. Vérifier que tous les classeId existent dans la base de données',
      '3. Convertir le CSV en JSON array',
      '4. Envoyer la requête POST avec le body: { eleves: [...] }',
    ],
  }

  return NextResponse.json({
    succes: true,
    donnees: template,
  })
}
