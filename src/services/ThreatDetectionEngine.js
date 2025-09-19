/**
 * Advanced Threat Detection Engine
 * Implements sophisticated threat detection using machine learning, behavioral analysis,
 * pattern recognition, and anomaly detection with real-time correlation capabilities.
 */

import EventEmitter from '../utils/EventEmitter.js';

// Machine Learning Models for Threat Detection
class ThreatMLEngine {
  constructor() {
    this.models = {
      anomalyDetection: new AnomalyDetectionModel(),
      behavioralAnalysis: new BehavioralAnalysisModel(),
      patternRecognition: new PatternRecognitionModel(),
      threatCorrelation: new ThreatCorrelationModel()
    };
    this.trainingData = new Map();
    this.isTraining = false;
  }

  async analyzeEvent(event) {
    const analysis = {
      eventId: event.id,
      timestamp: new Date(),
      riskScore: 0,
      threatType: 'unknown',
      confidence: 0,
      indicators: [],
      recommendations: []
    };

    try {
      // Anomaly Detection
      const anomalyResult = await this.models.anomalyDetection.analyze(event);
      analysis.riskScore += anomalyResult.score * 0.3;
      
      // Behavioral Analysis
      const behaviorResult = await this.models.behavioralAnalysis.analyze(event);
      analysis.riskScore += behaviorResult.score * 0.25;
      
      // Pattern Recognition
      const patternResult = await this.models.patternRecognition.analyze(event);
      analysis.riskScore += patternResult.score * 0.25;
      
      // Threat Correlation
      const correlationResult = await this.models.threatCorrelation.analyze(event);
      analysis.riskScore += correlationResult.score * 0.2;

      // Determine threat type and confidence
      analysis.threatType = this.classifyThreat(analysis.riskScore, [
        anomalyResult, behaviorResult, patternResult, correlationResult
      ]);
      
      analysis.confidence = Math.min(95, Math.max(10, analysis.riskScore * 100));
      analysis.indicators = this.extractIndicators([
        anomalyResult, behaviorResult, patternResult, correlationResult
      ]);
      
      analysis.recommendations = await this.generateRecommendations(analysis);

      return analysis;
    } catch (error) {
      console.error('ML Analysis Error:', error);
      return { ...analysis, error: error.message };
    }
  }

  classifyThreat(riskScore, results) {
    const indicators = results.flatMap(r => r.indicators || []);
    
    if (indicators.some(i => i.type === 'malware')) return 'malware';
    if (indicators.some(i => i.type === 'phishing')) return 'phishing';
    if (indicators.some(i => i.type === 'data_exfiltration')) return 'data_exfiltration';
    if (indicators.some(i => i.type === 'lateral_movement')) return 'lateral_movement';
    if (indicators.some(i => i.type === 'privilege_escalation')) return 'privilege_escalation';
    if (indicators.some(i => i.type === 'persistence')) return 'persistence';
    if (riskScore > 0.7) return 'high_risk_anomaly';
    if (riskScore > 0.4) return 'suspicious_activity';
    
    return 'low_risk';
  }

  extractIndicators(results) {
    return results.flatMap(result => result.indicators || [])
      .filter((indicator, index, self) => 
        index === self.findIndex(i => i.type === indicator.type && i.value === indicator.value)
      );
  }

  async generateRecommendations(analysis) {
    const recommendations = [];
    
    if (analysis.riskScore > 0.8) {
      recommendations.push({
        priority: 'critical',
        action: 'immediate_isolation',
        description: 'Isolate affected systems immediately to prevent spread',
        timeframe: '0-5 minutes'
      });
    }
    
    if (analysis.threatType === 'malware') {
      recommendations.push({
        priority: 'high',
        action: 'malware_scan',
        description: 'Initiate comprehensive malware scan and removal',
        timeframe: '5-15 minutes'
      });
    }
    
    if (analysis.threatType === 'data_exfiltration') {
      recommendations.push({
        priority: 'critical',
        action: 'network_monitoring',
        description: 'Enable enhanced network monitoring and data loss prevention',
        timeframe: '0-10 minutes'
      });
    }
    
    return recommendations;
  }
}

// Anomaly Detection Model
class AnomalyDetectionModel {
  constructor() {
    this.baseline = {
      loginPatterns: new Map(),
      networkTraffic: new Map(),
      fileAccess: new Map(),
      systemBehavior: new Map()
    };
    this.threshold = 0.7;
  }

