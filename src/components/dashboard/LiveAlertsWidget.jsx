import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  Bell, 
  Shield, 
  Eye, 
  CheckCircle,
  Clock,
  RefreshCw,
  Volume2,
  VolumeX
} from 'lucide-react';
import { RealTimeSecurityDashboard } from '../../services/RealTimeSecurityDashboard';
import { format } from 'date-fns';

export default function LiveAlertsWidget({ className, maxAlerts = 10 }) {
  const [alerts, setAlerts] = useState([]);
  const [dashboard] = useState(() => new RealTimeSecurityDashboard());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastAlertCount, setLastAlertCount] = useState(0);

  useEffect(() => {
    // Set up event listeners
    const handleSecurityAlert = (alert) => {
      setAlerts(prevAlerts => {
        const newAlerts = [alert, ...prevAlerts].slice(0, maxAlerts);
        
        // Play notification sound for new critical alerts
        if (soundEnabled && alert.severity === 'critical') {
          playNotificationSound();
        }
        
        return newAlerts;
      });
    };

    const handleConnection = () => {
      // Load existing alerts when connected
      const existingAlerts = dashboard.getRecentAlerts(maxAlerts);
      setAlerts(existingAlerts);
      setLastAlertCount(existingAlerts.length);
    };

    dashboard.addEventListener('security_alert', handleSecurityAlert);
    dashboard.addEventListener('connected', handleConnection);

    // Initialize with existing alerts
    const existingAlerts = dashboard.getRecentAlerts(maxAlerts);
    setAlerts(existingAlerts);
    setLastAlertCount(existingAlerts.length);

    // Cleanup
    return () => {
      dashboard.removeEventListener('security_alert', handleSecurityAlert);
      dashboard.removeEventListener('connected', handleConnection);
    };
  }, [dashboard, maxAlerts, soundEnabled]);

  const playNotificationSound = () => {
    try {
      // Create a simple notification sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  };

  const acknowledgeAlert = (alertId) => {
    dashboard.acknowledgeAlert(alertId);
    setAlerts(prevAlerts =>
      prevAlerts.map(alert =>
        alert.id === alertId ? { ...alert, status: 'acknowledged' } : alert
      )
    );
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      case 'medium': return <Shield className="w-4 h-4 text-yellow-400" />;
      case 'low': return <Eye className="w-4 h-4 text-blue-400" />;
      default: return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSeverityBadgeColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'threat': return '🛡️';
      case 'vulnerability': return '🔍';
      case 'compliance': return '📋';
      case 'incident': return '🚨';
      case 'scan': return '📊';
      default: return '⚡';
    }
  };

  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMs = now.getTime() - alertTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return format(alertTime, 'MMM dd');
  };

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const unacknowledgedCount = alerts.filter(a => a.status === 'new').length;

  return (
    <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-red-400" />
          Live Security Alerts
          {unacknowledgedCount > 0 && (
            <Badge className="bg-red-500/20 text-red-400 animate-pulse">
              {unacknowledgedCount} new
            </Badge>
          )}
          <div className="ml-auto flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1 h-auto text-slate-400 hover:text-white"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => dashboard.refreshAllStreams()}
              className="p-1 h-auto text-slate-400 hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-slate-400">
            <Shield className="w-8 h-8 mr-2" />
            No recent security alerts
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-red-400">{criticalCount}</div>
                <div className="text-xs text-slate-400">Critical</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-orange-400">{unacknowledgedCount}</div>
                <div className="text-xs text-slate-400">Unacknowledged</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-blue-400">{alerts.length}</div>
                <div className="text-xs text-slate-400">Total</div>
              </div>
            </div>

            {/* Alerts List */}
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border transition-all ${
                      alert.status === 'new' 
                        ? 'bg-slate-700/50 border-slate-600 animate-pulse' 
                        : 'bg-slate-700/30 border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {getSeverityIcon(alert.severity)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs">{getTypeIcon(alert.type)}</span>
                          <Badge className={`text-xs ${getSeverityBadgeColor(alert.severity)}`}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-slate-400 ml-auto">
                            {formatRelativeTime(alert.timestamp)}
                          </span>
                        </div>
                        <h4 className="text-sm font-medium text-white truncate">
                          {alert.title}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {alert.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-slate-500">
                            Source: {alert.source}
                          </span>
                          {alert.status === 'new' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => acknowledgeAlert(alert.id)}
                              className="text-xs py-1 px-2 h-auto border-slate-600 text-slate-300 hover:bg-slate-600"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Acknowledge
                            </Button>
                          )}
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
  );
}
