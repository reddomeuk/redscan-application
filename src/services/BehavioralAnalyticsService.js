/**
 * Behavioral Analytics Service
 * Advanced behavioral analysis for user and entity behavior analytics (UEBA)
 * Provides deep insights into behavioral patterns and anomalies
 */

import EventEmitter from '../utils/EventEmitter.js';

// User Behavior Profile
class UserBehaviorProfile {
  constructor(userId) {
    this.userId = userId;
    this.baseline = {
      loginTimes: [],
      applicationUsage: new Map(),
      dataAccess: new Map(),
      geolocation: new Map(),
      deviceUsage: new Map(),
      networkPatterns: new Map()
    };
    this.anomalies = [];
    this.riskScore = 0;
    this.lastUpdated = new Date();
  }

  updateBaseline(activity) {
    const hour = new Date(activity.timestamp).getHours();
    this.baseline.loginTimes.push(hour);
    
    if (activity.application) {
      const count = this.baseline.applicationUsage.get(activity.application) || 0;
      this.baseline.applicationUsage.set(activity.application, count + 1);
    }
    
    if (activity.dataAccessed) {
      const count = this.baseline.dataAccess.get(activity.dataAccessed) || 0;
      this.baseline.dataAccess.set(activity.dataAccessed, count + 1);
    }
    
    if (activity.location) {
      const count = this.baseline.geolocation.get(activity.location) || 0;
      this.baseline.geolocation.set(activity.location, count + 1);
    }
    
    this.lastUpdated = new Date();
  }

