# 메일 발송 및 스크래핑 기능 구현 완료

## 개요

전자부품 재고/견적 관리 시스템에 메일 발송 기능과 스크래핑 기능을 상세하게 구현했습니다. 백엔드 API, 프론트엔드 UI, 통합 기능이 모두 포함됩니다.

---

## 🚀 구현된 기능

### 1. 스크래핑 기능 (Backend)

#### 1.1 Scraper Controller (`src/modules/scraper/scraper.controller.ts`)

**새로운 API 엔드포인트:**

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/scraper/run` | 단일 제품 스크래핑 작업 생성 |
| POST | `/api/scraper/run-batch` | 다중 제품 일괄 스크래핑 |
| POST | `/api/scraper/run-single` | 직접 URL로 단일 스크래핑 |
| GET | `/api/scraper/job/:id` | 작업 상태 및 진행률 확인 |
| GET | `/api/scraper/supported-sites` | 지원되는 스크래핑 사이트 목록 |

**기능:**
- JWT 인증 적용
- Bull 큐를 이용한 비동기 작업 처리
- 작업 상태 추적 (waiting, active, completed, failed)
- 진행률 모니터링
- 재시도 로직

#### 1.2 Scraper Service (`src/modules/scraper/scraper.service.ts`)

**지원 사이트:**
- 다나와 (Danawa)
- Mouser Electronics
- Digi-Key

**스크래핑 파서:**
- `DanawaParser` - 다나와 한국어 가격 스크래핑
- `MouserParser` - Mouser 미국 달러 가격 스크래핑
- `DigikeyParser` - Digi-Key 미국 달러 가격 스크래핑

**수집 데이터:**
- 가격 정보 (수량별 단가)
- 재고 상태 (재고량, 상태 코드)
- 리드타임 (배송 소요 시간)
- 스크린샷 (S3에 업로드)

**특징:**
- Puppeteer 기반 웹 스크래핑
- 요청 가로채기로 이미지/스타일시트 차단 (성능 최적화)
- 랜덤 딜레이로 차단 방지
- 최대 3회 재시도
- S3 스크린샷 저장

---

### 2. 알림/메일 발송 기능 (Backend)

#### 2.1 Notification Controller (`src/modules/notification/notification.controller.ts`)

**새로운 API 엔드포인트:**

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/notification/daily-report` | 일일 리포트 발송 |
| POST | `/api/notification/price-alert` | 가격 변동 알림 발송 |
| POST | `/api/notification/stock-alert` | 재고 상태 알림 발송 |
| POST | `/api/notification/low-stock-alert` | 재고 부족 알림 발송 |

**기능:**
- JWT 인증 적용
- 다중 수신자 지원
- 이메일 템플릿 사용

#### 2.2 Email Service (`src/modules/notification/email.service.ts`)

**이메일 유형:**
- `sendDailyReport()` - 일일 리포트 (제품 요약, 통계)
- `sendPriceAlert()` - 가격 변동 알림 (변동율, 이전/현재 가격)
- `sendStockAlert()` - 재고 상태 알림 (재고량, 상태)
- `sendQuotationEmail()` - 견적서 이메일 (PDF 첨부)
- `sendLowStockAlert()` - 재고 부족 알림 (품목별 상세)

**Handlebars 템플릿:**
- `daily-report.hbs` - 일일 리포트 템플릿
- `price-alert.hbs` - 가격 알림 템플릿
- `stock-alert.hbs` - 재고 알림 템플릿
- `quotation.hbs` - 견적서 템플릿

**도우미 함수:**
- `formatDate()` - 날짜 한국어 포맷
- `formatNumber()` - 숫자 천단위 구분
- `formatPercent()` - 퍼센트 포맷 (+/- 표시)
- `formatCurrency()` - 통화 포맷 (KRW)

#### 2.3 SES Service (`src/modules/notification/ses.service.ts`)

**기능:**
- AWS SES 클라이언트 연동
- LocalStack 지원 (개발 환경)
- Nodemailer를 통한 첨부파일 지원
- 이메일 발송 로깅

