/**
 * Real-Time Security Dashboard Service
 * Provides WebSocket infrastructure for live security data updates
 * Unifies risk scoring and correlates scan results across modules
 */

import { EventEmitter } from '../utils/EventEmitter';

class RealTimeSecurityDashboard extends EventEmitter {
  constructor() {
    super();
    this.wsConnection = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 5000;
    this.isConnected = false;
    this.subscriptions = new Set();
    this.dataCache = new Map();
    this.correlatedFindings = new Map();
    this.unifiedRiskScores = new Map();
    
    // Real-time data streams
    this.securityMetrics = {
      totalAssets: 0,
      activeThreats: 0,
      resolvedIssues: 0,
      securityScore: 0,
      lastUpdate: null
    };
    
    this.scanResults = new Map(); // Store results by module
    this.findings = new Map(); // Store findings by asset
    this.riskFactors = new Map(); // Store risk factors by asset
    
    this.initializeWebSocket();
    this.startDataCorrelation();
  }

  /**
   * Initialize WebSocket connection for real-time updates
   */
  initializeWebSocket() {
    try {
      // In production, this would connect to your WebSocket server
      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';
      
      console.log('Initializing WebSocket connection to:', wsUrl);
      
      // Mock WebSocket connection for development
      this.simulateWebSocketConnection();
      
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      this.handleConnectionError(error);
    }
  }

