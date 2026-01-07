# 기능 연계 및 통합 문서

## 개요

이 문서는 부품 관리 시스템의 모든 기능 간 연관성을 설명하고, 새로운 연계 기능을 정의합니다.

## 기능 연계 관계도

```
┌─────────────────┐
│   제품 (Product)      │
│                 │
│  - 제품 정보      │
│  - 가격 기록 (PriceHistory)   │
│  - 스크래핑 기록 (ScrapingHistory)│
└────────┬────────┘
         │
         ├──┬──────────────────────────────┐
         │                              │
┌────────▼─────────┐         ┌────────▼─────────┐
│  재고 (Inventory)   │         │  견적서 (Quotation) │
│                 │         │                 │
│  - 재고 현황      │         │  - 견적서 정보       │
│  - 거래 기록 (StockTransaction)   │  - 견적서 항목 (QuotationItem)  │
└────────┬────────┘         └────────┬────────┘
         │                              │
         │                              │
┌────────▼────────┐         ┌────────▼────────┐
│  창고 (Warehouse)  │         │  고객 (Customer)  │
│                │         │                │
│  - 창고 정보     │         │  - 고객 정보      │
│  - 창고 제품 매핑    │         │  - 고객 견적 기록  │
└─────────────────┘         └─────────────────┘
```

## 1. 제품 갱신 기능

### 1.1 개요
사용자가 버튼을 클릭하여 제품 정보를 웹사이트에서 다시 수집하고, 갱신 내역을 기록합니다.

### 1.2 구성 요소

#### 백엔드

##### ScrapingHistory Entity
- 위치: `src/modules/product/entities/scraping-history.entity.ts`
- 기능: 갱신 시도 및 결과 기록
- 주요 필드:
  - `success`: 갱신 성공 여부
  - `priceChanged`: 가격 변화 여부
  - `stockChanged`: 재고 변화 여부
  - `scrapeDuration`: 소요 시간 (ms)
  - `triggerType`: 갱신 유형 (manual/scheduled)
  - `triggeredBy`: 갱신 요청자

##### ScrapingHistoryService
- 위치: `src/modules/product/scraping-history.service.ts`
- 기능:
  - 갱신 내역 생성 및 조회
  - 통계 계산 (성공률, 실패 횟수 등)
  - 실패 시도 추적
- 주요 메서드:
  - `createHistory()`: 갱신 내역 기록
  - `getProductHistory()`: 제품별 갱신 내역
  - `getRecentHistory()`: 최근 갱신 내역
  - `getHistoryStats()`: 갱신 통계
  - `getFailedAttempts()`: 실패한 갱신 시도

##### ProductRefreshService
- 위치: `src/modules/product/product-refresh.service.ts`
- 기능:
  - 단일 제품 갱신
  - 복수 제품 갱신
  - 전체 제품 갱신
  - 사이트별 갱신
- 주요 메서드:
  - `refreshSingleProduct()`: 단일 제품 갱신
  - `refreshMultipleProducts()`: 복수 제품 갱신
  - `refreshAllProducts()`: 전체 제품 갱신
  - `refreshBySite()`: 특정 사이트 갱신

##### ProductRefreshController
- 위치: `src/modules/product/product-refresh.controller.ts`
- 기능: 갱신 API 엔드포인트 제공
- 주요 엔드포인트:
  - `POST /api/products/:id/refresh`: 단일 제품 갱신
  - `POST /api/products/refresh/multiple`: 복수 제품 갱신
  - `POST /api/products/refresh/all`: 전체 제품 갱신
  - `POST /api/products/refresh/site/:site`: 사이트별 갱신
  - `GET /api/products/:id/history`: 제품 갱신 내역
  - `GET /api/products/history/recent`: 최근 갱신 내역
  - `GET /api/products/history/stats`: 갱신 통계
  - `GET /api/products/history/failed`: 실패 갱신

#### 프론트엔드

##### ProductRefreshButton Component
- 위치: `src/components/ProductRefreshButton.tsx`
- 기능: 갱신 버튼 UI 컴포넌트
- 특징:
  - 버튼 클릭 시 갱신 요청
  - 로딩 상태 표시 (스피닝 아이콘)
  - 최신 갱신 상태 표시 (성공/실패 아이콘)
  - 버튼 크기 및 스타일 옵션
  - 아이콘 전용 버튼 모드

