# Parts Monitor

> 실시간 부품 재고 모니터링 및 견적서 관리 시스템

[![GitHub Repository](https://img.shields.io/badge/GitHub-jinyounghwa/parts--monitor-blue?logo=github)](https://github.com/jinyounghwa/parts-monitor)
[![License](https://img.shields.io/badge/License-MIT-green)]()

## 📋 목차

- [프로젝트 소개](#-프로젝트-소개)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [설치 및 실행](#-설치-및-실행)
- [LocalStack 설정](#localstack-설정)
- [개발 가이드](#-개발-가이드)
- [테스트](#-테스트)
- [배포](#-배포)
- [기여 방법](#-기여-방법)

## 🎯 프로젝트 소개

**Parts Monitor**는 전자 부품 재고를 실시간으로 모니터링하고, 웹사이트에서 가격 정보를 자동으로 수집하며, 견적서를 생성 및 관리할 수 있는 풀스택 웹 애플리케이션입니다.

### 핵심 기능

- **실시간 재고 모니터링**: 창고별 부품 재고 현황 시각화
- **자동 가격 모니터링**: Danawa, DigiKey, Mouser 등에서 부품 가격 자동 수집
- **스마트 알림**: 안전 재고 이하 시 이메일 알림 발송
- **견적서 관리**: PDF 생성 및 이메일 전송
- **3D 시각화**: Three.js를 활용한 부품 3D 시각화
- **분석 대시보드**: 재고 추세, 가격 변동 등 실시간 분석
- **데이터 임포트/익스포트**: Excel 파일로 대량 데이터 처리

## ✨ 주요 기능

### 백엔드 기능

| 모듈 | 설명 |
|------|------|
| **인증 (Auth)** | JWT 기반 사용자 인증 및 권한 관리 |
| **부품 관리 (Product)** | 부품 정보 등록, 수정, 삭제 및 가격 히스토리 관리 |
| **재고 관리 (Inventory)** | 실시간 재고 조회, 입고/출고 처리 |
| **웹 스크래핑 (Scraper)** | 자동 가격 수집 및 가격 변동 추적 |
| **대시보드 (Dashboard)** | 주요 지표 및 통계 조회 |
| **견적서 (Quotation)** | 견적서 생성, 수정, PDF 다운로드 및 이메일 전송 |
| **고객 관리 (Customer)** | 거래처 정보 관리 및 거래 이력 추적 |
| **창고 관리 (Warehouse)** | 창고별 재고 관리 및 분배 |
| **알림 (Notification)** | 이메일 및 시스템 알림 발송 |
| **스케줄러 (Scheduler)** | 주기적 가격 수집 및 자동 작업 |
| **큐 관리 (Queue)** | Bull Queue 기반 비동기 작업 처리 |
| **Excel 처리 (Excel)** | 대량 데이터 임포트/익스포트 |

### 프론트엔드 기능

- **대시보드**: 실시간 통계 및 3D 시각화
- **제품 관리**: 제품 목록, 상세 조회, 생성/수정/삭제
- **재고 관리**: 재고 현황 조회 및 조정
- **견적서 관리**: 견적서 작성, 조회, 발송
- **고객 관리**: 거래처 정보 및 거래 이력
- **창고 관리**: 창고별 재고 현황
- **알림**: 시스템 알림 및 가격 경고
- **모니터링**: 웹 스크래핑 작업 상태 조회
- **분석**: 차트를 통한 재고 및 가격 추세 분석

## 🛠️ 기술 스택

### 백엔드

```
프레임워크: NestJS (v10+)
언어: TypeScript
데이터베이스: PostgreSQL + TypeORM
캐시/큐: Redis + Bull
인증: JWT + Passport
외부 연동: AWS (S3, SES)
웹 스크래핑: Puppeteer
문서 생성: PDFKit, Handlebars, ExcelJS
테스트: Jest, Playwright
```

### 프론트엔드

```
프레임워크: Next.js 16 (App Router)
언어: TypeScript + React 19
스타일링: Tailwind CSS
상태 관리: React Query
3D 그래픽: Three.js + React Three Fiber
차트: Recharts
HTTP: Axios
테스트: Jest, Playwright
```

### DevOps

```
컨테이너: Docker
오케스트레이션: Docker Compose
로컬 클라우드: LocalStack
```

## 📁 프로젝트 구조

```
parts_monitor/                           # 루트 디렉토리
├── package.json                         # 루트 패키지 (monorepo)
├── .gitignore                          # Git 무시 규칙
├── README.md                           # 이 파일
│
├── parts-monitor/                      # 백엔드 (NestJS)
│   ├── src/
│   │   ├── main.ts                     # 애플리케이션 엔트리포인트
│   │   ├── app.module.ts               # 루트 모듈
│   │   ├── config/                     # 설정 파일
│   │   ├── common/                     # 공통 유틸리티
│   │   │   ├── filters/                # 예외 필터
│   │   │   ├── interceptors/           # 인터셉터
│   │   │   ├── guards/                 # 가드
│   │   │   └── utils/                  # 유틸리티
│   │   └── modules/                    # 기능 모듈 (14개)
│   │       ├── auth/                   # 인증
│   │       ├── product/                # 부품 관리
│   │       ├── inventory/              # 재고 관리
│   │       ├── scraper/                # 웹 스크래핑
│   │       ├── quotation/              # 견적서
│   │       ├── customer/               # 고객 관리
│   │       ├── warehouse/              # 창고 관리
│   │       ├── dashboard/              # 대시보드
│   │       ├── notification/           # 알림
│   │       ├── storage/                # AWS S3/SES
│   │       ├── scheduler/              # 스케줄러
│   │       ├── queue/                  # 큐 관리
│   │       ├── excel/                  # Excel 처리
│   │       └── monitoring/             # 헬스 체크
│   ├── tests/                          # E2E 테스트
│   ├── test/                           # Jest 테스트
│   ├── package.json                    # 백엔드 의존성
│   ├── tsconfig.json                   # TypeScript 설정
│   ├── nest-cli.json                   # NestJS CLI 설정
│   └── playwright.config.ts            # Playwright 설정
│
├── parts-monitor-frontend/             # 프론트엔드 (Next.js)
│   ├── src/
│   │   ├── app/                        # Next.js App Router
│   │   │   ├── auth/                   # 인증 페이지
│   │   │   ├── dashboard/              # 대시보드
│   │   │   ├── products/               # 제품 페이지
│   │   │   ├── inventory/              # 재고 페이지
│   │   │   ├── quotations/             # 견적서 페이지
│   │   │   ├── customers/              # 고객 페이지
│   │   │   ├── warehouses/             # 창고 페이지
│   │   │   └── ...
│   │   ├── components/                 # React 컴포넌트
│   │   │   ├── ui/                     # UI 컴포넌트
│   │   │   └── canvas/                 # 3D 캔버스 컴포넌트
│   │   ├── context/                    # Context API
│   │   ├── lib/                        # 유틸리티 라이브러리
│   │   └── pages/                      # 레거시 페이지 라우터
│   ├── public/                         # 정적 파일
│   ├── tests/                          # E2E 테스트
│   ├── package.json                    # 프론트엔드 의존성
│   ├── tsconfig.json                   # TypeScript 설정
│   ├── next.config.ts                  # Next.js 설정
│   └── playwright.config.ts            # Playwright 설정
│
└── .github/                            # GitHub Actions (선택사항)
    └── workflows/                      # CI/CD 워크플로우
```

## 🚀 설치 및 실행

### 전제 조건

- **Node.js**: v18.0.0 이상
- **npm**: v9.0.0 이상
- **PostgreSQL**: v14 이상
- **Redis**: v7 이상
- **Docker** (선택): 로컬 환경 구성용

### 설치 방법

1. **저장소 클론**
   ```bash
   git clone https://github.com/jinyounghwa/parts-monitor.git
   cd parts_monitor
   ```

2. **의존성 설치**
   ```bash
   # 루트 디렉토리에서 모든 패키지 설치
   npm install

   # 또는 각 패키지별 설치
   cd parts-monitor && npm install && cd ..
   cd parts-monitor-frontend && npm install && cd ..
   ```

3. **환경 변수 설정**

   **백엔드 (.env)**
   ```bash
   cd parts-monitor
   cp .env.example .env
   # .env 파일에서 필요한 환경 변수 설정
   ```

   필수 환경 변수:
   ```
   # 데이터베이스
   DATABASE_URL=postgresql://user:password@localhost:5432/parts_monitor

   # 인증
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRATION=3600

   # AWS
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_S3_BUCKET=your_bucket_name

   # Redis
   REDIS_URL=redis://localhost:6379

   # 이메일
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_USER=your_email@example.com
   SMTP_PASSWORD=your_password
   ```

4. **프론트엔드 환경 변수 설정** (.env.local)
   ```bash
   cd ../parts-monitor-frontend

   # .env.local 파일 생성
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```

### 개발 모드 실행

**터미널 1: 백엔드 실행**
```bash
cd parts-monitor
npm run start:dev
```
- 백엔드: http://localhost:3000
- API 문서: http://localhost:3000/api/docs (Swagger)

**터미널 2: 프론트엔드 실행**
```bash
cd parts-monitor-frontend
npm run dev
```
- 프론트엔드: http://localhost:3001

### Docker로 실행

```bash
# Docker Compose 실행 (데이터베이스 + 애플리케이션)
docker-compose up -d
```

### LocalStack 설정

**LocalStack**은 AWS 서비스를 로컬 개발 환경에서 시뮬레이션하는 도구입니다. 이 프로젝트는 S3(파일 저장소)와 SES(이메일 서비스)를 LocalStack으로 에뮬레이션합니다.

#### LocalStack 소개

- **용도**: AWS 서비스를 로컬 환경에서 테스트
- **지원 서비스**: S3, SES, Lambda, DynamoDB, SNS, SQS 등
- **개발 장점**:
  - AWS 계정 없이 개발 가능
  - 비용 절감
  - 빠른 로컬 테스트
  - 실제 AWS와 동일한 API

#### LocalStack 실행

**docker-compose.yml에 이미 설정되어 있으므로:**

```bash
# LocalStack과 함께 모든 서비스 시작
docker-compose up -d

# LocalStack이 준비되었는지 확인
docker-compose logs localstack | grep "Ready"
```

#### LocalStack 포트 및 엔드포인트

```
LocalStack 관리 UI: http://localhost:4566
AWS 서비스 엔드포인트: http://localhost:4566

서비스별 포트:
- S3 (파일 저장소): 4566
- SES (이메일): 4566
- DynamoDB: 4566
```

#### 환경 변수 설정 (LocalStack 사용)

**백엔드 .env 파일에서:**
```
# AWS (LocalStack 연동)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_S3_BUCKET=parts-monitor
AWS_ENDPOINT_URL=http://localhost:4566

# SES 이메일 설정 (LocalStack)
AWS_SES_REGION=us-east-1
AWS_SES_FROM_EMAIL=noreply@parts-monitor.local
```

#### LocalStack 초기화

프로젝트에 포함된 초기화 스크립트를 실행합니다:

```bash
# LocalStack 초기화 (S3 버킷 생성, SES 설정)
docker-compose exec localstack bash /docker-entrypoint-initaws.d/init-localstack.sh

# 또는 수동으로 버킷 생성
aws s3 mb s3://parts-monitor \
  --endpoint-url http://localhost:4566 \
  --region us-east-1

# SES 이메일 검증 (로컬)
aws ses verify-email-identity \
  --email-address noreply@parts-monitor.local \
  --endpoint-url http://localhost:4566 \
  --region us-east-1
```

#### LocalStack 문제 해결

**LocalStack이 실행되지 않을 때:**
```bash
# 로그 확인
docker-compose logs localstack

# 컨테이너 재시작
docker-compose restart localstack

# 완전 초기화
docker-compose down -v
docker-compose up -d
```

**S3 파일 확인:**
```bash
# LocalStack에 저장된 파일 목록
aws s3 ls s3://parts-monitor \
  --endpoint-url http://localhost:4566 \
  --recursive
```

**SES 이메일 전송 테스트:**
```bash
# 테스트 이메일 발송
aws ses send-email \
  --from noreply@parts-monitor.local \
  --to test@example.com \
  --subject "Test Email" \
  --text "This is a test email from LocalStack" \
  --endpoint-url http://localhost:4566 \
  --region us-east-1
```

#### 개발 중 LocalStack 사용

- **파일 업로드 테스트**: 견적서 PDF, Excel 파일 등을 S3에 저장
- **이메일 발송 테스트**: SES를 통한 알림 메일, 견적서 이메일 발송
- **통합 테스트**: 실제 AWS 없이 AWS 연동 기능 테스트

## 👨‍💻 개발 가이드

### 코드 스타일

- **언어**: TypeScript (strict mode)
- **린터**: ESLint
- **포맷터**: Prettier
- **구조**: 모듈 기반 아키텍처

### 백엔드 개발

#### 새로운 모듈 생성
```bash
cd parts-monitor
nest g module modules/feature-name
nest g service modules/feature-name
nest g controller modules/feature-name
```

#### 데이터베이스 마이그레이션
```bash
# 마이그레이션 생성
npm run migration:create -- CreateFeatureTable

# 마이그레이션 실행
npm run migration:run

# 마이그레이션 롤백
npm run migration:revert
```

### 프론트엔드 개발

#### 새로운 페이지 생성
```bash
cd parts-monitor-frontend
# src/app/feature-name/page.tsx 생성
mkdir -p src/app/feature-name
touch src/app/feature-name/page.tsx
```

#### 컴포넌트 개발
```bash
# src/components/FeatureName.tsx 생성
touch src/components/FeatureName.tsx
```

### 커밋 메시지 규칙

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 스타일 변경 (포맷팅, 세미콜론 등)
refactor: 코드 리팩토링
perf: 성능 개선
test: 테스트 추가 또는 수정
chore: 빌드 설정, 패키지 매니저 등
```

## 🧪 테스트

### 백엔드 테스트

```bash
cd parts-monitor

# 유닛 테스트
npm run test

# 테스트 커버리지
npm run test:cov

# E2E 테스트
npm run test:e2e

# 모든 테스트 실행
npm run test:all
```

### 프론트엔드 테스트

```bash
cd parts-monitor-frontend

# 유닛 테스트
npm run test

# E2E 테스트 (headless 모드)
npm run test:e2e

# E2E 테스트 (UI 모드)
npm run test:e2e:ui
```

### 테스트 커버리지

- **백엔드**: 주요 모듈 80% 이상
- **프론트엔드**: 컴포넌트 및 페이지 70% 이상

## 📦 배포

### 프로덕션 빌드

**백엔드**
```bash
cd parts-monitor
npm run build
npm start
```

**프론트엔드**
```bash
cd parts-monitor-frontend
npm run build
npm start
```

### Docker 배포

```bash
# 이미지 빌드
docker build -t parts-monitor-backend ./parts-monitor
docker build -t parts-monitor-frontend ./parts-monitor-frontend

# 컨테이너 실행
docker run -p 3000:3000 parts-monitor-backend
docker run -p 3001:3001 parts-monitor-frontend
```

### 환경별 배포

- **개발**: `main` 브랜치 자동 배포
- **스테이징**: `staging` 브랜치 수동 배포
- **프로덕션**: Release 태그 생성 시 자동 배포

## 🤝 기여 방법

1. **Fork** 저장소
2. **Feature 브랜치 생성**: `git checkout -b feature/AmazingFeature`
3. **변경사항 커밋**: `git commit -m 'Add some AmazingFeature'`
4. **브랜치 푸시**: `git push origin feature/AmazingFeature`
5. **Pull Request** 생성

### PR 체크리스트

- [ ] 코드가 ESLint/Prettier 규칙을 따릅니다
- [ ] 테스트가 모두 통과합니다
- [ ] 새로운 기능에 대한 테스트가 작성되었습니다
- [ ] 문서가 업데이트되었습니다
- [ ] 커밋 메시지가 규칙을 따릅니다

## 📄 라이선스

이 프로젝트는 **MIT 라이선스** 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 지원

- **Issues**: [GitHub Issues](https://github.com/jinyounghwa/parts-monitor/issues)
- **Discussion**: [GitHub Discussions](https://github.com/jinyounghwa/parts-monitor/discussions)
- **Email**: timotolkie@gmail.com

## 🙏 감사의 말

이 프로젝트는 다음의 훌륭한 오픈소스 프로젝트들을 기반으로 합니다:

- [NestJS](https://nestjs.com/)
- [Next.js](https://nextjs.org/)
- [TypeORM](https://typeorm.io/)
- [Three.js](https://threejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Last Updated**: 2026년 1월 7일
**Version**: 1.0.0
