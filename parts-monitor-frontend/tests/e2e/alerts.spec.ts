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

test.describe('알림 페이지', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 로그인
    await registerUser(page)
  })

  test('알림 페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    await page.goto('/alerts')

    // 알림 페이지 제목 확인
    await expect(page.locator('h1:has-text("알림")')).toBeVisible()
  })

  test('알림 페이지에서 네비게이션이 작동해야 함', async ({ page }) => {
    await page.goto('/alerts')

    // 알림 링크가 활성화되어야 함
    const alertsLink = page.locator('a:has-text("알림")')
    await expect(alertsLink).toHaveClass(/bg-blue-600|active/)
  })

  test('알림 페이지에서 대시보드로 이동할 수 있어야 함', async ({ page }) => {
    await page.goto('/alerts')

    // 대시보드로 이동
    await page.locator('a:has-text("대시보드")').click()
    await expect(page).toHaveURL('/dashboard')
  })

  test('알림 페이지에서 제품 페이지로 이동할 수 있어야 함', async ({ page }) => {
    await page.goto('/alerts')

    // 제품 페이지로 이동
    await page.locator('a:has-text("제품")').click()
    await expect(page).toHaveURL('/products')
  })

  test('모바일 뷰에서 알림 페이지가 정상적으로 표시되어야 함', async ({ page }) => {
    // 모바일 뷰포트로 설정
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/alerts')

    // 알림 페이지 제목 확인
    await expect(page.locator('h1:has-text("알림")')).toBeVisible()
  })

  test('알림 목록이 반응형으로 표시되어야 함', async ({ page }) => {
    await page.goto('/alerts')

    // 페이지 콘텐츠가 보여야 함
    const content = page.locator('main')
    await expect(content).toBeVisible()
  })

  test('로그인하지 않으면 알림 페이지에 접근할 수 없어야 함', async ({ page }) => {
    // 로컬스토리지에서 토큰 제거
    await page.evaluate(() => {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
    })

    // 알림 페이지로 이동 시도
    await page.goto('/alerts')

    // 로그인 페이지로 리다이렉트 확인
    await expect(page).toHaveURL('/auth/login')
  })
})
