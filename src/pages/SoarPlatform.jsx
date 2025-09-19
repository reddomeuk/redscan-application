import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Play, 
  Pause, 
  Square, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Activity,
  GitBranch,
  Zap,
  Shield,
  Bot,
  FileText,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import soarOrchestrationEngine from '../services/SoarOrchestrationEngine';

const SoarPlatform = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [workflows, setWorkflows] = useState([]);
  const [playbooks, setPlaybooks] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [automationStats, setAutomationStats] = useState({});
  const [activeWorkflows, setActiveWorkflows] = useState([]);

  useEffect(() => {
    // Initialize SOAR platform data
    loadSoarData();
    
    // Set up real-time updates
    const handleWorkflowUpdate = (data) => {
      setActiveWorkflows(prev => 
        prev.map(wf => wf.id === data.workflowId ? { ...wf, ...data } : wf)
      );
    };

    const handleIncidentUpdate = (data) => {
      setIncidents(prev => 
        prev.map(inc => inc.id === data.incidentId ? { ...inc, ...data } : inc)
      );
    };

    soarOrchestrationEngine.on('workflowExecuted', handleWorkflowUpdate);
    soarOrchestrationEngine.on('incidentUpdated', handleIncidentUpdate);

    return () => {
      soarOrchestrationEngine.off('workflowExecuted', handleWorkflowUpdate);
      soarOrchestrationEngine.off('incidentUpdated', handleIncidentUpdate);
    };
  }, []);

  const loadSoarData = async () => {
    // Load workflows
    const workflowData = soarOrchestrationEngine.getWorkflows();
    setWorkflows(workflowData);

    // Load playbooks
    const playbookData = soarOrchestrationEngine.getPlaybooks();
    setPlaybooks(playbookData);

    // Load incidents
    const incidentData = soarOrchestrationEngine.getIncidents();
    setIncidents(incidentData);

    // Load automation statistics
    const stats = soarOrchestrationEngine.getAutomationStatistics();
    setAutomationStats(stats);

    // Load active workflows
    const activeWf = soarOrchestrationEngine.getActiveWorkflows();
    setActiveWorkflows(activeWf);
  };

  const executeWorkflow = async (workflowId, incidentId) => {
    await soarOrchestrationEngine.executeWorkflow(workflowId, incidentId);
    loadSoarData(); // Refresh data
  };

  const pauseWorkflow = async (executionId) => {
    await soarOrchestrationEngine.pauseWorkflow(executionId);
    loadSoarData();
  };

  const stopWorkflow = async (executionId) => {
    await soarOrchestrationEngine.stopWorkflow(executionId);
    loadSoarData();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            SOAR Platform
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Security Orchestration, Automation & Response
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Workflows
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activeWorkflows.length}
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Playbooks
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {playbooks.length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Open Incidents
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {incidents.filter(i => i.status === 'open').length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Automation Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {automationStats.automationRate || 0}%
                </p>
              </div>
              <Bot className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="playbooks">Playbooks</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Workflows */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Active Workflows
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeWorkflows.slice(0, 5).map((workflow) => (
                    <div key={workflow.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(workflow.status)}`} />
                        <div>
                          <p className="font-medium">{workflow.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Step {workflow.currentStep || 1} of {workflow.totalSteps || 1}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={workflow.progress || 0} className="w-20" />
                        <span className="text-sm">{workflow.progress || 0}%</span>
                      </div>
                    </div>
                  ))}
                  {activeWorkflows.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No active workflows</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Incidents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Recent Incidents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {incidents.slice(0, 5).map((incident) => (
                    <div key={incident.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{incident.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {incident.type} • {new Date(incident.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getSeverityColor(incident.severity)}>
                          {incident.severity}
                        </Badge>
                        <Badge variant="outline">
                          {incident.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {incidents.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No recent incidents</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Automation Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Automation Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {automationStats.successfulExecutions || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Successful Executions
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {automationStats.averageExecutionTime || 0}s
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Avg Execution Time
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {automationStats.timesSaved || 0}h
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Time Saved
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Workflow Management</h2>
            <Button>
              <GitBranch className="w-4 h-4 mr-2" />
              Create Workflow
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {workflows.map((workflow) => (
              <Card key={workflow.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{workflow.name}</CardTitle>
                    <Badge variant={workflow.enabled ? 'default' : 'secondary'}>
                      {workflow.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {workflow.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Trigger:</span>
                      <span className="font-medium">{workflow.trigger.type}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Steps:</span>
                      <span className="font-medium">{workflow.steps.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Executions:</span>
                      <span className="font-medium">{workflow.executionCount || 0}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => executeWorkflow(workflow.id, null)}
                      disabled={!workflow.enabled}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Execute
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="w-4 h-4 mr-1" />
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Playbooks Tab */}
        <TabsContent value="playbooks" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Security Playbooks</h2>
            <Button>
              <FileText className="w-4 h-4 mr-2" />
              Create Playbook
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {playbooks.map((playbook) => (
              <Card key={playbook.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{playbook.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {playbook.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Category:</span>
                      <Badge variant="outline">{playbook.category}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Severity:</span>
                      <Badge variant={getSeverityColor(playbook.severity)}>
                        {playbook.severity}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Actions:</span>
                      <span className="font-medium">{playbook.actions.length}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm">
                      <Zap className="w-4 h-4 mr-1" />
                      Execute
                    </Button>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Incidents Tab */}
        <TabsContent value="incidents" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Incident Management</h2>
            <Button>
              <AlertTriangle className="w-4 h-4 mr-2" />
              Create Incident
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Incident
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Severity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {incidents.map((incident) => (
                      <tr key={incident.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {incident.title}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              ID: {incident.id}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline">{incident.type}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getSeverityColor(incident.severity)}>
                            {incident.severity}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={incident.status === 'open' ? 'destructive' : 'default'}>
                            {incident.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {new Date(incident.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                            <Button size="sm">
                              Respond
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Success Rate</span>
                    <span className="font-medium">{automationStats.successRate || 0}%</span>
                  </div>
                  <Progress value={automationStats.successRate || 0} />
                  
                  <div className="flex justify-between items-center">
                    <span>Automation Coverage</span>
                    <span className="font-medium">{automationStats.automationRate || 0}%</span>
                  </div>
                  <Progress value={automationStats.automationRate || 0} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Times</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Average Response Time</span>
                    <span className="font-medium">{automationStats.averageResponseTime || 0}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fastest Response</span>
                    <span className="font-medium">{automationStats.fastestResponse || 0}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SLA Compliance</span>
                    <span className="font-medium">{automationStats.slaCompliance || 0}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SoarPlatform;
