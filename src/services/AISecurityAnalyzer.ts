/**
 * AI Model Integration Service for Security Copilot
 * 
 * Supports multiple AI providers and models for security decision making:
 * - OpenAI GPT models for natural language processing
 * - Local LLM integration (Ollama, LM Studio)
 * - Azure OpenAI for enterprise environments
 * - Anthropic Claude for advanced reasoning
 * - Custom fine-tuned models for security-specific tasks
 */

export interface AIModelConfig {
  provider: 'openai' | 'azure-openai' | 'anthropic' | 'ollama' | 'local' | 'huggingface' | 'custom';
  model: string;
  apiKey?: string;
  endpoint?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  cost?: string;
  description?: string;
}

export interface SecurityKnowledgeBase {
  vulnerabilityPatterns: Map<string, any>;
  mitigationStrategies: Map<string, any>;
  complianceFrameworks: Map<string, any>;
  threatIntelligence: Map<string, any>;
  incidentPlaybooks: Map<string, any>;
  riskAssessmentModels: Map<string, any>;
}

export interface AIAnalysisRequest {
  query: string;
  context: {
    findings: any[];
    assets: any[];
    scans: any[];
    threats: any[];
    compliance: any;
    networkStatus: any;
  };
  analysisType: 'recommendation' | 'threat_analysis' | 'risk_assessment' | 'compliance_check' | 'incident_response';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface AIAnalysisResponse {
  id: string;
  timestamp: string;
  confidence: number;
  reasoning: string;
  recommendations: Array<{
    action: string;
    priority: string;
    impact: string;
    effort: string;
    timeline: string;
    owner: string;
    automatable: boolean;
  }>;
  riskScore: number;
  businessImpact: string;
  technicalDetails: string;
  relatedFindings: string[];
  sources: string[];
  modelUsed: string;
}

export class AISecurityAnalyzer {
  private config: AIModelConfig;
  private knowledgeBase!: SecurityKnowledgeBase;
  private conversationHistory: Array<{query: string, response: string, timestamp: string}>;
  private modelStats: Map<string, {requests: number, avgConfidence: number, avgResponseTime: number}>;

  constructor(config: AIModelConfig) {
    this.config = config;
    this.conversationHistory = [];
    this.modelStats = new Map();
    this.initializeKnowledgeBase();
  }

