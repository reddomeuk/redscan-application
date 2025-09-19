import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  GitBranch, 
  Target, 
  Shield, 
  AlertTriangle,
  ArrowRight,
  Eye,
  RefreshCw,
  Zap,
  Lock,
  Unlock,
  Server,
  User,
  Database
} from 'lucide-react';
import { format } from 'date-fns';

export default function AttackPathWidget({ className }) {
  const [attackPaths, setAttackPaths] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAttackPaths();
    const interval = setInterval(loadAttackPaths, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadAttackPaths = async () => {
    try {
      // Simulate loading attack paths from threat detection engine
      const mockPaths = generateMockAttackPaths();
      setAttackPaths(mockPaths);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load attack paths:', error);
      setIsLoading(false);
    }
  };

  const generateMockAttackPaths = () => {
    return [
      {
        id: 'path_001',
        title: 'Credential Stuffing → Lateral Movement',
        severity: 'critical',
        probability: 0.87,
        discoveryTime: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        status: 'active',
        steps: [
          {
            id: 'step_1',
            type: 'initial_access',
            technique: 'T1110.004', // Credential Stuffing
            description: 'Automated credential stuffing attack detected',
            asset: 'login-server-01',
            assetType: 'server',
            impact: 'Authentication bypass',
            mitigated: false,
            indicators: ['Multiple failed login attempts', 'Distributed IP sources', 'Automated patterns']
          },
          {
            id: 'step_2',
            type: 'credential_access',
            technique: 'T1555.003', // Credentials from Web Browsers
            description: 'Browser credential extraction attempt',
            asset: 'workstation-156',
            assetType: 'endpoint',
            impact: 'Credential harvesting',
            mitigated: false,
            indicators: ['Browser process injection', 'Memory dump activities', 'Credential file access']
          },
          {
            id: 'step_3',
            type: 'lateral_movement',
            technique: 'T1021.001', // Remote Desktop Protocol
            description: 'RDP lateral movement to domain controller',
            asset: 'dc-primary-01',
            assetType: 'server',
            impact: 'Domain compromise',
            mitigated: true,
            indicators: ['RDP connections from compromised host', 'Privilege escalation attempts']
          }
        ],
        recommendations: [
          { priority: 'immediate', action: 'Block source IPs', description: 'Implement IP-based blocking for detected attack sources' },
          { priority: 'high', action: 'Force password reset', description: 'Reset passwords for affected accounts' },
          { priority: 'medium', action: 'Enable MFA', description: 'Enforce multi-factor authentication for all accounts' }
        ]
      },
      {
        id: 'path_002',
        title: 'Phishing → Privilege Escalation',
        severity: 'high',
        probability: 0.73,
        discoveryTime: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
        status: 'monitoring',
        steps: [
          {
            id: 'step_1',
            type: 'initial_access',
            technique: 'T1566.001', // Spearphishing Attachment
            description: 'Malicious email attachment opened',
            asset: 'user-workstation-89',
            assetType: 'endpoint',
            impact: 'Initial foothold established',
            mitigated: false,
            indicators: ['Suspicious email opened', 'Macro execution', 'Process injection']
          },
          {
            id: 'step_2',
            type: 'privilege_escalation',
            technique: 'T1055', // Process Injection
            description: 'Process injection for privilege escalation',
            asset: 'user-workstation-89',
            assetType: 'endpoint',
            impact: 'Local admin privileges',
            mitigated: true,
            indicators: ['DLL injection detected', 'Privilege token manipulation', 'System process access']
          }
        ],
        recommendations: [
          { priority: 'immediate', action: 'Isolate endpoint', description: 'Quarantine affected workstation immediately' },
          { priority: 'high', action: 'Scan for persistence', description: 'Check for persistence mechanisms and backdoors' }
        ]
      },
      {
        id: 'path_003',
        title: 'Supply Chain → Data Exfiltration',
        severity: 'medium',
        probability: 0.45,
        discoveryTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        status: 'resolved',
        steps: [
          {
            id: 'step_1',
            type: 'initial_access',
            technique: 'T1195.002', // Compromise Software Supply Chain
            description: 'Third-party library with backdoor detected',
            asset: 'app-server-03',
            assetType: 'server',
            impact: 'Code execution capability',
            mitigated: true,
            indicators: ['Suspicious network connections', 'Unauthorized code execution', 'Library integrity violation']
          },
          {
            id: 'step_2',
            type: 'collection',
            technique: 'T1005', // Data from Local System
            description: 'Attempted data collection from application databases',
            asset: 'database-cluster-01',
            assetType: 'database',
            impact: 'Data access attempt',
            mitigated: true,
            indicators: ['Unauthorized database queries', 'Large data transfers', 'Off-hours activity']
          }
        ],
        recommendations: [
          { priority: 'medium', action: 'Update dependencies', description: 'Update all third-party libraries to latest versions' },
          { priority: 'low', action: 'Implement SCA', description: 'Deploy software composition analysis tools' }
        ]
      }
    ];
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-red-400 bg-red-500/20';
      case 'monitoring': return 'text-yellow-400 bg-yellow-500/20';
      case 'resolved': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getTechniqueIcon = (type) => {
    switch (type) {
      case 'initial_access': return <Unlock className="w-4 h-4 text-red-400" />;
      case 'credential_access': return <User className="w-4 h-4 text-orange-400" />;
      case 'lateral_movement': return <GitBranch className="w-4 h-4 text-yellow-400" />;
      case 'privilege_escalation': return <Zap className="w-4 h-4 text-purple-400" />;
      case 'collection': return <Database className="w-4 h-4 text-blue-400" />;
      default: return <Target className="w-4 h-4 text-gray-400" />;
    }
  };

  const getAssetIcon = (assetType) => {
    switch (assetType) {
      case 'server': return <Server className="w-3 h-3" />;
      case 'endpoint': return <User className="w-3 h-3" />;
      case 'database': return <Database className="w-3 h-3" />;
      default: return <Target className="w-3 h-3" />;
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    loadAttackPaths();
  };

  if (isLoading) {
    return (
      <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-yellow-400" />
            Attack Path Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-slate-400">
            <GitBranch className="w-8 h-8 animate-pulse mr-2" />
            Analyzing attack paths...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-yellow-400" />
          Attack Path Analysis
          <Badge className="ml-auto bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            {attackPaths.filter(p => p.status === 'active').length} Active
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefresh}
            className="p-1 h-auto text-slate-400 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedPath ? (
          <div className="space-y-4">
            {/* Path Header */}
            <div className="flex items-center justify-between">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedPath(null)}
                className="text-slate-400 hover:text-white p-0"
              >
                ← Back to paths
              </Button>
              <Badge className={getSeverityColor(selectedPath.severity)}>
                {selectedPath.severity.toUpperCase()}
              </Badge>
            </div>

            {/* Path Details */}
            <div className="space-y-3">
              <h3 className="text-white font-medium">{selectedPath.title}</h3>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400">Probability:</span>
                  <span className="ml-2 text-orange-400 font-medium">
                    {(selectedPath.probability * 100).toFixed(0)}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Discovered:</span>
                  <span className="ml-2 text-white">
                    {format(selectedPath.discoveryTime, 'HH:mm')}
                  </span>
                </div>
              </div>
            </div>

            {/* Attack Steps */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-white">Attack Chain</h4>
              <ScrollArea className="h-48">
                <div className="space-y-3">
                  {selectedPath.steps.map((step, index) => (
                    <div key={step.id} className="relative">
                      {index < selectedPath.steps.length - 1 && (
                        <div className="absolute left-3 top-8 w-0.5 h-12 bg-slate-600" />
                      )}
                      
                      <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                        <div className="flex-shrink-0 mt-0.5">
                          {getTechniqueIcon(step.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-white font-medium">
                              {step.technique}
                            </span>
                            {step.mitigated ? (
                              <Lock className="w-3 h-3 text-green-400" />
                            ) : (
                              <Unlock className="w-3 h-3 text-red-400" />
                            )}
                          </div>
                          
                          <div className="text-xs text-slate-300 mb-2">
                            {step.description}
                          </div>
                          
                          <div className="flex items-center gap-2 mb-2">
                            {getAssetIcon(step.assetType)}
                            <span className="text-xs text-slate-400">{step.asset}</span>
                          </div>
                          
                          <div className="text-xs text-orange-400">
                            Impact: {step.impact}
                          </div>
                          
                          {step.indicators && step.indicators.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {step.indicators.slice(0, 2).map((indicator, idx) => (
                                <div key={idx} className="text-xs text-slate-400">
                                  • {indicator}
                                </div>
                              ))}
                              {step.indicators.length > 2 && (
                                <div className="text-xs text-slate-500">
                                  +{step.indicators.length - 2} more indicators
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Recommendations */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-white">Recommendations</h4>
              <div className="space-y-2">
                {selectedPath.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-slate-700/30 rounded">
                    <Badge className={
                      rec.priority === 'immediate' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      rec.priority === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                      'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    }>
                      {rec.priority}
                    </Badge>
                    <div className="flex-1">
                      <div className="text-xs text-white font-medium">{rec.action}</div>
                      <div className="text-xs text-slate-400">{rec.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-red-400">
                  {attackPaths.filter(p => p.status === 'active').length}
                </div>
                <div className="text-xs text-slate-400">Active</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-yellow-400">
                  {attackPaths.filter(p => p.status === 'monitoring').length}
                </div>
                <div className="text-xs text-slate-400">Monitoring</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-400">
                  {attackPaths.filter(p => p.status === 'resolved').length}
                </div>
                <div className="text-xs text-slate-400">Resolved</div>
              </div>
            </div>

            {/* Attack Paths List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white">Attack Paths</span>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  <Eye className="w-3 h-3 mr-1" />
                  MITRE ATT&CK
                </Badge>
              </div>
              
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {attackPaths.map((path) => (
                    <div
                      key={path.id}
                      className="p-3 bg-slate-700/30 rounded-lg border border-slate-600 cursor-pointer hover:bg-slate-700/50 transition-colors"
                      onClick={() => setSelectedPath(path)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getSeverityColor(path.severity)}>
                          {path.severity.toUpperCase()}
                        </Badge>
                        <Badge className={getStatusColor(path.status)}>
                          {path.status}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-white font-medium mb-1">
                        {path.title}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">
                          {path.steps.length} steps
                        </span>
                        <span className="text-orange-400">
                          {(path.probability * 100).toFixed(0)}% probability
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs mt-1">
                        <span className="text-slate-400">
                          {format(path.discoveryTime, 'MMM dd, HH:mm')}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {attackPaths.length === 0 && (
              <div className="text-center text-slate-400 py-8">
                <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <div className="text-sm">No attack paths detected</div>
                <div className="text-xs">Your environment is secure</div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
