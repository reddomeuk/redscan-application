/**
 * Audit Integration Service
 * Integrates audit logging with application stores and components
 */

import { globalAuditLogger, AuditEventTypes } from './AuditLogger';
import { useAuthStore } from '@/stores/authStore';
import { useCloudStore } from '@/stores/cloudStore';

// ============================================================================
// AUDIT MIDDLEWARE FOR STORES
// ============================================================================

export class AuditMiddleware {
  constructor() {
    this.logger = globalAuditLogger;
    this.setupStoreSubscriptions();
  }

  setupStoreSubscriptions() {
    this.setupAuthAuditing();
    this.setupCloudAuditing();
  }

  setupAuthAuditing() {
    // Monitor auth store changes
    useAuthStore.subscribe(
      (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        error: state.error
      }),
      (current, previous) => {
        // Login success
        if (current.isAuthenticated && !previous.isAuthenticated) {
          this.logger.logAuth(AuditEventTypes.AUTH_LOGIN_SUCCESS, {
            userId: current.user?.id,
            username: current.user?.username,
            email: current.user?.email,
            loginMethod: 'web_form'
          });
        }

        // Logout
        if (!current.isAuthenticated && previous.isAuthenticated) {
          this.logger.logAuth(AuditEventTypes.AUTH_LOGOUT, {
            userId: previous.user?.id,
            logoutReason: 'user_initiated'
          });
        }

        // Login failure
        if (current.error && current.error !== previous.error) {
          this.logger.logAuth(AuditEventTypes.AUTH_LOGIN_FAILURE, {
            error: current.error,
            attemptedUsername: 'masked'
          });
        }
      }
    );

    // Monitor token refresh
    const originalRefreshToken = useAuthStore.getState().refreshToken;
    useAuthStore.setState({
      refreshToken: async (...args) => {
        try {
          const result = await originalRefreshToken.apply(useAuthStore.getState(), args);
          
          this.logger.logAuth(AuditEventTypes.AUTH_TOKEN_REFRESH, {
            userId: useAuthStore.getState().user?.id,
            success: true
          });
          
          return result;
        } catch (error) {
          this.logger.logAuth(AuditEventTypes.AUTH_TOKEN_EXPIRED, {
            userId: useAuthStore.getState().user?.id,
            error: error.message
          });
          throw error;
        }
      }
    });
  }

  setupCloudAuditing() {
    // Monitor cloud connections
    useCloudStore.subscribe(
      (state) => state.connections,
      (connections, previousConnections) => {
        const currentProviders = Array.from(connections.keys());
        const previousProviders = Array.from((previousConnections || new Map()).keys());

        // New connections
        currentProviders.forEach(provider => {
          if (!previousProviders.includes(provider)) {
            this.logger.logCloud(AuditEventTypes.CLOUD_PROVIDER_CONNECTED, provider, {
              connectionTime: new Date().toISOString(),
              connectionConfig: this.sanitizeConnectionConfig(connections.get(provider))
            });
          }
        });

        // Disconnections
        previousProviders.forEach(provider => {
          if (!currentProviders.includes(provider)) {
            this.logger.logCloud(AuditEventTypes.CLOUD_PROVIDER_DISCONNECTED, provider, {
              disconnectionTime: new Date().toISOString()
            });
          }
        });
      }
    );

    // Monitor scan activities
    useCloudStore.subscribe(
      (state) => state.activeScans,
      (activeScans, previousScans) => {
        const currentScanIds = Array.from(activeScans.keys());
        const previousScanIds = Array.from((previousScans || new Map()).keys());

        // New scans
        currentScanIds.forEach(scanId => {
          if (!previousScanIds.includes(scanId)) {
            const scan = activeScans.get(scanId);
            this.logger.logSecurity(AuditEventTypes.SECURITY_SCAN_STARTED, {
              scanId,
              provider: scan.provider,
              scanType: scan.config?.scanType || 'unknown',
              startTime: scan.startTime
            });
          }
        });

        // Scan status changes
        currentScanIds.forEach(scanId => {
          const currentScan = activeScans.get(scanId);
          const previousScan = previousScans?.get?.(scanId);

          if (previousScan && currentScan.status !== previousScan.status) {
            if (currentScan.status === 'completed') {
              this.logger.logSecurity(AuditEventTypes.SECURITY_SCAN_COMPLETED, {
                scanId,
                provider: currentScan.provider,
                duration: this.calculateDuration(currentScan.startTime, currentScan.endTime),
                findingsCount: currentScan.findings?.length || 0
              });
            } else if (currentScan.status === 'failed') {
              this.logger.logCloud(AuditEventTypes.CLOUD_SCAN_FAILED, currentScan.provider, {
                scanId,
                error: currentScan.error,
                failureTime: new Date().toISOString()
              });
            }
          }
        });
      }
    );
  }

  sanitizeConnectionConfig(connection) {
    if (!connection) return {};
    
    const { tokens, credentials, ...safeConfig } = connection;
    return {
      ...safeConfig,
      hasTokens: !!tokens,
      hasCredentials: !!credentials
    };
  }

  calculateDuration(startTime, endTime) {
    if (!startTime || !endTime) return null;
    return new Date(endTime).getTime() - new Date(startTime).getTime();
  }
}