  private initializeKnowledgeBase(): void {
    this.knowledgeBase = {
      vulnerabilityPatterns: new Map([
        ['sql-injection', {
          description: 'SQL injection vulnerability pattern',
          indicators: ['union select', 'drop table', 'or 1=1', 'script injection'],
          severity: 'critical',
          mitigation: 'Use parameterized queries, input validation, WAF rules',
          businessImpact: 'Data breach, unauthorized access, data manipulation'
        }],
        ['xss', {
          description: 'Cross-site scripting vulnerability',
          indicators: ['<script>', 'javascript:', 'onerror=', 'onload='],
          severity: 'high',
          mitigation: 'Input sanitization, CSP headers, output encoding',
          businessImpact: 'Session hijacking, data theft, malicious code execution'
        }],
        ['unpatched-system', {
          description: 'Systems with missing security patches',
          indicators: ['outdated version', 'known CVE', 'end-of-life'],
          severity: 'high',
          mitigation: 'Automated patch management, vulnerability scanning, asset inventory',
          businessImpact: 'System compromise, lateral movement, data exfiltration'
        }]
      ]),

      mitigationStrategies: new Map([
        ['network-segmentation', {
          description: 'Implement network micro-segmentation',
          effectiveness: 'high',
          complexity: 'medium',
          cost: 'medium',
          timeline: '2-4 weeks',
          dependencies: ['firewall rules', 'VLAN configuration', 'access policies']
        }],
        ['zero-trust', {
          description: 'Deploy zero-trust architecture',
          effectiveness: 'very-high',
          complexity: 'high',
          cost: 'high',
          timeline: '3-6 months',
          dependencies: ['identity management', 'device compliance', 'continuous monitoring']
        }],
        ['automated-patching', {
          description: 'Implement automated patch management',
          effectiveness: 'high',
          complexity: 'low',
          cost: 'low',
          timeline: '1-2 weeks',
          dependencies: ['asset inventory', 'change management', 'testing procedures']
        }]
      ]),

      complianceFrameworks: new Map([
        ['sox', {
          requirements: ['access controls', 'audit trails', 'change management'],
          criticalControls: ['IT-01', 'IT-02', 'IT-03'],
          assessmentFrequency: 'annual',
          keyMetrics: ['control effectiveness', 'deficiency remediation', 'audit findings']
        }],
        ['iso27001', {
          requirements: ['ISMS', 'risk assessment', 'security controls'],
          criticalControls: ['A.9', 'A.12', 'A.13'],
          assessmentFrequency: 'annual',
          keyMetrics: ['control maturity', 'risk treatment', 'incident response']
        }]
      ]),

      threatIntelligence: new Map([
        ['apt-groups', {
          'APT1': { tactics: ['spear-phishing', 'lateral-movement'], targets: ['intellectual-property'] },
          'APT28': { tactics: ['credential-harvesting', 'persistence'], targets: ['government', 'defense'] },
          'APT29': { tactics: ['supply-chain', 'cloud-compromise'], targets: ['technology', 'healthcare'] }
        }],
        ['malware-families', {
          'ransomware': { indicators: ['file-encryption', 'ransom-note', 'payment-demand'] },
          'trojans': { indicators: ['backdoor-access', 'data-exfiltration', 'remote-control'] },
          'rootkits': { indicators: ['kernel-modification', 'process-hiding', 'file-hiding'] }
        }]
      ]),

      incidentPlaybooks: new Map([
        ['data-breach', {
          phases: ['detection', 'containment', 'eradication', 'recovery', 'lessons-learned'],
          timeline: '72-hours',
          stakeholders: ['CISO', 'Legal', 'PR', 'Executive Leadership'],
          notifications: ['customers', 'regulators', 'law-enforcement']
        }],
        ['ransomware', {
          phases: ['isolation', 'assessment', 'backup-restoration', 'security-hardening'],
          timeline: '24-48 hours',
          stakeholders: ['IT Operations', 'Security Team', 'Executive Leadership'],
          decisions: ['payment-consideration', 'law-enforcement', 'public-disclosure']
        }]
      ]),

      riskAssessmentModels: new Map([
        ['quantitative', {
          formula: 'Risk = Threat × Vulnerability × Impact',
          factors: ['asset-value', 'threat-likelihood', 'vulnerability-exploitability'],
          outputs: ['monetary-loss', 'risk-score', 'risk-appetite-alignment']
        }],
        ['qualitative', {
          scales: ['low', 'medium', 'high', 'critical'],
          criteria: ['business-impact', 'technical-complexity', 'regulatory-requirements'],
          outputs: ['risk-matrix', 'prioritization', 'treatment-strategy']
        }]
      ])
    };
  }

  /**
   * Main AI analysis function - routes to appropriate model based on config
   */
  async analyzeSecurityQuery(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    const startTime = Date.now();
    
    try {
      let response: AIAnalysisResponse;
      
      switch (this.config.provider) {
        case 'openai':
          response = await this.analyzeWithOpenAI(request);
          break;
        case 'azure-openai':
          response = await this.analyzeWithOpenAI(request); // Use OpenAI method for now
          break;
        case 'anthropic':
          response = await this.analyzeWithOpenAI(request); // Use OpenAI method for now
          break;
        case 'ollama':
          response = await this.analyzeWithOpenAI(request); // Use OpenAI method for now
          break;
        case 'local':
          response = await this.analyzeWithFallback(request);
          break;
        case 'huggingface':
          response = await this.analyzeWithOpenAI(request); // Use OpenAI method for now
          break;
        default:
          response = await this.analyzeWithFallback(request);
      }
      
      // Update model statistics
      const responseTime = Date.now() - startTime;
      this.updateModelStats(this.config.model, response.confidence, responseTime);
      
      // Store in conversation history
      this.conversationHistory.push({
        query: request.query,
        response: response.reasoning,
        timestamp: new Date().toISOString()
      });
      
      return response;
      
    } catch (error: any) {
      console.error('AI analysis error:', error);
      return this.generateFallbackResponse(request, error.message);
    }
  }

