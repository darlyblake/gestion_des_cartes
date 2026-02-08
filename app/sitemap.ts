import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const staticRoutes = [
    { path: '', priority: 1.0 },
    { path: '/eleves', priority: 0.8 },
    { path: '/classes', priority: 0.8 },
    { path: '/personnel', priority: 0.8 },
    { path: '/cartes', priority: 0.7 },
    { path: '/etablissements', priority: 0.8 },
  ]

  return staticRoutes.map(({ path, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'weekly' as const,
    priority,
  }))
}
