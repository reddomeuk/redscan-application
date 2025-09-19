/**
 * Comprehensive Audit Logging System
 * Secure logging for compliance, security monitoring, and forensic analysis
 */

import CryptoJS from 'crypto-js';

// ============================================================================
// AUDIT EVENT TYPES
// ============================================================================

export const AuditEventTypes = {
  // Authentication Events
  AUTH_LOGIN_SUCCESS: 'AUTH_LOGIN_SUCCESS',
  AUTH_LOGIN_FAILURE: 'AUTH_LOGIN_FAILURE',
  AUTH_LOGOUT: 'AUTH_LOGOUT',
  AUTH_TOKEN_REFRESH: 'AUTH_TOKEN_REFRESH',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_SESSION_TIMEOUT: 'AUTH_SESSION_TIMEOUT',
  AUTH_PERMISSION_DENIED: 'AUTH_PERMISSION_DENIED',

  // Data Access Events
  DATA_READ: 'DATA_READ',
  DATA_CREATE: 'DATA_CREATE',
  DATA_UPDATE: 'DATA_UPDATE',
  DATA_DELETE: 'DATA_DELETE',
  DATA_EXPORT: 'DATA_EXPORT',
  DATA_IMPORT: 'DATA_IMPORT',

  // Security Events
  SECURITY_SCAN_STARTED: 'SECURITY_SCAN_STARTED',
  SECURITY_SCAN_COMPLETED: 'SECURITY_SCAN_COMPLETED',
  SECURITY_VULNERABILITY_FOUND: 'SECURITY_VULNERABILITY_FOUND',
  SECURITY_THREAT_DETECTED: 'SECURITY_THREAT_DETECTED',
  SECURITY_INCIDENT_CREATED: 'SECURITY_INCIDENT_CREATED',

  // Cloud Integration Events
  CLOUD_PROVIDER_CONNECTED: 'CLOUD_PROVIDER_CONNECTED',
  CLOUD_PROVIDER_DISCONNECTED: 'CLOUD_PROVIDER_DISCONNECTED',
  CLOUD_TOKEN_REFRESHED: 'CLOUD_TOKEN_REFRESHED',
  CLOUD_SCAN_INITIATED: 'CLOUD_SCAN_INITIATED',
  CLOUD_SCAN_FAILED: 'CLOUD_SCAN_FAILED',

  // Administrative Events
  ADMIN_USER_CREATED: 'ADMIN_USER_CREATED',
  ADMIN_USER_UPDATED: 'ADMIN_USER_UPDATED',
  ADMIN_USER_DELETED: 'ADMIN_USER_DELETED',
  ADMIN_PERMISSION_CHANGED: 'ADMIN_PERMISSION_CHANGED',
  ADMIN_SETTINGS_CHANGED: 'ADMIN_SETTINGS_CHANGED',

  // System Events
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  SYSTEM_STARTUP: 'SYSTEM_STARTUP',
  SYSTEM_SHUTDOWN: 'SYSTEM_SHUTDOWN',
  SYSTEM_BACKUP_CREATED: 'SYSTEM_BACKUP_CREATED',
  SYSTEM_CONFIGURATION_CHANGED: 'SYSTEM_CONFIGURATION_CHANGED',

  // Compliance Events
  COMPLIANCE_REPORT_GENERATED: 'COMPLIANCE_REPORT_GENERATED',
  COMPLIANCE_POLICY_VIOLATION: 'COMPLIANCE_POLICY_VIOLATION',
  COMPLIANCE_AUDIT_STARTED: 'COMPLIANCE_AUDIT_STARTED',
  COMPLIANCE_AUDIT_COMPLETED: 'COMPLIANCE_AUDIT_COMPLETED'
};

export const AuditSeverity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

// ============================================================================
// AUDIT LOG ENTRY STRUCTURE
// ============================================================================

class AuditLogEntry {
  constructor(eventType, details = {}) {
    this.id = this.generateId();
    this.timestamp = new Date().toISOString();
    this.eventType = eventType;
    this.severity = this.determineSeverity(eventType);
    this.userId = this.getCurrentUserId();
    this.userAgent = navigator.userAgent;
    this.ipAddress = this.getClientIP();
    this.sessionId = this.getSessionId();
    this.url = window.location.href;
    this.referrer = document.referrer;
    this.details = this.sanitizeDetails(details);
    this.hash = this.generateHash();
  }

  generateId() {
    return 'audit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getCurrentUserId() {
    try {
      // Get user ID from auth store or context
      return window.currentUser?.id || window.sessionStorage.getItem('userId') || 'anonymous';
    } catch {
      return 'anonymous';
    }
  }

  getClientIP() {
    // This would typically be set by the server
    return 'client_side';
  }

  getSessionId() {
    try {
      return sessionStorage.getItem('session_id') || 'no_session';
    } catch {
      return 'no_session';
    }
  }

