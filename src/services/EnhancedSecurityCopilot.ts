// ============================================================================
// ENHANCED SECURITY COPILOT SERVICE
// ============================================================================

import AISecurityAnalyzer, { AIAnalysisRequest, AIAnalysisResponse } from './AISecurityAnalyzer';
import { aiConfigManager } from './AIConfigurationManager';

export interface SecurityRecommendation {
  id?: string;
  title: string;
  description: string;
  businessImpact: string;
  technicalDetail: string;
  remediationSteps: Array<{
    step: number;
    action: string;
    owner: string;
    timeline: string;
  }>;
  estimatedEffort: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  automatable: boolean;
  links: Array<{
    text: string;
    type: 'internal' | 'external';
    url: string;
  }>;
  aiGenerated?: boolean;
  modelUsed?: string;
}

export interface SecurityContext {
  findings: Array<{
    id: string;
    severity: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
  assets: Array<{
    id: string;
    name: string;
    type: string;
    criticality: string;
  }>;
  scans: Array<{
    id: string;
    type: string;
    status: string;
    timestamp: string;
  }>;
}

export class EnhancedSecurityCopilot {
  private knowledgeBase: Map<string, SecurityRecommendation>;
  private aiAnalyzer: AISecurityAnalyzer | null = null;
  private aiEnabled: boolean = false;

  constructor() {
    this.knowledgeBase = new Map();
    this.initializeKnowledgeBase();
    this.initializeAI();
  }

  /**
   * Initialize AI analyzer
   */
  private async initializeAI(): Promise<void> {
    try {
      console.log('🤖 Initializing AI Security Analyzer...');
      this.aiAnalyzer = await aiConfigManager.autoInitialize();
      this.aiEnabled = true;
      
      const status = await aiConfigManager.getProviderStatus();
      console.log(`✅ AI Security Copilot ready with ${status.provider} (${status.model})`);
    } catch (error) {
      console.warn('⚠️ AI initialization failed, using rule-based analysis only:', error);
      this.aiEnabled = false;
    }
  }

