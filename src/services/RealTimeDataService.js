/**
 * Real-Time Data Service with WebSocket Infrastructure
 * 
 * Provides real-time updates for security events, findings, scans, and alerts
 * Manages WebSocket connections, data synchronization, and event broadcasting
 */

export class RealTimeDataService {
  constructor() {
    this.ws = null;
    this.subscribers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 1000;
    this.isConnected = false;
    this.pingInterval = null;
    this.eventQueue = [];
    this.maxQueueSize = 100;
    
    // Real-time data cache
    this.cache = {
      findings: [],
      scans: [],
      alerts: [],
      threats: [],
      networkStatus: {},
      complianceStatus: {},
      lastUpdate: null
    };
    
    this.setupConnection();
  }

  /**
   * Initialize WebSocket connection with authentication and error handling
   */
  setupConnection() {
    try {
      // Use secure WebSocket for production, regular for development
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      
      // For development, use a mock WebSocket server or fallback to polling
      if (process.env.NODE_ENV === 'development') {
        this.setupMockConnection();
        return;
      }
      
      const wsUrl = `${protocol}//${host}/api/ws/security-events`;
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      
    } catch (error) {
      console.error('Failed to setup WebSocket connection:', error);
      this.fallbackToPolling();
    }
  }

  /**
   * Setup mock WebSocket for development environment
   */
  setupMockConnection() {
    console.log('Setting up mock WebSocket for development');
    this.isConnected = true;
    
    // Simulate connection events
    setTimeout(() => {
      this.notifySubscribers('connection', { status: 'connected', mock: true });
      this.startMockDataStream();
    }, 100);
  }

  /**
   * Start mock data stream for development
   */
  startMockDataStream() {
    setInterval(() => {
      if (this.isConnected) {
        this.generateMockEvent();
      }
    }, 5000 + Math.random() * 10000); // Random interval between 5-15 seconds
  }

  /**
   * Generate mock security events for development
   */
  generateMockEvent() {
    const eventTypes = ['finding', 'scan_complete', 'alert', 'threat_detected'];
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    const mockEvents = {
      finding: {
        type: 'new_finding',
        data: {
          id: `finding_${Date.now()}`,
          severity: ['critical', 'high', 'medium', 'low'][Math.floor(Math.random() * 4)],
          title: `Mock Finding ${Date.now()}`,
          asset_id: `asset_${Math.floor(Math.random() * 100)}`,
          created_date: new Date().toISOString(),
          status: 'open'
        }
      },
      scan_complete: {
        type: 'scan_complete',
        data: {
          id: `scan_${Date.now()}`,
          scan_type: ['vulnerability', 'compliance', 'network'][Math.floor(Math.random() * 3)],
          status: 'completed',
          findings_count: Math.floor(Math.random() * 20),
          asset_id: `asset_${Math.floor(Math.random() * 100)}`,
          finished_at: new Date().toISOString()
        }
      },
      alert: {
        type: 'security_alert',
        data: {
          id: `alert_${Date.now()}`,
          severity: ['critical', 'high'][Math.floor(Math.random() * 2)],
          message: 'Mock security alert detected',
          source: 'network_monitor',
          timestamp: new Date().toISOString()
        }
      },
      threat_detected: {
        type: 'threat_intelligence',
        data: {
          id: `threat_${Date.now()}`,
          threat_type: 'malware',
          indicators: [`192.168.1.${Math.floor(Math.random() * 255)}`],
          confidence: Math.floor(Math.random() * 100),
          source: 'threat_feed',
          timestamp: new Date().toISOString()
        }
      }
    };
    
    const event = mockEvents[eventType];
    this.handleMessage({ data: JSON.stringify(event) });
  }

