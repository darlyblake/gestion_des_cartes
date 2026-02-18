/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Autoriser les requêtes depuis l'IP 192.168.1.72 en développement
  allowedDevOrigins: ['192.168.1.72', 'localhost', '127.0.0.1'],

  // ✅ Vérifier les erreurs TypeScript en build (PRODUCTION MODE)
  typescript: {
    tsconfigPath: './tsconfig.json',
    ignoreBuildErrors: false, // ⚠️ Production: ne pas ignorer les erreurs
  },
  
  // ✅ Optimiser les images pour production
  images: {
    unoptimized: true, // ✅ Désactiver l'optimisation pour Cloudinary (erreurs 500)
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
    ],
  },
  
  // ✅ Optimisations de performance
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  
  // ✅ Headers de sécurité et de caching
  async headers() {
    return [
      // API endpoints - Cache 5 minutes
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300, stale-while-revalidate=600',
          },
          // Note: Content-Encoding is handled automatically by Next.js with compress: true
        ],
      },
      // Static assets - Cache 1 year
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Images - Cache 30 days
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=604800',
          },
        ],
      },
      // Public files - Cache 1 day
      {
        source: '/public/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=172800',
          },
        ],
      },
      // All pages - Cache 1 minute
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
    ]
  },
  
  // ✅ Configuration CORS pour production
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    }
  },

  
}

// Merge any legacy CommonJS export options into the ESM `nextConfig` object
// (previously using `module.exports` caused `module is not defined` in ESM)
// No legacy overrides applied here — keep config keys supported by Next.js.
export default nextConfig
