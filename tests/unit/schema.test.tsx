import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import {
  Schema,
  OrganizationSchema,
  WebApplicationSchema,
  BreadcrumbSchema,
  StudentCardSchema,
  PageSchema,
} from '@/components/schema'

/**
 * Tests pour les schémas JSON-LD (Schema.org)
 * Valide la structure des données structurées pour SEO
 */

describe('Schema Components', () => {
  describe('Schema - Generic JSON-LD', () => {
    it('should render script tag with JSON-LD data', () => {
      const testData = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Test Org',
      }

      const { container } = render(<Schema data={testData} />)
      const script = container.querySelector('script[type="application/ld+json"]')

      expect(script).toBeInTheDocument()
      expect(script?.innerHTML).toContain('Test Org')
    })

    it('should serialize nested objects correctly', () => {
      const testData = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'John Doe',
        affiliation: {
          '@type': 'Organization',
          name: 'My Company',
        },
      }

      const { container } = render(<Schema data={testData} />)
      const script = container.querySelector('script[type="application/ld+json"]')

      expect(script?.innerHTML).toContain('John Doe')
      expect(script?.innerHTML).toContain('My Company')
      expect(script?.innerHTML).toContain('Person')
    })

    it('should handle empty objects', () => {
      const { container } = render(<Schema data={{}} />)
      const script = container.querySelector('script[type="application/ld+json"]')

      expect(script).toBeInTheDocument()
      expect(script?.innerHTML).toBe('{}')
    })
  })

  describe('OrganizationSchema', () => {
    it('should render with default values', () => {
      const { container } = render(<OrganizationSchema />)
      const script = container.querySelector('script[type="application/ld+json"]')

      expect(script?.innerHTML).toContain('Cartes Scolaires')
      expect(script?.innerHTML).toContain('Organization')
      expect(script?.innerHTML).toContain('https://schema.org')
    })

    it('should render with custom props', () => {
      const { container } = render(
        <OrganizationSchema
          name="Custom Org"
          description="Custom Description"
          email="contact@example.com"
        />
      )
      const script = container.querySelector('script[type="application/ld+json"]')

      expect(script?.innerHTML).toContain('Custom Org')
      expect(script?.innerHTML).toContain('Custom Description')
      expect(script?.innerHTML).toContain('contact@example.com')
    })

    it('should create proper ImageObject for logo', () => {
      const { container } = render(
        <OrganizationSchema logo="/logo.png" url="http://example.com" />
      )
      const script = container.querySelector('script[type="application/ld+json"]')

      expect(script?.innerHTML).toContain('ImageObject')
      expect(script?.innerHTML).toContain('http://example.com/logo.png')
    })

    it('should not include contactPoint when email is missing', () => {
      const { container } = render(<OrganizationSchema />)
      const script = container.querySelector('script[type="application/ld+json"]')

      expect(script?.innerHTML).not.toContain('contactPoint')
    })
  })

  describe('WebApplicationSchema', () => {
    it('should render with default values', () => {
      const { container } = render(<WebApplicationSchema />)
      const script = container.querySelector('script[type="application/ld+json"]')

      expect(script?.innerHTML).toContain('WebApplication')
      expect(script?.innerHTML).toContain('Cartes Scolaires')
      expect(script?.innerHTML).toContain('EducationalApplication')
    })

    it('should include offers with price 0 for free apps', () => {
      const { container } = render(<WebApplicationSchema isFree={true} />)
      const script = container.querySelector('script[type="application/ld+json"]')

      expect(script?.innerHTML).toContain('Offer')
      expect(script?.innerHTML).toContain('"price":"0"')
    })

    it('should include potentialAction for free apps', () => {
      const { container } = render(<WebApplicationSchema isFree={true} />)
      const script = container.querySelector('script[type="application/ld+json"]')

      expect(script?.innerHTML).toContain('UseAction')
    })

    it('should handle custom application categories', () => {
      const { container } = render(
        <WebApplicationSchema applicationCategory="ProductivityApplication" />
      )
      const script = container.querySelector('script[type="application/ld+json"]')

      expect(script?.innerHTML).toContain('ProductivityApplication')
    })
  })

  describe('BreadcrumbSchema', () => {
    it('should render with default breadcrumbs', () => {
      const { container } = render(<BreadcrumbSchema />)
      const script = container.querySelector('script[type="application/ld+json"]')

      expect(script?.innerHTML).toContain('BreadcrumbList')
      expect(script?.innerHTML).toContain('Accueil')
      expect(script?.innerHTML).toContain('Élèves')
    })

    it('should create ListItem for each breadcrumb', () => {
      const items = [
        { name: 'Home', url: '/' },
        { name: 'Products', url: '/products' },
      ]

      const { container } = render(<BreadcrumbSchema items={items} />)
      const script = container.querySelector('script[type="application/ld+json"]')

      expect(script?.innerHTML).toContain('ListItem')
      expect(script?.innerHTML).toContain('Home')
      expect(script?.innerHTML).toContain('Products')
    })

    it('should set position numbers correctly', () => {
      const items = [{ name: 'A', url: '/a' }, { name: 'B', url: '/b' }]

      const { container } = render(<BreadcrumbSchema items={items} />)
      const script = container.querySelector('script[type="application/ld+json"]')
      const json = JSON.parse(script?.innerHTML || '{}')

      expect(json.itemListElement[0].position).toBe(1)
      expect(json.itemListElement[1].position).toBe(2)
    })

    it('should convert urls to absolute with baseUrl', () => {
      const items = [{ name: 'Test', url: '/test' }]
      const baseUrl = 'https://example.com'

      const { container } = render(
        <BreadcrumbSchema items={items} baseUrl={baseUrl} />
      )
      const script = container.querySelector('script[type="application/ld+json"]')

      expect(script?.innerHTML).toContain('https://example.com/test')
    })
  })

  describe('StudentCardSchema', () => {
    it('should render with default values', () => {
      const { container } = render(<StudentCardSchema />)
      const script = container.querySelector('script[type="application/ld+json"]')

      expect(script?.innerHTML).toContain('Person')
      expect(script?.innerHTML).toContain('Prénom Nom')
    })

    it('should include affiliation organization', () => {
      const { container } = render(
        <StudentCardSchema firstName="Jean" lastName="Dupont" schoolName="École XYZ" />
      )
      const script = container.querySelector('script[type="application/ld+json"]')

      expect(script?.innerHTML).toContain('Jean Dupont')
      expect(script?.innerHTML).toContain('École XYZ')
    })

    it('should include photo when provided', () => {
      const { container } = render(
        <StudentCardSchema photo="/photos/student.jpg" />
      )
      const script = container.querySelector('script[type="application/ld+json"]')

      expect(script?.innerHTML).toContain('student.jpg')
    })

    it('should set givenName and familyName correctly', () => {
      const { container } = render(
        <StudentCardSchema firstName="Alice" lastName="Smith" />
      )
      const script = container.querySelector('script[type="application/ld+json"]')
      const json = JSON.parse(script?.innerHTML || '{}')

      expect(json.givenName).toBe('Alice')
      expect(json.familyName).toBe('Smith')
    })
  })

  describe('PageSchema', () => {
    it('should render with default values', () => {
      const { container } = render(<PageSchema />)
      const script = container.querySelector('script[type="application/ld+json"]')

      expect(script?.innerHTML).toContain('WebPage')
      expect(script?.innerHTML).toContain('Cartes Scolaires')
    })

    it('should include custom title and description', () => {
      const { container } = render(
        <PageSchema
          title="Student List"
          description="List of all students"
        />
      )
      const script = container.querySelector('script[type="application/ld+json"]')

      expect(script?.innerHTML).toContain('Student List')
      expect(script?.innerHTML).toContain('List of all students')
    })

    it('should include image when provided', () => {
      const { container } = render(
        <PageSchema imageUrl="https://example.com/image.jpg" />
      )
      const script = container.querySelector('script[type="application/ld+json"]')

      expect(script?.innerHTML).toContain('https://example.com/image.jpg')
    })

    it('should format datePublished as ISO string', () => {
      const date = new Date('2024-01-15')
      const { container } = render(<PageSchema datePublished={date} />)
      const script = container.querySelector('script[type="application/ld+json"]')

      expect(script?.innerHTML).toContain('2024-01-15')
    })

    it('should accept string datePublished', () => {
      const { container } = render(
        <PageSchema datePublished="2024-01-15T10:00:00Z" />
      )
      const script = container.querySelector('script[type="application/ld+json"]')

      expect(script?.innerHTML).toContain('2024-01-15T10:00:00Z')
    })
  })

  describe('SEO Impact', () => {
    it('all schemas should be valid JSON', () => {
      const schemas = [
        <Schema data={{ '@context': 'https://schema.org' }} />,
        <OrganizationSchema />,
        <WebApplicationSchema />,
        <BreadcrumbSchema />,
        <StudentCardSchema />,
        <PageSchema />,
      ]

      schemas.forEach((schema) => {
        const { container } = render(schema)
        const script = container.querySelector('script[type="application/ld+json"]')
        const jsonString = script?.innerHTML

        expect(() => JSON.parse(jsonString || '{}')).not.toThrow()
      })
    })

    it('all schemas should have @context', () => {
      const { container } = render(<OrganizationSchema />)
      const script = container.querySelector('script[type="application/ld+json"]')
      const json = JSON.parse(script?.innerHTML || '{}')

      expect(json['@context']).toBe('https://schema.org')
    })

    it('all schemas should have @type', () => {
      const schemas = [
        <Schema data={{ '@type': 'Test' }} />,
        <OrganizationSchema />,
        <WebApplicationSchema />,
      ]

      schemas.forEach((schema) => {
        const { container } = render(schema)
        const script = container.querySelector('script[type="application/ld+json"]')
        const json = JSON.parse(script?.innerHTML || '{}')

        expect(json['@type']).toBeDefined()
      })
    })
  })
})
