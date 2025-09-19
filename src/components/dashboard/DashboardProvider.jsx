/**
 * Real-Time Dashboard Infrastructure
 * 
 * Manages real-time data connections for all dashboard widgets
 * Provides centralized data management and WebSocket integration
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { realTimeService } from '@/services/RealTimeDataService';

// Create dashboard context
const DashboardContext = createContext(null);

export const useDashboardData = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardData must be used within DashboardProvider');
  }
  return context;
};

export function DashboardProvider({ children }) {
  // Real-time data state
  const [dashboardData, setDashboardData] = useState({
    findings: [],
    scans: [],
    alerts: [],
    threats: [],
    assets: [],
    compliance: {},
    networkStatus: {},
    phishingCampaigns: [],
    suppliers: [],
    riskMetrics: {},
    lastUpdated: null,
    connectionStatus: { connected: false }
  });

  // Widget-specific data caches
  const [widgetData, setWidgetData] = useState(new Map());
  
  // Active widget subscriptions
  const [activeWidgets, setActiveWidgets] = useState(new Set());

  // Subscribe to real-time events
  useEffect(() => {
    const subscriptions = [];

    // Findings updates
    subscriptions.push(
      realTimeService.subscribe('finding', (finding) => {
        setDashboardData(prev => ({
          ...prev,
          findings: [finding, ...prev.findings.slice(0, 99)],
          lastUpdated: new Date()
        }));
        
        // Update widget-specific caches
        updateWidgetCaches('finding', finding);
      })
    );

    // Scan updates
    subscriptions.push(
      realTimeService.subscribe('scan', (scan) => {
        setDashboardData(prev => ({
          ...prev,
          scans: [scan, ...prev.scans.slice(0, 99)],
          lastUpdated: new Date()
        }));
        
        updateWidgetCaches('scan', scan);
      })
    );

    // Alert updates
    subscriptions.push(
      realTimeService.subscribe('alert', (alert) => {
        setDashboardData(prev => ({
          ...prev,
          alerts: [alert, ...prev.alerts.slice(0, 99)],
          lastUpdated: new Date()
        }));
        
        updateWidgetCaches('alert', alert);
      })
    );

    // Threat intelligence updates
    subscriptions.push(
      realTimeService.subscribe('threat', (threat) => {
        setDashboardData(prev => ({
          ...prev,
          threats: [threat, ...prev.threats.slice(0, 99)],
          lastUpdated: new Date()
        }));
        
        updateWidgetCaches('threat', threat);
      })
    );

    // Network status updates
    subscriptions.push(
      realTimeService.subscribe('network', (status) => {
        setDashboardData(prev => ({
          ...prev,
          networkStatus: { ...prev.networkStatus, ...status },
          lastUpdated: new Date()
        }));
        
        updateWidgetCaches('network', status);
      })
    );

    // Compliance updates
    subscriptions.push(
      realTimeService.subscribe('compliance', (compliance) => {
        setDashboardData(prev => ({
          ...prev,
          compliance: { ...prev.compliance, ...compliance },
          lastUpdated: new Date()
        }));
        
        updateWidgetCaches('compliance', compliance);
      })
    );

    // Connection status updates
    subscriptions.push(
      realTimeService.subscribe('connection', (status) => {
        setDashboardData(prev => ({
          ...prev,
          connectionStatus: status,
          lastUpdated: new Date()
        }));
      })
    );

    // Load initial cached data
    loadInitialData();

    // Cleanup subscriptions
    return () => {
      subscriptions.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  const loadInitialData = useCallback(() => {
    const initialData = {
      findings: realTimeService.getCachedData('findings'),
      scans: realTimeService.getCachedData('scans'),
      alerts: realTimeService.getCachedData('alerts'),
      threats: realTimeService.getCachedData('threats'),
      connectionStatus: realTimeService.getConnectionStatus()
    };

    setDashboardData(prev => ({
      ...prev,
      ...initialData,
      lastUpdated: new Date()
    }));
  }, []);

  const updateWidgetCaches = useCallback((eventType, data) => {
    // Update specific widget caches based on event type
    setWidgetData(prev => {
      const updated = new Map(prev);
      
      // Update caches for widgets that care about this event type
      for (const widgetId of activeWidgets) {
        const widgetCache = updated.get(widgetId) || {};
        
        switch (eventType) {
          case 'finding':
            if (widgetCache.trackFindings) {
              widgetCache.findings = [data, ...(widgetCache.findings || []).slice(0, 49)];
            }
            break;
          case 'scan':
            if (widgetCache.trackScans) {
              widgetCache.scans = [data, ...(widgetCache.scans || []).slice(0, 49)];
            }
            break;
          case 'alert':
            if (widgetCache.trackAlerts) {
              widgetCache.alerts = [data, ...(widgetCache.alerts || []).slice(0, 49)];
            }
            break;
          case 'threat':
            if (widgetCache.trackThreats) {
              widgetCache.threats = [data, ...(widgetCache.threats || []).slice(0, 49)];
            }
            break;
        }
        
        updated.set(widgetId, widgetCache);
      }
      
      return updated;
    });
  }, [activeWidgets]);

  // Widget registration and data subscription
  const registerWidget = useCallback((widgetId, dataRequirements) => {
    setActiveWidgets(prev => new Set([...prev, widgetId]));
    
    // Initialize widget cache
    setWidgetData(prev => {
      const updated = new Map(prev);
      updated.set(widgetId, {
        ...dataRequirements,
        lastUpdated: new Date(),
        findings: dataRequirements.trackFindings ? dashboardData.findings.slice(0, 20) : [],
        scans: dataRequirements.trackScans ? dashboardData.scans.slice(0, 20) : [],
        alerts: dataRequirements.trackAlerts ? dashboardData.alerts.slice(0, 20) : [],
        threats: dataRequirements.trackThreats ? dashboardData.threats.slice(0, 20) : []
      });
      return updated;
    });
  }, [dashboardData]);

  const unregisterWidget = useCallback((widgetId) => {
    setActiveWidgets(prev => {
      const updated = new Set(prev);
      updated.delete(widgetId);
      return updated;
    });
    
    setWidgetData(prev => {
      const updated = new Map(prev);
      updated.delete(widgetId);
      return updated;
    });
  }, []);

  const getWidgetData = useCallback((widgetId) => {
    return widgetData.get(widgetId) || {};
  }, [widgetData]);

  // Mock data generators for development
  const generateMockData = useCallback((type, count = 10) => {
    const generators = {
      findings: () => Array.from({ length: count }, (_, i) => ({
        id: `mock_finding_${Date.now()}_${i}`,
        severity: ['critical', 'high', 'medium', 'low'][Math.floor(Math.random() * 4)],
        title: `Mock Finding ${i + 1}`,
        description: `This is a mock security finding for development purposes`,
        status: ['open', 'investigating', 'resolved'][Math.floor(Math.random() * 3)],
        asset_id: `asset_${Math.floor(Math.random() * 50)}`,
        created_date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        type: ['vulnerability', 'malware', 'configuration'][Math.floor(Math.random() * 3)]
      })),
      
      scans: () => Array.from({ length: count }, (_, i) => ({
        id: `mock_scan_${Date.now()}_${i}`,
        scan_type: ['vulnerability', 'compliance', 'network', 'web'][Math.floor(Math.random() * 4)],
        status: ['completed', 'running', 'failed'][Math.floor(Math.random() * 3)],
        asset_id: `asset_${Math.floor(Math.random() * 50)}`,
        created_date: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
        finished_at: new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000).toISOString(),
        summary: {
          findings_count: Math.floor(Math.random() * 20),
          critical_count: Math.floor(Math.random() * 3),
          high_count: Math.floor(Math.random() * 5)
        }
      })),
      
      assets: () => Array.from({ length: count }, (_, i) => ({
        id: `asset_${i + 1}`,
        name: `Asset ${i + 1}`,
        asset_type: ['server', 'workstation', 'network_device', 'mobile'][Math.floor(Math.random() * 4)],
        ip_address: `192.168.1.${i + 1}`,
        risk_score: Math.floor(Math.random() * 10) + 1,
        criticality: ['critical', 'high', 'medium', 'low'][Math.floor(Math.random() * 4)],
        last_seen: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
      })),
      
      threats: () => Array.from({ length: count }, (_, i) => ({
        id: `threat_${Date.now()}_${i}`,
        threat_type: ['malware', 'phishing', 'exploit', 'botnet'][Math.floor(Math.random() * 4)],
        severity: ['critical', 'high', 'medium'][Math.floor(Math.random() * 3)],
        confidence: Math.floor(Math.random() * 100),
        source: ['threat_feed', 'internal_detection', 'partner_intel'][Math.floor(Math.random() * 3)],
        indicators: [`192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`],
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        description: `Mock threat intelligence indicator ${i + 1}`
      }))
    };
    
    return generators[type] ? generators[type]() : [];
  }, []);

  // Load mock data in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        setDashboardData(prev => ({
          ...prev,
          findings: generateMockData('findings', 15),
          scans: generateMockData('scans', 10),
          assets: generateMockData('assets', 25),
          threats: generateMockData('threats', 8),
          lastUpdated: new Date()
        }));
      }, 1000);
    }
  }, [generateMockData]);

  // Risk calculation utilities
  const calculateRiskMetrics = useCallback(() => {
    const { findings, assets } = dashboardData;
    
    const totalFindings = findings.length;
    const criticalFindings = findings.filter(f => f.severity === 'critical').length;
    const openFindings = findings.filter(f => f.status === 'open').length;
    
    const averageRiskScore = assets.length > 0 
      ? assets.reduce((sum, asset) => sum + (asset.risk_score || 0), 0) / assets.length 
      : 0;
    
    const riskTrend = 'stable'; // Would calculate based on historical data
    
    return {
      totalFindings,
      criticalFindings,
      openFindings,
      averageRiskScore: averageRiskScore.toFixed(1),
      riskTrend,
      complianceScore: 75, // Mock compliance score
      lastCalculated: new Date()
    };
  }, [dashboardData]);

  // Context value
  const contextValue = {
    dashboardData,
    widgetData,
    activeWidgets,
    registerWidget,
    unregisterWidget,
    getWidgetData,
    generateMockData,
    calculateRiskMetrics: calculateRiskMetrics(),
    isConnected: dashboardData.connectionStatus.connected,
    lastUpdated: dashboardData.lastUpdated
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
}

// Higher-order component for widgets that need real-time data
export function withRealTimeData(WrappedComponent, dataRequirements = {}) {
  return function RealTimeWidget(props) {
    const { registerWidget, unregisterWidget, getWidgetData } = useDashboardData();
    const [widgetId] = useState(() => `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    
    useEffect(() => {
      registerWidget(widgetId, {
        trackFindings: dataRequirements.findings || false,
        trackScans: dataRequirements.scans || false,
        trackAlerts: dataRequirements.alerts || false,
        trackThreats: dataRequirements.threats || false,
        updateInterval: dataRequirements.updateInterval || 30000
      });
      
      return () => {
        unregisterWidget(widgetId);
      };
    }, [widgetId, registerWidget, unregisterWidget]);
    
    const widgetData = getWidgetData(widgetId);
    
    return (
      <WrappedComponent
        {...props}
        realTimeData={widgetData}
        widgetId={widgetId}
      />
    );
  };
}

export default DashboardProvider;