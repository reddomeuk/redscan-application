import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Brain, TrendingDown, TrendingUp, AlertTriangle, Shield, Zap } from 'lucide-react';
import { toast } from 'sonner';

const AiRiskAssessment = ({ supplier, onUpdate }) => {
  const [isAssessing, setIsAssessing] = useState(false);

  const runAiAssessment = async () => {
    setIsAssessing(true);
    // Simulate AI assessment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate AI risk scoring
    const baseScore = Math.random() * 100;
    const riskTier = baseScore > 75 ? 'Critical' : baseScore > 50 ? 'High' : baseScore > 25 ? 'Medium' : 'Low';
    
    const aiAssessment = {
      risk_score: Math.round(baseScore),
      risk_tier: riskTier,
      ai_explanation: generateExplanation(supplier, baseScore),
      ai_remediation: generateRemediationActions(supplier, riskTier),
      ai_summary: generateSummary(supplier, riskTier),
      last_ai_assessment: new Date().toISOString(),
      risk_history: [...(supplier.risk_history || []), {
        date: new Date().toISOString().split('T')[0],
        score: Math.round(baseScore),
        tier: riskTier,
        reason: 'AI Re-assessment'
      }]
    };

    onUpdate(supplier.id, aiAssessment);
    setIsAssessing(false);
    toast.success('AI risk assessment completed');
  };

  const generateExplanation = (supplier, score) => {
    const factors = [];
    if (supplier.country === 'China' || supplier.country === 'Russia') {
      factors.push('elevated geopolitical risk from supplier location');
    }
    if (supplier.criticality === 'High') {
      factors.push('high business criticality increases impact potential');
    }
    if (!supplier.documents?.some(d => d.type === 'ISO 27001')) {
      factors.push('missing ISO 27001 certification');
    }
    if (!supplier.documents?.some(d => d.type === 'SOC 2')) {
      factors.push('no SOC 2 attestation on file');
    }
    
    return `Risk score of ${Math.round(score)} based on ${factors.length ? factors.join(', ') : 'standard risk factors'}.`;
  };

  const generateRemediationActions = (supplier, tier) => {
    const actions = [];
    if (tier === 'Critical' || tier === 'High') {
      actions.push('Request updated compliance certifications');
      actions.push('Implement additional monitoring controls');
      actions.push('Limit system access privileges');
    }
    if (!supplier.documents?.some(d => d.type === 'SOC 2')) {
      actions.push('Obtain SOC 2 Type II report');
    }
    if (supplier.country === 'China' || supplier.country === 'Russia') {
      actions.push('Conduct enhanced due diligence review');
      actions.push('Consider data residency restrictions');
    }
    return actions.slice(0, 5); // Limit to top 5 actions
  };

  const generateSummary = (supplier, tier) => {
    const certifications = supplier.documents?.filter(d => ['ISO 27001', 'SOC 2', 'PCI DSS'].includes(d.type)).length || 0;
    return `${supplier.name} presents ${tier.toLowerCase()} risk with ${certifications} compliance certifications. ${tier === 'Critical' ? 'Immediate attention required.' : tier === 'High' ? 'Enhanced monitoring recommended.' : 'Standard controls sufficient.'}`;
  };

  const getRiskColor = (tier) => {
    switch(tier) {
      case 'Critical': return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'High': return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      case 'Low': return 'bg-green-500/20 text-green-400 border-green-500/40';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
    }
  };

  const riskTrendData = supplier.risk_history?.slice(-6).map(h => ({
    date: h.date,
    score: h.score
  })) || [];

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            AI Risk Assessment
          </div>
          <Button 
            onClick={runAiAssessment} 
            disabled={isAssessing}
            variant="outline" 
            size="sm"
            className="border-purple-500/50 text-purple-300"
          >
            <Zap className="w-4 h-4 mr-2" />
            {isAssessing ? 'Analyzing...' : 'Run AI Assessment'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {supplier.risk_score ? (
          <>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white">{supplier.risk_score}</div>
                <div className="text-sm text-slate-400">Risk Score</div>
              </div>
              <Badge className={getRiskColor(supplier.risk_tier)}>
                {supplier.risk_tier} Risk
              </Badge>
            </div>

            {riskTrendData.length > 1 && (
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={riskTrendData}>
                    <XAxis dataKey="date" hide />
                    <YAxis hide />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <h4 className="text-white font-medium text-sm mb-2">AI Explanation</h4>
                <p className="text-slate-300 text-sm">{supplier.ai_explanation}</p>
              </div>

              {supplier.ai_summary && (
                <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                  <h4 className="text-purple-200 font-medium text-sm mb-1">Executive Summary</h4>
                  <p className="text-purple-100 text-sm">{supplier.ai_summary}</p>
                </div>
              )}

              {supplier.ai_remediation?.length > 0 && (
                <div>
                  <h4 className="text-white font-medium text-sm mb-2">Recommended Actions</h4>
                  <ul className="space-y-1">
                    {supplier.ai_remediation.map((action, index) => (
                      <li key={index} className="text-slate-300 text-sm flex items-start gap-2">
                        <span className="text-purple-400 mt-1">•</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {supplier.geo_risk_flags?.length > 0 && (
                <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <h4 className="text-red-200 font-medium text-sm mb-1 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Geopolitical Risk Factors
                  </h4>
                  <ul className="space-y-1">
                    {supplier.geo_risk_flags.map((flag, index) => (
                      <li key={index} className="text-red-100 text-sm">• {flag}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">No AI assessment available</p>
            <p className="text-slate-500 text-sm">Run AI assessment to generate risk scoring and insights</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AiRiskAssessment;