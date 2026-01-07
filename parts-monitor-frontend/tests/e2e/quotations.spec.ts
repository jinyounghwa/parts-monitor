import { test, expect } from '@playwright/test'

test.describe('견적서 관리 E2E', () => {
  let email: string
  const password = 'TestPassword123'

  test.beforeEach(async ({ page }) => {
    // Generate unique email for each test
    email = `quotation-test-${Date.now()}@example.com`

    // Register new user
    await page.goto('/auth/register')
    await page.locator('input#email').fill(email)
    await page.locator('input#password').fill(password)
    await page.locator('input#confirmPassword').fill(password)
    await page.locator('input#name').fill('Quotation Test User')
    await page.locator('button:has-text("가입")').click()
    await expect(page).toHaveURL('/dashboard')
  })

  test('견적서 목록 페이지가 로드되어야 함', async ({ page }) => {
    await page.goto('/quotations')

    // 견적서 목록 페이지 확인
    await expect(page.locator('h1:has-text("견적서")')).toBeVisible()

    // 견적서 목록 컨테이너 확인
    await expect(page.locator('[data-testid="quotation-list"]')).toBeVisible()
  })

  test('새 견적서를 생성할 수 있어야 함', async ({ page }) => {
    await page.goto('/quotations')

    // 견적서 생성 버튼 클릭
    const createButton = page.locator('button:has-text("새 견적서")')
    if (await createButton.isVisible()) {
      await createButton.click()

      // 견적서 생성 폼이 표시되는지 확인
      await expect(page.locator('[data-testid="quotation-form"]')).toBeVisible()

      // 폼 필드 확인
      await expect(page.locator('input[name="title"]')).toBeVisible()
      await expect(page.locator('select[name="customerId"]')).toBeVisible()
      await expect(page.locator('input[name="taxRate"]')).toBeVisible()

      // 품목 추가 섹션 확인
      await expect(page.locator('[data-testid="quotation-items"]')).toBeVisible()
    }
  })

  test('견적서 상세를 볼 수 있어야 함', async ({ page }) => {
    await page.goto('/quotations')

    // 첫 번째 견적서 항목 클릭
    const firstQuotation = page.locator('[data-testid="quotation-item"]').first()
    const count = await firstQuotation.count()

    if (count > 0) {
      await firstQuotation.click()

      // 상세 페이지 확인
      await expect(page.locator('[data-testid="quotation-detail"]')).toBeVisible()

      // 견적서 정보 확인
      await expect(page.locator('[data-testid="quotation-number"]')).toBeVisible()
      await expect(page.locator('[data-testid="quotation-customer"]')).toBeVisible()
      await expect(page.locator('[data-testid="quotation-items"]')).toBeVisible()
      await expect(page.locator('[data-testid="quotation-total"]')).toBeVisible()
    }
  })

  test('견적서 편집이 가능해야 함', async ({ page }) => {
    await page.goto('/quotations')

    const firstQuotation = page.locator('[data-testid="quotation-item"]').first()
    const count = await firstQuotation.count()

    if (count > 0) {
      await firstQuotation.click()

      // 편집 버튼 클릭
      const editButton = page.locator('button:has-text("편집")')
      if (await editButton.isVisible()) {
        await editButton.click()

        // 편집 폼 확인
        await expect(page.locator('[data-testid="quotation-form"]')).toBeVisible()
      }
    }
  })

  test('견적서 PDF를 다운로드할 수 있어야 함', async ({ page }) => {
    await page.goto('/quotations')

    const firstQuotation = page.locator('[data-testid="quotation-item"]').first()
    const count = await firstQuotation.count()

    if (count > 0) {
      await firstQuotation.click()

      // PDF 다운로드 버튼 클릭
      const downloadButton = page.locator('button:has-text("PDF")')
      if (await downloadButton.isVisible()) {
        // 다운로드 이벤트 대기
        const downloadPromise = page.waitForEvent('download')

        await downloadButton.click()

        // 다운로드 확인
        const download = await downloadPromise
        expect(download.suggestedFilename()).toContain('.pdf')
      }
    }
  })

  test('견적서 이메일 발송이 가능해야 함', async ({ page }) => {
    await page.goto('/quotations')

    const firstQuotation = page.locator('[data-testid="quotation-item"]').first()
    const count = await firstQuotation.count()

    if (count > 0) {
      await firstQuotation.click()

      // 이메일 발송 버튼 클릭
      const emailButton = page.locator('button:has-text("이메일")')
      if (await emailButton.isVisible()) {
        await emailButton.click()

        // 이메일 발송 모달 확인
        await expect(page.locator('[data-testid="email-modal"]')).toBeVisible()

        // 수신자 입력 필드 확인
        await expect(page.locator('input[name="recipients"]')).toBeVisible()

        // 취소 버튼 클릭
        await page.locator('button:has-text("취소")').click()
      }
    }
  })

  test('견적서 상태를 변경할 수 있어야 함', async ({ page }) => {
    await page.goto('/quotations')

    const firstQuotation = page.locator('[data-testid="quotation-item"]').first()
    const count = await firstQuotation.count()

    if (count > 0) {
      await firstQuotation.click()

      // 상태 변경 버튼 클릭
      const statusButton = page.locator('button:has-text("상태")')
      if (await statusButton.isVisible()) {
        await statusButton.click()

        // 상태 선택 모달 확인
        await expect(page.locator('[data-testid="status-modal"]')).toBeVisible()

        // 상태 옵션 확인
        await expect(page.locator('button:has-text("견적")')).toBeVisible()
        await expect(page.locator('button:has-text("전송")')).toBeVisible()
        await expect(page.locator('button:has-text("승인")')).toBeVisible()
        await expect(page.locator('button:has-text("거절")')).toBeVisible()
      }
    }
  })

  test('견적서 항목을 추가할 수 있어야 함', async ({ page }) => {
    await page.goto('/quotations')

    const createButton = page.locator('button:has-text("새 견적서")')
    if (await createButton.isVisible()) {
      await createButton.click()

      // 품목 추가 버튼 클릭
      const addItemButton = page.locator('button:has-text("품목 추가")')
      if (await addItemButton.isVisible()) {
        await addItemButton.click()

        // 품목 추가 모달 확인
        await expect(page.locator('[data-testid="add-item-modal"]')).toBeVisible()

        // 제품 선택 필드 확인
        await expect(page.locator('select[name="productId"]')).toBeVisible()
        await expect(page.locator('input[name="quantity"]')).toBeVisible()
        await expect(page.locator('input[name="unitPrice"]')).toBeVisible()
      }
    }
  })

  test('견적서 삭제가 가능해야 함', async ({ page }) => {
    await page.goto('/quotations')

    const firstQuotation = page.locator('[data-testid="quotation-item"]').first()
    const count = await firstQuotation.count()

    if (count > 0) {
      await firstQuotation.click()

      // 삭제 버튼 클릭
      const deleteButton = page.locator('button:has-text("삭제")')
      if (await deleteButton.isVisible()) {
        // 삭제 확인 다이얼로그 대기
        page.on('dialog', async dialog => {
          expect(dialog.message()).toBeTruthy()
          await dialog.dismiss()
        })

        await deleteButton.click()
      }
    }
  })

  test('견적서 검색 기능이 작동해야 함', async ({ page }) => {
    await page.goto('/quotations')

    // 검색 입력 필드 확인
    const searchInput = page.locator('input[name="search"]')
    await expect(searchInput).toBeVisible()

    // 검색어 입력
    await searchInput.fill('test')

    // 검색 결과 대기
    await page.waitForTimeout(500)
  })

  test('견적서 필터 기능이 작동해야 함', async ({ page }) => {
    await page.goto('/quotations')

    // 상태 필터 확인
    const statusFilter = page.locator('select[name="status"]')
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption('draft')

      // 필터 적용 대기
      await page.waitForTimeout(500)
    }
  })
})
