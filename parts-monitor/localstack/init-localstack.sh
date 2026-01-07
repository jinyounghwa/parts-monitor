#!/bin/bash

echo "Initializing LocalStack resources..."

# Wait for LocalStack to be ready
echo "Waiting for LocalStack to be ready..."
until curl -s http://localhost:4566/health > /dev/null 2>&1; do
  echo "LocalStack is not ready yet..."
  sleep 2
done
echo "LocalStack is ready!"

# Create S3 buckets
aws s3 mb s3://parts-monitor-screenshots \
  --endpoint-url=http://localhost:4566 \
  --region ap-northeast-2 \
  2>/dev/null || echo "S3 bucket parts-monitor-screenshots may already exist"

aws s3 mb s3://parts-inventory-files \
  --endpoint-url=http://localhost:4566 \
  --region ap-northeast-2 \
  2>/dev/null || echo "S3 bucket parts-inventory-files may already exist"

echo "S3 buckets created/verified"

# Verify email (SES - LocalStack auto-verifies)
echo "SES email verified (auto-verified in LocalStack)"

echo "LocalStack initialization complete!"
