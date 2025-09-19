/**
 * Standardized API Client
 * Provides consistent HTTP client with error handling, validation, and response formatting
 */

// Standard API response format
export class ApiResponse {
  constructor(data, status = 200, message = 'Success', metadata = {}) {
    this.success = status >= 200 && status < 300;
    this.status = status;
    this.message = message;
    this.data = data;
    this.metadata = {
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId(),
      ...metadata
    };
    this.errors = [];
  }

  static success(data, message = 'Success', metadata = {}) {
    return new ApiResponse(data, 200, message, metadata);
  }

  static error(message, status = 500, errors = [], metadata = {}) {
    const response = new ApiResponse(null, status, message, metadata);
    response.success = false;
    response.errors = Array.isArray(errors) ? errors : [errors];
    return response;
  }

  static validationError(errors, message = 'Validation failed') {
    return ApiResponse.error(message, 422, errors);
  }

  static notFound(resource = 'Resource', id = null) {
    const message = id ? `${resource} with ID ${id} not found` : `${resource} not found`;
    return ApiResponse.error(message, 404);
  }

  static unauthorized(message = 'Unauthorized access') {
    return ApiResponse.error(message, 401);
  }

  static forbidden(message = 'Access forbidden') {
    return ApiResponse.error(message, 403);
  }

  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Standard API error classes
export class ApiError extends Error {
  constructor(message, status = 500, code = 'API_ERROR', details = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

export class ValidationError extends ApiError {
  constructor(message, errors = []) {
    super(message, 422, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

export class NetworkError extends ApiError {
  constructor(message = 'Network error occurred') {
    super(message, 0, 'NETWORK_ERROR');
  }
}

export class TimeoutError extends ApiError {
  constructor(message = 'Request timeout') {
    super(message, 408, 'TIMEOUT_ERROR');
  }
}

// Request/Response interceptors
class InterceptorManager {
  constructor() {
    this.interceptors = [];
  }

  use(onFulfilled, onRejected) {
    this.interceptors.push({ onFulfilled, onRejected });
    return this.interceptors.length - 1;
  }

  eject(id) {
    if (this.interceptors[id]) {
      this.interceptors[id] = null;
    }
  }

  async execute(value) {
    for (const interceptor of this.interceptors) {
      if (interceptor && interceptor.onFulfilled) {
        try {
          value = await interceptor.onFulfilled(value);
        } catch (error) {
          if (interceptor.onRejected) {
            value = await interceptor.onRejected(error);
          } else {
            throw error;
          }
        }
      }
    }
    return value;
  }
}

// Standardized HTTP Client
export class StandardApiClient {
  constructor(config = {}) {
    this.baseURL = config.baseURL || '/api';
    this.timeout = config.timeout || 30000;
    this.retries = config.retries || 3;
    this.retryDelay = config.retryDelay || 1000;
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...config.headers
    };

    // Request/Response interceptors
    this.interceptors = {
      request: new InterceptorManager(),
      response: new InterceptorManager()
    };

    // Default interceptors
    this.setupDefaultInterceptors();
  }

  setupDefaultInterceptors() {
    // Request interceptor for authentication
    this.interceptors.request.use((config) => {
      const token = this.getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.status === 401) {
          this.handleUnauthorized();
        }
        return Promise.reject(error);
      }
    );
  }

  getAuthToken() {
    // Override in subclasses or configure
    return localStorage.getItem('auth_token');
  }

  handleUnauthorized() {
    // Override in subclasses
    console.warn('Unauthorized request detected');
  }

  async request(config) {
    // Apply request interceptors
    config = await this.interceptors.request.execute(config);

    const url = this.buildUrl(config.url);
    const options = {
      method: config.method || 'GET',
      headers: { ...this.headers, ...config.headers },
      signal: this.createAbortSignal(config.timeout || this.timeout)
    };

    if (config.data && ['POST', 'PUT', 'PATCH'].includes(options.method)) {
      options.body = JSON.stringify(config.data);
    }

    if (config.params) {
      const searchParams = new URLSearchParams(config.params);
      const separator = url.includes('?') ? '&' : '?';
      config.url = `${url}${separator}${searchParams.toString()}`;
    }

    let attempt = 0;
    while (attempt < this.retries) {
      try {
        const response = await fetch(config.url || url, options);
        const result = await this.handleResponse(response);
        
        // Apply response interceptors
        return await this.interceptors.response.execute(result);
      } catch (error) {
        attempt++;
        if (attempt >= this.retries || !this.shouldRetry(error)) {
          throw error;
        }
        await this.delay(this.retryDelay * attempt);
      }
    }
  }

  buildUrl(path) {
    if (path.startsWith('http')) return path;
    return `${this.baseURL}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  createAbortSignal(timeout) {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), timeout);
    return controller.signal;
  }

  async handleResponse(response) {
    const contentType = response.headers.get('content-type');
    let data = null;

    try {
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
    } catch (error) {
      throw new ApiError('Failed to parse response', response.status);
    }

    if (!response.ok) {
      const message = data?.message || `HTTP ${response.status}: ${response.statusText}`;
      const errors = data?.errors || [];
      throw new ApiError(message, response.status, 'HTTP_ERROR', { errors, data });
    }

    // Ensure standardized response format
    if (data && typeof data === 'object' && 'success' in data) {
      return data; // Already in standard format
    }

    return ApiResponse.success(data);
  }

  shouldRetry(error) {
    // Retry on network errors, timeouts, and 5xx server errors
    return error instanceof NetworkError || 
           error instanceof TimeoutError || 
           (error.status >= 500 && error.status < 600);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // HTTP method shortcuts
  async get(url, config = {}) {
    return this.request({ ...config, method: 'GET', url });
  }

  async post(url, data, config = {}) {
    return this.request({ ...config, method: 'POST', url, data });
  }

  async put(url, data, config = {}) {
    return this.request({ ...config, method: 'PUT', url, data });
  }

  async patch(url, data, config = {}) {
    return this.request({ ...config, method: 'PATCH', url, data });
  }

  async delete(url, config = {}) {
    return this.request({ ...config, method: 'DELETE', url });
  }
}

// Validation helpers
export class ValidationSchema {
  constructor(rules = {}) {
    this.rules = rules;
  }

  validate(data) {
    const errors = [];
    
    for (const [field, rules] of Object.entries(this.rules)) {
      const value = data[field];
      const fieldErrors = this.validateField(field, value, rules);
      errors.push(...fieldErrors);
    }

    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }

    return true;
  }

  validateField(field, value, rules) {
    const errors = [];

    if (rules.required && (value === null || value === undefined || value === '')) {
      errors.push({ field, message: `${field} is required`, code: 'REQUIRED' });
      return errors; // Don't validate further if required field is missing
    }

    if (value !== null && value !== undefined && value !== '') {
      if (rules.type && typeof value !== rules.type) {
        errors.push({ field, message: `${field} must be of type ${rules.type}`, code: 'TYPE' });
      }

      if (rules.minLength && value.length < rules.minLength) {
        errors.push({ field, message: `${field} must be at least ${rules.minLength} characters`, code: 'MIN_LENGTH' });
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push({ field, message: `${field} must be no more than ${rules.maxLength} characters`, code: 'MAX_LENGTH' });
      }

      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push({ field, message: `${field} format is invalid`, code: 'PATTERN' });
      }

      if (rules.enum && !rules.enum.includes(value)) {
        errors.push({ field, message: `${field} must be one of: ${rules.enum.join(', ')}`, code: 'ENUM' });
      }

      if (rules.custom && typeof rules.custom === 'function') {
        const customError = rules.custom(value);
        if (customError) {
          errors.push({ field, message: customError, code: 'CUSTOM' });
        }
      }
    }

    return errors;
  }
}

// Create singleton instance
export const apiClient = new StandardApiClient({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  retries: 3
});

export default apiClient;
