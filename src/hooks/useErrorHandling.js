/**
 * Error Handling Hooks and Utilities
 * Provides easy-to-use hooks for error handling throughout the application
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { ErrorClassifier, ErrorReporter, ErrorTypes, ErrorSeverity } from '@/components/common/ErrorBoundary';

// ============================================================================
// API ERROR HANDLING HOOK
// ============================================================================

export function useApiError() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const errorReporter = useRef(new ErrorReporter());

  const executeAsync = useCallback(async (asyncFn, options = {}) => {
    const {
      showToast = true,
      retryCount = 0,
      retryDelay = 1000,
      onError,
      onSuccess,
      loadingMessage
    } = options;

    setIsLoading(true);
    setError(null);

    let currentRetry = 0;

    const execute = async () => {
      try {
        if (loadingMessage) {
          toast.loading(loadingMessage);
        }

        const result = await asyncFn();
        
        if (onSuccess) {
          onSuccess(result);
        }

        toast.dismiss();
        return result;

      } catch (error) {
        const errorInfo = ErrorClassifier.classifyError(error);
        
        // Attempt retry for retryable errors
        if (errorInfo.retryable && currentRetry < retryCount) {
          currentRetry++;
          toast.dismiss();
          toast.loading(`Retrying... (${currentRetry}/${retryCount})`);
          
          await new Promise(resolve => setTimeout(resolve, retryDelay * currentRetry));
          return execute();
        }

        // Set error state
        setError(errorInfo);

        // Report error
        errorReporter.current.reportError(errorInfo);

        // Show toast notification
        if (showToast) {
          toast.dismiss();
          
          if (errorInfo.severity === ErrorSeverity.CRITICAL) {
            toast.error(errorInfo.userMessage, {
              duration: 10000,
              action: {
                label: 'Refresh',
                onClick: () => window.location.reload()
              }
            });
          } else {
            toast.error(errorInfo.userMessage);
          }
        }

        // Call custom error handler
        if (onError) {
          onError(errorInfo);
        }

        throw error;
      } finally {
        setIsLoading(false);
        toast.dismiss();
      }
    };

    return execute();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    executeAsync,
    isLoading,
    error,
    clearError
  };
}

// ============================================================================
// FORM ERROR HANDLING HOOK
// ============================================================================

export function useFormError() {
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);

  const setFieldError = useCallback((fieldName, error) => {
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  }, []);

  const clearFieldError = useCallback((fieldName) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const setError = useCallback((error) => {
    if (typeof error === 'string') {
      setFormError(error);
    } else if (error?.field) {
      setFieldError(error.field, error.message);
    } else {
      const errorInfo = ErrorClassifier.classifyError(error);
      setFormError(errorInfo.userMessage);
    }
  }, [setFieldError]);

  const clearErrors = useCallback(() => {
    setFieldErrors({});
    setFormError(null);
  }, []);

  const hasErrors = Object.keys(fieldErrors).length > 0 || !!formError;

  return {
    fieldErrors,
    formError,
    setFieldError,
    clearFieldError,
    setError,
    clearErrors,
    hasErrors
  };
}

// ============================================================================
// NETWORK ERROR HANDLING HOOK
// ============================================================================

export function useNetworkError() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [networkError, setNetworkError] = useState(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setNetworkError(null);
      toast.success('Connection restored');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setNetworkError({
        type: ErrorTypes.NETWORK,
        userMessage: 'No internet connection. Some features may not work.',
        severity: ErrorSeverity.MEDIUM
      });
      toast.warning('You are now offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    networkError
  };
}

// ============================================================================
// RETRY HOOK
// ============================================================================

export function useRetry() {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const retry = useCallback(async (fn, options = {}) => {
    const {
      maxRetries = 3,
      delay = 1000,
      backoff = true,
      onRetry
    } = options;

    setIsRetrying(true);

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await fn();
        setRetryCount(0);
        setIsRetrying(false);
        return result;
      } catch (error) {
        if (attempt === maxRetries) {
          setIsRetrying(false);
          throw error;
        }

        setRetryCount(attempt + 1);
        
        if (onRetry) {
          onRetry(attempt + 1, error);
        }

        const retryDelay = backoff ? delay * Math.pow(2, attempt) : delay;
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }, []);

  return {
    retry,
    retryCount,
    isRetrying
  };
}

// ============================================================================
// ERROR RECOVERY HOOK
// ============================================================================

export function useErrorRecovery() {
  const [recoveryActions, setRecoveryActions] = useState([]);

  const addRecoveryAction = useCallback((action) => {
    setRecoveryActions(prev => [...prev, action]);
  }, []);

  const executeRecovery = useCallback(async (errorType) => {
    const actions = recoveryActions.filter(action => 
      !action.errorTypes || action.errorTypes.includes(errorType)
    );

    for (const action of actions) {
      try {
        await action.execute();
      } catch (recoveryError) {
        console.warn('Recovery action failed:', recoveryError);
      }
    }
  }, [recoveryActions]);

  const clearRecoveryActions = useCallback(() => {
    setRecoveryActions([]);
  }, []);

  return {
    addRecoveryAction,
    executeRecovery,
    clearRecoveryActions
  };
}

// ============================================================================
// ENHANCED ERROR BOUNDARY HOOK
// ============================================================================

export function useErrorBoundary() {
  const [error, setError] = useState(null);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const captureError = useCallback((error, errorInfo = {}) => {
    const enhancedError = {
      ...error,
      capturedAt: new Date().toISOString(),
      ...errorInfo
    };
    setError(enhancedError);
  }, []);

  return {
    error,
    resetError,
    captureError
  };
}

// ============================================================================
// SECURITY ERROR HANDLING HOOK
// ============================================================================

export function useSecurityError() {
  const handleSecurityError = useCallback((error, context = {}) => {
    const errorInfo = ErrorClassifier.classifyError(error);
    
    // Enhanced security error handling
    if (errorInfo.type === ErrorTypes.SECURITY || errorInfo.severity === ErrorSeverity.CRITICAL) {
      // Log security event
      console.error('Security error detected:', {
        error: errorInfo,
        context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });

      // Show critical error message
      toast.error('Security error detected. Redirecting to safe page...', {
        duration: 5000
      });

      // Redirect to safe page after delay
      setTimeout(() => {
        window.location.href = '/security-error';
      }, 2000);
    }

    return errorInfo;
  }, []);

  return { handleSecurityError };
}

// ============================================================================
// BATCH ERROR HANDLING HOOK
// ============================================================================

export function useBatchError() {
  const [errors, setErrors] = useState([]);
  const errorReporter = useRef(new ErrorReporter());

  const addError = useCallback((error, context = {}) => {
    const errorInfo = ErrorClassifier.classifyError(error);
    errorInfo.context = context;
    errorInfo.id = Date.now() + Math.random();

    setErrors(prev => [...prev, errorInfo]);
    errorReporter.current.reportError(errorInfo);
  }, []);

  const removeError = useCallback((errorId) => {
    setErrors(prev => prev.filter(error => error.id !== errorId));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const getErrorsByType = useCallback((errorType) => {
    return errors.filter(error => error.type === errorType);
  }, [errors]);

  const getErrorsBySeverity = useCallback((severity) => {
    return errors.filter(error => error.severity === severity);
  }, [errors]);

  return {
    errors,
    addError,
    removeError,
    clearErrors,
    getErrorsByType,
    getErrorsBySeverity
  };
}

// ============================================================================
// VALIDATION ERROR HOOK
// ============================================================================

export function useValidationError() {
  const [validationErrors, setValidationErrors] = useState({});

  const addValidationError = useCallback((field, message) => {
    setValidationErrors(prev => ({
      ...prev,
      [field]: message
    }));
  }, []);

  const removeValidationError = useCallback((field) => {
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearValidationErrors = useCallback(() => {
    setValidationErrors({});
  }, []);

  const hasValidationErrors = Object.keys(validationErrors).length > 0;

  const getFieldError = useCallback((field) => {
    return validationErrors[field];
  }, [validationErrors]);

  return {
    validationErrors,
    addValidationError,
    removeValidationError,
    clearValidationErrors,
    hasValidationErrors,
    getFieldError
  };
}

// ============================================================================
// EXPORT ALL HOOKS
// ============================================================================

export default {
  useApiError,
  useFormError,
  useNetworkError,
  useRetry,
  useErrorRecovery,
  useErrorBoundary,
  useSecurityError,
  useBatchError,
  useValidationError
};
