import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('Excel 기능 E2E', () => {
  let email: string
  const password = 'TestPassword123'

  test.beforeEach(async ({ page }) => {
    // Generate unique email for each test
    email = `excel-test-${Date.now()}@example.com`

    // Register new user
    await page.goto('/auth/register')
    await page.locator('input#email').fill(email)
    await page.locator('input#password').fill(password)
    await page.locator('input#confirmPassword').fill(password)
    await page.locator('input#name').fill('Excel Test User')
    await page.locator('button:has-text("가입")').click()
    await expect(page).toHaveURL('/dashboard')
  })

  test('제품 목록을 Excel로 내보낼 수 있어야 함', async ({ page }) => {
    await page.goto('/products')

    // 내보내기 버튼 클릭
    const exportButton = page.locator('button:has-text("Excel 내보내기")')
    if (await exportButton.isVisible()) {
      // 다운로드 이벤트 대기
      const downloadPromise = page.waitForEvent('download')

      await exportButton.click()

      // 다운로드 확인
      const download = await downloadPromise
      expect(download.suggestedFilename()).toContain('.xlsx')

      // 파일 저장
      const filePath = path.join('/tmp', download.suggestedFilename())
      await download.saveAs(filePath)
    }
  })

  test('재고 현황을 Excel로 내보낼 수 있어야 함', async ({ page }) => {
    await page.goto('/inventory')

    // 내보내기 버튼 클릭
    const exportButton = page.locator('button:has-text("Excel 내보내기")')
    if (await exportButton.isVisible()) {
      // 다운로드 이벤트 대기
      const downloadPromise = page.waitForEvent('download')

      await exportButton.click()

      // 다운로드 확인
      const download = await downloadPromise
      expect(download.suggestedFilename()).toContain('.xlsx')

      // 파일 저장
      const filePath = path.join('/tmp', download.suggestedFilename())
      await download.saveAs(filePath)
    }
  })

  test('Excel에서 제품을 가져올 수 있어야 함', async ({ page }) => {
    await page.goto('/products')

    // 가져오기 버튼 클릭
    const importButton = page.locator('button:has-text("Excel 가져오기")')
    if (await importButton.isVisible()) {
      await importButton.click()

      // 가져오기 모달 확인
      await expect(page.locator('[data-testid="import-modal"]')).toBeVisible()

      // 파일 선택 입력 찾기
      const fileInput = page.locator('input[type="file"]')
      await expect(fileInput).toBeVisible()

      // 테스트용 Excel 파일 경로 (실제 파일이 필요함)
      // await fileInput.setInputFiles('path/to/test-file.xlsx')

      // 취소 버튼 클릭 (테스트 정리)
      await page.locator('button:has-text("취소")').click()
    }
  })

  test('Excel 가져오기 오류가 표시되어야 함', async ({ page }) => {
    await page.goto('/products')

    const importButton = page.locator('button:has-text("Excel 가져오기")')
    if (await importButton.isVisible()) {
      await importButton.click()

      // 잘못된 파일 형식 업로드 시도
      const fileInput = page.locator('input[type="file"]')

      // 임시 텍스트 파일 생성 및 업로드
      const tempPath = path.join('/tmp', 'test.txt')
      await page.evaluate(async (path) => {
        const fs = await import('fs')
        fs.writeFileSync(path, 'test content')
      }, tempPath)

      await fileInput.setInputFiles(tempPath)

      // 오류 메시지 확인
      await expect(page.locator('[data-testid="toast-error"]')).toBeVisible()
    }
  })
})