  determineSeverity(eventType) {
    const criticalEvents = [
      AuditEventTypes.AUTH_LOGIN_FAILURE,
      AuditEventTypes.AUTH_PERMISSION_DENIED,
      AuditEventTypes.SECURITY_THREAT_DETECTED,
      AuditEventTypes.SECURITY_INCIDENT_CREATED,
      AuditEventTypes.ADMIN_PERMISSION_CHANGED,
      AuditEventTypes.SYSTEM_ERROR
    ];

    const highEvents = [
      AuditEventTypes.AUTH_LOGIN_SUCCESS,
      AuditEventTypes.AUTH_LOGOUT,
      AuditEventTypes.DATA_DELETE,
      AuditEventTypes.DATA_EXPORT,
      AuditEventTypes.SECURITY_VULNERABILITY_FOUND,
      AuditEventTypes.ADMIN_USER_CREATED,
      AuditEventTypes.ADMIN_USER_DELETED,
      AuditEventTypes.COMPLIANCE_POLICY_VIOLATION
    ];

    const mediumEvents = [
      AuditEventTypes.DATA_CREATE,
      AuditEventTypes.DATA_UPDATE,
      AuditEventTypes.CLOUD_PROVIDER_CONNECTED,
      AuditEventTypes.CLOUD_PROVIDER_DISCONNECTED,
      AuditEventTypes.ADMIN_SETTINGS_CHANGED
    ];

    if (criticalEvents.includes(eventType)) return AuditSeverity.CRITICAL;
    if (highEvents.includes(eventType)) return AuditSeverity.HIGH;
    if (mediumEvents.includes(eventType)) return AuditSeverity.MEDIUM;
    return AuditSeverity.LOW;
  }

  sanitizeDetails(details) {
    const sanitized = { ...details };
    
    // Remove sensitive data
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'credential'];
    
    Object.keys(sanitized).forEach(key => {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  generateHash() {
    const data = {
      id: this.id,
      timestamp: this.timestamp,
      eventType: this.eventType,
      userId: this.userId,
      details: this.details
    };
    
    return CryptoJS.SHA256(JSON.stringify(data)).toString();
  }
}

// ============================================================================
// AUDIT LOGGER CLASS
// ============================================================================

export class AuditLogger {
  constructor() {
    this.queue = [];
    this.isOnline = navigator.onLine;
    this.batchSize = 10;
    this.flushInterval = 30000; // 30 seconds
    this.maxQueueSize = 1000;
    this.encryptionKey = this.getEncryptionKey();
    
    this.setupEventListeners();
    this.startPeriodicFlush();
    this.loadPersistedLogs();
  }

  getEncryptionKey() {
    // In production, this should come from a secure key management system
    return import.meta.env.VITE_AUDIT_ENCRYPTION_KEY || 'default-audit-key-change-in-production';
  }

  setupEventListeners() {
    // Handle online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Handle page unload
    window.addEventListener('beforeunload', () => {
      this.persistQueue();
    });
  }

  startPeriodicFlush() {
    setInterval(() => {
      if (this.isOnline && this.queue.length > 0) {
        this.flushQueue();
      }
    }, this.flushInterval);
  }

  async log(eventType, details = {}) {
    try {
      const entry = new AuditLogEntry(eventType, details);
      
      // Add to queue
      this.queue.push(entry);
      
      // Enforce queue size limit
      if (this.queue.length > this.maxQueueSize) {
        this.queue.shift(); // Remove oldest entry
      }

      // Console log in development
      if (import.meta.env.DEV) {
        console.group(`[AUDIT] ${eventType}`);
        console.log('Entry:', entry);
        console.log('Details:', details);
        console.groupEnd();
      }

      // Immediate flush for critical events
      if (entry.severity === AuditSeverity.CRITICAL) {
        await this.flushQueue();
      }

      // Batch flush when queue reaches batch size
      else if (this.queue.length >= this.batchSize) {
        this.flushQueue();
      }

      return entry.id;

    } catch (error) {
      console.error('Failed to create audit log entry:', error);
      // Still log the error itself
      this.logSystemError('AUDIT_LOG_CREATION_FAILED', error);
    }
  }

  async flushQueue() {
    if (this.queue.length === 0 || !this.isOnline) {
      return;
    }

    const logsToSend = [...this.queue];
    this.queue = [];

    try {
      await this.sendLogsToServer(logsToSend);
      console.log(`Successfully sent ${logsToSend.length} audit logs to server`);
    } catch (error) {
      console.error('Failed to send audit logs to server:', error);
      // Re-queue the logs
      this.queue.unshift(...logsToSend);
      
      // Persist to localStorage as backup
      this.persistQueue();
    }
  }

  async sendLogsToServer(logs) {
    const encryptedLogs = this.encryptLogs(logs);
    
    const response = await fetch('/api/audit/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify({
        logs: encryptedLogs,
        timestamp: new Date().toISOString(),
        source: 'web_client'
      })
    });

    if (!response.ok) {
      throw new Error(`Audit log submission failed: ${response.statusText}`);
    }

