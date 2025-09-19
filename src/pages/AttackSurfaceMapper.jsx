import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AttackSurfaceAnalysis, AttackPath, User } from '@/api/entities';
import { Target, Play, Bell, TrendingUp, Shield, AlertTriangle, Settings, FileText } from 'lucide-react';
import { toast } from 'sonner';
import ThreatGraph from '../components/attack-surface/ThreatGraph';
import AttackPathList from '../components/attack-surface/AttackPathList';
import AttackSurfaceMonitor from '../components/attack-surface/AttackSurfaceMonitor';
import AttackSurfaceAlerts from '../components/attack-surface/AttackSurfaceAlerts';
import ActionButton from '../components/ui/ActionButton';

const generateReportAction = async () => {
  console.log("Generating attack surface report...");
  await new Promise(resolve => setTimeout(resolve, 4000));
  return { downloadUrl: '/reports/attack-surface-report.pdf' };
};

const createTicketAction = async (path) => {
  console.log(`Creating ticket for attack path: ${path.id}`);
  await new Promise(resolve => setTimeout(resolve, 1500));
  return { ticketId: 'SEC-' + Math.random().toString(36).substr(2, 6).toUpperCase() };
};

export default function AttackSurfaceMapperPage() {
  const [selectedPath, setSelectedPath] = useState(null);
  const [attackPaths, setAttackPaths] = useState([]);
  const [lastAnalysis, setLastAnalysis] = useState(null);
  const [continuousEnabled, setContinuousEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadAttackSurface();
  }, []);

  const loadAttackSurface = async () => {
    setLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      // In a real app, these would load actual data
      // For now, we'll use mock data that represents the expected structure
      
      // Mock attack paths
      const mockPaths = [
        {
          id: 'path-1',
          start_node_id: 'internet',
          end_node_id: 'db-server',
          path_type: 'external_entry',
          risk_score: 89,
          persistence_score: 3,
          hops: [
            { node_id: 'internet', node_name: 'Internet', exploitation_method: 'Public Access' },
            { node_id: 'web-app', node_name: 'Web Application', exploitation_method: 'CVE-2024-1234' },
            { node_id: 'db-server', node_name: 'Database Server', exploitation_method: 'Privilege Escalation' }
          ],
          status: 'active',
          remediation_plan: {
            priority: 'critical',
            steps: [
              { action: 'Patch CVE-2024-1234 on web server', responsible_role: 'DevSecOps' },
              { action: 'Implement WAF rules', responsible_role: 'Security' }
            ]
          }
        },
        {
          id: 'path-2',
          start_node_id: 'user-john',
          end_node_id: 'sharepoint',
          path_type: 'lateral_movement',
          risk_score: 72,
          persistence_score: 5,
          hops: [
            { node_id: 'user-john', node_name: 'John Smith (Admin)', exploitation_method: 'Phishing' },
            { node_id: 'm365', node_name: 'M365 Tenant', exploitation_method: 'OAuth Token' },
            { node_id: 'sharepoint', node_name: 'SharePoint', exploitation_method: 'Privileged Access' }
          ],
          status: 'active'
        }
      ];

      // Mock analysis data
      const mockAnalysis = {
        run_id: 'analysis-' + Date.now(),
        completed_at: new Date().toISOString(),
        total_paths_found: 12,
        new_paths: 2,
        resolved_paths: 1,
        persisting_paths: 9,
        high_risk_paths: 4,
        analysis_summary: {
          entry_points: 5,
          critical_assets_at_risk: 8,
          avg_path_length: 2.3,
          most_common_vulnerability: 'Missing MFA'
        },
        delta_from_previous: {
          risk_trend: 'increasing'
        }
      };

      setAttackPaths(mockPaths);
      setLastAnalysis(mockAnalysis);

    } catch (error) {
      console.error('Failed to load attack surface data:', error);
      toast.error('Failed to load attack surface data');
    }
    setLoading(false);
  };

  const handlePathSelect = (path) => {
    setSelectedPath(path);
  };

  const handleNodeSelect = (node) => {
    console.log('Node selected:', node);
    // Could filter paths by node or show node details
  };

  const handleCreateTicket = async (path) => {
    try {
      const result = await createTicketAction(path);
      toast.success(`Ticket ${result.ticketId} created for attack path remediation`);
    } catch (error) {
      toast.error('Failed to create ticket');
    }
  };

  const handleToggleContinuous = (enabled) => {
    setContinuousEnabled(enabled);
    toast.success(`Continuous monitoring ${enabled ? 'enabled' : 'disabled'}`);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-white">Attack Surface Mapper</h1>
          <p className="text-slate-400">Loading threat analysis...</p>
        </header>
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-400">Loading attack surface data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Attack Surface Mapper</h1>
          <p className="text-slate-400">AI-driven threat path analysis and continuous monitoring.</p>
        </div>
        <div className="flex gap-2">
          <ActionButton
            actionFn={generateReportAction}
            isLongRunning={true}
            taskName="Generating Attack Surface Report"
            successToast="Report generated successfully!"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </ActionButton>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Active Paths</p>
              <p className="text-2xl font-bold text-white">{attackPaths.length}</p>
            </div>
            <Target className="w-8 h-8 text-red-400" />
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">High Risk</p>
              <p className="text-2xl font-bold text-red-400">
                {attackPaths.filter(p => p.risk_score >= 80).length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">New (24h)</p>
              <p className="text-2xl font-bold text-orange-400">{lastAnalysis?.new_paths || 0}</p>
            </div>
            <Bell className="w-8 h-8 text-orange-400" />
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Resolved (7d)</p>
              <p className="text-2xl font-bold text-green-400">{lastAnalysis?.resolved_paths || 0}</p>
            </div>
            <Shield className="w-8 h-8 text-green-400" />
          </CardContent>
        </Card>
      </div>

      {/* New Path Alert Banner */}
      {lastAnalysis?.new_paths > 0 && (
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <div>
                <h3 className="text-white font-medium">New Attack Path Detected</h3>
                <p className="text-red-300 text-sm">
                  {lastAnalysis.new_paths} new attack path(s) discovered in the last analysis. 
                  Immediate review recommended.
                </p>
              </div>
              <Button className="bg-red-600 hover:bg-red-700 ml-auto">
                Review Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="visualization" className="w-full">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="visualization">Threat Graph</TabsTrigger>
          <TabsTrigger value="paths">Attack Paths</TabsTrigger>
          <TabsTrigger value="monitor">Monitoring</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="visualization" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ThreatGraph 
              paths={attackPaths}
              selectedPath={selectedPath}
              onPathSelect={handlePathSelect}
              onNodeSelect={handleNodeSelect}
            />
            <AttackPathList 
              paths={attackPaths}
              selectedPath={selectedPath}
              onPathSelect={handlePathSelect}
              onCreateTicket={handleCreateTicket}
            />
          </div>
        </TabsContent>

        <TabsContent value="paths" className="mt-6">
          <AttackPathList 
            paths={attackPaths}
            selectedPath={selectedPath}
            onPathSelect={handlePathSelect}
            onCreateTicket={handleCreateTicket}
          />
        </TabsContent>

        <TabsContent value="monitor" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AttackSurfaceMonitor 
              lastAnalysis={lastAnalysis}
              continuousEnabled={continuousEnabled}
              onToggleContinuous={handleToggleContinuous}
              onRunAnalysis={loadAttackSurface}
            />
            <div className="space-y-6">
              {/* Trend Chart Placeholder */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    Attack Surface Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center text-slate-500">
                    <p>Trend chart visualization would be implemented here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="mt-6">
          <AttackSurfaceAlerts 
            onCreateTicket={handleCreateTicket}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}