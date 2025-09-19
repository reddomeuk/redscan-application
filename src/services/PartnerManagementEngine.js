/**
 * Partner Management Engine
 * Handles partner vetting, selection, access control, and engagement management
 * for the Pentest Partner Program
 */

import { EventEmitter } from '../utils/EventEmitter';

class PartnerManagementEngine extends EventEmitter {
  constructor() {
    super();
    this.partners = new Map();
    this.engagements = new Map();
    this.partnerSessions = new Map();
    this.vettingProcess = new Map();
    this.accessControlPolicies = new Map();
    
    // Initialize default access control policies
    this.initializeAccessControlPolicies();
  }

  /**
   * Initialize default access control policies for partner portal
   */
  initializeAccessControlPolicies() {
    const defaultPolicies = {
      'basic_partner': {
        name: 'Basic Partner Access',
        permissions: [
          'view_assigned_engagements',
          'upload_reports',
          'view_client_assets',
          'message_client'
        ],
        restrictions: [
          'no_download_sensitive_data',
          'time_limited_access',
          'activity_logging_required'
        ],
        sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours
        ipWhitelisting: false,
        mfaRequired: true
      },
      'trusted_partner': {
        name: 'Trusted Partner Access',
        permissions: [
          'view_assigned_engagements',
          'upload_reports',
          'view_client_assets',
          'message_client',
          'view_historical_data',
          'export_reports'
        ],
        restrictions: [
          'activity_logging_required',
          'data_classification_aware'
        ],
        sessionTimeout: 12 * 60 * 60 * 1000, // 12 hours
        ipWhitelisting: true,
        mfaRequired: true
      },
      'premium_partner': {
        name: 'Premium Partner Access',
        permissions: [
          'view_assigned_engagements',
          'upload_reports',
          'view_client_assets',
          'message_client',
          'view_historical_data',
          'export_reports',
          'api_access',
          'real_time_collaboration'
        ],
        restrictions: [
          'activity_logging_required'
        ],
        sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
        ipWhitelisting: true,
        mfaRequired: true
      }
    };

    for (const [tier, policy] of Object.entries(defaultPolicies)) {
      this.accessControlPolicies.set(tier, policy);
    }
  }

