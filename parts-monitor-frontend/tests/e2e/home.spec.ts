import { test, expect } from '@playwright/test'

test.describe('홈 페이지', () => {
  test('홈 페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    await page.goto('/')

    // 페이지 제목 확인
    await expect(page).toHaveTitle('Parts Monitor - Electronic Parts Price Tracking')

    // 히어로 섹션 확인
    await expect(page.locator('h1')).toContainText('전자 부품 가격을')
    await expect(page.locator('h1')).toContainText('실시간으로 모니터링하세요')

    // 로그인/회원가입 버튼 확인
    const loginButton = page.locator('a:has-text("로그인")').first()
    const registerButton = page.locator('a:has-text("회원가입")').first()

    await expect(loginButton).toBeVisible()
    await expect(registerButton).toBeVisible()
  })

  test('주요 기능 섹션이 표시되어야 함', async ({ page }) => {
    await page.goto('/')

    // 주요 기능 제목 확인
    await expect(page.locator('h2:has-text("강력한 기능들")')).toBeVisible()

    // 6개의 기능 카드가 존재해야 함
    const featureCards = page.locator('[class*="shadow-md"]')
    const count = await featureCards.count()
    expect(count).toBeGreaterThanOrEqual(6)

    // 각 기능 제목 확인
    await expect(page.locator('h3:has-text("가격 추적")')).toBeVisible()
    await expect(page.locator('h3:has-text("실시간 알림")')).toBeVisible()
    await expect(page.locator('h3:has-text("분석 대시보드")')).toBeVisible()
  })

  test('장점 섹션이 표시되어야 함', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('h2:has-text("왜 Parts Monitor를 선택할까요?")')).toBeVisible()

    // 4가지 장점 확인
    await expect(page.locator('h3:has-text("완전히 무료입니다")')).toBeVisible()
    await expect(page.locator('h3:has-text("실시간 업데이트")')).toBeVisible()
    await expect(page.locator('h3:has-text("맞춤형 알림")')).toBeVisible()
    await expect(page.locator('h3:has-text("사용하기 쉬움")')).toBeVisible()
  })

  test('회원가입 버튼이 회원가입 페이지로 이동해야 함', async ({ page }) => {
    await page.goto('/')

    const registerButton = page.locator('a:has-text("지금 시작하기")').first()
    await registerButton.click()

    // 회원가입 페이지로 이동 확인
    await expect(page).toHaveURL('/auth/register')
  })

  test('로그인 버튼이 로그인 페이지로 이동해야 함', async ({ page }) => {
    await page.goto('/')

    const loginButton = page.locator('a:has-text("로그인")').first()
    await loginButton.click()

    // 로그인 페이지로 이동 확인
    await expect(page).toHaveURL('/auth/login')
  })

  test('반응형 디자인 - 모바일 네비게이션이 보여야 함', async ({ page }) => {
    // 모바일 뷰포트로 설정
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/')

    // 모바일 헤더가 보여야 함
    const header = page.locator('nav').first()
    await expect(header).toBeVisible()

    // 로그인 버튼은 헤더에 보여야 함
    const loginButton = page.locator('a:has-text("로그인")').first()
    await expect(loginButton).toBeVisible()
  })

  test('푸터가 표시되어야 함', async ({ page }) => {
    await page.goto('/')

    // 푸터 확인
    const footer = page.locator('footer')
    await expect(footer).toContainText('Parts Monitor')
  })
})