  private initializeKnowledgeBase(): void {
    // Pre-built security recommendations for common questions
    this.knowledgeBase.set('what changed today', {
      title: 'Today\'s Security Changes',
      description: 'Analysis of security events and changes that occurred in the last 24 hours.',
      businessImpact: 'Provides situational awareness of recent security posture changes.',
      technicalDetail: 'Monitoring recent scan results, new findings, and asset modifications.',
      remediationSteps: [
        { step: 1, action: 'Review new critical findings', owner: 'Security Team', timeline: 'Immediate' },
        { step: 2, action: 'Validate recent scan results', owner: 'Operations', timeline: '2 hours' },
        { step: 3, action: 'Update security documentation', owner: 'Compliance', timeline: 'End of day' }
      ],
      estimatedEffort: '2-4 hours',
      confidence: 85,
      priority: 'medium',
      automatable: true,
      links: [
        { text: 'View Recent Findings', type: 'internal', url: '/findings' },
        { text: 'Scan History', type: 'internal', url: '/scans' }
      ]
    });

    this.knowledgeBase.set('what should i fix first', {
      title: 'Priority Security Remediation',
      description: 'Recommended prioritization of security findings based on risk, impact, and ease of remediation.',
      businessImpact: 'Optimizes security team efficiency and reduces overall organizational risk.',
      technicalDetail: 'Analysis considers CVSS scores, asset criticality, exploit availability, and remediation complexity.',
      remediationSteps: [
        { step: 1, action: 'Address critical findings on high-value assets', owner: 'Security Team', timeline: 'Immediate' },
        { step: 2, action: 'Patch publicly facing vulnerabilities', owner: 'Infrastructure', timeline: '24 hours' },
        { step: 3, action: 'Update security configurations', owner: 'DevOps', timeline: '48 hours' }
      ],
      estimatedEffort: '1-2 weeks',
      confidence: 92,
      priority: 'high',
      automatable: false,
      links: [
        { text: 'Critical Findings', type: 'internal', url: '/findings?severity=critical' },
        { text: 'Risk Dashboard', type: 'internal', url: '/risk' }
      ]
    });

    this.knowledgeBase.set('any criticals older than 7 days', {
      title: 'Aged Critical Vulnerabilities',
      description: 'Analysis of critical security findings that remain unresolved after 7 days.',
      businessImpact: 'Aged critical vulnerabilities significantly increase organizational risk and compliance exposure.',
      technicalDetail: 'Critical findings older than 7 days may indicate resource constraints or remediation challenges.',
      remediationSteps: [
        { step: 1, action: 'Escalate to management for resource allocation', owner: 'Security Lead', timeline: 'Immediate' },
        { step: 2, action: 'Implement temporary mitigations', owner: 'Security Team', timeline: '4 hours' },
        { step: 3, action: 'Schedule emergency patching window', owner: 'Change Management', timeline: '24 hours' }
      ],
      estimatedEffort: '3-5 days',
      confidence: 95,
      priority: 'critical',
      automatable: false,
      links: [
        { text: 'Aged Critical Findings', type: 'internal', url: '/findings?severity=critical&age=7d' },
        { text: 'Escalation Procedures', type: 'internal', url: '/policies' }
      ]
    });

    this.knowledgeBase.set('show me recent scan results', {
      title: 'Recent Security Scan Analysis',
      description: 'Overview of latest security scanning activities and their results.',
      businessImpact: 'Provides visibility into current security scanning coverage and effectiveness.',
      technicalDetail: 'Analysis of scan completion rates, new findings, and scanning gaps.',
      remediationSteps: [
        { step: 1, action: 'Review scan completion status', owner: 'Security Team', timeline: '30 minutes' },
        { step: 2, action: 'Analyze new findings', owner: 'Vulnerability Management', timeline: '2 hours' },
        { step: 3, action: 'Schedule follow-up scans for gaps', owner: 'Operations', timeline: '24 hours' }
      ],
      estimatedEffort: '1-2 hours',
      confidence: 88,
      priority: 'medium',
      automatable: true,
      links: [
        { text: 'Scan Dashboard', type: 'internal', url: '/scans' },
        { text: 'Scan Schedule', type: 'internal', url: '/scans/schedule' }
      ]
    });

    this.knowledgeBase.set('what\'s my current risk score', {
      title: 'Current Risk Score Analysis',
      description: 'Comprehensive analysis of organizational security risk score and contributing factors.',
      businessImpact: 'Provides executive-level visibility into overall security posture and risk trends.',
      technicalDetail: 'Risk score calculated from vulnerability severity, asset criticality, threat intelligence, and compliance status.',
      remediationSteps: [
        { step: 1, action: 'Review risk score methodology', owner: 'Risk Management', timeline: '1 hour' },
        { step: 2, action: 'Identify primary risk drivers', owner: 'Security Analyst', timeline: '2 hours' },
        { step: 3, action: 'Develop risk mitigation plan', owner: 'Security Team', timeline: '1 week' }
      ],
      estimatedEffort: '4-8 hours',
      confidence: 90,
      priority: 'medium',
      automatable: true,
      links: [
        { text: 'Risk Dashboard', type: 'internal', url: '/risk' },
        { text: 'Risk Methodology', type: 'internal', url: '/risk/methodology' }
      ]
    });

    this.knowledgeBase.set('are we compliant with soc2', {
      title: 'SOC 2 Compliance Status',
      description: 'Current SOC 2 compliance posture and any gaps requiring attention.',
      businessImpact: 'SOC 2 compliance is critical for customer trust and regulatory requirements.',
      technicalDetail: 'Analysis of security controls alignment with SOC 2 Type II requirements.',
      remediationSteps: [
        { step: 1, action: 'Review SOC 2 control mappings', owner: 'Compliance Team', timeline: '4 hours' },
        { step: 2, action: 'Identify control gaps', owner: 'Security Team', timeline: '1 day' },
        { step: 3, action: 'Implement missing controls', owner: 'IT Team', timeline: '2 weeks' }
      ],
      estimatedEffort: '2-4 weeks',
      confidence: 85,
      priority: 'high',
      automatable: false,
      links: [
        { text: 'Compliance Dashboard', type: 'internal', url: '/compliance' },
        { text: 'SOC 2 Controls', type: 'internal', url: '/compliance/soc2' }
      ]
    });

    this.knowledgeBase.set('analyze threat intelligence', {
      title: 'Threat Intelligence Analysis',
      description: 'Current threat landscape analysis and potential impacts to the organization.',
      businessImpact: 'Proactive threat awareness helps prevent successful attacks and reduces incident response time.',
      technicalDetail: 'Analysis of current threat indicators, attack patterns, and industry-specific threats.',
      remediationSteps: [
        { step: 1, action: 'Review current threat feeds', owner: 'Threat Intelligence', timeline: '2 hours' },
        { step: 2, action: 'Correlate with internal security events', owner: 'SOC Analyst', timeline: '4 hours' },
        { step: 3, action: 'Update detection rules', owner: 'Security Engineering', timeline: '1 day' }
      ],
      estimatedEffort: '1-2 days',
      confidence: 87,
      priority: 'medium',
      automatable: true,
      links: [
        { text: 'Threat Intelligence Dashboard', type: 'internal', url: '/threat-intelligence' },
        { text: 'IOC Database', type: 'internal', url: '/threat-intelligence/iocs' }
      ]
    });
  }

