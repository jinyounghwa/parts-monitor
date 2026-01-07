import { test, expect } from '@playwright/test'

const generateEmail = () => `e2e-lifecycle-${Date.now()}@example.com`

test.describe('Product Lifecycle (CRUD)', () => {
  let userEmail: string

  test.beforeEach(async ({ page }) => {
    // 1. Register a new user for a clean session
    userEmail = generateEmail()
    const password = 'Password123!'
    const name = 'Lifecycle User'

    await page.goto('/auth/register')
    await page.fill('input#email', userEmail)
    await page.fill('input#password', password)
    await page.fill('input#confirmPassword', password)
    await page.fill('input#name', name)
    await page.click('button[type="submit"]')
    
    // Wait for redirection to dashboard to confirm login
    await expect(page).toHaveURL('/dashboard')
  })

  test('should create, view, edit, and delete a product', async ({ page }) => {
    // --- CREATE ---
    await page.goto('/products')
    await page.click('text=제품 추가')
    await expect(page).toHaveURL('/products/new')

    const testPartNumber = `PART-${Date.now()}`
    const testManufacturer = 'Test Corp'
    const testDescription = 'This is an E2E test product'
    const testSiteName = 'Test Site'
    const testSiteUrl = 'https://example.com/part'
    
    // Fill form
    await page.fill('input[name="partNumber"]', testPartNumber)
    await page.fill('input[name="manufacturer"]', testManufacturer)
    await page.fill('input[name="description"]', testDescription)
    
    // Fill Target Site (assuming first one is empty by default or cleared)
    // Based on the code, it has one empty site by default.
    // We need to target the inputs within the targetSites map.
    // Since there are no unique IDs, we use placeholder or layout order.
    await page.fill('input[placeholder="예: Digikey"]', testSiteName)
    await page.fill('input[placeholder="https://..."]', testSiteUrl)

    // Adjust thresholds
    await page.fill('input[name="threshold.priceChangePercent"]', '10')
    await page.fill('input[name="threshold.stockMin"]', '5')

    await page.click('button:has-text("저장")')

    // --- READ (List) ---
    await expect(page).toHaveURL('/products')
    // Wait for the card to appear
    await expect(page.locator(`text=${testPartNumber}`)).toBeVisible()
    await expect(page.locator(`text=${testManufacturer}`)).toBeVisible()

    // --- READ (Detail) ---
    // Click on the product card to go to detail
    await page.click(`text=${testPartNumber}`)
    // URL should be /products/[id]
    await expect(page).toHaveURL(/\/products\/.+/)
    
    // Verify details
    await expect(page.locator('h1, h2, h3, dd').filter({ hasText: testPartNumber }).first()).toBeVisible()
    await expect(page.locator('dd').filter({ hasText: testManufacturer }).first()).toBeVisible()
    await expect(page.locator('dd').filter({ hasText: '10%' }).first()).toBeVisible() // Price alert

    // --- UPDATE ---
    await page.click('button:has-text("편집")')
    await expect(page).toHaveURL(/\/products\/.+\/edit/)

    const newDescription = 'Updated Description'
    await page.fill('input[name="description"]', newDescription)
    await page.fill('input[name="threshold.priceChangePercent"]', '15')
    
    await page.click('button:has-text("수정 완료")')
    
    // Verify update on detail page
    await expect(page).toHaveURL(/\/products\/.+/)
    await expect(page.locator('text=Updated Description')).toBeVisible()
    await expect(page.locator('text=15%')).toBeVisible()

    // --- DELETE ---
    // Handle confirm dialog
    page.on('dialog', dialog => dialog.accept())
    await page.click('button:has-text("삭제")')
    
    await expect(page).toHaveURL('/products')
    // Verify it's gone
    await expect(page.locator(`text=${testPartNumber}`)).not.toBeVisible()
  })
})
