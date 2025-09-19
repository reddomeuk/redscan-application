/**
 * Threat Intelligence Service
 * Integrates with threat intelligence feeds and provides correlation capabilities
 */

import { EventEmitter } from 'events';
import { apiClient } from '../api/StandardApiClient';

class ThreatIntelligenceService extends EventEmitter {
  constructor() {
    super();
    this.feeds = new Map();
    this.iocs = new Map(); // Indicators of Compromise
    this.threatActors = new Map();
    this.campaigns = new Map();
    this.correlationRules = new Map();
    this.cache = new Map();
    this.initialized = false;
  }

  /**
   * Initialize the Threat Intelligence Service
   */
  async initialize() {
    if (this.initialized) return;

    console.log('Initializing Threat Intelligence Service...');

    try {
      // Setup threat intelligence feeds
      await this.setupThreatFeeds();
      
      // Load IOCs from various sources
      await this.loadIOCs();
      
      // Initialize correlation engine
      await this.initializeCorrelationEngine();
      
      // Setup feed synchronization
      this.setupFeedSync();
      
      // Setup real-time processing
      this.setupRealTimeProcessing();
      
      this.initialized = true;
      console.log('Threat Intelligence Service initialized successfully');
      this.emit('initialized');
    } catch (error) {
      console.error('Failed to initialize Threat Intelligence Service:', error);
      throw error;
    }
  }

  /**
   * Setup threat intelligence feeds
   */
  async setupThreatFeeds() {
    const feedConfigs = [
      {
        name: 'misp',
        type: 'MISP',
        url: import.meta.env.MISP_URL || 'https://misp.example.com',
        apiKey: import.meta.env.MISP_API_KEY,
        enabled: true,
        syncInterval: 3600000, // 1 hour
        priority: 'high'
      },
      {
        name: 'otx',
        type: 'AlienVault OTX',
        url: 'https://otx.alienvault.com/api/v1',
        apiKey: import.meta.env.OTX_API_KEY,
        enabled: true,
        syncInterval: 1800000, // 30 minutes
        priority: 'medium'
      },
      {
        name: 'virustotal',
        type: 'VirusTotal',
        url: 'https://www.virustotal.com/vtapi/v2',
        apiKey: import.meta.env.VT_API_KEY,
        enabled: true,
        syncInterval: 7200000, // 2 hours
        priority: 'medium'
      },
      {
        name: 'threatconnect',
        type: 'ThreatConnect',
        url: import.meta.env.TC_URL || 'https://api.threatconnect.com',
        apiKey: import.meta.env.TC_API_KEY,
        enabled: false,
        syncInterval: 3600000,
        priority: 'high'
      },
      {
        name: 'crowdstrike',
        type: 'CrowdStrike',
        url: 'https://api.crowdstrike.com',
        apiKey: import.meta.env.CS_API_KEY,
        enabled: false,
        syncInterval: 1800000,
        priority: 'high'
      },
      {
        name: 'custom_feeds',
        type: 'Custom',
        url: 'internal',
        enabled: true,
        syncInterval: 600000, // 10 minutes
        priority: 'high'
      }
    ];

    for (const config of feedConfigs) {
      const feed = this.createThreatFeed(config);
      this.feeds.set(config.name, feed);
      console.log(`Setup threat feed: ${config.name} (${config.type})`);
    }
  }

  /**
   * Create a threat intelligence feed
   */
  createThreatFeed(config) {
    return {
      name: config.name,
      type: config.type,
      url: config.url,
      apiKey: config.apiKey,
      enabled: config.enabled,
      syncInterval: config.syncInterval,
      priority: config.priority,
      lastSync: null,
      totalIOCs: 0,
      errorCount: 0,
      
      sync: async () => {
        if (!config.enabled) return { success: false, reason: 'Feed disabled' };
        
        console.log(`Syncing threat feed: ${config.name}`);
        
        try {
          const startTime = Date.now();
          const data = await this.fetchFeedData(config);
          
          // Process and store IOCs
          const processedIOCs = await this.processFeedData(data, config);
          
          // Update feed statistics
          this.totalIOCs += processedIOCs.length;
          this.lastSync = new Date().toISOString();
          
          const syncTime = Date.now() - startTime;
          console.log(`Synced ${processedIOCs.length} IOCs from ${config.name} in ${syncTime}ms`);
          
          this.emit('feed-synced', {
            feed: config.name,
            iocsProcessed: processedIOCs.length,
            syncTime
          });
          
          return {
            success: true,
            iocsProcessed: processedIOCs.length,
            syncTime
          };
          
        } catch (error) {
          this.errorCount++;
          console.error(`Failed to sync feed ${config.name}:`, error);
          
          this.emit('feed-error', {
            feed: config.name,
            error: error.message
          });
          
          return {
            success: false,
            error: error.message
          };
        }
      },
      
      search: async (query) => {
        return this.searchFeed(config, query);
      },
      
      getStats: () => ({
        name: config.name,
        type: config.type,
        enabled: config.enabled,
        lastSync: this.lastSync,
        totalIOCs: this.totalIOCs,
        errorCount: this.errorCount,
        priority: config.priority
      })
    };
  }