  /**
   * Enhanced security question analysis with AI integration
   */
  async analyzeSecurityQuestion(question: string, context: SecurityContext): Promise<SecurityRecommendation> {
    // First try AI analysis if available
    if (this.aiEnabled && this.aiAnalyzer) {
      try {
        const aiResponse = await this.performAIAnalysis(question, context);
        if (aiResponse) {
          return this.convertAIResponseToRecommendation(aiResponse);
        }
      } catch (error) {
        console.warn('AI analysis failed, falling back to rule-based analysis:', error);
      }
    }

    // Fallback to rule-based analysis
    return this.performRuleBasedAnalysis(question, context);
  }

  /**
   * Perform AI-powered analysis
   */
  private async performAIAnalysis(question: string, context: SecurityContext): Promise<AIAnalysisResponse | null> {
    if (!this.aiAnalyzer) return null;

    const analysisRequest: AIAnalysisRequest = {
      query: question,
      context: {
        findings: context.findings || [],
        assets: context.assets || [],
        scans: context.scans || [],
        threats: [],
        compliance: {},
        networkStatus: {}
      },
      analysisType: this.determineAnalysisType(question),
      priority: this.determinePriority(context)
    };

    return await this.aiAnalyzer.analyzeSecurityQuery(analysisRequest);
  }

  /**
   * Convert AI response to SecurityRecommendation format
   */
  private convertAIResponseToRecommendation(aiResponse: AIAnalysisResponse): SecurityRecommendation {
    return {
      id: aiResponse.id,
      title: this.extractTitleFromAI(aiResponse.reasoning),
      description: aiResponse.reasoning,
      businessImpact: aiResponse.businessImpact,
      technicalDetail: aiResponse.technicalDetails,
      remediationSteps: aiResponse.recommendations.map((rec, index) => ({
        step: index + 1,
        action: rec.action,
        owner: rec.owner,
        timeline: rec.timeline
      })),
      estimatedEffort: this.calculateEffortFromRecommendations(aiResponse.recommendations),
      confidence: aiResponse.confidence,
      priority: this.normalizePriority(aiResponse.recommendations),
      automatable: aiResponse.recommendations.some(rec => rec.automatable),
      links: this.generateLinksFromSources(aiResponse.sources),
      aiGenerated: true,
      modelUsed: aiResponse.modelUsed
    };
  }

  /**
   * Determine analysis type from question
   */
  private determineAnalysisType(question: string): 'recommendation' | 'threat_analysis' | 'risk_assessment' | 'compliance_check' | 'incident_response' {
    const lowerQ = question.toLowerCase();
    
    if (lowerQ.includes('threat') || lowerQ.includes('attack') || lowerQ.includes('malware')) {
      return 'threat_analysis';
    } else if (lowerQ.includes('risk') || lowerQ.includes('score') || lowerQ.includes('impact')) {
      return 'risk_assessment';
    } else if (lowerQ.includes('compliance') || lowerQ.includes('audit') || lowerQ.includes('regulation')) {
      return 'compliance_check';
    } else if (lowerQ.includes('incident') || lowerQ.includes('breach') || lowerQ.includes('response')) {
      return 'incident_response';
    } else {
      return 'recommendation';
    }
  }

  /**
   * Determine priority from context
   */
  private determinePriority(context: SecurityContext): 'low' | 'medium' | 'high' | 'critical' {
    const criticalFindings = context.findings?.filter(f => f.severity === 'critical').length || 0;
    const highFindings = context.findings?.filter(f => f.severity === 'high').length || 0;
    
    if (criticalFindings > 0) return 'critical';
    if (highFindings > 3) return 'high';
    if (highFindings > 0) return 'medium';
    return 'low';
  }

  /**
   * Extract title from AI reasoning
   */
  private extractTitleFromAI(reasoning: string): string {
    const lines = reasoning.split('\n');
    const firstLine = lines[0].replace(/^\*\*|\*\*$/g, '').trim();
    return firstLine.length > 5 && firstLine.length < 100 ? firstLine : 'AI Security Analysis';
  }

  /**
   * Calculate effort from AI recommendations
   */
  private calculateEffortFromRecommendations(recommendations: any[]): string {
    if (recommendations.length === 0) return 'Unknown';
    
    const efforts = recommendations.map(rec => rec.effort?.toLowerCase() || 'medium');
    if (efforts.includes('high')) return 'High (1-2 weeks)';
    if (efforts.includes('medium')) return 'Medium (2-5 days)';
    return 'Low (1-2 days)';
  }