// ============================================================================
// AUDIT DECORATORS FOR FUNCTIONS
// ============================================================================

export function auditFunction(eventType, getDetails = () => ({})) {
  return function decorator(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args) {
      const startTime = Date.now();
      
      try {
        const result = await originalMethod.apply(this, args);
        
        globalAuditLogger.log(eventType, {
          ...getDetails(args, result),
          success: true,
          duration: Date.now() - startTime,
          method: propertyKey
        });
        
        return result;
      } catch (error) {
        globalAuditLogger.log(eventType, {
          ...getDetails(args, null, error),
          success: false,
          duration: Date.now() - startTime,
          method: propertyKey,
          error: error.message
        });
        
        throw error;
      }
    };

    return descriptor;
  };
}

// ============================================================================
// AUDIT HOOKS FOR COMPONENTS
// ============================================================================

import { useEffect, useCallback } from 'react';

export function useComponentAudit(componentName) {
  useEffect(() => {
    globalAuditLogger.log('COMPONENT_MOUNTED', {
      componentName,
      url: window.location.href
    });

    return () => {
      globalAuditLogger.log('COMPONENT_UNMOUNTED', {
        componentName
      });
    };
  }, [componentName]);

  const logUserAction = useCallback((action, details = {}) => {
    globalAuditLogger.log('USER_ACTION', {
      componentName,
      action,
      ...details
    });
  }, [componentName]);

  return { logUserAction };
}

export function useDataAccessAudit() {
  const logDataRead = useCallback((resource, id, details = {}) => {
    globalAuditLogger.logDataAccess(AuditEventTypes.DATA_READ, resource, {
      resourceId: id,
      ...details
    });
  }, []);

  const logDataCreate = useCallback((resource, data, details = {}) => {
    globalAuditLogger.logDataAccess(AuditEventTypes.DATA_CREATE, resource, {
      createdFields: Object.keys(data || {}),
      ...details
    });
  }, []);

  const logDataUpdate = useCallback((resource, id, changes, details = {}) => {
    globalAuditLogger.logDataAccess(AuditEventTypes.DATA_UPDATE, resource, {
      resourceId: id,
      updatedFields: Object.keys(changes || {}),
      ...details
    });
  }, []);

  const logDataDelete = useCallback((resource, id, details = {}) => {
    globalAuditLogger.logDataAccess(AuditEventTypes.DATA_DELETE, resource, {
      resourceId: id,
      ...details
    });
  }, []);

  const logDataExport = useCallback((resource, filters, details = {}) => {
    globalAuditLogger.logDataAccess(AuditEventTypes.DATA_EXPORT, resource, {
      filters,
      exportFormat: details.format || 'unknown',
      recordCount: details.count || 'unknown',
      ...details
    });
  }, []);

  return {
    logDataRead,
    logDataCreate,
    logDataUpdate,
    logDataDelete,
    logDataExport
  };
}

export function useSecurityAudit() {
  const logThreatDetected = useCallback((threatType, details = {}) => {
    globalAuditLogger.logSecurity(AuditEventTypes.SECURITY_THREAT_DETECTED, {
      threatType,
      ...details
    });
  }, []);

  const logVulnerabilityFound = useCallback((vulnerability, details = {}) => {
    globalAuditLogger.logSecurity(AuditEventTypes.SECURITY_VULNERABILITY_FOUND, {
      vulnerabilityType: vulnerability.type,
      severity: vulnerability.severity,
      assetId: vulnerability.assetId,
      ...details
    });
  }, []);

  const logIncidentCreated = useCallback((incident, details = {}) => {
    globalAuditLogger.logSecurity(AuditEventTypes.SECURITY_INCIDENT_CREATED, {
      incidentId: incident.id,
      incidentType: incident.type,
      severity: incident.severity,
      ...details
    });
  }, []);

  const logPermissionDenied = useCallback((resource, action, details = {}) => {
    globalAuditLogger.logAuth(AuditEventTypes.AUTH_PERMISSION_DENIED, {
      resource,
      action,
      ...details
    });
  }, []);

  return {
    logThreatDetected,
    logVulnerabilityFound,
    logIncidentCreated,
    logPermissionDenied
  };
}

