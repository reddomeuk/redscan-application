/**
 * Standardized Error Handling System
 * Provides consistent error handling, logging, and user feedback across the platform
 */

import { ApiResponse } from './StandardApiClient';

// Error severity levels
export const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Error categories
export const ErrorCategory = {
  VALIDATION: 'validation',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  NOT_FOUND: 'not_found',
  NETWORK: 'network',
  SERVER: 'server',
  CLIENT: 'client',
  SECURITY: 'security',
  BUSINESS_LOGIC: 'business_logic'
};

// Standard error codes
export const ErrorCodes = {
  // Validation errors (4000-4099)
  VALIDATION_FAILED: 4000,
  REQUIRED_FIELD_MISSING: 4001,
  INVALID_FORMAT: 4002,
  INVALID_LENGTH: 4003,
  INVALID_ENUM_VALUE: 4004,
  DUPLICATE_VALUE: 4005,

  // Authentication errors (4100-4199)
  AUTHENTICATION_REQUIRED: 4100,
  INVALID_CREDENTIALS: 4101,
  TOKEN_EXPIRED: 4102,
  TOKEN_INVALID: 4103,
  SESSION_EXPIRED: 4104,

  // Authorization errors (4200-4299)
  INSUFFICIENT_PERMISSIONS: 4200,
  ACCESS_DENIED: 4201,
  RESOURCE_FORBIDDEN: 4202,
  ORGANIZATION_ACCESS_DENIED: 4203,

  // Resource errors (4300-4399)
  RESOURCE_NOT_FOUND: 4300,
  ASSET_NOT_FOUND: 4301,
  USER_NOT_FOUND: 4302,
  ORGANIZATION_NOT_FOUND: 4303,

  // Network errors (4400-4499)
  NETWORK_TIMEOUT: 4400,
  CONNECTION_FAILED: 4401,
  REQUEST_ABORTED: 4402,
  DNS_RESOLUTION_FAILED: 4403,

  // Server errors (5000-5099)
  INTERNAL_SERVER_ERROR: 5000,
  DATABASE_ERROR: 5001,
  EXTERNAL_SERVICE_ERROR: 5002,
  CONFIGURATION_ERROR: 5003,

  // Security errors (5100-5199)
  SECURITY_VIOLATION: 5100,
  SUSPICIOUS_ACTIVITY: 5101,
  RATE_LIMIT_EXCEEDED: 5102,
  IP_BLOCKED: 5103,

  // Business logic errors (5200-5299)
  BUSINESS_RULE_VIOLATION: 5200,
  WORKFLOW_ERROR: 5201,
  INTEGRATION_ERROR: 5202,
  DATA_INTEGRITY_ERROR: 5203
};

// Enhanced error class with standardized properties
export class StandardError extends Error {
  constructor(
    message,
    code = ErrorCodes.INTERNAL_SERVER_ERROR,
    category = ErrorCategory.SERVER,
    severity = ErrorSeverity.MEDIUM,
    details = {},
    cause = null
  ) {
    super(message);
    
    this.name = this.constructor.name;
    this.code = code;
    this.category = category;
    this.severity = severity;
    this.details = details;
    this.cause = cause;
    this.timestamp = new Date().toISOString();
    this.requestId = this.generateRequestId();
    this.stackTrace = this.stack;
    
    // Additional context
    this.userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : null;
    this.url = typeof window !== 'undefined' ? window.location?.href : null;
    
    // Error tracking
    this.isLogged = false;
    this.isReported = false;
    
    Error.captureStackTrace && Error.captureStackTrace(this, this.constructor);
  }

  generateRequestId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Convert error to API response format
   */
  toApiResponse() {
    return ApiResponse.error(
      this.message,
      this.getHttpStatus(),
      this.getErrorDetails(),
      {
        errorCode: this.code,
        category: this.category,
        severity: this.severity,
        requestId: this.requestId,
        timestamp: this.timestamp
      }
    );
  }

