import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  Users, 
  Server, 
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Zap,
  Target,
  BarChart3,
  PieChart,
  RefreshCcw,
  Download,
  Filter,
  Calendar,
  MapPin,
  Globe,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import SecurityDashboardErrorBoundary from '@/components/common/SecurityDashboardErrorBoundary';
import realTimeSecurityDashboard from '@/services/RealTimeSecurityDashboard';
import DashboardProvider, { useDashboardData } from '@/components/dashboard/DashboardProvider';
import { realTimeService } from '@/services/RealTimeDataService';

// Enhanced mock data with real-time integration
const initialMockData = {
  securityScore: 87,
  totalAssets: 1247,
  activethreats: 23,
  resolvedIssues: 156,
  criticalAlerts: 8,
  highAlerts: 15,
  mediumAlerts: 31,
  lowAlerts: 67,
  complianceScore: 94,
  lastScanTime: "2 hours ago",
  networkHealth: 96,
  endpointHealth: 89,
  cloudSecurity: 92
};

const recentFindings = [
  { id: 1, title: "Critical SQL Injection Vulnerability", severity: "critical", asset: "Web Server 01", time: "15 min ago", status: "open" },
  { id: 2, title: "Outdated SSL Certificate", severity: "high", asset: "API Gateway", time: "1 hour ago", status: "in-progress" },
  { id: 3, title: "Suspicious Login Activity", severity: "medium", asset: "User Portal", time: "2 hours ago", status: "investigating" },
  { id: 4, title: "Missing Security Patch", severity: "high", asset: "Database Server", time: "3 hours ago", status: "open" },
  { id: 5, title: "Weak Password Policy", severity: "medium", asset: "Admin Panel", time: "5 hours ago", status: "resolved" }
];

const complianceMetrics = [
  { framework: "SOC 2 Type II", score: 96, status: "compliant" },
  { framework: "ISO 27001", score: 94, status: "compliant" },
  { framework: "PCI DSS", score: 89, status: "partial" },
  { framework: "GDPR", score: 98, status: "compliant" },
  { framework: "HIPAA", score: 92, status: "compliant" }
];

const assetBreakdown = [
  { category: "Web Applications", count: 45, health: 92 },
  { category: "Databases", count: 12, health: 98 },
  { category: "API Endpoints", count: 78, health: 89 },
  { category: "Cloud Resources", count: 156, health: 94 },
  { category: "Network Devices", count: 34, health: 87 },
  { category: "User Endpoints", count: 922, health: 85 }
];

