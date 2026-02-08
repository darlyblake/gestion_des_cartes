/**
 * Rate Limiter Personnalisé pour Next.js API Routes
 * Protection contre les abus et attaques brute-force
 * 
 * Utilisation:
 * import { rateLimiter, checkRateLimit } from '@/lib/services/rate-limiter'
 * 
 * export async function GET(request: Request) {
 *   const errorResponse = await checkRateLimit(request)
 *   if (errorResponse) return errorResponse
 *   // ... votre logique
 * }
 */

import { NextResponse } from 'next/server'

// Configuration du rate limiter
interface RateLimitConfig {
  /** Nombre maximum de requêtes autorisées */
  limit: number
  /** Fenêtre de temps en millisecondes */
  windowMs: number
  /** Messages d'erreur personnalisés */
  message?: string
}

/**
 * Configuration par défaut
 */
const DEFAULT_CONFIG: RateLimitConfig = {
  limit: 100,      // 100 requêtes
  windowMs: 60_000, // par minute
  message: 'Trop de requêtes. Veuillez réessayer plus tard.',
}

// Rate limiter spécifique pour les endpoints sensibles
const SENSITIVE_CONFIG: RateLimitConfig = {
  limit: 10,        // 10 requêtes
  windowMs: 60_000,  // par minute
  message: 'Trop de tentatives. Veuillez patienter une minute.',
}

// Cache en mémoire pour le rate limiting
// En production, utiliser Redis pour les instances multiples
interface RateLimitEntry {
  count: number
  resetTime: number
}

const memoryStore = new Map<string, RateLimitEntry>()

/**
 * Extrait l'IP d'une requête
 */
function getClientIp(request: Request): string {
  // Headers communs pour l'IP du client
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    // x-forwarded-for peut contenir plusieurs IPs, la première est celle du client
    return forwardedFor.split(',')[0].trim()
  }
  
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }
  
  // Fallback pour le développement local
  return '127.0.0.1'
}

/**
 * Classe RateLimiter configurable
 */
export class RateLimiter {
  private config: RateLimitConfig

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Vérifie si la requête est limitée
   */
  async limit(request: Request): Promise<{
    success: boolean
    limit: number
    reset: number
    remaining: number
  }> {
    const ip = getClientIp(request)
    const key = `${ip}:${request.url}`
    const now = Date.now()
    const windowEnd = now + this.config.windowMs

    let entry = memoryStore.get(key)

    if (!entry || now > entry.resetTime) {
      // Nouvelle fenêtre ou entrée expirée
      entry = {
        count: 0,
        resetTime: windowEnd,
      }
    }

    entry.count++
    memoryStore.set(key, entry)

    const remaining = Math.max(0, this.config.limit - entry.count)
    const success = entry.count <= this.config.limit

    return {
      success,
      limit: this.config.limit,
      reset: entry.resetTime,
      remaining,
    }
  }

  /**
   * Retourne la configuration actuelle
   */
  getConfig(): RateLimitConfig {
    return this.config
  }
}

/**
 * Instance globale du rate limiter standard
 */
export const rateLimiter = new RateLimiter()

/**
 * Rate limiter pour les endpoints sensibles (authentification, etc.)
 */
export const sensitiveRateLimiter = new RateLimiter(SENSITIVE_CONFIG)

/**
 * Nettoie les entrées expirées du cache
 * À appeler périodiquement (ex: toutes les 5 minutes)
 */
export function cleanupRateLimitCache(): void {
  const now = Date.now()
  for (const [key, entry] of memoryStore.entries()) {
    if (now > entry.resetTime) {
      memoryStore.delete(key)
    }
  }
  console.log(`Rate limit cache nettoyé. ${memoryStore.size} entrées restantes.`)
}

/**
 * Récupère les statistiques du cache (pour debugging/monitoring)
 */
export function getRateLimitStats(): {
  totalEntries: number
  entries: Array<{
    key: string
    count: number
    resetTime: number
    timeUntilReset: number
  }>
} {
  return {
    totalEntries: memoryStore.size,
    entries: Array.from(memoryStore.entries()).map(([key, entry]) => ({
      key,
      count: entry.count,
      resetTime: entry.resetTime,
      timeUntilReset: Math.max(0, entry.resetTime - Date.now()),
    })),
  }
}

/**
 * Middleware prêt à l'emploi pour les routes API
 * 
 * @param request - La requête HTTP
 * @param options - Options personnalisées (optionnel)
 * @returns Response avec erreur 429 si limité, null si OK
 */
export async function checkRateLimit(
  request: Request,
  options?: Partial<RateLimitConfig>
): Promise<NextResponse | null> {
  const config = { ...DEFAULT_CONFIG, ...options }
  const limiter = new RateLimiter(config)
  const result = await limiter.limit(request)

  if (!result.success) {
    const retryAfter = Math.ceil((result.reset - Date.now()) / 1000)
    
    return new NextResponse(JSON.stringify({
      succes: false,
      erreur: config.message,
      retryAfter,
    }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Reset': result.reset.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'Retry-After': retryAfter.toString(),
      }
    })
  }

  // Retourne null pour indiquer que la requête peut continuer
  return null
}

/**
 * Version stricte pour les endpoints sensibles (login, etc.)
 */
export async function checkSensitiveRateLimit(
  request: Request
): Promise<NextResponse | null> {
  return checkRateLimit(request, SENSITIVE_CONFIG)
}

/**
 * Décorateur pour ajouter le rate limiting à une fonction handler
 * 
 * @example
 * const handler = withRateLimit(async (request) => {
 *   // Votre logique ici
 * })
 */
export function withRateLimit(
  handler: (request: Request) => Promise<NextResponse>,
  options?: Partial<RateLimitConfig>
) {
  return async function rateLimitedHandler(request: Request): Promise<NextResponse> {
    const errorResponse = await checkRateLimit(request, options)
    
    if (errorResponse) {
      return errorResponse
    }

    return handler(request)
  }
}

/**
 * Nettoie le cache périodiquement
 * Planifier avec setInterval en production si nécessaire
 */
// cleanupRateLimitCache()

