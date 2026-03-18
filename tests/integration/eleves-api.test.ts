import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createMocks } from 'node-mocks-http'

// Mock MongoDB connection
const mockMongoClient = {
  db: () => ({
    collection: () => ({
      find: () => ({
        toArray: () => Promise.resolve([
          { _id: '1', nom: 'Dupont', prenom: 'Jean', matricule: 'MAT001' },
          { _id: '2', nom: 'Martin', prenom: 'Marie', matricule: 'MAT002' }
        ])
      }),
      insertOne: () => Promise.resolve({ insertedId: '3' }),
      findOne: () => Promise.resolve({ _id: '1', nom: 'Dupont', prenom: 'Jean' }),
      updateOne: () => Promise.resolve({ modifiedCount: 1 }),
      deleteOne: () => Promise.resolve({ deletedCount: 1 })
    })
  })
}

// Mock the MongoDB module
vi.mock('@/lib/services/mongodb', () => ({
  connectToDatabase: () => Promise.resolve(mockMongoClient)
}))

describe('Élèves API Integration', () => {
  beforeAll(async () => {
    // Setup test database connection
  })

  afterAll(async () => {
    // Cleanup test database
  })

  describe('GET /api/eleves', () => {
    it('should return list of students', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {}
      })

      // Import and call the API handler
      const handler = (await import('@/app/api/eleves/route')).GET
      const response = await handler(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.succes).toBe(true)
      expect(Array.isArray(data.donnees)).toBe(true)
      expect(data.donnees.length).toBeGreaterThan(0)
    })

    it('should filter students by class', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { classeId: 'classe1' }
      })

      const handler = (await import('@/app/api/eleves/route')).GET
      const response = await handler(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.succes).toBe(true)
    })

    it('should handle search query', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { recherche: 'Jean' }
      })

      const handler = (await import('@/app/api/eleves/route')).GET
      const response = await handler(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.succes).toBe(true)
    })
  })

  describe('POST /api/eleves', () => {
    it('should create a new student', async () => {
      const studentData = {
        nom: 'Test',
        prenom: 'Student',
        matricule: 'TEST001',
        classeId: 'classe1',
        dateNaissance: '2000-01-01'
      }

      const { req } = createMocks({
        method: 'POST',
        body: studentData
      })

      const handler = (await import('@/app/api/eleves/route')).POST
      const response = await handler(req)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.succes).toBe(true)
      expect(data.donnees).toHaveProperty('id')
    })

    it('should validate required fields', async () => {
      const invalidData = {
        nom: '',  // Empty name should fail validation
        prenom: 'Student'
      }

      const { req } = createMocks({
        method: 'POST',
        body: invalidData
      })

      const handler = (await import('@/app/api/eleves/route')).POST
      const response = await handler(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.succes).toBe(false)
      expect(data.erreur).toContain('nom')
    })
  })
})