**환경 변수:**
- `AWS_REGION` - AWS 리전 (기본: ap-northeast-2)
- `AWS_ENDPOINT_URL` - 엔드포인트 (기본: http://localhost:4566)
- `AWS_ACCESS_KEY_ID` - 액세스 키 (기본: test)
- `AWS_SECRET_ACCESS_KEY` - 시크릿 키 (기본: test)
- `SES_FROM_EMAIL` - 발신자 이메일

---

### 3. 견적서 메일 발송 개선 (Backend)

#### 3.1 Quotation Controller (`src/modules/quotation/quotation.controller.ts`)

**수정된 엔드포인트:**
- `POST /api/quotations/:id/send-email` - 다중 수신자 지원

**요청 본문:**
```typescript
{
  recipients: string[]  // 이메일 주소 배열
}
```

#### 3.2 Quotation Service (`src/modules/quotation/quotation.service.ts`)

**sendByEmail 메서드 개선:**
- 다중 수신자 지원
- PDF 자동 생성
- 견적서 상태 업데이트 (draft → sent)
- 이메일 발송 로깅

#### 3.3 PDF Generator Service (`src/modules/quotation/pdf-generator.service.ts`)

**PDF 생성 기능:**
- 견적서 헤더 (제목, 견적번호, 날짜)
- 고객 정보
- 제품 항목 테이블 (번호, 품명, 규격, 수량, 단가, 할인, 금액)
- 합계 섹션 (소계, 부가세, 합계)
- 비고 및 거래 조건
- 푸터

---

### 4. 스크래핑 UI (Frontend)

#### 4.1 Scraper Page (`src/app/scraper/page.tsx`)

**구성 요소:**
- 탭 메뉴 (일괄 스크래핑, 단일 스크래핑)
- 제품 선택 패널
  - 검색 기능
  - 전체 선택/해제
  - 체크박스 리스트
- 단일 스크래핑 설정
  - 사이트 선택 (다나와, Mouser, Digi-Key)
  - 커스텀 URL 입력
- 스크래핑 기록
  - 작업 상태 아이콘
  - 진행률 바
  - 결과 표시
  - 에러 메시지

**상태 관리:**
```typescript
- products: Product[]
- selectedProducts: string[]
- searchQuery: string
- supportedSites: SupportedSite[]
- selectedSite: string
- customUrl: string
- jobs: ScrapingJob[]
```

**기능:**
- 제품 검색 및 필터링
- 단일/일괄 스크래핑 실행
- 작업 상태 실시간 폴링 (2초 간격)
- 진행률 시각화
- 완료/실패 상태 표시
- 가격 정보 한국어 포맷

---

### 5. 알림/메일 발송 UI (Frontend)

#### 5.1 Notifications Page (`src/app/notifications/page.tsx`)

**구성 요소:**
- 탭 메뉴 (재고 부족 알림, 가격 변동 알림, 커스텀 리포트)
- 수신자 패널
  - 수신자 목록 표시
  - 이메일/이름 입력
  - 수신자 추가/제거
- 재고 부족 알림
  - 저재고 제품 목록
  - 전체 선택/해제
  - 상태 색상 코딩 (재고없음, 긴급, 부족)
- 가격 변동 알림
  - 알림 유형 선택 (가격 하락/상승)
  - 임계값 설정 (%)
- 커스텀 리포트
  - 리포트 유형 선택 (일일/주간/월간)
  - 메시지 입력

**상태 관리:**
```typescript
- activeTab: 'stock' | 'price' | 'custom'
- recipients: Recipient[]
- lowStockItems: LowStockItem[]
- selectedItems: string[]
- alertType: 'lowStock' | 'priceAlert'
- customMessage: string
```

**기능:**
- 다중 수신자 관리
- 저재고 제품 필터링
- 재고 상태 시각화
- 가격 알림 임계값 설정
- 커스텀 리포트 발송
- 발송 중 로딩 표시

---

### 6. 견적서 메일 발송 UI 개선 (Frontend)

#### 6.1 Quotations Page (`src/app/quotations/page.tsx`)

**개선된 기능:**

1. **다중 수신자 지원**
   - 수신자 배열 상태 관리
   - 이메일 추가/제거 기능
   - 중복 이메일 방지

2. **이메일 전송 모달 개선**
   - 수신자 목록 표시
   - 이메일 주소 추가 폼
   - Enter 키로 빠른 추가
   - 수신자 제거 버튼

3. **API 업데이트**
   - `quotationApi.sendEmail()`가 recipients 배열을 받도록 수정

**상태 관리:**
```typescript
- emailRecipients: string[]  // 변경됨 (단일 → 배열)
- newEmailAddress: string    // 추가됨
```

---

### 7. API Client 업데이트 (`src/lib/api.ts`)

#### 7.1 scraperApi 확장

```typescript
// 새로운 메서드
runBatchScrape(productIds: string[])
runSingleScrape(productId: string, site: string, url: string)
getJobStatus(jobId: string)
getSupportedSites()
```

#### 7.2 notificationApi 추가

```typescript
// 새로운 API
sendDailyReport(recipients: string[], reportData: any)
sendPriceAlert(recipients: string[], alertData: any)
sendStockAlert(recipients: string[], alertData: any)
sendLowStockAlert(recipients: string[], inventories: any[])
```

#### 7.3 quotationApi 업데이트

```typescript
// 변경된 메서드
sendEmail(id: string, recipients: string[])  // email → recipients
```

---

### 8. 네비게이션 업데이트 (`src/components/Navigation.tsx`)

**새로운 메뉴 항목:**

| 경로 | 라벨 | 아이콘 |
|------|------|--------|
| `/scraper` | 스크래핑 | Globe |
| `/notifications` | 알림 | Mail |

**변경 사항:**
- 기존 `/alerts` → `/alerts` (경고)로 이름 변경
- Globe, Mail 아이콘 추가
- 메뉴 순서 재정렬

---

## 📁 파일 구조

```
parts-monitor/
├── src/
│   └── modules/
│       ├── scraper/
│       │   ├── scraper.controller.ts (수정됨)
│       │   ├── scraper.service.ts
│       │   ├── scraper.module.ts
│       │   └── parsers/
│       │       ├── base.parser.ts
│       │       ├── danawa.parser.ts
│       │       ├── mouser.parser.ts
│       │       └── digikey.parser.ts
│       ├── notification/
│       │   ├── notification.controller.ts (새로 생성)
│       │   ├── notification.module.ts (수정됨)
│       │   ├── email.service.ts
│       │   ├── ses.service.ts
│       │   └── templates/
│       │       ├── daily-report.hbs
│       │       ├── price-alert.hbs
│       │       ├── stock-alert.hbs
│       │       └── quotation.hbs
│       └── quotation/
│           ├── quotation.controller.ts
│           ├── quotation.service.ts
│           └── pdf-generator.service.ts

parts-monitor-frontend/
├── src/
│   ├── app/
│   │   ├── scraper/
│   │   │   └── page.tsx (새로 생성)
│   │   ├── notifications/
│   │   │   └── page.tsx (새로 생성)
│   │   └── quotations/
│   │       └── page.tsx (수정됨)
│   ├── components/
│   │   └── Navigation.tsx (수정됨)
│   └── lib/
│       └── api.ts (수정됨)
```

---

## 🔧 환경 설정

### Backend (.env)

```env
# AWS SES
AWS_REGION=ap-northeast-2
AWS_ENDPOINT_URL=http://localhost:4566
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
SES_FROM_EMAIL=noreply@example.com

# S3
S3_BUCKET_NAME=parts-inventory-files

# Scraping
SCRAPE_TIMEOUT_MS=30000
SCRAPE_DELAY_MS=2000
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## 🧪 테스트 방법

### 1. 스크래핑 테스트

```bash
# 단일 제품 스크래핑
curl -X POST http://localhost:3000/api/scraper/run \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"productId": "test-product-1"}'

# 일괄 스크래핑
curl -X POST http://localhost:3000/api/scraper/run-batch \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"productIds": ["p1", "p2", "p3"]}'

# 작업 상태 확인
curl http://localhost:3000/api/scraper/job/1 \
  -H "Authorization: Bearer <token>"

# 지원 사이트 목록
curl http://localhost:3000/api/scraper/supported-sites \
  -H "Authorization: Bearer <token>"
```

### 2. 알림/메일 발송 테스트

```bash
# 저재고 알림 발송
curl -X POST http://localhost:3000/api/notification/low-stock-alert \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": ["admin@example.com"],
    "inventories": [
      {
        "id": "1",
        "product": {"partNumber": "TEST-001", "partName": "테스트 제품"},
        "quantity": 5,
        "safetyStock": 10,
        "status": "low"
      }
    ]
  }'

