# Playwright 테스트 가이드

이 문서는 Playwright MCP를 활용한 부품 관리 시스템의 통합 테스트 방법을 안내합니다.

## 테스트 구조

### 백엔드 API 테스트 (`/tests`)
```
tests/
├── auth/                    # 인증 API 테스트
│   └── auth.spec.ts
├── products/                # 제품 API 테스트
│   └── products.spec.ts
├── warehouses/              # 창고 API 테스트
│   └── warehouses.spec.ts
├── customers/               # 고객 API 테스트
│   └── customers.spec.ts
├── inventory/               # 재고 API 테스트
│   └── inventory.spec.ts
├── quotations/             # 견적서 API 테스트
│   └── quotations.spec.ts
├── excel/                  # Excel 기능 API 테스트
│   └── excel.spec.ts
└── dashboard/              # 대시보드 API 테스트
    └── dashboard.spec.ts
```

### 프론트엔드 E2E 테스트 (`/tests/e2e`)
```
tests/e2e/
├── auth.spec.ts             # 인증 E2E 테스트
├── products.spec.ts         # 제품 E2E 테스트
├── inventory.spec.ts        # 재고 관리 E2E 테스트
├── quotations.spec.ts       # 견적서 E2E 테스트
├── warehouses.spec.ts       # 창고 E2E 테스트
├── customers.spec.ts        # 고객 E2E 테스트
├── excel.spec.ts            # Excel 기능 E2E 테스트
├── dashboard.spec.ts        # 대시보드 E2E 테스트
└── ...
```

## 테스트 시나리오

### 1. 인증 (Authentication)
- ✅ 사용자 등록
- ✅ 로그인
- ✅ 잘못된 자격 증명으로 로그인 실패
- ✅ 사용자 프로필 조회
- ✅ 인증 없이 프로필 접근 실패
- ✅ 로그아웃

### 2. 제품 (Products)
- ✅ 새 제품 생성
- ✅ 모든 제품 조회
- ✅ 단일 제품 조회
- ✅ 제품 정보 수정
- ✅ 제품 삭제

### 3. 창고 (Warehouses)
- ✅ 새 창고 생성
- ✅ 모든 창고 조회
- ✅ 단일 창고 조회
- ✅ 창고 정보 수정
- ✅ 창고 삭제

### 4. 고객 (Customers)
- ✅ 새 고객 생성
- ✅ 모든 고객 조회
- ✅ 단일 고객 조회
- ✅ 고객 정보 수정
- ✅ 고객 삭제

### 5. 재고 (Inventory)
- ✅ 재고 현황 조회
- ✅ 특정 재고 조회
- ✅ 입고 (Stock In) 작업
- ✅ 출고 (Stock Out) 작업
- ✅ 재고 수량 조정
- ✅ 거래 내역 조회
- ✅ 부족 재고 알림
- ✅ 안전 재고 설정
- ✅ 재고 부족 시 출고 실패

### 6. 견적서 (Quotations)
- ✅ 새 견적서 생성
- ✅ 모든 견적서 조회
- ✅ 필터로 견적서 조회
- ✅ 단일 견적서 조회
- ✅ 견적서 정보 수정
- ✅ 견적서 PDF 다운로드
- ✅ 견적서 이메일 발송
- ✅ 견적서 상태 변경
- ✅ 견적서 삭제

### 7. Excel 기능
- ✅ 제품 목록 Excel 내보내기
- ✅ 재고 현황 Excel 내보내기
- ✅ Excel에서 제품 가져오기
- ✅ 잘못된 데이터로 가져오기 실패

### 8. 대시보드 (Dashboard)
- ✅ 대시보드 요약 정보 조회
- ✅ 재고 요약 조회
- ✅ 최근 알림 조회
- ✅ 한계 설정으로 알림 조회

## 테스트 실행 방법

### 1. 전제조건
```bash
# 백엔드 종속성 설치
cd parts-monitor
npm install

# 프론트엔드 종속성 설치
cd ../parts-monitor-frontend
npm install
```

### 2. 환경 설정
```bash
# .env 파일 복사 및 수정
cd parts-monitor
cp .env.example .env

# 필요한 환경 변수 설정
# DATABASE_HOST=localhost
# DATABASE_PORT=5432
# DATABASE_USER=postgres
# DATABASE_PASSWORD=postgres
# DATABASE_NAME=parts_inventory_test
# AWS_ENDPOINT_URL=http://localhost:4566
```

### 3. Docker 서비스 시작
```bash
# Docker Compose로 서비스 시작
cd parts-monitor
docker-compose up -d

# LocalStack 초기화
./localstack/init-localstack.sh
```

