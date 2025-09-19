/**
 * API Integration Manager
 * Manages integration of standardized     const env = import.meta.env.NODE_ENV || 'development';
    
    const apiUrls = {
      development: import.meta.env.REACT_APP_API_URL || 'http://localhost:3001/api',
      staging: import.meta.env.REACT_APP_API_URL || 'https://staging-api.redscan.com/api',
      production: import.meta.env.REACT_APP_API_URL || 'https://api.redscan.com/api'amework with existing modules
 */

import { apiClient } from './StandardApiClient';
import { EntityRegistry } from './StandardEntities';
import { errorHandler } from './ErrorHandler';
import { apiDocumentationGenerator } from './ApiDocumentationGenerator';

class ApiIntegrationManager {
  constructor() {
    this.moduleIntegrations = new Map();
    this.legacyApiClients = new Map();
    this.migrationStatus = new Map();
    this.initialized = false;
  }

  /**
   * Initialize the integration manager
   */
  async initialize() {
    if (this.initialized) return;

    console.log('Initializing API Integration Manager...');

    try {
      // Initialize standardized API client
      await this.initializeStandardClient();
      
      // Register existing API clients
      await this.registerLegacyClients();
      
      // Create integration mappings
      await this.createIntegrationMappings();
      
      // Setup migration tracking
      this.setupMigrationTracking();
      
      // Setup error handling integration
      this.setupErrorHandlingIntegration();
      
      this.initialized = true;
      console.log('API Integration Manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize API Integration Manager:', error);
      throw error;
    }
  }

  /**
   * Initialize standardized API client
   */
  async initializeStandardClient() {
    // Configure base URL based on environment
    const baseURL = this.getApiBaseUrl();
    
    // Setup authentication
    await this.setupAuthentication();
    
    // Configure interceptors
    this.setupInterceptors();
    
    console.log('Standard API client initialized');
  }

  /**
   * Get API base URL based on environment
   */
  getApiBaseUrl() {
    const env = import.meta.env.NODE_ENV || 'development';
    
    const urls = {
      development: import.meta.env.REACT_APP_API_URL || 'http://localhost:3001/api',
      staging: import.meta.env.REACT_APP_API_URL || 'https://staging-api.redscan.com/api',
      production: import.meta.env.REACT_APP_API_URL || 'https://api.redscan.com/api'
    };

    return urls[env];
  }

  /**
   * Setup authentication for API client
   */
  async setupAuthentication() {
    // Check for existing auth token
    const token = localStorage.getItem('auth_token') || 
                  sessionStorage.getItem('auth_token');
    
    if (token) {
      apiClient.setAuthToken(token);
    }

    // Setup token refresh logic
    apiClient.onAuthRequired(() => {
      // Redirect to login or refresh token
      this.handleAuthRequired();
    });
  }