##### RefreshHistoryPanel Component
- 위치: `src/components/RefreshHistoryPanel.tsx`
- 기능: 갱신 내역 패널
- 특징:
  - 갱신 내역 목록 표시
  - 필터링 (전체/성공/실패)
  - 가격 및 재고 변화 표시
  - 소요 시간 및 갱신 일시 표시
  - 모달 형태

##### DashboardRefreshStats Component
- 위치: `src/components/DashboardRefreshStats.tsx`
- 기능: 대시보드 갱신 통계 표시
- 특징:
  - 전체/성공/실패 갱신 횟수
  - 성공률 표시
  - 최근 갱신 내역 (최근 5개)
  - 실시간 갱신 (1분마다)

##### ProductDetail Page
- 위치: `src/pages/ProductDetail.tsx`
- 기능: 제품 상세 페이지
- 특징:
  - 제품 정보 상세 표시
  - 갱신 버튼 표시
  - 가격 변동 내역 표시
  - 재고 현황 표시
  - 갱신 내역 패널 표시

### 1.3 연계 흐름

```
사용자 버튼 클릭
    ↓
ProductRefreshService.refreshSingleProduct()
    ↓
ScraperService.scrapeProduct()
    ↓
제품 정보 업데이트
    ↓
ScrapingHistoryService.createHistory()
    ↓
UI 갱신 및 내역 표시
```

### 1.4 API 사용 예시

```typescript
// 단일 제품 갱신
POST /api/products/123e4567-e89b-12d3-a456-426614174000/refresh?triggeredBy=user1

// 복수 제품 갱신
POST /api/products/refresh/multiple?triggeredBy=user1
{
  "productIds": [
    "123e4567-e89b-12d3-a456-426614174000",
    "123e4567-e89b-12d3-a456-426614174001"
  ]
}

// 전체 제품 갱신
POST /api/products/refresh/all?triggeredBy=user1

// 갱신 내역 조회
GET /api/products/123e4567-e89b-12d3-a456-426614174000/history?limit=20

// 갱신 통계 조회
GET /api/products/history/stats?productId=123e4567-e89b-12d3-a456-426614174000
```

---

## 2. 견적서와 재고 연계

### 2.1 개요
견적서 승인 시 재고를 자동으로 예약하고, 취소 시 예약을 해제합니다.

### 2.2 구성 요소

#### 백엔드

##### QuotationInventoryService
- 위치: `src/modules/quotation/quotation-inventory.service.ts`
- 기능:
  - 견적서 승인 시 재고 예약
  - 견적서 취소 시 재고 해제
  - 재고 가용성 확인
- 주요 메서드:
  - `reserveStock()`: 재고 예약
  - `releaseStock()`: 재고 해제
  - `checkStockAvailability()`: 재고 가용성 확인

#### 연계 엔드포인트

##### POST /quotations/:id/reserve-stock
- 기능: 견적서 승인 시 재고 예약
- 요청:
  ```json
  {
    "performedBy": "user1"
  }
  ```
- 응답:
  ```json
  {
    "quotationNumber": "QT-2024-001",
    "totalItems": 5,
    "results": [
      {
        "productId": "123e4567-e89b-12d3-a456-426614174000",
        "partNumber": "RES-001",
        "status": "reserved",
        "quantity": 100
      }
    ],
    "successful": 5,
    "failed": 0
  }
  ```

##### POST /quotations/:id/release-stock
- 기능: 견적서 취소 시 재고 해제
- 요청:
  ```json
  {
    "performedBy": "user1"
  }
  ```
- 응답:
  ```json
  {
    "quotationNumber": "QT-2024-001",
    "totalItems": 5,
    "results": [
      {
        "productId": "123e4567-e89b-12d3-a456-426614174000",
        "partNumber": "RES-001",
        "status": "released",
        "quantity": 100
      }
    ],
    "successful": 5,
    "failed": 0
  }
  ```

