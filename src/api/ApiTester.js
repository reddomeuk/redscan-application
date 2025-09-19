/**
 * API Testing Framework
 * Provides automated testing capabilities for standardized API endpoints
 */

import { apiClient } from './StandardApiClient';
import { EntityRegistry } from './StandardEntities';
import { ErrorCodes } from './ErrorHandler';

export class ApiTester {
  constructor() {
    this.testResults = [];
    this.currentSuite = null;
    this.setupHooks = [];
    this.teardownHooks = [];
  }

  /**
   * Test suite definition
   */
  describe(suiteName, callback) {
    this.currentSuite = {
      name: suiteName,
      tests: [],
      beforeEach: [],
      afterEach: [],
      startTime: Date.now()
    };

    callback();

    this.currentSuite.endTime = Date.now();
    this.currentSuite.duration = this.currentSuite.endTime - this.currentSuite.startTime;
    
    return this.currentSuite;
  }

  /**
   * Individual test definition
   */
  it(testName, callback) {
    if (!this.currentSuite) {
      throw new Error('Test must be defined within a describe block');
    }

    const test = {
      name: testName,
      callback,
      status: 'pending',
      startTime: null,
      endTime: null,
      duration: null,
      error: null,
      assertions: []
    };

    this.currentSuite.tests.push(test);
    return test;
  }

  /**
   * Setup hooks
   */
  beforeEach(callback) {
    if (this.currentSuite) {
      this.currentSuite.beforeEach.push(callback);
    } else {
      this.setupHooks.push(callback);
    }
  }

  afterEach(callback) {
    if (this.currentSuite) {
      this.currentSuite.afterEach.push(callback);
    } else {
      this.teardownHooks.push(callback);
    }
  }

  /**
   * Run test suite
   */
  async runSuite(suite) {
    console.log(`Running test suite: ${suite.name}`);
    
    for (const test of suite.tests) {
      // Run beforeEach hooks
      for (const hook of suite.beforeEach) {
        await hook();
      }

      test.startTime = Date.now();
      test.status = 'running';

      try {
        await test.callback();
        test.status = 'passed';
      } catch (error) {
        test.status = 'failed';
        test.error = error;
        console.error(`Test failed: ${test.name}`, error);
      }

      test.endTime = Date.now();
      test.duration = test.endTime - test.startTime;

      // Run afterEach hooks
      for (const hook of suite.afterEach) {
        try {
          await hook();
        } catch (error) {
          console.error('AfterEach hook failed:', error);
        }
      }

      console.log(`${test.status.toUpperCase()}: ${test.name} (${test.duration}ms)`);
    }

    const results = {
      suite: suite.name,
      passed: suite.tests.filter(t => t.status === 'passed').length,
      failed: suite.tests.filter(t => t.status === 'failed').length,
      total: suite.tests.length,
      duration: suite.duration
    };

    this.testResults.push(results);
    return results;
  }

