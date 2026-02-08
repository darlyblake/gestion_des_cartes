import { test, expect } from '@playwright/test'

test('eleves page renders list', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/eleves`)
  await expect(page.locator('h1, h2, h3')).toContainText(/élève|élèves|Liste/i)
})
