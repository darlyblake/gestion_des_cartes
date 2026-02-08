/**
 * Composant réutilisable pour ajouter des schémas JSON-LD
 * Améliore le SEO avec les rich snippets et structured data
 */

interface SchemaProps {
  data: Record<string, unknown>
}

/**
 * Ajoute un schéma JSON-LD au document
 * Usage: <Schema data={{ '@context': 'https://schema.org', '@type': 'Organization', ... }} />
 */
export function Schema({ data }: SchemaProps) {
  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

/**
 * Schéma pour une organisation
 */
export function OrganizationSchema({
  name = 'Cartes Scolaires',
  description = 'Application de gestion et création de cartes scolaires pour établissements',
  url = 'http://localhost:3000',
  logo = '/logo.png',
  email,
}: {
  name?: string
  description?: string
  url?: string
  logo?: string
  email?: string
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    description,
    url,
    logo: {
      '@type': 'ImageObject',
      url: new URL(logo, url).toString(),
      width: 300,
      height: 300,
    },
    ...(email && {
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Service',
        email,
      },
    }),
  }

  return <Schema data={data} />
}

/**
 * Schéma pour une application web
 */
export function WebApplicationSchema({
  name = 'Cartes Scolaires',
  description = 'Application de gestion et création de cartes scolaires',
  url = 'http://localhost:3000',
  applicationCategory = 'EducationalApplication',
  isFree = true,
}: {
  name?: string
  description?: string
  url?: string
  applicationCategory?: string
  isFree?: boolean
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    description,
    url,
    applicationCategory,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
    },
    ...(isFree && {
      potentialAction: {
        '@type': 'UseAction',
        target: url,
      },
    }),
  }

  return <Schema data={data} />
}

/**
 * Schéma pour un breadcrumb list
 */
export function BreadcrumbSchema({
  items = [
    { name: 'Accueil', url: '/' },
    { name: 'Élèves', url: '/eleves' },
    { name: 'Classes', url: '/classes' },
    { name: 'Personnel', url: '/personnel' },
  ],
  baseUrl = 'http://localhost:3000',
}: {
  items?: Array<{ name: string; url: string }>
  baseUrl?: string
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: new URL(item.url, baseUrl).toString(),
    })),
  }

  return <Schema data={data} />
}

/**
 * Schéma pour un élément (student card)
 */
export function StudentCardSchema({
  firstName = 'Prénom',
  lastName = 'Nom',
  schoolName = 'École',
  examinationBoard = 'Académie',
  photo,
  baseUrl = 'http://localhost:3000',
}: {
  firstName?: string
  lastName?: string
  schoolName?: string
  examinationBoard?: string
  photo?: string
  baseUrl?: string
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: `${firstName} ${lastName}`,
    givenName: firstName,
    familyName: lastName,
    affiliation: {
      '@type': 'Organization',
      name: schoolName,
    },
    ...(photo && {
      image: new URL(photo, baseUrl).toString(),
    }),
  }

  return <Schema data={data} />
}

/**
 * Schéma pour une page (article/page)
 */
export function PageSchema({
  title = 'Cartes Scolaires',
  description = 'Gestion de cartes scolaires',
  imageUrl,
  datePublished,
  url = 'http://localhost:3000',
}: {
  title?: string
  description?: string
  imageUrl?: string
  datePublished?: Date | string
  url?: string
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url,
    ...(imageUrl && {
      image: imageUrl,
    }),
    ...(datePublished && {
      datePublished: datePublished instanceof Date ? datePublished.toISOString() : datePublished,
    }),
  }

  return <Schema data={data} />
}
