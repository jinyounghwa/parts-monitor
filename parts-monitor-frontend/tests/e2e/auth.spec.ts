import { test, expect } from '@playwright/test'

const generateEmail = () => `test-${Date.now()}@example.com`

// Helper (if used later, or for consistency)
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

test.describe('인증 플로우', () => {
  test('회원가입 페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    await page.goto('/auth/register')

    // 회원가입 폼 확인
    await expect(page.locator('input#email')).toBeVisible()
    await expect(page.locator('input#password')).toBeVisible()
    await expect(page.locator('input#confirmPassword')).toBeVisible()
    await expect(page.locator('input#name')).toBeVisible()
    await expect(page.locator('button:has-text("가입")')).toBeVisible()
  })

  test('새 사용자로 회원가입할 수 있어야 함', async ({ page }) => {
    const email = generateEmail()
    const password = 'TestPassword123'
    const name = 'Test User'

    await page.goto('/auth/register')

    // 폼 작성
    await page.locator('input#email').fill(email)
    await page.locator('input#password').fill(password)
    await page.locator('input#confirmPassword').fill(password)
    await page.locator('input#name').fill(name)

    // 가입 버튼 클릭
    await page.locator('button:has-text("가입")').click()

    // 대시보드로 리다이렉트되는지 확인
    await expect(page).toHaveURL('/dashboard', { timeout: 5000 })

    // 대시보드 텍스트 확인
    await expect(page.locator('h1:has-text("대시보드")')).toBeVisible()
  })

  test('로그인 페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    await page.goto('/auth/login')

    // 로그인 폼 확인
    await expect(page.locator('input#email')).toBeVisible()
    await expect(page.locator('input#password')).toBeVisible()
    await expect(page.locator('button:has-text("로그인")')).toBeVisible()
  })

  test('기존 사용자로 로그인할 수 있어야 함', async ({ page }) => {
    // 먼저 사용자를 생성
    const email = generateEmail()
    const password = 'TestPassword123'
    const name = 'Existing User'

    // 회원가입
    await page.goto('/auth/register')
    await page.locator('input#email').fill(email)
    await page.locator('input#password').fill(password)
    await page.locator('input#confirmPassword').fill(password)
    await page.locator('input#name').fill(name)
    await page.locator('button:has-text("가입")').click()

    await expect(page).toHaveURL('/dashboard')

    // 로그아웃
    const logoutButton = page.locator('button:has-text("로그아웃")')
    await logoutButton.click()

    // 로그인 페이지로 리다이렉트 확인
    await expect(page).toHaveURL('/auth/login')

    // 다시 로그인
    await page.goto('/auth/login')
    await page.locator('input#email').fill(email)
    await page.locator('input#password').fill(password)
    await page.locator('button:has-text("로그인")').click()

    // 대시보드로 리다이렉트 확인
    await expect(page).toHaveURL('/dashboard', { timeout: 5000 })
    await expect(page.locator('h1:has-text("대시보드")')).toBeVisible()
  })

  test('빈 이메일로는 가입할 수 없어야 함', async ({ page }) => {
    await page.goto('/auth/register')

    // 비어있는 이메일로 제출 시도
    await page.locator('input#password').fill('TestPassword123')
    await page.locator('input#confirmPassword').fill('TestPassword123')
    await page.locator('input#name').fill('Test User')
    await page.locator('button:has-text("가입")').click()

    // 여전히 가입 페이지에 있어야 함
    await expect(page).toHaveURL('/auth/register')
  })

  test('로그아웃이 정상적으로 작동해야 함', async ({ page }) => {
    const email = generateEmail()
    const password = 'TestPassword123'
    const name = 'Logout Test'

    // 회원가입
    await page.goto('/auth/register')
    await page.locator('input#email').fill(email)
    await page.locator('input#password').fill(password)
    await page.locator('input#confirmPassword').fill(password)
    await page.locator('input#name').fill(name)
    await page.locator('button:has-text("가입")').click()

    await expect(page).toHaveURL('/dashboard')

    // 로그아웃
    const logoutButton = page.locator('button:has-text("로그아웃")')
    await logoutButton.click()

    // 로그인 페이지로 리다이렉트 확인
    await expect(page).toHaveURL('/auth/login')
  })

  test('대시보드에 로그인한 사용자 정보가 표시되어야 함', async ({ page }) => {
    const email = generateEmail()
    const password = 'TestPassword123'
    const name = 'Info Display User'

    // 회원가입
    await page.goto('/auth/register')
    await page.locator('input#email').fill(email)
    await page.locator('input#password').fill(password)
    await page.locator('input#confirmPassword').fill(password)
    await page.locator('input#name').fill(name)
    await page.locator('button:has-text("가입")').click()

    await expect(page).toHaveURL('/dashboard')

    // 사용자 이름이 네비게이션에 표시되어야 함
    await expect(page.locator('text=' + name)).toBeVisible()
  })
})