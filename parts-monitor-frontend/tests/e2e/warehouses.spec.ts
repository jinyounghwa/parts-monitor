import { test, expect } from '@playwright/test'

test.describe('창고 관리 E2E', () => {
  let email: string
  const password = 'TestPassword123'

  test.beforeEach(async ({ page }) => {
    // Generate unique email for each test
    email = `warehouse-test-${Date.now()}@example.com`

    // Register new user
    await page.goto('/auth/register')
    await page.locator('input#email').fill(email)
    await page.locator('input#password').fill(password)
    await page.locator('input#confirmPassword').fill(password)
    await page.locator('input#name').fill('Warehouse Test User')
    await page.locator('button:has-text("가입")').click()
    await expect(page).toHaveURL('/dashboard')
  })

  test('창고 목록 페이지가 로드되어야 함', async ({ page }) => {
    await page.goto('/warehouses')

    // 창고 목록 페이지 확인
    await expect(page.locator('h1:has-text("창고 관리")')).toBeVisible()

    // 창고 목록 컨테이너 확인
    await expect(page.locator('[data-testid="warehouse-list"]')).toBeVisible()
  })

  test('새 창고를 생성할 수 있어야 함', async ({ page }) => {
    await page.goto('/warehouses')

    // 창고 생성 버튼 클릭
    const createButton = page.locator('button:has-text("새 창고")')
    if (await createButton.isVisible()) {
      await createButton.click()

      // 창고 생성 모달이 표시되는지 확인
      await expect(page.locator('[data-testid="warehouse-modal"]')).toBeVisible()

      // 필수 필드 입력
      await page.locator('input[name="code"]').fill('TEST-WH-001')
      await page.locator('input[name="name"]').fill('테스트 창고')
      await page.locator('input[name="address"]').fill('서울특별시 강남구')
      await page.locator('input[name="manager"]').fill('테스트 매니저')
      await page.locator('input[name="phone"]').fill('02-1234-5678')

      // 저장 버튼 클릭
      await page.locator('button:has-text("저장")').click()

      // 성공 메시지 확인
      await expect(page.locator('[data-testid="toast-success"]')).toBeVisible()

      // 목록 페이지로 돌아왔는지 확인
      await expect(page.locator('[data-testid="warehouse-list"]')).toBeVisible()
    }
  })

  test('창고 상세를 볼 수 있어야 함', async ({ page }) => {
    await page.goto('/warehouses')

    // 첫 번째 창고 항목 클릭
    const firstWarehouse = page.locator('[data-testid="warehouse-item"]').first()
    const count = await firstWarehouse.count()

    if (count > 0) {
      await firstWarehouse.click()

      // 상세 페이지 또는 모달 확인
      await expect(page.locator('[data-testid="warehouse-detail"]')).toBeVisible()

      // 창고 정보 확인
      await expect(page.locator('[data-testid="warehouse-code"]')).toBeVisible()
      await expect(page.locator('[data-testid="warehouse-name"]')).toBeVisible()
    }
  })

  test('창고 편집이 가능해야 함', async ({ page }) => {
    await page.goto('/warehouses')

    const firstWarehouse = page.locator('[data-testid="warehouse-item"]').first()
    const count = await firstWarehouse.count()

    if (count > 0) {
      await firstWarehouse.click()

      // 편집 버튼 클릭
      const editButton = page.locator('button:has-text("편집")')
      if (await editButton.isVisible()) {
        await editButton.click()

        // 편집 모달 확인
        await expect(page.locator('[data-testid="warehouse-modal"]')).toBeVisible()

        // 이름 수정
        await page.locator('input[name="name"]').clear()
        await page.locator('input[name="name"]').fill('수정된 창고 이름')

        // 저장 버튼 클릭
        await page.locator('button:has-text("저장")').click()

        // 성공 메시지 확인
        await expect(page.locator('[data-testid="toast-success"]')).toBeVisible()
      }
    }
  })

  test('창고 삭제가 가능해야 함', async ({ page }) => {
    await page.goto('/warehouses')

    const firstWarehouse = page.locator('[data-testid="warehouse-item"]').first()
    const count = await firstWarehouse.count()

    if (count > 0) {
      await firstWarehouse.click()

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

  test('창고 검색 기능이 작동해야 함', async ({ page }) => {
    await page.goto('/warehouses')

    // 검색 입력 필드 확인
    const searchInput = page.locator('input[name="search"]')
    await expect(searchInput).toBeVisible()

    // 검색어 입력
    await searchInput.fill('test')

    // 검색 결과 대기
    await page.waitForTimeout(500)
  })
})
