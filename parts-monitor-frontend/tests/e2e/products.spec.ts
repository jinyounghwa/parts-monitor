import { test, expect } from '@playwright/test'

const generateEmail = () => `test-${Date.now()}@example.com`

const registerUser = async (page: any) => {
  const email = generateEmail()
  const password = 'TestPassword123'
  const name = 'Test User'

  await page.goto('/auth/register')
  await page.locator('input#email').fill(email)
  await page.locator('input#password').fill(password)
  await page.locator('input#confirmPassword').fill(password)
  await page.locator('input#name').fill(name)
  await page.locator('button:has-text("가입")').click()
  await expect(page).toHaveURL('/dashboard', { timeout: 5000 })

  return { email, password, name }
}

test.describe('제품 페이지', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 로그인
    await registerUser(page)
  })

  test('제품 페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    await page.goto('/products')

    // 제품 페이지 제목 확인
    await expect(page.locator('h1:has-text("제품")')).toBeVisible()
  })

  test('제품 페이지에서 네비게이션이 작동해야 함', async ({ page }) => {
    await page.goto('/products')

    // 제품 링크가 활성화되어야 함
    const productsLink = page.locator('a:has-text("제품")')
    await expect(productsLink).toHaveClass(/bg-blue-600|active/)
  })

  test('제품 페이지에서 다른 페이지로 이동할 수 있어야 함', async ({ page }) => {
    await page.goto('/products')

    // 대시보드로 이동
    await page.locator('a:has-text("대시보드")').click()
    await expect(page).toHaveURL('/dashboard')

    // 다시 제품 페이지로 이동
    await page.locator('a:has-text("제품")').click()
    await expect(page).toHaveURL('/products')
  })

  test('모바일 뷰에서 제품 페이지가 정상적으로 표시되어야 함', async ({ page }) => {
    // 모바일 뷰포트로 설정
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/products')

    // 제품 페이지 제목 확인
    await expect(page.locator('h1:has-text("제품")')).toBeVisible()
  })

  test('제품 테이블이 반응형으로 표시되어야 함', async ({ page }) => {
    await page.goto('/products')

    // 테이블이나 리스트가 보여야 함
    const content = page.locator('main')
    await expect(content).toBeVisible()
  })
})