  /**
   * Fetch data from threat intelligence feed
   */
  async fetchFeedData(config) {
    switch (config.type) {
      case 'MISP':
        return this.fetchMISPData(config);
      case 'AlienVault OTX':
        return this.fetchOTXData(config);
      case 'VirusTotal':
        return this.fetchVirusTotalData(config);
      case 'ThreatConnect':
        return this.fetchThreatConnectData(config);
      case 'CrowdStrike':
        return this.fetchCrowdStrikeData(config);
      case 'Custom':
        return this.fetchCustomFeedData(config);
      default:
        throw new Error(`Unsupported feed type: ${config.type}`);
    }
  }

  /**
   * Fetch MISP data
   */
  async fetchMISPData(config) {
    // Simulate MISP API call
    return this.generateMockThreatData('misp');
  }

  /**
   * Fetch OTX data
   */
  async fetchOTXData(config) {
    // Simulate OTX API call
    return this.generateMockThreatData('otx');
  }

  /**
   * Fetch VirusTotal data
   */
  async fetchVirusTotalData(config) {
    // Simulate VirusTotal API call
    return this.generateMockThreatData('virustotal');
  }

  /**
   * Fetch ThreatConnect data
   */
  async fetchThreatConnectData(config) {
    // Simulate ThreatConnect API call
    return this.generateMockThreatData('threatconnect');
  }

  /**
   * Fetch CrowdStrike data
   */
  async fetchCrowdStrikeData(config) {
    // Simulate CrowdStrike API call
    return this.generateMockThreatData('crowdstrike');
  }

  /**
   * Fetch custom feed data
   */
  async fetchCustomFeedData(config) {
    // Fetch from internal sources
    return this.generateMockThreatData('custom');
  }

  /**
   * Generate mock threat intelligence data
   */
  generateMockThreatData(source) {
    const iocTypes = ['ip', 'domain', 'url', 'hash', 'email'];
    const threatTypes = ['malware', 'phishing', 'botnet', 'apt', 'ransomware'];
    const count = Math.floor(Math.random() * 100) + 50;
    
    return Array.from({ length: count }, () => ({
      id: `${source}_${Math.random().toString(36).substring(7)}`,
      type: iocTypes[Math.floor(Math.random() * iocTypes.length)],
      value: this.generateIOCValue(),
      threat_type: threatTypes[Math.floor(Math.random() * threatTypes.length)],
      confidence: Math.random() * 0.4 + 0.6, // 60-100%
      severity: Math.floor(Math.random() * 10) + 1,
      first_seen: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      last_seen: new Date().toISOString(),
      source,
      tags: this.generateTags(),
      description: 'Threat intelligence indicator',
      attribution: this.generateAttribution(),
      campaign: this.generateCampaign()
    }));
  }

  /**
   * Generate IOC value based on type
   */
  generateIOCValue() {
    const generators = {
      ip: () => `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      domain: () => `malicious${Math.floor(Math.random() * 1000)}.com`,
      url: () => `http://malicious${Math.floor(Math.random() * 1000)}.com/payload`,
      hash: () => Math.random().toString(36).substring(2, 34),
      email: () => `attacker${Math.floor(Math.random() * 100)}@malicious.com`
    };
    
    const types = Object.keys(generators);
    const type = types[Math.floor(Math.random() * types.length)];
    return generators[type]();
  }