##### GET /quotations/:id/stock-availability
- 기능: 견적서 항목의 재고 가용성 확인
- 응답:
  ```json
  {
    "quotationNumber": "QT-2024-001",
    "items": [
      {
        "productId": "123e4567-e89b-12d3-a456-426614174000",
        "partNumber": "RES-001",
        "partName": "Resistor 10k Ohm",
        "required": 100,
        "available": 150,
        "status": "available",
        "shortage": 0
      }
    ],
    "allAvailable": true,
    "insufficientItems": []
  }
  ```

### 2.3 연계 흐름

#### 견적서 승인 흐름
```
견적서 상태 변경 (approved)
    ↓
QuotationInventoryService.reserveStock()
    ↓
각 항목별 재고 확인
    ↓
재고 충분: 예약 처리 (Stock OUT)
재고 부족: 경고 기록
    ↓
StockTransaction 기록
    ↓
Inventory 상태 업데이트
    ↓
결과 반환
```

#### 견적서 취소 흐름
```
견적서 상태 변경 (cancelled)
    ↓
QuotationInventoryService.releaseStock()
    ↓
각 항목별 재고 해제
    ↓
재고 복구 처리 (Stock IN)
    ↓
StockTransaction 기록
    ↓
Inventory 상태 업데이트
    ↓
결과 반환
```

### 2.4 재고 상태 계산

```typescript
private calculateStatus(quantity, safetyStock, reorderPoint) {
  if (quantity === 0) return 'out_of_stock';
  if (quantity <= reorderPoint) return 'critical';
  if (quantity <= safetyStock) return 'low';
  return 'sufficient';
}
```

---

## 3. 고객과 견적서 연계

### 3.1 개요
고객별 견적서 기록, 통계, 활동 내역을 조회할 수 있습니다.

### 3.2 구성 요소

#### 백엔드

##### CustomerHistoryService
- 위치: `src/modules/customer/customer-history.service.ts`
- 기능:
  - 고객별 견적서 기록
  - 고객 통계 계산
  - 최근 활동 추적
  - 인기 제품 분석
  - 타임라인 생성
- 주요 메서드:
  - `getQuotationHistory()`: 견적서 기록
  - `getCustomerStats()`: 고객 통계
  - `getRecentActivity()`: 최근 활동
  - `getTopProducts()`: 인기 제품
  - `getCustomerTimeline()`: 타임라인

#### 연계 엔드포인트

##### GET /customers/:id/quotations
- 기능: 고객별 견적서 기록
- 쿼리 파라미터:
  - `limit`: 페이지당 항목 수 (기본값: 20)
  - `offset`: 건너뛸 항목 수 (기본값: 0)

##### GET /customers/:id/stats
- 기능: 고객 통계
- 응답:
  ```json
  {
    "customerId": "123e4567-e89b-12d3-a456-426614174000",
    "totalQuotations": 50,
    "approvedQuotations": 35,
    "rejectedQuotations": 5,
    "approvalRate": 70.0,
    "totalAmount": 50000000,
    "approvedAmount": 35000000,
    "yearlyQuotations": 20,
    "yearlyAmount": 10000000,
    "averageQuotationValue": 1000000,
    "mostRecentQuotation": {
      "id": "...",
      "quotationNumber": "QT-2024-050",
      "title": "...",
      "status": "approved",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
  ```

##### GET /customers/:id/activity
- 기능: 고객 최근 활동
- 쿼리 파라미터:
  - `limit`: 표시할 활동 수 (기본값: 10)

##### GET /customers/:id/top-products
- 기능: 고객의 인기 제품
- 쿼리 파라미터:
  - `limit`: 표시할 제품 수 (기본값: 10)
- 응답:
  ```json
  [
    {
      "productId": "123e4567-e89b-12d3-a456-426614174000",
      "quantity": 1000,
      "amount": 5000000
    }
  ]
  ```

##### GET /customers/:id/timeline
- 기능: 고객 타임라인
- 쿼리 파라미터:
  - `limit`: 표시할 이벤트 수 (기본값: 20)

### 3.3 고객 통계

