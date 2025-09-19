import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Server, 
  Wifi, 
  Database, 
  Activity, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { RealTimeSecurityDashboard } from '../../services/RealTimeSecurityDashboard';
import { format } from 'date-fns';

export default function SystemHealthWidget({ className }) {
  const [systemHealth, setSystemHealth] = useState(null);
  const [dashboard] = useState(() => new RealTimeSecurityDashboard());
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    // Set up event listeners
    const handleSystemHealth = (health) => {
      setSystemHealth(health);
      setLastUpdate(new Date());
    };

    dashboard.addEventListener('system_health', handleSystemHealth);

    // Initialize with mock data since we don't have a real backend
    handleSystemHealth({
      scanners: {
        online: 9,
        total: 10,
        lastSync: new Date(Date.now() - 120000).toISOString() // 2 minutes ago
      },
      agents: {
        online: 95,
        total: 100,
        lastHeartbeat: new Date(Date.now() - 30000).toISOString() // 30 seconds ago
      },
      integrations: {
        active: 14,
        total: 15,
        errors: 1
      },
      dataIngestion: {
        eventsPerMinute: 1250,
        backlogCount: 45,
        processingLatency: 250
      }
    });

    // Cleanup
    return () => {
      dashboard.removeEventListener('system_health', handleSystemHealth);
    };
  }, [dashboard]);

  const handleRefresh = () => {
    dashboard.refreshAllStreams();
  };

  const getHealthStatus = (online, total, threshold = 0.9) => {
    const percentage = online / total;
    if (percentage >= threshold) return 'healthy';
    if (percentage >= 0.7) return 'warning';
    return 'critical';
  };

  const getHealthIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'critical': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getHealthColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getHealthBg = (status) => {
    switch (status) {
      case 'healthy': return 'bg-green-500/20 border-green-500/30';
      case 'warning': return 'bg-yellow-500/20 border-yellow-500/30';
      case 'critical': return 'bg-red-500/20 border-red-500/30';
      default: return 'bg-gray-500/20 border-gray-500/30';
    }
  };

  const formatLatency = (ms) => {
    if (ms < 100) return `${ms}ms`;
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatEventRate = (eventsPerMinute) => {
    if (eventsPerMinute < 1000) return `${eventsPerMinute}/min`;
    return `${(eventsPerMinute / 1000).toFixed(1)}k/min`;
  };

  if (!systemHealth) {
    return (
      <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-green-400" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-slate-400">
            <Activity className="w-8 h-8 animate-pulse mr-2" />
            Loading system health...
          </div>
        </CardContent>
      </Card>
    );
  }

  const scannersStatus = getHealthStatus(systemHealth.scanners.online, systemHealth.scanners.total);
  const agentsStatus = getHealthStatus(systemHealth.agents.online, systemHealth.agents.total);
  const integrationsStatus = getHealthStatus(systemHealth.integrations.active, systemHealth.integrations.total);
  
  const overallStatus = [scannersStatus, agentsStatus, integrationsStatus].includes('critical') ? 'critical' :
                       [scannersStatus, agentsStatus, integrationsStatus].includes('warning') ? 'warning' : 'healthy';

  return (
    <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Server className="w-5 h-5 text-green-400" />
          System Health
          <Badge className={`ml-auto ${getHealthBg(overallStatus)}`}>
            {getHealthIcon(overallStatus)}
            <span className="ml-1 capitalize">{overallStatus}</span>
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
        {lastUpdate && (
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="w-3 h-3" />
            Last updated: {format(lastUpdate, 'HH:mm:ss')}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Scanners Health */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-white">Security Scanners</span>
              {getHealthIcon(scannersStatus)}
            </div>
            <span className={`text-sm font-medium ${getHealthColor(scannersStatus)}`}>
              {systemHealth.scanners.online}/{systemHealth.scanners.total}
            </span>
          </div>
          <Progress 
            value={(systemHealth.scanners.online / systemHealth.scanners.total) * 100} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>Last sync: {format(new Date(systemHealth.scanners.lastSync), 'HH:mm')}</span>
            <span>{Math.round((systemHealth.scanners.online / systemHealth.scanners.total) * 100)}% operational</span>
          </div>
        </div>

        {/* Agents Health */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-green-400" />
              <span className="text-sm text-white">Endpoint Agents</span>
              {getHealthIcon(agentsStatus)}
            </div>
            <span className={`text-sm font-medium ${getHealthColor(agentsStatus)}`}>
              {systemHealth.agents.online}/{systemHealth.agents.total}
            </span>
          </div>
          <Progress 
            value={(systemHealth.agents.online / systemHealth.agents.total) * 100} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>Last heartbeat: {format(new Date(systemHealth.agents.lastHeartbeat), 'HH:mm:ss')}</span>
            <span>{Math.round((systemHealth.agents.online / systemHealth.agents.total) * 100)}% online</span>
          </div>
        </div>

        {/* Integrations Health */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-white">Integrations</span>
              {getHealthIcon(integrationsStatus)}
            </div>
            <span className={`text-sm font-medium ${getHealthColor(integrationsStatus)}`}>
              {systemHealth.integrations.active}/{systemHealth.integrations.total}
            </span>
          </div>
          <Progress 
            value={(systemHealth.integrations.active / systemHealth.integrations.total) * 100} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>Errors: {systemHealth.integrations.errors}</span>
            <span>{Math.round((systemHealth.integrations.active / systemHealth.integrations.total) * 100)}% active</span>
          </div>
        </div>

        {/* Data Ingestion Metrics */}
        <div className="pt-2 border-t border-slate-600">
          <h4 className="text-sm font-medium text-white mb-3">Data Ingestion</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-700/50 rounded-lg p-2 text-center">
              <div className="text-sm font-bold text-blue-400">
                {formatEventRate(systemHealth.dataIngestion.eventsPerMinute)}
              </div>
              <div className="text-xs text-slate-400">Events/min</div>
            </div>
            
            <div className="bg-slate-700/50 rounded-lg p-2 text-center">
              <div className={`text-sm font-bold ${systemHealth.dataIngestion.backlogCount > 100 ? 'text-orange-400' : 'text-green-400'}`}>
                {systemHealth.dataIngestion.backlogCount}
              </div>
              <div className="text-xs text-slate-400">Backlog</div>
            </div>
            
            <div className="bg-slate-700/50 rounded-lg p-2 text-center">
              <div className={`text-sm font-bold ${systemHealth.dataIngestion.processingLatency > 500 ? 'text-orange-400' : 'text-green-400'}`}>
                {formatLatency(systemHealth.dataIngestion.processingLatency)}
              </div>
              <div className="text-xs text-slate-400">Latency</div>
            </div>
          </div>
        </div>

        {/* System Status Summary */}
        <div className="pt-2 border-t border-slate-600">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">System Status:</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                overallStatus === 'healthy' ? 'bg-green-400 animate-pulse' :
                overallStatus === 'warning' ? 'bg-yellow-400 animate-pulse' :
                'bg-red-400 animate-pulse'
              }`} />
              <span className={`capitalize ${getHealthColor(overallStatus)}`}>
                {overallStatus === 'healthy' ? 'All systems operational' :
                 overallStatus === 'warning' ? 'Minor issues detected' :
                 'Critical issues require attention'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
