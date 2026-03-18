import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMocks } from 'node-mocks-http'

// Mock Cloudinary service
vi.mock('@/lib/services/cloudinary', () => ({
  uploadImage: vi.fn().mockResolvedValue({
    secure_url: 'https://cloudinary.com/test.jpg',
    public_id: 'test_public_id'
  })
}))

// Mock rate limiting
vi.mock('../rate-limit', () => ({
  rateLimit: vi.fn().mockImplementation(() => ({
    check: () => Promise.resolve({ allowed: true })
  }))
}))

describe('Upload API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/upload', () => {
    it('should upload image successfully', async () => {
      const mockFile = Buffer.from('fake-image-data')
      const formData = new FormData()
      formData.append('image', new Blob([mockFile], { type: 'image/jpeg' }), 'test.jpg')
      formData.append('type', 'photo')

      const { req } = createMocks({
        method: 'POST',
        body: formData,
        headers: {
          'content-type': 'multipart/form-data'
        }
      })

      // Mock FormData parsing
      req.formData = vi.fn().mockResolvedValue(formData)

      const handler = (await import('@/app/api/upload/route')).POST
      const response = await handler(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.succes).toBe(true)
      expect(data.donnees).toHaveProperty('url')
      expect(data.donnees.url).toContain('cloudinary.com')
    })

    it('should reject non-image files', async () => {
      const mockFile = Buffer.from('fake-text-data')
      const formData = new FormData()
      formData.append('image', new Blob([mockFile], { type: 'text/plain' }), 'test.txt')

      const { req } = createMocks({
        method: 'POST',
        body: formData
      })

      req.formData = vi.fn().mockResolvedValue(formData)

      const handler = (await import('@/app/api/upload/route')).POST
      const response = await handler(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.succes).toBe(false)
      expect(data.erreur).toContain('Type de fichier')
    })

    it('should enforce rate limiting', async () => {
      // Mock rate limit exceeded
      const { rateLimit } = await import('../rate-limit')
      vi.mocked(rateLimit).mockReturnValue({
        check: () => Promise.resolve({ allowed: false, reset: Date.now() + 60000 })
      })

      const formData = new FormData()
      formData.append('image', new Blob(['test'], { type: 'image/jpeg' }), 'test.jpg')

      const { req } = createMocks({
        method: 'POST',
        body: formData,
        headers: { 'x-forwarded-for': '192.168.1.1' }
      })

      req.formData = vi.fn().mockResolvedValue(formData)

      const handler = (await import('@/app/api/upload/route')).POST
      const response = await handler(req)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.succes).toBe(false)
      expect(data.erreur).toContain('Trop de requêtes')
    })

    it('should handle file size limits', async () => {
      // Create a large file (over 5MB)
      const largeFile = Buffer.alloc(6 * 1024 * 1024, 'a') // 6MB
      const formData = new FormData()
      formData.append('image', new Blob([largeFile], { type: 'image/jpeg' }), 'large.jpg')

      const { req } = createMocks({
        method: 'POST',
        body: formData
      })

      req.formData = vi.fn().mockResolvedValue(formData)

      const handler = (await import('@/app/api/upload/route')).POST
      const response = await handler(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.succes).toBe(false)
      expect(data.erreur).toContain('taille')
    })

    it('should handle Cloudinary upload errors', async () => {
      // Mock Cloudinary error
      const { uploadImage } = await import('@/lib/services/cloudinary')
      vi.mocked(uploadImage).mockRejectedValue(new Error('Cloudinary error'))

      const formData = new FormData()
      formData.append('image', new Blob(['test'], { type: 'image/jpeg' }), 'test.jpg')

      const { req } = createMocks({
        method: 'POST',
        body: formData
      })

      req.formData = vi.fn().mockResolvedValue(formData)

      const handler = (await import('@/app/api/upload/route')).POST
      const response = await handler(req)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.succes).toBe(false)
      expect(data.erreur).toContain('upload')
    })
  })
})
