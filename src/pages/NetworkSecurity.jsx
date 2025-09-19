import React, { useState, useEffect } from 'react';
import { 
  Network, 
  Shield, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Router,
  Wifi,
  Globe,
  Lock,
  Zap,
  TrendingUp,
  Eye,
  Clock,
  Settings,
  RefreshCcw,
  Download,
  Filter,
  Search,
  Plus,
  MoreVertical,
  ArrowRight,
  Bell,
  Target,
  Users,
  Database
} from 'lucide-react';
import networkIntegrationEngine from '../services/NetworkIntegrationEngine';
import { NetworkDevice, NetworkPolicy } from '../api/entities';
import NetworkTopology from '../components/network/NetworkTopology';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock data for network devices and analysis
const mockNetworkData = {
  totalDevices: 47,
  activeDevices: 45,
  criticalAlerts: 8,
  firewallRules: 342,
  unusedRules: 23,
  securityScore: 87,
  bandwidthUtilization: 68,
  threatBlocks: 1247
};

const networkDevices = [
  { id: 1, name: "Palo Alto PA-220", type: "Firewall", vendor: "Palo Alto", ip: "192.168.1.1", status: "active", health: 98, lastSeen: "2 min ago", alerts: 2 },
  { id: 2, name: "UniFi Dream Machine", type: "Router", vendor: "Ubiquiti", ip: "192.168.1.10", status: "active", health: 95, lastSeen: "1 min ago", alerts: 0 },
  { id: 3, name: "Meraki MX84", type: "Security Appliance", vendor: "Cisco Meraki", ip: "192.168.1.5", status: "active", health: 92, lastSeen: "3 min ago", alerts: 1 },
  { id: 4, name: "FortiGate 60F", type: "Firewall", vendor: "Fortinet", ip: "192.168.1.20", status: "active", health: 89, lastSeen: "5 min ago", alerts: 3 },
  { id: 5, name: "Cloudflare Tunnel", type: "Zero Trust", vendor: "Cloudflare", ip: "N/A", status: "active", health: 97, lastSeen: "1 min ago", alerts: 0 },
  { id: 6, name: "Zscaler ZPA", type: "ZTNA", vendor: "Zscaler", ip: "N/A", status: "active", health: 94, lastSeen: "2 min ago", alerts: 1 }
];

const firewallRules = [
  { id: 1, name: "Allow HTTP/HTTPS", source: "Any", destination: "Web Servers", action: "Allow", hits: 15420, lastHit: "2 min ago", recommendation: "critical", priority: "high" },
  { id: 2, name: "Block P2P Traffic", source: "Internal", destination: "Any", action: "Deny", hits: 0, lastHit: "Never", recommendation: "remove", priority: "low" },
  { id: 3, name: "Allow SSH Admin", source: "Admin Network", destination: "Servers", action: "Allow", hits: 156, lastHit: "1 hour ago", recommendation: "optimize", priority: "medium" },
  { id: 4, name: "Legacy FTP Rule", source: "Any", destination: "FTP Server", action: "Allow", hits: 2, lastHit: "30 days ago", recommendation: "remove", priority: "low" },
  { id: 5, name: "DNS Resolution", source: "Internal", destination: "DNS Servers", action: "Allow", hits: 8942, lastHit: "1 min ago", recommendation: "critical", priority: "high" }
];

const aiRecommendations = [
  {
    id: 1,
    type: "Security Optimization",
    title: "Remove 23 unused firewall rules",
    description: "23 firewall rules have had zero hits in the last 90 days and can be safely removed to improve performance.",
    impact: "High",
    confidence: 95,
    category: "rule-cleanup"
  },
  {
    id: 2,
    type: "Performance Enhancement",
    title: "Optimize DNS rule positioning",
    description: "Move high-traffic DNS rules to the top of the rule base to reduce processing latency by ~15ms.",
    impact: "Medium",
    confidence: 87,
    category: "performance"
  },
  {
    id: 3,
    type: "Security Gap",
    title: "Missing DLP rules for sensitive data",
    description: "No data loss prevention rules detected for financial and PII data leaving the network.",
    impact: "Critical",
    confidence: 92,
    category: "security-gap"
  },
  {
    id: 4,
    type: "Compliance Issue",
    title: "Legacy protocols still allowed",
    description: "FTP and Telnet protocols are still permitted, violating security compliance requirements.",
    impact: "High",
    confidence: 98,
    category: "compliance"
  }
];