const SecurityMetricCard = ({ title, value, icon: Icon, trend, trendValue, color = "blue" }) => (
  <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className={`w-4 h-4 ${trend === 'up' ? 'text-green-500' : 'text-red-500'} mr-1`} />
              <span className={`text-sm ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-500/20`}>
          <Icon className={`w-6 h-6 text-${color}-400`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

const SeverityBadge = ({ severity }) => {
  const colors = {
    critical: "bg-red-600 text-white",
    high: "bg-orange-600 text-white", 
    medium: "bg-yellow-600 text-black",
    low: "bg-blue-600 text-white"
  };
  
  return (
    <Badge className={`${colors[severity]} text-xs font-medium`}>
      {severity.toUpperCase()}
    </Badge>
  );
};

const StatusBadge = ({ status }) => {
  const colors = {
    open: "bg-red-100 text-red-800 border-red-200",
    "in-progress": "bg-yellow-100 text-yellow-800 border-yellow-200",
    investigating: "bg-blue-100 text-blue-800 border-blue-200",
    resolved: "bg-green-100 text-green-800 border-green-200"
  };
  
  return (
    <Badge variant="outline" className={`${colors[status]} text-xs`}>
      {status.replace('-', ' ').toUpperCase()}
    </Badge>
  );
};

// Real-time Dashboard Component
function DashboardContent() {
  const { 
    dashboardData, 
    calculateRiskMetrics, 
    isConnected, 
    lastUpdated,
    generateMockData
  } = useDashboardData();
  
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('24h');
  const [mockData, setMockData] = useState(initialMockData);
  const [realTimeMetrics, setRealTimeMetrics] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  // Real-time data integration
  useEffect(() => {
    let subscriptionIds = [];

    // Subscribe to real-time security metrics
    const metricsSubscription = realTimeSecurityDashboard.subscribe('metricsUpdated', (metrics) => {
      console.log('Real-time metrics updated:', metrics);
      setRealTimeMetrics(metrics);
      
      // Update mock data with real-time values
      setMockData(prev => ({
        ...prev,
        lastUpdate: new Date().toISOString(),
        metrics: metrics
      }));
    });

    subscriptionIds.push(metricsSubscription);

    return () => {
      subscriptionIds.forEach(id => realTimeSecurityDashboard.unsubscribe(id));
    };
  }, []);

  // Update connection status based on real-time service
  useEffect(() => {
    setConnectionStatus(isConnected ? 'connected' : 'disconnected');
  }, [isConnected]);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  // Use real-time findings data
  const recentFindings = dashboardData.findings.slice(0, 5).map(finding => ({
    id: finding.id,
    title: finding.title || finding.description,
    severity: finding.severity,
    asset: `Asset ${finding.asset_id}`,
    time: formatTimeAgo(finding.created_date || finding.timestamp),
    status: finding.status || 'open'
  }));

  // Calculate metrics from real-time data
  const riskMetrics = calculateRiskMetrics;
  const currentData = {
    ...mockData,
    criticalAlerts: riskMetrics.criticalFindings,
    totalAssets: dashboardData.assets.length || mockData.totalAssets,
    activethreats: dashboardData.threats.length || mockData.activethreats,
    resolvedIssues: dashboardData.findings.filter(f => f.status === 'resolved').length || mockData.resolvedIssues,
    securityScore: Math.round(riskMetrics.averageRiskScore * 10) || mockData.securityScore,
    lastScanTime: lastUpdated ? formatTimeAgo(lastUpdated) : mockData.lastScanTime
  };

  return (
    <div className="space-y-6 p-6 max-w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">Security Dashboard</h1>
            <div className="flex items-center gap-2">
              {connectionStatus === 'connected' ? 
                <Wifi className="w-5 h-5 text-green-400" title="Real-time monitoring active" /> :
                <WifiOff className="w-5 h-5 text-red-400" title="Real-time monitoring offline" />
              }
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                connectionStatus === 'connected' ? 'bg-green-500/20 text-green-400' :
                connectionStatus === 'connecting' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' :
                  connectionStatus === 'connecting' ? 'bg-yellow-400' :
                  'bg-red-400'
                }`}></div>
                <span>{connectionStatus === 'connected' ? 'Live Data' : connectionStatus}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-slate-400">Real-time security monitoring and threat intelligence</p>
            {lastUpdated && (
              <span className="text-slate-500 text-sm">
                • Last updated: {formatTimeAgo(lastUpdated)}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCcw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <select 
            className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SecurityMetricCard
          title="Security Score"
          value={`${currentData.securityScore}/100`}
          icon={Shield}
          trend="up"
          trendValue={realTimeMetrics ? "+3.2%" : "+3.2%"}
          color="green"
        />
        <SecurityMetricCard
          title="Total Assets"
          value={currentData.totalAssets.toLocaleString()}
          icon={Server}
          trend="up"
          trendValue={realTimeMetrics ? "+12" : "+12"}
          color="blue"
        />
        <SecurityMetricCard
          title="Active Threats"
          value={currentData.activethreats}
          icon={AlertTriangle}
          trend="down"
          trendValue={realTimeMetrics ? "-5" : "-5"}
          color="red"
        />
        <SecurityMetricCard
          title="Issues Resolved"
          value={currentData.resolvedIssues}
          icon={CheckCircle}
          trend="up"
          trendValue={realTimeMetrics ? "+23" : "+23"}
          color="green"
        />
      </div>

      {/* Security Alerts Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Security Alerts by Severity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                  <span className="text-slate-300">Critical</span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={(currentData.criticalAlerts / 121) * 100} className="w-24" />
                  <span className="text-white font-semibold w-8">{currentData.criticalAlerts}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                  <span className="text-slate-300">High</span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={(currentData.highAlerts / 121) * 100} className="w-24" />
                  <span className="text-white font-semibold w-8">{currentData.highAlerts}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-slate-300">Medium</span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={(currentData.mediumAlerts / 121) * 100} className="w-24" />
                  <span className="text-white font-semibold w-8">{currentData.mediumAlerts}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-slate-300">Low</span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={(currentData.lowAlerts / 121) * 100} className="w-24" />
                  <span className="text-white font-semibold w-8">{currentData.lowAlerts}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Network</span>
                  <span className="text-white font-semibold">{mockData.networkHealth}%</span>
                </div>
                <Progress value={mockData.networkHealth} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Endpoints</span>
                  <span className="text-white font-semibold">{mockData.endpointHealth}%</span>
                </div>
                <Progress value={mockData.endpointHealth} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Cloud Security</span>
                  <span className="text-white font-semibold">{mockData.cloudSecurity}%</span>
                </div>
                <Progress value={mockData.cloudSecurity} className="h-2" />
              </div>
              <div className="pt-2 border-t border-slate-700">
                <div className="flex items-center text-sm text-slate-400">
                  <Clock className="w-4 h-4 mr-2" />
                  Last scan: {mockData.lastScanTime}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Findings and Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <div className="flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Recent Security Findings
              </div>
              <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentFindings.map((finding) => (
                <div key={finding.id} className="border-l-2 border-slate-600 pl-4 py-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-medium text-sm">{finding.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <SeverityBadge severity={finding.severity} />
                        <span className="text-slate-400 text-xs">•</span>
                        <span className="text-slate-400 text-xs">{finding.asset}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={finding.status} />
                      <p className="text-slate-400 text-xs mt-1">{finding.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Compliance Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complianceMetrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <span className="text-white font-medium">{metric.framework}</span>
                    <div className="flex items-center mt-1">
                      {metric.status === 'compliant' ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-500 mr-1" />
                      )}
                      <span className={`text-xs ${metric.status === 'compliant' ? 'text-green-400' : 'text-yellow-400'}`}>
                        {metric.status === 'compliant' ? 'Compliant' : 'Partial Compliance'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-semibold">{metric.score}%</span>
                    <Progress value={metric.score} className="w-16 h-2 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Asset Breakdown */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Asset Security Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assetBreakdown.map((asset, index) => (
              <div key={index} className="bg-slate-700/30 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-white font-medium">{asset.category}</h4>
                    <p className="text-slate-400 text-sm">{asset.count} assets</p>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-semibold">{asset.health}%</span>
                  </div>
                </div>
                <Progress value={asset.health} className="h-2" />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-slate-400">Security Health</span>
                  <span className={`text-xs ${asset.health >= 90 ? 'text-green-400' : asset.health >= 80 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {asset.health >= 90 ? 'Excellent' : asset.health >= 80 ? 'Good' : 'Needs Attention'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Button variant="outline" className="flex flex-col h-20 border-slate-600 hover:bg-slate-700">
              <Activity className="w-6 h-6 mb-2" />
              <span className="text-xs">Run Scan</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-20 border-slate-600 hover:bg-slate-700">
              <BarChart3 className="w-6 h-6 mb-2" />
              <span className="text-xs">View Reports</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-20 border-slate-600 hover:bg-slate-700">
              <Users className="w-6 h-6 mb-2" />
              <span className="text-xs">Manage Users</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-20 border-slate-600 hover:bg-slate-700">
              <Shield className="w-6 h-6 mb-2" />
              <span className="text-xs">Policies</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-20 border-slate-600 hover:bg-slate-700">
              <AlertTriangle className="w-6 h-6 mb-2" />
              <span className="text-xs">Incidents</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-20 border-slate-600 hover:bg-slate-700">
              <Globe className="w-6 h-6 mb-2" />
              <span className="text-xs">Threat Intel</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main Dashboard component with real-time provider
export default function Dashboard() {
  return (
    <SecurityDashboardErrorBoundary componentName="Main Security Dashboard">
      <DashboardProvider>
        <DashboardContent />
      </DashboardProvider>
    </SecurityDashboardErrorBoundary>
  );
}
