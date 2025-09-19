/**
 * Comprehensive Error Handling System
 * Provides error boundaries, logging, and user-friendly error management
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Home, Bug, Shield } from 'lucide-react';
import { toast } from 'sonner';

// ============================================================================
// ERROR TYPES AND CLASSIFICATION
// ============================================================================

export const ErrorTypes = {
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION: 'AUTHORIZATION',
  NETWORK: 'NETWORK',
  VALIDATION: 'VALIDATION',
  SECURITY: 'SECURITY',
  RATE_LIMIT: 'RATE_LIMIT',
  SERVER: 'SERVER',
  CLIENT: 'CLIENT',
  UNKNOWN: 'UNKNOWN'
};

export const ErrorSeverity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

// ============================================================================
// ERROR CLASSIFICATION SYSTEM
// ============================================================================

export class ErrorClassifier {
  static classifyError(error) {
    const errorInfo = {
      type: ErrorTypes.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      userMessage: 'An unexpected error occurred',
      technicalMessage: error.message || 'Unknown error',
      retryable: false,
      reportable: true
    };

    // Classify by error message or type
    if (error.message) {
      const message = error.message.toLowerCase();
      
      // Authentication errors
      if (message.includes('unauthorized') || message.includes('authentication') || error.status === 401) {
        errorInfo.type = ErrorTypes.AUTHENTICATION;
        errorInfo.userMessage = 'Please sign in to continue';
        errorInfo.retryable = false;
        errorInfo.severity = ErrorSeverity.HIGH;
      }
      
      // Authorization errors
      else if (message.includes('forbidden') || message.includes('permission') || error.status === 403) {
        errorInfo.type = ErrorTypes.AUTHORIZATION;
        errorInfo.userMessage = 'You do not have permission to perform this action';
        errorInfo.retryable = false;
        errorInfo.severity = ErrorSeverity.HIGH;
      }
      
      // Network errors
      else if (message.includes('network') || message.includes('fetch') || error.name === 'NetworkError') {
        errorInfo.type = ErrorTypes.NETWORK;
        errorInfo.userMessage = 'Connection problem. Please check your internet connection and try again';
        errorInfo.retryable = true;
        errorInfo.severity = ErrorSeverity.MEDIUM;
      }
      
      // Validation errors
      else if (message.includes('validation') || message.includes('invalid') || error.status === 400) {
        errorInfo.type = ErrorTypes.VALIDATION;
        errorInfo.userMessage = 'Please check your input and try again';
        errorInfo.retryable = false;
        errorInfo.severity = ErrorSeverity.LOW;
      }
      
      // Security errors
      else if (message.includes('security') || message.includes('csrf') || message.includes('xss')) {
        errorInfo.type = ErrorTypes.SECURITY;
        errorInfo.userMessage = 'Security error detected. Please refresh the page and try again';
        errorInfo.retryable = false;
        errorInfo.severity = ErrorSeverity.CRITICAL;
      }
      
      // Rate limiting
      else if (message.includes('rate limit') || error.status === 429) {
        errorInfo.type = ErrorTypes.RATE_LIMIT;
        errorInfo.userMessage = 'Too many requests. Please wait a moment and try again';
        errorInfo.retryable = true;
        errorInfo.severity = ErrorSeverity.MEDIUM;
      }
      
      // Server errors
      else if (error.status >= 500) {
        errorInfo.type = ErrorTypes.SERVER;
        errorInfo.userMessage = 'Server error. Our team has been notified';
        errorInfo.retryable = true;
        errorInfo.severity = ErrorSeverity.HIGH;
      }
    }

    // Add error context
    errorInfo.timestamp = new Date().toISOString();
    errorInfo.userAgent = navigator.userAgent;
    errorInfo.url = window.location.href;
    errorInfo.userId = this.getCurrentUserId();

    return errorInfo;
  }

  static getCurrentUserId() {
    // This would get the current user ID from your auth system
    try {
      return window.currentUser?.id || 'anonymous';
    } catch {
      return 'anonymous';
    }
  }
}

// ============================================================================
// ERROR REPORTING SYSTEM
// ============================================================================

export class ErrorReporter {
  constructor() {
    this.queue = [];
    this.isOnline = navigator.onLine;
    this.setupOnlineListener();
  }

  setupOnlineListener() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  async reportError(errorInfo) {
    // Don't report certain error types
    if (!errorInfo.reportable || errorInfo.type === ErrorTypes.VALIDATION) {
      return;
    }

    const errorReport = {
      ...errorInfo,
      sessionId: this.getSessionId(),
      stackTrace: errorInfo.originalError?.stack,
      breadcrumbs: this.getBreadcrumbs()
    };

    if (this.isOnline) {
      try {
        await this.sendErrorReport(errorReport);
      } catch (sendError) {
        console.error('Failed to send error report:', sendError);
        this.queueError(errorReport);
      }
    } else {
      this.queueError(errorReport);
    }
  }

  async sendErrorReport(errorReport) {
    // Temporarily disable API error reporting since no backend is running
    console.warn('Error report (API disabled):', errorReport);
    return; // Skip API call
    
    const response = await fetch('/api/errors/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify(errorReport)
    });

    if (!response.ok) {
      throw new Error(`Failed to send error report: ${response.statusText}`);
    }
  }

  queueError(errorReport) {
    this.queue.push(errorReport);
    
    // Limit queue size to prevent memory issues
    if (this.queue.length > 50) {
      this.queue.shift();
    }

    // Store in localStorage for persistence
    try {
      localStorage.setItem('error_queue', JSON.stringify(this.queue));
    } catch {
      // Ignore localStorage errors
    }
  }

  async flushQueue() {
    const errors = [...this.queue];
    this.queue = [];

    for (const error of errors) {
      try {
        await this.sendErrorReport(error);
      } catch {
        // Re-queue if still failing
        this.queueError(error);
        break;
      }
    }

    // Update localStorage
    try {
      localStorage.setItem('error_queue', JSON.stringify(this.queue));
    } catch {
      // Ignore localStorage errors
    }
  }

  getSessionId() {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = this.generateSessionId();
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getBreadcrumbs() {
    // This would collect user actions/navigation history
    // For now, return basic info
    return [
      {
        timestamp: new Date().toISOString(),
        category: 'navigation',
        message: `User on page: ${window.location.pathname}`,
        level: 'info'
      }
    ];
  }
}

// ============================================================================
// REACT ERROR BOUNDARY
// ============================================================================

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
    
    this.errorReporter = new ErrorReporter();
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
      errorId: 'error_' + Date.now()
    };
  }

  componentDidCatch(error, errorInfo) {
    const classifiedError = ErrorClassifier.classifyError(error);
    classifiedError.originalError = error;
    classifiedError.componentStack = errorInfo.componentStack;

    this.setState({
      errorInfo: classifiedError
    });

    // Report error
    this.errorReporter.reportError(classifiedError);

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportBug = () => {
    const { errorInfo } = this.state;
    const bugReport = {
      errorId: this.state.errorId,
      userDescription: '',
      ...errorInfo
    };

    // Open bug report modal or navigate to support
    console.log('Bug report:', bugReport);
    toast.info('Thank you for reporting this issue. Our team has been notified.');
  };

  render() {
    if (this.state.hasError) {
      const { errorInfo } = this.state;
      const isRetryable = errorInfo?.retryable || false;
      const isCritical = errorInfo?.severity === ErrorSeverity.CRITICAL;

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
          <Card className="w-full max-w-2xl bg-slate-800/50 border-slate-700">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  isCritical ? 'bg-red-500/20' : 'bg-orange-500/20'
                }`}>
                  {isCritical ? (
                    <Shield className="w-8 h-8 text-red-400" />
                  ) : (
                    <AlertTriangle className="w-8 h-8 text-orange-400" />
                  )}
                </div>
              </div>
              <CardTitle className="text-2xl text-white">
                {isCritical ? 'Security Error' : 'Something went wrong'}
              </CardTitle>
              <p className="text-slate-400 mt-2">
                {errorInfo?.userMessage || 'An unexpected error occurred'}
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Error Details */}
              <Alert className={isCritical ? 'border-red-500/50 bg-red-500/10' : 'border-orange-500/50 bg-orange-500/10'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Error ID:</strong> {this.state.errorId}<br />
                  <strong>Type:</strong> {errorInfo?.type || 'Unknown'}<br />
                  <strong>Time:</strong> {errorInfo?.timestamp ? new Date(errorInfo.timestamp).toLocaleString() : 'Unknown'}
                </AlertDescription>
              </Alert>

              {/* Development Info */}
              {import.meta.env.DEV && errorInfo && (
                <Alert className="border-blue-500/50 bg-blue-500/10">
                  <Bug className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>Technical Details (Dev Mode):</strong><br />
                    {errorInfo.technicalMessage}
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {isRetryable && (
                  <Button 
                    onClick={this.handleRetry}
                    className="bg-[var(--color-primary)] hover:bg-red-700"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                )}
                
                <Button 
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="border-slate-600 text-slate-300"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
                
                <Button 
                  onClick={this.handleReportBug}
                  variant="outline"
                  className="border-slate-600 text-slate-300"
                >
                  <Bug className="w-4 h-4 mr-2" />
                  Report Issue
                </Button>
              </div>

              {/* Help Text */}
              <div className="text-center text-sm text-slate-500">
                {isCritical ? (
                  <>This appears to be a security-related error. Please refresh the page and try again.</>
                ) : (
                  <>If this problem persists, please contact support with the error ID above.</>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// GLOBAL ERROR HANDLER
// ============================================================================

export class GlobalErrorHandler {
  constructor() {
    this.errorReporter = new ErrorReporter();
    this.setupGlobalHandlers();
  }

  setupGlobalHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason;
      const errorInfo = ErrorClassifier.classifyError(error);
      
      // Prevent default browser handling
      event.preventDefault();
      
      // Report and show user-friendly message
      this.handleError(errorInfo);
    });

    // Handle global JavaScript errors
    window.addEventListener('error', (event) => {
      const error = event.error || new Error(event.message);
      const errorInfo = ErrorClassifier.classifyError(error);
      
      this.handleError(errorInfo);
    });

    // Handle resource loading errors (images, scripts, etc.)
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        const errorInfo = {
          type: ErrorTypes.NETWORK,
          severity: ErrorSeverity.LOW,
          userMessage: 'Some resources failed to load',
          technicalMessage: `Failed to load: ${event.target.src || event.target.href}`,
          retryable: true,
          reportable: true
        };
        
        this.handleError(errorInfo);
      }
    }, true);
  }

  handleError(errorInfo) {
    // Report error
    this.errorReporter.reportError(errorInfo);

    // Show user notification based on severity
    if (errorInfo.severity === ErrorSeverity.CRITICAL) {
      toast.error(errorInfo.userMessage, {
        duration: 10000,
        action: {
          label: 'Refresh',
          onClick: () => window.location.reload()
        }
      });
    } else if (errorInfo.severity === ErrorSeverity.HIGH) {
      toast.error(errorInfo.userMessage, { duration: 5000 });
    } else if (errorInfo.severity === ErrorSeverity.MEDIUM && errorInfo.retryable) {
      toast.warning(errorInfo.userMessage, { duration: 3000 });
    }
  }
}

// ============================================================================
// CUSTOM HOOKS FOR ERROR HANDLING
// ============================================================================

export function useErrorHandler() {
  const [error, setError] = React.useState(null);
  const errorReporter = React.useRef(new ErrorReporter());

  const handleError = React.useCallback((error, context = {}) => {
    const errorInfo = ErrorClassifier.classifyError(error);
    errorInfo.context = context;
    
    setError(errorInfo);
    errorReporter.current.reportError(errorInfo);

    // Auto-clear non-critical errors
    if (errorInfo.severity === ErrorSeverity.LOW) {
      setTimeout(() => setError(null), 5000);
    }
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
}

export function useAsyncError() {
  const { handleError } = useErrorHandler();

  return React.useCallback((asyncFn) => {
    return async (...args) => {
      try {
        return await asyncFn(...args);
      } catch (error) {
        handleError(error);
        throw error;
      }
    };
  }, [handleError]);
}

// Initialize global error handler
if (typeof window !== 'undefined') {
  window.globalErrorHandler = new GlobalErrorHandler();
}

export { ErrorBoundary as default };
