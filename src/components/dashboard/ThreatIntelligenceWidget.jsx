import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Globe, 
  Target,
  TrendingUp,
  Clock,
  RefreshCw,
  Info
} from 'lucide-react';
import { RealTimeSecurityDashboard } from '../../services/RealTimeSecurityDashboard';
import { format } from 'date-fns';

export default function ThreatIntelligenceWidget({ className, maxThreats = 8 }) {
  const [threats, setThreats] = useState([]);
  const [dashboard] = useState(() => new RealTimeSecurityDashboard());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up event listeners
    const handleThreatIndicator = (threat) => {
      setThreats(prevThreats => {
        const existingIndex = prevThreats.findIndex(t => t.id === threat.id);
        if (existingIndex >= 0) {
          // Update existing threat
          const newThreats = [...prevThreats];
          newThreats[existingIndex] = threat;
          return newThreats;
        } else {
          // Add new threat
          return [threat, ...prevThreats].slice(0, maxThreats);
        }
      });
    };

    const handleConnection = () => {
      // Load existing threat indicators when connected
      const activeThreats = dashboard.getActiveThreatIndicators();
      setThreats(activeThreats.slice(0, maxThreats));
      setIsLoading(false);
    };

    dashboard.addEventListener('threat_indicator', handleThreatIndicator);
    dashboard.addEventListener('connected', handleConnection);

    // Initialize with existing threats
    const activeThreats = dashboard.getActiveThreatIndicators();
    setThreats(activeThreats.slice(0, maxThreats));
    setIsLoading(false);

    // Cleanup
    return () => {
      dashboard.removeEventListener('threat_indicator', handleThreatIndicator);
      dashboard.removeEventListener('connected', handleConnection);
    };
  }, [dashboard, maxThreats]);

  const getThreatTypeIcon = (type) => {
    switch (type) {
      case 'malware': return '🦠';
      case 'phishing': return '🎣';
      case 'suspicious_ip': return '🌐';
      case 'data_exfiltration': return '📤';
      case 'brute_force': return '🔨';
      default: return '⚠️';
    }
  };

  const getThreatTypeColor = (type) => {
    switch (type) {
      case 'malware': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'phishing': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'suspicious_ip': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'data_exfiltration': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'brute_force': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-green-400';
    if (confidence >= 70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const formatThreatType = (type) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const threatTime = new Date(timestamp);
    const diffMs = now.getTime() - threatTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just detected';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return format(threatTime, 'MMM dd');
  };

  const criticalThreats = threats.filter(t => t.severity === 'critical').length;
  const highConfidenceThreats = threats.filter(t => t.confidence >= 90).length;
  const uniqueTypes = new Set(threats.map(t => t.type)).size;

  if (isLoading) {
    return (
      <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            Threat Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-slate-400">
            <TrendingUp className="w-8 h-8 animate-pulse mr-2" />
            Loading threat intelligence...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            Threat Intelligence
            {criticalThreats > 0 && (
              <Badge className="bg-red-500/20 text-red-400 animate-pulse">
                {criticalThreats} critical
              </Badge>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => dashboard.refreshAllStreams()}
              className="ml-auto p-1 h-auto text-slate-400 hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {threats.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-slate-400">
              <Eye className="w-8 h-8 mr-2" />
              No active threat indicators
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-red-400">{criticalThreats}</div>
                  <div className="text-xs text-slate-400">Critical</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-green-400">{highConfidenceThreats}</div>
                  <div className="text-xs text-slate-400">High Confidence</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-purple-400">{uniqueTypes}</div>
                  <div className="text-xs text-slate-400">Threat Types</div>
                </div>
              </div>

              {/* Threats List */}
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {threats.map((threat) => (
                    <div
                      key={threat.id}
                      className="p-3 rounded-lg bg-slate-700/30 border border-slate-600 hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 text-lg">
                          {getThreatTypeIcon(threat.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={`text-xs ${getThreatTypeColor(threat.type)}`}>
                              {formatThreatType(threat.type)}
                            </Badge>
                            <Badge variant="outline" className={`text-xs ${getSeverityColor(threat.severity)}`}>
                              {threat.severity.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-slate-400 ml-auto">
                              {formatRelativeTime(threat.lastSeen)}
                            </span>
                          </div>
                          
                          <h4 className="text-sm font-medium text-white truncate mb-1">
                            {threat.description}
                          </h4>
                          
                          <div className="flex items-center gap-4 text-xs text-slate-400 mb-2">
                            <div className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              <span>Confidence: </span>
                              <span className={getConfidenceColor(threat.confidence)}>
                                {threat.confidence}%
                              </span>
                            </div>
                            {threat.sourceIp && (
                              <div className="flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                <span>{threat.sourceIp}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500">
                                Assets: {threat.targetAssets.length}
                              </span>
                              <span className="text-xs text-slate-500">
                                IOCs: {threat.iocs.length}
                              </span>
                            </div>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="p-1 h-auto text-slate-400 hover:text-white"
                                >
                                  <Info className="w-3 h-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="max-w-xs">
                                <div className="space-y-1">
                                  <p className="font-medium">Threat Details</p>
                                  <p className="text-xs">First Seen: {format(new Date(threat.firstSeen), 'MMM dd, HH:mm')}</p>
                                  <p className="text-xs">Last Seen: {format(new Date(threat.lastSeen), 'MMM dd, HH:mm')}</p>
                                  {threat.targetAssets.length > 0 && (
                                    <p className="text-xs">Affected Assets: {threat.targetAssets.slice(0, 3).join(', ')}</p>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