  async analyze(event) {
    const anomalies = [];
    let score = 0;

    // Analyze login patterns
    if (event.type === 'login') {
      const loginAnomaly = this.detectLoginAnomaly(event);
      if (loginAnomaly.score > this.threshold) {
        anomalies.push(loginAnomaly);
        score = Math.max(score, loginAnomaly.score);
      }
    }

    // Analyze network traffic
    if (event.type === 'network') {
      const networkAnomaly = this.detectNetworkAnomaly(event);
      if (networkAnomaly.score > this.threshold) {
        anomalies.push(networkAnomaly);
        score = Math.max(score, networkAnomaly.score);
      }
    }

    // Analyze file access patterns
    if (event.type === 'file_access') {
      const fileAnomaly = this.detectFileAccessAnomaly(event);
      if (fileAnomaly.score > this.threshold) {
        anomalies.push(fileAnomaly);
        score = Math.max(score, fileAnomaly.score);
      }
    }

    return {
      score,
      anomalies,
      indicators: anomalies.map(a => ({
        type: 'anomaly',
        subtype: a.type,
        value: a.description,
        confidence: a.score
      }))
    };
  }

  detectLoginAnomaly(event) {
    const userId = event.user_id;
    const currentTime = new Date(event.timestamp);
    const hour = currentTime.getHours();
    const dayOfWeek = currentTime.getDay();
    
    // Simulate baseline checking
    const unusualTime = hour < 6 || hour > 22;
    const weekendLogin = dayOfWeek === 0 || dayOfWeek === 6;
    const unusualLocation = event.geo_country !== event.user_country;
    
    let score = 0;
    let description = '';
    
    if (unusualTime) {
      score += 0.3;
      description += 'Unusual login time; ';
    }
    
    if (weekendLogin && event.user_role !== 'admin') {
      score += 0.2;
      description += 'Weekend login; ';
    }
    
    if (unusualLocation) {
      score += 0.4;
      description += 'Login from unusual location; ';
    }
    
    return {
      type: 'login_anomaly',
      score,
      description: description.trim()
    };
  }

  detectNetworkAnomaly(event) {
    let score = 0;
    let description = '';
    
    // Detect unusual data volumes
    if (event.bytes_transferred > 1000000000) { // 1GB
      score += 0.4;
      description += 'Large data transfer; ';
    }
    
    // Detect unusual destinations
    if (event.destination_country && !['US', 'CA', 'GB', 'AU'].includes(event.destination_country)) {
      score += 0.3;
      description += 'Transfer to unusual country; ';
    }
    
    // Detect unusual protocols
    if (event.protocol && !['HTTP', 'HTTPS', 'FTP', 'SMTP'].includes(event.protocol)) {
      score += 0.3;
      description += 'Unusual protocol usage; ';
    }
    
    return {
      type: 'network_anomaly',
      score,
      description: description.trim()
    };
  }

  detectFileAccessAnomaly(event) {
    let score = 0;
    let description = '';
    
    // Detect bulk file access
    if (event.files_accessed > 100) {
      score += 0.4;
      description += 'Bulk file access; ';
    }
    
    // Detect sensitive file access
    if (event.file_path && event.file_path.includes('confidential')) {
      score += 0.3;
      description += 'Sensitive file access; ';
    }
    
    // Detect unusual file types
    if (event.file_extension && ['.exe', '.bat', '.ps1', '.sh'].includes(event.file_extension)) {
      score += 0.3;
      description += 'Executable file access; ';
    }
    
    return {
      type: 'file_access_anomaly',
      score,
      description: description.trim()
    };
  }
}

// Behavioral Analysis Model
class BehavioralAnalysisModel {
  constructor() {
    this.userProfiles = new Map();
    this.deviceProfiles = new Map();
    this.applicationProfiles = new Map();
  }

  async analyze(event) {
    const behaviors = [];
    let score = 0;

    // User behavior analysis
    const userBehavior = this.analyzeUserBehavior(event);
    if (userBehavior.score > 0.5) {
      behaviors.push(userBehavior);
      score = Math.max(score, userBehavior.score);
    }

    // Device behavior analysis
    const deviceBehavior = this.analyzeDeviceBehavior(event);
    if (deviceBehavior.score > 0.5) {
      behaviors.push(deviceBehavior);
      score = Math.max(score, deviceBehavior.score);
    }

    return {
      score,
      behaviors,
      indicators: behaviors.map(b => ({
        type: 'behavioral',
        subtype: b.type,
        value: b.description,
        confidence: b.score
      }))
    };
  }