  /**
   * Simulate WebSocket connection for development
   */
  simulateWebSocketConnection() {
    // Simulate connection establishment
    setTimeout(() => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connected');
      console.log('WebSocket connected (simulated)');
      
      // Start sending mock real-time data
      this.startMockDataStream();
    }, 1000);
  }

  /**
   * Start mock data stream for development
   */
  startMockDataStream() {
    // Simulate real-time security events
    setInterval(() => {
      this.simulateSecurityEvent();
    }, 10000); // Every 10 seconds

    // Simulate scan completion events
    setInterval(() => {
      this.simulateScanCompletion();
    }, 30000); // Every 30 seconds

    // Simulate finding updates
    setInterval(() => {
      this.simulateFindingUpdate();
    }, 15000); // Every 15 seconds
  }

  /**
   * Simulate a security event
   */
  simulateSecurityEvent() {
    const events = [
      { type: 'threat_detected', severity: 'high', asset: 'web-server-01', description: 'SQL injection attempt blocked' },
      { type: 'vulnerability_found', severity: 'critical', asset: 'api-gateway', description: 'CVE-2024-1234 detected' },
      { type: 'compliance_violation', severity: 'medium', asset: 'database-server', description: 'Encryption policy violation' },
      { type: 'network_anomaly', severity: 'low', asset: 'firewall-01', description: 'Unusual traffic pattern detected' }
    ];

    const event = events[Math.floor(Math.random() * events.length)];
    event.timestamp = new Date();
    event.id = `event_${Date.now()}`;

    this.processSecurityEvent(event);
    this.emit('securityEvent', event);
  }

  /**
   * Simulate scan completion
   */
  simulateScanCompletion() {
    const modules = ['code', 'network', 'cloud', 'endpoint'];
    const module = modules[Math.floor(Math.random() * modules.length)];
    
    const scanResult = {
      id: `scan_${Date.now()}`,
      module,
      status: 'completed',
      timestamp: new Date(),
      findings: Math.floor(Math.random() * 50),
      critical: Math.floor(Math.random() * 5),
      high: Math.floor(Math.random() * 10),
      medium: Math.floor(Math.random() * 20),
      low: Math.floor(Math.random() * 15),
      assets_scanned: Math.floor(Math.random() * 100) + 50
    };

    this.processScanResult(scanResult);
    this.emit('scanCompleted', scanResult);
  }

  /**
   * Simulate finding update
   */
  simulateFindingUpdate() {
    const statuses = ['new', 'investigating', 'resolved', 'false_positive'];
    const severities = ['critical', 'high', 'medium', 'low'];
    
    const finding = {
      id: `finding_${Date.now()}`,
      title: 'Security Finding Update',
      severity: severities[Math.floor(Math.random() * severities.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      asset: `asset_${Math.floor(Math.random() * 100)}`,
      timestamp: new Date(),
      module: 'vulnerability_scanner'
    };

    this.processFindingUpdate(finding);
    this.emit('findingUpdated', finding);
  }

  /**
   * Process security events and update metrics
   */
  processSecurityEvent(event) {
    // Update active threats count
    if (event.type === 'threat_detected') {
      this.securityMetrics.activeThreats++;
    }
    
    // Update security score based on event severity
    const scoreImpact = this.calculateScoreImpact(event.severity);
    this.securityMetrics.securityScore = Math.max(0, 
      Math.min(100, this.securityMetrics.securityScore - scoreImpact)
    );
    
    this.updateLastModified();
    this.correlateEventWithFindings(event);
  }

  /**
   * Process scan results and update correlations
   */
  processScanResult(scanResult) {
    this.scanResults.set(scanResult.module, scanResult);
    
    // Update total assets count
    this.securityMetrics.totalAssets += scanResult.assets_scanned;
    
    // Correlate findings across modules
    this.correlateScanFindings(scanResult);
    
    this.updateLastModified();
  }

  /**
   * Process finding updates
   */
  processFindingUpdate(finding) {
    this.findings.set(finding.id, finding);
    
    // Update resolved issues count if finding is resolved
    if (finding.status === 'resolved') {
      this.securityMetrics.resolvedIssues++;
    }
    
    // Update unified risk score for the asset
    this.updateUnifiedRiskScore(finding.asset, finding);
    
    this.updateLastModified();
  }

  /**
   * Calculate score impact based on event severity
   */
  calculateScoreImpact(severity) {
    const impacts = {
      'critical': 10,
      'high': 5,
      'medium': 2,
      'low': 1
    };
    return impacts[severity] || 1;
  }

  /**
   * Correlate events with existing findings
   */
  correlateEventWithFindings(event) {
    const assetFindings = Array.from(this.findings.values())
      .filter(finding => finding.asset === event.asset);
    
    if (assetFindings.length > 0) {
      const correlation = {
        event,
        relatedFindings: assetFindings,
        correlationScore: this.calculateCorrelationScore(event, assetFindings),
        timestamp: new Date()
      };
      
      this.correlatedFindings.set(event.id, correlation);
      this.emit('correlationFound', correlation);
    }
  }

  /**
   * Correlate findings across different scan modules
   */
  correlateScanFindings(scanResult) {
    const correlations = [];
    
    // Look for patterns across modules
    for (const [module, result] of this.scanResults) {
      if (module !== scanResult.module) {
        const correlation = this.findCrossModuleCorrelations(scanResult, result);
        if (correlation) {
          correlations.push(correlation);
        }
      }
    }
    
    if (correlations.length > 0) {
      this.emit('crossModuleCorrelation', { scanResult, correlations });
    }
  }

  /**
   * Find correlations between different scan modules
   */
  findCrossModuleCorrelations(scanA, scanB) {
    // Example: If code scan finds vulnerabilities and network scan finds open ports
    if ((scanA.module === 'code' && scanB.module === 'network') ||
        (scanA.module === 'network' && scanB.module === 'code')) {
      
      if (scanA.critical > 0 && scanB.high > 0) {
        return {
          type: 'code_network_correlation',
          description: 'Code vulnerabilities detected on asset with network exposure',
          riskMultiplier: 1.5,
          modules: [scanA.module, scanB.module]
        };
      }
    }
    
    // Add more correlation logic here
    return null;
  }

  /**
   * Calculate correlation score between event and findings
   */
  calculateCorrelationScore(event, findings) {
    let score = 0;
    
    findings.forEach(finding => {
      // Same asset
      if (finding.asset === event.asset) score += 30;
      
      // Similar severity
      if (finding.severity === event.severity) score += 20;
      
      // Time proximity (within 1 hour)
      const timeDiff = Math.abs(new Date(event.timestamp) - new Date(finding.timestamp));
      if (timeDiff < 3600000) score += 25; // 1 hour in ms
      
      // Module relevance
      if (this.isModuleRelevant(event.type, finding.module)) score += 25;
    });
    
    return Math.min(100, score);
  }

  /**
   * Check if event type is relevant to finding module
   */
  isModuleRelevant(eventType, findingModule) {
    const relevanceMap = {
      'threat_detected': ['network', 'endpoint'],
      'vulnerability_found': ['code', 'cloud'],
      'compliance_violation': ['cloud', 'endpoint'],
      'network_anomaly': ['network']
    };
    
    return relevanceMap[eventType]?.includes(findingModule) || false;
  }

  /**
   * Update unified risk score for an asset
   */
  updateUnifiedRiskScore(assetId, finding) {
    const currentScore = this.unifiedRiskScores.get(assetId) || {
      score: 0,
      factors: [],
      lastUpdate: null
    };
    
    // Add or update risk factor
    const factorIndex = currentScore.factors.findIndex(f => f.type === finding.type);
    const newFactor = {
      type: finding.type || 'unknown',
      severity: finding.severity,
      impact: this.calculateScoreImpact(finding.severity),
      timestamp: finding.timestamp
    };
    
    if (factorIndex >= 0) {
      currentScore.factors[factorIndex] = newFactor;
    } else {
      currentScore.factors.push(newFactor);
    }
    
    // Recalculate unified score
    currentScore.score = this.calculateUnifiedScore(currentScore.factors);
    currentScore.lastUpdate = new Date();
    
    this.unifiedRiskScores.set(assetId, currentScore);
    this.emit('riskScoreUpdated', { assetId, score: currentScore });
  }

  /**
   * Calculate unified risk score from multiple factors
   */
  calculateUnifiedScore(factors) {
    if (factors.length === 0) return 0;
    
    let totalImpact = 0;
    let severityMultiplier = 1;
    
    factors.forEach(factor => {
      totalImpact += factor.impact;
      
      // Increase multiplier for critical/high severity items
      if (factor.severity === 'critical') severityMultiplier *= 1.5;
      else if (factor.severity === 'high') severityMultiplier *= 1.3;
    });
    
    // Apply diminishing returns for multiple factors
    const diminishingFactor = Math.log(factors.length + 1) / Math.log(2);
    
    return Math.min(100, (totalImpact * severityMultiplier * diminishingFactor));
  }

  /**
   * Subscribe to specific data types
   */
  subscribe(dataType, callback) {
    const subscription = { dataType, callback, id: Date.now() };
    this.subscriptions.add(subscription);
    this.on(dataType, callback);
    
    return subscription.id;
  }

  /**
   * Unsubscribe from data updates
   */
  unsubscribe(subscriptionId) {
    const subscription = Array.from(this.subscriptions)
      .find(sub => sub.id === subscriptionId);
    
    if (subscription) {
      this.subscriptions.delete(subscription);
      this.off(subscription.dataType, subscription.callback);
      return true;
    }
    
    return false;
  }

  /**
   * Get current security metrics
   */
  getSecurityMetrics() {
    return { ...this.securityMetrics };
  }

  /**
   * Get scan results by module
   */
  getScanResults(module) {
    if (module) {
      return this.scanResults.get(module);
    }
    return Object.fromEntries(this.scanResults);
  }

  /**
   * Get correlated findings
   */
  getCorrelatedFindings() {
    return Array.from(this.correlatedFindings.values());
  }

  /**
   * Get unified risk scores
   */
  getUnifiedRiskScores() {
    return Object.fromEntries(this.unifiedRiskScores);
  }

  /**
   * Get findings by asset
   */
  getFindingsByAsset(assetId) {
    return Array.from(this.findings.values())
      .filter(finding => finding.asset === assetId);
  }

  /**
   * Update last modified timestamp
   */
  updateLastModified() {
    this.securityMetrics.lastUpdate = new Date();
    this.emit('metricsUpdated', this.securityMetrics);
  }

  /**
   * Handle connection errors
   */
  handleConnectionError(error) {
    console.error('WebSocket connection error:', error);
    this.isConnected = false;
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.initializeWebSocket();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('connectionFailed');
    }
  }

  /**
   * Start data correlation engine
   */
  startDataCorrelation() {
    // Periodic correlation analysis
    setInterval(() => {
      this.performCorrelationAnalysis();
    }, 60000); // Every minute
  }

  /**
   * Perform comprehensive correlation analysis
   */
  performCorrelationAnalysis() {
    const correlations = [];
    
    // Analyze asset risk patterns
    for (const [assetId, riskScore] of this.unifiedRiskScores) {
      if (riskScore.score > 70) { // High risk threshold
        const assetFindings = this.getFindingsByAsset(assetId);
        if (assetFindings.length > 3) { // Multiple findings
          correlations.push({
            type: 'high_risk_asset',
            assetId,
            riskScore: riskScore.score,
            findingsCount: assetFindings.length,
            recommendation: 'Immediate attention required'
          });
        }
      }
    }
    
    // Analyze temporal patterns
    const recentFindings = Array.from(this.findings.values())
      .filter(f => new Date() - new Date(f.timestamp) < 3600000); // Last hour
    
    if (recentFindings.length > 10) {
      correlations.push({
        type: 'security_storm',
        count: recentFindings.length,
        timeframe: '1 hour',
        recommendation: 'Investigate potential coordinated attack'
      });
    }
    
    if (correlations.length > 0) {
      this.emit('correlationAnalysis', correlations);
    }
  }

  /**
   * Disconnect and cleanup
   */
  disconnect() {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
    
    this.isConnected = false;
    this.subscriptions.clear();
    this.emit('disconnected');
  }
}

// Create and export singleton instance
const realTimeSecurityDashboard = new RealTimeSecurityDashboard();

export default realTimeSecurityDashboard;
export { RealTimeSecurityDashboard };
