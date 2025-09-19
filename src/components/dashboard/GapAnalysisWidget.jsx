import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle,
  RefreshCw,
  Target,
  Clock,
  Users,
  Wrench,
  BarChart3,
  Calendar,
  ArrowRight,
  Flag,
  Zap
} from 'lucide-react';
import { complianceAutomationEngine } from '../../services/ComplianceAutomationEngine';
import { format, addDays } from 'date-fns';

export default function GapAnalysisWidget({ className }) {
  const [gapAnalysis, setGapAnalysis] = useState({});
  const [remediationPlan, setRemediationPlan] = useState([]);
  const [activeTab, setActiveTab] = useState('gaps');
  const [isLoading, setIsLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState('all');

  useEffect(() => {
    initializeGapAnalysis();
    
    // Set up event listeners
    const handleGapAnalysisCompleted = (analysis) => {
      setGapAnalysis(analysis);
      generateRemediationPlan(analysis);
    };

    const handleWorkflowCompleted = (result) => {
      if (result.workflowId === 'gap_analysis') {
        updateGapAnalysis();
      }
    };

    complianceAutomationEngine.on('gap_analysis_completed', handleGapAnalysisCompleted);
    complianceAutomationEngine.on('workflow_completed', handleWorkflowCompleted);

    // Refresh data periodically
    const interval = setInterval(updateGapAnalysis, 90000);

    return () => {
      complianceAutomationEngine.off('gap_analysis_completed', handleGapAnalysisCompleted);
      complianceAutomationEngine.off('workflow_completed', handleWorkflowCompleted);
      clearInterval(interval);
    };
  }, []);

  const initializeGapAnalysis = async () => {
    try {
      if (!complianceAutomationEngine.isRunning) {
        await complianceAutomationEngine.initialize();
      }
      
      updateGapAnalysis();
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize gap analysis:', error);
      setIsLoading(false);
    }
  };

  const updateGapAnalysis = () => {
    const overview = complianceAutomationEngine.getComplianceOverview();
    if (overview.gapAnalysis) {
      setGapAnalysis(overview.gapAnalysis);
      generateRemediationPlan(overview.gapAnalysis);
    }
  };

  const generateRemediationPlan = (analysis) => {
    const allGaps = Object.values(analysis.gaps || {}).flat();
    
    // Generate remediation tasks based on gaps
    const remediationTasks = allGaps.map((gap, index) => ({
      id: `remediation_${index}`,
      gapId: gap.controlId,
      title: `Remediate ${gap.description}`,
      description: getRemediationDescription(gap.gapType, gap.description),
      priority: gap.priority,
      estimatedEffort: gap.estimatedEffort,
      assignee: getRandomAssignee(),
      status: getRandomStatus(),
      dueDate: addDays(new Date(), getRandomDueDays(gap.priority)),
      dependencies: [],
      progress: getRandomProgress(getRandomStatus())
    }));

    setRemediationPlan(remediationTasks);
  };

  const getRemediationDescription = (gapType, controlDescription) => {
    const descriptions = {
      'documentation': `Update and review documentation for: ${controlDescription}`,
      'implementation': `Implement missing control measures for: ${controlDescription}`,
      'testing': `Establish testing procedures and validation for: ${controlDescription}`,
      'monitoring': `Set up continuous monitoring and alerting for: ${controlDescription}`,
      'training': `Provide training and awareness for: ${controlDescription}`
    };
    
    return descriptions[gapType] || `Address compliance gap in: ${controlDescription}`;
  };

  const getRandomAssignee = () => {
    const assignees = ['Security Team', 'Compliance Officer', 'IT Operations', 'DevOps Team', 'Risk Management'];
    return assignees[Math.floor(Math.random() * assignees.length)];
  };

  const getRandomStatus = () => {
    const statuses = ['pending', 'in_progress', 'review', 'completed'];
    const weights = [0.4, 0.35, 0.15, 0.1]; // Weighted random
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < statuses.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return statuses[i];
      }
    }
    
    return 'pending';
  };

  const getRandomProgress = (status) => {
    switch (status) {
      case 'completed': return 100;
      case 'review': return 80 + Math.random() * 20;
      case 'in_progress': return 20 + Math.random() * 60;
      case 'pending': return 0;
      default: return 0;
    }
  };

  const getRandomDueDays = (priority) => {
    switch (priority) {
      case 'critical': return 7 + Math.random() * 7; // 7-14 days
      case 'high': return 14 + Math.random() * 14; // 14-28 days
      case 'medium': return 30 + Math.random() * 30; // 30-60 days
      case 'low': return 60 + Math.random() * 30; // 60-90 days
      default: return 30;
    }
  };

  const handleRefresh = () => {
    updateGapAnalysis();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'review': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      case 'in_progress': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical': return <Flag className="w-4 h-4 text-red-400" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'low': return <Target className="w-4 h-4 text-blue-400" />;
      default: return <Target className="w-4 h-4 text-gray-400" />;
    }
  };

  const filteredGaps = Object.values(gapAnalysis.gaps || {}).flat()
    .filter(gap => filterPriority === 'all' || gap.priority === filterPriority);

  const filteredRemediation = remediationPlan
    .filter(task => filterPriority === 'all' || task.priority === filterPriority);

  if (isLoading) {
    return (
      <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            Gap Analysis & Remediation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-slate-400">
            <BarChart3 className="w-8 h-8 animate-pulse mr-2" />
            Analyzing compliance gaps...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-400" />
          Gap Analysis & Remediation
          <Badge className="ml-auto bg-orange-500/20 text-orange-400 border-orange-500/30">
            <Target className="w-3 h-3 mr-1" />
            {gapAnalysis.totalGaps || 0} Gaps
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
            <TabsTrigger value="gaps" className="text-xs">Identified Gaps</TabsTrigger>
            <TabsTrigger value="remediation" className="text-xs">Remediation Plan</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="gaps" className="space-y-4 mt-4">
            {/* Priority Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Filter by priority:</span>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-2 py-1 bg-slate-700/50 border border-slate-600 rounded text-white text-xs focus:outline-none focus:border-slate-500"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Gap Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-2xl font-bold text-orange-400">
                  {gapAnalysis.totalGaps || 0}
                </div>
                <div className="text-xs text-slate-400">Total Gaps</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-2xl font-bold text-red-400">
                  {gapAnalysis.highPriorityGaps || 0}
                </div>
                <div className="text-xs text-slate-400">High Priority</div>
              </div>
            </div>

            {/* Gaps List */}
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {filteredGaps.map((gap, index) => (
                  <div key={index} className="p-3 bg-slate-700/30 rounded-lg border border-slate-600">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(gap.priority)}
                        <span className="text-sm text-white font-medium">{gap.controlId}</span>
                      </div>
                      <Badge className={getPriorityColor(gap.priority)}>
                        {gap.priority?.toUpperCase() || 'UNKNOWN'}
                      </Badge>
                    </div>

                    <div className="text-xs text-slate-300 mb-2">
                      {gap.description}
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-4">
                        <span className="text-slate-400">
                          Type: <span className="text-white capitalize">{gap.gapType?.replace('_', ' ')}</span>
                        </span>
                        <span className="text-slate-400">
                          Effort: <span className="text-white">{gap.estimatedEffort}h</span>
                        </span>
                      </div>
                      <span className="text-slate-400">
                        {format(new Date(gap.identifiedAt), 'MMM d')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {filteredGaps.length === 0 && (
              <div className="text-center text-slate-400 py-8">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400 opacity-50" />
                <div className="text-sm">
                  {filterPriority === 'all' ? 'No compliance gaps identified' : `No ${filterPriority} priority gaps`}
                </div>
                <div className="text-xs">
                  {filterPriority === 'all' ? 'Your compliance posture is strong' : 'Try selecting a different priority level'}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="remediation" className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white">Remediation Tasks</span>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                <Wrench className="w-3 h-3 mr-1" />
                {remediationPlan.length} Tasks
              </Badge>
            </div>
            
            <ScrollArea className="h-56">
              <div className="space-y-2">
                {filteredRemediation.map((task) => (
                  <div key={task.id} className="p-3 bg-slate-700/30 rounded-lg border border-slate-600">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-white font-medium truncate">{task.title}</span>
                      </div>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>

                    <div className="text-xs text-slate-300 mb-2 line-clamp-2">
                      {task.description}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          {getPriorityIcon(task.priority)}
                          <span className="text-slate-400">Priority: {task.priority}</span>
                        </div>
                        <span className="text-slate-400">
                          Due: {format(task.dueDate, 'MMM d')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">
                          Assignee: <span className="text-white">{task.assignee}</span>
                        </span>
                        <span className="text-slate-400">
                          {task.estimatedEffort}h effort
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Progress</span>
                          <span className="text-white">{Math.round(task.progress)}%</span>
                        </div>
                        <Progress value={task.progress} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {filteredRemediation.length === 0 && (
              <div className="text-center text-slate-400 py-8">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400 opacity-50" />
                <div className="text-sm">No remediation tasks</div>
                <div className="text-xs">All identified gaps have been addressed</div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4 mt-4">
            {/* Remediation Progress Overview */}
            <div className="space-y-3">
              <span className="text-sm text-white">Remediation Progress</span>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="text-xl font-bold text-green-400">
                    {remediationPlan.filter(t => t.status === 'completed').length}
                  </div>
                  <div className="text-xs text-slate-400">Completed</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="text-xl font-bold text-blue-400">
                    {remediationPlan.filter(t => t.status === 'in_progress').length}
                  </div>
                  <div className="text-xs text-slate-400">In Progress</div>
                </div>
              </div>

              {/* Priority Distribution */}
              <div className="space-y-2">
                <span className="text-xs text-slate-300">Gap Priority Distribution</span>
                {['critical', 'high', 'medium', 'low'].map(priority => {
                  const count = Object.values(gapAnalysis.gaps || {}).flat()
                    .filter(gap => gap.priority === priority).length;
                  const total = Object.values(gapAnalysis.gaps || {}).flat().length;
                  const percentage = total > 0 ? (count / total) * 100 : 0;
                  
                  return (
                    <div key={priority} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(priority)}
                        <span className="text-xs text-slate-400 capitalize">{priority}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              priority === 'critical' ? 'bg-red-400' :
                              priority === 'high' ? 'bg-orange-400' :
                              priority === 'medium' ? 'bg-yellow-400' : 'bg-blue-400'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-white w-8">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Metrics */}
              <div className="pt-2 border-t border-slate-600">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Average Remediation Time:</span>
                    <span className="text-white">
                      {Math.round(remediationPlan.reduce((sum, task) => sum + task.estimatedEffort, 0) / Math.max(remediationPlan.length, 1))}h
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Effort Required:</span>
                    <span className="text-white">
                      {remediationPlan.reduce((sum, task) => sum + task.estimatedEffort, 0)}h
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Last Analysis:</span>
                    <span className="text-white">
                      {gapAnalysis.lastAnalysis ? format(new Date(gapAnalysis.lastAnalysis), 'MMM d, HH:mm') : 'Never'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