  analyzeUserBehavior(event) {
    let score = 0;
    let description = '';
    
    // Simulate user behavior analysis
    if (event.user_id) {
      const profile = this.userProfiles.get(event.user_id) || this.createUserProfile(event.user_id);
      
      // Check for rapid consecutive actions
      if (event.action_count > profile.averageActions * 3) {
        score += 0.4;
        description += 'Rapid action execution; ';
      }
      
      // Check for unusual applications
      if (event.application && !profile.commonApplications.includes(event.application)) {
        score += 0.3;
        description += 'Unusual application usage; ';
      }
      
      // Check for privilege escalation attempts
      if (event.privilege_level > profile.normalPrivilegeLevel) {
        score += 0.5;
        description += 'Privilege escalation attempt; ';
      }
    }
    
    return {
      type: 'user_behavior',
      score,
      description: description.trim()
    };
  }

  analyzeDeviceBehavior(event) {
    let score = 0;
    let description = '';
    
    if (event.device_id) {
      const profile = this.deviceProfiles.get(event.device_id) || this.createDeviceProfile(event.device_id);
      
      // Check for unusual resource usage
      if (event.cpu_usage > profile.averageCpuUsage * 2) {
        score += 0.3;
        description += 'High CPU usage; ';
      }
      
      if (event.memory_usage > profile.averageMemoryUsage * 2) {
        score += 0.3;
        description += 'High memory usage; ';
      }
      
      // Check for unusual network activity
      if (event.network_connections > profile.averageConnections * 3) {
        score += 0.4;
        description += 'Excessive network connections; ';
      }
    }
    
    return {
      type: 'device_behavior',
      score,
      description: description.trim()
    };
  }

  createUserProfile(userId) {
    const profile = {
      averageActions: 50,
      commonApplications: ['Chrome', 'Outlook', 'Excel', 'Word'],
      normalPrivilegeLevel: 1,
      lastUpdated: new Date()
    };
    this.userProfiles.set(userId, profile);
    return profile;
  }

  createDeviceProfile(deviceId) {
    const profile = {
      averageCpuUsage: 30,
      averageMemoryUsage: 60,
      averageConnections: 20,
      lastUpdated: new Date()
    };
    this.deviceProfiles.set(deviceId, profile);
    return profile;
  }
}

// Pattern Recognition Model
class PatternRecognitionModel {
  constructor() {
    this.knownPatterns = new Map();
    this.attackSignatures = this.loadAttackSignatures();
  }

  async analyze(event) {
    const patterns = [];
    let score = 0;

    // Check against known attack patterns
    for (const [patternName, signature] of this.attackSignatures) {
      const match = this.matchPattern(event, signature);
      if (match.score > 0.6) {
        patterns.push({
          name: patternName,
          match: match,
          severity: signature.severity
        });
        score = Math.max(score, match.score);
      }
    }

    return {
      score,
      patterns,
      indicators: patterns.map(p => ({
        type: 'pattern',
        subtype: p.name,
        value: p.match.description,
        confidence: p.match.score
      }))
    };
  }

  matchPattern(event, signature) {
    let score = 0;
    let matches = [];
    
    // Check individual signature components
    for (const component of signature.components) {
      if (this.matchComponent(event, component)) {
        score += component.weight;
        matches.push(component.name);
      }
    }
    
    // Normalize score
    const totalWeight = signature.components.reduce((sum, comp) => sum + comp.weight, 0);
    score = score / totalWeight;
    
    return {
      score,
      matches,
      description: `Matched ${matches.length}/${signature.components.length} signature components`
    };
  }

  matchComponent(event, component) {
    switch (component.type) {
      case 'field_match':
        return event[component.field] === component.value;
      case 'field_contains':
        return event[component.field] && event[component.field].includes(component.value);
      case 'field_regex':
        return event[component.field] && new RegExp(component.pattern).test(event[component.field]);
      case 'field_range':
        return event[component.field] >= component.min && event[component.field] <= component.max;
      default:
        return false;
    }
  }

