import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  RefreshCw,
  Wifi,
  WifiOff,
  Clock
} from 'lucide-react';
import { RealTimeSecurityDashboard } from '../../services/RealTimeSecurityDashboard';

export default function LiveMetricsWidget({ className, refreshInterval = 30000 }) {
  const [metrics, setMetrics] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [dashboard] = useState(() => new RealTimeSecurityDashboard());

  useEffect(() => {
    // Set up event listeners
    const handleMetricsUpdate = (newMetrics) => {
      setMetrics(newMetrics);
      setLastUpdate(new Date());
    };

    const handleConnection = () => setIsConnected(true);
    const handleDisconnection = () => setIsConnected(false);

    dashboard.addEventListener('metrics_update', handleMetricsUpdate);
    dashboard.addEventListener('connected', handleConnection);
    dashboard.addEventListener('disconnected', handleDisconnection);

    // Initialize with current metrics if available
    const currentMetrics = dashboard.getCurrentMetrics();
    if (currentMetrics) {
      setMetrics(currentMetrics);
      setLastUpdate(new Date());
    }

    setIsConnected(dashboard.isConnectionHealthy());

    // Cleanup
    return () => {
      dashboard.removeEventListener('metrics_update', handleMetricsUpdate);
      dashboard.removeEventListener('connected', handleConnection);
      dashboard.removeEventListener('disconnected', handleDisconnection);
      dashboard.disconnect();
    };
  }, [dashboard]);

  const handleRefresh = () => {
    dashboard.refreshAllStreams();
  };

  const formatTimestamp = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const getRiskScoreColor = (score) => {
    if (score >= 80) return 'text-red-400';
    if (score >= 60) return 'text-orange-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getRiskScoreBg = (score) => {
    if (score >= 80) return 'from-red-900/30 to-slate-800/50 border-red-500/30';
    if (score >= 60) return 'from-orange-900/30 to-slate-800/50 border-orange-500/30';
    if (score >= 40) return 'from-yellow-900/30 to-slate-800/50 border-yellow-500/30';
    return 'from-green-900/30 to-slate-800/50 border-green-500/30';
  };

  if (!metrics) {
    return (
      <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Live Security Metrics
            <Badge variant="outline" className="ml-auto">
              {isConnected ? (
                <><Wifi className="w-3 h-3 mr-1" /> Connected</>
              ) : (
                <><WifiOff className="w-3 h-3 mr-1" /> Disconnected</>
              )}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-slate-400">
            <Activity className="w-8 h-8 animate-pulse mr-2" />
            Loading real-time metrics...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          Live Security Metrics
          <Badge variant="outline" className="ml-auto">
            {isConnected ? (
              <><Wifi className="w-3 h-3 mr-1 text-green-400" /> Live</>
            ) : (
              <><WifiOff className="w-3 h-3 mr-1 text-red-400" /> Offline</>
            )}
          </Badge>
        </CardTitle>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock className="w-3 h-3" />
          Last updated: {lastUpdate ? formatTimestamp(lastUpdate) : 'Never'}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefresh}
            className="ml-auto p-1 h-auto text-slate-400 hover:text-white"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary Risk Score */}
        <Card className={`bg-gradient-to-r ${getRiskScoreBg(metrics.riskScore)}`}>
          <CardContent className="p-4 text-center">
            <div className={`text-3xl font-bold ${getRiskScoreColor(metrics.riskScore)}`}>
              {metrics.riskScore}
            </div>
            <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <Shield className="w-3 h-3" />
              Overall Risk Score
            </div>
          </CardContent>
        </Card>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-700/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-red-400">{metrics.activeThreats}</div>
            <div className="text-xs text-slate-400">Active Threats</div>
          </div>
          
          <div className="bg-slate-700/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-orange-400">{metrics.criticalFindings}</div>
            <div className="text-xs text-slate-400">Critical Findings</div>
          </div>
          
          <div className="bg-slate-700/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-400">{metrics.assetsOnline}</div>
            <div className="text-xs text-slate-400">Assets Online</div>
          </div>
          
          <div className="bg-slate-700/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-blue-400">{metrics.scanActivity}</div>
            <div className="text-xs text-slate-400">Scan Activity</div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Compliance Score:</span>
            <span className="text-green-400 font-medium">{metrics.complianceScore}%</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Open Incidents:</span>
            <span className={`font-medium ${metrics.incidentCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {metrics.incidentCount}
            </span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Automated Actions (24h):</span>
            <span className="text-purple-400 font-medium">{metrics.automatedActions}</span>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="pt-2 border-t border-slate-600">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-slate-400">
                {isConnected ? 'Real-time monitoring active' : 'Connection lost - using cached data'}
              </span>
            </div>
            {metrics.activeThreats > 0 && (
              <Badge className="bg-red-500/20 text-red-400 animate-pulse">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Alert
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
