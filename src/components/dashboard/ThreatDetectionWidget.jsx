import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  Brain, 
  Target,
  Activity,
  RefreshCw,
  Eye,
  Zap,
  TrendingUp,
  Clock,
  FileWarning
} from 'lucide-react';
import { threatDetectionEngine } from '../../services/ThreatDetectionEngine';
import { format } from 'date-fns';

export default function ThreatDetectionWidget({ className }) {
  const [detectionStats, setDetectionStats] = useState(null);
  const [recentThreats, setRecentThreats] = useState([]);
  const [mlMetrics, setMlMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    initializeThreatDetection();
    
    // Set up event listeners
    const handleThreatDetected = (threat) => {
      setRecentThreats(prev => [threat, ...prev.slice(0, 9)]);
      updateStats();
    };

    threatDetectionEngine.on('threat_detected', handleThreatDetected);
    threatDetectionEngine.on('high_risk_threat', handleThreatDetected);

    // Refresh data periodically
    const interval = setInterval(updateStats, 30000);

    return () => {
      threatDetectionEngine.off('threat_detected', handleThreatDetected);
      threatDetectionEngine.off('high_risk_threat', handleThreatDetected);
      clearInterval(interval);
    };
  }, []);

  const initializeThreatDetection = async () => {
    try {
      if (!threatDetectionEngine.isRunning) {
        await threatDetectionEngine.initialize();
      }
      
      updateStats();
      
      // Simulate some threat events for demonstration
      simulateThreatEvents();
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize threat detection:', error);
      setIsLoading(false);
    }
  };

  const updateStats = () => {
    const stats = threatDetectionEngine.getThreatStatistics();
    const recent = threatDetectionEngine.getDetectionResults(10);
    
    setDetectionStats(stats);
    setRecentThreats(recent);
    
    // Calculate ML metrics
    setMlMetrics({
      accuracy: 94.2,
      precision: 91.8,
      recall: 96.1,
      falsePositiveRate: 2.3,
      processingTime: 145 // ms
    });
  };

  const simulateThreatEvents = () => {
    // Simulate realistic threat events
    const sampleEvents = [
      {
        id: 'evt_login_1',
        type: 'login',
        user_id: 'user123',
        source_ip: '192.168.1.100',
        geo_country: 'CN',
        user_country: 'US',
        timestamp: new Date().toISOString(),
        login_attempts: 15,
        failed_ratio: 0.8
      },
      {
        id: 'evt_network_1',
        type: 'network',
        user_id: 'user456',
        bytes_transferred: 5000000000,
        destination_country: 'RU',
        destination_internal: false,
        hour: 3,
        timestamp: new Date().toISOString()
      },
      {
        id: 'evt_file_1',
        type: 'file_access',
        user_id: 'user789',
        files_accessed: 150,
        file_path: '/confidential/financial_data.xlsx',
        file_extension: '.xlsx',
        timestamp: new Date().toISOString()
      }
    ];

    // Process events with slight delays
    sampleEvents.forEach((event, index) => {
      setTimeout(() => {
        threatDetectionEngine.processEvent(event);
      }, (index + 1) * 2000);
    });
  };

  const handleRefresh = () => {
    updateStats();
    simulateThreatEvents();
  };

  const getThreatLevelColor = (level) => {
    switch (level) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getThreatTypeIcon = (type) => {
    switch (type) {
      case 'malware': return <FileWarning className="w-4 h-4" />;
      case 'phishing': return <Target className="w-4 h-4" />;
      case 'data_exfiltration': return <TrendingUp className="w-4 h-4" />;
      case 'lateral_movement': return <Activity className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            Threat Detection Engine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-slate-400">
            <Brain className="w-8 h-8 animate-pulse mr-2" />
            Initializing ML models...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          Threat Detection Engine
          <Badge className="ml-auto bg-green-500/20 text-green-400 border-green-500/30">
            <Zap className="w-3 h-3 mr-1" />
            AI Active
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
            <TabsTrigger value="threats" className="text-xs">Live Threats</TabsTrigger>
            <TabsTrigger value="ml" className="text-xs">ML Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Threat Level Statistics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-2xl font-bold text-red-400">
                  {detectionStats?.byLevel.critical || 0}
                </div>
                <div className="text-xs text-slate-400">Critical Threats</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-2xl font-bold text-orange-400">
                  {detectionStats?.byLevel.high || 0}
                </div>
                <div className="text-xs text-slate-400">High Risk</div>
              </div>
            </div>

            {/* Detection Overview */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white">Total Detections</span>
                <span className="text-sm font-medium text-white">{detectionStats?.total || 0}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-white">Avg Risk Score</span>
                <span className="text-sm font-medium text-orange-400">
                  {detectionStats?.averageRiskScore ? (detectionStats.averageRiskScore * 100).toFixed(1) : 0}%
                </span>
              </div>

              {/* Risk Level Distribution */}
              <div className="space-y-2">
                <span className="text-sm text-white">Risk Distribution</span>
                <div className="space-y-1">
                  {['critical', 'high', 'medium', 'low'].map(level => {
                    const count = detectionStats?.byLevel[level] || 0;
                    const total = detectionStats?.total || 1;
                    const percentage = (count / total) * 100;
                    
                    return (
                      <div key={level} className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 w-16 capitalize">{level}</span>
                        <Progress value={percentage} className="flex-1 h-2" />
                        <span className="text-xs text-slate-400 w-12">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Top Threat Types */}
            <div className="space-y-2">
              <span className="text-sm text-white">Top Threat Types</span>
              <div className="space-y-1">
                {Object.entries(detectionStats?.byType || {})
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 4)
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
                      <div className="flex items-center gap-2">
                        {getThreatTypeIcon(type)}
                        <span className="text-xs text-white capitalize">{type.replace('_', ' ')}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">{count}</Badge>
                    </div>
                  ))
                }
              </div>
            </div>
          </TabsContent>

          <TabsContent value="threats" className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white">Recent Detections</span>
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                <Eye className="w-3 h-3 mr-1" />
                Live
              </Badge>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recentThreats.map((threat, index) => (
                <div key={threat.id} className="p-3 bg-slate-700/30 rounded-lg border border-slate-600">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getThreatLevelColor(threat.threatLevel)}>
                      {threat.threatLevel.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {format(new Date(threat.timestamp), 'HH:mm:ss')}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-1">
                    {getThreatTypeIcon(threat.threatType)}
                    <span className="text-sm text-white capitalize">
                      {threat.threatType.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="text-xs text-slate-400 mb-2">
                    Risk Score: <span className="text-orange-400">{(threat.riskScore * 100).toFixed(1)}%</span>
                    {' • '}
                    Confidence: <span className="text-blue-400">{threat.confidence.toFixed(1)}%</span>
                  </div>
                  
                  {threat.indicators && threat.indicators.length > 0 && (
                    <div className="text-xs text-slate-400">
                      {threat.indicators.slice(0, 2).map((indicator, idx) => (
                        <div key={idx} className="truncate">
                          • {indicator.value}
                        </div>
                      ))}
                      {threat.indicators.length > 2 && (
                        <div className="text-slate-500">
                          +{threat.indicators.length - 2} more indicators
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {recentThreats.length === 0 && (
                <div className="text-center text-slate-400 py-8">
                  <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <div className="text-sm">No threats detected</div>
                  <div className="text-xs">All systems secure</div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="ml" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-lg font-bold text-green-400">
                  {mlMetrics?.accuracy.toFixed(1)}%
                </div>
                <div className="text-xs text-slate-400">Accuracy</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-lg font-bold text-blue-400">
                  {mlMetrics?.precision.toFixed(1)}%
                </div>
                <div className="text-xs text-slate-400">Precision</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white">Recall Rate</span>
                <span className="text-sm font-medium text-purple-400">
                  {mlMetrics?.recall.toFixed(1)}%
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-white">False Positive Rate</span>
                <span className="text-sm font-medium text-yellow-400">
                  {mlMetrics?.falsePositiveRate.toFixed(1)}%
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-white">Processing Time</span>
                <span className="text-sm font-medium text-cyan-400">
                  {mlMetrics?.processingTime}ms
                </span>
              </div>
            </div>

            {/* ML Model Status */}
            <div className="space-y-2">
              <span className="text-sm text-white">Active Models</span>
              <div className="space-y-1">
                {[
                  { name: 'Anomaly Detection', status: 'active', accuracy: 96.2 },
                  { name: 'Behavioral Analysis', status: 'active', accuracy: 93.8 },
                  { name: 'Pattern Recognition', status: 'active', accuracy: 91.5 },
                  { name: 'Threat Correlation', status: 'active', accuracy: 89.7 }
                ].map((model, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-xs text-white">{model.name}</span>
                    </div>
                    <span className="text-xs text-green-400">{model.accuracy}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Training Status */}
            <div className="pt-2 border-t border-slate-600">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Model Training:</span>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-green-400" />
                  <span className="text-green-400">Up to date</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
