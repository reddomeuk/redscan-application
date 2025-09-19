import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  User, 
  AlertTriangle, 
  TrendingUp,
  Clock,
  MapPin,
  RefreshCw,
  Eye,
  Target,
  Zap,
  Users,
  Activity,
  Globe
} from 'lucide-react';
import { behavioralAnalyticsService } from '../../services/BehavioralAnalyticsService';
import { format } from 'date-fns';

export default function BehavioralAnalyticsWidget({ className }) {
  const [stats, setStats] = useState(null);
  const [highRiskUsers, setHighRiskUsers] = useState([]);
  const [recentAnomalies, setRecentAnomalies] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeBehavioralAnalytics();
    
    // Set up event listeners
    const handleActivityAnalyzed = (result) => {
      updateStats();
    };

    const handleHighRiskUser = (result) => {
      setHighRiskUsers(prev => {
        const updated = prev.filter(u => u.userId !== result.userId);
        return [result, ...updated].slice(0, 10);
      });
    };

    const handleCriticalAnomaly = (result) => {
      setRecentAnomalies(prev => [result, ...prev.slice(0, 19)]);
    };

    behavioralAnalyticsService.on('activity_analyzed', handleActivityAnalyzed);
    behavioralAnalyticsService.on('high_risk_user', handleHighRiskUser);
    behavioralAnalyticsService.on('critical_anomaly', handleCriticalAnomaly);

    // Refresh data periodically
    const interval = setInterval(updateStats, 60000);

    return () => {
      behavioralAnalyticsService.off('activity_analyzed', handleActivityAnalyzed);
      behavioralAnalyticsService.off('high_risk_user', handleHighRiskUser);
      behavioralAnalyticsService.off('critical_anomaly', handleCriticalAnomaly);
      clearInterval(interval);
    };
  }, []);

  const initializeBehavioralAnalytics = async () => {
    try {
      if (!behavioralAnalyticsService.isRunning) {
        await behavioralAnalyticsService.initialize();
      }
      
      updateStats();
      
      // Simulate some user activities for demonstration
      simulateUserActivities();
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize behavioral analytics:', error);
      setIsLoading(false);
    }
  };

  const updateStats = () => {
    const behaviorStats = behavioralAnalyticsService.getBehavioralStatistics();
    const highRisk = behavioralAnalyticsService.getHighRiskUsers(10);
    const anomalies = behavioralAnalyticsService.getRecentAnomalies(24, 20);
    
    setStats(behaviorStats);
    setHighRiskUsers(highRisk);
    setRecentAnomalies(anomalies);
  };

  const simulateUserActivities = () => {
    // Simulate realistic user activities for demonstration
    const sampleActivities = [
      {
        userId: 'user1',
        activity: {
          type: 'login',
          timestamp: new Date().toISOString(),
          application: 'Office365',
          geolocation: { country: 'CN', city: 'Beijing' }, // Unusual location
          consecutiveActions: 45,
          dataAccessed: 150
        }
      },
      {
        userId: 'admin1',
        activity: {
          type: 'file_access',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          application: 'File Server',
          consecutiveActions: 200, // High activity
          dataAccessed: 500,
          geolocation: { country: 'US', city: 'New York' }
        }
      },
      {
        userId: 'user2',
        activity: {
          type: 'login',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
          application: 'tor', // Risky application
          consecutiveActions: 25,
          dataAccessed: 50,
          geolocation: { country: 'US', city: 'Boston' }
        }
      }
    ];

    // Process activities with slight delays
    sampleActivities.forEach((item, index) => {
      setTimeout(() => {
        behavioralAnalyticsService.analyzeUserActivity(item.userId, item.activity);
      }, (index + 1) * 3000);
    });
  };

  const handleRefresh = () => {
    updateStats();
    simulateUserActivities();
  };

  const getRiskScoreColor = (riskScore) => {
    if (riskScore >= 0.8) return 'text-red-400';
    if (riskScore >= 0.6) return 'text-orange-400';
    if (riskScore >= 0.4) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getAnomalyIcon = (type) => {
    switch (type) {
      case 'unusual_time': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'unusual_location': return <MapPin className="w-4 h-4 text-red-400" />;
      case 'impossible_travel': return <Globe className="w-4 h-4 text-red-400" />;
      case 'risky_application': return <Target className="w-4 h-4 text-orange-400" />;
      case 'rapid_activity': return <Zap className="w-4 h-4 text-purple-400" />;
      case 'excessive_data_access': return <TrendingUp className="w-4 h-4 text-blue-400" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
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

  if (isLoading) {
    return (
      <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            Behavioral Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-slate-400">
            <Brain className="w-8 h-8 animate-pulse mr-2" />
            Initializing UEBA engine...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-cyan-400" />
          Behavioral Analytics
          <Badge className="ml-auto bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
            <Activity className="w-3 h-3 mr-1" />
            UEBA Active
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
            <TabsTrigger value="users" className="text-xs">High Risk</TabsTrigger>
            <TabsTrigger value="anomalies" className="text-xs">Anomalies</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Summary Statistics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-2xl font-bold text-cyan-400">
                  {stats?.userProfiles || 0}
                </div>
                <div className="text-xs text-slate-400">User Profiles</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-2xl font-bold text-red-400">
                  {stats?.highRiskUsers || 0}
                </div>
                <div className="text-xs text-slate-400">High Risk Users</div>
              </div>
            </div>

            {/* Risk Metrics */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white">Average Risk Score</span>
                <span className={`text-sm font-medium ${getRiskScoreColor(stats?.averageRiskScore || 0)}`}>
                  {stats?.averageRiskScore ? (stats.averageRiskScore * 100).toFixed(1) : 0}%
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-white">Total Anomalies</span>
                <span className="text-sm font-medium text-orange-400">
                  {stats?.totalAnomalies || 0}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-white">Entity Profiles</span>
                <span className="text-sm font-medium text-blue-400">
                  {stats?.entityProfiles || 0}
                </span>
              </div>
            </div>

            {/* Anomaly Types Distribution */}
            <div className="space-y-2">
              <span className="text-sm text-white">Top Anomaly Types</span>
              <div className="space-y-1">
                {Object.entries(stats?.anomaliesByType || {})
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
                      <div className="flex items-center gap-2">
                        {getAnomalyIcon(type)}
                        <span className="text-xs text-white capitalize">{type.replace('_', ' ')}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">{count}</Badge>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Behavioral Insights */}
            <div className="pt-2 border-t border-slate-600">
              <div className="space-y-2">
                <span className="text-sm text-white">Key Insights</span>
                <div className="space-y-1 text-xs text-slate-400">
                  <div>• {((stats?.highRiskUsers / stats?.userProfiles) * 100 || 0).toFixed(1)}% of users are high risk</div>
                  <div>• Most common anomaly: {Object.entries(stats?.anomaliesByType || {}).sort(([,a], [,b]) => b - a)[0]?.[0]?.replace('_', ' ') || 'None'}</div>
                  <div>• Behavioral analysis engine is learning user patterns</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white">High Risk Users</span>
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                <Users className="w-3 h-3 mr-1" />
                {stats?.highRiskUsers || 0} Users
              </Badge>
            </div>
            
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {highRiskUsers.map((user, index) => (
                  <div key={user.userId} className="p-3 bg-slate-700/30 rounded-lg border border-slate-600">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-white font-medium">{user.userId}</span>
                      </div>
                      <Badge className={
                        user.riskScore >= 0.8 ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        user.riskScore >= 0.6 ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                        'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      }>
                        Risk: {(user.riskScore * 100).toFixed(0)}%
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400">Anomalies:</span>
                        <span className="ml-2 text-orange-400 font-medium">{user.anomalyCount}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Updated:</span>
                        <span className="ml-2 text-white">
                          {format(new Date(user.lastUpdated), 'HH:mm')}
                        </span>
                      </div>
                    </div>

                    {/* Risk Score Visualization */}
                    <div className="mt-2">
                      <Progress 
                        value={user.riskScore * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {highRiskUsers.length === 0 && (
              <div className="text-center text-slate-400 py-8">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <div className="text-sm">No high-risk users detected</div>
                <div className="text-xs">All user behavior within normal patterns</div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="anomalies" className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white">Recent Anomalies</span>
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                <Eye className="w-3 h-3 mr-1" />
                Last 24h
              </Badge>
            </div>
            
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {recentAnomalies.map((anomaly, index) => (
                  <div key={index} className="p-3 bg-slate-700/30 rounded-lg border border-slate-600">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getAnomalyIcon(anomaly.type)}
                        <Badge className={getSeverityColor(anomaly.severity)}>
                          {anomaly.severity?.toUpperCase() || 'UNKNOWN'}
                        </Badge>
                      </div>
                      <span className="text-xs text-slate-400">
                        {format(new Date(anomaly.timestamp), 'HH:mm:ss')}
                      </span>
                    </div>

                    <div className="text-sm text-white mb-1 capitalize">
                      {anomaly.type?.replace('_', ' ') || 'Unknown Anomaly'}
                    </div>

                    <div className="text-xs text-slate-300 mb-2">
                      {anomaly.description || 'No description available'}
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 text-blue-400" />
                        <span className="text-slate-400">
                          {anomaly.profileId || 'Unknown User'}
                        </span>
                      </div>
                      <span className="text-green-400">
                        {((anomaly.confidence || 0) * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {recentAnomalies.length === 0 && (
              <div className="text-center text-slate-400 py-8">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <div className="text-sm">No recent anomalies detected</div>
                <div className="text-xs">User behavior is within normal patterns</div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
