import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  RefreshCw,
  Download,
  Settings,
  Users,
  Brain,
  Zap,
  ExternalLink,
  Play,
  Pause,
  FileText
} from 'lucide-react';
import { Device, RemediationTask, RemediationEvent, User, ItsmConnection } from '@/api/entities';
import RemediationControlTable from '../components/endpoints/RemediationControlTable';
import RemediationEventFeed from '../components/endpoints/RemediationEventFeed';
import BulkRemediationModal from '../components/endpoints/BulkRemediationModal';
import ExceptionManager from '../components/endpoints/ExceptionManager';
import AiRemediationInsights from '../components/endpoints/AiRemediationInsights';
import { toast } from 'sonner';

const MetricCard = ({ title, value, subtitle, icon: Icon, trend, onClick }) => (
  <Card 
    className={`bg-slate-800/50 border-slate-700 cursor-pointer hover:bg-slate-700/50 transition-colors`}
    onClick={onClick}
  >
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-white">{value}</p>
            {trend && (
              <p className={`text-xs ${trend.positive ? 'text-green-400' : 'text-red-400'}`}>
                {trend.positive ? '↗' : '↘'} {trend.value}
              </p>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <Icon className="w-8 h-8 text-blue-400" />
      </div>
    </CardContent>
  </Card>
);

export default function RemediationCenterPage() {
  const [devices, setDevices] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [deviceData, taskData, eventData, userData] = await Promise.all([
        Device.list('-last_seen', 200),
        RemediationTask.list('-started_at', 100),
        RemediationEvent.list('-created_date', 50),
        User.me()
      ]);
      
      setDevices(deviceData);
      setTasks(taskData);
      setEvents(eventData);
      setUser(userData);
    } catch (error) {
      console.error('Error loading remediation data:', error);
      toast.error('Failed to load remediation data');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    // Set up polling for real-time updates
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.success('Data refreshed');
  };

  // Calculate metrics
  const metrics = useMemo(() => {
    const nonCompliantDevices = devices.filter(d => d.compliance_percent < 90);
    const activeTasks = tasks.filter(t => ['pending', 'in_progress'].includes(t.status));
    const completedTasks = tasks.filter(t => ['resolved', 'failed'].includes(t.status));
    const successfulTasks = tasks.filter(t => t.status === 'resolved');
    const escalatedTasks = tasks.filter(t => t.status === 'escalated');
    
    const successRate = completedTasks.length > 0 
      ? Math.round((successfulTasks.length / completedTasks.length) * 100)
      : 0;

    return {
      nonCompliantDevices: nonCompliantDevices.length,
      activeTasks: activeTasks.length,
      successRate,
      escalations: escalatedTasks.length
    };
  }, [devices, tasks]);

  const getUserRole = () => {
    if (user?.email === 'bazam@reddome.org') return 'super_admin';
    return user?.role || 'viewer';
  };

  const canManage = () => ['admin', 'analyst', 'super_admin'].includes(getUserRole());
  const canBulkAction = () => ['admin', 'super_admin'].includes(getUserRole());

  const handleDeviceSelection = (deviceId, selected) => {
    setSelectedDevices(prev => 
      selected 
        ? [...prev, deviceId]
        : prev.filter(id => id !== deviceId)
    );
  };

  const handleSelectAll = () => {
    const nonCompliantDevices = devices.filter(d => d.compliance_percent < 90);
    setSelectedDevices(
      selectedDevices.length === nonCompliantDevices.length 
        ? [] 
        : nonCompliantDevices.map(d => d.id)
    );
  };

  if (loading) {
    return (
      <div className="p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
            <p className="text-white">Loading Remediation Control Center...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-400" />
              Remediation Control Center
            </h1>
            <p className="text-slate-400 mt-1">Centralized endpoint remediation oversight and control</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleRefresh} 
              disabled={refreshing}
              variant="outline" 
              className="border-slate-600"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {canBulkAction() && selectedDevices.length > 0 && (
              <Button 
                onClick={() => setShowBulkModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Zap className="w-4 h-4 mr-2" />
                Bulk Actions ({selectedDevices.length})
              </Button>
            )}
          </div>
        </header>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Non-Compliant Devices"
            value={metrics.nonCompliantDevices}
            subtitle="Requires attention"
            icon={AlertTriangle}
            trend={{ positive: false, value: '12%' }}
          />
          <MetricCard
            title="Active Remediations"
            value={metrics.activeTasks}
            subtitle="In progress"
            icon={Activity}
            trend={{ positive: true, value: '8%' }}
          />
          <MetricCard
            title="Auto-Fix Success Rate"
            value={`${metrics.successRate}%`}
            subtitle="Last 30 days"
            icon={CheckCircle2}
            trend={{ positive: true, value: '5%' }}
          />
          <MetricCard
            title="ITSM Escalations"
            value={metrics.escalations}
            subtitle="Open tickets"
            icon={ExternalLink}
            trend={{ positive: false, value: '3%' }}
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="devices" className="w-full">
          <TabsList className="bg-slate-800/50 border border-slate-700 mb-6">
            <TabsTrigger value="devices">
              <Users className="w-4 h-4 mr-2" />
              Device Control ({devices.length})
            </TabsTrigger>
            <TabsTrigger value="monitoring">
              <Activity className="w-4 h-4 mr-2" />
              Real-Time Monitoring
            </TabsTrigger>
            <TabsTrigger value="exceptions">
              <Settings className="w-4 h-4 mr-2" />
              Exception Management
            </TabsTrigger>
            <TabsTrigger value="insights">
              <Brain className="w-4 h-4 mr-2" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="devices">
            <RemediationControlTable 
              devices={devices}
              tasks={tasks}
              selectedDevices={selectedDevices}
              onDeviceSelection={handleDeviceSelection}
              onSelectAll={handleSelectAll}
              canManage={canManage()}
              canBulkAction={canBulkAction()}
              onDataChange={loadData}
            />
          </TabsContent>

          <TabsContent value="monitoring">
            <RemediationEventFeed 
              events={events}
              devices={devices}
              tasks={tasks}
            />
          </TabsContent>

          <TabsContent value="exceptions">
            <ExceptionManager 
              devices={devices}
              canManage={canManage()}
              onDataChange={loadData}
            />
          </TabsContent>

          <TabsContent value="insights">
            <AiRemediationInsights 
              devices={devices}
              tasks={tasks}
              events={events}
            />
          </TabsContent>
        </Tabs>

        {/* Modals */}
        {showBulkModal && (
          <BulkRemediationModal
            selectedDevices={selectedDevices}
            devices={devices}
            onClose={() => setShowBulkModal(false)}
            onComplete={() => {
              setShowBulkModal(false);
              setSelectedDevices([]);
              loadData();
            }}
          />
        )}
      </div>
    </div>
  );
}