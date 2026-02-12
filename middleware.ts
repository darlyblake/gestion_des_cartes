/**
 * Middleware pour optimiser les réponses HTTP
 * - Ajoute headers de cache appropriés
 * - Active la compression
 * - Ajoute les headers de sécurité
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Stratégies de cache par type de contenu
  const pathname = request.nextUrl.pathname

  if (pathname.startsWith('/api/')) {
    // API data - cache 5 minutes par défaut
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=600')
    // Note: Next.js gère la compression automatiquement
  } else if (pathname.startsWith('/_next/static/')) {
    // Static assets - cache 1 year (versioned by Next.js)
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  } else if (pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2)$/i)) {
    // Images and fonts - cache 30 days
    response.headers.set('Cache-Control', 'public, max-age=2592000, stale-while-revalidate=604800')
  } else if (pathname.match(/\.(css|js)$/i)) {
    // CSS/JS files - cache 1 year
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  } else {
    // HTML pages - cache 1 minute, always validate
    response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=300')
  }

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  return response
}

export const config = {
  matcher: [
    // API routes
    '/api/:path*',
    // Pages HTML
    '/',
    '/cartes/:path*',
    '/classes/:path*',
    '/eleves/:path*',
    '/etablissements/:path*',
    '/personnel/:path*',
  ]
}
