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

test.describe('대시보드', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 새 사용자를 생성
    await registerUser(page)
  })

  test('대시보드 페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    // 대시보드 제목 확인
    await expect(page.locator('h1:has-text("대시보드")')).toBeVisible()

    // 통계 카드가 표시되어야 함
    const statCards = page.locator('[class*="gradient"]')
    const count = await statCards.count()
    expect(count).toBeGreaterThanOrEqual(4) // 최소 4개의 통계 카드
  })

  test('통계 정보가 표시되어야 함', async ({ page }) => {
    // 전체 제품 카드
    await expect(page.locator('h4, .text-sm:has-text("전체 제품")')).toBeVisible()

    // 가격 변동 카드
    await expect(page.locator('.text-sm:has-text("가격 변동")')).toBeVisible()

    // 재고 부족 카드
    await expect(page.locator('.text-sm:has-text("재고 부족")')).toBeVisible()

    // 마지막 스크래핑 카드
    await expect(page.locator('.text-sm:has-text("마지막 스크래핑")')).toBeVisible()
  })

  test('네비게이션 메뉴가 표시되어야 함', async ({ page }) => {
    // 대시보드 링크
    await expect(page.locator('a:has-text("대시보드")')).toBeVisible()

    // 제품 링크
    await expect(page.locator('a:has-text("제품")')).toBeVisible()

    // 알림 링크
    await expect(page.locator('a:has-text("알림")')).toBeVisible()

    // 홈 링크
    await expect(page.locator('button:has-text("홈")')).toBeVisible()
  })

  test('대시보드에서 홈으로 이동할 수 있어야 함', async ({ page }) => {
    // 홈 버튼 클릭
    const homeButton = page.locator('button:has-text("홈")')
    await homeButton.click()

    // 홈 페이지로 리다이렉트 확인
    await expect(page).toHaveURL('/')
  })

  test('대시보드에서 제품 페이지로 이동할 수 있어야 함', async ({ page }) => {
    // 제품 링크 클릭
    const productsLink = page.locator('a:has-text("제품")')
    await productsLink.click()

    // 제품 페이지로 이동 확인
    await expect(page).toHaveURL('/products')
  })

  test('대시보드에서 알림 페이지로 이동할 수 있어야 함', async ({ page }) => {
    // 알림 링크 클릭
    const alertsLink = page.locator('a:has-text("알림")')
    await alertsLink.click()

    // 알림 페이지로 이동 확인
    await expect(page).toHaveURL('/alerts')
  })

  test('로그인하지 않으면 대시보드에 접근할 수 없어야 함', async ({ page }) => {
    // 로컬스토리지에서 토큰 제거
    await page.evaluate(() => {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
    })

    // 대시보드로 이동 시도
    await page.goto('/dashboard')

    // 로그인 페이지로 리다이렉트 확인
    await expect(page).toHaveURL('/auth/login')
  })

  test('모바일 뷰에서 대시보드가 정상적으로 표시되어야 함', async ({ page }) => {
    // 모바일 뷰포트로 설정
    await page.setViewportSize({ width: 375, height: 667 })

    // 대시보드 제목 확인
    await expect(page.locator('h1:has-text("대시보드")')).toBeVisible()

    // 통계 카드가 그리드로 표시되어야 함
    const statCards = page.locator('[class*="grid"]')
    await expect(statCards.first()).toBeVisible()
  })

  test('모바일 뷰에서 메뉴 토글이 작동해야 함', async ({ page }) => {
    // 모바일 뷰포트로 설정
    await page.setViewportSize({ width: 375, height: 667 })

    // 모바일 메뉴 버튼 클릭
    const menuButton = page.locator('button[class*="text-white"]').filter({ hasText: /Menu|☰/ }).first()

    // 메뉴 토글 확인 (메뉴가 열리거나 닫혀야 함)
    if (await menuButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await menuButton.click()
      // 네비게이션이 보이거나 숨겨져야 함
      const nav = page.locator('nav, aside')
      await expect(nav.first()).toBeVisible()
    }
  })

  test('가격 알림 섹션이 표시되어야 함', async ({ page }) => {
    // 가격 알림 제목 확인
    const priceAlertsTitle = page.locator('.text-lg:has-text("가격 알림")')
    await expect(priceAlertsTitle).toBeVisible()
  })

  test('재고 알림 섹션이 표시되어야 함', async ({ page }) => {
    // 재고 알림 제목 확인
    const stockAlertsTitle = page.locator('.text-lg:has-text("재고 알림")')
    await expect(stockAlertsTitle).toBeVisible()
  })
})