  /**
   * Add a new partner to the system
   */
  async addPartner(partnerData) {
    try {
      const partner = {
        id: this.generatePartnerId(),
        ...partnerData,
        status: 'pending_verification',
        addedAt: new Date(),
        vettingScore: 0,
        tier: 'basic_partner',
        activeEngagements: [],
        completedEngagements: [],
        metrics: {
          totalEngagements: 0,
          averageRating: 0,
          onTimeDelivery: 0,
          clientSatisfaction: 0
        }
      };

      this.partners.set(partner.id, partner);
      
      // Start vetting process
      await this.startVettingProcess(partner.id);
      
      this.emit('partnerAdded', partner);
      return { success: true, partner };
    } catch (error) {
      console.error('Failed to add partner:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Start the partner vetting process
   */
  async startVettingProcess(partnerId) {
    const partner = this.partners.get(partnerId);
    if (!partner) {
      throw new Error('Partner not found');
    }

    const vetting = {
      partnerId,
      startedAt: new Date(),
      status: 'in_progress',
      checks: {
        business_verification: { status: 'pending', score: 0 },
        certification_verification: { status: 'pending', score: 0 },
        reference_checks: { status: 'pending', score: 0 },
        security_assessment: { status: 'pending', score: 0 },
        sample_work_review: { status: 'pending', score: 0 }
      },
      totalScore: 0,
      reviewer: null,
      notes: []
    };

    this.vettingProcess.set(partnerId, vetting);
    
    // Simulate vetting process steps
    await this.performVettingChecks(partnerId);
    
    this.emit('vettingStarted', { partnerId, vetting });
  }

  /**
   * Perform automated vetting checks
   */
  async performVettingChecks(partnerId) {
    const vetting = this.vettingProcess.get(partnerId);
    const partner = this.partners.get(partnerId);
    
    // Business verification
    const businessScore = await this.verifyBusiness(partner);
    vetting.checks.business_verification = { status: 'completed', score: businessScore };
    
    // Certification verification
    const certificationScore = await this.verifyCertifications(partner);
    vetting.checks.certification_verification = { status: 'completed', score: certificationScore };
    
    // Reference checks (simulated)
    const referenceScore = Math.floor(Math.random() * 30) + 70; // 70-100
    vetting.checks.reference_checks = { status: 'completed', score: referenceScore };
    
    // Security assessment
    const securityScore = await this.assessPartnerSecurity(partner);
    vetting.checks.security_assessment = { status: 'completed', score: securityScore };
    
    // Sample work review
    const workScore = Math.floor(Math.random() * 20) + 80; // 80-100
    vetting.checks.sample_work_review = { status: 'completed', score: workScore };
    
    // Calculate total score
    const totalScore = Object.values(vetting.checks)
      .reduce((sum, check) => sum + check.score, 0) / 5;
    
    vetting.totalScore = totalScore;
    vetting.status = 'completed';
    vetting.completedAt = new Date();
    
    // Update partner status and tier based on score
    partner.vettingScore = totalScore;
    if (totalScore >= 90) {
      partner.status = 'verified';
      partner.tier = 'premium_partner';
    } else if (totalScore >= 80) {
      partner.status = 'verified';
      partner.tier = 'trusted_partner';
    } else if (totalScore >= 70) {
      partner.status = 'verified';
      partner.tier = 'basic_partner';
    } else {
      partner.status = 'rejected';
    }
    
    this.emit('vettingCompleted', { partnerId, vetting, partner });
    
    return vetting;
  }

  /**
   * Verify business credentials
   */
  async verifyBusiness(partner) {
    // Simulate business verification
    let score = 60; // Base score
    
    if (partner.businessLicense) score += 10;
    if (partner.insurance) score += 10;
    if (partner.yearsInBusiness >= 5) score += 10;
    if (partner.teamSize >= 10) score += 5;
    if (partner.clientReferences && partner.clientReferences.length >= 3) score += 5;
    
    return Math.min(100, score);
  }

  /**
   * Verify professional certifications
   */
  async verifyCertifications(partner) {
    const certificationValues = {
      'CISSP': 20,
      'OSCP': 15,
      'CEH': 10,
      'CISA': 15,
      'CISM': 15,
      'GPEN': 12,
      'GWEB': 10,
      'CRTP': 8,
      'CRTE': 8
    };
    
    let score = 40; // Base score
    
    if (partner.certifications) {
      partner.certifications.forEach(cert => {
        if (certificationValues[cert]) {
          score += certificationValues[cert];
        }
      });
    }
    
    return Math.min(100, score);
  }

  /**
   * Assess partner security posture
   */
  async assessPartnerSecurity(partner) {
    // Simulate security assessment
    let score = 50; // Base score
    
    // Check for security compliance
    if (partner.compliance) {
      partner.compliance.forEach(standard => {
        switch (standard) {
          case 'ISO 27001': score += 15; break;
          case 'SOC 2': score += 10; break;
          case 'PCI DSS': score += 8; break;
          case 'NIST': score += 8; break;
          default: score += 2; break;
        }
      });
    }
    
    // Additional security factors
    if (partner.securityTraining) score += 5;
    if (partner.incidentResponsePlan) score += 5;
    if (partner.dataEncryption) score += 5;
    
    return Math.min(100, score);
  }

  /**
   * Create a new engagement with a partner
   */
  async createEngagement(partnerId, engagementData) {
    try {
      const partner = this.partners.get(partnerId);
      if (!partner || partner.status !== 'verified') {
        throw new Error('Partner not verified or not found');
      }

      const engagement = {
        id: this.generateEngagementId(),
        partnerId,
        clientId: engagementData.clientId,
        type: engagementData.type,
        scope: engagementData.scope,
        timeline: engagementData.timeline,
        budget: engagementData.budget,
        status: 'pending_acceptance',
        createdAt: new Date(),
        accessLevel: this.determineAccessLevel(partner.tier, engagementData.sensitivity),
        reports: [],
        communications: [],
        deliverables: engagementData.deliverables || []
      };

      this.engagements.set(engagement.id, engagement);
      partner.activeEngagements.push(engagement.id);
      
      // Create partner portal session
      await this.createPartnerPortalAccess(partnerId, engagement.id);
      
      this.emit('engagementCreated', { engagement, partner });
      
      return { success: true, engagement };
    } catch (error) {
      console.error('Failed to create engagement:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create controlled portal access for partner
   */
  async createPartnerPortalAccess(partnerId, engagementId) {
    const partner = this.partners.get(partnerId);
    const engagement = this.engagements.get(engagementId);
    const policy = this.accessControlPolicies.get(partner.tier);

    const session = {
      id: this.generateSessionId(),
      partnerId,
      engagementId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + policy.sessionTimeout),
      permissions: [...policy.permissions],
      restrictions: [...policy.restrictions],
      ipWhitelisting: policy.ipWhitelisting,
      mfaRequired: policy.mfaRequired,
      accessLog: [],
      isActive: true
    };

    this.partnerSessions.set(session.id, session);
    
    this.emit('portalAccessCreated', { session, partner, engagement });
    
    return session;
  }

  /**
   * Determine access level based on partner tier and engagement sensitivity
   */
  determineAccessLevel(partnerTier, engagementSensitivity = 'standard') {
    const accessMatrix = {
      'basic_partner': {
        'standard': 'read_only',
        'sensitive': 'restricted',
        'highly_sensitive': 'denied'
      },
      'trusted_partner': {
        'standard': 'read_write',
        'sensitive': 'read_only',
        'highly_sensitive': 'restricted'
      },
      'premium_partner': {
        'standard': 'full_access',
        'sensitive': 'read_write',
        'highly_sensitive': 'read_only'
      }
    };

    return accessMatrix[partnerTier]?.[engagementSensitivity] || 'restricted';
  }

  /**
   * Log partner portal activity
   */
  logPartnerActivity(sessionId, activity) {
    const session = this.partnerSessions.get(sessionId);
    if (session) {
      const logEntry = {
        timestamp: new Date(),
        activity: activity.type,
        details: activity.details,
        ipAddress: activity.ipAddress,
        userAgent: activity.userAgent
      };
      
      session.accessLog.push(logEntry);
      
      // Check for suspicious activity
      this.checkSuspiciousActivity(session, logEntry);
      
      this.emit('partnerActivity', { sessionId, logEntry });
    }
  }

  /**
   * Check for suspicious partner activity
   */
  checkSuspiciousActivity(session, logEntry) {
    const partner = this.partners.get(session.partnerId);
    const recentLogs = session.accessLog.slice(-10); // Last 10 activities
    
    // Check for rapid consecutive actions
    if (recentLogs.length >= 5) {
      const timeWindow = 60000; // 1 minute
      const recentActions = recentLogs.filter(log => 
        new Date() - new Date(log.timestamp) < timeWindow
      );
      
      if (recentActions.length >= 5) {
        this.emit('suspiciousActivity', {
          type: 'rapid_actions',
          partnerId: session.partnerId,
          sessionId: session.id,
          details: 'Multiple rapid actions detected'
        });
      }
    }
    
    // Check for unusual IP address
    const partnerIPs = session.accessLog.map(log => log.ipAddress);
    const uniqueIPs = [...new Set(partnerIPs)];
    
    if (uniqueIPs.length > 3) {
      this.emit('suspiciousActivity', {
        type: 'multiple_ips',
        partnerId: session.partnerId,
        sessionId: session.id,
        details: `Access from ${uniqueIPs.length} different IP addresses`
      });
    }
  }

  /**
   * Update partner performance metrics
   */
  updatePartnerMetrics(partnerId, engagementId, metrics) {
    const partner = this.partners.get(partnerId);
    const engagement = this.engagements.get(engagementId);
    
    if (partner && engagement) {
      // Update engagement status
      engagement.status = 'completed';
      engagement.completedAt = new Date();
      engagement.metrics = metrics;
      
      // Move from active to completed
      partner.activeEngagements = partner.activeEngagements.filter(id => id !== engagementId);
      partner.completedEngagements.push(engagementId);
      
      // Update partner metrics
      partner.metrics.totalEngagements++;
      partner.metrics.averageRating = this.calculateAverageRating(partner);
      partner.metrics.onTimeDelivery = this.calculateOnTimeDelivery(partner);
      partner.metrics.clientSatisfaction = this.calculateClientSatisfaction(partner);
      
      // Check for tier upgrade
      this.checkTierUpgrade(partner);
      
      this.emit('partnerMetricsUpdated', { partner, engagement, metrics });
    }
  }

  /**
   * Calculate average rating for partner
   */
  calculateAverageRating(partner) {
    const completedEngagements = partner.completedEngagements.map(id => 
      this.engagements.get(id)
    ).filter(eng => eng && eng.metrics && eng.metrics.rating);
    
    if (completedEngagements.length === 0) return 0;
    
    const totalRating = completedEngagements.reduce((sum, eng) => 
      sum + eng.metrics.rating, 0
    );
    
    return totalRating / completedEngagements.length;
  }

  /**
   * Calculate on-time delivery percentage
   */
  calculateOnTimeDelivery(partner) {
    const completedEngagements = partner.completedEngagements.map(id => 
      this.engagements.get(id)
    ).filter(eng => eng && eng.completedAt);
    
    if (completedEngagements.length === 0) return 0;
    
    const onTimeCount = completedEngagements.filter(eng => {
      const deadline = new Date(eng.timeline.endDate);
      return new Date(eng.completedAt) <= deadline;
    }).length;
    
    return (onTimeCount / completedEngagements.length) * 100;
  }

  /**
   * Calculate client satisfaction score
   */
  calculateClientSatisfaction(partner) {
    const completedEngagements = partner.completedEngagements.map(id => 
      this.engagements.get(id)
    ).filter(eng => eng && eng.metrics && eng.metrics.clientSatisfaction);
    
    if (completedEngagements.length === 0) return 0;
    
    const totalSatisfaction = completedEngagements.reduce((sum, eng) => 
      sum + eng.metrics.clientSatisfaction, 0
    );
    
    return totalSatisfaction / completedEngagements.length;
  }

  /**
   * Check if partner qualifies for tier upgrade
   */
  checkTierUpgrade(partner) {
    const metrics = partner.metrics;
    const currentTier = partner.tier;
    
    let newTier = currentTier;
    
    // Premium tier requirements
    if (currentTier !== 'premium_partner' &&
        metrics.totalEngagements >= 20 &&
        metrics.averageRating >= 4.8 &&
        metrics.onTimeDelivery >= 95 &&
        metrics.clientSatisfaction >= 4.8) {
      newTier = 'premium_partner';
    }
    // Trusted tier requirements
    else if (currentTier === 'basic_partner' &&
             metrics.totalEngagements >= 10 &&
             metrics.averageRating >= 4.5 &&
             metrics.onTimeDelivery >= 90 &&
             metrics.clientSatisfaction >= 4.5) {
      newTier = 'trusted_partner';
    }
    
    if (newTier !== currentTier) {
      partner.tier = newTier;
      partner.tierUpgradedAt = new Date();
      
      this.emit('partnerTierUpgraded', {
        partnerId: partner.id,
        oldTier: currentTier,
        newTier: newTier,
        metrics
      });
    }
  }

  /**
   * Get partner marketplace data with filtering
   */
  getPartnerMarketplace(filters = {}) {
    const partners = Array.from(this.partners.values())
      .filter(partner => partner.status === 'verified');
    
    let filteredPartners = partners;
    
    // Apply filters
    if (filters.country) {
      filteredPartners = filteredPartners.filter(p => 
        p.location?.country === filters.country
      );
    }
    
    if (filters.specialty) {
      filteredPartners = filteredPartners.filter(p => 
        p.specialties?.includes(filters.specialty)
      );
    }
    
    if (filters.availability) {
      filteredPartners = filteredPartners.filter(p => 
        p.availability === filters.availability
      );
    }
    
    if (filters.rating) {
      filteredPartners = filteredPartners.filter(p => 
        p.metrics.averageRating >= filters.rating
      );
    }
    
    return filteredPartners.map(partner => ({
      id: partner.id,
      name: partner.name,
      location: partner.location,
      rating: partner.metrics.averageRating,
      reviewCount: partner.metrics.totalEngagements,
      specialties: partner.specialties,
      tier: partner.tier,
      availability: partner.availability,
      pricing: partner.pricing
    }));
  }

  /**
   * Generate unique IDs
   */
  generatePartnerId() {
    return `partner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateEngagementId() {
    return `engagement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get partner statistics
   */
  getPartnerStatistics() {
    const allPartners = Array.from(this.partners.values());
    
    return {
      total: allPartners.length,
      verified: allPartners.filter(p => p.status === 'verified').length,
      pending: allPartners.filter(p => p.status === 'pending_verification').length,
      rejected: allPartners.filter(p => p.status === 'rejected').length,
      byTier: {
        basic: allPartners.filter(p => p.tier === 'basic_partner').length,
        trusted: allPartners.filter(p => p.tier === 'trusted_partner').length,
        premium: allPartners.filter(p => p.tier === 'premium_partner').length
      },
      totalEngagements: Array.from(this.engagements.values()).length,
      activeEngagements: Array.from(this.engagements.values())
        .filter(e => e.status === 'active').length
    };
  }
}

// Create and export singleton instance
const partnerManagementEngine = new PartnerManagementEngine();

export default partnerManagementEngine;
export { PartnerManagementEngine };
