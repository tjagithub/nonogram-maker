import { expect, test } from '@playwright/test'

test('shows the app title', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toContainText('Nonogram Maker')
})

test('shows welcome message when no puzzle is loaded', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Welcome to Nonogram Maker!')).toBeVisible()
})
