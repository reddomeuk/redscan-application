/**
 * ML Analytics Engine
 * Machine learning engine for threat detection, behavioral analysis, and predictive insights
 */

import { EventEmitter } from 'events';

class MLAnalyticsEngine extends EventEmitter {
  constructor() {
    super();
    this.models = new Map();
    this.trainingData = new Map();
    this.predictions = new Map();
    this.anomalyDetectors = new Map();
    this.behavioralProfiles = new Map();
    this.threatPatterns = new Map();
    this.initialized = false;
  }

  /**
   * Initialize the ML Analytics Engine
   */
  async initialize() {
    if (this.initialized) return;

    console.log('Initializing ML Analytics Engine...');

    try {
      // Initialize ML models
      await this.initializeModels();
      
      // Load training data
      await this.loadTrainingData();
      
      // Setup anomaly detectors
      await this.setupAnomalyDetectors();
      
      // Initialize behavioral analysis
      await this.initializeBehavioralAnalysis();
      
      // Setup real-time processing
      this.setupRealTimeProcessing();
      
      this.initialized = true;
      console.log('ML Analytics Engine initialized successfully');
      this.emit('initialized');
    } catch (error) {
      console.error('Failed to initialize ML Analytics Engine:', error);
      throw error;
    }
  }

  /**
   * Initialize machine learning models
   */
  async initializeModels() {
    const modelConfigs = [
      {
        name: 'threat_detection',
        type: 'RandomForest',
        purpose: 'Detect malicious activities and threats',
        features: ['network_traffic', 'user_behavior', 'file_operations', 'system_events'],
        hyperparameters: {
          n_estimators: 100,
          max_depth: 10,
          min_samples_split: 5
        }
      },
      {
        name: 'behavioral_analysis',
        type: 'DeepNeuralNetwork',
        purpose: 'Analyze user and entity behavior patterns',
        features: ['login_patterns', 'access_patterns', 'time_series', 'location_data'],
        hyperparameters: {
          layers: [128, 64, 32],
          activation: 'relu',
          dropout: 0.3,
          learning_rate: 0.001
        }
      },
      {
        name: 'anomaly_detection',
        type: 'IsolationForest',
        purpose: 'Detect anomalous behavior and outliers',
        features: ['statistical_features', 'temporal_features', 'contextual_features'],
        hyperparameters: {
          contamination: 0.1,
          n_estimators: 100,
          random_state: 42
        }
      },
      {
        name: 'predictive_analytics',
        type: 'GradientBoosting',
        purpose: 'Predict future security incidents and trends',
        features: ['historical_incidents', 'threat_intelligence', 'environmental_factors'],
        hyperparameters: {
          n_estimators: 200,
          learning_rate: 0.1,
          max_depth: 6
        }
      }
    ];

    for (const config of modelConfigs) {
      const model = await this.createModel(config);
      this.models.set(config.name, model);
      console.log(`Initialized ${config.name} model (${config.type})`);
    }
  }

  /**
   * Create a machine learning model
   */
  async createModel(config) {
    return {
      name: config.name,
      type: config.type,
      purpose: config.purpose,
      features: config.features,
      hyperparameters: config.hyperparameters,
      trained: false,
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1Score: 0,
      trainingHistory: [],
      predictions: 0,
      lastTrained: null,
      version: '1.0.0',
      
      // Model methods
      train: async (trainingData) => {
        console.log(`Training ${config.name} model...`);
        
        // Simulate training process
        const startTime = Date.now();
        
        // Feature extraction and preprocessing
        const features = await this.extractFeatures(trainingData, config.features);
        
        // Model training simulation
        const trainingResults = await this.simulateTraining(config, features);
        
        // Update model metrics
        Object.assign(this, {
          trained: true,
          accuracy: trainingResults.accuracy,
          precision: trainingResults.precision,
          recall: trainingResults.recall,
          f1Score: trainingResults.f1Score,
          lastTrained: new Date().toISOString(),
          trainingDuration: Date.now() - startTime
        });

        console.log(`${config.name} training completed - Accuracy: ${(trainingResults.accuracy * 100).toFixed(1)}%`);
        return trainingResults;
      },
      
      predict: async (inputData) => {
        if (!this.trained) {
          throw new Error(`Model ${config.name} must be trained before making predictions`);
        }
        
        // Extract features from input data
        const features = await this.extractFeatures(inputData, config.features);
        
        // Generate prediction
        const prediction = await this.generatePrediction(config, features);
        
        this.predictions++;
        return prediction;
      },
      
      evaluate: async (testData) => {
        const predictions = await Promise.all(
          testData.map(data => this.predict(data))
        );
        
        // Calculate evaluation metrics
        return this.calculateMetrics(testData, predictions);
      }
    };
  }