#### 계산 항목
- `totalQuotations`: 총 견적서 수
- `approvedQuotations`: 승인된 견적서 수
- `rejectedQuotations`: 거절된 견적서 수
- `approvalRate`: 승인률 (%)
- `totalAmount`: 총 견적 금액
- `approvedAmount`: 승인된 견적 금액
- `yearlyQuotations`: 최근 1년 견적서 수
- `yearlyAmount`: 최근 1년 견적 금액
- `averageQuotationValue`: 평균 견적 금액
- `mostRecentQuotation`: 최신 견적서

---

## 4. 창고와 제품 연계

### 4.1 개요
창고별 제품 목록, 검색, 요약 정보를 제공합니다.

### 4.2 구성 요소

#### 백엔드

##### WarehouseProductService
- 위치: `src/modules/warehouse/warehouse-product.service.ts`
- 기능:
  - 창고별 제품 목록
  - 창고 요약 정보
  - 제품 위치 조회
  - 창고 내 제품 검색
  - 전체 창고 제품 조회
- 주요 메서드:
  - `getProductsByWarehouse()`: 창고별 제품 목록
  - `getWarehouseSummary()`: 창고 요약
  - `getProductLocations()`: 제품 위치
  - `searchProductsInWarehouse()`: 창고 내 검색
  - `getAllWarehousesProducts()`: 전체 창고 제품

#### 연계 엔드포인트

##### GET /warehouses/:id/products
- 기능: 창고별 제품 목록
- 쿼리 파라미터:
  - `status`: 필터링할 상태 (low, critical, out_of_stock, sufficient)
  - `page`: 페이지 번호 (기본값: 1)
  - `limit`: 페이지당 항목 수 (기본값: 50)

##### GET /warehouses/:id/summary
- 기능: 창고 요약 정보
- 응답:
  ```json
  {
    "warehouse": {
      "id": "...",
      "code": "WH-001",
      "name": "Main Warehouse"
    },
    "summary": {
      "totalProducts": 500,
      "totalQuantity": 10000,
      "lowStock": 20,
      "criticalStock": 5,
      "outOfStock": 2,
      "sufficientStock": 473,
      "totalValue": 50000000
    },
    "topProducts": [
      {
        "productId": "...",
        "product": {...},
        "quantity": 1000,
        "value": 5000000
      }
    ]
  }
  ```

##### GET /warehouses/:id/products/search
- 기능: 창고 내 제품 검색
- 쿼리 파라미터:
  - `q`: 검색어 (부품번호, 부품명, 사양)
  - `page`: 페이지 번호 (기본값: 1)
  - `limit`: 페이지당 항목 수 (기본값: 50)

##### GET /products/:id/locations
- 기능: 제품별 창고 위치
- 응답:
  ```json
  {
    "productId": "123e4567-e89b-12d3-a456-426614174000",
    "locations": [
      {
        "warehouseId": "...",
        "warehouseName": "Main Warehouse",
        "warehouseCode": "WH-001",
        "quantity": 500,
        "status": "sufficient",
        "location": "A-01-01",
        "safetyStock": 100,
        "reorderPoint": 50
      }
    ],
    "totalQuantity": 1000
  }
  ```

##### GET /warehouses/all/products
- 기능: 전체 창고 제품 목록
- 쿼리 파라미터:
  - `status`: 필터링할 상태

### 4.3 창고 요약

#### 계산 항목
- `totalProducts`: 총 제품 수
- `totalQuantity`: 총 재고 수량
- `lowStock`: 부족 재고 항목 수
- `criticalStock`: 위험 재고 항목 수
- `outOfStock`: 품절 재고 항목 수
- `sufficientStock`: 충분한 재고 항목 수
- `totalValue`: 총 재고 가치 (재고 × 표준가격)

---

## 5. 대시보드 갱신 통계

### 5.1 개요
대시보드에 갱신 통계를 표시하고, 실시간으로 업데이트합니다.

### 5.2 구성 요소

#### 백엔드

##### DashboardService 업데이트
- 위치: `src/modules/dashboard/dashboard.service.ts`
- 기능:
  - 갱신 통계 추가
  - 최근 갱신 내역 포함
- 업데이트 내용:
  - `scraping.total`: 전체 갱신 횟수
  - `scraping.success`: 성공 갱신 횟수
  - `scraping.failed`: 실패 갱신 횟수
  - `scraping.successRate`: 성공률
  - `scraping.recent`: 최근 갱신 내역 (최근 5개)

