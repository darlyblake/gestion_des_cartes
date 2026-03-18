import { describe, it, expect, vi, beforeAll } from 'vitest'

// Mock MongoDB connection
const mockCollection = {
  find: vi.fn().mockReturnValue({
    toArray: vi.fn().mockResolvedValue([
      { _id: '1', nom: '6ème A', etablissementId: 'etab1' },
      { _id: '2', nom: '5ème B', etablissementId: 'etab1' }
    ])
  }),
  insertOne: vi.fn().mockResolvedValue({ insertedId: '3' }),
  findOne: vi.fn().mockResolvedValue({ _id: '1', nom: '6ème A' }),
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

describe('Classes API Integration', () => {
  beforeAll(async () => {
    // Setup test environment
  })

  describe('GET /api/classes', () => {
    it('should return list of classes', async () => {
      const mockRequest = {
        method: 'GET',
        query: {},
        json: vi.fn(),
        headers: new Headers()
      }

      const handler = (await import('@/app/api/classes/route')).GET
      const response = await handler(mockRequest as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.succes).toBe(true)
      expect(Array.isArray(data.donnees)).toBe(true)
      expect(data.donnees.length).toBeGreaterThan(0)
    })

    it('should filter classes by establishment', async () => {
      const mockRequest = {
        method: 'GET',
        query: { etablissementId: 'etab1' },
        json: vi.fn(),
        headers: new Headers()
      }

      const handler = (await import('@/app/api/classes/route')).GET
      const response = await handler(mockRequest as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.succes).toBe(true)
      expect(mockCollection.find).toHaveBeenCalledWith({ etablissementId: 'etab1' })
    })
  })

  describe('POST /api/classes', () => {
    it('should create a new class', async () => {
      const classData = {
        nom: '4ème C',
        etablissementId: 'etab1',
        niveau: '4ème',
        effectif: 25
      }

      const mockRequest = {
        method: 'POST',
        body: classData,
        json: vi.fn().mockResolvedValue(classData),
        headers: new Headers()
      }

      const handler = (await import('@/app/api/classes/route')).POST
      const response = await handler(mockRequest as any)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.succes).toBe(true)
      expect(mockCollection.insertOne).toHaveBeenCalledWith(classData)
    })

    it('should validate required fields', async () => {
      const invalidData = {
        nom: '',  // Empty name should fail
        etablissementId: 'etab1'
      }

      const mockRequest = {
        method: 'POST',
        body: invalidData,
        json: vi.fn().mockResolvedValue(invalidData),
        headers: new Headers()
      }

      const handler = (await import('@/app/api/classes/route')).POST
      const response = await handler(mockRequest as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.succes).toBe(false)
      expect(data.erreur).toContain('nom')
    })
  })
})