  /**
   * Normalize priority from AI recommendations
   */
  private normalizePriority(recommendations: any[]): 'low' | 'medium' | 'high' | 'critical' {
    if (recommendations.length === 0) return 'medium';
    
    const priorities = recommendations.map(rec => rec.priority?.toLowerCase() || 'medium');
    if (priorities.includes('critical')) return 'critical';
    if (priorities.includes('high')) return 'high';
    if (priorities.includes('medium')) return 'medium';
    return 'low';
  }

  /**
   * Generate links from AI sources
   */
  private generateLinksFromSources(sources: string[]): Array<{text: string, type: 'internal' | 'external', url: string}> {
    const links = [];
    
    for (const source of sources) {
      if (source.includes('internal') || source.includes('dashboard')) {
        links.push({
          text: 'Security Dashboard',
          type: 'internal' as const,
          url: '/dashboard'
        });
      } else if (source.includes('finding')) {
        links.push({
          text: 'View Findings',
          type: 'internal' as const,
          url: '/findings'
        });
      }
    }
    
    // Add default helpful links
    if (links.length === 0) {
      links.push(
        {
          text: 'Security Dashboard',
          type: 'internal' as const,
          url: '/dashboard'
        },
        {
          text: 'Risk Assessment',
          type: 'internal' as const,
          url: '/analytics'
        }
      );
    }
    
    return links;
  }

  /**
   * Enhanced rule-based analysis (fallback)
   */
  private performRuleBasedAnalysis(question: string, context: SecurityContext): SecurityRecommendation {
    const normalizedQuestion = question.toLowerCase().trim();
    
    // Try to match against knowledge base using forEach to avoid Map iteration issues
    const knowledgeBaseEntries = Array.from(this.knowledgeBase.entries());
    for (const [key, recommendation] of knowledgeBaseEntries) {
      if (normalizedQuestion.includes(key) || key.includes(normalizedQuestion)) {
        return this.enhanceRecommendationWithContext(recommendation, context);
      }
    }

    // If no pre-built recommendation found, generate a dynamic one
    return this.generateDynamicRecommendation(question, context);
  }

  private enhanceRecommendationWithContext(
    baseRecommendation: SecurityRecommendation, 
    context: SecurityContext
  ): SecurityRecommendation {
    // Enhance the recommendation with actual context data
    const criticalFindings = context.findings.filter(f => f.severity === 'critical').length;
    const totalAssets = context.assets.length;
    const recentScans = context.scans.filter(s => {
      const scanDate = new Date(s.timestamp);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return scanDate > oneDayAgo;
    }).length;

    // Create enhanced description with actual data
    let enhancedDescription = baseRecommendation.description;
    
    if (criticalFindings > 0) {
      enhancedDescription += ` Currently tracking ${criticalFindings} critical findings.`;
    }
    
    if (totalAssets > 0) {
      enhancedDescription += ` Monitoring ${totalAssets} assets.`;
    }
    
    if (recentScans > 0) {
      enhancedDescription += ` ${recentScans} scans completed in the last 24 hours.`;
    }

    return {
      ...baseRecommendation,
      description: enhancedDescription
    };
  }

  private generateDynamicRecommendation(question: string, context: SecurityContext): SecurityRecommendation {
    // Generate a dynamic recommendation based on the question and context
    const criticalFindings = context.findings.filter(f => f.severity === 'critical').length;
    const highFindings = context.findings.filter(f => f.severity === 'high').length;
    
    return {
      title: 'Security Analysis',
      description: `Analysis for: "${question}". Current security posture shows ${criticalFindings} critical and ${highFindings} high severity findings across ${context.assets.length} monitored assets.`,
      businessImpact: 'Maintaining strong security posture is critical for business continuity and customer trust.',
      technicalDetail: 'Comprehensive security monitoring across all organizational assets and infrastructure.',
      remediationSteps: [
        { step: 1, action: 'Review current security findings', owner: 'Security Team', timeline: '2 hours' },
        { step: 2, action: 'Prioritize remediation efforts', owner: 'Security Lead', timeline: '4 hours' },
        { step: 3, action: 'Implement security improvements', owner: 'Technical Team', timeline: '1 week' }
      ],
      estimatedEffort: '1-2 weeks',
      confidence: 75,
      priority: criticalFindings > 0 ? 'high' : 'medium',
      automatable: false,
      links: [
        { text: 'Security Dashboard', type: 'internal', url: '/dashboard' },
        { text: 'All Findings', type: 'internal', url: '/findings' }
      ]
    };
  }
}