  /**
   * Handle WebSocket connection open
   */
  handleOpen() {
    console.log('WebSocket connected');
    this.isConnected = true;
    this.reconnectAttempts = 0;
    
    // Send authentication if required
    this.authenticate();
    
    // Start heartbeat
    this.startHeartbeat();
    
    // Notify subscribers
    this.notifySubscribers('connection', { status: 'connected' });
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(event) {
    try {
      const message = JSON.parse(event.data);
      
      // Handle different message types
      switch (message.type) {
        case 'new_finding':
          this.handleNewFinding(message.data);
          break;
        case 'scan_complete':
          this.handleScanComplete(message.data);
          break;
        case 'security_alert':
          this.handleSecurityAlert(message.data);
          break;
        case 'threat_intelligence':
          this.handleThreatIntelligence(message.data);
          break;
        case 'network_status':
          this.handleNetworkStatus(message.data);
          break;
        case 'compliance_update':
          this.handleComplianceUpdate(message.data);
          break;
        case 'heartbeat':
          this.handleHeartbeat(message.data);
          break;
        default:
          console.log('Unknown message type:', message.type);
      }
      
      // Update cache timestamp
      this.cache.lastUpdate = new Date();
      
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  /**
   * Handle new security finding
   */
  handleNewFinding(finding) {
    this.cache.findings.unshift(finding);
    
    // Keep cache size manageable
    if (this.cache.findings.length > this.maxQueueSize) {
      this.cache.findings = this.cache.findings.slice(0, this.maxQueueSize);
    }
    
    this.notifySubscribers('finding', finding);
    
    // Show notification for critical findings
    if (finding.severity === 'critical') {
      this.showNotification('Critical Finding', `New critical finding: ${finding.title}`);
    }
  }

  /**
   * Handle scan completion
   */
  handleScanComplete(scan) {
    this.cache.scans.unshift(scan);
    
    if (this.cache.scans.length > this.maxQueueSize) {
      this.cache.scans = this.cache.scans.slice(0, this.maxQueueSize);
    }
    
    this.notifySubscribers('scan', scan);
    
    // Notify if scan found issues
    if (scan.findings_count > 0) {
      this.showNotification('Scan Complete', `Found ${scan.findings_count} issues in ${scan.scan_type} scan`);
    }
  }

  /**
   * Handle security alerts
   */
  handleSecurityAlert(alert) {
    this.cache.alerts.unshift(alert);
    
    if (this.cache.alerts.length > this.maxQueueSize) {
      this.cache.alerts = this.cache.alerts.slice(0, this.maxQueueSize);
    }
    
    this.notifySubscribers('alert', alert);
    
    // Always show notifications for alerts
    this.showNotification('Security Alert', alert.message, alert.severity);
  }

  /**
   * Handle threat intelligence updates
   */
  handleThreatIntelligence(threat) {
    this.cache.threats.unshift(threat);
    
    if (this.cache.threats.length > this.maxQueueSize) {
      this.cache.threats = this.cache.threats.slice(0, this.maxQueueSize);
    }
    
    this.notifySubscribers('threat', threat);
  }

  /**
   * Handle network status updates
   */
  handleNetworkStatus(status) {
    this.cache.networkStatus = { ...this.cache.networkStatus, ...status };
    this.notifySubscribers('network', status);
  }

  /**
   * Handle compliance updates
   */
  handleComplianceUpdate(compliance) {
    this.cache.complianceStatus = { ...this.cache.complianceStatus, ...compliance };
    this.notifySubscribers('compliance', compliance);
  }

  /**
   * Handle heartbeat messages
   */
  handleHeartbeat(data) {
    // Respond to server heartbeat
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
    }
  }

  /**
   * Handle WebSocket connection close
   */
  handleClose(event) {
    console.log('WebSocket disconnected:', event.code, event.reason);
    this.isConnected = false;
    this.stopHeartbeat();
    
    this.notifySubscribers('connection', { status: 'disconnected', code: event.code });
    
    // Attempt to reconnect unless it was intentional
    if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.attemptReconnection();
    } else {
      this.fallbackToPolling();
    }
  }

  /**
   * Handle WebSocket errors
   */
  handleError(error) {
    console.error('WebSocket error:', error);
    this.notifySubscribers('error', { error: error.message });
  }

  /**
   * Attempt to reconnect to WebSocket
   */
  attemptReconnection() {
    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
    
    setTimeout(() => {
      this.setupConnection();
    }, delay);
  }

  /**
   * Fallback to polling when WebSocket fails
   */
  fallbackToPolling() {
    console.log('Falling back to polling mode');
    
    // Poll for updates every 30 seconds
    setInterval(() => {
      this.pollForUpdates();
    }, 30000);
  }

  /**
   * Poll for updates when WebSocket is unavailable
   */
  async pollForUpdates() {
    try {
      // This would normally call your API endpoints
      // For now, simulate with mock data
      this.generateMockEvent();
    } catch (error) {
      console.error('Polling error:', error);
    }
  }

  /**
   * Start heartbeat to keep connection alive
   */
  startHeartbeat() {
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      }
    }, 30000); // Send ping every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  stopHeartbeat() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Authenticate WebSocket connection
   */
  authenticate() {
    // Get token from localStorage or context
    const token = localStorage.getItem('auth_token');
    
    if (token && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'authenticate',
        token: token
      }));
    }
  }

  /**
   * Subscribe to real-time events
   */
  subscribe(type, callback) {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, new Set());
    }
    
    this.subscribers.get(type).add(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(type);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  /**
   * Notify all subscribers of an event
   */
  notifySubscribers(type, data) {
    const callbacks = this.subscribers.get(type);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in subscriber callback:', error);
        }
      });
    }
  }

  /**
   * Get cached data
   */
  getCachedData(type) {
    return this.cache[type] || [];
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      lastUpdate: this.cache.lastUpdate
    };
  }

  /**
   * Show browser notification
   */
  showNotification(title, message, severity = 'info') {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        tag: `security-${severity}`,
        requireInteraction: severity === 'critical'
      });
    }
  }

  /**
   * Request notification permission
   */
  requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'User disconnected');
    }
    this.stopHeartbeat();
    this.isConnected = false;
  }

  /**
   * Send message to server
   */
  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message queued');
      this.eventQueue.push(message);
    }
  }
}

// Create singleton instance
export const realTimeService = new RealTimeDataService();

// Auto-request notification permission
realTimeService.requestNotificationPermission();