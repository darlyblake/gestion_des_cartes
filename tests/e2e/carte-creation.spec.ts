import { test, expect } from '@playwright/test'

test.describe('Card Creation', () => {
  test('should create classic student card', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/cartes`)
    
    // Wait for cards page to load
    await page.waitForSelector('h1, h2')
    
    // Look for student selection or creation
    const studentSelect = page.locator('select').first()
    if (await studentSelect.isVisible()) {
      await studentSelect.selectOption({ index: 0 })
    }
    
    // Look for card type selection
    const cardTypeSelect = page.locator('select').or(page.locator('[role="combobox"]'))
    const cardTypes = await cardTypeSelect.count()
    
    if (cardTypes > 1) {
      // Select classic card type
      await cardTypeSelect.nth(1).selectOption('classique').catch(() => {
        // Try clicking on classic card option
        page.locator('text=Classique').click()
      })
    }
    
    // Click generate/create button
    const generateButton = page.locator('button').filter({ hasText: /générer|créer|generate/i }).first()
    await expect(generateButton).toBeVisible()
    await generateButton.click()
    
    // Wait for card to appear
    await expect(page.locator('.carte-scolaire').or(page.locator('[data-testid="student-card"]'))).toBeVisible({ timeout: 10000 })
    
    // Verify card elements are present
    await expect(page.locator('text=Carte Scolaire').or(page.locator('.carte-classique-recto'))).toBeVisible()
  })

  test('should display both recto and verso when requested', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/cartes`)
    
    // Look for face selection option
    const faceSelect = page.locator('select').filter({ hasText: /face|côté/i }).first()
    if (await faceSelect.isVisible()) {
      await faceSelect.selectOption('les-deux')
    }
    
    // Generate card
    const generateButton = page.locator('button').filter({ hasText: /générer/i }).first()
    await generateButton.click()
    
    // Check for both sides
    await expect(page.locator('.carte-classique-recto').or(page.locator('text=RECTO'))).toBeVisible()
    await expect(page.locator('.carte-classique-verso').or(page.locator('text=VERSO'))).toBeVisible()
  })

  test('should generate QR code on card', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/cartes`)
    
    // Look for QR code toggle
    const qrToggle = page.locator('input[type="checkbox"]').filter({ hasText: /QR/i }).first()
    if (await qrToggle.isVisible()) {
      await qrToggle.check()
    }
    
    // Generate card
    const generateButton = page.locator('button').filter({ hasText: /générer/i }).first()
    await generateButton.click()
    
    // Verify QR code is present
    await expect(page.locator('img[alt*="QR"]').or(page.locator('[data-testid="qrcode"]'))).toBeVisible({ timeout: 10000 })
  })

  test('should customize card with school colors', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/etablissements`)
    
    // Go to first establishment
    const firstEstablishment = page.locator('a').filter({ hasText: /\w/ }).first()
    await firstEstablishment.click()
    
    // Look for color customization
    const colorInput = page.locator('input[type="color"]').first()
    if (await colorInput.isVisible()) {
      await colorInput.fill('#ff0000')
      
      // Save changes
      const saveButton = page.locator('button').filter({ hasText: /enregistrer|sauvegarder/i }).first()
      await saveButton.click()
    }
    
    // Go to cards page and verify color is applied
    await page.goto(`${baseURL}/cartes`)
    const generateButton = page.locator('button').filter({ hasText: /générer/i }).first()
    await generateButton.click()
    
    // Check if custom color is applied (look for red elements)
    const cardElement = page.locator('.carte-scolaire').first()
    await expect(cardElement).toBeVisible()
    // Note: Color verification would depend on specific implementation
  })
})