  /**
   * Get HTTP status code based on error category
   */
  getHttpStatus() {
    switch (this.category) {
      case ErrorCategory.VALIDATION:
        return 422;
      case ErrorCategory.AUTHENTICATION:
        return 401;
      case ErrorCategory.AUTHORIZATION:
        return 403;
      case ErrorCategory.NOT_FOUND:
        return 404;
      case ErrorCategory.CLIENT:
        return 400;
      case ErrorCategory.SECURITY:
        return this.code === ErrorCodes.RATE_LIMIT_EXCEEDED ? 429 : 403;
      case ErrorCategory.NETWORK:
        return 503;
      case ErrorCategory.SERVER:
      default:
        return 500;
    }
  }

  /**
   * Get detailed error information
   */
  getErrorDetails() {
    return {
      code: this.code,
      category: this.category,
      severity: this.severity,
      details: this.details,
      cause: this.cause?.message || null,
      requestId: this.requestId,
      timestamp: this.timestamp
    };
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage() {
    const userMessages = {
      [ErrorCodes.VALIDATION_FAILED]: 'Please check your input and try again.',
      [ErrorCodes.AUTHENTICATION_REQUIRED]: 'Please log in to continue.',
      [ErrorCodes.INVALID_CREDENTIALS]: 'Invalid email or password.',
      [ErrorCodes.TOKEN_EXPIRED]: 'Your session has expired. Please log in again.',
      [ErrorCodes.INSUFFICIENT_PERMISSIONS]: 'You don\'t have permission to perform this action.',
      [ErrorCodes.RESOURCE_NOT_FOUND]: 'The requested resource was not found.',
      [ErrorCodes.NETWORK_TIMEOUT]: 'Request timed out. Please check your connection and try again.',
      [ErrorCodes.INTERNAL_SERVER_ERROR]: 'An unexpected error occurred. Please try again later.',
      [ErrorCodes.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please wait before trying again.',
      [ErrorCodes.SECURITY_VIOLATION]: 'Security violation detected. Access denied.'
    };

    return userMessages[this.code] || this.message || 'An error occurred.';
  }

  /**
   * Check if error should be retried
   */
  isRetryable() {
    const retryableCodes = [
      ErrorCodes.NETWORK_TIMEOUT,
      ErrorCodes.CONNECTION_FAILED,
      ErrorCodes.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
      ErrorCodes.EXTERNAL_SERVICE_ERROR
    ];
    
    return retryableCodes.includes(this.code);
  }

  /**
   * Check if error should be reported to monitoring
   */
  shouldReport() {
    // Don't report validation or client errors
    return ![ErrorCategory.VALIDATION, ErrorCategory.CLIENT].includes(this.category);
  }
}

// Specific error classes
export class ValidationError extends StandardError {
  constructor(message, details = {}, field = null) {
    super(
      message,
      ErrorCodes.VALIDATION_FAILED,
      ErrorCategory.VALIDATION,
      ErrorSeverity.LOW,
      { field, ...details }
    );
  }
}

export class AuthenticationError extends StandardError {
  constructor(message = 'Authentication required', code = ErrorCodes.AUTHENTICATION_REQUIRED) {
    super(
      message,
      code,
      ErrorCategory.AUTHENTICATION,
      ErrorSeverity.MEDIUM
    );
  }
}

export class AuthorizationError extends StandardError {
  constructor(message = 'Access denied', requiredPermission = null) {
    super(
      message,
      ErrorCodes.INSUFFICIENT_PERMISSIONS,
      ErrorCategory.AUTHORIZATION,
      ErrorSeverity.MEDIUM,
      { requiredPermission }
    );
  }
}

export class NotFoundError extends StandardError {
  constructor(resource = 'Resource', id = null) {
    const message = id ? `${resource} with ID ${id} not found` : `${resource} not found`;
    super(
      message,
      ErrorCodes.RESOURCE_NOT_FOUND,
      ErrorCategory.NOT_FOUND,
      ErrorSeverity.LOW,
      { resource, id }
    );
  }
}

export class NetworkError extends StandardError {
  constructor(message = 'Network error occurred', code = ErrorCodes.CONNECTION_FAILED) {
    super(
      message,
      code,
      ErrorCategory.NETWORK,
      ErrorSeverity.HIGH
    );
  }
}

export class SecurityError extends StandardError {
  constructor(message = 'Security violation detected', code = ErrorCodes.SECURITY_VIOLATION) {
    super(
      message,
      code,
      ErrorCategory.SECURITY,
      ErrorSeverity.CRITICAL
    );
  }
}

export class BusinessLogicError extends StandardError {
  constructor(message, details = {}) {
    super(
      message,
      ErrorCodes.BUSINESS_RULE_VIOLATION,
      ErrorCategory.BUSINESS_LOGIC,
      ErrorSeverity.MEDIUM,
      details
    );
  }
}

// Error logger
export class ErrorLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000; // Keep last 1000 errors in memory
    this.listeners = [];
  }

