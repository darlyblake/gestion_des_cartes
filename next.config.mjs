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
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 an
  },
  
  // ✅ Optimisations de performance
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  
  // ✅ Headers de sécurité
  async headers() {
    return [
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

export default nextConfig
