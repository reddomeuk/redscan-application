/**
 * Enhanced Security Analytics Engine
 * Advanced analytics with machine learning for threat detection and behavioral analysis
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, Area, AreaChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  Brain, TrendingUp, AlertTriangle, Shield, Activity, 
  Target, Zap, Eye, BarChart3, PieChart,
  Users, Server, Globe, Lock, Cpu, Database
} from 'lucide-react';

const SecurityAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    threatDetection: [],
    behavioralAnalysis: [],
    anomalyDetection: [],
    predictiveInsights: [],
    mlModels: [],
    threatScores: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [activeModel, setActiveModel] = useState('threat_detection');
  const [realTimeData, setRealTimeData] = useState([]);
  const wsRef = useRef(null);

  useEffect(() => {
    loadAnalyticsData();
    setupRealTimeConnection();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [selectedTimeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simulate loading comprehensive analytics data
      const mockData = generateMockAnalyticsData();
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeConnection = () => {
    // Setup WebSocket for real-time analytics updates
    try {
      wsRef.current = new WebSocket('ws://localhost:3001/analytics');
      
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        updateRealTimeData(data);
      };
      
      wsRef.current.onopen = () => {
        console.log('Real-time analytics connection established');
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to setup real-time connection:', error);
    }
  };

  const updateRealTimeData = (newData) => {
    setRealTimeData(prev => {
      const updated = [...prev, newData].slice(-50); // Keep last 50 data points
      return updated;
    });

    // Update analytics data with new insights
    setAnalyticsData(prev => ({
      ...prev,
      threatScores: [...prev.threatScores, {
        timestamp: new Date().toISOString(),
        score: newData.threatScore,
        category: newData.category
      }].slice(-100)
    }));
  };

  const generateMockAnalyticsData = () => {
    const now = Date.now();
    const timeRanges = {
      '1h': 12,
      '24h': 24,
      '7d': 7,
      '30d': 30
    };
    
    const points = timeRanges[selectedTimeRange] || 24;
    
    return {
      threatDetection: Array.from({ length: points }, (_, i) => ({
        time: new Date(now - (points - i) * (selectedTimeRange === '1h' ? 5 * 60000 : 
                                           selectedTimeRange === '24h' ? 3600000 :
                                           selectedTimeRange === '7d' ? 24 * 3600000 :
                                           24 * 3600000)).toISOString(),
        threats: Math.floor(Math.random() * 50) + 10,
        malware: Math.floor(Math.random() * 15) + 2,
        phishing: Math.floor(Math.random() * 20) + 5,
        suspicious: Math.floor(Math.random() * 30) + 8,
        confidence: Math.random() * 0.4 + 0.6
      })),
      
      behavioralAnalysis: Array.from({ length: points }, (_, i) => ({
        time: new Date(now - (points - i) * 3600000).toISOString(),
        userAnomalies: Math.floor(Math.random() * 25) + 5,
        deviceAnomalies: Math.floor(Math.random() * 15) + 3,
        networkAnomalies: Math.floor(Math.random() * 20) + 7,
        baselineDeviation: Math.random() * 0.3 + 0.1
      })),
      
      anomalyDetection: [
        { category: 'Login Patterns', anomalies: 127, severity: 'high', confidence: 0.87 },
        { category: 'Data Access', anomalies: 89, severity: 'medium', confidence: 0.92 },
        { category: 'Network Traffic', anomalies: 156, severity: 'high', confidence: 0.78 },
        { category: 'File Operations', anomalies: 67, severity: 'low', confidence: 0.94 },
        { category: 'Privilege Usage', anomalies: 34, severity: 'critical', confidence: 0.96 }
      ],
      
      predictiveInsights: [
        {
          insight: 'High probability of targeted phishing campaign',
          probability: 0.84,
          timeline: '2-3 days',
          impact: 'high',
          recommendation: 'Increase email security monitoring and user awareness'
        },
        {
          insight: 'Potential insider threat activity detected',
          probability: 0.67,
          timeline: '1-2 weeks',
          impact: 'critical',
          recommendation: 'Enhanced user activity monitoring and access review'
        },
        {
          insight: 'Network infrastructure vulnerability exploitation likely',
          probability: 0.73,
          timeline: '1 week',
          impact: 'high',
          recommendation: 'Expedite security patches and network segmentation'
        }
      ],
      
      mlModels: [
        {
          name: 'Threat Detection Model',
          type: 'Random Forest',
          accuracy: 0.94,
          precision: 0.91,
          recall: 0.88,
          lastTrained: '2024-01-15T10:30:00Z',
          status: 'active',
          predictions: 1547
        },
        {
          name: 'Behavioral Analysis Model',
          type: 'Deep Neural Network',
          accuracy: 0.89,
          precision: 0.85,
          recall: 0.92,
          lastTrained: '2024-01-14T08:15:00Z',
          status: 'active',
          predictions: 2893
        },
        {
          name: 'Anomaly Detection Model',
          type: 'Isolation Forest',
          accuracy: 0.91,
          precision: 0.88,
          recall: 0.94,
          lastTrained: '2024-01-16T14:45:00Z',
          status: 'training',
          predictions: 3241
        }
      ],
      
      threatScores: Array.from({ length: 20 }, (_, i) => ({
        timestamp: new Date(now - i * 300000).toISOString(),
        score: Math.random() * 100,
        category: ['malware', 'phishing', 'insider', 'external'][Math.floor(Math.random() * 4)]
      }))
    };
  };

  const getThreatLevelColor = (score) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[severity] || colors.medium;
  };

  const ModelPerformanceChart = ({ model }) => {
    const performanceData = [
      { metric: 'Accuracy', value: model.accuracy * 100 },
      { metric: 'Precision', value: model.precision * 100 },
      { metric: 'Recall', value: model.recall * 100 }
    ];

    return (
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={performanceData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="metric" />
          <YAxis domain={[0, 100]} />
          <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
          <Bar dataKey="value" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const ThreatRadarChart = () => {
    const radarData = [
      { threat: 'Malware', current: 75, baseline: 60 },
      { threat: 'Phishing', current: 89, baseline: 45 },
      { threat: 'Insider', current: 62, baseline: 30 },
      { threat: 'External', current: 78, baseline: 55 },
      { threat: 'DDoS', current: 43, baseline: 25 },
      { threat: 'Data Breach', current: 67, baseline: 40 }
    ];

    return (
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={radarData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="threat" />
          <PolarRadiusAxis angle={0} domain={[0, 100]} />
          <Radar name="Current" dataKey="current" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
          <Radar name="Baseline" dataKey="baseline" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    );
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-2">
          <Brain className="w-6 h-6 animate-pulse" />
          <span>Loading Security Analytics...</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-32 bg-gray-100" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <Brain className="w-8 h-8 text-blue-600" />
            <span>Security Analytics Engine</span>
          </h1>
          <p className="text-gray-600 mt-1">
            Advanced threat detection and behavioral analysis with machine learning
          </p>
        </div>
        
        <div className="flex space-x-2">
          <select 
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <Button variant="outline" size="sm">
            <Activity className="w-4 h-4 mr-2" />
            Live Feed
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Threats Detected</p>
                <p className="text-2xl font-bold text-red-600">1,247</p>
                <p className="text-xs text-green-600">↓ 12% from yesterday</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Anomalies Found</p>
                <p className="text-2xl font-bold text-orange-600">473</p>
                <p className="text-xs text-red-600">↑ 8% from yesterday</p>
              </div>
              <Eye className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ML Accuracy</p>
                <p className="text-2xl font-bold text-green-600">94.2%</p>
                <p className="text-xs text-green-600">↑ 2.1% this week</p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Risk Score</p>
                <p className="text-2xl font-bold text-yellow-600">67/100</p>
                <p className="text-xs text-yellow-600">Medium Risk</p>
              </div>
              <Shield className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="threat-detection" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="threat-detection">Threat Detection</TabsTrigger>
          <TabsTrigger value="behavioral">Behavioral Analysis</TabsTrigger>
          <TabsTrigger value="anomalies">Anomaly Detection</TabsTrigger>
          <TabsTrigger value="predictive">Predictive Insights</TabsTrigger>
          <TabsTrigger value="models">ML Models</TabsTrigger>
        </TabsList>

        {/* Threat Detection Tab */}
        <TabsContent value="threat-detection" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Threat Detection Timeline</CardTitle>
                <CardDescription>Real-time threat detection over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.threatDetection}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" tickFormatter={(time) => new Date(time).toLocaleTimeString()} />
                    <YAxis />
                    <Tooltip labelFormatter={(time) => new Date(time).toLocaleString()} />
                    <Area type="monotone" dataKey="threats" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="malware" stackId="1" stroke="#f97316" fill="#f97316" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="phishing" stackId="1" stroke="#eab308" fill="#eab308" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Threat Landscape Radar</CardTitle>
                <CardDescription>Current vs baseline threat levels</CardDescription>
              </CardHeader>
              <CardContent>
                <ThreatRadarChart />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Real-time Threat Feed</CardTitle>
              <CardDescription>Live threat detection results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {realTimeData.slice(-10).reverse().map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="font-medium">{item.type || 'Threat Detected'}</span>
                      <Badge variant="outline">{item.category || 'Unknown'}</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`font-bold ${getThreatLevelColor(item.threatScore || 50)}`}>
                        {Math.round(item.threatScore || 50)}/100
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date().toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
                {realTimeData.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No real-time data available. Waiting for threat detections...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Behavioral Analysis Tab */}
        <TabsContent value="behavioral" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Behavior Analysis</CardTitle>
                <CardDescription>Anomalous user behavior patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.behavioralAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" tickFormatter={(time) => new Date(time).toLocaleTimeString()} />
                    <YAxis />
                    <Tooltip labelFormatter={(time) => new Date(time).toLocaleString()} />
                    <Legend />
                    <Line type="monotone" dataKey="userAnomalies" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="deviceAnomalies" stroke="#ef4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="networkAnomalies" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Baseline Deviation</CardTitle>
                <CardDescription>How much current behavior deviates from normal</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.behavioralAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" tickFormatter={(time) => new Date(time).toLocaleTimeString()} />
                    <YAxis domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                    <Tooltip 
                      labelFormatter={(time) => new Date(time).toLocaleString()}
                      formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Deviation']}
                    />
                    <Area type="monotone" dataKey="baselineDeviation" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Anomaly Detection Tab */}
        <TabsContent value="anomalies" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Anomaly Categories</CardTitle>
                <CardDescription>Detected anomalies by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.anomalyDetection.map((anomaly, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          anomaly.severity === 'critical' ? 'bg-red-600' :
                          anomaly.severity === 'high' ? 'bg-orange-600' :
                          anomaly.severity === 'medium' ? 'bg-yellow-600' : 'bg-green-600'
                        }`} />
                        <div>
                          <p className="font-medium">{anomaly.category}</p>
                          <p className="text-sm text-gray-600">{anomaly.anomalies} anomalies detected</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getSeverityColor(anomaly.severity)}>
                          {anomaly.severity}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {Math.round(anomaly.confidence * 100)}% confidence
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Anomaly Distribution</CardTitle>
                <CardDescription>Severity distribution of detected anomalies</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.anomalyDetection}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="anomalies" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Predictive Insights Tab */}
        <TabsContent value="predictive" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {analyticsData.predictiveInsights.map((insight, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-lg">{insight.insight}</h3>
                      </div>
                      <p className="text-gray-600 mb-4">{insight.recommendation}</p>
                      <div className="flex items-center space-x-4">
                        <div>
                          <span className="text-sm text-gray-500">Probability: </span>
                          <span className="font-medium">{Math.round(insight.probability * 100)}%</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Timeline: </span>
                          <span className="font-medium">{insight.timeline}</span>
                        </div>
                        <Badge className={getSeverityColor(insight.impact)}>
                          {insight.impact} impact
                        </Badge>
                      </div>
                    </div>
                    <div className="ml-4">
                      <Progress value={insight.probability * 100} className="w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ML Models Tab */}
        <TabsContent value="models" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {analyticsData.mlModels.map((model, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Cpu className="w-5 h-5" />
                        <span>{model.name}</span>
                      </CardTitle>
                      <CardDescription>{model.type}</CardDescription>
                    </div>
                    <Badge variant={model.status === 'active' ? 'default' : 'secondary'}>
                      {model.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <ModelPerformanceChart model={model} />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Predictions: </span>
                        <span className="font-medium">{model.predictions.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Last Trained: </span>
                        <span className="font-medium">
                          {new Date(model.lastTrained).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      <Zap className="w-4 h-4 mr-2" />
                      Retrain Model
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityAnalytics;
