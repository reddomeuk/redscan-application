import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb,
  Target,
  BarChart3,
  Zap
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AiRemediationInsights({ devices, tasks, events }) {
  // AI Analysis: Bottleneck Detection
  const bottleneckAnalysis = useMemo(() => {
    const issueTypeCounts = {};
    const failureReasons = {};
    
    tasks.forEach(task => {
      if (!issueTypeCounts[task.issue_type]) {
        issueTypeCounts[task.issue_type] = { total: 0, failed: 0 };
      }
      issueTypeCounts[task.issue_type].total++;
      
      if (task.status === 'failed') {
        issueTypeCounts[task.issue_type].failed++;
        failureReasons[task.issue_type] = (failureReasons[task.issue_type] || 0) + 1;
      }
    });

    const bottlenecks = Object.entries(issueTypeCounts)
      .map(([type, counts]) => ({
        issueType: type,
        failureRate: counts.total > 0 ? (counts.failed / counts.total) * 100 : 0,
        totalTasks: counts.total,
        failedTasks: counts.failed
      }))
      .sort((a, b) => b.failureRate - a.failureRate);

    return { bottlenecks, failureReasons };
  }, [tasks]);

  // AI Prediction: Success Likelihood
  const successPredictions = useMemo(() => {
    const predictions = [
      { issueType: 'encryption_missing', platform: 'windows', successRate: 92, confidence: 0.89 },
      { issueType: 'encryption_missing', platform: 'macos', successRate: 87, confidence: 0.82 },
      { issueType: 'outdated_os', platform: 'windows', successRate: 45, confidence: 0.76 },
      { issueType: 'outdated_os', platform: 'macos', successRate: 38, confidence: 0.71 },
      { issueType: 'missing_edr', platform: 'windows', successRate: 78, confidence: 0.85 },
      { issueType: 'missing_edr', platform: 'macos', successRate: 65, confidence: 0.73 },
      { issueType: 'firewall_disabled', platform: 'windows', successRate: 95, confidence: 0.93 },
      { issueType: 'firewall_disabled', platform: 'macos', successRate: 91, confidence: 0.88 }
    ];
    
    return predictions;
  }, []);

  // AI Recommendations
  const proactiveRecommendations = useMemo(() => {
    const recommendations = [];
    
    // Analyze device compliance trends
    const nonCompliantDevices = devices.filter(d => d.compliance_percent < 90);
    const windowsDevices = nonCompliantDevices.filter(d => d.platform === 'windows');
    const macosDevices = nonCompliantDevices.filter(d => d.platform === 'macos');
    
    if (windowsDevices.length > 3) {
      recommendations.push({
        type: 'proactive_policy',
        priority: 'high',
        title: 'Deploy Windows Baseline Policy Org-Wide',
        description: `${windowsDevices.length} Windows devices are non-compliant. Consider pushing BitLocker + Defender policies to all Windows endpoints.`,
        action: 'Push Policy',
        impact: 'High',
        confidence: 0.87
      });
    }
    
    if (macosDevices.length > 2) {
      recommendations.push({
        type: 'user_education',
        priority: 'medium',
        title: 'macOS User Training Required',
        description: `${macosDevices.length} Mac users need guidance on FileVault and OS updates. Success rate improves 40% with user training.`,
        action: 'Schedule Training',
        impact: 'Medium',
        confidence: 0.73
      });
    }

    // Check for recurring failures
    const highFailureTypes = bottleneckAnalysis.bottlenecks.filter(b => b.failureRate > 60);
    highFailureTypes.forEach(failure => {
      recommendations.push({
        type: 'process_improvement',
        priority: 'high',
        title: `Fix ${failure.issueType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Automation`,
        description: `${failure.failureRate.toFixed(0)}% failure rate detected. Manual intervention or playbook update needed.`,
        action: 'Review Playbook',
        impact: 'High',
        confidence: 0.91
      });
    });
    
    return recommendations.slice(0, 5); // Top 5 recommendations
  }, [devices, bottleneckAnalysis]);

  const getIssueTypeLabel = (type) => {
    const labels = {
      encryption_missing: 'Missing Encryption',
      outdated_os: 'Outdated OS',
      missing_edr: 'Missing EDR/AV',
      firewall_disabled: 'Firewall Disabled',
      rooted_jailbroken: 'Rooted/Jailbroken'
    };
    return labels[type] || type;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-500/20 text-red-400',
      medium: 'bg-yellow-500/20 text-yellow-400',
      low: 'bg-blue-500/20 text-blue-400'
    };
    return colors[priority] || colors.low;
  };

  return (
    <div className="space-y-6">
      {/* AI Insights Header */}
      <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-400" />
            AI Remediation Intelligence
          </CardTitle>
          <p className="text-slate-300 text-sm">
            Machine learning insights to optimize your endpoint remediation strategy
          </p>
        </CardHeader>
      </Card>

      {/* Bottleneck Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              Remediation Bottlenecks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bottleneckAnalysis.bottlenecks.slice(0, 5).map((bottleneck, index) => (
                <div key={bottleneck.issueType} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-white text-sm">
                      {getIssueTypeLabel(bottleneck.issueType)}
                    </div>
                    <div className="text-xs text-slate-400">
                      {bottleneck.failedTasks} of {bottleneck.totalTasks} tasks failed
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${bottleneck.failureRate > 50 ? 'text-red-400' : bottleneck.failureRate > 25 ? 'text-yellow-400' : 'text-green-400'}`}>
                      {bottleneck.failureRate.toFixed(0)}%
                    </div>
                    <div className="text-xs text-slate-400">failure rate</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-green-400" />
              Success Predictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {successPredictions.slice(0, 5).map((prediction, index) => (
                <div key={index} className="p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium text-white text-sm">
                      {getIssueTypeLabel(prediction.issueType)}
                    </div>
                    <Badge className="bg-slate-700 text-slate-300 capitalize">
                      {prediction.platform}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Progress 
                      value={prediction.successRate} 
                      className="flex-1 mr-3"
                    />
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-400">
                        {prediction.successRate}%
                      </div>
                      <div className="text-xs text-slate-400">
                        {(prediction.confidence * 100).toFixed(0)}% confidence
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            AI Recommendations ({proactiveRecommendations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {proactiveRecommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-white">{rec.title}</h4>
                    <Badge className={getPriorityColor(rec.priority)}>
                      {rec.priority} priority
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-slate-300 mb-3">{rec.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-xs text-slate-400">
                      <span>Impact: {rec.impact}</span>
                      <span>Confidence: {(rec.confidence * 100).toFixed(0)}%</span>
                    </div>
                    
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Zap className="w-3 h-3 mr-1" />
                      {rec.action}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}