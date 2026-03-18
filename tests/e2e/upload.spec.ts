import { test, expect } from '@playwright/test'

test.describe('Upload Functionality', () => {
  test('should upload student photo successfully', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/eleves/nouveau`)
    
    // Wait for form to load
    await page.waitForSelector('form')
    
    // Find file input for photo
    const fileInput = page.locator('input[type="file"]').first()
    await expect(fileInput).toBeVisible()
    
    // Create a test file
    const fileContent = Buffer.from('fake image content')
    const fileName = 'test-photo.jpg'
    
    // Upload file
    await fileInput.setInputFiles({
      name: fileName,
      mimeType: 'image/jpeg',
      buffer: fileContent
    })
    
    // Check for upload success indicator
    await expect(page.locator('text=Upload réussi').or(page.locator('[data-testid="upload-success"]'))).toBeVisible({ timeout: 10000 })
  })

  test('should show error for invalid file type', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/eleves/nouveau`)
    
    // Find file input
    const fileInput = page.locator('input[type="file"]').first()
    
    // Upload invalid file (text file instead of image)
    const fileContent = Buffer.from('not an image')
    await fileInput.setInputFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: fileContent
    })
    
    // Check for error message
    await expect(page.locator('text=Type de fichier invalide').or(page.locator('[data-testid="upload-error"]'))).toBeVisible()
  })

  test('should handle multiple file uploads', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/personnel/nouveau`)
    
    // Look for multiple file inputs
    const fileInputs = page.locator('input[type="file"]')
    const count = await fileInputs.count()
    expect(count).toBeGreaterThan(0)
    
    // Upload to first available input
    const firstInput = fileInputs.first()
    const fileContent = Buffer.from('fake photo')
    await firstInput.setInputFiles({
      name: 'staff-photo.jpg',
      mimeType: 'image/jpeg',
      buffer: fileContent
    })
    
    // Verify upload started
    await expect(page.locator('text=Chargement').or(page.locator('[data-testid="upload-loading"]'))).toBeVisible({ timeout: 5000 })
  })
})
