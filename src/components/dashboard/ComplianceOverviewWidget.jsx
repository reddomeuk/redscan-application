import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  FileText,
  Settings,
  RefreshCw,
  TrendingUp,
  Calendar,
  Users,
  Eye,
  Zap,
  BarChart3,
  Clock,
  Database,
  Target
} from 'lucide-react';
import { complianceAutomationEngine } from '../../services/ComplianceAutomationEngine';
import { format } from 'date-fns';

export default function ComplianceOverviewWidget({ className }) {
  const [overview, setOverview] = useState(null);
  const [workflows, setWorkflows] = useState([]);
  const [controls, setControls] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeComplianceEngine();
    
    // Set up event listeners
    const handleEngineInitialized = () => {
      updateOverview();
    };

    const handleMetricsUpdated = (metrics) => {
      updateOverview();
    };

    const handleWorkflowCompleted = (result) => {
      updateWorkflows();
    };

    const handleControlTested = (result) => {
      updateControls();
    };

    complianceAutomationEngine.on('engine_initialized', handleEngineInitialized);
    complianceAutomationEngine.on('metrics_updated', handleMetricsUpdated);
    complianceAutomationEngine.on('workflow_completed', handleWorkflowCompleted);
    complianceAutomationEngine.on('control_tested', handleControlTested);

    // Refresh data periodically
    const interval = setInterval(updateOverview, 45000);

    return () => {
      complianceAutomationEngine.off('engine_initialized', handleEngineInitialized);
      complianceAutomationEngine.off('metrics_updated', handleMetricsUpdated);
      complianceAutomationEngine.off('workflow_completed', handleWorkflowCompleted);
      complianceAutomationEngine.off('control_tested', handleControlTested);
      clearInterval(interval);
    };
  }, []);

  const initializeComplianceEngine = async () => {
    try {
      if (!complianceAutomationEngine.isRunning) {
        await complianceAutomationEngine.initialize();
      }
      
      updateOverview();
      updateWorkflows();
      updateControls();
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize compliance engine:', error);
      setIsLoading(false);
    }
  };

  const updateOverview = () => {
    const complianceOverview = complianceAutomationEngine.getComplianceOverview();
    setOverview(complianceOverview);
  };

  const updateWorkflows = () => {
    const workflowStatus = complianceAutomationEngine.getWorkflowStatus();
    setWorkflows(workflowStatus);
  };

  const updateControls = () => {
    const controlStatus = complianceAutomationEngine.getControlStatus();
    setControls(controlStatus);
  };

  const handleRefresh = () => {
    updateOverview();
    updateWorkflows();
    updateControls();
  };

  const getComplianceScoreColor = (score) => {
    if (score >= 95) return 'text-green-400';
    if (score >= 85) return 'text-blue-400';
    if (score >= 75) return 'text-yellow-400';
    if (score >= 65) return 'text-orange-400';
    return 'text-red-400';
  };

  const getFrameworkIcon = (frameworkId) => {
    const icons = {
      'soc2': <Shield className="w-4 h-4 text-blue-400" />,
      'iso27001': <Target className="w-4 h-4 text-green-400" />,
      'nist': <Settings className="w-4 h-4 text-purple-400" />,
      'hipaa': <FileText className="w-4 h-4 text-pink-400" />,
      'gdpr': <Users className="w-4 h-4 text-indigo-400" />,
      'pcidss': <Database className="w-4 h-4 text-orange-400" />
    };
    return icons[frameworkId] || <Shield className="w-4 h-4 text-gray-400" />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'compliant': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'active': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'failed': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  if (isLoading) {
    return (
      <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Compliance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-slate-400">
            <Settings className="w-8 h-8 animate-spin mr-2" />
            Initializing compliance engine...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-400" />
          Compliance Overview
          <Badge className="ml-auto bg-blue-500/20 text-blue-400 border-blue-500/30">
            <Zap className="w-3 h-3 mr-1" />
            Automated
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-slate-700/50">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="frameworks" className="text-xs">Frameworks</TabsTrigger>
            <TabsTrigger value="automation" className="text-xs">Automation</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className={`text-2xl font-bold ${getComplianceScoreColor(overview?.metrics?.overallComplianceScore || 0)}`}>
                  {overview?.metrics?.overallComplianceScore || 0}%
                </div>
                <div className="text-xs text-slate-400">Overall Compliance</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-400">
                  {overview?.metrics?.automationCoverage || 0}%
                </div>
                <div className="text-xs text-slate-400">Automation Coverage</div>
              </div>
            </div>

            {/* Compliance Status */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white">Control Effectiveness</span>
                <span className="text-sm font-medium text-green-400">
                  {overview?.metrics?.controlEffectiveness || 0}%
                </span>
              </div>
              <Progress 
                value={overview?.metrics?.controlEffectiveness || 0} 
                className="h-2"
              />

              <div className="flex justify-between items-center">
                <span className="text-sm text-white">Evidence Count</span>
                <span className="text-sm font-medium text-blue-400">
                  {overview?.metrics?.evidenceCount || 0}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-white">Open Gaps</span>
                <span className="text-sm font-medium text-orange-400">
                  {overview?.gapAnalysis?.totalGaps || 0}
                </span>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="pt-2 border-t border-slate-600">
              <div className="space-y-2">
                <span className="text-sm text-white">Recent Activity</span>
                <div className="space-y-1 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span>SOC 2 controls tested automatically</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-3 h-3 text-blue-400" />
                    <span>Evidence collection workflow completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3 text-yellow-400" />
                    <span>Gap analysis identified 3 new items</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3 h-3 text-purple-400" />
                    <span>Compliance score improved by 2%</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="frameworks" className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white">Compliance Frameworks</span>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <Target className="w-3 h-3 mr-1" />
                {overview?.frameworks?.length || 0} Active
              </Badge>
            </div>
            
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {overview?.frameworks?.map((framework) => (
                  <div key={framework.id} className="p-3 bg-slate-700/30 rounded-lg border border-slate-600">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getFrameworkIcon(framework.id)}
                        <span className="text-sm text-white font-medium">{framework.name}</span>
                      </div>
                      <Badge className={getStatusColor(framework.status)}>
                        {framework.status?.toUpperCase() || 'UNKNOWN'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs mb-2">
                      <div>
                        <span className="text-slate-400">Score:</span>
                        <span className={`ml-2 font-medium ${getComplianceScoreColor(framework.score)}`}>
                          {framework.score}%
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Automation:</span>
                        <span className="ml-2 text-blue-400 font-medium">{framework.automationLevel}%</span>
                      </div>
                    </div>

                    {/* Compliance Score Visualization */}
                    <div className="mt-2">
                      <Progress 
                        value={framework.score} 
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {(!overview?.frameworks || overview.frameworks.length === 0) && (
              <div className="text-center text-slate-400 py-8">
                <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <div className="text-sm">No frameworks configured</div>
                <div className="text-xs">Add compliance frameworks to get started</div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="automation" className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white">Automated Workflows & Controls</span>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                <Settings className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>
            
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {/* Workflows Section */}
                <div className="space-y-2">
                  <span className="text-xs text-slate-300 font-medium">Workflows</span>
                  {workflows.map((workflow) => (
                    <div key={workflow.id} className="p-2 bg-slate-700/20 rounded border border-slate-700">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Zap className="w-3 h-3 text-yellow-400" />
                          <span className="text-xs text-white">{workflow.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {workflow.successRate.toFixed(0)}% success
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">
                          Executions: {workflow.executionCount}
                        </span>
                        <span className="text-slate-400">
                          {workflow.lastExecution && format(new Date(workflow.lastExecution), 'HH:mm')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Controls Section */}
                <div className="space-y-2 pt-2 border-t border-slate-600">
                  <span className="text-xs text-slate-300 font-medium">Automated Controls</span>
                  {controls.slice(0, 6).map((control) => (
                    <div key={control.id} className="p-2 bg-slate-700/20 rounded border border-slate-700">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Settings className="w-3 h-3 text-blue-400" />
                          <span className="text-xs text-white">{control.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {control.successRate.toFixed(0)}% pass
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">
                          Effectiveness: {control.effectivenessScore.toFixed(0)}%
                        </span>
                        <span className="text-slate-400">
                          {control.lastExecution && format(new Date(control.lastExecution), 'HH:mm')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>

            {workflows.length === 0 && controls.length === 0 && (
              <div className="text-center text-slate-400 py-8">
                <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <div className="text-sm">No automated workflows active</div>
                <div className="text-xs">Configure automation to get started</div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