### 4. 백엔드 테스트 실행
```bash
# 모든 API 테스트 실행
cd parts-monitor
npx playwright test

# 특정 테스트 스위트 실행
npx playwright test auth.spec.ts
npx playwright test inventory.spec.ts
npx playwright test quotations.spec.ts

# 헤드리스 모드로 실행
npx playwright test --headed

# 디버그 모드로 실행
npx playwright test --debug

# CI 모드로 실행
npx playwright test --project=api
```

### 5. 프론트엔드 테스트 실행
```bash
# 모든 E2E 테스트 실행
cd parts-monitor-frontend
npm run test:e2e

# 특정 테스트 파일 실행
npx playwright test inventory.spec.ts
npx playwright test quotations.spec.ts

# UI 모드로 실행
npx playwright test --ui

# 헤드리스 모드로 실행
npx playwright test --headed

# 디버그 모드로 실행
npx playwright test --debug
```

### 6. 테스트 보고서 확인
```bash
# HTML 보고서 열기
npx playwright show-report

# JSON 보고서 확인
cat test-results.json

# 커버리지 보고서 확인
npx playwright test --reporter=html,json --reporter-json=outputFile=test-results.json
```

## 테스트 보고서

### 1. HTML 보고서
```bash
# 백엔드
cd parts-monitor
npx playwright show-report playwright-report

# 프론트엔드
cd parts-monitor-frontend
npx playwright show-report playwright-report
```

### 2. JSON 보고서
```bash
# 백엔드
cat parts-monitor/test-results.json

# 프론트엔드
cat parts-monitor-frontend/test-results.json
```

### 3. 스크린샷 및 비디오
```bash
# 실패한 테스트의 스크린샷
ls -la parts-monitor/test-results/

# 실패한 테스트의 비디오
ls -la parts-monitor/test-results/*/videos/
```

## CI/CD 통합

### GitHub Actions 예시
```yaml
name: Playwright Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Start services
        run: docker-compose up -d

      - name: Run tests
        run: npx playwright test

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: test-results/
```

## 테스트 팁

### 1. 테스트 격리
- 각 테스트는 독립적으로 실행되어야 합니다
- 테스트 간 데이터 공유를 피하세요
- `beforeEach`/`afterEach`를 사용하여 데이터를 정리하세요

### 2. 대기 전략
```typescript
// 특정 요소 대기
await page.waitForSelector('[data-testid="submit-button"]')

// 네트워크 요청 대기
await page.waitForResponse('**/api/**')

// 타임아웃 설정
await page.waitForTimeout(1000)
```

### 3. 디버깅
```bash
# 슬로우 모�로 실행 (각 단계마다 딜레이)
npx playwright test --slow-mo=1000

# 트레이스 파일 분석
npx playwright show-trace trace.zip
```

### 4. 테스트 데이터 관리
- 고유한 테스트 데이터 생성 (타임스탬프 사용)
- 테스트용 데이터베이스 사용
- 테스트 후 데이터 정리

## 트러블슈팅

### 1. 타임아웃 오류
```typescript
// 타임아웃 증가
test.setTimeout(60000); // 60초
```

### 2. 요소를 찾을 수 없음
```typescript
// 명시적 대기
await page.waitForSelector('[data-testid="element"]', { timeout: 10000 })
```

### 3. 네트워크 오류
```typescript
// 재시도 로직
await retry(() => {
  await page.goto('/dashboard')
}, 3)
```

## 테스트 커버리지

현재 구현된 테스트는 다음 기능을 커버합니다:

### API 테스트 (백엔드)
- ✅ 인증: 7개 테스트
- ✅ 제품: 6개 테스트
- ✅ 창고: 6개 테스트
- ✅ 고객: 6개 테스트
- ✅ 재고: 10개 테스트
- ✅ 견적서: 9개 테스트
- ✅ Excel: 4개 테스트
- ✅ 대시보드: 4개 테스트

### E2E 테스트 (프론트엔드)
- ✅ 인증: 7개 테스트
- ✅ 제품: 기존 테스트 유지
- ✅ 재고: 10개 테스트
- ✅ 견적서: 11개 테스트
- ✅ 창고: 6개 테스트
- ✅ 고객: 6개 테스트
- ✅ Excel: 4개 테스트
- ✅ 대시보드: 기존 테스트 유지

## 다음 단계

1. ✅ 모든 API 테스트 작성 완료
2. ✅ 모든 E2E 테스트 작성 완료
3. ⏳ 테스트 실행 및 결과 확인
4. ⏳ 실패한 테스트 수정
5. ⏳ 커버리지 향상
6. ⏳ CI/CD 파이프라인에 통합
7. ⏳ 성능 테스트 추가