  /**
   * Generate threat tags
   */
  generateTags() {
    const tagPool = [
      'apt', 'malware', 'phishing', 'botnet', 'ransomware', 
      'banking-trojan', 'credential-harvesting', 'data-exfiltration',
      'lateral-movement', 'persistence', 'defense-evasion'
    ];
    
    const numTags = Math.floor(Math.random() * 3) + 1;
    const selectedTags = [];
    
    for (let i = 0; i < numTags; i++) {
      const tag = tagPool[Math.floor(Math.random() * tagPool.length)];
      if (!selectedTags.includes(tag)) {
        selectedTags.push(tag);
      }
    }
    
    return selectedTags;
  }

  /**
   * Generate threat attribution
   */
  generateAttribution() {
    const actors = [
      'APT29', 'APT28', 'Lazarus Group', 'FIN7', 'Carbanak',
      'BlackMatter', 'REvil', 'Conti', 'DarkHalo', 'HAFNIUM'
    ];
    
    return Math.random() > 0.7 ? actors[Math.floor(Math.random() * actors.length)] : null;
  }

  /**
   * Generate campaign information
   */
  generateCampaign() {
    const campaigns = [
      'Operation Aurora', 'Operation Honeybee', 'Operation GhostSecret',
      'SolarWinds Supply Chain', 'Microsoft Exchange Server',
      'COVID-19 Phishing Campaign', 'Olympic Destroyer'
    ];
    
    return Math.random() > 0.8 ? campaigns[Math.floor(Math.random() * campaigns.length)] : null;
  }

  /**
   * Process feed data and store IOCs
   */
  async processFeedData(data, feedConfig) {
    const processedIOCs = [];
    
    for (const item of data) {
      try {
        // Normalize IOC data
        const normalizedIOC = this.normalizeIOC(item, feedConfig);
        
        // Store IOC
        this.iocs.set(normalizedIOC.id, normalizedIOC);
        
        // Update cache
        this.updateCache(normalizedIOC);
        
        processedIOCs.push(normalizedIOC);
        
        // Emit IOC event
        this.emit('ioc-processed', normalizedIOC);
        
      } catch (error) {
        console.error('Failed to process IOC:', error);
      }
    }
    
    return processedIOCs;
  }

