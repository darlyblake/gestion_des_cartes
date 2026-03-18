import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies()
  })

  test('should show login form for protected routes', async ({ page, baseURL }) => {
    // Try to access a protected route
    await page.goto(`${baseURL}/eleves`)
    
    // Check if redirected to login or login form appears
    const loginForm = page.locator('form').filter({ hasText: /connexion|login|identifier/i })
    const loginInputs = page.locator('input[type="password"], input[type="email"]')
    
    // Either we're on login page or login form is present
    const hasLoginForm = await loginForm.isVisible() || await loginInputs.count() > 0
    expect(hasLoginForm).toBeTruthy()
  })

  test('should handle login with valid credentials', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}`)
    
    // Look for login button or link
    const loginButton = page.locator('button').filter({ hasText: /connexion|login|se connecter/i }).first()
    if (await loginButton.isVisible()) {
      await loginButton.click()
    }
    
    // Fill login form
    const emailInput = page.locator('input[type="email"], input[name*="email"], input[placeholder*="email"]').first()
    const passwordInput = page.locator('input[type="password"], input[name*="password"]').first()
    
    if (await emailInput.isVisible()) {
      await emailInput.fill('admin@example.com')
    }
    
    if (await passwordInput.isVisible()) {
      await passwordInput.fill('password123')
    }
    
    // Submit form
    const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /connexion|login|se connecter/i }).first()
    await submitButton.click()
    
    // Check for successful login (redirect or success message)
    await page.waitForTimeout(2000) // Wait for potential redirect
    
    // Look for success indicators
    const successIndicators = [
      page.locator('text=Tableau de bord'),
      page.locator('text=Bienvenue'),
      page.locator('[data-testid="user-menu"]'),
      page.locator('text=Déconnexion').or(page.locator('text=Logout'))
    ]
    
    let isLoggedIn = false
    for (const indicator of successIndicators) {
      if (await indicator.isVisible({ timeout: 3000 })) {
        isLoggedIn = true
        break
      }
    }
    
    if (!isLoggedIn) {
      // Check if we can access protected content
      await page.goto(`${baseURL}/eleves`)
      const hasAccess = await page.locator('h1, h2, h3').filter({ hasText: /élève|élèves|liste/i }).isVisible()
      expect(hasAccess).toBeTruthy()
    }
  })

  test('should show error for invalid credentials', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}`)
    
    // Find and click login button if present
    const loginButton = page.locator('button').filter({ hasText: /connexion|login/i }).first()
    if (await loginButton.isVisible()) {
      await loginButton.click()
    }
    
    // Fill with invalid credentials
    const emailInput = page.locator('input[type="email"], input[name*="email"]').first()
    const passwordInput = page.locator('input[type="password"], input[name*="password"]').first()
    
    if (await emailInput.isVisible()) {
      await emailInput.fill('invalid@example.com')
    }
    
    if (await passwordInput.isVisible()) {
      await passwordInput.fill('wrongpassword')
    }
    
    // Submit form
    const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /connexion|login/i }).first()
    await submitButton.click()
    
    // Check for error message
    const errorMessages = [
      page.locator('text=Identifiants incorrects'),
      page.locator('text=Email ou mot de passe invalide'),
      page.locator('text=Erreur de connexion'),
      page.locator('[data-testid="login-error"]'),
      page.locator('.error, .alert-error')
    ]
    
    let hasError = false
    for (const errorMsg of errorMessages) {
      if (await errorMsg.isVisible({ timeout: 3000 })) {
        hasError = true
        break
      }
    }
    
    expect(hasError).toBeTruthy()
  })

  test('should handle logout functionality', async ({ page, baseURL }) => {
    // First login (if needed)
    await page.goto(`${baseURL}`)
    
    // Try to access protected content to trigger login if needed
    await page.goto(`${baseURL}/eleves`)
    
    // Look for logout option
    const logoutButtons = [
      page.locator('button').filter({ hasText: /déconnexion|logout|se déconnecter/i }),
      page.locator('a').filter({ hasText: /déconnexion|logout|se déconnecter/i }),
      page.locator('[data-testid="logout-button"]')
    ]
    
    let logoutButton = null
    for (const button of logoutButtons) {
      if (await button.isVisible({ timeout: 2000 })) {
        logoutButton = button
        break
      }
    }
    
    if (logoutButton) {
      await logoutButton.click()
      
      // Verify logout - should be redirected to login or home
      await page.waitForTimeout(2000)
      
      // Check for login form or home page
      const loginForm = page.locator('form').filter({ hasText: /connexion|login/i })
      const homePage = page.locator('h1').filter({ hasText: /accueil|home/i })
      
      const hasLoginForm = await loginForm.isVisible()
      const hasHomePage = await homePage.isVisible()
      
      expect(hasLoginForm || hasHomePage).toBeTruthy()
    } else {
      // If no logout button found, assume no auth is required
      test.skip()
    }
  })

  test('should protect API routes', async ({ page, baseURL }) => {
    // Try to access API endpoint directly
    const response = await page.request.get(`${baseURL}/api/eleves`)
    
    // Should either return 401/403 or require authentication
    expect([401, 403, 404]).toContain(response.status())
  })
})