const networkIntegrations = [
  { name: "Palo Alto", status: "connected", devices: 3, lastSync: "2 min ago", health: 98 },
  { name: "Cisco Meraki", status: "connected", devices: 8, lastSync: "1 min ago", health: 95 },
  { name: "Fortinet FortiGate", status: "connected", devices: 2, lastSync: "3 min ago", health: 92 },
  { name: "Ubiquiti UniFi", status: "connected", devices: 12, lastSync: "1 min ago", health: 97 },
  { name: "Cloudflare Zero Trust", status: "connected", devices: 1, lastSync: "30 sec ago", health: 99 },
  { name: "Zscaler ZTNA", status: "connected", devices: 1, lastSync: "1 min ago", health: 94 },
  { name: "Netskope", status: "disconnected", devices: 0, lastSync: "Never", health: 0 }
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

const DeviceStatusBadge = ({ status }) => {
  const colors = {
    active: "bg-green-100 text-green-800 border-green-200",
    inactive: "bg-red-100 text-red-800 border-red-200",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-200"
  };
  
  return (
    <Badge variant="outline" className={`${colors[status]} text-xs`}>
      {status.toUpperCase()}
    </Badge>
  );
};

const RecommendationBadge = ({ recommendation }) => {
  const colors = {
    critical: "bg-red-600 text-white",
    remove: "bg-orange-600 text-white",
    optimize: "bg-blue-600 text-white",
    "security-gap": "bg-purple-600 text-white",
    compliance: "bg-yellow-600 text-black"
  };
  
  return (
    <Badge className={`${colors[recommendation]} text-xs font-medium`}>
      {recommendation.replace('-', ' ').toUpperCase()}
    </Badge>
  );
};

export default function NetworkSecurity() {
  const [activeTab, setActiveTab] = useState('overview');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [ruleFilter, setRuleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [networkData, setNetworkData] = useState(mockNetworkData);
  const [realTimeData, setRealTimeData] = useState({
    devices: [],
    rules: [],
    metrics: {},
    integrations: []
  });

  // Enhanced state for real integrations
  const [integrationsStatus, setIntegrationsStatus] = useState([]);
  const [firewallAnalysis, setFirewallAnalysis] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  useEffect(() => {
    initializeNetworkData();
    
    // Set up real-time updates
    const updateInterval = setInterval(() => {
      fetchRealTimeUpdates();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(updateInterval);
  }, []);

  const initializeNetworkData = async () => {
    setIsLoading(true);
    try {
      // Initialize default integrations for demo
      await initializeDefaultIntegrations();
      
      // Fetch current data
      await fetchRealTimeUpdates();
      
      // Start periodic sync
      networkIntegrationEngine.startPeriodicSync(5); // Sync every 5 minutes
      
    } catch (error) {
      console.error('Failed to initialize network data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeDefaultIntegrations = async () => {
    const defaultConfigs = [
      {
        platform: 'palo-alto',
        config: {
          baseUrl: 'https://demo.paloaltonetworks.com',
          apiKey: 'demo_key_pa',
          username: 'demo',
          password: 'demo123'
        }
      },
      {
        platform: 'cisco-meraki',
        config: {
          baseUrl: 'https://api.meraki.com',
          apiKey: 'demo_key_meraki'
        }
      },
      {
        platform: 'fortinet',
        config: {
          baseUrl: 'https://demo.fortinet.com',
          apiKey: 'demo_key_fortinet'
        }
      },
      {
        platform: 'ubiquiti',
        config: {
          baseUrl: 'https://demo.ubnt.com',
          apiKey: 'demo_key_ubnt'
        }
      },
      {
        platform: 'cloudflare',
        config: {
          baseUrl: 'https://api.cloudflare.com',
          apiKey: 'demo_key_cf',
          email: 'demo@company.com'
        }
      },
      {
        platform: 'zscaler',
        config: {
          baseUrl: 'https://demo.zscaler.com',
          username: 'demo',
          password: 'demo123'
        }
      }
    ];

    for (const config of defaultConfigs) {
      try {
        await networkIntegrationEngine.addIntegration(config.platform, config.config);
        console.log(`✅ Added ${config.platform} integration`);
      } catch (error) {
        console.log(`⚠️ Failed to add ${config.platform} integration:`, error.message);
      }
    }
  };

  const fetchRealTimeUpdates = async () => {
    try {
      // Get integrations status
      const integrations = networkIntegrationEngine.getIntegrationsStatus();
      setIntegrationsStatus(Object.entries(integrations).map(([platform, status]) => ({
        name: status.name,
        platform,
        status: status.status,
        devices: status.deviceCount,
        lastSync: status.lastSync ? formatTimeAgo(status.lastSync) : 'Never',
        health: status.status === 'connected' ? Math.floor(Math.random() * 20) + 80 : 0
      })));

      // Get aggregated metrics
      const metrics = networkIntegrationEngine.getAggregatedMetrics();
      setNetworkData(prev => ({
        ...prev,
        totalDevices: metrics.totalDevices,
        activeDevices: metrics.totalActiveDevices,
        firewallRules: metrics.totalRules,
        threatBlocks: metrics.totalThreatsBlocked
      }));

      // Get firewall analysis
      const analysis = networkIntegrationEngine.analyzeFirewallRules();
      setFirewallAnalysis(analysis);
      
      setLastSyncTime(new Date());

    } catch (error) {
      console.error('Failed to fetch real-time updates:', error);
    }
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return `${seconds} sec ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hour ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  const handleSyncIntegration = async (platform) => {
    try {
      setIsLoading(true);
      await networkIntegrationEngine.syncPlatformData(platform);
      await fetchRealTimeUpdates();
      console.log(`✅ Synced ${platform} successfully`);
    } catch (error) {
      console.error(`❌ Failed to sync ${platform}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddIntegration = () => {
    // This would open a modal to add new integrations
    console.log('Opening integration setup modal...');
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const filteredDevices = networkDevices.filter(device => {
    const matchesVendor = selectedVendor === "all" || device.vendor.toLowerCase().includes(selectedVendor.toLowerCase());
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         device.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesVendor && matchesSearch;
  });

  const filteredRules = firewallRules.filter(rule => 
    rule.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6 max-w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Network Security</h1>
          <p className="text-slate-400 mt-1">Comprehensive network device management and firewall optimization</p>
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
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Device
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SecurityMetricCard
          title="Network Devices"
          value={`${mockNetworkData.activeDevices}/${mockNetworkData.totalDevices}`}
          icon={Router}
          trend="up"
          trendValue="+2"
          color="blue"
        />
        <SecurityMetricCard
          title="Security Score"
          value={`${mockNetworkData.securityScore}/100`}
          icon={Shield}
          trend="up"
          trendValue="+5.2%"
          color="green"
        />
        <SecurityMetricCard
          title="Active Alerts"
          value={mockNetworkData.criticalAlerts}
          icon={AlertTriangle}
          trend="down"
          trendValue="-3"
          color="red"
        />
        <SecurityMetricCard
          title="Firewall Rules"
          value={mockNetworkData.firewallRules}
          icon={Settings}
          trend="down"
          trendValue="-23"
          color="purple"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="devices" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-slate-800 border-slate-700">
          <TabsTrigger value="devices" className="text-white data-[state=active]:bg-slate-700">
            Network Devices
          </TabsTrigger>
          <TabsTrigger value="firewall" className="text-white data-[state=active]:bg-slate-700">
            Firewall Analysis
          </TabsTrigger>
          <TabsTrigger value="topology" className="text-white data-[state=active]:bg-slate-700">
            Network Topology
          </TabsTrigger>
          <TabsTrigger value="integrations" className="text-white data-[state=active]:bg-slate-700">
            Integrations
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="text-white data-[state=active]:bg-slate-700">
            AI Recommendations
          </TabsTrigger>
        </TabsList>

        {/* Network Devices Tab */}
        <TabsContent value="devices" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search devices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700 text-white w-full sm:w-80"
                />
              </div>
              <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Vendor" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Vendors</SelectItem>
                  <SelectItem value="palo alto">Palo Alto</SelectItem>
                  <SelectItem value="cisco">Cisco Meraki</SelectItem>
                  <SelectItem value="fortinet">Fortinet</SelectItem>
                  <SelectItem value="ubiquiti">Ubiquiti</SelectItem>
                  <SelectItem value="cloudflare">Cloudflare</SelectItem>
                  <SelectItem value="zscaler">Zscaler</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Router className="w-5 h-5 mr-2" />
                Network Device Inventory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredDevices.map((device) => (
                  <div key={device.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Router className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{device.name}</h4>
                        <p className="text-slate-400 text-sm">{device.vendor} • {device.type}</p>
                        <p className="text-slate-500 text-xs">{device.ip}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-white font-semibold">{device.health}%</p>
                        <p className="text-slate-400 text-xs">Health</p>
                      </div>
                      <div className="text-right">
                        <DeviceStatusBadge status={device.status} />
                        <p className="text-slate-400 text-xs mt-1">{device.lastSeen}</p>
                      </div>
                      {device.alerts > 0 && (
                        <div className="flex items-center">
                          <Bell className="w-4 h-4 text-red-400 mr-1" />
                          <span className="text-red-400 text-sm">{device.alerts}</span>
                        </div>
                      )}
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Firewall Analysis Tab */}
        <TabsContent value="firewall" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Rule Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Total Rules</span>
                    <span className="text-white font-semibold">{mockNetworkData.firewallRules}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Unused Rules</span>
                    <span className="text-orange-400 font-semibold">{mockNetworkData.unusedRules}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Optimization Potential</span>
                    <span className="text-blue-400 font-semibold">15%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Threat Blocking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Threats Blocked</span>
                    <span className="text-green-400 font-semibold">{mockNetworkData.threatBlocks.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Block Rate</span>
                    <span className="text-green-400 font-semibold">99.7%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">False Positives</span>
                    <span className="text-yellow-400 font-semibold">0.3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Bandwidth Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Current Usage</span>
                      <span className="text-white font-semibold">{mockNetworkData.bandwidthUtilization}%</span>
                    </div>
                    <Progress value={mockNetworkData.bandwidthUtilization} className="h-2" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Peak Today</span>
                    <span className="text-white font-semibold">87%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Average</span>
                    <span className="text-white font-semibold">62%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Firewall Rule Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRules.map((rule) => (
                  <div key={rule.id} className="border-l-2 border-slate-600 pl-4 py-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-white font-medium text-sm">{rule.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-slate-400 text-xs">{rule.source} → {rule.destination}</span>
                          <span className="text-slate-400 text-xs">•</span>
                          <span className="text-slate-400 text-xs">{rule.action}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-slate-400 text-xs">Hits: {rule.hits.toLocaleString()}</span>
                          <span className="text-slate-400 text-xs">•</span>
                          <span className="text-slate-400 text-xs">Last: {rule.lastHit}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <RecommendationBadge recommendation={rule.recommendation} />
                        <p className="text-slate-400 text-xs mt-1">{rule.priority} priority</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Network Topology Tab */}
        <TabsContent value="topology" className="space-y-6">
          <NetworkTopology 
            networkData={realTimeData}
            onDeviceClick={(device) => {
              console.log('Device clicked:', device);
              // Could open device details modal or navigate to device page
            }}
          />
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-white text-lg font-semibold">Network Platform Integrations</h3>
              <p className="text-slate-400 text-sm">
                {lastSyncTime ? `Last updated: ${formatTimeAgo(lastSyncTime)}` : 'Never synced'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={fetchRealTimeUpdates} 
                variant="outline" 
                disabled={isLoading}
                className="border-slate-600"
              >
                <RefreshCcw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Sync All
              </Button>
              <Button onClick={handleAddIntegration} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Integration
              </Button>
            </div>
          </div>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Network className="w-5 h-5 mr-2" />
                Connected Platforms ({integrationsStatus.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {integrationsStatus.map((integration, index) => (
                  <div key={index} className="bg-slate-700/30 rounded-lg p-4 hover:bg-slate-700/50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-white font-medium flex items-center">
                          {integration.name}
                          {integration.status === 'connected' && (
                            <CheckCircle className="w-4 h-4 ml-2 text-green-400" />
                          )}
                          {integration.status === 'error' && (
                            <XCircle className="w-4 h-4 ml-2 text-red-400" />
                          )}
                        </h4>
                        <p className="text-slate-400 text-sm">{integration.devices} devices</p>
                      </div>
                      <div className="text-right">
                        <DeviceStatusBadge status={integration.status} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Health</span>
                        <span className={`font-semibold ${
                          integration.health > 80 ? 'text-green-400' : 
                          integration.health > 60 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {integration.health}%
                        </span>
                      </div>
                      <Progress 
                        value={integration.health} 
                        className={`h-2 ${
                          integration.health > 80 ? '[&>div]:bg-green-500' : 
                          integration.health > 60 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-red-500'
                        }`} 
                      />
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Last Sync: {integration.lastSync}</span>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleSyncIntegration(integration.platform)}
                          disabled={isLoading}
                          className="text-blue-400 hover:text-blue-300 p-1 h-auto"
                        >
                          <RefreshCcw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Add new integration card */}
                <div 
                  onClick={handleAddIntegration}
                  className="bg-slate-700/20 border-2 border-dashed border-slate-600 rounded-lg p-4 hover:border-blue-500 hover:bg-slate-700/30 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[140px]"
                >
                  <Plus className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-slate-400 text-sm font-medium">Add Integration</span>
                  <span className="text-slate-500 text-xs mt-1">Connect new platform</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Integration Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Connected Platforms</p>
                    <p className="text-2xl font-bold text-white">{integrationsStatus.filter(i => i.status === 'connected').length}</p>
                  </div>
                  <Network className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Devices</p>
                    <p className="text-2xl font-bold text-white">{integrationsStatus.reduce((sum, i) => sum + i.devices, 0)}</p>
                  </div>
                  <Router className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Average Health</p>
                    <p className="text-2xl font-bold text-white">
                      {integrationsStatus.length > 0 
                        ? Math.round(integrationsStatus.reduce((sum, i) => sum + i.health, 0) / integrationsStatus.length)
                        : 0}%
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Sync Status</p>
                    <p className="text-2xl font-bold text-green-400">
                      {integrationsStatus.filter(i => i.status === 'connected').length > 0 ? 'Active' : 'Idle'}
                    </p>
                  </div>
                  <RefreshCcw className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-white text-lg font-semibold">AI-Powered Network Recommendations</h3>
              <p className="text-slate-400 text-sm">
                Automated analysis of {firewallAnalysis?.totalRules || 0} firewall rules across all platforms
              </p>
            </div>
            <Button 
              onClick={fetchRealTimeUpdates} 
              variant="outline" 
              disabled={isLoading}
              className="border-slate-600"
            >
              <Zap className="w-4 h-4 mr-2" />
              Refresh Analysis
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Rules</p>
                    <p className="text-2xl font-bold text-white">{firewallAnalysis?.totalRules || 0}</p>
                  </div>
                  <Settings className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Unused Rules</p>
                    <p className="text-2xl font-bold text-orange-400">{firewallAnalysis?.unusedRules?.length || 0}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Optimizations</p>
                    <p className="text-2xl font-bold text-green-400">{firewallAnalysis?.optimizationOpportunities?.length || 0}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Security Gaps</p>
                    <p className="text-2xl font-bold text-red-400">{firewallAnalysis?.securityGaps?.length || 0}</p>
                  </div>
                  <Shield className="w-8 h-8 text-red-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Optimization Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {firewallAnalysis?.optimizationOpportunities?.map((rec, index) => (
                  <div key={index} className="border-l-2 border-blue-500 pl-6 py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-white font-medium">{rec.title}</h4>
                          <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                            {rec.type}
                          </Badge>
                        </div>
                        <p className="text-slate-300 text-sm mb-3">{rec.description}</p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400 text-xs">Impact:</span>
                            <span className={`text-xs font-medium ${
                              rec.impact === 'High' ? 'text-red-400' : 
                              rec.impact === 'Medium' ? 'text-orange-400' : 'text-blue-400'
                            }`}>
                              {rec.impact}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400 text-xs">Confidence:</span>
                            <span className="text-green-400 text-xs font-medium">{rec.confidence}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <ArrowRight className="w-4 h-4 mr-1" />
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8">
                    <Zap className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-slate-400 text-lg font-medium mb-2">No Recommendations Yet</h3>
                    <p className="text-slate-500">
                      {integrationsStatus.length === 0 
                        ? 'Add network integrations to start receiving AI recommendations'
                        : 'Analyzing firewall rules... Check back in a few minutes'
                      }
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Security Gaps */}
          {firewallAnalysis?.securityGaps?.length > 0 && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Security Gap Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {firewallAnalysis.securityGaps.map((gap, index) => (
                    <div key={index} className="border-l-2 border-red-500 pl-6 py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-white font-medium">{gap.title}</h4>
                            <Badge variant="outline" className={`text-xs ${
                              gap.severity === 'High' ? 'bg-red-100 text-red-800 border-red-200' :
                              gap.severity === 'Medium' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                              'bg-yellow-100 text-yellow-800 border-yellow-200'
                            }`}>
                              {gap.severity}
                            </Badge>
                          </div>
                          <p className="text-slate-300 text-sm mb-2">{gap.description}</p>
                          <p className="text-slate-400 text-xs">
                            <strong>Recommendation:</strong> {gap.recommendation}
                          </p>
                        </div>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700">
                          <Shield className="w-4 h-4 mr-1" />
                          Fix Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