  /**
   * Extract features from input data
   */
  async extractFeatures(data, featureList) {
    const features = {};
    
    for (const featureName of featureList) {
      switch (featureName) {
        case 'network_traffic':
          features.network_traffic = this.extractNetworkFeatures(data);
          break;
        case 'user_behavior':
          features.user_behavior = this.extractUserBehaviorFeatures(data);
          break;
        case 'file_operations':
          features.file_operations = this.extractFileOperationFeatures(data);
          break;
        case 'system_events':
          features.system_events = this.extractSystemEventFeatures(data);
          break;
        case 'login_patterns':
          features.login_patterns = this.extractLoginPatternFeatures(data);
          break;
        case 'access_patterns':
          features.access_patterns = this.extractAccessPatternFeatures(data);
          break;
        case 'time_series':
          features.time_series = this.extractTimeSeriesFeatures(data);
          break;
        case 'statistical_features':
          features.statistical_features = this.extractStatisticalFeatures(data);
          break;
        case 'temporal_features':
          features.temporal_features = this.extractTemporalFeatures(data);
          break;
        case 'contextual_features':
          features.contextual_features = this.extractContextualFeatures(data);
          break;
        default:
          console.warn(`Unknown feature type: ${featureName}`);
      }
    }
    
    return features;
  }

  /**
   * Feature extraction methods
   */
  extractNetworkFeatures(data) {
    return {
      bytes_in: data.network?.bytes_in || 0,
      bytes_out: data.network?.bytes_out || 0,
      connections: data.network?.connections || 0,
      unique_ips: data.network?.unique_ips || 0,
      port_diversity: data.network?.port_diversity || 0,
      protocol_distribution: data.network?.protocol_distribution || {},
      anomalous_ports: data.network?.anomalous_ports || 0
    };
  }

  extractUserBehaviorFeatures(data) {
    return {
      login_frequency: data.user?.login_frequency || 0,
      session_duration: data.user?.session_duration || 0,
      failed_logins: data.user?.failed_logins || 0,
      privilege_escalations: data.user?.privilege_escalations || 0,
      off_hours_activity: data.user?.off_hours_activity || 0,
      location_changes: data.user?.location_changes || 0,
      device_switches: data.user?.device_switches || 0
    };
  }

  extractFileOperationFeatures(data) {
    return {
      files_accessed: data.files?.accessed || 0,
      files_modified: data.files?.modified || 0,
      files_deleted: data.files?.deleted || 0,
      large_file_transfers: data.files?.large_transfers || 0,
      sensitive_file_access: data.files?.sensitive_access || 0,
      executable_downloads: data.files?.executable_downloads || 0
    };
  }

  extractSystemEventFeatures(data) {
    return {
      process_creations: data.system?.process_creations || 0,
      registry_modifications: data.system?.registry_modifications || 0,
      service_changes: data.system?.service_changes || 0,
      driver_loads: data.system?.driver_loads || 0,
      privilege_changes: data.system?.privilege_changes || 0,
      scheduled_tasks: data.system?.scheduled_tasks || 0
    };
  }

  extractLoginPatternFeatures(data) {
    return {
      login_times: data.login?.times || [],
      login_locations: data.login?.locations || [],
      login_devices: data.login?.devices || [],
      login_success_rate: data.login?.success_rate || 1,
      time_between_logins: data.login?.time_between || 0
    };
  }

  extractAccessPatternFeatures(data) {
    return {
      resources_accessed: data.access?.resources || [],
      access_frequency: data.access?.frequency || 0,
      access_duration: data.access?.duration || 0,
      unusual_access: data.access?.unusual || 0,
      permission_requests: data.access?.permission_requests || 0
    };
  }

  extractTimeSeriesFeatures(data) {
    const timeSeries = data.timeSeries || [];
    return {
      mean: this.calculateMean(timeSeries),
      variance: this.calculateVariance(timeSeries),
      trend: this.calculateTrend(timeSeries),
      seasonality: this.calculateSeasonality(timeSeries),
      anomaly_score: this.calculateAnomalyScore(timeSeries)
    };
  }