  /**
   * Log an error
   */
  log(error, context = {}) {
    const logEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        code: error.code,
        category: error.category,
        severity: error.severity,
        stack: error.stack,
        details: error.details
      },
      context: {
        userId: context.userId,
        organizationId: context.organizationId,
        action: context.action,
        resource: context.resource,
        userAgent: error.userAgent,
        url: error.url,
        ...context
      }
    };

    // Add to memory logs
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Mark error as logged
    if (error instanceof StandardError) {
      error.isLogged = true;
    }

    // Notify listeners
    this.notifyListeners(logEntry);

    // Send to external logging service if configured
    this.sendToExternalLogger(logEntry);

    // Console log for development
    if (import.meta.env.NODE_ENV === 'development') {
      console.error('Error logged:', logEntry);
    }

    return logEntry;
  }

  /**
   * Add error listener
   */
  addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Remove error listener
   */
  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  /**
   * Notify all listeners
   */
  notifyListeners(logEntry) {
    this.listeners.forEach(listener => {
      try {
        listener(logEntry);
      } catch (error) {
        console.error('Error in error listener:', error);
      }
    });
  }

  /**
   * Send to external logging service
   */
  async sendToExternalLogger(logEntry) {
    try {
      // Only send critical and high severity errors to external service
      if (['critical', 'high'].includes(logEntry.error.severity)) {
        // Implementation would integrate with services like Sentry, LogRocket, etc.
        // For now, just log to console
        console.warn('High severity error detected:', logEntry);
      }
    } catch (error) {
      console.error('Failed to send error to external logger:', error);
    }
  }

  /**
   * Get error statistics
   */
  getStatistics(timeWindow = 3600000) { // Default: 1 hour
    const cutoff = new Date(Date.now() - timeWindow);
    const recentErrors = this.logs.filter(log => new Date(log.timestamp) > cutoff);

    const stats = {
      total: recentErrors.length,
      bySeverity: {},
      byCategory: {},
      byCode: {},
      timeline: this.getErrorTimeline(recentErrors)
    };

    recentErrors.forEach(log => {
      const { severity, category, code } = log.error;
      
      stats.bySeverity[severity] = (stats.bySeverity[severity] || 0) + 1;
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
      stats.byCode[code] = (stats.byCode[code] || 0) + 1;
    });

    return stats;
  }

  /**
   * Get error timeline
   */
  getErrorTimeline(errors, intervalMinutes = 5) {
    const timeline = {};
    const interval = intervalMinutes * 60 * 1000;

    errors.forEach(log => {
      const timestamp = new Date(log.timestamp);
      const bucket = Math.floor(timestamp.getTime() / interval) * interval;
      const bucketKey = new Date(bucket).toISOString();
      
      timeline[bucketKey] = (timeline[bucketKey] || 0) + 1;
    });

    return timeline;
  }

  generateLogId() {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear logs
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Export logs
   */
  exportLogs(format = 'json') {
    if (format === 'json') {
      return JSON.stringify(this.logs, null, 2);
    } else if (format === 'csv') {
      return this.convertToCsv(this.logs);
    }
    return this.logs;
  }

  convertToCsv(logs) {
    const headers = ['timestamp', 'severity', 'category', 'code', 'message', 'userId', 'url'];
    const csvLines = [headers.join(',')];

    logs.forEach(log => {
      const row = [
        log.timestamp,
        log.error.severity,
        log.error.category,
        log.error.code,
        `"${log.error.message.replace(/"/g, '""')}"`,
        log.context.userId || '',
        log.context.url || ''
      ];
      csvLines.push(row.join(','));
    });

    return csvLines.join('\n');
  }
}

