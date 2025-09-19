import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up
    { duration: '5m', target: 10 }, // Stay at 10 users
    { duration: '2m', target: 20 }, // Ramp up to 20 users
    { duration: '5m', target: 20 }, // Stay at 20 users
    { duration: '2m', target: 0 },  // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
    http_req_failed: ['rate<0.1'],     // Error rate must be below 10%
    errors: ['rate<0.1'],              // Custom error rate below 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://redscan-dev.azurewebsites.net';

// Test scenarios
export default function () {
  // Test homepage load
  let response = http.get(`${BASE_URL}`);
  check(response, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage loads in acceptable time': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);

  sleep(1);

  // Test API health endpoint
  response = http.get(`${BASE_URL}/api/health`);
  check(response, {
    'API health status is 200': (r) => r.status === 200,
    'API health response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  sleep(1);

  // Test core dashboard module
  response = http.get(`${BASE_URL}/api/core-dashboard/health`);
  check(response, {
    'Core dashboard status is 200': (r) => r.status === 200,
    'Core dashboard response time < 1000ms': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);

  sleep(1);

  // Test AI assistant module
  response = http.get(`${BASE_URL}/api/ai-assistant/health`);
  check(response, {
    'AI assistant status is 200': (r) => r.status === 200,
    'AI assistant response time < 1000ms': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);

  sleep(2);

  // Test asset management
  response = http.get(`${BASE_URL}/api/asset-management/assets`);
  check(response, {
    'Asset management accessible': (r) => r.status === 200 || r.status === 401,
    'Asset management response time < 1500ms': (r) => r.timings.duration < 1500,
  }) || errorRate.add(1);

  sleep(1);

  // Test compliance module
  response = http.get(`${BASE_URL}/api/compliance/frameworks`);
  check(response, {
    'Compliance module accessible': (r) => r.status === 200 || r.status === 401,
    'Compliance response time < 1500ms': (r) => r.timings.duration < 1500,
  }) || errorRate.add(1);

  sleep(2);

  // Simulate user interaction with dashboard
  const dashboardPages = [
    '/dashboard',
    '/assets',
    '/compliance',
    '/security',
  ];

  const randomPage = dashboardPages[Math.floor(Math.random() * dashboardPages.length)];
  response = http.get(`${BASE_URL}${randomPage}`);
  check(response, {
    'Dashboard page loads': (r) => r.status === 200,
    'Dashboard page response time < 3000ms': (r) => r.timings.duration < 3000,
  }) || errorRate.add(1);

  sleep(3);
}

// Setup function
export function setup() {
  console.log('Starting performance tests...');
  console.log(`Target URL: ${BASE_URL}`);
  
  // Verify the application is accessible before starting tests
  const response = http.get(`${BASE_URL}/api/health`);
  if (response.status !== 200) {
    throw new Error(`Application not accessible: ${response.status}`);
  }
  
  return { baseUrl: BASE_URL };
}

// Teardown function
export function teardown(data) {
  console.log('Performance tests completed');
  console.log(`Base URL tested: ${data.baseUrl}`);
}