// ============================================================================
// AUDIT REPORTING
// ============================================================================

export class AuditReporter {
  constructor() {
    this.logger = globalAuditLogger;
  }

  generateComplianceReport(startDate, endDate) {
    const logs = this.logger.getLogsSince(startDate)
      .filter(log => new Date(log.timestamp) <= new Date(endDate));

    const report = {
      period: { startDate, endDate },
      summary: {
        totalEvents: logs.length,
        authenticationEvents: logs.filter(l => l.category === 'authentication').length,
        dataAccessEvents: logs.filter(l => l.category === 'data_access').length,
        securityEvents: logs.filter(l => l.category === 'security').length,
        adminEvents: logs.filter(l => l.category === 'administration').length
      },
      criticalEvents: logs.filter(l => l.severity === 'CRITICAL'),
      failedLogins: logs.filter(l => l.eventType === AuditEventTypes.AUTH_LOGIN_FAILURE),
      dataExports: logs.filter(l => l.eventType === AuditEventTypes.DATA_EXPORT),
      privilegeEscalations: logs.filter(l => l.eventType === AuditEventTypes.ADMIN_PERMISSION_CHANGED),
      generatedAt: new Date().toISOString()
    };

    return report;
  }

  generateSecurityReport(startDate, endDate) {
    const logs = this.logger.getLogsSince(startDate)
      .filter(log => new Date(log.timestamp) <= new Date(endDate))
      .filter(log => log.category === 'security');

    return {
      period: { startDate, endDate },
      threatsSummary: {
        threatsDetected: logs.filter(l => l.eventType === AuditEventTypes.SECURITY_THREAT_DETECTED).length,
        vulnerabilitiesFound: logs.filter(l => l.eventType === AuditEventTypes.SECURITY_VULNERABILITY_FOUND).length,
        incidentsCreated: logs.filter(l => l.eventType === AuditEventTypes.SECURITY_INCIDENT_CREATED).length,
        scansCompleted: logs.filter(l => l.eventType === AuditEventTypes.SECURITY_SCAN_COMPLETED).length
      },
      events: logs,
      generatedAt: new Date().toISOString()
    };
  }

  exportAuditLogs(format = 'json', startDate, endDate) {
    const logs = this.logger.getLogsSince(startDate)
      .filter(log => new Date(log.timestamp) <= new Date(endDate));

    let content;
    let mimeType;
    let filename;

    switch (format) {
      case 'csv':
        content = this.convertToCSV(logs);
        mimeType = 'text/csv';
        filename = `audit-logs-${Date.now()}.csv`;
        break;
      case 'json':
      default:
        content = JSON.stringify(logs, null, 2);
        mimeType = 'application/json';
        filename = `audit-logs-${Date.now()}.json`;
        break;
    }

    this.downloadFile(content, mimeType, filename);
    
    // Log the export
    this.logger.logDataAccess(AuditEventTypes.DATA_EXPORT, 'audit_logs', {
      format,
      recordCount: logs.length,
      dateRange: { startDate, endDate }
    });
  }

  convertToCSV(logs) {
    if (logs.length === 0) return '';

    const headers = ['timestamp', 'eventType', 'severity', 'userId', 'details'];
    const rows = logs.map(log => [
      log.timestamp,
      log.eventType,
      log.severity,
      log.userId,
      JSON.stringify(log.details)
    ]);

    return [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
  }

  downloadFile(content, mimeType, filename) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// ============================================================================
// INITIALIZE AUDIT MIDDLEWARE
// ============================================================================

let auditMiddleware;

export function initializeAuditMiddleware() {
  if (!auditMiddleware) {
    auditMiddleware = new AuditMiddleware();
  }
  return auditMiddleware;
}

// Initialize automatically
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    initializeAuditMiddleware();
  });
}

export { AuditMiddleware as default };