// Error handler middleware
export class ErrorHandler {
  constructor() {
    this.logger = new ErrorLogger();
    this.setupGlobalHandlers();
  }

  /**
   * Setup global error handlers
   */
  setupGlobalHandlers() {
    // Handle unhandled promise rejections
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        this.handleUnhandledError(event.reason, 'unhandledrejection');
      });

      // Handle uncaught JavaScript errors
      window.addEventListener('error', (event) => {
        this.handleUnhandledError(event.error, 'uncaught');
      });
    }
  }

  /**
   * Handle unhandled errors
   */
  handleUnhandledError(error, type) {
    const standardError = error instanceof StandardError ? 
      error : 
      new StandardError(
        error?.message || 'Unhandled error occurred',
        ErrorCodes.INTERNAL_SERVER_ERROR,
        ErrorCategory.SERVER,
        ErrorSeverity.CRITICAL,
        { originalError: error?.toString(), type }
      );

    this.logError(standardError, { type: 'unhandled', errorType: type });
  }

  /**
   * Handle API errors
   */
  handleApiError(error, context = {}) {
    let standardError;

    if (error instanceof StandardError) {
      standardError = error;
    } else if (error.response) {
      // HTTP response error
      standardError = this.createErrorFromResponse(error.response);
    } else if (error.request) {
      // Network error
      standardError = new NetworkError('Network request failed');
    } else {
      // Other error
      standardError = new StandardError(error.message || 'Unknown error occurred');
    }

    this.logError(standardError, { ...context, type: 'api' });
    return standardError;
  }

  /**
   * Create error from HTTP response
   */
  createErrorFromResponse(response) {
    const status = response.status;
    const data = response.data || {};
    
    if (status === 422) {
      return new ValidationError(data.message || 'Validation failed', data.errors);
    } else if (status === 401) {
      return new AuthenticationError(data.message || 'Authentication required');
    } else if (status === 403) {
      return new AuthorizationError(data.message || 'Access denied');
    } else if (status === 404) {
      return new NotFoundError(data.message || 'Resource not found');
    } else if (status >= 500) {
      return new StandardError(
        data.message || 'Server error',
        ErrorCodes.INTERNAL_SERVER_ERROR,
        ErrorCategory.SERVER,
        ErrorSeverity.HIGH
      );
    } else {
      return new StandardError(
        data.message || 'Request failed',
        ErrorCodes.INTERNAL_SERVER_ERROR,
        ErrorCategory.CLIENT,
        ErrorSeverity.MEDIUM
      );
    }
  }

  /**
   * Log error with context
   */
  logError(error, context = {}) {
    return this.logger.log(error, context);
  }

  /**
   * Handle validation errors
   */
  handleValidationError(errors, message = 'Validation failed') {
    const validationError = new ValidationError(message, { errors });
    this.logError(validationError, { type: 'validation' });
    return validationError;
  }

  /**
   * Handle business logic errors
   */
  handleBusinessLogicError(message, details = {}) {
    const businessError = new BusinessLogicError(message, details);
    this.logError(businessError, { type: 'business_logic' });
    return businessError;
  }

  /**
   * Get error handler instance
   */
  static getInstance() {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }
}

// Create singleton instances
export const errorHandler = ErrorHandler.getInstance();
export const errorLogger = errorHandler.logger;

// Utility functions
export function handleError(error, context = {}) {
  return errorHandler.handleApiError(error, context);
}

export function logError(error, context = {}) {
  return errorHandler.logError(error, context);
}

export function createValidationError(errors, message) {
  return errorHandler.handleValidationError(errors, message);
}

export function createBusinessLogicError(message, details) {
  return errorHandler.handleBusinessLogicError(message, details);
}

export default errorHandler;