  calculateRiskScore() {
    let riskScore = 0;
    const recentAnomalies = this.anomalies.filter(a => 
      new Date(a.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    
    // Base risk from recent anomalies
    riskScore += recentAnomalies.length * 0.1;
    
    // High-severity anomalies
    const highSeverityAnomalies = recentAnomalies.filter(a => a.severity === 'high');
    riskScore += highSeverityAnomalies.length * 0.3;
    
    // Critical anomalies
    const criticalAnomalies = recentAnomalies.filter(a => a.severity === 'critical');
    riskScore += criticalAnomalies.length * 0.5;
    
    this.riskScore = Math.min(1.0, riskScore);
    return this.riskScore;
  }

  addAnomaly(anomaly) {
    this.anomalies.push({
      ...anomaly,
      timestamp: new Date(),
      profileId: this.userId
    });
    
    // Keep only last 100 anomalies
    if (this.anomalies.length > 100) {
      this.anomalies = this.anomalies.slice(-100);
    }
    
    this.calculateRiskScore();
  }
}

// Entity Behavior Profile (for devices, applications, etc.)
class EntityBehaviorProfile {
  constructor(entityId, entityType) {
    this.entityId = entityId;
    this.entityType = entityType; // device, application, service, etc.
    this.baseline = {
      usagePatterns: new Map(),
      performanceMetrics: [],
      networkConnections: new Map(),
      resourceConsumption: []
    };
    this.anomalies = [];
    this.riskScore = 0;
    this.lastUpdated = new Date();
  }

  updateBaseline(activity) {
    if (activity.usage) {
      const hour = new Date(activity.timestamp).getHours();
      const currentUsage = this.baseline.usagePatterns.get(hour) || [];
      currentUsage.push(activity.usage);
      this.baseline.usagePatterns.set(hour, currentUsage);
    }
    
    if (activity.performance) {
      this.baseline.performanceMetrics.push(activity.performance);
      if (this.baseline.performanceMetrics.length > 1000) {
        this.baseline.performanceMetrics = this.baseline.performanceMetrics.slice(-1000);
      }
    }
    
    this.lastUpdated = new Date();
  }

  calculateRiskScore() {
    let riskScore = 0;
    const recentAnomalies = this.anomalies.filter(a => 
      new Date(a.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    
    riskScore += recentAnomalies.length * 0.15;
    
    // Entity-specific risk factors
    if (this.entityType === 'device') {
      const suspiciousConnections = recentAnomalies.filter(a => 
        a.type === 'suspicious_connection'
      );
      riskScore += suspiciousConnections.length * 0.2;
    }
    
    this.riskScore = Math.min(1.0, riskScore);
    return this.riskScore;
  }
}

// Behavioral Pattern Analyzer
class BehavioralPatternAnalyzer {
  constructor() {
    this.patterns = new Map();
    this.temporalAnalysis = new TemporalAnalyzer();
    this.geographicalAnalysis = new GeographicalAnalyzer();
    this.applicationAnalysis = new ApplicationAnalyzer();
  }

  analyzeUserActivity(userId, activity) {
    const analysis = {
      userId,
      activity,
      anomalies: [],
      riskScore: 0,
      patterns: []
    };

    // Temporal analysis
    const temporalAnomalies = this.temporalAnalysis.analyze(userId, activity);
    analysis.anomalies.push(...temporalAnomalies);

    // Geographical analysis
    const geoAnomalies = this.geographicalAnalysis.analyze(userId, activity);
    analysis.anomalies.push(...geoAnomalies);

    // Application usage analysis
    const appAnomalies = this.applicationAnalysis.analyze(userId, activity);
    analysis.anomalies.push(...appAnomalies);

    // Calculate overall risk score
    analysis.riskScore = this.calculateActivityRiskScore(analysis.anomalies);

    return analysis;
  }

  calculateActivityRiskScore(anomalies) {
    if (anomalies.length === 0) return 0;

    let totalRisk = 0;
    for (const anomaly of anomalies) {
      switch (anomaly.severity) {
        case 'critical': totalRisk += 0.8; break;
        case 'high': totalRisk += 0.6; break;
        case 'medium': totalRisk += 0.4; break;
        case 'low': totalRisk += 0.2; break;
        default: totalRisk += 0.1; break;
      }
    }

    return Math.min(1.0, totalRisk / anomalies.length);
  }
}

// Temporal Analysis Component
class TemporalAnalyzer {
  constructor() {
    this.userPatterns = new Map();
  }

  analyze(userId, activity) {
    const anomalies = [];
    const timestamp = new Date(activity.timestamp);
    const hour = timestamp.getHours();
    const dayOfWeek = timestamp.getDay();

    const userPattern = this.userPatterns.get(userId) || this.createDefaultPattern();
    
    // Check for unusual time patterns
    if (activity.type === 'login') {
      const isUnusualHour = !userPattern.normalHours.includes(hour);
      const isWeekendLogin = (dayOfWeek === 0 || dayOfWeek === 6) && !userPattern.weekendActive;
      
      if (isUnusualHour) {
        anomalies.push({
          type: 'unusual_time',
          severity: 'medium',
          description: `Login at unusual hour: ${hour}:00`,
          confidence: 0.7
        });
      }
      
      if (isWeekendLogin) {
        anomalies.push({
          type: 'weekend_activity',
          severity: 'low',
          description: 'Weekend login detected',
          confidence: 0.5
        });
      }
    }

    // Check for rapid consecutive activities
    if (activity.consecutiveActions > userPattern.averageActions * 2) {
      anomalies.push({
        type: 'rapid_activity',
        severity: 'high',
        description: `Rapid consecutive actions: ${activity.consecutiveActions}`,
        confidence: 0.8
      });
    }

    return anomalies;
  }

  createDefaultPattern() {
    return {
      normalHours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
      weekendActive: false,
      averageActions: 25
    };
  }
}

// Geographical Analysis Component
class GeographicalAnalyzer {
  constructor() {
    this.userLocations = new Map();
  }

  analyze(userId, activity) {
    const anomalies = [];
    
    if (!activity.geolocation) return anomalies;

    const userLocations = this.userLocations.get(userId) || new Set();
    const currentLocation = `${activity.geolocation.country}_${activity.geolocation.city}`;
    
    // Check for new locations
    if (!userLocations.has(currentLocation)) {
      const distance = this.calculateDistance(userLocations, activity.geolocation);
      
      if (distance > 1000) { // More than 1000km from known locations
        anomalies.push({
          type: 'unusual_location',
          severity: 'high',
          description: `Login from new distant location: ${activity.geolocation.city}, ${activity.geolocation.country}`,
          confidence: 0.9
        });
      } else if (distance > 100) {
        anomalies.push({
          type: 'new_location',
          severity: 'medium',
          description: `Login from new location: ${activity.geolocation.city}`,
          confidence: 0.6
        });
      }
      
      userLocations.add(currentLocation);
      this.userLocations.set(userId, userLocations);
    }

    // Check for impossible travel
    const lastActivity = this.getLastActivity(userId);
    if (lastActivity && lastActivity.geolocation) {
      const travelTime = new Date(activity.timestamp) - new Date(lastActivity.timestamp);
      const distance = this.calculateDistance([lastActivity.geolocation], activity.geolocation);
      const maxPossibleSpeed = 900; // km/h (airplane speed)
      const requiredSpeed = distance / (travelTime / (1000 * 60 * 60)); // km/h
      
      if (requiredSpeed > maxPossibleSpeed) {
        anomalies.push({
          type: 'impossible_travel',
          severity: 'critical',
          description: `Impossible travel detected: ${distance}km in ${travelTime/60000} minutes`,
          confidence: 0.95
        });
      }
    }

    return anomalies;
  }

  calculateDistance(knownLocations, newLocation) {
    // Simplified distance calculation
    // In a real implementation, this would use proper geographical distance calculation
    if (knownLocations.size === 0) return 0;
    
    // For demonstration, return a random distance based on country difference
    const knownCountries = Array.from(knownLocations).map(loc => {
      if (typeof loc === 'string') return loc.split('_')[0];
      return loc.country;
    });
    
    if (!knownCountries.includes(newLocation.country)) {
      return Math.random() * 5000 + 500; // 500-5500 km for different countries
    }
    
    return Math.random() * 200; // 0-200 km for same country
  }

  getLastActivity(userId) {
    // In a real implementation, this would retrieve the last activity from storage
    return null;
  }
}

// Application Usage Analysis Component
class ApplicationAnalyzer {
  constructor() {
    this.userApplications = new Map();
  }

  analyze(userId, activity) {
    const anomalies = [];
    
    if (!activity.application) return anomalies;

    const userApps = this.userApplications.get(userId) || new Map();
    const appUsage = userApps.get(activity.application) || { count: 0, firstSeen: new Date() };
    
    // Check for new application usage
    if (appUsage.count === 0) {
      // Check if it's a risky application
      const riskyApps = ['tor', 'vpn', 'wireshark', 'nmap', 'metasploit'];
      if (riskyApps.some(app => activity.application.toLowerCase().includes(app))) {
        anomalies.push({
          type: 'risky_application',
          severity: 'high',
          description: `Usage of security/privacy tool: ${activity.application}`,
          confidence: 0.8
        });
      } else {
        anomalies.push({
          type: 'new_application',
          severity: 'low',
          description: `First use of application: ${activity.application}`,
          confidence: 0.4
        });
      }
    }

    // Check for unusual application behavior
    if (activity.dataAccessed && activity.dataAccessed > appUsage.averageDataAccess * 3) {
      anomalies.push({
        type: 'excessive_data_access',
        severity: 'medium',
        description: `Application accessing excessive data: ${activity.dataAccessed} items`,
        confidence: 0.7
      });
    }

    // Update usage statistics
    appUsage.count++;
    appUsage.lastUsed = new Date();
    appUsage.averageDataAccess = appUsage.averageDataAccess || activity.dataAccessed || 0;
    userApps.set(activity.application, appUsage);
    this.userApplications.set(userId, userApps);

    return anomalies;
  }
}

// Main Behavioral Analytics Service
export class BehavioralAnalyticsService extends EventEmitter {
  constructor() {
    super();
    this.userProfiles = new Map();
    this.entityProfiles = new Map();
    this.patternAnalyzer = new BehavioralPatternAnalyzer();
    this.isRunning = false;
    this.analysisQueue = [];
    this.config = {
      profileRetentionDays: 90,
      anomalyThreshold: 0.6,
      riskScoreThreshold: 0.7
    };
  }

  async initialize() {
    try {
      console.log('Initializing Behavioral Analytics Service...');
      
      // Load existing profiles
      await this.loadProfiles();
      
      // Start background processing
      this.startBackgroundProcessing();
      
      this.isRunning = true;
      this.emit('initialized');
      
      console.log('Behavioral Analytics Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Behavioral Analytics Service:', error);
      throw error;
    }
  }

  async analyzeUserActivity(userId, activity) {
    if (!this.isRunning) {
      throw new Error('Behavioral Analytics Service not initialized');
    }

    try {
      // Get or create user profile
      let profile = this.userProfiles.get(userId);
      if (!profile) {
        profile = new UserBehaviorProfile(userId);
        this.userProfiles.set(userId, profile);
      }

      // Analyze activity patterns
      const patternAnalysis = this.patternAnalyzer.analyzeUserActivity(userId, activity);
      
      // Update profile with new activity
      profile.updateBaseline(activity);
      
      // Add anomalies to profile
      for (const anomaly of patternAnalysis.anomalies) {
        if (anomaly.confidence >= this.config.anomalyThreshold) {
          profile.addAnomaly(anomaly);
        }
      }

      // Create analysis result
      const result = {
        userId,
        activity,
        profile: {
          riskScore: profile.riskScore,
          anomalyCount: profile.anomalies.length,
          lastUpdated: profile.lastUpdated
        },
        analysis: patternAnalysis,
        timestamp: new Date()
      };

      // Emit events for high-risk activities
      if (profile.riskScore >= this.config.riskScoreThreshold) {
        this.emit('high_risk_user', result);
      }

      if (patternAnalysis.anomalies.some(a => a.severity === 'critical')) {
        this.emit('critical_anomaly', result);
      }

      this.emit('activity_analyzed', result);
      
      return result;
    } catch (error) {
      console.error('Error analyzing user activity:', error);
      throw error;
    }
  }

  async analyzeEntityBehavior(entityId, entityType, activity) {
    try {
      // Get or create entity profile
      let profile = this.entityProfiles.get(entityId);
      if (!profile) {
        profile = new EntityBehaviorProfile(entityId, entityType);
        this.entityProfiles.set(entityId, profile);
      }

      // Update profile with new activity
      profile.updateBaseline(activity);

      // Analyze for anomalies (simplified for demonstration)
      const anomalies = [];
      if (activity.networkConnections > 100) {
        anomalies.push({
          type: 'excessive_connections',
          severity: 'medium',
          description: `Entity making excessive network connections: ${activity.networkConnections}`,
          confidence: 0.7
        });
      }

      // Add anomalies to profile
      for (const anomaly of anomalies) {
        profile.anomalies.push({
          ...anomaly,
          timestamp: new Date()
        });
      }

      profile.calculateRiskScore();

      const result = {
        entityId,
        entityType,
        activity,
        profile: {
          riskScore: profile.riskScore,
          anomalyCount: profile.anomalies.length,
          lastUpdated: profile.lastUpdated
        },
        anomalies,
        timestamp: new Date()
      };

      this.emit('entity_analyzed', result);
      
      return result;
    } catch (error) {
      console.error('Error analyzing entity behavior:', error);
      throw error;
    }
  }

  getUserProfile(userId) {
    return this.userProfiles.get(userId);
  }

  getEntityProfile(entityId) {
    return this.entityProfiles.get(entityId);
  }

  getHighRiskUsers(limit = 10) {
    return Array.from(this.userProfiles.values())
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, limit)
      .map(profile => ({
        userId: profile.userId,
        riskScore: profile.riskScore,
        anomalyCount: profile.anomalies.length,
        lastUpdated: profile.lastUpdated
      }));
  }

  getRecentAnomalies(hours = 24, limit = 50) {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    const anomalies = [];

    // Collect anomalies from all profiles
    for (const profile of this.userProfiles.values()) {
      const recentAnomalies = profile.anomalies
        .filter(a => new Date(a.timestamp) > cutoff)
        .map(a => ({ ...a, profileType: 'user', profileId: profile.userId }));
      anomalies.push(...recentAnomalies);
    }

    for (const profile of this.entityProfiles.values()) {
      const recentAnomalies = profile.anomalies
        .filter(a => new Date(a.timestamp) > cutoff)
        .map(a => ({ ...a, profileType: 'entity', profileId: profile.entityId }));
      anomalies.push(...recentAnomalies);
    }

    return anomalies
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  getBehavioralStatistics() {
    const stats = {
      userProfiles: this.userProfiles.size,
      entityProfiles: this.entityProfiles.size,
      highRiskUsers: Array.from(this.userProfiles.values()).filter(p => p.riskScore >= 0.7).length,
      totalAnomalies: 0,
      anomaliesByType: {},
      averageRiskScore: 0
    };

    let totalRiskScore = 0;
    for (const profile of this.userProfiles.values()) {
      stats.totalAnomalies += profile.anomalies.length;
      totalRiskScore += profile.riskScore;
      
      for (const anomaly of profile.anomalies) {
        stats.anomaliesByType[anomaly.type] = (stats.anomaliesByType[anomaly.type] || 0) + 1;
      }
    }

    stats.averageRiskScore = this.userProfiles.size > 0 ? totalRiskScore / this.userProfiles.size : 0;

    return stats;
  }

  async loadProfiles() {
    // In a real implementation, this would load profiles from storage
    console.log('Loading behavioral profiles from storage...');
    
    // For demonstration, create some sample profiles
    const sampleUsers = ['user1', 'user2', 'admin1', 'analyst1'];
    for (const userId of sampleUsers) {
      const profile = new UserBehaviorProfile(userId);
      this.userProfiles.set(userId, profile);
    }
  }

  startBackgroundProcessing() {
    // Process analysis queue
    setInterval(() => {
      this.processAnalysisQueue();
    }, 5000);

    // Clean up old data
    setInterval(() => {
      this.cleanupOldData();
    }, 60000);
  }

  processAnalysisQueue() {
    while (this.analysisQueue.length > 0) {
      const task = this.analysisQueue.shift();
      try {
        if (task.type === 'user_activity') {
          this.analyzeUserActivity(task.userId, task.activity);
        } else if (task.type === 'entity_behavior') {
          this.analyzeEntityBehavior(task.entityId, task.entityType, task.activity);
        }
      } catch (error) {
        console.error('Error processing analysis task:', error);
      }
    }
  }

  cleanupOldData() {
    const cutoff = new Date(Date.now() - this.config.profileRetentionDays * 24 * 60 * 60 * 1000);
    
    // Clean up old anomalies from profiles
    for (const profile of this.userProfiles.values()) {
      profile.anomalies = profile.anomalies.filter(a => new Date(a.timestamp) > cutoff);
    }

    for (const profile of this.entityProfiles.values()) {
      profile.anomalies = profile.anomalies.filter(a => new Date(a.timestamp) > cutoff);
    }
  }

  queueAnalysis(type, data) {
    this.analysisQueue.push({ type, ...data });
  }
}

// Export singleton instance
export const behavioralAnalyticsService = new BehavioralAnalyticsService();
export default behavioralAnalyticsService;
