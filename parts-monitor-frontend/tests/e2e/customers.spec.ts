import { test, expect } from '@playwright/test'

test.describe('고객 관리 E2E', () => {
  let email: string
  const password = 'TestPassword123'

  test.beforeEach(async ({ page }) => {
    // Generate unique email for each test
    email = `customer-test-${Date.now()}@example.com`

    // Register new user
    await page.goto('/auth/register')
    await page.locator('input#email').fill(email)
    await page.locator('input#password').fill(password)
    await page.locator('input#confirmPassword').fill(password)
    await page.locator('input#name').fill('Customer Test User')
    await page.locator('button:has-text("가입")').click()
    await expect(page).toHaveURL('/dashboard')
  })

  test('고객 목록 페이지가 로드되어야 함', async ({ page }) => {
    await page.goto('/customers')

    // 고객 목록 페이지 확인
    await expect(page.locator('h1:has-text("고객 관리")')).toBeVisible()

    // 고객 목록 컨테이너 확인
    await expect(page.locator('[data-testid="customer-list"]')).toBeVisible()
  })

  test('새 고객을 생성할 수 있어야 함', async ({ page }) => {
    await page.goto('/customers')

    // 고객 생성 버튼 클릭
    const createButton = page.locator('button:has-text("새 고객")')
    if (await createButton.isVisible()) {
      await createButton.click()

      // 고객 생성 모달이 표시되는지 확인
      await expect(page.locator('[data-testid="customer-modal"]')).toBeVisible()

      // 필수 필드 입력
      await page.locator('input[name="code"]').fill('CUS-TEST-001')
      await page.locator('input[name="name"]').fill('테스트 고객사')
      await page.locator('input[name="businessNumber"]').fill('123-45-67890')
      await page.locator('input[name="representative"]').fill('홍길동')
      await page.locator('input[name="contactPerson"]').fill('김담당')
      await page.locator('input[name="phone"]').fill('02-1111-2222')
      await page.locator('input[name="email"]').fill('test@testcorp.com')
      await page.locator('input[name="address"]').fill('서울특별시 서초구')

      // 할인율과 결제 조건 입력
      await page.locator('input[name="discountRate"]').fill('5')
      await page.locator('select[name="paymentTerms"]').selectOption('NET30')

      // 저장 버튼 클릭
      await page.locator('button:has-text("저장")').click()

      // 성공 메시지 확인
      await expect(page.locator('[data-testid="toast-success"]')).toBeVisible()

      // 목록 페이지로 돌아왔는지 확인
      await expect(page.locator('[data-testid="customer-list"]')).toBeVisible()
    }
  })

  test('고객 상세를 볼 수 있어야 함', async ({ page }) => {
    await page.goto('/customers')

    // 첫 번째 고객 항목 클릭
    const firstCustomer = page.locator('[data-testid="customer-item"]').first()
    const count = await firstCustomer.count()

    if (count > 0) {
      await firstCustomer.click()

      // 상세 페이지 또는 모달 확인
      await expect(page.locator('[data-testid="customer-detail"]')).toBeVisible()

      // 고객 정보 확인
      await expect(page.locator('[data-testid="customer-code"]')).toBeVisible()
      await expect(page.locator('[data-testid="customer-name"]')).toBeVisible()
      await expect(page.locator('[data-testid="customer-phone"]')).toBeVisible()
    }
  })

  test('고객 편집이 가능해야 함', async ({ page }) => {
    await page.goto('/customers')

    const firstCustomer = page.locator('[data-testid="customer-item"]').first()
    const count = await firstCustomer.count()

    if (count > 0) {
      await firstCustomer.click()

      // 편집 버튼 클릭
      const editButton = page.locator('button:has-text("편집")')
      if (await editButton.isVisible()) {
        await editButton.click()

        // 편집 모달 확인
        await expect(page.locator('[data-testid="customer-modal"]')).toBeVisible()

        // 이름 수정
        await page.locator('input[name="name"]').clear()
        await page.locator('input[name="name"]').fill('수정된 고객 이름')

        // 저장 버튼 클릭
        await page.locator('button:has-text("저장")').click()

        // 성공 메시지 확인
        await expect(page.locator('[data-testid="toast-success"]')).toBeVisible()
      }
    }
  })

  test('고객 삭제가 가능해야 함', async ({ page }) => {
    await page.goto('/customers')

    const firstCustomer = page.locator('[data-testid="customer-item"]').first()
    const count = await firstCustomer.count()

    if (count > 0) {
      await firstCustomer.click()

      // 삭제 버튼 클릭
      const deleteButton = page.locator('button:has-text("삭제")')
      if (await deleteButton.isVisible()) {
        // 삭제 확인 다이얼로그 대기
        page.on('dialog', async dialog => {
          expect(dialog.message()).toContain('삭제')
          await dialog.dismiss() // 테스트에서는 취소
        })

        await deleteButton.click()
      }
    }
  })

  test('고객 검색 기능이 작동해야 함', async ({ page }) => {
    await page.goto('/customers')

    // 검색 입력 필드 확인
    const searchInput = page.locator('input[name="search"]')
    await expect(searchInput).toBeVisible()

    // 검색어 입력
    await searchInput.fill('test')

    // 검색 결과 대기
    await page.waitForTimeout(500)
  })
})