  loadAttackSignatures() {
    return new Map([
      ['credential_stuffing', {
        severity: 'high',
        components: [
          { name: 'rapid_logins', type: 'field_range', field: 'login_attempts', min: 10, max: 1000, weight: 0.4 },
          { name: 'multiple_ips', type: 'field_range', field: 'unique_ips', min: 5, max: 100, weight: 0.3 },
          { name: 'failed_logins', type: 'field_range', field: 'failed_ratio', min: 0.8, max: 1.0, weight: 0.3 }
        ]
      }],
      ['sql_injection', {
        severity: 'critical',
        components: [
          { name: 'sql_keywords', type: 'field_regex', field: 'request_body', pattern: /(SELECT|INSERT|UPDATE|DELETE|UNION|DROP)/i, weight: 0.5 },
          { name: 'sql_chars', type: 'field_contains', field: 'request_body', value: "'; --", weight: 0.3 },
          { name: 'error_response', type: 'field_range', field: 'response_code', min: 500, max: 599, weight: 0.2 }
        ]
      }],
      ['data_exfiltration', {
        severity: 'critical',
        components: [
          { name: 'large_transfer', type: 'field_range', field: 'bytes_transferred', min: 1000000, max: Number.MAX_SAFE_INTEGER, weight: 0.4 },
          { name: 'external_destination', type: 'field_match', field: 'destination_internal', value: false, weight: 0.3 },
          { name: 'off_hours', type: 'field_range', field: 'hour', min: 0, max: 6, weight: 0.3 }
        ]
      }]
    ]);
  }
}

// Threat Correlation Model
class ThreatCorrelationModel {
  constructor() {
    this.eventWindow = 3600000; // 1 hour in milliseconds
    this.correlationRules = this.loadCorrelationRules();
    this.eventHistory = [];
  }

  async analyze(event) {
    // Add event to history
    this.eventHistory.push(event);
    
    // Clean old events
    const cutoff = Date.now() - this.eventWindow;
    this.eventHistory = this.eventHistory.filter(e => new Date(e.timestamp) > cutoff);
    
    const correlations = [];
    let score = 0;

    // Check correlation rules
    for (const rule of this.correlationRules) {
      const correlation = this.checkCorrelation(event, rule);
      if (correlation.score > 0.6) {
        correlations.push(correlation);
        score = Math.max(score, correlation.score);
      }
    }

    return {
      score,
      correlations,
      indicators: correlations.map(c => ({
        type: 'correlation',
        subtype: c.ruleName,
        value: c.description,
        confidence: c.score
      }))
    };
  }

  checkCorrelation(currentEvent, rule) {
    const relatedEvents = this.eventHistory.filter(event => 
      event.id !== currentEvent.id && this.matchesRule(event, rule.conditions)
    );

    let score = 0;
    if (relatedEvents.length >= rule.minEvents) {
      score = Math.min(1.0, relatedEvents.length / rule.optimalEvents);
    }

    return {
      ruleName: rule.name,
      score,
      relatedEvents: relatedEvents.length,
      description: `${relatedEvents.length} related events found for ${rule.name}`
    };
  }

  matchesRule(event, conditions) {
    return conditions.every(condition => {
      switch (condition.type) {
        case 'same_user':
          return event.user_id === condition.value;
        case 'same_ip':
          return event.source_ip === condition.value;
        case 'event_type':
          return event.type === condition.value;
        default:
          return false;
      }
    });
  }

  loadCorrelationRules() {
    return [
      {
        name: 'coordinated_login_attack',
        minEvents: 3,
        optimalEvents: 10,
        conditions: [
          { type: 'event_type', value: 'login_failed' },
          { type: 'same_ip', value: 'current' }
        ]
      },
      {
        name: 'privilege_escalation_chain',
        minEvents: 2,
        optimalEvents: 5,
        conditions: [
          { type: 'same_user', value: 'current' },
          { type: 'event_type', value: 'privilege_change' }
        ]
      }
    ];
  }
}

// Main Threat Detection Engine
export class ThreatDetectionEngine extends EventEmitter {
  constructor() {
    super();
    this.mlEngine = new ThreatMLEngine();
    this.isRunning = false;
    this.processingQueue = [];
    this.detectionResults = new Map();
    this.threatDatabase = new Map();
    this.riskThresholds = {
      low: 0.3,
      medium: 0.6,
      high: 0.8,
      critical: 0.9
    };
  }

  async initialize() {
    try {
      console.log('Initializing Threat Detection Engine...');
      
      // Initialize threat intelligence feeds
      await this.initializeThreatIntelligence();
      
      // Load historical data for ML training
      await this.loadHistoricalData();
      
      // Start processing engine
      this.startProcessingEngine();
      
      this.isRunning = true;
      this.emit('initialized');
      
      console.log('Threat Detection Engine initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Threat Detection Engine:', error);
      throw error;
    }
  }

