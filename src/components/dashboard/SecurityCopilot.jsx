import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { EnhancedSecurityCopilot } from '../../services/EnhancedSecurityCopilot';
import { FreeAIProviders } from '../../services/FreeAIProviders';
import { realTimeService } from '../../services/RealTimeDataService';
import { 
  Bot, 
  MessageCircle, 
  Send,
  ArrowUpRight,
  Clock,
  AlertTriangle,
  Shield,
  Activity,
  TrendingUp,
  Wifi,
  WifiOff,
  Zap,
  DollarSign
} from 'lucide-react';
import { format, subDays, isAfter } from 'date-fns';

export default function SecurityCopilot({ 
  findings = [], 
  scans = [], 
  assets = [], 
  compact = false 
}) {
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [enhancedCopilot] = useState(() => new EnhancedSecurityCopilot());
  const [freeAI] = useState(() => FreeAIProviders.getInstance());
  const [lastResponse, setLastResponse] = useState({ provider: '', cost: '' });
  const [realTimeFindings, setRealTimeFindings] = useState([]);
  const [realTimeScans, setRealTimeScans] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState(null);

  // Subscribe to real-time updates
  useEffect(() => {
    // Subscribe to real-time events
    const unsubscribeFinding = realTimeService.subscribe('finding', (finding) => {
      setRealTimeFindings(prev => [finding, ...prev.slice(0, 49)]); // Keep last 50
    });

    const unsubscribeScan = realTimeService.subscribe('scan', (scan) => {
      setRealTimeScans(prev => [scan, ...prev.slice(0, 49)]); // Keep last 50
    });

    const unsubscribeConnection = realTimeService.subscribe('connection', (status) => {
      setConnectionStatus(status);
    });

    const unsubscribeAlert = realTimeService.subscribe('alert', (alert) => {
      // Add alert to conversation automatically
      const alertMessage = {
        type: 'system',
        content: {
          text: `🚨 **Real-time Alert**: ${alert.message}`,
          priority: alert.severity,
          timestamp: alert.timestamp
        },
        timestamp: new Date(alert.timestamp)
      };
      setConversation(prev => [...prev, alertMessage]);
    });

    // Get initial cached data
    setRealTimeFindings(realTimeService.getCachedData('findings'));
    setRealTimeScans(realTimeService.getCachedData('scans'));
    setConnectionStatus(realTimeService.getConnectionStatus());

    // Cleanup subscriptions
    return () => {
      unsubscribeFinding();
      unsubscribeScan();
      unsubscribeConnection();
      unsubscribeAlert();
    };
  }, []);

  // Merge real-time data with props data
  const allFindings = [...realTimeFindings, ...findings];
  const allScans = [...realTimeScans, ...scans];

  const quickQuestions = [
    "What changed today?",
    "What should I fix first?",
    "Any Criticals older than 7 days?",
    "Show me recent scan results",
    "What's my current risk score?",
    "Are we compliant with SOC2?",
    "Analyze threat intelligence",
    "Prioritize vulnerabilities by business impact"
  ];

  // Generate 24h summary with real-time data
  const generate24hSummary = () => {
    const yesterday = subDays(new Date(), 1);
    
    // Recent scans (including real-time)
    const recentScans = allScans.filter(scan => 
      scan.finished_at && isAfter(new Date(scan.finished_at), yesterday)
    );
    
    // New findings (including real-time)
    const newFindings = allFindings.filter(finding => 
      isAfter(new Date(finding.created_date), yesterday)
    );
    
    const newFindingsBySeverity = {
      critical: newFindings.filter(f => f.severity === 'critical').length,
      high: newFindings.filter(f => f.severity === 'high').length,
      medium: newFindings.filter(f => f.severity === 'medium').length,
      low: newFindings.filter(f => f.severity === 'low').length
    };
    
    // Open criticals (including real-time)
    const openCriticals = allFindings.filter(f => 
      f.severity === 'critical' && f.status === 'open'
    );
    
    return {
      scansRun: recentScans.length,
      newFindings: newFindingsBySeverity,
      totalNewFindings: newFindings.length,
      openCriticals: openCriticals.length,
      oldCriticals: openCriticals.filter(f => 
        !isAfter(new Date(f.created_date), subDays(new Date(), 7))
      ).length,
      realTimeCount: realTimeFindings.length + realTimeScans.length
    };
  };

  const handleQuickQuestion = (q) => {
    setQuestion(q);
    handleSubmitQuestion(q);
  };

  const handleSubmitQuestion = async (questionText = question) => {
    if (!questionText.trim()) return;
    
    setLoading(true);
    
    // Add user message
    const userMessage = { type: 'user', content: questionText, timestamp: new Date() };
    setConversation(prev => [...prev, userMessage]);
    
    try {
      // Prepare security context for enhanced analysis (with real-time data)
      const securityContext = {
        findings: allFindings.map(f => ({
          id: f.id,
          severity: f.severity,
          type: f.type,
          description: f.title || f.description,
          timestamp: f.created_date,
          realTime: realTimeFindings.some(rf => rf.id === f.id)
        })),
        assets: assets.map(a => ({
          id: a.id,
          name: a.name,
          type: a.asset_type,
          criticality: a.criticality || 'medium'
        })),
        scans: allScans.map(s => ({
          id: s.id,
          type: s.scan_type,
          status: s.status,
          timestamp: s.created_date,
          realTime: realTimeScans.some(rs => rs.id === s.id)
        })),
        realTimeStatus: {
          connected: connectionStatus?.connected || false,
          lastUpdate: connectionStatus?.lastUpdate,
          eventsReceived: realTimeFindings.length + realTimeScans.length
        }
      };

      let recommendation;
      let usedFreeAI = false;

      try {
        // Try enhanced AI copilot first
        recommendation = await enhancedCopilot.analyzeSecurityQuestion(questionText, securityContext);
      } catch (enhancedError) {
        console.log('Enhanced AI copilot failed, trying free AI providers...', enhancedError);
        
        // Fallback to free AI providers
        const contextualPrompt = `
Security Context:
- Total Findings: ${allFindings.length}
- Critical: ${allFindings.filter(f => f.severity === 'critical').length}
- High: ${allFindings.filter(f => f.severity === 'high').length}
- Assets: ${assets.length}
- Recent Scans: ${allScans.length}

User Question: ${questionText}

Please provide cybersecurity advice based on this context.`;

        const aiResponse = await freeAI.generateSecurityResponse(contextualPrompt);
        setLastResponse({ provider: aiResponse.provider, cost: aiResponse.cost });
        usedFreeAI = true;

        // Convert free AI response to recommendation format
        recommendation = {
          id: `free-ai-${Date.now()}`,
          title: 'Security Analysis',
          description: aiResponse.response,
          businessImpact: 'Analyzed using free AI provider',
          technicalDetail: `Response generated by ${aiResponse.provider}`,
          remediationSteps: [
            {
              step: 1,
              action: 'Review the analysis above',
              owner: 'Security Team',
              timeline: 'Immediate'
            }
          ],
          estimatedEffort: 'Variable',
          confidence: 75,
          priority: 'medium',
          automatable: false,
          links: []
        };
      }
      
      // Format response for display
      const response = {
        text: `**${recommendation.title}**

${recommendation.description}

**Business Impact:** ${recommendation.businessImpact}

**Technical Details:** ${recommendation.technicalDetail}

**Recommended Actions:**
${recommendation.remediationSteps.map((step, idx) => 
  `${step.step}. **${step.action}** (${step.owner} - ${step.timeline})`
).join('\n')}

**Effort Estimate:** ${recommendation.estimatedEffort}
**Confidence:** ${recommendation.confidence}%
**Priority:** ${recommendation.priority.toUpperCase()}${recommendation.automatable ? ' • ⚡ Automatable' : ''}${usedFreeAI ? ` • 💰 ${lastResponse.cost}` : ''}`,
        
        links: recommendation.links.map(link => ({
          text: link.text,
          url: link.type === 'internal' ? createPageUrl(link.url.replace('/', '')) : link.url
        })),
        
        priority: recommendation.priority,
        confidence: recommendation.confidence,
        automatable: recommendation.automatable,
        provider: usedFreeAI ? lastResponse.provider : 'Enhanced AI',
        cost: usedFreeAI ? lastResponse.cost : 'Premium'
      };
      
      const aiMessage = { 
        type: 'ai', 
        content: response, 
        timestamp: new Date(),
        metadata: {
          recommendationId: recommendation.id,
          priority: recommendation.priority,
          confidence: recommendation.confidence,
          provider: response.provider,
          cost: response.cost
        }
      };
      
      setConversation(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('All AI providers failed:', error);
      
      // Final fallback to basic response generation
      const fallbackResponse = generateBasicResponse(questionText);
      const aiMessage = { 
        type: 'ai', 
        content: {
          ...fallbackResponse,
          provider: 'Fallback Rules',
          cost: 'FREE'
        }, 
        timestamp: new Date() 
      };
      setConversation(prev => [...prev, aiMessage]);
    }
    
    setQuestion('');
    setLoading(false);
  };

  const generateBasicResponse = (questionText) => {
    const lowerQ = questionText.toLowerCase();
    const summary = generate24hSummary();
    
    if (lowerQ.includes('what changed') || lowerQ.includes('today')) {
      return {
        text: `Here's what happened in the last 24 hours:

• **${summary.scansRun} security scans** completed across your assets
• **${summary.totalNewFindings} new findings** discovered:
  - ${summary.newFindings.critical} Critical
  - ${summary.newFindings.high} High  
  - ${summary.newFindings.medium} Medium
  - ${summary.newFindings.low} Low
• **${summary.openCriticals} critical issues** still require attention
${summary.oldCriticals > 0 ? `• **${summary.oldCriticals} critical findings** are older than 7 days` : ''}

The security team should prioritize the ${summary.newFindings.critical} new critical findings immediately.`,
        links: [
          { text: 'View All Findings', url: createPageUrl('Findings') },
          { text: 'Recent Scans', url: createPageUrl('Scans') }
        ]
      };
    }
    
    if (lowerQ.includes('fix first') || lowerQ.includes('priority')) {
      const criticalFindings = allFindings.filter(f => f.severity === 'critical' && f.status === 'open');
      const highFindings = allFindings.filter(f => f.severity === 'high' && f.status === 'open');
      
      return {
        text: `Based on current risk analysis, here's your priority list:

**Immediate Action Required:**
${criticalFindings.length > 0 ? 
  `• ${criticalFindings.length} critical vulnerabilities need patching
• Focus on internet-facing assets first
• Estimated remediation time: ${criticalFindings.length * 2} hours${realTimeFindings.some(f => f.severity === 'critical') ? '\n• ⚡ Real-time alerts include new critical findings' : ''}` :
  '✅ No critical vulnerabilities - excellent work!'
}

**This Week:**
• ${highFindings.length} high-severity issues to address
• Review and update security policies
• Validate recent patches are deployed

**Business Impact:** Critical issues pose immediate risk of data breach or system compromise.`,
        links: [
          { text: 'Critical Findings', url: createPageUrl('Findings') + '?severity=critical' },
          { text: 'Asset Inventory', url: createPageUrl('Assets') }
        ]
      };
    }
    
    if (lowerQ.includes('criticals') && lowerQ.includes('7 days')) {
      const oldCriticals = allFindings.filter(f => 
        f.severity === 'critical' && 
        f.status === 'open' && 
        !isAfter(new Date(f.created_date), subDays(new Date(), 7))
      );
      
      return {
        text: oldCriticals.length > 0 ? 
          `⚠️ **${oldCriticals.length} critical findings** have been open for more than 7 days:

${oldCriticals.slice(0, 3).map(f => `• ${f.title} (${format(new Date(f.created_date), 'MMM dd')})`).join('\n')}

**Recommendation:** These require immediate executive escalation. Critical vulnerabilities should be resolved within 72 hours per security policy.

**Next Steps:**
1. Assign dedicated resources to each finding
2. If remediation isn't possible, implement compensating controls
3. Document risk acceptance if business-critical systems can't be patched

${summary.realTimeCount > 0 ? `\n📡 **Real-time Monitoring Active:** ${summary.realTimeCount} events tracked live` : ''}` :
          '✅ **Great news!** No critical findings have been open longer than 7 days. Your incident response time is excellent.',
        links: [
          { text: 'View Critical Findings', url: createPageUrl('Findings') + '?severity=critical&status=open' },
          { text: 'Create Remediation Tasks', url: createPageUrl('Tasks') }
        ]
      };
    }
    
    if (lowerQ.includes('scan') || lowerQ.includes('recent')) {
      const recentScans = allScans.slice(0, 5);
      return {
        text: `**Recent Security Scans:**

${recentScans.map(scan => 
  `• **${scan.scan_type.toUpperCase()}** scan on ${assets.find(a => a.id === scan.asset_id)?.name || 'Unknown'} - ${scan.status} (${scan.summary?.findings_count || 0} findings)${realTimeScans.some(rs => rs.id === scan.id) ? ' 🔴 LIVE' : ''}`
).join('\n')}

**Scan Health:** ${allScans.filter(s => s.status === 'completed').length}/${allScans.length} scans completed successfully.

${connectionStatus?.connected ? '📡 **Real-time monitoring active** - New scans will appear automatically' : '⚠️ Real-time monitoring offline - Refresh for latest data'}`,
        links: [
          { text: 'All Scan Results', url: createPageUrl('Scans') },
          { text: 'Schedule New Scan', url: createPageUrl('Assets') }
        ]
      };
    }
    
    if (lowerQ.includes('risk score')) {
      const avgRiskScore = assets.reduce((sum, asset) => sum + (asset.risk_score || 0), 0) / assets.length || 0;
      const riskLevel = avgRiskScore > 7 ? 'High' : avgRiskScore > 4 ? 'Medium' : 'Low';
      
      return {
        text: `**Current Risk Assessment:**

• **Overall Risk Score:** ${avgRiskScore.toFixed(1)}/10 (${riskLevel})
• **Total Assets:** ${assets.length}
• **High-Risk Assets:** ${assets.filter(a => (a.risk_score || 0) > 7).length}
• **Open Findings:** ${findings.filter(f => f.status === 'open').length}

**Trend:** ${avgRiskScore > 5 ? 'Risk is elevated due to unpatched vulnerabilities' : 'Risk is within acceptable limits'}`,
        links: [
          { text: 'Asset Risk Details', url: createPageUrl('Assets') },
          { text: 'Risk Dashboard', url: createPageUrl('Analytics') }
        ]
      };
    }
    
    // Default response
    return {
      text: `I can help you understand your security posture. Try asking:

• "What changed today?" - Get a 24-hour security summary
• "What should I fix first?" - Prioritized remediation guidance  
• "Any Criticals older than 7 days?" - SLA breach monitoring
• "Show me recent scan results" - Latest security assessments
• "What's my current risk score?" - Overall risk analysis

**Current Status:** ${findings.filter(f => f.status === 'open').length} open findings, ${summary.scansRun} scans completed today.`,
      links: [
        { text: 'Security Dashboard', url: createPageUrl('Dashboard') },
        { text: 'Full AI Assistant', url: createPageUrl('AiAssistant') }
      ]
    };
  };

  const summary = generate24hSummary();

  if (compact) {
    return (
      <Card className="bg-gradient-to-br from-purple-900/20 to-slate-800/50 border-purple-500/30 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-400" />
              Security Copilot
            </div>
            <div className="flex items-center gap-2">
              {connectionStatus?.connected ? 
                <Wifi className="w-4 h-4 text-green-400" title="Real-time monitoring active" /> :
                <WifiOff className="w-4 h-4 text-red-400" title="Real-time monitoring offline" />
              }
              {summary.realTimeCount > 0 && (
                <Badge variant="outline" className="text-xs border-green-400 text-green-400">
                  {summary.realTimeCount} live
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 24h Summary */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-purple-300">Last 24 Hours</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Activity className="w-3 h-3 text-blue-400" />
                <span className="text-slate-300">{summary.scansRun} scans</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3 h-3 text-orange-400" />
                <span className="text-slate-300">{summary.totalNewFindings} new findings</span>
              </div>
              {summary.openCriticals > 0 && (
                <div className="col-span-2 flex items-center gap-2">
                  <Shield className="w-3 h-3 text-red-400" />
                  <span className="text-red-300">{summary.openCriticals} open criticals</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Questions */}
          <div className="flex flex-wrap gap-1">
            {quickQuestions.slice(0, 3).map((q, i) => (
              <Button
                key={i}
                size="sm"
                variant="outline"
                onClick={() => handleQuickQuestion(q)}
                className="text-xs border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
              >
                {q}
              </Button>
            ))}
          </div>

          <Link to={createPageUrl('SecurityCopilot')}>
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
              <MessageCircle className="w-4 h-4 mr-2" />
              Open Full Copilot
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 24h Summary Card */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            24-Hour Security Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{summary.scansRun}</div>
            <div className="text-sm text-slate-400">Scans Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{summary.totalNewFindings}</div>
            <div className="text-sm text-slate-400">New Findings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{summary.openCriticals}</div>
            <div className="text-sm text-slate-400">Open Criticals</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {summary.openCriticals === 0 ? '✓' : summary.oldCriticals}
            </div>
            <div className="text-sm text-slate-400">
              {summary.openCriticals === 0 ? 'All Clear' : 'Overdue Criticals'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-400" />
              Ask Security Copilot
            </div>
            <div className="flex items-center gap-2">
              {lastResponse.provider && (
                <Badge variant="outline" className="text-xs border-green-400 text-green-400 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {lastResponse.provider}
                </Badge>
              )}
              {lastResponse.cost && (
                <Badge variant="outline" className="text-xs border-blue-400 text-blue-400 flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  {lastResponse.cost}
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Questions */}
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, i) => (
              <Button
                key={i}
                size="sm"
                variant="outline"
                onClick={() => handleQuickQuestion(q)}
                className="text-sm border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                {q}
              </Button>
            ))}
          </div>

          {/* Conversation */}
          <div className="max-h-96 overflow-y-auto space-y-4">
            {conversation.map((message, i) => (
              <div key={i} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.type === 'ai' && <Bot className="w-6 h-6 text-purple-400 mt-1" />}
                <div className={`max-w-md p-3 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-700 text-slate-100'
                }`}>
                  <div className="whitespace-pre-wrap text-sm">{message.content.text || message.content}</div>
                  
                  {/* Enhanced metadata for AI responses */}
                  {message.type === 'ai' && message.metadata && (
                    <div className="mt-2 flex gap-2">
                      {message.metadata.priority && (
                        <Badge className={`text-xs ${
                          message.metadata.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                          message.metadata.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                          message.metadata.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {message.metadata.priority.toUpperCase()}
                        </Badge>
                      )}
                      {message.metadata.confidence && (
                        <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                          {message.metadata.confidence}% confidence
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {/* Links */}
                  {message.content.links && (
                    <div className="mt-2 space-y-1">
                      {message.content.links.map((link, j) => (
                        <Link key={j} to={link.url} className="flex items-center gap-1 text-blue-300 hover:text-blue-200 text-sm">
                          {link.text} <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                {message.type === 'user' && <MessageCircle className="w-6 h-6 text-blue-400 mt-1" />}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 justify-start">
                <Bot className="w-6 h-6 text-purple-400 mt-1" />
                <div className="bg-slate-700 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Activity className="w-4 h-4 animate-pulse" />
                    <span className="text-sm">Analyzing security context...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask me anything about your security posture, compliance, threats, or priorities..."
              className="bg-slate-900/50 border-slate-700 text-white"
              onKeyPress={(e) => e.key === 'Enter' && handleSubmitQuestion()}
            />
            <Button 
              onClick={() => handleSubmitQuestion()}
              disabled={loading || !question.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}