### 5.3 대시보드 API

##### GET /api/dashboard/summary
- 응답 (갱신 통계 포함):
  ```json
  {
    "inventory": {...},
    "quotations": {...},
    "recentTransactions": [...],
    "totalProducts": 500,
    "lastScrapeAt": "2024-01-15T10:30:00Z",
    "significantPriceChanges": 25,
    "scraping": {
      "total": 1000,
      "success": 950,
      "failed": 50,
      "successRate": 95.0,
      "recent": [...]
    }
  }
  ```

---

## 6. 자동화 제안

### 6.1 예약된 갱신

```typescript
// 매일 오전 9시 자동 갱신
@Cron('0 9 * * *')
async scheduleDailyRefresh() {
  await this.productRefreshService.refreshAllProducts('system');
}

// 매시간 중요 제품 갱신
@Cron('0 * * * *')
async scheduleHourlyRefresh() {
  const criticalProducts = await this.productRepo.find({
    where: {
      alertThreshold: { stockMin: LessThan(100) }
    }
  });
  const productIds = criticalProducts.map(p => p.id);
  await this.productRefreshService.refreshMultipleProducts(
    productIds,
    'system'
  );
}
```

### 6.2 견적서 승인 자동 재고 예약

```typescript
// 견적서 상태 변경 감지 시 자동 재고 예약
@On('quotation.status.updated')
async onQuotationStatusChanged(event) {
  if (event.newStatus === 'approved') {
    await this.quotationInventoryService.reserveStock(
      event.quotationId,
      'system'
    );
  } else if (event.newStatus === 'cancelled') {
    await this.quotationInventoryService.releaseStock(
      event.quotationId,
      'system'
    );
  }
}
```

---

## 7. 사용자 가이드

### 7.1 제품 정보 갱신

#### 단일 제품 갱신
1. 제품 상세 페이지 이동
2. "정보 갱신" 버튼 클릭
3. 갱신 완료 시 표시 확인
4. 갱신 내역에서 상세 확인

#### 복수 제품 갱신
1. 제품 목록 페이지 이동
2. 갱신할 제품 선택
3. "선택 항목 갱신" 버튼 클릭
4. 갱신 완료 시 결과 확인

#### 전체 제품 갱신
1. 대시보드 페이지 이동
2. "전체 갱신" 버튼 클릭
3. 갱신 진행 상황 확인
4. 갱신 완료 시 통계 확인

### 7.2 견적서와 재고

#### 견적서 생성 시 재고 확인
1. 새 견적서 생성
2. 제품 추가 시 실시간 재고 확인
3. 재고 부족 시 경고 표시

#### 견적서 승인 시 재고 예약
1. 견적서 상세 페이지 이동
2. 상태를 "승인"으로 변경
3. 자동으로 재고 예약 처리
4. 재고 현황에서 변화 확인

#### 견적서 취소 시 재고 해제
1. 견적서 상세 페이지 이동
2. 상태를 "취소"로 변경
3. 자동으로 재고 해제 처리
4. 재고 현황에서 복구 확인

### 7.3 고객 정보

#### 고객별 견적서 확인
1. 고객 상세 페이지 이동
2. "견적서 내역" 탭 클릭
3. 전체 견적서 기록 확인

#### 고객 통계 확인
1. 고객 상세 페이지 이동
2. "통계" 탭 클릭
3. 승인률, 평균 견적 금액 등 확인

---

## 8. 기술 스택

### 백엔드
- **Framework**: NestJS
- **ORM**: TypeORM
- **Database**: PostgreSQL
- **Scheduler**: NestJS Schedule (Cron)
- **Caching**: Redis (제안)

### 프론트엔드
- **Framework**: React
- **State Management**: TanStack Query
- **Routing**: React Router
- **UI Components**: Custom Components with Tailwind CSS
- **Icons**: Lucide React

---

## 9. API 엔드포인트 요약