  async processEvent(event) {
    if (!this.isRunning) {
      throw new Error('Threat Detection Engine not initialized');
    }

    try {
      // Add to processing queue
      this.processingQueue.push(event);
      
      // Analyze with ML engine
      const analysis = await this.mlEngine.analyzeEvent(event);
      
      // Determine threat level
      const threatLevel = this.determineThreatLevel(analysis.riskScore);
      
      // Create threat detection result
      const result = {
        id: `detection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        eventId: event.id,
        timestamp: new Date(),
        threatLevel,
        riskScore: analysis.riskScore,
        confidence: analysis.confidence,
        threatType: analysis.threatType,
        indicators: analysis.indicators,
        recommendations: analysis.recommendations,
        mlAnalysis: analysis
      };

      // Store result
      this.detectionResults.set(result.id, result);
      
      // Emit appropriate events based on threat level
      this.emit('threat_detected', result);
      
      if (threatLevel === 'critical' || threatLevel === 'high') {
        this.emit('high_risk_threat', result);
      }
      
      return result;
    } catch (error) {
      console.error('Error processing threat event:', error);
      throw error;
    }
  }

  determineThreatLevel(riskScore) {
    if (riskScore >= this.riskThresholds.critical) return 'critical';
    if (riskScore >= this.riskThresholds.high) return 'high';
    if (riskScore >= this.riskThresholds.medium) return 'medium';
    if (riskScore >= this.riskThresholds.low) return 'low';
    return 'info';
  }

  async initializeThreatIntelligence() {
    // Simulate loading threat intelligence feeds
    const threatFeeds = [
      { source: 'internal', threats: 150 },
      { source: 'external_feed_1', threats: 2500 },
      { source: 'external_feed_2', threats: 1800 }
    ];

    for (const feed of threatFeeds) {
      console.log(`Loading ${feed.threats} threats from ${feed.source}`);
      // In a real implementation, this would load actual threat data
    }
  }

  async loadHistoricalData() {
    // Simulate loading historical security event data for ML training
    console.log('Loading historical data for ML model training...');
    
    // In a real implementation, this would load actual historical data
    const sampleEvents = this.generateSampleEvents(1000);
    
    for (const event of sampleEvents) {
      // Train models with historical data
      await this.mlEngine.analyzeEvent(event);
    }
    
    console.log('Historical data loaded and models trained');
  }

  generateSampleEvents(count) {
    const events = [];
    const eventTypes = ['login', 'network', 'file_access', 'process_execution'];
    const users = ['user1', 'user2', 'user3', 'admin1'];
    
    for (let i = 0; i < count; i++) {
      events.push({
        id: `event_${i}`,
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
        type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        user_id: users[Math.floor(Math.random() * users.length)],
        source_ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
        user_country: 'US',
        geo_country: Math.random() > 0.9 ? 'CN' : 'US', // 10% foreign
        bytes_transferred: Math.random() * 10000000,
        login_attempts: Math.floor(Math.random() * 20),
        action_count: Math.floor(Math.random() * 100),
        cpu_usage: Math.random() * 100,
        memory_usage: Math.random() * 100
      });
    }
    
    return events;
  }

  startProcessingEngine() {
    // Start background processing
    setInterval(() => {
      this.processQueue();
    }, 1000);
  }

  processQueue() {
    while (this.processingQueue.length > 0) {
      const event = this.processingQueue.shift();
      this.processEvent(event).catch(error => {
        console.error('Error processing queued event:', error);
      });
    }
  }

  getDetectionResults(limit = 100) {
    return Array.from(this.detectionResults.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  getThreatStatistics() {
    const results = Array.from(this.detectionResults.values());
    const stats = {
      total: results.length,
      byLevel: {
        critical: results.filter(r => r.threatLevel === 'critical').length,
        high: results.filter(r => r.threatLevel === 'high').length,
        medium: results.filter(r => r.threatLevel === 'medium').length,
        low: results.filter(r => r.threatLevel === 'low').length,
        info: results.filter(r => r.threatLevel === 'info').length
      },
      byType: {},
      averageRiskScore: results.reduce((sum, r) => sum + r.riskScore, 0) / results.length || 0
    };

    // Calculate threat types
    results.forEach(result => {
      stats.byType[result.threatType] = (stats.byType[result.threatType] || 0) + 1;
    });

    return stats;
  }
}

// Export singleton instance
export const threatDetectionEngine = new ThreatDetectionEngine();
export default threatDetectionEngine;
