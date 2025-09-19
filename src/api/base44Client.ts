/**
 * Base44 API Client - TypeScript Version
 * Secure, type-safe API client with error handling and authentication
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: ApiError[];
  metadata?: ResponseMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, any>;
}

export interface ResponseMetadata {
  timestamp: string;
  requestId: string;
  version: string;
  pagination?: PaginationInfo;
  rateLimit?: RateLimitInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: string;
}

export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface PaginatedRequest {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface FilterRequest {
  search?: string;
  filters?: Record<string, any>;
  dateRange?: DateRange;
}

export interface DateRange {
  start: string;
  end: string;
}

// ============================================================================
// CLIENT CONFIGURATION
// ============================================================================

interface ClientConfig {
  baseUrl: string;
  appId: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  rateLimit: {
    requests: number;
    window: number;
  };
}

interface RequestOptions extends ApiRequestConfig {
  skipAuth?: boolean;
  skipValidation?: boolean;
}

// ============================================================================
// RATE LIMITING
// ============================================================================

class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async checkLimit(): Promise<void> {
    const now = Date.now();
    
    // Remove old requests outside the window
    this.requests = this.requests.filter(time => (now - time) < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.windowMs - (now - oldestRequest);
      
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.checkLimit();
      }
    }
    
    this.requests.push(now);
  }
}

// ============================================================================
// API CLIENT CLASS
// ============================================================================

export class Base44Client {
  private config: ClientConfig;
  private rateLimiter: RateLimiter;
  private abortController?: AbortController;

  constructor() {
    // Validate required environment variables
    const appId = import.meta.env.VITE_BASE44_APP_ID;
    const baseUrl = import.meta.env.VITE_BASE44_BASE_URL || '/api';

    if (!appId) {
      throw new Error('VITE_BASE44_APP_ID environment variable is required');
    }

    this.config = {
      baseUrl,
      appId,
      timeout: 30000,
      retries: 3,
      retryDelay: 1000,
      rateLimit: {
        requests: 100,
        window: 60000 // 1 minute
      }
    };

    this.rateLimiter = new RateLimiter(
      this.config.rateLimit.requests,
      this.config.rateLimit.window
    );
  }

  // ========================================================================
  // CORE REQUEST METHOD
  // ========================================================================

  private async request<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      data,
      params,
      headers = {},
      timeout = this.config.timeout,
      retries = this.config.retries,
      retryDelay = this.config.retryDelay,
      skipAuth = false,
      skipValidation = false
    } = options;

    // Rate limiting
    await this.rateLimiter.checkLimit();

    // Build URL
    const url = new URL(endpoint, this.config.baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    // Build headers
    const requestHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'X-App-ID': this.config.appId,
      ...headers
    };

    // Add authentication if not skipped
    if (!skipAuth) {
      const token = await this.getAuthToken();
      if (token) {
        requestHeaders.Authorization = `Bearer ${token}`;
      }
    }

    // Create abort controller for timeout
    this.abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      this.abortController?.abort();
    }, timeout);

    // Build request config
    const requestConfig: RequestInit = {
      method,
      headers: requestHeaders,
      signal: this.abortController.signal,
      credentials: 'same-origin'
    };

    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      if (!skipValidation) {
        this.validateRequestData(data);
      }
      requestConfig.body = JSON.stringify(data);
    }

    // Execute request with retries
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url.toString(), requestConfig);
        clearTimeout(timeoutId);

        // Parse response
        const result = await this.parseResponse<T>(response);
        
        // Validate response if not skipped
        if (!skipValidation) {
          this.validateResponse(result);
        }

        return result;

      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on certain errors
        if (this.isNonRetryableError(error as Error) || attempt === retries) {
          break;
        }

        // Wait before retry with exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, retryDelay * Math.pow(2, attempt))
        );
      }
    }

    clearTimeout(timeoutId);
    throw this.createApiError(lastError || new Error('Request failed'));
  }

  private async parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    
    try {
      let data: any;
      
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else if (contentType?.includes('text/')) {
        data = await response.text();
      } else {
        data = await response.blob();
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Ensure response has expected structure
      if (typeof data === 'object' && data !== null && 'success' in data) {
        return data;
      }

      // Wrap non-standard responses
      return {
        success: true,
        data,
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: response.headers.get('x-request-id') || 'unknown',
          version: response.headers.get('x-api-version') || '1.0'
        }
      };

    } catch (error) {
      throw new Error(`Failed to parse response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private validateRequestData(data: any): void {
    if (data === null || data === undefined) {
      throw new Error('Request data cannot be null or undefined');
    }

    // Prevent prototype pollution
    if (typeof data === 'object' && ('__proto__' in data || 'constructor' in data)) {
      throw new Error('Request data contains potentially dangerous properties');
    }

    // Check for circular references
    try {
      JSON.stringify(data);
    } catch (error) {
      throw new Error('Request data contains circular references');
    }
  }

  private validateResponse<T>(response: ApiResponse<T>): void {
    if (typeof response !== 'object' || response === null) {
      throw new Error('Invalid response format');
    }

    if (typeof response.success !== 'boolean') {
      throw new Error('Response missing success field');
    }

    if (!response.success && response.errors) {
      const errorMessages = response.errors.map(err => err.message).join(', ');
      throw new Error(errorMessages);
    }
  }

  private isNonRetryableError(error: Error): boolean {
    const nonRetryableMessages = [
      'authentication',
      'authorization',
      'forbidden',
      'bad request',
      'not found'
    ];

    return nonRetryableMessages.some(msg => 
      error.message.toLowerCase().includes(msg)
    );
  }

  private createApiError(error: Error): Error {
    const apiError = new Error(`API Request Failed: ${error.message}`);
    apiError.name = 'ApiError';
    apiError.stack = error.stack;
    return apiError;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      // Get token from secure auth manager
      const authStore = (window as any).authStore;
      return authStore?.getState?.()?.tokens?.accessToken || null;
    } catch (error) {
      console.warn('Failed to get auth token:', error);
      return null;
    }
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  public cancelRequest(): void {
    this.abortController?.abort();
  }

  public updateConfig(updates: Partial<ClientConfig>): void {
    this.config = { ...this.config, ...updates };
    
    if (updates.rateLimit) {
      this.rateLimiter = new RateLimiter(
        this.config.rateLimit.requests,
        this.config.rateLimit.window
      );
    }
  }

  // ========================================================================
  // AUTHENTICATION ENDPOINTS
  // ========================================================================

  async login(credentials: { username: string; password: string }): Promise<ApiResponse<any>> {
    return this.request('/auth/login', {
      method: 'POST',
      data: credentials,
      skipAuth: true
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.request('/auth/logout', {
      method: 'POST'
    });
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<any>> {
    return this.request('/auth/refresh', {
      method: 'POST',
      data: { refreshToken },
      skipAuth: true
    });
  }

  async verifyToken(): Promise<ApiResponse<any>> {
    return this.request('/auth/verify');
  }

  // ========================================================================
  // ASSET ENDPOINTS
  // ========================================================================

  async getAssets(params?: PaginatedRequest & FilterRequest): Promise<ApiResponse<any[]>> {
    return this.request('/assets', { params });
  }

  async getAsset(id: string): Promise<ApiResponse<any>> {
    return this.request(`/assets/${id}`);
  }

  async createAsset(asset: any): Promise<ApiResponse<any>> {
    return this.request('/assets', {
      method: 'POST',
      data: asset
    });
  }

  async updateAsset(id: string, updates: any): Promise<ApiResponse<any>> {
    return this.request(`/assets/${id}`, {
      method: 'PUT',
      data: updates
    });
  }

  async deleteAsset(id: string): Promise<ApiResponse<void>> {
    return this.request(`/assets/${id}`, {
      method: 'DELETE'
    });
  }

  async getAssetScans(id: string): Promise<ApiResponse<any[]>> {
    return this.request(`/assets/${id}/scans`);
  }

  // ========================================================================
  // FINDING ENDPOINTS
  // ========================================================================

  async getFindings(params?: PaginatedRequest & FilterRequest): Promise<ApiResponse<any[]>> {
    return this.request('/findings', { params });
  }

  async getFinding(id: string): Promise<ApiResponse<any>> {
    return this.request(`/findings/${id}`);
  }

  async updateFinding(id: string, updates: any): Promise<ApiResponse<any>> {
    return this.request(`/findings/${id}`, {
      method: 'PUT',
      data: updates
    });
  }

  async resolveFinding(id: string, resolution: string): Promise<ApiResponse<any>> {
    return this.request(`/findings/${id}/resolve`, {
      method: 'POST',
      data: { resolution }
    });
  }

  // ========================================================================
  // SCAN ENDPOINTS
  // ========================================================================

  async getScans(params?: PaginatedRequest & FilterRequest): Promise<ApiResponse<any[]>> {
    return this.request('/scans', { params });
  }

  async getScan(id: string): Promise<ApiResponse<any>> {
    return this.request(`/scans/${id}`);
  }

  async startScan(config: any): Promise<ApiResponse<any>> {
    return this.request('/scans/start', {
      method: 'POST',
      data: config
    });
  }

  async stopScan(id: string): Promise<ApiResponse<void>> {
    return this.request(`/scans/${id}/stop`, {
      method: 'POST'
    });
  }

  // ========================================================================
  // CLOUD ENDPOINTS
  // ========================================================================

  async getCloudProviders(): Promise<ApiResponse<any[]>> {
    return this.request('/cloud/providers');
  }

  async connectCloudProvider(config: any): Promise<ApiResponse<any>> {
    return this.request('/cloud/connect', {
      method: 'POST',
      data: config
    });
  }

  async disconnectCloudProvider(id: string): Promise<ApiResponse<void>> {
    return this.request(`/cloud/disconnect/${id}`, {
      method: 'POST'
    });
  }

  // ========================================================================
  // REPORT ENDPOINTS
  // ========================================================================

  async getReports(params?: PaginatedRequest): Promise<ApiResponse<any[]>> {
    return this.request('/reports', { params });
  }

  async generateReport(config: any): Promise<ApiResponse<any>> {
    return this.request('/reports/generate', {
      method: 'POST',
      data: config
    });
  }

  async downloadReport(id: string): Promise<Blob> {
    const response = await this.request<Blob>(`/reports/${id}/download`);
    return response.data;
  }

  // ========================================================================
  // NOTIFICATION ENDPOINTS
  // ========================================================================

  async getNotifications(params?: PaginatedRequest): Promise<ApiResponse<any[]>> {
    return this.request('/notifications', { params });
  }

  async markNotificationRead(id: string): Promise<ApiResponse<void>> {
    return this.request(`/notifications/${id}/read`, {
      method: 'POST'
    });
  }

  // ========================================================================
  // ORGANIZATION ENDPOINTS
  // ========================================================================

  async getOrganization(): Promise<ApiResponse<any>> {
    return this.request('/organization');
  }

  async updateOrganization(updates: any): Promise<ApiResponse<any>> {
    return this.request('/organization', {
      method: 'PUT',
      data: updates
    });
  }

  async getOrganizationUsers(): Promise<ApiResponse<any[]>> {
    return this.request('/organization/users');
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const apiClient = new Base44Client();

export default apiClient;
