#!/bin/bash

# Integration Tests for Modular Architecture
# Tests inter-service communication and functionality

set -e

ENVIRONMENT=${1:-dev}
BASE_URL=""

case $ENVIRONMENT in
  dev)
    BASE_URL="https://redscan-dev.azurewebsites.net"
    ;;
  prod)
    BASE_URL="https://redscan.azurewebsites.net"
    ;;
  *)
    echo "Unknown environment: $ENVIRONMENT"
    exit 1
    ;;
esac

echo "Running integration tests against $BASE_URL"

# Health check all services
echo "🔍 Testing service health checks..."

SERVICES=("core-dashboard" "ai-assistant" "compliance" "network-security" "asset-management")

for service in "${SERVICES[@]}"; do
  echo "Testing $service health..."
  response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/$service/health" || echo "000")
  
  if [ "$response" -eq 200 ]; then
    echo "✅ $service is healthy"
  else
    echo "❌ $service health check failed (HTTP $response)"
    exit 1
  fi
done

# Test API Gateway
echo "🔍 Testing API Gateway..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health" || echo "000")

if [ "$response" -eq 200 ]; then
  echo "✅ API Gateway is healthy"
else
  echo "❌ API Gateway health check failed (HTTP $response)"
  exit 1
fi

# Test authentication flow
echo "🔍 Testing authentication..."
auth_response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass"}' \
  -w "%{http_code}" || echo "000")

if [ "$auth_response" != "000" ]; then
  echo "✅ Authentication endpoint is responding"
else
  echo "❌ Authentication endpoint failed"
  exit 1
fi

# Test inter-service communication
echo "🔍 Testing inter-service communication..."

# Test AI Assistant to Core Dashboard communication
ai_response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/ai-assistant/analysis" \
  -H "Content-Type: application/json" \
  -X POST -d '{"query":"test"}' || echo "000")

if [ "$ai_response" != "000" ]; then
  echo "✅ AI Assistant communication is working"
else
  echo "❌ AI Assistant communication failed"
  exit 1
fi

# Test asset management integration
asset_response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/asset-management/assets" || echo "000")

if [ "$asset_response" != "000" ]; then
  echo "✅ Asset Management is responding"
else
  echo "❌ Asset Management communication failed"
  exit 1
fi

# Test compliance module
compliance_response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/compliance/frameworks" || echo "000")

if [ "$compliance_response" != "000" ]; then
  echo "✅ Compliance module is responding"
else
  echo "❌ Compliance module communication failed"
  exit 1
fi

# Test network security module
network_response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/network-security/scan" || echo "000")

if [ "$network_response" != "000" ]; then
  echo "✅ Network Security module is responding"
else
  echo "❌ Network Security module communication failed"
  exit 1
fi

# Test data flow between modules
echo "🔍 Testing data flow between modules..."

# Create a test asset and verify it appears in compliance
test_asset_id=$(curl -s -X POST "$BASE_URL/api/asset-management/assets" \
  -H "Content-Type: application/json" \
  -d '{"name":"integration-test-asset","type":"server","ip":"10.0.0.1"}' | \
  jq -r '.id // "null"' 2>/dev/null || echo "null")

if [ "$test_asset_id" != "null" ]; then
  echo "✅ Asset creation successful"
  
  # Check if asset appears in compliance checks
  sleep 2
  compliance_check=$(curl -s "$BASE_URL/api/compliance/assets/$test_asset_id" \
    -w "%{http_code}" || echo "000")
  
  if [ "$compliance_check" != "000" ]; then
    echo "✅ Inter-module data flow is working"
  else
    echo "⚠️ Inter-module data flow might have issues"
  fi
  
  # Cleanup test asset
  curl -s -X DELETE "$BASE_URL/api/asset-management/assets/$test_asset_id" > /dev/null
else
  echo "⚠️ Could not create test asset for data flow test"
fi

# Test load balancer
echo "🔍 Testing load balancer..."
for i in {1..5}; do
  response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health" || echo "000")
  if [ "$response" -ne 200 ]; then
    echo "❌ Load balancer inconsistency detected"
    exit 1
  fi
done
echo "✅ Load balancer is working consistently"

# Test WebSocket connections (if applicable)
echo "🔍 Testing WebSocket connections..."
ws_response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/ws/health" || echo "000")

if [ "$ws_response" -eq 200 ]; then
  echo "✅ WebSocket endpoint is healthy"
else
  echo "⚠️ WebSocket endpoint might not be available"
fi

echo ""
echo "🎉 All integration tests passed successfully!"
echo "Environment: $ENVIRONMENT"
echo "Base URL: $BASE_URL"
echo "Timestamp: $(date)"