#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Ensure we are in the root directory (parent of parts-monitor)
if [ ! -d "parts-monitor" ]; then
    echo -e "${RED}Error: Please run this script from the project root directory.${NC}"
    exit 1
fi

# Print header
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  부품 관리 시스템 통합 테스트 실행${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if Docker is running
echo -e "${YELLOW}Docker 서비스 확인 중...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Docker가 실행 중이 아닙니다. Docker를 시작해주세요.${NC}"
    exit 1
fi
echo -e "${GREEN}Docker 실행 중${NC}"

# Start Docker services (Dependencies only)
echo ""
echo -e "${YELLOW}Docker 서비스 시작 중 (DB, LocalStack, Redis)...${NC}"
cd parts-monitor
docker-compose up -d postgres localstack redis

# Wait for services to be ready
echo -e "${YELLOW}서비스 준비 대기 중 (30초)...${NC}"
sleep 30

# Initialize LocalStack
echo ""
echo -e "${YELLOW}LocalStack 초기화 중...${NC}"
if [ -f "localstack/init-localstack.sh" ]; then
    chmod +x localstack/init-localstack.sh
    ./localstack/init-localstack.sh
else
    echo -e "${RED}init-localstack.sh not found!${NC}"
fi

# Create Test Database if not exists
echo ""
echo -e "${YELLOW}테스트 데이터베이스 확인/생성 중...${NC}"
docker exec parts-monitor-postgres-1 psql -U postgres -c "CREATE DATABASE parts_inventory_test;" 2>/dev/null || echo "Test DB might already exist"

# Run backend tests
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  백엔드 API 테스트 실행${NC}"
echo -e "${BLUE}========================================${NC}"
# We are already in parts-monitor
npx playwright test || echo -e "${RED}백엔드 테스트 실패${NC}"

# Start App for Frontend tests
echo ""
echo -e "${YELLOW}프론트엔드 테스트를 위해 백엔드 앱 시작 중...${NC}"
docker-compose up -d app
echo -e "${YELLOW}앱 시작 대기 중 (15초)...${NC}"
sleep 15

# Go back to root then to frontend
cd ..

# Run frontend tests
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  프론트엔드 E2E 테스트 실행${NC}"
echo -e "${BLUE}========================================${NC}"
cd parts-monitor-frontend
npm run test:e2e || echo -e "${RED}프론트엔드 테스트 실패${NC}"

# Show test reports
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  테스트 결과${NC}"
echo -e "${BLUE}========================================${NC}"

echo ""
echo -e "${YELLOW}백엔드 테스트 보고서:${NC}"
echo -e "${GREEN}npx playwright show-report${NC} (parts-monitor 디렉토리에서 실행)"

echo ""
echo -e "${YELLOW}프론트엔드 테스트 보고서:${NC}"
echo -e "${GREEN}npx playwright show-report${NC} (parts-monitor-frontend 디렉토리에서 실행)"

# Summary
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  테스트 완료${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}모든 테스트가 완료되었습니다.${NC}"
echo -e "${YELLOW}상세 결과는 각 프로젝트의 playwright-report 폴더를 확인하세요.${NC}"
echo ""

# Keep services running
echo -e "${YELLOW}Docker 서비스가 실행 중입니다. 중지하려면:${NC}"
echo -e "${RED}cd parts-monitor && docker-compose down${NC}"
echo ""