  extractStatisticalFeatures(data) {
    const values = data.values || [];
    return {
      mean: this.calculateMean(values),
      median: this.calculateMedian(values),
      std_dev: this.calculateStdDev(values),
      skewness: this.calculateSkewness(values),
      kurtosis: this.calculateKurtosis(values),
      percentiles: this.calculatePercentiles(values)
    };
  }

  extractTemporalFeatures(data) {
    return {
      hour_of_day: new Date(data.timestamp).getHours(),
      day_of_week: new Date(data.timestamp).getDay(),
      is_weekend: [0, 6].includes(new Date(data.timestamp).getDay()),
      is_business_hours: this.isBusinessHours(data.timestamp),
      time_since_last_event: data.time_since_last || 0
    };
  }

  extractContextualFeatures(data) {
    return {
      user_role: data.context?.user_role || 'unknown',
      department: data.context?.department || 'unknown',
      asset_criticality: data.context?.asset_criticality || 'low',
      security_zone: data.context?.security_zone || 'unknown',
      compliance_requirements: data.context?.compliance || []
    };
  }

  /**
   * Simulate model training
   */
  async simulateTraining(config, features) {
    // Simulate training time based on model complexity
    const trainingTime = {
      'RandomForest': 2000,
      'DeepNeuralNetwork': 5000,
      'IsolationForest': 1500,
      'GradientBoosting': 3000
    }[config.type] || 2000;

    await new Promise(resolve => setTimeout(resolve, Math.random() * trainingTime));

    // Generate realistic performance metrics
    const baseAccuracy = {
      'RandomForest': 0.88,
      'DeepNeuralNetwork': 0.85,
      'IsolationForest': 0.82,
      'GradientBoosting': 0.90
    }[config.type] || 0.85;

    const accuracy = baseAccuracy + (Math.random() * 0.1 - 0.05);
    const precision = accuracy + (Math.random() * 0.05 - 0.025);
    const recall = accuracy + (Math.random() * 0.05 - 0.025);
    const f1Score = 2 * (precision * recall) / (precision + recall);

    return {
      accuracy: Math.min(0.99, Math.max(0.7, accuracy)),
      precision: Math.min(0.99, Math.max(0.7, precision)),
      recall: Math.min(0.99, Math.max(0.7, recall)),
      f1Score: Math.min(0.99, Math.max(0.7, f1Score))
    };
  }