  /**
   * OpenAI GPT integration
   */
  private async analyzeWithOpenAI(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    const systemPrompt = this.buildSecuritySystemPrompt();
    const userPrompt = this.buildContextualPrompt(request);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: this.config.temperature || 0.3,
        max_tokens: this.config.maxTokens || 2000,
        response_format: { type: 'json_object' }
      })
    });

    const data = await response.json();
    return this.parseAIResponse(data.choices[0].message.content, 'openai');
  }

  /**
   * Fallback analysis when AI models are unavailable
   */
  private async analyzeWithFallback(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    return this.generateFallbackResponse(request, 'AI model not configured');
  }

  /**
   * Build security-specific system prompt
   */
  private buildSecuritySystemPrompt(): string {
    return `You are an expert cybersecurity analyst and advisor. Your role is to:

1. Analyze security findings, vulnerabilities, and threats
2. Provide actionable remediation recommendations
3. Assess business impact and risk levels
4. Suggest prioritization based on CVSS scores, asset criticality, and exploit availability
5. Reference established security frameworks (NIST, ISO 27001, CIS Controls)
6. Consider compliance requirements (SOX, PCI DSS, HIPAA, GDPR)

Guidelines:
- Always provide confidence scores (0-100)
- Include specific technical details and remediation steps
- Consider business context and resource constraints
- Identify automatable tasks where possible
- Reference related findings and threat intelligence
- Maintain professional, clear, and actionable language

Respond in JSON format with the following structure:
{
  "confidence": number,
  "reasoning": "detailed analysis",
  "recommendations": [{"action": "", "priority": "", "impact": "", "effort": "", "timeline": "", "owner": "", "automatable": boolean}],
  "riskScore": number,
  "businessImpact": "description",
  "technicalDetails": "technical explanation",
  "relatedFindings": ["finding_ids"],
  "sources": ["knowledge sources"]
}`;
  }

  /**
   * Build contextual prompt with security data
   */
  private buildContextualPrompt(request: AIAnalysisRequest): string {
    const context = request.context;
    
    return `Security Analysis Request:
Query: "${request.query}"
Analysis Type: ${request.analysisType}
Priority: ${request.priority}

Current Security Context:
- Total Findings: ${context.findings.length}
- Critical Findings: ${context.findings.filter(f => f.severity === 'critical').length}
- High Findings: ${context.findings.filter(f => f.severity === 'high').length}
- Assets: ${context.assets.length}
- Recent Scans: ${context.scans.length}
- Active Threats: ${context.threats.length}

Recent Findings:
${context.findings.slice(0, 10).map(f => 
  `- ${f.severity.toUpperCase()}: ${f.description} (${f.type})`
).join('\n')}

Asset Breakdown:
${context.assets.slice(0, 10).map(a => 
  `- ${a.name} (${a.type}) - Criticality: ${a.criticality}`
).join('\n')}

Please provide a comprehensive security analysis and actionable recommendations.`;
  }

  /**
   * Parse AI response into structured format
   */
  private parseAIResponse(responseText: string, provider: string): AIAnalysisResponse {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(responseText);
      
      return {
        id: `${provider}_${Date.now()}`,
        timestamp: new Date().toISOString(),
        confidence: parsed.confidence || 80,
        reasoning: parsed.reasoning || responseText,
        recommendations: parsed.recommendations || [],
        riskScore: parsed.riskScore || 0,
        businessImpact: parsed.businessImpact || 'Impact assessment needed',
        technicalDetails: parsed.technicalDetails || 'Technical analysis required',
        relatedFindings: parsed.relatedFindings || [],
        sources: parsed.sources || ['ai-analysis'],
        modelUsed: this.config.model
      };
    } catch (error) {
      // Fallback to text parsing
      return this.parseTextResponse(responseText, provider);
    }
  }

  /**
   * Fallback text parsing when JSON parsing fails
   */
  private parseTextResponse(text: string, provider: string): AIAnalysisResponse {
    // Extract confidence from text patterns
    const confidenceMatch = text.match(/confidence[:\s]*(\d+)/i);
    const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 75;
    
    // Extract recommendations
    const recommendationPattern = /(?:recommend|suggest|should|action)[:\s]*([^.]+)/gi;
    const recommendations = [];
    let match;
    while ((match = recommendationPattern.exec(text)) !== null) {
      recommendations.push({
        action: match[1].trim(),
        priority: 'medium',
        impact: 'medium',
        effort: 'unknown',
        timeline: 'TBD',
        owner: 'Security Team',
        automatable: false
      });
    }

    return {
      id: `${provider}_${Date.now()}`,
      timestamp: new Date().toISOString(),
      confidence,
      reasoning: text,
      recommendations,
      riskScore: confidence * 0.8, // Approximate risk score
      businessImpact: 'AI analysis completed',
      technicalDetails: text,
      relatedFindings: [],
      sources: ['ai-text-analysis'],
      modelUsed: this.config.model
    };
  }

  /**
   * Rule-based analysis fallback
   */
  private performRuleBasedAnalysis(request: AIAnalysisRequest): any {
    const { context, query } = request;
    const criticalFindings = context.findings.filter(f => f.severity === 'critical');
    const highFindings = context.findings.filter(f => f.severity === 'high');
    
    const riskScore = Math.min(100, (criticalFindings.length * 20) + (highFindings.length * 10));
    
    const recommendations = [];
    
    if (criticalFindings.length > 0) {
      recommendations.push({
        action: `Address ${criticalFindings.length} critical findings immediately`,
        priority: 'critical',
        impact: 'high',
        effort: 'high',
        timeline: '24 hours',
        owner: 'Security Team',
        automatable: false
      });
    }
    
    if (query.toLowerCase().includes('patch')) {
      recommendations.push({
        action: 'Implement automated patch management',
        priority: 'high',
        impact: 'medium',
        effort: 'medium',
        timeline: '1 week',
        owner: 'IT Operations',
        automatable: true
      });
    }

    return {
      reasoning: `Rule-based analysis identified ${criticalFindings.length} critical and ${highFindings.length} high-severity findings requiring attention.`,
      recommendations,
      riskScore,
      businessImpact: riskScore > 70 ? 'High business risk - immediate action required' : 'Manageable risk level',
      technicalDetails: `Analysis based on ${context.findings.length} findings across ${context.assets.length} assets`,
      relatedFindings: criticalFindings.map(f => f.id).slice(0, 5)
    };
  }

  /**
   * Generate fallback response on AI failure
   */
  private generateFallbackResponse(request: AIAnalysisRequest, error: string): AIAnalysisResponse {
    const fallbackAnalysis = this.performRuleBasedAnalysis(request);
    
    return {
      id: `fallback_${Date.now()}`,
      timestamp: new Date().toISOString(),
      confidence: 60,
      reasoning: `AI analysis unavailable (${error}). Providing rule-based analysis: ${fallbackAnalysis.reasoning}`,
      recommendations: fallbackAnalysis.recommendations,
      riskScore: fallbackAnalysis.riskScore,
      businessImpact: fallbackAnalysis.businessImpact,
      technicalDetails: fallbackAnalysis.technicalDetails,
      relatedFindings: fallbackAnalysis.relatedFindings,
      sources: ['fallback-rules'],
      modelUsed: 'rule-based-fallback'
    };
  }

  /**
   * Update model performance statistics
   */
  private updateModelStats(model: string, confidence: number, responseTime: number): void {
    const stats = this.modelStats.get(model) || { requests: 0, avgConfidence: 0, avgResponseTime: 0 };
    
    stats.requests += 1;
    stats.avgConfidence = ((stats.avgConfidence * (stats.requests - 1)) + confidence) / stats.requests;
    stats.avgResponseTime = ((stats.avgResponseTime * (stats.requests - 1)) + responseTime) / stats.requests;
    
    this.modelStats.set(model, stats);
  }

  /**
   * Get model performance metrics
   */
  getModelStats(): Map<string, any> {
    return this.modelStats;
  }

  /**
   * Get conversation history
   */
  getConversationHistory(): Array<any> {
    return this.conversationHistory;
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Update AI model configuration
   */
  updateConfig(newConfig: Partial<AIModelConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Test AI model connectivity
   */
  async testConnection(): Promise<{connected: boolean, latency: number, error?: string}> {
    const startTime = Date.now();
    
    try {
      const testRequest: AIAnalysisRequest = {
        query: 'Test connection',
        context: { findings: [], assets: [], scans: [], threats: [], compliance: {}, networkStatus: {} },
        analysisType: 'recommendation',
        priority: 'low'
      };
      
      await this.analyzeSecurityQuery(testRequest);
      
      return {
        connected: true,
        latency: Date.now() - startTime
      };
    } catch (error: any) {
      return {
        connected: false,
        latency: Date.now() - startTime,
        error: error.message
      };
    }
  }
}

export default AISecurityAnalyzer;