// ============================================================================
// REAL-TIME SECURITY DASHBOARD SERVICE
// ============================================================================

export interface SecurityMetrics {
  timestamp: string;
  riskScore: number;
  activeThreats: number;
  criticalFindings: number;
  assetsOnline: number;
  scanActivity: number;
  complianceScore: number;
  incidentCount: number;
  automatedActions: number;
}

export interface SecurityAlert {
  id: string;
  type: 'threat' | 'vulnerability' | 'compliance' | 'incident' | 'scan';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  source: string;
  status: 'new' | 'acknowledged' | 'investigating' | 'resolved';
  metadata?: any;
}

export interface ThreatIndicator {
  id: string;
  type: 'malware' | 'phishing' | 'suspicious_ip' | 'data_exfiltration' | 'brute_force';
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  firstSeen: string;
  lastSeen: string;
  sourceIp?: string;
  targetAssets: string[];
  iocs: string[]; // Indicators of Compromise
}

export interface SystemHealth {
  scanners: {
    online: number;
    total: number;
    lastSync: string;
  };
  agents: {
    online: number;
    total: number;
    lastHeartbeat: string;
  };
  integrations: {
    active: number;
    total: number;
    errors: number;
  };
  dataIngestion: {
    eventsPerMinute: number;
    backlogCount: number;
    processingLatency: number;
  };
}

// Simple event emitter for browser compatibility
class SimpleEventEmitter {
  private listeners: Map<string, Function[]> = new Map();

