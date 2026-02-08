/**
 * Route API pour les opérations bulk sur le personnel
 * Permet l'import massif de membres du personnel
 * 
 * POST /api/personnel/bulk - Import multiple
 */

import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getCollection } from '@/lib/services/mongodb'
import { checkSensitiveRateLimit } from '@/lib/services/rate-limiter'
import { creerPersonnelSchema } from '@/lib/services/validation'

/**
 * POST /api/personnel/bulk
 * Import multiple de membres du personnel
 */
export async function POST(requete: Request) {
  try {
    // Rate limiting stricte pour les imports massifs
    const rateLimitError = await checkSensitiveRateLimit(requete)
    if (rateLimitError) return rateLimitError

    const body = await requete.json()
    const { personnel } = body

    // Validation du format
    if (!Array.isArray(personnel) || personnel.length === 0) {
      return NextResponse.json(
        { succes: false, erreur: 'Le tableau personnel est requis et ne doit pas être vide' },
        { status: 400 }
      )
    }

    if (personnel.length > 500) {
      return NextResponse.json(
        { succes: false, erreur: 'Maximum 500 membres par import' },
        { status: 400 }
      )
    }

    const personnelCollection = await getCollection('personnel')
    const etablissementsCollection = await getCollection('etablissements')

    const resultats = {
      importes: 0,
      erreurs: 0,
      details: [] as Array<{ index: number; erreur: string; data?: Record<string, unknown> }>,
    }

    // Vérifier que l'établissement existe
    const etablissementIds = [...new Set(personnel.map((p: Record<string, unknown>) => String(p.etablissementId)))]
    const etablissementsValides = await etablissementsCollection
      .find({ _id: { $in: etablissementIds.map((id: string) => new ObjectId(id)) } })
      .toArray()
    
    const etablissementsValidesMap = new Set(etablissementsValides.map((e) => e._id.toString()))

    // Préparer les opérations bulk
    const operations: Array<{
      insertOne: { document: Record<string, unknown> }
    }> = []

    personnel.forEach((personnelData: Record<string, unknown>, index: number) => {
      const validation = creerPersonnelSchema.safeParse(personnelData)
      
      if (!validation.success || !etablissementsValidesMap.has(String(personnelData.etablissementId))) {
        resultats.erreurs++
        resultats.details.push({
          index,
          data: personnelData,
          erreur: validation.success 
            ? 'Établissement invalide' 
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
            role: data.role,
            fonction: data.fonction,
            email: data.email || null,
            telephone: data.telephone || null,
            photo: data.photo || null,
            etablissementId: new ObjectId(data.etablissementId),
            creeLe: new Date(),
            modifieLe: new Date(),
          },
        }
      })
    })

    // Exécuter les opérations bulk
    if (operations.length > 0) {
      const bulkResult = await personnelCollection.bulkWrite(operations)
      resultats.importes = bulkResult.insertedCount
    }

    return NextResponse.json({
      succes: true,
      donnees: {
        totalRecu: personnel.length,
        importes: resultats.importes,
        erreurs: resultats.erreurs,
        tauxReussite: Math.round((resultats.importes / personnel.length) * 100),
        details: resultats.details.slice(0, 10),
      },
      message: `Import terminé: ${resultats.importes}/${personnel.length} membres importés`,
    })
  } catch (erreur) {
    console.error('Erreur lors de l\'import bulk personnel:', erreur)
    return NextResponse.json(
      { succes: false, erreur: 'Erreur lors de l\'import massif du personnel' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/personnel/bulk/template
 * Retourne un modèle pour les imports
 */
export async function GET() {
  const template = {
    colonnes: [
      { nom: 'nom', obligatoire: true, exemple: 'DUPONT', description: 'Nom en majuscules' },
      { nom: 'prenom', obligatoire: true, exemple: 'Jean', description: 'Prénom' },
      { nom: 'role', obligatoire: true, exemple: 'enseignant', description: 'Role: directeur, enseignant, censeur, etc.' },
      { nom: 'fonction', obligatoire: true, exemple: 'Professeur de Maths', description: 'Fonction détaillée' },
      { nom: 'email', obligatoire: false, exemple: 'jean.dupont@ecole.fr', description: 'Email' },
      { nom: 'telephone', obligatoire: false, exemple: '0612345678', description: 'Téléphone' },
      { nom: 'etablissementId', obligatoire: true, exemple: '507f1f77bcf86cd799439011', description: 'ID MongoDB de l\'établissement' },
    ],
    rolesValides: ['directeur', 'enseignant', 'censeur', 'surveillant', 'informaticien', 'secretaire', 'gestionnaire', 'infirmier', 'bibliothecaire', 'autre'],
  }

  return NextResponse.json({
    succes: true,
    donnees: template,
  })
}
