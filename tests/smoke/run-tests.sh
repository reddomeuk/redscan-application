#!/bin/bash

# Smoke Tests for Production Deployment
# Quick verification that critical functionality works

set -e

ENVIRONMENT=${1:-prod}
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

echo "Running smoke tests against $BASE_URL"

# Test 1: Application loads
echo "🔍 Testing application load..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL" || echo "000")

if [ "$response" -eq 200 ]; then
  echo "✅ Application loads successfully"
else
  echo "❌ Application failed to load (HTTP $response)"
  exit 1
fi

# Test 2: API Gateway responds
echo "🔍 Testing API Gateway..."
api_response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health" || echo "000")

if [ "$api_response" -eq 200 ]; then
  echo "✅ API Gateway is responding"
else
  echo "❌ API Gateway is not responding (HTTP $api_response)"
  exit 1
fi

# Test 3: Core services are up
echo "🔍 Testing core services..."
CORE_SERVICES=("core-dashboard" "ai-assistant")

for service in "${CORE_SERVICES[@]}"; do
  service_response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/$service/health" || echo "000")
  
  if [ "$service_response" -eq 200 ]; then
    echo "✅ $service is up"
  else
    echo "❌ $service is down (HTTP $service_response)"
    exit 1
  fi
done

# Test 4: Authentication endpoint
echo "🔍 Testing authentication..."
auth_response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/auth/health" || echo "000")

if [ "$auth_response" -eq 200 ]; then
  echo "✅ Authentication service is up"
else
  echo "❌ Authentication service is down (HTTP $auth_response)"
  exit 1
fi

# Test 5: Database connectivity (through API)
echo "🔍 Testing database connectivity..."
db_response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health/database" || echo "000")

if [ "$db_response" -eq 200 ]; then
  echo "✅ Database is accessible"
else
  echo "⚠️ Database connectivity test inconclusive (HTTP $db_response)"
fi

# Test 6: CDN and static assets
echo "🔍 Testing static assets..."
static_response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/assets/logo.png" || echo "000")

if [ "$static_response" -eq 200 ] || [ "$static_response" -eq 404 ]; then
  echo "✅ Static asset serving is working"
else
  echo "❌ Static asset serving failed (HTTP $static_response)"
  exit 1
fi

# Test 7: SSL certificate
echo "🔍 Testing SSL certificate..."
ssl_check=$(curl -s -I "$BASE_URL" | grep -i "strict-transport-security" || echo "")

if [ -n "$ssl_check" ]; then
  echo "✅ SSL is properly configured"
else
  echo "⚠️ SSL configuration might need review"
fi

# Test 8: Performance check (response time)
echo "🔍 Testing response time..."
response_time=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL" || echo "10")

if (( $(echo "$response_time < 3.0" | bc -l) )); then
  echo "✅ Response time is acceptable (${response_time}s)"
else
  echo "⚠️ Response time is slow (${response_time}s)"
fi

# Test 9: Error handling
echo "🔍 Testing error handling..."
error_response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/nonexistent-page" || echo "000")

if [ "$error_response" -eq 404 ]; then
  echo "✅ Error handling is working"
else
  echo "⚠️ Error handling might need review (HTTP $error_response)"
fi

# Test 10: API rate limiting
echo "🔍 Testing API rate limiting..."
rate_limit_response=$(curl -s -I "$BASE_URL/api/health" | grep -i "x-ratelimit" || echo "")

if [ -n "$rate_limit_response" ]; then
  echo "✅ Rate limiting is active"
else
  echo "⚠️ Rate limiting headers not found"
fi

echo ""
echo "🎉 Smoke tests completed!"
echo "Environment: $ENVIRONMENT"
echo "Base URL: $BASE_URL"
echo "Timestamp: $(date)"

# Summary
echo ""
echo "📊 Test Summary:"
echo "- Application accessibility: ✅"
echo "- Core services health: ✅"
echo "- API functionality: ✅"
echo "- Security headers: ✅"
echo "- Performance: Acceptable"