  /**
   * Normalize IOC data format
   */
  normalizeIOC(ioc, feedConfig) {
    return {
      id: ioc.id || `${feedConfig.name}_${Date.now()}_${Math.random()}`,
      type: ioc.type,
      value: ioc.value,
      threatType: ioc.threat_type,
      confidence: ioc.confidence,
      severity: ioc.severity,
      firstSeen: ioc.first_seen,
      lastSeen: ioc.last_seen,
      source: feedConfig.name,
      sourcePriority: feedConfig.priority,
      tags: ioc.tags || [],
      description: ioc.description,
      attribution: ioc.attribution,
      campaign: ioc.campaign,
      ttps: ioc.ttps || [], // Tactics, Techniques, and Procedures
      mitreTechniques: ioc.mitre_techniques || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Update cache for fast lookups
   */
  updateCache(ioc) {
    // Cache by IOC value for fast lookup
    this.cache.set(ioc.value, ioc);
    
    // Cache by type for filtered searches
    const typeKey = `type:${ioc.type}`;
    if (!this.cache.has(typeKey)) {
      this.cache.set(typeKey, []);
    }
    this.cache.get(typeKey).push(ioc);
    
    // Cache by threat type
    const threatKey = `threat:${ioc.threatType}`;
    if (!this.cache.has(threatKey)) {
      this.cache.set(threatKey, []);
    }
    this.cache.get(threatKey).push(ioc);
  }

  /**
   * Load IOCs from storage
   */
  async loadIOCs() {
    try {
      console.log('Loading stored IOCs...');
      
      // In a real implementation, this would load from database
      // For now, we'll simulate with some initial data
      const initialIOCs = this.generateMockThreatData('initial');
      
      for (const ioc of initialIOCs) {
        const normalizedIOC = this.normalizeIOC(ioc, { name: 'initial', priority: 'medium' });
        this.iocs.set(normalizedIOC.id, normalizedIOC);
        this.updateCache(normalizedIOC);
      }
      
      console.log(`Loaded ${initialIOCs.length} IOCs from storage`);
    } catch (error) {
      console.error('Failed to load IOCs:', error);
    }
  }

  /**
   * Initialize correlation engine
   */
  async initializeCorrelationEngine() {
    console.log('Initializing correlation engine...');
    
    // Define correlation rules
    const rules = [
      {
        id: 'ip_domain_correlation',
        name: 'IP and Domain Correlation',
        description: 'Correlate IP addresses with associated domains',
        trigger: ['ip', 'domain'],
        action: this.correlateDomainIP.bind(this)
      },
      {
        id: 'hash_family_correlation',
        name: 'Malware Family Correlation',
        description: 'Group malware hashes by family',
        trigger: ['hash'],
        action: this.correlateMalwareFamily.bind(this)
      },
      {
        id: 'campaign_correlation',
        name: 'Campaign Attribution',
        description: 'Correlate IOCs to campaigns',
        trigger: ['campaign'],
        action: this.correlateCampaign.bind(this)
      },
      {
        id: 'ttp_correlation',
        name: 'TTP Correlation',
        description: 'Correlate tactics, techniques, and procedures',
        trigger: ['ttps'],
        action: this.correlateTTPs.bind(this)
      }
    ];
    
    rules.forEach(rule => {
      this.correlationRules.set(rule.id, rule);
    });
    
    console.log(`Initialized ${rules.length} correlation rules`);
  }

  /**
   * Correlate domain and IP relationships
   */
  async correlateDomainIP(ioc) {
    const correlations = [];
    
    if (ioc.type === 'ip') {
      // Find domains that resolve to this IP
      const relatedDomains = Array.from(this.iocs.values())
        .filter(i => i.type === 'domain' && this.checkIPDomainRelation(ioc.value, i.value));
      
      correlations.push(...relatedDomains.map(domain => ({
        type: 'ip_domain_resolution',
        sourceIOC: ioc.id,
        targetIOC: domain.id,
        confidence: 0.8,
        relationship: 'resolves_to'
      })));
    }
    
    return correlations;
  }

  /**
   * Correlate malware family
   */
  async correlateMalwareFamily(ioc) {
    const correlations = [];
    
    if (ioc.type === 'hash') {
      // Find other hashes with similar characteristics
      const relatedHashes = Array.from(this.iocs.values())
        .filter(i => i.type === 'hash' && 
                    i.id !== ioc.id && 
                    this.checkMalwareSimilarity(ioc, i));
      
      correlations.push(...relatedHashes.map(hash => ({
        type: 'malware_family',
        sourceIOC: ioc.id,
        targetIOC: hash.id,
        confidence: 0.7,
        relationship: 'same_family'
      })));
    }
    
    return correlations;
  }

  /**
   * Correlate campaign attribution
   */
  async correlateCampaign(ioc) {
    const correlations = [];
    
    if (ioc.campaign) {
      // Find other IOCs from the same campaign
      const campaignIOCs = Array.from(this.iocs.values())
        .filter(i => i.campaign === ioc.campaign && i.id !== ioc.id);
      
      correlations.push(...campaignIOCs.map(campaignIOC => ({
        type: 'campaign_attribution',
        sourceIOC: ioc.id,
        targetIOC: campaignIOC.id,
        confidence: 0.9,
        relationship: 'same_campaign',
        campaign: ioc.campaign
      })));
    }
    
    return correlations;
  }

  /**
   * Correlate TTPs
   */
  async correlateTTPs(ioc) {
    const correlations = [];
    
    if (ioc.ttps && ioc.ttps.length > 0) {
      // Find IOCs with overlapping TTPs
      const relatedIOCs = Array.from(this.iocs.values())
        .filter(i => i.id !== ioc.id && 
                    i.ttps && 
                    this.checkTTPOverlap(ioc.ttps, i.ttps));
      
      correlations.push(...relatedIOCs.map(relatedIOC => ({
        type: 'ttp_correlation',
        sourceIOC: ioc.id,
        targetIOC: relatedIOC.id,
        confidence: this.calculateTTPSimilarity(ioc.ttps, relatedIOC.ttps),
        relationship: 'shared_ttps',
        sharedTTPs: this.getSharedTTPs(ioc.ttps, relatedIOC.ttps)
      })));
    }
    
    return correlations;
  }

  /**
   * Setup feed synchronization
   */
  setupFeedSync() {
    // Schedule periodic sync for each feed
    this.feeds.forEach((feed, name) => {
      if (feed.enabled) {
        setInterval(() => {
          feed.sync().catch(error => {
            console.error(`Feed sync error for ${name}:`, error);
          });
        }, feed.syncInterval);
        
        // Initial sync
        setTimeout(() => {
          feed.sync().catch(error => {
            console.error(`Initial feed sync error for ${name}:`, error);
          });
        }, Math.random() * 10000); // Stagger initial syncs
      }
    });
  }

  /**
   * Setup real-time processing
   */
  setupRealTimeProcessing() {
    // Listen for new security events to correlate against threat intelligence
    this.on('security-event', this.processSecurityEvent.bind(this));
    this.on('network-event', this.processNetworkEvent.bind(this));
    this.on('ioc-match', this.processIOCMatch.bind(this));
  }

  /**
   * Process security events for threat intelligence correlation
   */
  async processSecurityEvent(event) {
    try {
      // Extract potential IOCs from the event
      const potentialIOCs = this.extractIOCsFromEvent(event);
      
      // Check each potential IOC against threat intelligence
      for (const ioc of potentialIOCs) {
        const match = await this.checkIOC(ioc.value, ioc.type);
        
        if (match) {
          this.emit('ioc-match', {
            event,
            ioc: match,
            matchType: 'exact',
            confidence: match.confidence
          });
        }
      }
      
    } catch (error) {
      console.error('Error processing security event for TI correlation:', error);
    }
  }

  /**
   * Process network events
   */
  async processNetworkEvent(event) {
    try {
      // Check IPs, domains, URLs in network traffic
      const networkIOCs = [
        { type: 'ip', value: event.source_ip },
        { type: 'ip', value: event.dest_ip },
        { type: 'domain', value: event.domain },
        { type: 'url', value: event.url }
      ].filter(ioc => ioc.value);
      
      for (const ioc of networkIOCs) {
        const match = await this.checkIOC(ioc.value, ioc.type);
        
        if (match) {
          this.emit('network-threat-detected', {
            event,
            threat: match,
            severity: match.severity,
            action: this.determineAction(match)
          });
        }
      }
      
    } catch (error) {
      console.error('Error processing network event for TI correlation:', error);
    }
  }

  /**
   * Process IOC matches
   */
  async processIOCMatch(matchData) {
    console.log('IOC match detected:', matchData);
    
    // Enhance match with additional context
    const enhancedMatch = await this.enhanceIOCMatch(matchData);
    
    // Generate threat intelligence alert
    const alert = this.generateThreatAlert(enhancedMatch);
    
    // Emit threat intelligence alert
    this.emit('threat-intelligence-alert', alert);
  }

  /**
   * Extract potential IOCs from security event
   */
  extractIOCsFromEvent(event) {
    const iocs = [];
    
    // Extract IPs
    if (event.source_ip) iocs.push({ type: 'ip', value: event.source_ip });
    if (event.dest_ip) iocs.push({ type: 'ip', value: event.dest_ip });
    
    // Extract domains
    if (event.domain) iocs.push({ type: 'domain', value: event.domain });
    
    // Extract URLs
    if (event.url) iocs.push({ type: 'url', value: event.url });
    
    // Extract hashes
    if (event.file_hash) iocs.push({ type: 'hash', value: event.file_hash });
    if (event.md5) iocs.push({ type: 'hash', value: event.md5 });
    if (event.sha256) iocs.push({ type: 'hash', value: event.sha256 });
    
    // Extract emails
    if (event.sender_email) iocs.push({ type: 'email', value: event.sender_email });
    if (event.recipient_email) iocs.push({ type: 'email', value: event.recipient_email });
    
    return iocs;
  }

  /**
   * Check IOC against threat intelligence
   */
  async checkIOC(value, type = null) {
    // First check cache for fast lookup
    const cachedMatch = this.cache.get(value);
    if (cachedMatch) {
      return cachedMatch;
    }
    
    // Search all IOCs
    for (const [id, ioc] of this.iocs) {
      if (ioc.value === value && (!type || ioc.type === type)) {
        // Cache the match for future lookups
        this.cache.set(value, ioc);
        return ioc;
      }
    }
    
    return null;
  }

  /**
   * Search threat intelligence
   */
  async searchThreatIntelligence(query) {
    const results = {
      exact_matches: [],
      partial_matches: [],
      related_iocs: [],
      campaigns: [],
      threat_actors: []
    };
    
    const searchValue = query.toLowerCase();
    
    // Search IOCs
    for (const [id, ioc] of this.iocs) {
      if (ioc.value.toLowerCase() === searchValue) {
        results.exact_matches.push(ioc);
      } else if (ioc.value.toLowerCase().includes(searchValue) ||
                 ioc.description?.toLowerCase().includes(searchValue) ||
                 ioc.tags.some(tag => tag.toLowerCase().includes(searchValue))) {
        results.partial_matches.push(ioc);
      }
    }
    
    // Search campaigns
    const campaigns = new Set();
    results.exact_matches.concat(results.partial_matches).forEach(ioc => {
      if (ioc.campaign) campaigns.add(ioc.campaign);
    });
    results.campaigns = Array.from(campaigns);
    
    // Search threat actors
    const actors = new Set();
    results.exact_matches.concat(results.partial_matches).forEach(ioc => {
      if (ioc.attribution) actors.add(ioc.attribution);
    });
    results.threat_actors = Array.from(actors);
    
    return results;
  }

  /**
   * Enhance IOC match with additional context
   */
  async enhanceIOCMatch(matchData) {
    const enhanced = { ...matchData };
    
    // Add correlation data
    enhanced.correlations = await this.getIOCCorrelations(matchData.ioc.id);
    
    // Add historical context
    enhanced.history = await this.getIOCHistory(matchData.ioc.value);
    
    // Add attribution details
    if (matchData.ioc.attribution) {
      enhanced.threat_actor = await this.getThreatActorDetails(matchData.ioc.attribution);
    }
    
    // Add campaign details
    if (matchData.ioc.campaign) {
      enhanced.campaign_details = await this.getCampaignDetails(matchData.ioc.campaign);
    }
    
    return enhanced;
  }

  /**
   * Generate threat intelligence alert
   */
  generateThreatAlert(enhancedMatch) {
    return {
      id: `ti_alert_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString(),
      type: 'threat_intelligence_match',
      severity: this.calculateAlertSeverity(enhancedMatch),
      title: `Threat Intelligence Match: ${enhancedMatch.ioc.type.toUpperCase()}`,
      description: `IOC match detected for ${enhancedMatch.ioc.value}`,
      ioc: enhancedMatch.ioc,
      event: enhancedMatch.event,
      correlations: enhancedMatch.correlations || [],
      threat_actor: enhancedMatch.threat_actor,
      campaign: enhancedMatch.campaign_details,
      recommended_actions: this.generateRecommendedActions(enhancedMatch),
      confidence: enhancedMatch.confidence || enhancedMatch.ioc.confidence,
      source: enhancedMatch.ioc.source,
      tags: enhancedMatch.ioc.tags
    };
  }

  /**
   * Calculate alert severity
   */
  calculateAlertSeverity(enhancedMatch) {
    let severity = 'medium';
    
    // Base severity on IOC severity
    if (enhancedMatch.ioc.severity >= 8) severity = 'critical';
    else if (enhancedMatch.ioc.severity >= 6) severity = 'high';
    else if (enhancedMatch.ioc.severity >= 4) severity = 'medium';
    else severity = 'low';
    
    // Increase severity based on context
    if (enhancedMatch.ioc.threatType === 'ransomware') severity = 'critical';
    if (enhancedMatch.ioc.attribution) severity = this.increaseSeverity(severity);
    if (enhancedMatch.correlations && enhancedMatch.correlations.length > 3) {
      severity = this.increaseSeverity(severity);
    }
    
    return severity;
  }

  /**
   * Generate recommended actions
   */
  generateRecommendedActions(enhancedMatch) {
    const actions = [];
    
    const ioc = enhancedMatch.ioc;
    
    // Actions based on IOC type
    switch (ioc.type) {
      case 'ip':
        actions.push('Block IP address in firewall');
        actions.push('Monitor network traffic from/to this IP');
        break;
      case 'domain':
        actions.push('Block domain in DNS/proxy');
        actions.push('Monitor DNS queries for this domain');
        break;
      case 'url':
        actions.push('Block URL in web proxy');
        actions.push('Scan for similar URLs');
        break;
      case 'hash':
        actions.push('Quarantine file if found');
        actions.push('Scan for similar file hashes');
        break;
      case 'email':
        actions.push('Block sender email address');
        actions.push('Review emails from this sender');
        break;
    }
    
    // Actions based on threat type
    switch (ioc.threatType) {
      case 'ransomware':
        actions.push('Initiate ransomware response playbook');
        actions.push('Backup critical systems immediately');
        break;
      case 'apt':
        actions.push('Activate advanced threat hunting');
        actions.push('Review privileged account activity');
        break;
      case 'malware':
        actions.push('Run full system scan');
        actions.push('Update antivirus signatures');
        break;
    }
    
    // High confidence actions
    if (ioc.confidence > 0.8) {
      actions.push('Consider immediate blocking/quarantine');
    }
    
    return actions;
  }

  /**
   * Utility functions
   */
  checkIPDomainRelation(ip, domain) {
    // Simplified check - in reality would use DNS resolution
    return Math.random() > 0.7;
  }

  checkMalwareSimilarity(ioc1, ioc2) {
    // Check for similar tags, threat types, etc.
    const sharedTags = ioc1.tags.filter(tag => ioc2.tags.includes(tag));
    return sharedTags.length > 0 || ioc1.threatType === ioc2.threatType;
  }

  checkTTPOverlap(ttps1, ttps2) {
    return ttps1.some(ttp => ttps2.includes(ttp));
  }

  calculateTTPSimilarity(ttps1, ttps2) {
    const shared = ttps1.filter(ttp => ttps2.includes(ttp));
    const total = new Set([...ttps1, ...ttps2]).size;
    return shared.length / total;
  }

  getSharedTTPs(ttps1, ttps2) {
    return ttps1.filter(ttp => ttps2.includes(ttp));
  }

  increaseSeverity(severity) {
    const levels = ['low', 'medium', 'high', 'critical'];
    const currentIndex = levels.indexOf(severity);
    return levels[Math.min(currentIndex + 1, levels.length - 1)];
  }

  determineAction(threat) {
    if (threat.severity >= 8) return 'block';
    if (threat.severity >= 6) return 'alert';
    return 'monitor';
  }

  /**
   * Get threat intelligence statistics
   */
  getStatistics() {
    const stats = {
      total_iocs: this.iocs.size,
      ioc_types: {},
      threat_types: {},
      sources: {},
      recent_additions: 0,
      feeds: []
    };
    
    // Count IOCs by type and threat type
    for (const ioc of this.iocs.values()) {
      stats.ioc_types[ioc.type] = (stats.ioc_types[ioc.type] || 0) + 1;
      stats.threat_types[ioc.threatType] = (stats.threat_types[ioc.threatType] || 0) + 1;
      stats.sources[ioc.source] = (stats.sources[ioc.source] || 0) + 1;
      
      // Count recent additions (last 24 hours)
      const createdTime = new Date(ioc.createdAt).getTime();
      if (Date.now() - createdTime < 24 * 60 * 60 * 1000) {
        stats.recent_additions++;
      }
    }
    
    // Add feed statistics
    this.feeds.forEach(feed => {
      stats.feeds.push(feed.getStats());
    });
    
    return stats;
  }

  /**
   * Export threat intelligence data
   */
  exportThreatIntelligence(format = 'json') {
    const data = {
      export_timestamp: new Date().toISOString(),
      total_iocs: this.iocs.size,
      iocs: Array.from(this.iocs.values())
    };
    
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'csv':
        return this.convertToCSV(data.iocs);
      case 'stix':
        return this.convertToSTIX(data.iocs);
      default:
        return data;
    }
  }

  /**
   * Convert IOCs to CSV format
   */
  convertToCSV(iocs) {
    const headers = ['id', 'type', 'value', 'threat_type', 'confidence', 'severity', 'source', 'first_seen', 'last_seen'];
    const rows = [headers.join(',')];
    
    iocs.forEach(ioc => {
      const row = headers.map(header => `"${ioc[header] || ''}"`);
      rows.push(row.join(','));
    });
    
    return rows.join('\n');
  }

  /**
   * Convert IOCs to STIX format
   */
  convertToSTIX(iocs) {
    // Simplified STIX 2.1 format
    return {
      type: 'bundle',
      id: `bundle--${Date.now()}`,
      spec_version: '2.1',
      objects: iocs.map(ioc => ({
        type: 'indicator',
        id: `indicator--${ioc.id}`,
        created: ioc.createdAt,
        modified: ioc.updatedAt,
        pattern: `[${ioc.type}:value = '${ioc.value}']`,
        labels: ioc.tags,
        confidence: Math.round(ioc.confidence * 100)
      }))
    };
  }
}

// Create singleton instance
export const threatIntelligenceService = new ThreatIntelligenceService();

// Export utility functions
export const checkIOC = (value, type) => threatIntelligenceService.checkIOC(value, type);
export const searchThreatIntel = (query) => threatIntelligenceService.searchThreatIntelligence(query);
export const getThreatStats = () => threatIntelligenceService.getStatistics();

export default threatIntelligenceService;
