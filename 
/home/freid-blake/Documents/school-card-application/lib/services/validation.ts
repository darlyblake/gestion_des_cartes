
/**
 * Schémas de validation Zod pour les routes API
 * VERSION CORRIGÉE - Accepte les query params null/undefined
 */

import { z } from 'zod'
import { ObjectId } from 'mongodb'

// ==================== VALIDATEURS UTILITAIRES ====================

export function isValidObjectId(val: unknown): boolean {
  if (val === null || val === undefined) return false
  const str = String(val)
  try {
    return ObjectId.isValid(str) && new ObjectId(str).toString() === str
  } catch {
    return false
  }
}

export const objectIdSchema = z.string().refine(isValidObjectId, {
  message: 'Identifiant MongoDB invalide'
})

// ==================== SCHÉMAS DE PAGINATION ====================

export const paginationSchema = z.object({
  page: z.union([z.string(), z.number()]).optional().transform((val) => {
    if (val === null || val === undefined || val === '') return 1
    const num = typeof val === 'string' ? parseInt(val, 10) : val
    return isNaN(num) || num < 1 ? 1 : num
  }),
  limit: z.union([z.string(), z.number()]).optional().transform((val) => {
    if (val === null || val === undefined || val === '') return 50
    const num = typeof val === 'string' ? parseInt(val, 10) : val
    if (isNaN(num) || num < 1) return 50
    if (num > 100) return 100
    return num
  }),
})

export const paginationWithSearchSchema = paginationSchema.extend({
  search: z.union([z.string(), z.number(), z.null()]).optional().transform((val) => {
    if (val === null || val === undefined || val === '') return undefined
    return String(val)
  }),
  sortBy: z.union([z.string(), z.number(), z.null()]).optional().transform((val) => {
    if (val === null || val === undefined || val === '') return undefined
    return String(val)
  }),
  sortOrder: z.union([z.string(), z.null()]).optional().transform((val) => {
    if (val === null || val === undefined || val === '') return 'desc'
    return val === 'asc' ? 'asc' : 'desc'
  }),
})

export type PaginationWithSearchParams = z.infer<typeof paginationWithSearchSchema>

// ==================== SCHÉMAS ÉTABLISSEMENTS ====================

export const creerEtablissementSchema = z.object({
  nom: z.string().min(1).max(200),
  logo: z.string().url().optional().or(z.literal('')),
  signature: z.string().optional(),
  adresse: z.string().min(1).max(500),
  telephone: z.string().min(1).max(20),
  email: z.string().email().optional().or(z.literal('')),
  siteWeb: z.string().url().optional().or(z.literal('')),
  anneeScolaire: z.string().regex(/^\d{4}-\d{4}$/),
  couleur: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#1e40af'),
  police: z.string().default('Arial'),
})

export const modifierEtablissementSchema = creerEtablissementSchema.partial()

export const etablissementsQuerySchema = paginationWithSearchSchema.extend({
  projection: z.union([z.string(), z.null()]).optional().transform((val) => {
    if (val === null || val === undefined || val === '') return 'full'
    return val === 'light' ? 'light' : 'full'
  }),
})

export type EtablissementsQueryParams = z.infer<typeof etablissementsQuerySchema>

// ==================== SCHÉMAS CLASSES ====================

export const creerClasseSchema = z.object({
  nom: z.string().min(1).max(100),
  niveau: z.string().min(1).max(50),
  etablissementId: objectIdSchema,
})

export const classesQuerySchema = paginationWithSearchSchema.extend({
  etablissementId: z.union([z.string(), z.null()]).optional().transform((val) => {
    if (val === null || val === undefined || val === '') return undefined
    return String(val)
  }),
})

export type ClassesQueryParams = z.infer<typeof classesQuerySchema>

// ==================== SCHÉMAS ÉLÈVES ====================

export const creerEleveSchema = z.object({
  nom: z.string().min(1).max(100).toUpperCase(),
  prenom: z.string().min(1).max(100),
  dateNaissance: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Date invalide',
  }),
  lieuNaissance: z.string().min(1).max(200),
  sexe: z.enum(['M', 'F']),
  photo: z.string().url().optional().or(z.literal('')),
  classeId: objectIdSchema,
})

export const modifierEleveSchema = creerEleveSchema.partial()

export const elevesQuerySchema = paginationWithSearchSchema.extend({
  classeId: z.union([z.string(), z.null()]).optional().transform((val) => {
    if (val === null || val === undefined || val === '') return undefined
    return String(val)
  }),
  etablissementId: z.union([z.string(), z.null()]).optional().transform((val) => {
    if (val === null || val === undefined || val === '') return undefined
    return String(val)
  }),
})

export type ElevesQueryParams = z.infer<typeof elevesQuerySchema>

// ==================== SCHÉMAS PERSONNEL ====================

export const creerPersonnelSchema = z.object({
  nom: z.string().min(1).max(100).toUpperCase(),
  prenom: z.string().min(1).max(100),
  role: z.enum([
    'directeur',
    'enseignant',
    'censeur',
    'surveillant',
    'informaticien',
    'gestionnaire',
    'infirmier',
    'bibliothecaire',
    'secretaire',
    'autre',
  ]),
  fonction: z.string().min(1).max(100),
  email: z.string().email().optional().or(z.literal('')),
  telephone: z.string().max(20).optional(),
  photo: z.string().url().optional().or(z.literal('')),
  etablissementId: objectIdSchema,
})

export const personnelQuerySchema = paginationWithSearchSchema.extend({
  etablissementId: z.union([z.string(), z.null()]).optional().transform((val) => {
    if (val === null || val === undefined || val === '') return undefined
    return String(val)
  }),
  role: z.union([z.string(), z.null()]).optional().transform((val) => {
    if (val === null || val === undefined || val === '') return undefined
    return String(val)
  }),
})

export type PersonnelQueryParams = z.infer<typeof personnelQuerySchema>

// ==================== FONCTIONS UTILITAIRES ====================

export function validateQueryParams<T>(
  schema: z.ZodSchema<T>,
  params: Record<string, unknown>
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(params)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, errors: result.error }
}

export async function validateRequestBody<T>(
  schema: z.ZodSchema<T>,
  request: Request
): Promise<{ success: true; data: T } | { success: false; errors: z.ZodError; status: 400 } | { success: false; error: string; status: 500 }> {
  try {
    const body = await request.json()
    const result = schema.safeParse(body)
    if (result.success) {
      return { success: true, data: result.data }
    }
    return { success: false, errors: result.error, status: 400 }
  } catch {
    return { success: false, error: 'Corps de requête invalide', status: 500 }
  }
}

export function generatePaginationMeta(total: number, page: number, limit: number) {
  const totalPages = Math.ceil(total / limit)
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  }
}

