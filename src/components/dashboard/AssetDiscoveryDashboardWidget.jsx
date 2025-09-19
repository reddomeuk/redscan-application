/**
 * Asset Discovery Dashboard Widget
 * Comprehensive asset discovery and management interface with
 * intelligent classification, vulnerability mapping, and lifecycle tracking
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter
} from 'recharts';
import { 
  Search, Shield, Server, Monitor, Smartphone, Cloud, Wifi,
  Target, Eye, Play, Pause, RotateCcw, Download, Settings,
  AlertTriangle, CheckCircle2, Clock, Zap, Database, HardDrive,
  Globe, Lock, Users, Activity, TrendingUp, Filter
} from 'lucide-react';
import { assetDiscoveryEngine } from '../../services/AssetDiscoveryEngine';

const AssetDiscoveryDashboardWidget = ({ className = "" }) => {
  const [discoveredAssets, setDiscoveredAssets] = useState([]);
  const [discoveryJobs, setDiscoveryJobs] = useState([]);
  const [currentJob, setCurrentJob] = useState(null);
  const [showDiscoveryDialog, setShowDiscoveryDialog] = useState(false);
  const [showAssetDetail, setShowAssetDetail] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    criticality: 'all',
    status: 'all',
    discoveryMethod: 'all'
  });

  // Discovery form state
  const [discoveryConfig, setDiscoveryConfig] = useState({
    profile: 'comprehensive',
    targets: '',
    includeMethods: {
      network_scan: true,
      cloud_discovery: true,
      agent_discovery: true,
      passive_discovery: true,
      certificate_discovery: true
    }
  });

  useEffect(() => {
    fetchAssetData();
    fetchDiscoveryJobs();
    
    // Set up event listeners
    assetDiscoveryEngine.on('discovery_progress', handleDiscoveryProgress);
    assetDiscoveryEngine.on('discovery_completed', handleDiscoveryCompleted);
    assetDiscoveryEngine.on('asset_updated', handleAssetUpdated);

    return () => {
      assetDiscoveryEngine.removeAllListeners();
    };
  }, []);

  const fetchAssetData = async () => {
    try {
      setLoading(true);
      const assets = await assetDiscoveryEngine.getAssets();
      setDiscoveredAssets(assets);
    } catch (error) {
      console.error('Failed to fetch asset data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscoveryJobs = async () => {
    try {
      const jobs = await assetDiscoveryEngine.getDiscoveryJobs();
      setDiscoveryJobs(jobs);
      
      // Find current running job
      const runningJob = jobs.find(job => job.status === 'running');
      setCurrentJob(runningJob || null);
    } catch (error) {
      console.error('Failed to fetch discovery jobs:', error);
    }
  };

  const handleDiscoveryProgress = (data) => {
    setCurrentJob(prevJob => ({
      ...prevJob,
      progress: data.progress
    }));
  };

  const handleDiscoveryCompleted = (data) => {
    setCurrentJob(null);
    fetchAssetData();
    fetchDiscoveryJobs();
  };

  const handleAssetUpdated = (data) => {
    fetchAssetData();
  };

  const startDiscovery = async () => {
    try {
      setLoading(true);
      
      const targets = discoveryConfig.targets 
        ? discoveryConfig.targets.split('\n').filter(t => t.trim())
        : [];

      const result = await assetDiscoveryEngine.startDiscovery(
        discoveryConfig.profile,
        targets
      );

      setCurrentJob(await assetDiscoveryEngine.getDiscoveryJob(result.jobId));
      setShowDiscoveryDialog(false);
      
    } catch (error) {
      console.error('Failed to start discovery:', error);
    } finally {
      setLoading(false);
    }
  };

  const stopDiscovery = async () => {
    if (!currentJob) return;
    
    try {
      await assetDiscoveryEngine.stopDiscovery(currentJob.id);
      setCurrentJob(null);
      fetchDiscoveryJobs();
    } catch (error) {
      console.error('Failed to stop discovery:', error);
    }
  };

  const viewAssetDetails = (asset) => {
    setSelectedAsset(asset);
    setShowAssetDetail(true);
  };

  const getAssetIcon = (asset) => {
    if (asset.discoveryMethod === 'cloud_discovery') return <Cloud className="w-4 h-4" />;
    if (asset.classification?.type === 'database_server') return <Database className="w-4 h-4" />;
    if (asset.classification?.type === 'web_server') return <Globe className="w-4 h-4" />;
    if (asset.classification?.type === 'endpoint') return <Monitor className="w-4 h-4" />;
    if (asset.platform === 'mobile') return <Smartphone className="w-4 h-4" />;
    return <Server className="w-4 h-4" />;
  };

  const getCriticalityColor = (criticality) => {
    switch (criticality) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getCriticalityBadge = (criticality) => {
    switch (criticality) {
      case 'critical': return 'destructive';
      case 'high': return 'warning';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'outline';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'inactive': return 'text-gray-600';
      case 'unknown': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'Less than 1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  // Filter assets based on current filters
  const filteredAssets = discoveredAssets.filter(asset => {
    if (searchTerm && !asset.hostname?.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !asset.ip?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !asset.id?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    if (filters.type !== 'all' && asset.classification?.type !== filters.type) return false;
    if (filters.criticality !== 'all' && asset.classification?.criticality !== filters.criticality) return false;
    if (filters.status !== 'all' && asset.status !== filters.status) return false;
    if (filters.discoveryMethod !== 'all' && asset.discoveryMethod !== filters.discoveryMethod) return false;
    
    return true;
  });

  // Prepare chart data
  const assetTypeDistribution = discoveredAssets.reduce((acc, asset) => {
    const type = asset.classification?.type || 'unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const typeData = Object.entries(assetTypeDistribution).map(([type, count]) => ({
    name: type.replace('_', ' '),
    value: count
  }));

  const criticalityDistribution = discoveredAssets.reduce((acc, asset) => {
    const criticality = asset.classification?.criticality || 'unknown';
    acc[criticality] = (acc[criticality] || 0) + 1;
    return acc;
  }, {});

  const criticalityData = Object.entries(criticalityDistribution).map(([criticality, count]) => ({
    name: criticality,
    value: count
  }));

  const discoveryMethodData = discoveredAssets.reduce((acc, asset) => {
    const method = asset.discoveryMethod || 'unknown';
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {});

  const methodData = Object.entries(discoveryMethodData).map(([method, count]) => ({
    name: method.replace('_', ' '),
    value: count
  }));

  // Risk vs Asset Count scatter plot
  const riskScatterData = discoveredAssets.map(asset => ({
    x: asset.risk?.score || 0,
    y: asset.vulnerabilities?.length || 0,
    name: asset.hostname || asset.id,
    criticality: asset.classification?.criticality || 'unknown'
  }));

  // Discovery timeline
  const discoveryTimeline = discoveredAssets.slice(0, 10).map(asset => ({
    date: new Date(asset.lifecycle?.created).toLocaleDateString(),
    count: 1,
    type: asset.classification?.type || 'unknown'
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Asset Discovery & Management</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {filteredAssets.length} assets
            </Badge>
            {currentJob && (
              <Badge variant="secondary" className="animate-pulse">
                Discovering...
              </Badge>
            )}
            <Dialog open={showDiscoveryDialog} onOpenChange={setShowDiscoveryDialog}>
              <DialogTrigger asChild>
                <Button size="sm" disabled={!!currentJob}>
                  <Play className="w-4 h-4 mr-2" />
                  Start Discovery
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Configure Asset Discovery</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="discovery-profile">Discovery Profile</Label>
                    <Select value={discoveryConfig.profile} onValueChange={(value) => setDiscoveryConfig({...discoveryConfig, profile: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="comprehensive">Comprehensive Discovery</SelectItem>
                        <SelectItem value="quick">Quick Discovery</SelectItem>
                        <SelectItem value="cloud_focused">Cloud-focused Discovery</SelectItem>
                        <SelectItem value="continuous">Continuous Monitoring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="discovery-targets">Target Networks/IPs (one per line)</Label>
                    <Textarea
                      id="discovery-targets"
                      value={discoveryConfig.targets}
                      onChange={(e) => setDiscoveryConfig({...discoveryConfig, targets: e.target.value})}
                      placeholder="192.168.1.0/24&#10;10.0.0.0/24&#10;172.16.0.1"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label>Discovery Methods</Label>
                    <div className="space-y-2 mt-2">
                      {Object.entries(discoveryConfig.includeMethods).map(([method, enabled]) => (
                        <div key={method} className="flex items-center space-x-2">
                          <Checkbox
                            checked={enabled}
                            onCheckedChange={(checked) => setDiscoveryConfig({
                              ...discoveryConfig,
                              includeMethods: { ...discoveryConfig.includeMethods, [method]: checked }
                            })}
                          />
                          <Label className="text-sm">{method.replace('_', ' ')}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowDiscoveryDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={startDiscovery} disabled={loading}>
                      {loading ? 'Starting...' : 'Start Discovery'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            {currentJob && (
              <Button variant="outline" size="sm" onClick={stopDiscovery}>
                <Pause className="w-4 h-4 mr-2" />
                Stop
              </Button>
            )}
          </div>
        </div>
        
        {/* Discovery Progress */}
        {currentJob && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Discovery Progress</span>
              <span>{currentJob.progress}%</span>
            </div>
            <Progress value={currentJob.progress} className="w-full" />
            <div className="flex items-center space-x-4 text-xs text-gray-600">
              <span>Job: {currentJob.id}</span>
              <span>Profile: {currentJob.profile}</span>
              <span>Discovered: {currentJob.discoveredAssets}</span>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="discovery">Discovery Jobs</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
            <TabsTrigger value="lifecycle">Lifecycle</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Assets</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {discoveredAssets.length}
                      </p>
                    </div>
                    <Search className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Critical Assets</p>
                      <p className="text-2xl font-bold text-red-600">
                        {discoveredAssets.filter(a => a.classification?.criticality === 'critical').length}
                      </p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Vulnerabilities</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {discoveredAssets.reduce((sum, a) => sum + (a.vulnerabilities?.length || 0), 0)}
                      </p>
                    </div>
                    <Shield className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Discovery Jobs</p>
                      <p className="text-2xl font-bold text-green-600">
                        {discoveryJobs.length}
                      </p>
                    </div>
                    <Activity className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Asset Type Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={typeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {typeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Criticality Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={criticalityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Discoveries */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Asset Discoveries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {discoveredAssets.slice(0, 5).map((asset) => (
                    <div key={asset.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        {getAssetIcon(asset)}
                        <div>
                          <p className="font-medium">{asset.hostname || asset.id}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>{asset.ip || 'No IP'}</span>
                            <Badge variant="outline" className="text-xs">
                              {asset.classification?.type || 'Unknown'}
                            </Badge>
                            <Badge variant={getCriticalityBadge(asset.classification?.criticality)} className="text-xs">
                              {asset.classification?.criticality || 'unknown'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatTimeAgo(asset.lifecycle?.created)}</p>
                        <p className="text-xs text-gray-600">{asset.discoveryMethod}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assets Tab */}
          <TabsContent value="assets" className="space-y-4">
            {/* Search and Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="web_server">Web Servers</SelectItem>
                  <SelectItem value="database_server">Database Servers</SelectItem>
                  <SelectItem value="endpoint">Endpoints</SelectItem>
                  <SelectItem value="cloud_resource">Cloud Resources</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.criticality} onValueChange={(value) => setFilters({...filters, criticality: value})}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Criticality</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.discoveryMethod} onValueChange={(value) => setFilters({...filters, discoveryMethod: value})}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="network_scan">Network Scan</SelectItem>
                  <SelectItem value="cloud_discovery">Cloud Discovery</SelectItem>
                  <SelectItem value="agent_discovery">Agent Discovery</SelectItem>
                  <SelectItem value="passive_discovery">Passive Discovery</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Asset List */}
            <Card>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredAssets.map((asset) => (
                    <div key={asset.id} className="flex items-center space-x-3 p-3 border rounded hover:bg-gray-50">
                      <div className="flex items-center space-x-2">
                        {getAssetIcon(asset)}
                        <Badge variant="outline" className="text-xs">
                          {asset.classification?.type || 'Unknown'}
                        </Badge>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{asset.hostname || asset.id}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-gray-600">{asset.ip || 'No IP'}</span>
                          <Badge variant="secondary" className="text-xs">
                            {asset.discoveryMethod}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <Badge variant={getCriticalityBadge(asset.classification?.criticality)}>
                          {asset.classification?.criticality || 'unknown'}
                        </Badge>
                        <p className="text-xs text-gray-600 mt-1">
                          Risk: {asset.risk?.score || 0}
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <div className={`text-sm font-medium ${getStatusColor(asset.status)}`}>
                          {asset.status}
                        </div>
                        <p className="text-xs text-gray-600">
                          {asset.vulnerabilities?.length || 0} vulns
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm font-medium">
                          {formatTimeAgo(asset.lifecycle?.created)}
                        </p>
                        <p className="text-xs text-gray-600">
                          Last seen: {formatTimeAgo(asset.lifecycle?.lastSeen)}
                        </p>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewAssetDetails(asset)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Discovery Jobs Tab */}
          <TabsContent value="discovery" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Discovery Job History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {discoveryJobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{job.id}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span>Profile: {job.profile}</span>
                          <Badge variant="outline" className="text-xs">
                            {job.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">{job.discoveredAssets} assets</p>
                        <p className="text-xs text-gray-600">{job.progress}% complete</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatTimeAgo(job.startTime)}
                        </p>
                        {job.endTime && (
                          <p className="text-xs text-gray-600">
                            Duration: {Math.round((new Date(job.endTime) - new Date(job.startTime)) / 60000)}m
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Discovery Methods</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={methodData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {methodData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk vs Vulnerabilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <ScatterChart data={riskScatterData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="x" name="Risk Score" />
                      <YAxis dataKey="y" name="Vulnerabilities" />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                      <Scatter dataKey="y" fill="#3b82f6" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Discovery Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={discoveryTimeline}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Assets Discovered"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dependencies Tab */}
          <TabsContent value="dependencies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Asset Dependencies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {discoveredAssets.filter(a => a.dependencies?.services?.length > 0).slice(0, 10).map((asset) => (
                    <div key={asset.id} className="border rounded p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        {getAssetIcon(asset)}
                        <span className="font-medium">{asset.hostname || asset.id}</span>
                        <Badge variant="outline" className="text-xs">
                          {asset.dependencies.services.length} dependencies
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-600">Service Dependencies:</p>
                          {asset.dependencies.services.map((dep, idx) => (
                            <p key={idx} className="text-gray-600">
                              • {dep.target} ({dep.type})
                            </p>
                          ))}
                        </div>
                        <div>
                          <p className="font-medium text-gray-600">Application Dependencies:</p>
                          {asset.dependencies.applications?.map((dep, idx) => (
                            <p key={idx} className="text-gray-600">
                              • {dep.name} v{dep.version}
                            </p>
                          )) || <p className="text-gray-400">None</p>}
                        </div>
                        <div>
                          <p className="font-medium text-gray-600">Infrastructure Dependencies:</p>
                          {asset.dependencies.infrastructure?.map((dep, idx) => (
                            <p key={idx} className="text-gray-600">
                              • {dep.target} ({dep.type})
                            </p>
                          )) || <p className="text-gray-400">None</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lifecycle Tab */}
          <TabsContent value="lifecycle" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Asset Lifecycle Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {discoveredAssets.slice(0, 10).map((asset) => (
                    <div key={asset.id} className="border rounded p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getAssetIcon(asset)}
                          <span className="font-medium">{asset.hostname || asset.id}</span>
                        </div>
                        <Badge variant="outline">
                          {asset.lifecycle?.stage || 'unknown'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-600">Discovery:</p>
                          <p>Created: {new Date(asset.lifecycle?.created).toLocaleDateString()}</p>
                          <p>Source: {asset.lifecycle?.metadata?.discoverySource}</p>
                          <p>Confidence: {((asset.lifecycle?.metadata?.confidence || 0) * 100).toFixed(0)}%</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-600">Activity:</p>
                          <p>Last Seen: {new Date(asset.lifecycle?.lastSeen).toLocaleDateString()}</p>
                          <p>Last Updated: {new Date(asset.lifecycle?.lastUpdated).toLocaleDateString()}</p>
                          <p>Verified: {asset.lifecycle?.metadata?.verified ? 'Yes' : 'No'}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-600">Health:</p>
                          <p>Status: <span className={getStatusColor(asset.status)}>{asset.status}</span></p>
                          <p>Risk Score: {asset.risk?.score || 0}</p>
                          <p>Vulnerabilities: {asset.vulnerabilities?.length || 0}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Asset Detail Dialog */}
        <Dialog open={showAssetDetail} onOpenChange={setShowAssetDetail}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                {selectedAsset && getAssetIcon(selectedAsset)}
                <span>Asset Details</span>
                {selectedAsset && (
                  <Badge variant={getCriticalityBadge(selectedAsset.classification?.criticality)}>
                    {selectedAsset.classification?.criticality || 'unknown'}
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>
            
            {selectedAsset && (
              <div className="space-y-6">
                {/* Asset Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm font-medium text-gray-600">Asset ID</p>
                      <p className="font-mono text-sm">{selectedAsset.id}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm font-medium text-gray-600">Type</p>
                      <Badge variant="outline">
                        {selectedAsset.classification?.type || 'Unknown'}
                      </Badge>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm font-medium text-gray-600">Discovery Method</p>
                      <p className="text-sm">{selectedAsset.discoveryMethod}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Detailed Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Network Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium">Hostname:</p>
                          <p className="text-sm text-gray-600">{selectedAsset.hostname || 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">IP Address:</p>
                          <p className="text-sm text-gray-600">{selectedAsset.ip || 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">MAC Address:</p>
                          <p className="text-sm text-gray-600">{selectedAsset.mac || 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Operating System:</p>
                          <p className="text-sm text-gray-600">{selectedAsset.os || 'Unknown'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Security Assessment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium">Risk Score:</p>
                          <p className="text-sm font-bold">{selectedAsset.risk?.score || 0}/100</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Risk Level:</p>
                          <Badge variant={getCriticalityBadge(selectedAsset.risk?.level)}>
                            {selectedAsset.risk?.level || 'unknown'}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Vulnerabilities:</p>
                          <p className="text-sm text-gray-600">{selectedAsset.vulnerabilities?.length || 0} found</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Classification Confidence:</p>
                          <p className="text-sm text-gray-600">
                            {((selectedAsset.classification?.confidence || 0) * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Services and Ports */}
                {selectedAsset.services && selectedAsset.services.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Services and Ports</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedAsset.services.map((service, idx) => (
                          <div key={idx} className="border rounded p-3">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{service.name}</span>
                              <Badge variant="outline">{service.port || 'Unknown Port'}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Version: {service.version || 'Unknown'}
                            </p>
                            <p className="text-sm text-gray-600">
                              State: {service.state || 'Unknown'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Vulnerabilities */}
                {selectedAsset.vulnerabilities && selectedAsset.vulnerabilities.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Vulnerabilities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedAsset.vulnerabilities.slice(0, 5).map((vuln, idx) => (
                          <div key={idx} className="border rounded p-3">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{vuln.id || vuln.finding}</span>
                              <Badge variant={getCriticalityBadge(vuln.severity)}>
                                {vuln.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {vuln.description || vuln.recommendation}
                            </p>
                            {vuln.cvss && (
                              <p className="text-sm text-gray-600">
                                CVSS: {vuln.cvss}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AssetDiscoveryDashboardWidget;
