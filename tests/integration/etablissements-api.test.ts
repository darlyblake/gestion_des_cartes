import { describe, it, expect, vi, beforeAll } from 'vitest'

// Mock MongoDB connection
const mockCollection = {
  find: vi.fn().mockReturnValue({
    toArray: vi.fn().mockResolvedValue([
      { _id: '1', nom: 'École Primaire Central', adresse: '123 rue de l\'École', telephone: '0123456789' },
      { _id: '2', nom: 'Collège du Nord', adresse: '456 avenue des Étudiants', telephone: '0987654321' }
    ])
  }),
  insertOne: vi.fn().mockResolvedValue({ insertedId: '3' }),
  findOne: vi.fn().mockResolvedValue({ _id: '1', nom: 'École Primaire Central' }),
  updateOne: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
  deleteOne: vi.fn().mockResolvedValue({ deletedCount: 1 })
}

const mockDb = {
  collection: vi.fn().mockReturnValue(mockCollection)
}

const mockMongoClient = {
  db: vi.fn().mockReturnValue(mockDb),
  close: vi.fn()
}

vi.mock('@/lib/services/mongodb', () => ({
  connectToDatabase: vi.fn().mockResolvedValue(mockMongoClient)
}))

describe('Établissements API Integration', () => {
  beforeAll(async () => {
    // Setup test environment
  })

  describe('GET /api/etablissements', () => {
    it('should return list of establishments', async () => {
      const mockRequest = {
        method: 'GET',
        query: {},
        json: vi.fn(),
        headers: new Headers()
      }

      const handler = (await import('@/app/api/etablissements/route')).GET
      const response = await handler(mockRequest as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.succes).toBe(true)
      expect(Array.isArray(data.donnees)).toBe(true)
      expect(data.donnees.length).toBeGreaterThan(0)
    })

    it('should search establishments by name', async () => {
      const mockRequest = {
        method: 'GET',
        query: { recherche: 'École' },
        json: vi.fn(),
        headers: new Headers()
      }

      const handler = (await import('@/app/api/etablissements/route')).GET
      const response = await handler(mockRequest as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.succes).toBe(true)
    })
  })

  describe('POST /api/etablissements', () => {
    it('should create a new establishment', async () => {
      const etablissementData = {
        nom: 'Lycée Moderne',
        adresse: '789 boulevard de l\'Éducation',
        telephone: '0145678901',
        email: 'contact@lycee.fr',
        couleur: '#1e40af',
        anneeScolaire: '2025-2026'
      }

      const mockRequest = {
        method: 'POST',
        body: etablissementData,
        json: vi.fn().mockResolvedValue(etablissementData),
        headers: new Headers()
      }

      const handler = (await import('@/app/api/etablissements/route')).POST
      const response = await handler(mockRequest as any)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.succes).toBe(true)
      expect(mockCollection.insertOne).toHaveBeenCalledWith(etablissementData)
    })

    it('should validate required fields', async () => {
      const invalidData = {
        nom: '',  // Empty name should fail
        adresse: '123 rue Test'
      }

      const mockRequest = {
        method: 'POST',
        body: invalidData,
        json: vi.fn().mockResolvedValue(invalidData),
        headers: new Headers()
      }

      const handler = (await import('@/app/api/etablissements/route')).POST
      const response = await handler(mockRequest as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.succes).toBe(false)
      expect(data.erreur).toContain('nom')
    })

    it('should validate email format', async () => {
      const invalidData = {
        nom: 'Test School',
        adresse: '123 rue Test',
        email: 'invalid-email-format'
      }

      const mockRequest = {
        method: 'POST',
        body: invalidData,
        json: vi.fn().mockResolvedValue(invalidData),
        headers: new Headers()
      }

      const handler = (await import('@/app/api/etablissements/route')).POST
      const response = await handler(mockRequest as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.succes).toBe(false)
      expect(data.erreur).toContain('email')
    })

    it('should validate phone number format', async () => {
      const invalidData = {
        nom: 'Test School',
        adresse: '123 rue Test',
        telephone: 'invalid-phone'
      }

      const mockRequest = {
        method: 'POST',
        body: invalidData,
        json: vi.fn().mockResolvedValue(invalidData),
        headers: new Headers()
      }

      const handler = (await import('@/app/api/etablissements/route')).POST
      const response = await handler(mockRequest as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.succes).toBe(false)
      expect(data.erreur).toContain('telephone')
    })
  })

  describe('PUT /api/etablissements/[id]', () => {
    it('should update an existing establishment', async () => {
      const updateData = {
        nom: 'École Mise à Jour',
        telephone: '0123456789'
      }

      const mockRequest = {
        method: 'PUT',
        body: updateData,
        json: vi.fn().mockResolvedValue(updateData),
        headers: new Headers(),
        params: { id: '1' }
      }

      const handler = (await import('@/app/api/etablissements/[id]/route')).PUT
      const response = await handler(mockRequest as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.succes).toBe(true)
      expect(mockCollection.updateOne).toHaveBeenCalled()
    })

    it('should return 404 for non-existent establishment', async () => {
      mockCollection.findOne.mockResolvedValue(null)

      const updateData = { nom: 'Updated School' }
      const mockRequest = {
        method: 'PUT',
        body: updateData,
        json: vi.fn().mockResolvedValue(updateData),
        headers: new Headers(),
        params: { id: '999' }
      }

      const handler = (await import('@/app/api/etablissements/[id]/route')).PUT
      const response = await handler(mockRequest as any)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.succes).toBe(false)
      expect(data.erreur).toContain('non trouvé')
    })
  })
})