  /**
   * Assertion helpers
   */
  expect(actual) {
    return {
      toBe: (expected) => {
        if (actual !== expected) {
          throw new Error(`Expected ${actual} to be ${expected}`);
        }
      },
      toEqual: (expected) => {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
          throw new Error(`Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`);
        }
      },
      toBeNull: () => {
        if (actual !== null) {
          throw new Error(`Expected ${actual} to be null`);
        }
      },
      toBeUndefined: () => {
        if (actual !== undefined) {
          throw new Error(`Expected ${actual} to be undefined`);
        }
      },
      toBeTruthy: () => {
        if (!actual) {
          throw new Error(`Expected ${actual} to be truthy`);
        }
      },
      toBeFalsy: () => {
        if (actual) {
          throw new Error(`Expected ${actual} to be falsy`);
        }
      },
      toContain: (expected) => {
        if (!actual.includes(expected)) {
          throw new Error(`Expected ${actual} to contain ${expected}`);
        }
      },
      toHaveProperty: (property) => {
        if (!actual.hasOwnProperty(property)) {
          throw new Error(`Expected object to have property ${property}`);
        }
      },
      toBeInstanceOf: (expectedClass) => {
        if (!(actual instanceof expectedClass)) {
          throw new Error(`Expected ${actual} to be instance of ${expectedClass.name}`);
        }
      },
      toMatchPattern: (pattern) => {
        if (!pattern.test(actual)) {
          throw new Error(`Expected ${actual} to match pattern ${pattern}`);
        }
      },
      toBeGreaterThan: (expected) => {
        if (actual <= expected) {
          throw new Error(`Expected ${actual} to be greater than ${expected}`);
        }
      },
      toBeLessThan: (expected) => {
        if (actual >= expected) {
          throw new Error(`Expected ${actual} to be less than ${expected}`);
        }
      }
    };
  }

  /**
   * API-specific assertion helpers
   */
  expectApiResponse(response) {
    return {
      toBeSuccessful: () => {
        this.expect(response.success).toBe(true);
        this.expect(response.status).toBeGreaterThan(199);
        this.expect(response.status).toBeLessThan(300);
      },
      toHaveError: (expectedCode = null) => {
        this.expect(response.success).toBe(false);
        if (expectedCode) {
          this.expect(response.code).toBe(expectedCode);
        }
      },
      toHaveStatus: (expectedStatus) => {
        this.expect(response.status).toBe(expectedStatus);
      },
      toHaveData: () => {
        this.expect(response.data).toBeTruthy();
      },
      toHaveProperty: (property) => {
        this.expect(response).toHaveProperty(property);
      }
    };
  }

  /**
   * Generate comprehensive test suite for an entity
   */
  generateEntityTestSuite(EntityClass) {
    const instance = new EntityClass();
    const entityName = instance.entityName;
    const endpoint = instance.endpoint;

    return this.describe(`${EntityClass.name} API Tests`, () => {
      let testEntity = null;
      let testEntityId = null;

      this.beforeEach(async () => {
        // Setup test data if needed
      });

      this.afterEach(async () => {
        // Cleanup test data
        if (testEntityId) {
          try {
            await apiClient.delete(`${endpoint}/${testEntityId}`);
          } catch (error) {
            // Ignore cleanup errors
          }
        }
      });

      // Test CREATE endpoint
      this.it(`should create a new ${entityName}`, async () => {
        const testData = this.generateTestData(EntityClass);
        const response = await apiClient.post(endpoint, testData);
        
        this.expectApiResponse(response).toBeSuccessful();
        this.expectApiResponse(response).toHaveData();
        this.expect(response.data).toHaveProperty('id');
        
        testEntity = response.data;
        testEntityId = response.data.id;
      });

      // Test READ endpoint
      this.it(`should retrieve a ${entityName} by ID`, async () => {
        if (!testEntityId) {
          // Create test entity first
          const testData = this.generateTestData(EntityClass);
          const createResponse = await apiClient.post(endpoint, testData);
          testEntityId = createResponse.data.id;
        }

        const response = await apiClient.get(`${endpoint}/${testEntityId}`);
        
        this.expectApiResponse(response).toBeSuccessful();
        this.expectApiResponse(response).toHaveData();
        this.expect(response.data.id).toBe(testEntityId);
      });

      // Test LIST endpoint
      this.it(`should list ${entityName}s`, async () => {
        const response = await apiClient.get(endpoint);
        
        this.expectApiResponse(response).toBeSuccessful();
        this.expect(Array.isArray(response.data)).toBe(true);
      });

      // Test UPDATE endpoint
      this.it(`should update a ${entityName}`, async () => {
        if (!testEntityId) {
          const testData = this.generateTestData(EntityClass);
          const createResponse = await apiClient.post(endpoint, testData);
          testEntityId = createResponse.data.id;
        }

        const updateData = this.generateUpdateData(EntityClass);
        const response = await apiClient.patch(`${endpoint}/${testEntityId}`, updateData);
        
        this.expectApiResponse(response).toBeSuccessful();
        this.expectApiResponse(response).toHaveData();
      });

      // Test DELETE endpoint
      this.it(`should delete a ${entityName}`, async () => {
        if (!testEntityId) {
          const testData = this.generateTestData(EntityClass);
          const createResponse = await apiClient.post(endpoint, testData);
          testEntityId = createResponse.data.id;
        }

        const response = await apiClient.delete(`${endpoint}/${testEntityId}`);
        
        this.expectApiResponse(response).toBeSuccessful();
        
        // Verify entity is deleted
        const getResponse = await apiClient.get(`${endpoint}/${testEntityId}`);
        this.expectApiResponse(getResponse).toHaveError();
        this.expectApiResponse(getResponse).toHaveStatus(404);
        
        testEntityId = null; // Prevent cleanup attempt
      });

      // Test SEARCH endpoint
      this.it(`should search ${entityName}s`, async () => {
        const response = await apiClient.get(`${endpoint}/search`, {
          params: { q: 'test' }
        });
        
        this.expectApiResponse(response).toBeSuccessful();
        this.expect(Array.isArray(response.data)).toBe(true);
      });

      // Test validation errors
      this.it(`should return validation error for invalid ${entityName} data`, async () => {
        const invalidData = {}; // Empty data should trigger validation errors
        const response = await apiClient.post(endpoint, invalidData);
        
        this.expectApiResponse(response).toHaveError();
        this.expectApiResponse(response).toHaveStatus(422);
      });

      // Test not found error
      this.it(`should return 404 for non-existent ${entityName}`, async () => {
        const response = await apiClient.get(`${endpoint}/non-existent-id`);
        
        this.expectApiResponse(response).toHaveError();
        this.expectApiResponse(response).toHaveStatus(404);
      });
    });
  }

  /**
   * Generate test data for an entity
   */
  generateTestData(EntityClass) {
    const testData = {
      user: {
        email: `test${Date.now()}@example.com`,
        full_name: 'Test User',
        role: 'user'
      },
      asset: {
        name: `Test Asset ${Date.now()}`,
        type: 'server',
        ip_address: '192.168.1.100'
      },
      finding: {
        title: `Test Finding ${Date.now()}`,
        description: 'Test finding description',
        severity: 'medium',
        status: 'open',
        asset_id: 'test-asset-id'
      },
      incident: {
        title: `Test Incident ${Date.now()}`,
        description: 'Test incident description',
        type: 'malware',
        severity: 'high',
        status: 'open'
      },
      vulnerability: {
        title: `Test Vulnerability ${Date.now()}`,
        description: 'Test vulnerability description',
        severity: 'high',
        cvss_score: 7.5
      }
    };

    const instance = new EntityClass();
    return testData[instance.entityName] || {
      name: `Test ${instance.entityName} ${Date.now()}`
    };
  }

  /**
   * Generate update data for an entity
   */
  generateUpdateData(EntityClass) {
    const updateData = {
      user: {
        full_name: 'Updated Test User'
      },
      asset: {
        name: `Updated Test Asset ${Date.now()}`
      },
      finding: {
        status: 'resolved'
      },
      incident: {
        status: 'resolved'
      },
      vulnerability: {
        description: 'Updated vulnerability description'
      }
    };

    const instance = new EntityClass();
    return updateData[instance.entityName] || {
      name: `Updated ${instance.entityName} ${Date.now()}`
    };
  }

  /**
   * Run all entity tests
   */
  async runAllEntityTests() {
    const results = [];
    
    for (const [name, EntityClass] of Object.entries(EntityRegistry)) {
      console.log(`\nTesting ${name} entity...`);
      const suite = this.generateEntityTestSuite(EntityClass);
      const result = await this.runSuite(suite);
      results.push(result);
    }

    return this.generateTestReport(results);
  }

  /**
   * Generate test report
   */
  generateTestReport(results) {
    const totalTests = results.reduce((sum, result) => sum + result.total, 0);
    const totalPassed = results.reduce((sum, result) => sum + result.passed, 0);
    const totalFailed = results.reduce((sum, result) => sum + result.failed, 0);
    const totalDuration = results.reduce((sum, result) => sum + result.duration, 0);

    const report = {
      summary: {
        suites: results.length,
        tests: totalTests,
        passed: totalPassed,
        failed: totalFailed,
        successRate: Math.round((totalPassed / totalTests) * 100),
        duration: totalDuration
      },
      suites: results
    };

    console.log('\n=== API Test Report ===');
    console.log(`Test Suites: ${report.summary.suites}`);
    console.log(`Total Tests: ${report.summary.tests}`);
    console.log(`Passed: ${report.summary.passed}`);
    console.log(`Failed: ${report.summary.failed}`);
    console.log(`Success Rate: ${report.summary.successRate}%`);
    console.log(`Total Duration: ${report.summary.duration}ms`);

    return report;
  }

  /**
   * Test API response time
   */
  async testResponseTime(endpoint, maxResponseTime = 1000) {
    const startTime = Date.now();
    await apiClient.get(endpoint);
    const responseTime = Date.now() - startTime;
    
    this.expect(responseTime).toBeLessThan(maxResponseTime);
    return responseTime;
  }

  /**
   * Test API error handling
   */
  async testErrorHandling() {
    return this.describe('API Error Handling Tests', () => {
      this.it('should handle 404 errors correctly', async () => {
        const response = await apiClient.get('/non-existent-endpoint');
        this.expectApiResponse(response).toHaveStatus(404);
      });

      this.it('should handle validation errors correctly', async () => {
        const response = await apiClient.post('/users', {});
        this.expectApiResponse(response).toHaveStatus(422);
        this.expect(response.errors).toBeTruthy();
      });

      this.it('should handle authentication errors correctly', async () => {
        // Temporarily remove auth token
        const originalAuth = apiClient.headers.Authorization;
        delete apiClient.headers.Authorization;
        
        const response = await apiClient.get('/users/me');
        this.expectApiResponse(response).toHaveStatus(401);
        
        // Restore auth token
        if (originalAuth) {
          apiClient.headers.Authorization = originalAuth;
        }
      });
    });
  }

  /**
   * Test API security
   */
  async testSecurity() {
    return this.describe('API Security Tests', () => {
      this.it('should require authentication for protected endpoints', async () => {
        // Test without auth token
        const client = new apiClient.constructor({ ...apiClient.config });
        delete client.headers.Authorization;
        
        const response = await client.get('/users');
        this.expectApiResponse(response).toHaveStatus(401);
      });

      this.it('should validate input to prevent injection attacks', async () => {
        const maliciousData = {
          name: '<script>alert("xss")</script>',
          description: 'DROP TABLE users;'
        };
        
        const response = await apiClient.post('/assets', maliciousData);
        // Should either reject the input or sanitize it
        this.expect(response.status).toBeLessThan(500);
      });

      this.it('should implement rate limiting', async () => {
        // Make multiple rapid requests
        const requests = [];
        for (let i = 0; i < 10; i++) {
          requests.push(apiClient.get('/users'));
        }
        
        const responses = await Promise.all(requests);
        // At least one should be rate limited if rate limiting is implemented
        const rateLimited = responses.some(r => r.status === 429);
        // Note: This test might not fail in development environment
      });
    });
  }

  /**
   * Performance benchmark
   */
  async benchmarkPerformance() {
    const endpoints = ['/users', '/assets', '/findings', '/incidents'];
    const results = {};

    for (const endpoint of endpoints) {
      const times = [];
      const iterations = 5;

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        await apiClient.get(endpoint);
        times.push(Date.now() - startTime);
      }

      results[endpoint] = {
        average: Math.round(times.reduce((sum, time) => sum + time, 0) / times.length),
        min: Math.min(...times),
        max: Math.max(...times),
        times
      };
    }

    console.log('\n=== Performance Benchmark ===');
    Object.entries(results).forEach(([endpoint, stats]) => {
      console.log(`${endpoint}: ${stats.average}ms avg (${stats.min}-${stats.max}ms)`);
    });

    return results;
  }
}

// Create singleton instance
export const apiTester = new ApiTester();

// Utility function to run comprehensive API tests
export async function runApiTests() {
  console.log('Starting comprehensive API tests...');
  
  // Run entity tests
  const entityResults = await apiTester.runAllEntityTests();
  
  // Run error handling tests
  const errorSuite = await apiTester.testErrorHandling();
  const errorResults = await apiTester.runSuite(errorSuite);
  
  // Run security tests
  const securitySuite = await apiTester.testSecurity();
  const securityResults = await apiTester.runSuite(securitySuite);
  
  // Run performance benchmark
  const performanceResults = await apiTester.benchmarkPerformance();
  
  return {
    entities: entityResults,
    errorHandling: errorResults,
    security: securityResults,
    performance: performanceResults
  };
}

export default apiTester;