| 엔드포인트 | 메서드 | 설명 |
|-----------|---------|------|
| `/api/products/:id/refresh` | POST | 단일 제품 갱신 |
| `/api/products/refresh/multiple` | POST | 복수 제품 갱신 |
| `/api/products/refresh/all` | POST | 전체 제품 갱신 |
| `/api/products/refresh/site/:site` | POST | 사이트별 갱신 |
| `/api/products/:id/history` | GET | 제품 갱신 내역 |
| `/api/products/history/recent` | GET | 최근 갱신 내역 |
| `/api/products/history/stats` | GET | 갱신 통계 |
| `/api/products/history/failed` | GET | 실패 갱신 내역 |
| `/quotations/:id/reserve-stock` | POST | 재고 예약 |
| `/quotations/:id/release-stock` | POST | 재고 해제 |
| `/quotations/:id/stock-availability` | GET | 재고 가용성 확인 |
| `/customers/:id/quotations` | GET | 고객 견적서 기록 |
| `/customers/:id/stats` | GET | 고객 통계 |
| `/customers/:id/activity` | GET | 고객 최근 활동 |
| `/customers/:id/top-products` | GET | 고객 인기 제품 |
| `/customers/:id/timeline` | GET | 고객 타임라인 |
| `/warehouses/:id/products` | GET | 창고 제품 목록 |
| `/warehouses/:id/summary` | GET | 창고 요약 |
| `/warehouses/:id/products/search` | GET | 창고 제품 검색 |
| `/products/:id/locations` | GET | 제품 창고 위치 |
| `/warehouses/all/products` | GET | 전체 창고 제품 |

---

## 10. 성능 최적화 제안

### 10.1 캐싱
- 제품 정보 캐싱 (TTL: 5분)
- 재고 정보 캐싱 (TTL: 1분)
- 갱신 내역 캐싱 (TTL: 10분)

### 10.2 배치 처리
- 대량 갱신 시 배치 처리 (100개 단위)
- 갱신 내역 배치 저장

### 10.3 비동기 처리
- 갱신 요청을 큐에 추가
- 백그라운드 워커로 처리
- 결과를 웹소켓으로 전송

### 10.4 인덱싱
```sql
-- 갱신 내역 인덱스
CREATE INDEX idx_scraping_history_product ON scraping_history(productId, scrapedAt DESC);
CREATE INDEX idx_scraping_history_success ON scraping_history(success, scrapedAt DESC);
CREATE INDEX idx_scraping_history_trigger ON scraping_history(triggerType, scrapedAt DESC);

-- 제품 인덱스
CREATE INDEX idx_product_last_scraped ON product(lastScrapedAt DESC);

-- 견적서 인덱스
CREATE INDEX idx_quotation_customer ON quotation(customerId, createdAt DESC);
```

---

## 11. 테스트 계획

### 11.1 단위 테스트
- [ ] ScrapingHistoryService 테스트
- [ ] ProductRefreshService 테스트
- [ ] QuotationInventoryService 테스트
- [ ] CustomerHistoryService 테스트
- [ ] WarehouseProductService 테스트

### 11.2 통합 테스트
- [ ] 제품 갱신 흐름 테스트
- [ ] 견적서 승인 및 재고 예약 테스트
- [ ] 고객 통계 계산 테스트
- [ ] 창고 제품 조회 테스트

### 11.3 E2E 테스트
- [ ] 제품 갱신 버튼 클릭 테스트
- [ ] 갱신 내역 패널 테스트
- [ ] 견적서 승인 후 재고 확인 테스트
- [ ] 고객 통계 확인 테스트
- [ ] 창고 제품 검색 테스트

---

## 12. 향후 개선 사항

### 12.1 단기 (1-2주)
- [ ] 웹소켓을 통한 실시간 갱신 상태 전송
- [ ] 갱신 예약 기능
- [ ] 갱신 실패 시 재시도 로직
- [ ] 갱진 내역 검색 및 필터링 고도화

### 12.2 중기 (1개월)
- [ ] 여러 사이트 동시 갱신
- [ ] 갱신 우선순위 설정
- [ ] 갱신 알림 설정 (이메일, 웹훅)
- [ ] 갱진 히트맵 및 가시성

### 12.3 장기 (3개월 이상)
- [ ] AI 기반 갱신 시간 최적화
- [ ] 예측적 재고 관리
- [ ] 자동 견적서 생성 추천
- [ ] 고객 행동 분석 및 인사이트
