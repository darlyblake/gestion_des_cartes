import { test, expect } from '@playwright/test'

test('homepage loads', async ({ page, baseURL }) => {
  await page.goto(baseURL || '/')
  await expect(page).toHaveTitle(/Cartes Scolaires/i)
})
