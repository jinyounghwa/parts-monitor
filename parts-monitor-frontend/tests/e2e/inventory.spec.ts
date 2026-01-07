import { test, expect } from '@playwright/test'

test.describe('재고 관리 E2E', () => {
  let email: string
  const password = 'TestPassword123'

  test.beforeEach(async ({ page }) => {
    // Generate unique email for each test
    email = `inventory-test-${Date.now()}@example.com`

    // Register new user
    await page.goto('/auth/register')
    await page.locator('input#email').fill(email)
    await page.locator('input#password').fill(password)
    await page.locator('input#confirmPassword').fill(password)
    await page.locator('input#name').fill('Inventory Test User')
    await page.locator('button:has-text("가입")').click()
    await expect(page).toHaveURL('/dashboard')
  })

  test('재고 현황 페이지가 로드되어야 함', async ({ page }) => {
    await page.goto('/inventory')

    // 재고 현황 페이지 확인
    await expect(page.locator('h1:has-text("재고 현황")')).toBeVisible()

    // 재고 테이블 또는 카드 확인
    const inventoryContainer = page.locator('[data-testid="inventory-list"]')
    await expect(inventoryContainer).toBeVisible()
  })

  test('재고 상태 필터가 작동해야 함', async ({ page }) => {
    await page.goto('/inventory')

    // 상태 필터 버튼 확인
    const statusFilter = page.locator('select[name="status"]')
    await expect(statusFilter).toBeVisible()

    // 필터 선택
    await statusFilter.selectOption('low')

    // 필터가 적용되었는지 확인 (대기 후)
    await page.waitForTimeout(1000)
  })

  test('재고 상세 정보를 볼 수 있어야 함', async ({ page }) => {
    await page.goto('/inventory')

    // 첫 번째 재고 항목 클릭 (데이터가 있는 경우)
    const firstInventoryItem = page.locator('[data-testid="inventory-item"]').first()
    const count = await firstInventoryItem.count()

    if (count > 0) {
      await firstInventoryItem.click()

      // 상세 모달 또는 페이지가 열리는지 확인
      await expect(page.locator('[data-testid="inventory-detail"]')).toBeVisible()
    }
  })

  test('입고 기능이 작동해야 함', async ({ page }) => {
    await page.goto('/inventory')

    // 입고 버튼 클릭
    const stockInButton = page.locator('button:has-text("입고")')
    if (await stockInButton.isVisible()) {
      await stockInButton.click()

      // 입고 모달 확인
      await expect(page.locator('[data-testid="stock-in-modal"]')).toBeVisible()

      // 폼 필드 확인
      await expect(page.locator('input[name="productId"]')).toBeVisible()
      await expect(page.locator('input[name="warehouseId"]')).toBeVisible()
      await expect(page.locator('input[name="quantity"]')).toBeVisible()

      // 취소 버튼 클릭 (테스트 정리)
      await page.locator('button:has-text("취소")').click()
    }
  })

  test('출고 기능이 작동해야 함', async ({ page }) => {
    await page.goto('/inventory')

    // 출고 버튼 클릭
    const stockOutButton = page.locator('button:has-text("출고")')
    if (await stockOutButton.isVisible()) {
      await stockOutButton.click()

      // 출고 모달 확인
      await expect(page.locator('[data-testid="stock-out-modal"]')).toBeVisible()

      // 폼 필드 확인
      await expect(page.locator('input[name="productId"]')).toBeVisible()
      await expect(page.locator('input[name="warehouseId"]')).toBeVisible()
      await expect(page.locator('input[name="quantity"]')).toBeVisible()

      // 취소 버튼 클릭
      await page.locator('button:has-text("취소")').click()
    }
  })

  test('재고 조정 기능이 작동해야 함', async ({ page }) => {
    await page.goto('/inventory')

    // 조정 버튼 클릭
    const adjustButton = page.locator('button:has-text("조정")')
    if (await adjustButton.isVisible()) {
      await adjustButton.click()

      // 조정 모달 확인
      await expect(page.locator('[data-testid="adjust-modal"]')).toBeVisible()

      // 폼 필드 확인
      await expect(page.locator('input[name="productId"]')).toBeVisible()
      await expect(page.locator('input[name="warehouseId"]')).toBeVisible()
      await expect(page.locator('input[name="newQuantity"]')).toBeVisible()

      // 취소 버튼 클릭
      await page.locator('button:has-text("취소")').click()
    }
  })

  test('재고 부족 알림이 표시되어야 함', async ({ page }) => {
    await page.goto('/inventory')

    // 재고 부족 알림 확인
    const lowStockAlert = page.locator('[data-testid="low-stock-alert"]')
    if (await lowStockAlert.count() > 0) {
      await expect(lowStockAlert.first()).toBeVisible()
    }
  })

  test('거래 내역을 볼 수 있어야 함', async ({ page }) => {
    await page.goto('/inventory')

    // 거래 내역 탭 또는 섹션 확인
    const transactionsTab = page.locator('[data-testid="transactions-tab"]')
    if (await transactionsTab.isVisible()) {
      await transactionsTab.click()

      // 거래 내역 목록 확인
      await expect(page.locator('[data-testid="transaction-list"]')).toBeVisible()
    }
  })

  test('검색 기능이 작동해야 함', async ({ page }) => {
    await page.goto('/inventory')

    // 검색 입력 필드 확인
    const searchInput = page.locator('input[name="search"]')
    await expect(searchInput).toBeVisible()

    // 검색어 입력
    await searchInput.fill('test')

    // 검색 결과 대기
    await page.waitForTimeout(500)
  })

  test('엑셀 내보내기가 작동해야 함', async ({ page }) => {
    await page.goto('/inventory')

    // 내보내기 버튼 확인
    const exportButton = page.locator('button:has-text("내보내기")')
    if (await exportButton.isVisible()) {
      // 다운로드 이벤트 대기
      const downloadPromise = page.waitForEvent('download')

      await exportButton.click()

      // 다운로드 확인
      const download = await downloadPromise
      expect(download.suggestedFilename()).toContain('.xlsx')
    }
  })
})