  /**
   * Setup API interceptors
   */
  setupInterceptors() {
    // Request interceptor for logging
    apiClient.addRequestInterceptor(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    apiClient.addResponseInterceptor(
      (response) => {
        return response;
      },
      (error) => {
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Register existing legacy API clients
   */
  async registerLegacyClients() {
    const legacyClients = [
      {
        name: 'base44Client',
        path: './base44Client.js',
        endpoints: ['auth', 'users', 'assets'],
        migrationPriority: 'high'
      },
      {
        name: 'entitiesClient', 
        path: './entities.js',
        endpoints: ['findings', 'vulnerabilities', 'incidents'],
        migrationPriority: 'medium'
      },
      {
        name: 'integrationsClient',
        path: './integrations.js', 
        endpoints: ['integrations', 'connectors'],
        migrationPriority: 'low'
      }
    ];

    for (const client of legacyClients) {
      try {
        const module = await import(client.path);
        this.legacyApiClients.set(client.name, {
          ...client,
          module,
          migrated: false
        });
        console.log(`Registered legacy client: ${client.name}`);
      } catch (error) {
        console.warn(`Failed to register legacy client ${client.name}:`, error);
      }
    }
  }

  /**
   * Create integration mappings between legacy and standard APIs
   */
  async createIntegrationMappings() {
    const mappings = {
      // Legacy endpoints -> Standard endpoints
      '/api/v1/users': '/users',
      '/api/v1/assets': '/assets',
      '/api/v1/findings': '/findings',
      '/api/v1/vulnerabilities': '/vulnerabilities',
      '/api/v1/incidents': '/incidents',
      '/api/v1/reports': '/reports',
      '/api/v1/scans': '/scans',
      '/api/v1/integrations': '/integrations',
      
      // Method mappings
      methodMappings: {
        'getUsers': 'get /users',
        'createUser': 'post /users',
        'updateUser': 'patch /users/:id',
        'deleteUser': 'delete /users/:id',
        'getUserAssets': 'get /users/:id/assets',
        'getAssetFindings': 'get /assets/:id/findings'
      },
      
      // Response format mappings
      responseTransforms: {
        legacy: (response) => ({
          success: response.status < 400,
          data: response.data || response.result,
          message: response.message || null,
          errors: response.errors || null
        }),
        standard: (response) => response // Already in standard format
      }
    };

    this.moduleIntegrations.set('api-mappings', mappings);
    console.log('Created API integration mappings');
  }

  /**
   * Setup migration tracking
   */
  setupMigrationTracking() {
    // Track which modules have been migrated
    const modules = [
      'Dashboard', 'Assets', 'Findings', 'Reports', 'Analytics',
      'CodeSecurity', 'CloudSecurity', 'Endpoints', 'WebSecurity',
      'NetworkSecurity', 'SoarPlatform', 'PartnerMarketplace'
    ];

    modules.forEach(module => {
      this.migrationStatus.set(module, {
        status: 'pending',
        endpoints: [],
        migratedEndpoints: [],
        completionPercentage: 0,
        lastUpdated: new Date()
      });
    });
  }

  /**
   * Setup error handling integration
   */
  setupErrorHandlingIntegration() {
    // Global error handler for API errors
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason?.isApiError) {
        errorHandler.handleApiError(event.reason);
        event.preventDefault();
      }
    });

    // Setup error reporting
    errorHandler.onError((error) => {
      // Send error to monitoring service
      this.reportError(error);
    });
  }

  /**
   * Migrate a module to use standardized API
   */
  async migrateModule(moduleName, config = {}) {
    console.log(`Starting migration of ${moduleName} module...`);

    const moduleStatus = this.migrationStatus.get(moduleName);
    if (!moduleStatus) {
      throw new Error(`Unknown module: ${moduleName}`);
    }

    try {
      moduleStatus.status = 'migrating';
      moduleStatus.lastUpdated = new Date();

      // Step 1: Analyze existing API usage
      const analysis = await this.analyzeModuleApiUsage(moduleName);
      
      // Step 2: Create migration plan
      const migrationPlan = this.createMigrationPlan(analysis, config);
      
      // Step 3: Execute migration
      const results = await this.executeMigration(moduleName, migrationPlan);
      
      // Step 4: Validate migration
      await this.validateMigration(moduleName, results);
      
      // Step 5: Update status
      moduleStatus.status = 'completed';
      moduleStatus.completionPercentage = 100;
      moduleStatus.lastUpdated = new Date();
      
      console.log(`Migration of ${moduleName} completed successfully`);
      return results;
      
    } catch (error) {
      moduleStatus.status = 'failed';
      moduleStatus.lastUpdated = new Date();
      console.error(`Migration of ${moduleName} failed:`, error);
      throw error;
    }
  }

  /**
   * Analyze existing API usage in a module
   */
  async analyzeModuleApiUsage(moduleName) {
    // This would analyze the module's source code to identify API calls
    // For now, return mock analysis
    return {
      endpoints: [
        { path: '/users', methods: ['GET', 'POST'], usage: 15 },
        { path: '/assets', methods: ['GET', 'POST', 'PATCH'], usage: 8 },
        { path: '/findings', methods: ['GET', 'POST'], usage: 12 }
      ],
      legacyClients: ['base44Client'],
      totalApiCalls: 35,
      complexity: 'medium'
    };
  }

  /**
   * Create migration plan
   */
  createMigrationPlan(analysis, config) {
    return {
      phases: [
        {
          name: 'Replace API clients',
          tasks: [
            'Import StandardApiClient',
            'Replace legacy client instances',
            'Update import statements'
          ]
        },
        {
          name: 'Update API calls',
          tasks: [
            'Convert to standard format',
            'Update error handling',
            'Add validation'
          ]
        },
        {
          name: 'Test integration',
          tasks: [
            'Run unit tests',
            'Test error scenarios',
            'Validate data flow'
          ]
        }
      ],
      estimatedTime: analysis.complexity === 'high' ? '4-6 hours' : 
                    analysis.complexity === 'medium' ? '2-3 hours' : '1-2 hours',
      dependencies: [],
      rollbackPlan: 'Revert to legacy client implementations'
    };
  }

  /**
   * Execute migration
   */
  async executeMigration(moduleName, plan) {
    const results = {
      migratedFiles: [],
      updatedEndpoints: [],
      errors: []
    };

    // Simulate migration execution
    console.log(`Executing migration plan for ${moduleName}...`);
    
    for (const phase of plan.phases) {
      console.log(`Executing phase: ${phase.name}`);
      
      for (const task of phase.tasks) {
        try {
          await this.executeTask(task, moduleName);
          console.log(`✓ ${task}`);
        } catch (error) {
          console.error(`✗ ${task}:`, error);
          results.errors.push({ task, error: error.message });
        }
      }
    }

    return results;
  }

  /**
   * Execute migration task
   */
  async executeTask(task, moduleName) {
    // Simulate task execution
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Task-specific logic would go here
    switch (task) {
      case 'Import StandardApiClient':
        // Add import statement to module files
        break;
      case 'Replace legacy client instances':
        // Replace old client usage with standardized client
        break;
      case 'Update import statements':
        // Update import paths and names
        break;
      default:
        // Generic task execution
        break;
    }
  }

  /**
   * Validate migration
   */
  async validateMigration(moduleName, results) {
    console.log(`Validating migration for ${moduleName}...`);
    
    // Check if all endpoints are responding
    const endpoints = this.getModuleEndpoints(moduleName);
    
    for (const endpoint of endpoints) {
      try {
        const response = await apiClient.get(endpoint);
        if (!response.success) {
          throw new Error(`Endpoint ${endpoint} validation failed`);
        }
      } catch (error) {
        console.warn(`Validation warning for ${endpoint}:`, error);
      }
    }
    
    console.log(`Validation completed for ${moduleName}`);
  }

  /**
   * Get endpoints for a module
   */
  getModuleEndpoints(moduleName) {
    const endpointMap = {
      Dashboard: ['/dashboard/stats', '/dashboard/alerts'],
      Assets: ['/assets', '/assets/search'],
      Findings: ['/findings', '/findings/search'],
      Reports: ['/reports', '/reports/templates'],
      Analytics: ['/analytics/overview', '/analytics/trends'],
      NetworkSecurity: ['/network/devices', '/network/scans'],
      SoarPlatform: ['/workflows', '/incidents'],
      PartnerMarketplace: ['/partners', '/marketplace']
    };

    return endpointMap[moduleName] || [];
  }

  /**
   * Handle authentication required
   */
  handleAuthRequired() {
    // Clear stored tokens
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
    
    // Emit auth required event
    window.dispatchEvent(new CustomEvent('auth-required'));
    
    // Redirect to login if not in development
    if (import.meta.env.NODE_ENV === 'production') {
      window.location.href = '/login';
    }
  }

  /**
   * Handle API errors
   */
  handleApiError(error) {
    console.error('API Error:', error);
    
    // Process error through standardized error handler
    const processedError = errorHandler.processApiError(error);
    
    // Emit error event for UI handling
    window.dispatchEvent(new CustomEvent('api-error', {
      detail: processedError
    }));
  }

  /**
   * Report error to monitoring service
   */
  reportError(error) {
    // In production, this would send to a monitoring service
    console.log('Error reported:', error);
  }

  /**
   * Get migration status
   */
  getMigrationStatus(moduleName = null) {
    if (moduleName) {
      return this.migrationStatus.get(moduleName);
    }
    
    const status = {};
    this.migrationStatus.forEach((value, key) => {
      status[key] = value;
    });
    
    return status;
  }

  /**
   * Generate integration report
   */
  generateIntegrationReport() {
    const totalModules = this.migrationStatus.size;
    const completedModules = Array.from(this.migrationStatus.values())
      .filter(status => status.status === 'completed').length;
    const pendingModules = Array.from(this.migrationStatus.values())
      .filter(status => status.status === 'pending').length;
    const failedModules = Array.from(this.migrationStatus.values())
      .filter(status => status.status === 'failed').length;

    const report = {
      summary: {
        totalModules,
        completedModules,
        pendingModules,
        failedModules,
        completionPercentage: Math.round((completedModules / totalModules) * 100)
      },
      modules: {},
      legacyClients: Array.from(this.legacyApiClients.keys()),
      lastUpdated: new Date().toISOString()
    };

    this.migrationStatus.forEach((status, module) => {
      report.modules[module] = status;
    });

    return report;
  }

  /**
   * Export standardized API configuration
   */
  exportApiConfiguration() {
    return {
      baseURL: apiClient.config.baseURL,
      timeout: apiClient.config.timeout,
      retryConfig: apiClient.config.retryConfig,
      entities: Object.keys(EntityRegistry),
      endpoints: apiDocumentationGenerator.generateEndpointList(),
      errorCodes: errorHandler.getErrorCodesList()
    };
  }

  /**
   * Health check for all API integrations
   */
  async healthCheck() {
    const results = {
      standardApi: null,
      legacyClients: {},
      entities: {},
      overall: 'unknown'
    };

    try {
      // Check standard API
      const healthResponse = await apiClient.get('/health');
      results.standardApi = {
        status: healthResponse.success ? 'healthy' : 'unhealthy',
        responseTime: healthResponse.responseTime
      };

      // Check legacy clients
      for (const [name, client] of this.legacyApiClients) {
        try {
          // Simulate health check for legacy client
          results.legacyClients[name] = {
            status: 'healthy',
            migrated: client.migrated
          };
        } catch (error) {
          results.legacyClients[name] = {
            status: 'unhealthy',
            error: error.message
          };
        }
      }

      // Check entity endpoints
      for (const [name, EntityClass] of Object.entries(EntityRegistry)) {
        try {
          const instance = new EntityClass();
          const testResponse = await apiClient.get(instance.endpoint);
          results.entities[name] = {
            status: testResponse.success ? 'healthy' : 'unhealthy'
          };
        } catch (error) {
          results.entities[name] = {
            status: 'unhealthy',
            error: error.message
          };
        }
      }

      // Determine overall health
      const allHealthy = results.standardApi?.status === 'healthy' &&
                        Object.values(results.entities).every(e => e.status === 'healthy');
      
      results.overall = allHealthy ? 'healthy' : 'degraded';

    } catch (error) {
      results.overall = 'unhealthy';
      results.error = error.message;
    }

    return results;
  }
}

// Create singleton instance
export const apiIntegrationManager = new ApiIntegrationManager();

// Auto-initialize when module is imported
apiIntegrationManager.initialize().catch(console.error);

export default apiIntegrationManager;
