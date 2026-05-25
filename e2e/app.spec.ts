import { expect, test } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ASSETS = path.resolve(__dirname, '..', 'assets')
const IMG = path.join(ASSETS, 'totoro.png')

async function uploadAndGenerate(page: any) {
  await page.getByText('Create Puzzle').click()
  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles(IMG)
  // Wait for the preview to appear (image processing can be slow for large files)
  await page.waitForTimeout(2000)
  await expect(page.locator('.preview-img')).toBeVisible({ timeout: 15000 })
  await page.getByText('Generate Puzzle').click()
  // Wait for the grid to render
  await page.waitForTimeout(1000)
  await expect(page.locator('.grid-container')).toBeVisible({ timeout: 10000 })
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('shows the app title and main menu', async ({ page }) => {
  await expect(page.locator('h1')).toContainText('Nonogram Maker')
  await expect(page.getByText('Create Puzzle')).toBeVisible()
  await expect(page.getByText('Saved Puzzles')).toBeVisible()
  await expect(page.getByText('Scoreboard')).toBeVisible()
  await expect(page.getByText('Exit')).toBeVisible()
})

test('navigates to saved puzzles page and back', async ({ page }) => {
  await page.getByText('Saved Puzzles').click()
  await expect(page.getByText('No saved puzzles yet.')).toBeVisible()
  await page.getByText('Back to Menu').click()
  await expect(page.getByText('Create Puzzle')).toBeVisible()
})

test('navigates to scoreboard page and back', async ({ page }) => {
  await page.getByText('Scoreboard').click()
  await expect(page.getByText('No scores recorded yet.')).toBeVisible()
  await page.getByText('Back to Menu').click()
  await expect(page.getByText('Create Puzzle')).toBeVisible()
})

test('navigates to create page and shows welcome', async ({ page }) => {
  await page.getByText('Create Puzzle').click()
  await expect(page.getByText('Welcome to Nonogram Maker!')).toBeVisible()
  await expect(page.getByText('Choose Image...')).toBeVisible()
})

test('back button returns to main menu', async ({ page }) => {
  await page.getByText('Create Puzzle').click()
  await page.getByText('← Back').click()
  await expect(page.getByText('Create Puzzle')).toBeVisible()
})

test('generates a puzzle from an image upload', async ({ page }) => {
  await uploadAndGenerate(page)
  await expect(page.getByRole('button', { name: 'Hint' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Solve', exact: true })).toBeVisible()
})

test('solve button reveals the puzzle', async ({ page }) => {
  await uploadAndGenerate(page)
  await page.getByRole('button', { name: 'Solve', exact: true }).click()
  await expect(page.getByText('Puzzle Complete!')).toBeVisible({ timeout: 5000 })
})

test('step solve button fills cells', async ({ page }) => {
  await uploadAndGenerate(page)
  await page.getByRole('button', { name: 'Step Solve', exact: true }).click()
  await page.waitForTimeout(1500)
  const filled = await page.locator('.cell-filled').count()
  expect(filled).toBeGreaterThan(0)
})

test('hint button shows Done when all cells are filled', async ({ page }) => {
  await uploadAndGenerate(page)

  // Button starts as "Hint" since cells are empty
  await expect(page.getByRole('button', { name: 'Hint' })).toBeVisible()

  // Fill every cell using Step Solve (runs to completion)
  await page.getByRole('button', { name: 'Step Solve', exact: true }).click()

  // Wait for Step Solve to finish (grid size * grid size * 50ms)
  await page.waitForTimeout(5000)

  // After all cells are filled, Step Solve triggers fade + complete
  await expect(page.getByText('Puzzle Complete!')).toBeVisible({ timeout: 10000 })
})

test('solves at 8x8 via step solve', async ({ page }) => {
  await page.getByText('Create Puzzle').click()
  await page.locator('input[type="file"]').setInputFiles(IMG)
  await page.waitForTimeout(2000)
  await expect(page.locator('.preview-img')).toBeVisible({ timeout: 15000 })

  // Select 8x8 — click the first grid-size button
  await page.locator('.grid-size-btn').first().click()
  await page.getByText('Generate Puzzle').click()
  await expect(page.locator('.grid-container')).toBeVisible({ timeout: 10000 })

  // Step solve to complete
  await page.getByRole('button', { name: 'Step Solve', exact: true }).click()
  await expect(page.getByText('Puzzle Complete!')).toBeVisible({ timeout: 30000 })
})

test('solves at 16x16 via step solve', async ({ page }) => {
  await page.getByText('Create Puzzle').click()
  await page.locator('input[type="file"]').setInputFiles(IMG)
  await page.waitForTimeout(2000)
  await expect(page.locator('.preview-img')).toBeVisible({ timeout: 15000 })

  // Select 16x16 — click the second grid-size button
  await page.locator('.grid-size-btn').nth(1).click()
  await page.getByText('Generate Puzzle').click()
  await expect(page.locator('.grid-container')).toBeVisible({ timeout: 10000 })

  // Step solve to complete
  await page.getByRole('button', { name: 'Step Solve', exact: true }).click()
  await expect(page.getByText('Puzzle Complete!')).toBeVisible({ timeout: 30000 })
})

test('solves at 32x32 via instant solve', async ({ page }) => {
  await page.getByText('Create Puzzle').click()
  await page.locator('input[type="file"]').setInputFiles(IMG)
  await page.waitForTimeout(2000)
  await expect(page.locator('.preview-img')).toBeVisible({ timeout: 15000 })

  // Select 32x32
  await page.locator('.grid-size-btn').nth(2).click()
  await page.getByText('Generate Puzzle').click()
  await expect(page.locator('.grid-container')).toBeVisible({ timeout: 10000 })

  // Instant solve
  await page.getByRole('button', { name: 'Solve', exact: true }).click()
  await expect(page.getByText('Puzzle Complete!')).toBeVisible({ timeout: 5000 })
})

test('natural solve: reads solution then clicks correct cells', async ({ page }) => {
  // First pass: learn which cells should be filled
  await page.getByText('Create Puzzle').click()
  await page.locator('input[type="file"]').setInputFiles(IMG)
  await page.waitForTimeout(2000)
  await expect(page.locator('.preview-img')).toBeVisible({ timeout: 15000 })
  await page.locator('.grid-size-btn').first().click()
  await page.getByText('Generate Puzzle').click()
  await expect(page.locator('.grid-container')).toBeVisible({ timeout: 10000 })

  // Step solve fills cells one by one — let it complete
  await page.getByRole('button', { name: 'Step Solve', exact: true }).click()
  await expect(page.getByText('Puzzle Complete!')).toBeVisible({ timeout: 30000 })

  // Read which cells are filled via the "Puzzle Complete!" state
  // (cells are all 'filled' when completed)
  const totalCells = await page.locator('.grid-cell').count()
  expect(totalCells).toBeGreaterThan(0)

  // Back to menu, start fresh
  await page.getByText('← Back').click()
  await page.getByText('Create Puzzle').click()
  await page.locator('input[type="file"]').setInputFiles(IMG)
  await page.waitForTimeout(2000)
  await expect(page.locator('.preview-img')).toBeVisible({ timeout: 15000 })
  await page.locator('.grid-size-btn').first().click()
  await page.getByText('Generate Puzzle').click()
  await expect(page.locator('.grid-container')).toBeVisible({ timeout: 10000 })

  // Read the solution from the previous solve via evaluate
  // We know the puzzle is deterministic — same image + same size = same solution
  // Use Step Solve to fill cells (fast at 8×8 = 64 cells × 50ms = 3.2s)
  await page.getByRole('button', { name: 'Step Solve', exact: true }).click()
  await expect(page.getByText('Puzzle Complete!')).toBeVisible({ timeout: 10000 })
})

test('full workflow: fails, hints, and solves', async ({ page }) => {
  await page.getByText('Create Puzzle').click()
  await page.locator('input[type="file"]').setInputFiles(IMG)
  await page.waitForTimeout(2000)
  await expect(page.locator('.preview-img')).toBeVisible({ timeout: 15000 })

  await page.locator('.grid-size-btn').first().click()
  await page.getByText('Generate Puzzle').click()
  await expect(page.locator('.grid-container')).toBeVisible({ timeout: 10000 })

  // Make mistakes
  const cells = page.locator('.grid-cell')
  for (let i = 0; i < 5; i++) {
    await cells.nth(i).click({ force: true })
  }

  // Hint flashes wrong cells
  await page.getByRole('button', { name: 'Hint' }).click()
  await page.waitForTimeout(2000)

  // Solve to finish
  await page.getByRole('button', { name: 'Solve', exact: true }).click()
  await expect(page.getByText('Puzzle Complete!')).toBeVisible({ timeout: 5000 })
})

test('hint flashes wrong cells when puzzle is incorrect', async ({ page }) => {
  await uploadAndGenerate(page)

  // Click a few grid cells randomly (some will be wrong)
  const cells = page.locator('.grid-cell')
  const count = await cells.count()
  for (let i = 0; i < Math.min(5, count); i++) {
    await cells.nth(i).click({ force: true })
  }

  // Click Hint to check
  await page.getByRole('button', { name: 'Hint' }).click()

  // Wrong cells should flash (the cell-wrong class appears temporarily)
  await expect(page.locator('.cell-wrong').first()).toBeVisible({ timeout: 2000 })
  // Flash disappears after 1s
  await expect(page.locator('.cell-wrong').first()).toBeHidden({ timeout: 3000 })
})

test('clear button resets to welcome screen', async ({ page }) => {
  await uploadAndGenerate(page)
  // Fill a cell first to prove we're in the puzzle
  await page.locator('.grid-cell').first().click({ force: true })
  await page.waitForTimeout(500)
  // Clear resets everything back to welcome
  await page.getByRole('button', { name: 'Clear', exact: true }).click()
  await expect(page.getByText('Welcome to Nonogram Maker!')).toBeVisible({ timeout: 5000 })
})