  /**
   * Generate prediction from model
   */
  async generatePrediction(config, features) {
    // Simulate prediction calculation
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100));

    const predictionTypes = {
      'threat_detection': () => ({
        threat_detected: Math.random() > 0.7,
        threat_type: ['malware', 'phishing', 'insider', 'external'][Math.floor(Math.random() * 4)],
        confidence: Math.random() * 0.4 + 0.6,
        severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
        risk_score: Math.random() * 100
      }),
      
      'behavioral_analysis': () => ({
        anomalous: Math.random() > 0.8,
        anomaly_type: ['login', 'access', 'network', 'file'][Math.floor(Math.random() * 4)],
        baseline_deviation: Math.random() * 0.5,
        behavior_score: Math.random() * 100,
        patterns: this.generateBehaviorPatterns()
      }),
      
      'anomaly_detection': () => ({
        is_anomaly: Math.random() > 0.85,
        anomaly_score: Math.random(),
        isolation_score: Math.random(),
        feature_importance: this.generateFeatureImportance(features),
        outlier_factor: Math.random() * 2
      }),
      
      'predictive_analytics': () => ({
        risk_level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        probability: Math.random(),
        time_horizon: Math.floor(Math.random() * 30) + 1, // days
        predicted_threats: this.generatePredictedThreats(),
        impact_assessment: this.generateImpactAssessment()
      })
    };

    const generator = predictionTypes[config.name];
    if (!generator) {
      throw new Error(`No prediction generator for model: ${config.name}`);
    }

    return {
      model: config.name,
      timestamp: new Date().toISOString(),
      prediction: generator(),
      features_used: Object.keys(features),
      processing_time: Math.random() * 100 + 10 // ms
    };
  }

  /**
   * Generate behavior patterns
   */
  generateBehaviorPatterns() {
    return {
      login_pattern: Math.random() > 0.5 ? 'regular' : 'irregular',
      access_pattern: Math.random() > 0.6 ? 'normal' : 'suspicious',
      time_pattern: Math.random() > 0.7 ? 'business_hours' : 'off_hours',
      location_pattern: Math.random() > 0.8 ? 'consistent' : 'variable'
    };
  }

  /**
   * Generate feature importance scores
   */
  generateFeatureImportance(features) {
    const importance = {};
    Object.keys(features).forEach(feature => {
      importance[feature] = Math.random();
    });
    return importance;
  }

  /**
   * Generate predicted threats
   */
  generatePredictedThreats() {
    const threats = ['malware', 'phishing', 'insider_threat', 'data_breach', 'ddos'];
    return threats.filter(() => Math.random() > 0.7).map(threat => ({
      type: threat,
      probability: Math.random(),
      severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
    }));
  }

  /**
   * Generate impact assessment
   */
  generateImpactAssessment() {
    return {
      financial_impact: Math.floor(Math.random() * 1000000),
      operational_impact: ['minimal', 'moderate', 'significant'][Math.floor(Math.random() * 3)],
      reputation_impact: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      compliance_impact: Math.random() > 0.7
    };
  }

  /**
   * Load training data for models
   */
  async loadTrainingData() {
    console.log('Loading training data...');
    
    // Simulate loading different types of training data
    const dataTypes = [
      'security_events',
      'user_activities', 
      'network_traffic',
      'system_logs',
      'threat_intelligence'
    ];

    for (const dataType of dataTypes) {
      const data = await this.generateTrainingData(dataType);
      this.trainingData.set(dataType, data);
      console.log(`Loaded ${data.length} samples for ${dataType}`);
    }
  }

  /**
   * Generate mock training data
   */
  async generateTrainingData(dataType) {
    const sampleSize = Math.floor(Math.random() * 1000) + 500;
    const data = [];

    for (let i = 0; i < sampleSize; i++) {
      data.push(this.generateSample(dataType));
    }

    return data;
  }

  /**
   * Generate a single training sample
   */
  generateSample(dataType) {
    const generators = {
      security_events: () => ({
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        event_type: ['login', 'logout', 'file_access', 'network_connection'][Math.floor(Math.random() * 4)],
        user_id: `user_${Math.floor(Math.random() * 1000)}`,
        asset_id: `asset_${Math.floor(Math.random() * 500)}`,
        severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
        label: Math.random() > 0.8 ? 'malicious' : 'benign'
      }),
      
      user_activities: () => ({
        user_id: `user_${Math.floor(Math.random() * 1000)}`,
        session_duration: Math.random() * 8 * 60 * 60, // seconds
        login_time: new Date().toISOString(),
        failed_attempts: Math.floor(Math.random() * 5),
        location: ['office', 'home', 'travel'][Math.floor(Math.random() * 3)],
        device_type: ['laptop', 'desktop', 'mobile'][Math.floor(Math.random() * 3)]
      }),
      
      network_traffic: () => ({
        source_ip: this.generateRandomIP(),
        dest_ip: this.generateRandomIP(),
        port: Math.floor(Math.random() * 65535),
        protocol: ['TCP', 'UDP', 'ICMP'][Math.floor(Math.random() * 3)],
        bytes: Math.floor(Math.random() * 1000000),
        packets: Math.floor(Math.random() * 1000),
        duration: Math.random() * 3600
      }),
      
      system_logs: () => ({
        timestamp: new Date().toISOString(),
        log_level: ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'][Math.floor(Math.random() * 5)],
        process: `process_${Math.floor(Math.random() * 100)}`,
        message: 'System event occurred',
        cpu_usage: Math.random() * 100,
        memory_usage: Math.random() * 100
      }),
      
      threat_intelligence: () => ({
        ioc_type: ['ip', 'domain', 'hash', 'url'][Math.floor(Math.random() * 4)],
        ioc_value: this.generateRandomIOC(),
        threat_type: ['malware', 'phishing', 'botnet', 'apt'][Math.floor(Math.random() * 4)],
        confidence: Math.random(),
        severity: Math.floor(Math.random() * 10) + 1,
        first_seen: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
      })
    };

    return generators[dataType]?.() || {};
  }

  /**
   * Setup anomaly detectors
   */
  async setupAnomalyDetectors() {
    const detectorConfigs = [
      {
        name: 'user_behavior',
        threshold: 0.8,
        window_size: 24, // hours
        features: ['login_times', 'access_patterns', 'location']
      },
      {
        name: 'network_traffic',
        threshold: 0.85,
        window_size: 1, // hour
        features: ['bytes_transferred', 'connection_count', 'unique_ips']
      },
      {
        name: 'system_activity',
        threshold: 0.75,
        window_size: 6, // hours
        features: ['process_activity', 'file_operations', 'registry_changes']
      }
    ];

    for (const config of detectorConfigs) {
      const detector = this.createAnomalyDetector(config);
      this.anomalyDetectors.set(config.name, detector);
      console.log(`Setup anomaly detector: ${config.name}`);
    }
  }

  /**
   * Create an anomaly detector
   */
  createAnomalyDetector(config) {
    return {
      name: config.name,
      threshold: config.threshold,
      windowSize: config.window_size,
      features: config.features,
      baseline: new Map(),
      anomalies: [],
      
      detect: async (data) => {
        // Extract features for anomaly detection
        const features = await this.extractFeatures(data, config.features);
        
        // Calculate anomaly score
        const anomalyScore = this.calculateAnomalyScore(features, config.name);
        
        // Check if anomaly
        const isAnomaly = anomalyScore > config.threshold;
        
        if (isAnomaly) {
          const anomaly = {
            timestamp: new Date().toISOString(),
            score: anomalyScore,
            features,
            data,
            detector: config.name
          };
          
          this.anomalies.push(anomaly);
          this.emit('anomaly-detected', anomaly);
        }
        
        return {
          isAnomaly,
          score: anomalyScore,
          threshold: config.threshold
        };
      },
      
      updateBaseline: (data) => {
        // Update baseline model with new data
        config.features.forEach(feature => {
          if (!this.baseline.has(feature)) {
            this.baseline.set(feature, []);
          }
          
          const values = this.baseline.get(feature);
          values.push(data[feature]);
          
          // Keep only recent values for baseline
          if (values.length > 1000) {
            values.shift();
          }
        });
      }
    };
  }

  /**
   * Initialize behavioral analysis
   */
  async initializeBehavioralAnalysis() {
    console.log('Initializing behavioral analysis...');
    
    // Create behavioral profiles for different entity types
    const entityTypes = ['user', 'device', 'network', 'application'];
    
    for (const entityType of entityTypes) {
      const profile = this.createBehavioralProfile(entityType);
      this.behavioralProfiles.set(entityType, profile);
    }
  }

  /**
   * Create a behavioral profile
   */
  createBehavioralProfile(entityType) {
    return {
      entityType,
      profiles: new Map(),
      
      analyzeEntity: async (entityId, activities) => {
        if (!this.profiles.has(entityId)) {
          this.profiles.set(entityId, {
            baseline: {},
            patterns: {},
            anomalies: [],
            riskScore: 0
          });
        }
        
        const profile = this.profiles.get(entityId);
        
        // Analyze current activities against baseline
        const analysis = await this.analyzeBehavior(activities, profile.baseline);
        
        // Update profile
        profile.riskScore = analysis.riskScore;
        if (analysis.isAnomalous) {
          profile.anomalies.push({
            timestamp: new Date().toISOString(),
            anomaly: analysis.anomaly,
            activities
          });
        }
        
        return analysis;
      },
      
      updateBaseline: (entityId, activities) => {
        if (!this.profiles.has(entityId)) {
          this.profiles.set(entityId, {
            baseline: {},
            patterns: {},
            anomalies: [],
            riskScore: 0
          });
        }
        
        const profile = this.profiles.get(entityId);
        
        // Update baseline with new activities
        Object.keys(activities).forEach(key => {
          if (!profile.baseline[key]) {
            profile.baseline[key] = [];
          }
          profile.baseline[key].push(activities[key]);
          
          // Keep baseline size manageable
          if (profile.baseline[key].length > 100) {
            profile.baseline[key].shift();
          }
        });
      }
    };
  }

  /**
   * Setup real-time processing
   */
  setupRealTimeProcessing() {
    console.log('Setting up real-time processing...');
    
    // Setup event processing pipeline
    this.on('security-event', this.processSecurityEvent.bind(this));
    this.on('user-activity', this.processUserActivity.bind(this));
    this.on('network-event', this.processNetworkEvent.bind(this));
    
    // Setup periodic analysis
    setInterval(() => {
      this.performPeriodicAnalysis();
    }, 60000); // Every minute
  }

  /**
   * Process security events in real-time
   */
  async processSecurityEvent(event) {
    try {
      // Run through all relevant models
      const predictions = await Promise.all([
        this.models.get('threat_detection')?.predict(event),
        this.models.get('anomaly_detection')?.predict(event)
      ].filter(Boolean));
      
      // Combine predictions
      const combinedAnalysis = this.combinePredictions(predictions);
      
      // Check for anomalies
      for (const [name, detector] of this.anomalyDetectors) {
        const result = await detector.detect(event);
        if (result.isAnomaly) {
          this.emit('anomaly-detected', {
            detector: name,
            event,
            result
          });
        }
      }
      
      // Emit analysis results
      this.emit('analysis-complete', {
        event,
        analysis: combinedAnalysis,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error processing security event:', error);
    }
  }

  /**
   * Process user activity events
   */
  async processUserActivity(activity) {
    try {
      const userProfile = this.behavioralProfiles.get('user');
      if (userProfile) {
        const analysis = await userProfile.analyzeEntity(activity.user_id, activity);
        
        if (analysis.isAnomalous) {
          this.emit('behavioral-anomaly', {
            type: 'user',
            userId: activity.user_id,
            analysis,
            activity
          });
        }
        
        // Update baseline
        userProfile.updateBaseline(activity.user_id, activity);
      }
    } catch (error) {
      console.error('Error processing user activity:', error);
    }
  }

  /**
   * Process network events
   */
  async processNetworkEvent(event) {
    try {
      const networkDetector = this.anomalyDetectors.get('network_traffic');
      if (networkDetector) {
        const result = await networkDetector.detect(event);
        
        if (result.isAnomaly) {
          this.emit('network-anomaly', {
            event,
            result,
            timestamp: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Error processing network event:', error);
    }
  }

  /**
   * Perform periodic analysis
   */
  async performPeriodicAnalysis() {
    try {
      // Generate predictive insights
      const insights = await this.generatePredictiveInsights();
      this.emit('predictive-insights', insights);
      
      // Update threat patterns
      await this.updateThreatPatterns();
      
      // Cleanup old data
      this.cleanupOldData();
      
    } catch (error) {
      console.error('Error in periodic analysis:', error);
    }
  }

  /**
   * Generate predictive insights
   */
  async generatePredictiveInsights() {
    const model = this.models.get('predictive_analytics');
    if (!model || !model.trained) return [];
    
    // Analyze recent trends and patterns
    const recentData = this.getRecentAnalysisData();
    const predictions = await model.predict(recentData);
    
    return this.formatPredictiveInsights(predictions);
  }

  /**
   * Update threat patterns
   */
  async updateThreatPatterns() {
    // Analyze recent threats to identify patterns
    const recentThreats = this.getRecentThreats();
    
    // Extract patterns
    const patterns = this.extractThreatPatterns(recentThreats);
    
    // Update pattern database
    patterns.forEach(pattern => {
      this.threatPatterns.set(pattern.id, pattern);
    });
  }

  /**
   * Utility methods for calculations
   */
  calculateMean(values) {
    return values.length ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
  }

  calculateVariance(values) {
    const mean = this.calculateMean(values);
    return values.length ? 
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length : 0;
  }

  calculateStdDev(values) {
    return Math.sqrt(this.calculateVariance(values));
  }

  calculateMedian(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  calculateTrend(timeSeries) {
    if (timeSeries.length < 2) return 0;
    
    // Simple linear trend calculation
    const n = timeSeries.length;
    const sumX = timeSeries.reduce((sum, _, i) => sum + i, 0);
    const sumY = timeSeries.reduce((sum, val) => sum + val, 0);
    const sumXY = timeSeries.reduce((sum, val, i) => sum + i * val, 0);
    const sumXX = timeSeries.reduce((sum, _, i) => sum + i * i, 0);
    
    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  calculateSeasonality(timeSeries) {
    // Simplified seasonality detection
    if (timeSeries.length < 4) return 0;
    
    const quarters = Math.floor(timeSeries.length / 4);
    const seasonal = [];
    
    for (let i = 0; i < 4; i++) {
      const quarterValues = [];
      for (let j = i; j < timeSeries.length; j += 4) {
        quarterValues.push(timeSeries[j]);
      }
      seasonal.push(this.calculateMean(quarterValues));
    }
    
    return this.calculateVariance(seasonal);
  }

  calculateAnomalyScore(data, detectorName = null) {
    // Simple anomaly score calculation
    // In a real implementation, this would use the trained models
    const features = Array.isArray(data) ? data : Object.values(data);
    const mean = this.calculateMean(features);
    const stdDev = this.calculateStdDev(features);
    
    // Z-score based anomaly detection
    const zScores = features.map(val => Math.abs((val - mean) / (stdDev || 1)));
    return Math.max(...zScores) / 3; // Normalize to 0-1 range
  }

  isBusinessHours(timestamp) {
    const date = new Date(timestamp);
    const hour = date.getHours();
    const day = date.getDay();
    
    // Business hours: Monday-Friday, 9 AM - 5 PM
    return day >= 1 && day <= 5 && hour >= 9 && hour < 17;
  }

  generateRandomIP() {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  }

  generateRandomIOC() {
    const types = {
      ip: () => this.generateRandomIP(),
      domain: () => `malicious${Math.floor(Math.random() * 1000)}.com`,
      hash: () => Math.random().toString(36).substring(2, 34),
      url: () => `http://malicious${Math.floor(Math.random() * 1000)}.com/path`
    };
    
    const type = ['ip', 'domain', 'hash', 'url'][Math.floor(Math.random() * 4)];
    return types[type]();
  }

  /**
   * Train all models with current data
   */
  async trainAllModels() {
    console.log('Training all ML models...');
    
    const results = {};
    
    for (const [name, model] of this.models) {
      try {
        const trainingData = this.trainingData.get('security_events') || [];
        const result = await model.train(trainingData);
        results[name] = result;
        console.log(`${name} training completed`);
      } catch (error) {
        console.error(`Failed to train ${name}:`, error);
        results[name] = { error: error.message };
      }
    }
    
    this.emit('training-complete', results);
    return results;
  }

  /**
   * Get analytics summary
   */
  getAnalyticsSummary() {
    return {
      models: Array.from(this.models.entries()).map(([name, model]) => ({
        name,
        type: model.type,
        trained: model.trained,
        accuracy: model.accuracy,
        predictions: model.predictions,
        lastTrained: model.lastTrained
      })),
      
      anomalyDetectors: Array.from(this.anomalyDetectors.entries()).map(([name, detector]) => ({
        name,
        threshold: detector.threshold,
        anomaliesDetected: detector.anomalies.length
      })),
      
      behavioralProfiles: Array.from(this.behavioralProfiles.entries()).map(([type, profile]) => ({
        type,
        entitiesProfiled: profile.profiles.size
      })),
      
      threatPatterns: this.threatPatterns.size,
      initialized: this.initialized
    };
  }

  /**
   * Export model configurations
   */
  exportModelConfigurations() {
    const configs = {};
    
    this.models.forEach((model, name) => {
      configs[name] = {
        type: model.type,
        features: model.features,
        hyperparameters: model.hyperparameters,
        performance: {
          accuracy: model.accuracy,
          precision: model.precision,
          recall: model.recall,
          f1Score: model.f1Score
        },
        metadata: {
          version: model.version,
          lastTrained: model.lastTrained,
          predictions: model.predictions
        }
      };
    });
    
    return configs;
  }
}

// Create singleton instance
export const mlAnalyticsEngine = new MLAnalyticsEngine();

// Export utility functions
export const trainModel = (modelName, data) => {
  const model = mlAnalyticsEngine.models.get(modelName);
  return model ? model.train(data) : Promise.reject(new Error(`Model ${modelName} not found`));
};

export const predictThreat = (data) => {
  const model = mlAnalyticsEngine.models.get('threat_detection');
  return model ? model.predict(data) : Promise.reject(new Error('Threat detection model not available'));
};

export const detectAnomaly = (data, detectorName = 'user_behavior') => {
  const detector = mlAnalyticsEngine.anomalyDetectors.get(detectorName);
  return detector ? detector.detect(data) : Promise.reject(new Error(`Detector ${detectorName} not found`));
};

export default mlAnalyticsEngine;