# 가격 변동 알림 발송
curl -X POST http://localhost:3000/api/notification/price-alert \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": ["admin@example.com"],
    "alertData": {
      "product": {"partNumber": "TEST-001", "partName": "테스트 제품"},
      "changes": {"priceChange": -10.5, "previousPrice": 1000, "currentPrice": 895}
    }
  }'
```

### 3. 견적서 메일 발송 테스트

```bash
# 다중 수신자로 견적서 발송
curl -X POST http://localhost:3000/quotations/1/send-email \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": ["recipient1@example.com", "recipient2@example.com"]
  }'
```

---

## 🎨 UI 특징

### 스크래핑 UI
- 다크 모드 지원
- 반응형 레이아웃
- 실시간 진행률 바
- 상태별 아이콘 (완료, 실패, 진행 중, 대기)
- 제품 검색 필터링
- 일괄/단일 모드 탭

### 알림 UI
- 다크 모드 지원
- 수신자 관리 (추가/제거)
- 재고 상태 색상 코딩
- 가격 알림 임계값 설정
- 커스텀 리포트 발송
- 발송 중 로딩 표시

### 견적서 UI
- 다크 모드 지원
- 다중 수신자 입력
- 수신자 목록 표시
- 중복 이메일 방지
- Enter 키로 빠른 추가

---

## 📊 기술 스택

### Backend
- NestJS
- TypeORM
- PostgreSQL
- Bull (Redis 기반 큐)
- AWS SES (LocalStack)
- AWS S3 (LocalStack)
- Puppeteer (스크래핑)
- PDFKit (PDF 생성)
- Handlebars (이메일 템플릿)
- Nodemailer (이메일 발송)

### Frontend
- Next.js 15 (App Router)
- React 19
- TailwindCSS
- Lucide Icons
- TypeScript

---

## 🔍 검증 항목

### ✅ 스크래핑 기능
- [x] 단일 제품 스크래핑
- [x] 일괄 스크래핑
- [x] 다중 사이트 지원 (다나와, Mouser, Digi-Key)
- [x] 작업 큐 관리
- [x] 진행률 추적
- [x] 에러 핸들링 및 재시도
- [x] 스크린샷 S3 저장

### ✅ 알림/메일 기능
- [x] 다중 수신자 지원
- [x] 이메일 템플릿
- [x] 저재고 알림
- [x] 가격 변동 알림
- [x] 일일 리포트
- [x] 커스텀 리포트
- [x] SES 통합
- [x] PDF 첨부

### ✅ 견적서 기능
- [x] 다중 수신자 지원
- [x] PDF 생성
- [x] 이메일 발송
- [x] 상태 업데이트

### ✅ 프론트엔드 UI
- [x] 스크래핑 페이지
- [x] 알림 페이지
- [x] 견적서 메일 발송 개선
- [x] 네비게이션 업데이트
- [x] API 클라이언트 업데이트
- [x] 다크 모드 지원
- [x] 반응형 디자인

---

## 🚀 실행 방법

### Backend
```bash
cd parts-monitor
npm install
npm run start:dev
```

### Frontend
```bash
cd parts-monitor-frontend
npm install
npm run dev
```

### LocalStack (개발 환경)
```bash
cd parts-monitor
docker-compose up -d
```

---

## 📝 참고 사항

1. **LocalStack**: 개발 환경에서 AWS SES와 S3를 로컬에서 시뮬레이션합니다.
2. **스크래핑 속도**: 이미지, 스타일시트 등 불필요한 리소스를 차단하여 속도를 최적화했습니다.
3. **이메일 템플릿**: Handlebars를 사용하여 동적인 이메일을 생성합니다.
4. **크기 제한**: 일괄 스크래핑 시 한 번에 너무 많은 제품을 처리하면 메모리 문제가 발생할 수 있습니다.
5. **PDF 생성**: 한글 폰트가 필요한 경우 PDFKit에 폰트를 등록해야 합니다.

---

## 🎯 향후 개선 사항

1. 스크래핑 결과 데이터베이스에 자동 저장
2. 이메일 발송 내역 관리
3. 스케줄링된 자동 스크래핑
4. 알림 설정 사용자별 커스터마이징
5. 실시간 웹소켓으로 작업 상태 업데이트
6. 더 많은 스크래핑 사이트 추가
7. 스크래핑 결과 시각화 대시보드

---

**구현 완료일:** 2026년 1월 6일
**개발자:** AI Assistant