  addEventListener(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  removeEventListener(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  emit(event: string, data?: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }
}

export class RealTimeSecurityDashboard extends SimpleEventEmitter {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;
  private pingInterval: NodeJS.Timeout | null = null;
  private metricsCache = new Map<string, SecurityMetrics>();
  private alertsBuffer: SecurityAlert[] = [];
  private threatIndicators: ThreatIndicator[] = [];
  private isConnected = false;

  constructor() {
    super();
    this.initializeConnection();
  }

  /**
   * Initialize WebSocket connection for real-time data streaming
   */
  private initializeConnection() {
    try {
      // In production, this would be a secure WebSocket URL
      const wsUrl = import.meta.env.NODE_ENV === 'production' 
        ? 'wss://api.redscan.security/realtime'
        : 'ws://localhost:8080/realtime';
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = this.handleConnectionOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleConnectionClose.bind(this);
      this.ws.onerror = this.handleConnectionError.bind(this);
      
    } catch (error) {
      console.error('Failed to initialize WebSocket connection:', error);
      this.startMockDataStreaming(); // Fallback to mock data
    }
  }

  private handleConnectionOpen() {
    console.log('Real-time security dashboard connected');
    this.isConnected = true;
    this.reconnectAttempts = 0;
    
    // Start ping/pong to keep connection alive
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);

    // Subscribe to real-time feeds
    this.subscribe(['security_metrics', 'alerts', 'threats', 'system_health']);
    
    this.emit('connected');
  }

  private handleMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'security_metrics':
          this.handleMetricsUpdate(data.payload);
          break;
        case 'security_alert':
          this.handleSecurityAlert(data.payload);
          break;
        case 'threat_indicator':
          this.handleThreatIndicator(data.payload);
          break;
        case 'system_health':
          this.handleSystemHealth(data.payload);
          break;
        case 'pong':
          // Connection is alive
          break;
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  private handleConnectionClose() {
    this.isConnected = false;
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    this.emit('disconnected');
    
    // Attempt to reconnect
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.initializeConnection();
      }, this.reconnectInterval * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached. Starting mock data streaming.');
      this.startMockDataStreaming();
    }
  }

  private handleConnectionError(error: Event) {
    console.error('WebSocket connection error:', error);
    this.startMockDataStreaming(); // Fallback to mock data
  }

  /**
   * Subscribe to specific data streams
   */
  private subscribe(streams: string[]) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        streams
      }));
    }
  }

  /**
   * Handle real-time security metrics updates
   */
  private handleMetricsUpdate(metrics: SecurityMetrics) {
    this.metricsCache.set(metrics.timestamp, metrics);
    
    // Keep only last 100 metrics for performance
    if (this.metricsCache.size > 100) {
      const oldestKey = Array.from(this.metricsCache.keys())[0];
      this.metricsCache.delete(oldestKey);
    }

    this.emit('metrics_update', metrics);
  }

  /**
   * Handle real-time security alerts
   */
  private handleSecurityAlert(alert: SecurityAlert) {
    this.alertsBuffer.unshift(alert);
    
    // Keep only last 50 alerts in buffer
    if (this.alertsBuffer.length > 50) {
      this.alertsBuffer = this.alertsBuffer.slice(0, 50);
    }

    this.emit('security_alert', alert);
    
    // Trigger browser notification for critical alerts
    if (alert.severity === 'critical' && 'Notification' in window) {
      this.showBrowserNotification(alert);
    }
  }

  /**
   * Handle threat indicators
   */
  private handleThreatIndicator(indicator: ThreatIndicator) {
    const existingIndex = this.threatIndicators.findIndex(t => t.id === indicator.id);
    
    if (existingIndex >= 0) {
      this.threatIndicators[existingIndex] = indicator;
    } else {
      this.threatIndicators.unshift(indicator);
      
      // Keep only last 20 indicators
      if (this.threatIndicators.length > 20) {
        this.threatIndicators = this.threatIndicators.slice(0, 20);
      }
    }

    this.emit('threat_indicator', indicator);
  }

  /**
   * Handle system health updates
   */
  private handleSystemHealth(health: SystemHealth) {
    this.emit('system_health', health);
  }

  /**
   * Fallback mock data streaming when WebSocket is unavailable
   */
  private startMockDataStreaming() {
    console.log('Starting mock data streaming for development...');
    
    // Generate mock metrics every 30 seconds
    setInterval(() => {
      const mockMetrics = this.generateMockMetrics();
      this.handleMetricsUpdate(mockMetrics);
    }, 30000);

    // Generate mock alerts randomly
    setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance every minute
        const mockAlert = this.generateMockAlert();
        this.handleSecurityAlert(mockAlert);
      }
    }, 60000);

    // Generate mock threat indicators occasionally
    setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every 2 minutes
        const mockThreat = this.generateMockThreatIndicator();
        this.handleThreatIndicator(mockThreat);
      }
    }, 120000);

    // Generate initial data
    this.handleMetricsUpdate(this.generateMockMetrics());
    this.handleSystemHealth(this.generateMockSystemHealth());
  }

  /**
   * Show browser notification for critical alerts
   */
  private async showBrowserNotification(alert: SecurityAlert) {
    if (Notification.permission === 'granted') {
      new Notification(`Critical Security Alert: ${alert.title}`, {
        body: alert.description,
        icon: '/favicon.ico',
        tag: alert.id,
        requireInteraction: true
      });
    } else if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.showBrowserNotification(alert);
      }
    }
  }

  // ============================================================================
  // MOCK DATA GENERATORS (for development/fallback)
  // ============================================================================

  private generateMockMetrics(): SecurityMetrics {
    const baseRisk = 65;
    const variation = Math.random() * 20 - 10;
    
    return {
      timestamp: new Date().toISOString(),
      riskScore: Math.max(0, Math.min(100, baseRisk + variation)),
      activeThreats: Math.floor(Math.random() * 5) + 1,
      criticalFindings: Math.floor(Math.random() * 3),
      assetsOnline: Math.floor(Math.random() * 10) + 90,
      scanActivity: Math.floor(Math.random() * 20) + 5,
      complianceScore: Math.floor(Math.random() * 20) + 80,
      incidentCount: Math.floor(Math.random() * 2),
      automatedActions: Math.floor(Math.random() * 8) + 2
    };
  }

  private generateMockAlert(): SecurityAlert {
    const types = ['threat', 'vulnerability', 'compliance', 'incident', 'scan'] as const;
    const severities = ['low', 'medium', 'high', 'critical'] as const;
    const sources = ['Network Scanner', 'Endpoint Agent', 'Cloud Security', 'Threat Intel', 'Manual Review'];
    
    const type = types[Math.floor(Math.random() * types.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    
    const alertTemplates = {
      threat: {
        title: 'Suspicious Network Activity Detected',
        description: 'Unusual outbound traffic patterns detected from internal host'
      },
      vulnerability: {
        title: 'Critical Vulnerability Discovered',
        description: 'CVE-2024-12345 affecting Apache server'
      },
      compliance: {
        title: 'Compliance Control Failure',
        description: 'Access control verification failed for SOC2 requirements'
      },
      incident: {
        title: 'Security Incident Detected',
        description: 'Potential data exfiltration attempt identified'
      },
      scan: {
        title: 'Security Scan Completed',
        description: 'Automated vulnerability scan finished with findings'
      }
    };

    return {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      title: alertTemplates[type].title,
      description: alertTemplates[type].description,
      timestamp: new Date().toISOString(),
      source: sources[Math.floor(Math.random() * sources.length)],
      status: 'new'
    };
  }

  private generateMockThreatIndicator(): ThreatIndicator {
    const types = ['malware', 'phishing', 'suspicious_ip', 'data_exfiltration', 'brute_force'] as const;
    const severities = ['low', 'medium', 'high', 'critical'] as const;
    
    return {
      id: `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: types[Math.floor(Math.random() * types.length)],
      confidence: Math.floor(Math.random() * 40) + 60, // 60-100%
      severity: severities[Math.floor(Math.random() * severities.length)],
      description: 'Malicious activity detected targeting corporate infrastructure',
      firstSeen: new Date(Date.now() - Math.random() * 86400000).toISOString(), // Last 24h
      lastSeen: new Date().toISOString(),
      sourceIp: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      targetAssets: [`asset_${Math.floor(Math.random() * 100)}`],
      iocs: [`sha256:${Math.random().toString(36).substr(2, 64)}`]
    };
  }

  private generateMockSystemHealth(): SystemHealth {
    return {
      scanners: {
        online: Math.floor(Math.random() * 2) + 8, // 8-9 online
        total: 10,
        lastSync: new Date(Date.now() - Math.random() * 300000).toISOString() // Last 5 minutes
      },
      agents: {
        online: Math.floor(Math.random() * 10) + 90, // 90-99 online
        total: 100,
        lastHeartbeat: new Date(Date.now() - Math.random() * 60000).toISOString() // Last minute
      },
      integrations: {
        active: Math.floor(Math.random() * 2) + 14, // 14-15 active
        total: 15,
        errors: Math.floor(Math.random() * 2) // 0-1 errors
      },
      dataIngestion: {
        eventsPerMinute: Math.floor(Math.random() * 500) + 1000, // 1000-1500 events/min
        backlogCount: Math.floor(Math.random() * 100),
        processingLatency: Math.floor(Math.random() * 500) + 100 // 100-600ms
      }
    };
  }

  // ============================================================================
  // PUBLIC API METHODS
  // ============================================================================

  /**
   * Get current security metrics
   */
  getCurrentMetrics(): SecurityMetrics | null {
    const timestamps = Array.from(this.metricsCache.keys()).sort().reverse();
    return timestamps.length > 0 ? this.metricsCache.get(timestamps[0]) || null : null;
  }

  /**
   * Get recent security alerts
   */
  getRecentAlerts(limit = 10): SecurityAlert[] {
    return this.alertsBuffer.slice(0, limit);
  }

  /**
   * Get active threat indicators
   */
  getActiveThreatIndicators(): ThreatIndicator[] {
    return this.threatIndicators.filter(t => 
      new Date(t.lastSeen).getTime() > Date.now() - 86400000 // Last 24 hours
    );
  }

  /**
   * Get metrics history
   */
  getMetricsHistory(timeRange: string = '1h'): SecurityMetrics[] {
    const now = Date.now();
    const timeRanges: Record<string, number> = {
      '15m': 15 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000
    };
    
    const cutoff = now - (timeRanges[timeRange] || timeRanges['1h']);
    
    return Array.from(this.metricsCache.values())
      .filter(m => new Date(m.timestamp).getTime() > cutoff)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string): void {
    const alert = this.alertsBuffer.find(a => a.id === alertId);
    if (alert) {
      alert.status = 'acknowledged';
      this.emit('alert_acknowledged', alert);
    }
  }

  /**
   * Get connection status
   */
  isConnectionHealthy(): boolean {
    return this.isConnected && (this.ws?.readyState === WebSocket.OPEN);
  }

  /**
   * Manually trigger a refresh of all data streams
   */
  refreshAllStreams(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'refresh_all' }));
    } else {
      // Trigger immediate mock data generation
      this.handleMetricsUpdate(this.generateMockMetrics());
      this.handleSystemHealth(this.generateMockSystemHealth());
    }
  }

  /**
   * Clean up resources
   */
  disconnect(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.isConnected = false;
  }
}