    return response.json();
  }

  encryptLogs(logs) {
    try {
      const serialized = JSON.stringify(logs);
      return CryptoJS.AES.encrypt(serialized, this.encryptionKey).toString();
    } catch (error) {
      console.error('Failed to encrypt audit logs:', error);
      return logs; // Fallback to unencrypted (not recommended for production)
    }
  }

  getAuthToken() {
    try {
      // Get token from secure auth manager
      return window.authTokens?.accessToken || '';
    } catch {
      return '';
    }
  }

  persistQueue() {
    try {
      const encryptedQueue = this.encryptLogs(this.queue);
      localStorage.setItem('audit_queue', encryptedQueue);
    } catch (error) {
      console.error('Failed to persist audit queue:', error);
    }
  }

  loadPersistedLogs() {
    try {
      const encryptedQueue = localStorage.getItem('audit_queue');
      if (encryptedQueue) {
        const decrypted = CryptoJS.AES.decrypt(encryptedQueue, this.encryptionKey);
        const logs = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
        
        if (Array.isArray(logs)) {
          this.queue.push(...logs);
          localStorage.removeItem('audit_queue');
        }
      }
    } catch (error) {
      console.error('Failed to load persisted audit logs:', error);
      localStorage.removeItem('audit_queue');
    }
  }

  // Convenience methods for common events
  logAuth(eventType, details = {}) {
    return this.log(eventType, {
      ...details,
      category: 'authentication'
    });
  }

  logDataAccess(eventType, resource, details = {}) {
    return this.log(eventType, {
      ...details,
      resource,
      category: 'data_access'
    });
  }

  logSecurity(eventType, details = {}) {
    return this.log(eventType, {
      ...details,
      category: 'security'
    });
  }

  logCloud(eventType, provider, details = {}) {
    return this.log(eventType, {
      ...details,
      provider,
      category: 'cloud_integration'
    });
  }

  logAdmin(eventType, details = {}) {
    return this.log(eventType, {
      ...details,
      category: 'administration'
    });
  }

  logSystemError(context, error) {
    return this.log(AuditEventTypes.SYSTEM_ERROR, {
      context,
      error: error.message || error,
      stack: error.stack,
      category: 'system'
    });
  }

  // Query methods for reporting
  getLogsSince(timestamp) {
    return this.queue.filter(log => new Date(log.timestamp) >= new Date(timestamp));
  }

  getLogsByType(eventType) {
    return this.queue.filter(log => log.eventType === eventType);
  }

  getLogsBySeverity(severity) {
    return this.queue.filter(log => log.severity === severity);
  }

  getLogsForUser(userId) {
    return this.queue.filter(log => log.userId === userId);
  }

  // Statistics
  getStatistics() {
    const stats = {
      total: this.queue.length,
      bySeverity: {},
      byEventType: {},
      last24Hours: 0,
      lastHour: 0
    };

    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const hour = 60 * 60 * 1000;

    this.queue.forEach(log => {
      // Severity stats
      stats.bySeverity[log.severity] = (stats.bySeverity[log.severity] || 0) + 1;
      
      // Event type stats
      stats.byEventType[log.eventType] = (stats.byEventType[log.eventType] || 0) + 1;
      
      // Time-based stats
      const logTime = new Date(log.timestamp).getTime();
      if (now - logTime < day) stats.last24Hours++;
      if (now - logTime < hour) stats.lastHour++;
    });

    return stats;
  }
}

// ============================================================================
// REACT HOOKS FOR AUDIT LOGGING
// ============================================================================

import { useRef, useCallback } from 'react';

export function useAuditLogger() {
  const logger = useRef(new AuditLogger());

  const logEvent = useCallback((eventType, details = {}) => {
    return logger.current.log(eventType, details);
  }, []);

  const logAuth = useCallback((eventType, details = {}) => {
    return logger.current.logAuth(eventType, details);
  }, []);

  const logDataAccess = useCallback((eventType, resource, details = {}) => {
    return logger.current.logDataAccess(eventType, resource, details);
  }, []);

  const logSecurity = useCallback((eventType, details = {}) => {
    return logger.current.logSecurity(eventType, details);
  }, []);

  const logCloud = useCallback((eventType, provider, details = {}) => {
    return logger.current.logCloud(eventType, provider, details);
  }, []);

  const logError = useCallback((context, error) => {
    return logger.current.logSystemError(context, error);
  }, []);

  return {
    logEvent,
    logAuth,
    logDataAccess,
    logSecurity,
    logCloud,
    logError,
    getStatistics: () => logger.current.getStatistics()
  };
}

// Global audit logger instance
export const globalAuditLogger = new AuditLogger();

// Initialize audit logging
if (typeof window !== 'undefined') {
  window.auditLogger = globalAuditLogger;
  
  // Log system startup
  globalAuditLogger.log(AuditEventTypes.SYSTEM_STARTUP, {
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  });
}

export { AuditLogger as default };
