/**
 * Threat Intelligence Dashboard Widget
 * Comprehensive threat intelligence overview with real-time feeds,
 * IOC management, threat actor tracking, and MITRE ATT&CK mapping
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  Shield, AlertTriangle, Activity, Database, Globe, Users, 
  Search, Filter, Download, RefreshCw, Eye, Brain, Target,
  Network, Lock, Zap, Clock, TrendingUp, Map
} from 'lucide-react';
import { threatIntelligenceEngine } from '../../services/ThreatIntelligenceEngine';

const ThreatIntelligenceDashboardWidget = ({ className = "" }) => {
  const [threatLandscape, setThreatLandscape] = useState(null);
  const [indicators, setIndicators] = useState([]);
  const [threatActors, setThreatActors] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [huntingRules, setHuntingRules] = useState([]);
  const [mitreData, setMitreData] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    initializeThreatIntel();
    const interval = setInterval(fetchThreatData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const initializeThreatIntel = async () => {
    try {
      if (!threatIntelligenceEngine.isRunning) {
        await threatIntelligenceEngine.initialize();
      }
      fetchThreatData();
    } catch (error) {
      console.error('Failed to initialize threat intelligence:', error);
    }
  };

  const fetchThreatData = async () => {
    try {
      setRefreshing(true);
      
      const [landscape, iocs, actors, activeCapmaigns, rules, mitre] = await Promise.all([
        threatIntelligenceEngine.getThreatLandscape(),
        threatIntelligenceEngine.getIndicators({ limit: 100 }),
        threatIntelligenceEngine.getThreatActors(),
        threatIntelligenceEngine.getCampaigns(),
        threatIntelligenceEngine.getHuntingRules(),
        threatIntelligenceEngine.getMITRECoverage()
      ]);

      setThreatLandscape(landscape);
      setIndicators(iocs);
      setThreatActors(actors);
      setCampaigns(activeCapmaigns);
      setHuntingRules(rules);
      setMitreData(mitre);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch threat data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getThreatLevelColor = (level) => {
    switch (level) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getThreatLevelBadge = (level) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'high': return 'warning';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const formatConfidence = (confidence) => {
    return `${(confidence * 100).toFixed(1)}%`;
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Prepare chart data
  const feedStatusData = threatLandscape?.feeds?.map(feed => ({
    name: feed.name.replace(/Threat|Intelligence|Feed/g, '').trim(),
    indicators: feed.metrics?.totalIndicators || 0,
    confidence: (feed.confidence * 100).toFixed(1),
    status: feed.status === 'active' ? 100 : 0
  })) || [];

  const actorRiskData = threatActors.slice(0, 8).map(actor => ({
    name: actor.name.replace(/APT|Group/g, '').trim(),
    risk: (actor.riskScore * 100).toFixed(1),
    sophistication: actor.sophistication === 'high' ? 90 : actor.sophistication === 'medium-high' ? 75 : 60
  }));

  const indicatorTypeData = indicators.reduce((acc, ioc) => {
    acc[ioc.type] = (acc[ioc.type] || 0) + 1;
    return acc;
  }, {});

  const indicatorPieData = Object.entries(indicatorTypeData).map(([type, count]) => ({
    name: type.toUpperCase(),
    value: count
  }));

  const mitreHeatmapData = Object.entries(mitreData).map(([tacticId, tactic]) => ({
    tactic: tactic.name,
    coverage: tactic.huntingRules || 0,
    detection: (tactic.detectionRate * 100).toFixed(1),
    prevalence: (tactic.prevalence * 100).toFixed(1)
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

  if (!threatLandscape) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Threat Intelligence Dashboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Threat Intelligence Platform</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchThreatData}
              disabled={refreshing}
            >
              {refreshing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="feeds">Threat Feeds</TabsTrigger>
            <TabsTrigger value="indicators">IOCs</TabsTrigger>
            <TabsTrigger value="actors">Threat Actors</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="hunting">Hunting</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total IOCs</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {threatLandscape.totalIndicators?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <Database className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Feeds</p>
                      <p className="text-2xl font-bold text-green-600">
                        {threatLandscape.feeds?.filter(f => f.status === 'active').length || 0}
                      </p>
                    </div>
                    <Globe className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Threat Actors</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {threatLandscape.activeActors || 0}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                      <p className="text-2xl font-bold text-red-600">
                        {threatLandscape.activeCampaigns || 0}
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* IOC Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="w-4 h-4" />
                    <span>IOC Type Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={indicatorPieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {indicatorPieData.map((entry, index) => (
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
                  <CardTitle>MITRE ATT&CK Coverage</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={mitreHeatmapData.slice(0, 6)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="tactic" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="coverage" fill="#3b82f6" name="Hunting Rules" />
                      <Bar dataKey="detection" fill="#10b981" name="Detection Rate %" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Top Threat Actors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Top Threat Actors by Risk</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {threatActors.slice(0, 5).map((actor, index) => (
                    <div key={actor.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{index + 1}</Badge>
                        <div>
                          <p className="font-medium">{actor.name}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>{actor.attribution}</span>
                            <Badge variant="secondary" className="text-xs">
                              {actor.sophistication}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={getThreatLevelBadge(actor.threat_level)}>
                          Risk: {formatConfidence(actor.riskScore)}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          Last seen: {formatTimeAgo(actor.lastActivity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Threat Feeds Tab */}
          <TabsContent value="feeds" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Feed Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={feedStatusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="indicators" fill="#3b82f6" name="Indicators" />
                    <Bar dataKey="confidence" fill="#10b981" name="Confidence %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {threatLandscape.feeds?.map((feed) => (
                <Card key={feed.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{feed.name}</CardTitle>
                      <Badge variant={feed.status === 'active' ? 'success' : 'destructive'}>
                        {feed.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Total Indicators:</span>
                        <span className="text-sm font-bold">
                          {feed.metrics?.totalIndicators?.toLocaleString() || 0}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Confidence:</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={feed.confidence * 100} className="w-20" />
                          <span className="text-sm">{formatConfidence(feed.confidence)}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Priority:</span>
                        <Badge variant={getThreatLevelBadge(feed.priority)}>
                          {feed.priority}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Update Interval:</span>
                        <span className="text-sm">{Math.floor(feed.updateInterval / 60)} min</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Last Update:</span>
                        <span className="text-sm">{formatTimeAgo(feed.lastUpdate)}</span>
                      </div>
                      
                      <div className="pt-2 border-t">
                        <p className="text-xs text-gray-600">Categories:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {feed.categories?.map((category) => (
                            <Badge key={category} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* IOCs Tab */}
          <TabsContent value="indicators" className="space-y-4">
            {/* Search and Filter */}
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Search indicators..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="hash">Hashes</SelectItem>
                  <SelectItem value="domain">Domains</SelectItem>
                  <SelectItem value="ip">IP Addresses</SelectItem>
                  <SelectItem value="url">URLs</SelectItem>
                  <SelectItem value="email">Email Addresses</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* IOC List */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Indicators of Compromise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {indicators
                    .filter(ioc => 
                      (selectedFilter === 'all' || ioc.type === selectedFilter) &&
                      (searchTerm === '' || ioc.value.toLowerCase().includes(searchTerm.toLowerCase()))
                    )
                    .slice(0, 50)
                    .map((ioc) => (
                    <div key={ioc.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="text-xs">
                          {ioc.type.toUpperCase()}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-sm truncate">{ioc.value}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            {ioc.tags?.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <Badge variant={ioc.malicious ? 'destructive' : 'success'}>
                            {ioc.malicious ? 'Malicious' : 'Benign'}
                          </Badge>
                          <span className="text-sm font-medium">
                            {formatConfidence(ioc.threatScore)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {formatTimeAgo(ioc.firstSeen)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Threat Actors Tab */}
          <TabsContent value="actors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Threat Actor Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={actorRiskData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="risk" name="Risk Score" unit="%" />
                    <YAxis dataKey="sophistication" name="Sophistication" unit="%" />
                    <Tooltip 
                      formatter={(value, name) => [`${value}%`, name === 'risk' ? 'Risk Score' : 'Sophistication']}
                    />
                    <Scatter name="Threat Actors" dataKey="sophistication" fill="#ef4444" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {threatActors.slice(0, 6).map((actor) => (
                <Card key={actor.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{actor.name}</CardTitle>
                      <Badge variant={getThreatLevelBadge(actor.threat_level)}>
                        {actor.threat_level}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Attribution:</span>
                        <span className="text-sm">{actor.attribution}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Risk Score:</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={actor.riskScore * 100} className="w-20" />
                          <span className="text-sm">{formatConfidence(actor.riskScore)}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Sophistication:</span>
                        <Badge variant="secondary">{actor.sophistication}</Badge>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Last Activity:</span>
                        <span className="text-sm">{formatTimeAgo(actor.lastActivity)}</span>
                      </div>
                      
                      <div className="pt-2 border-t">
                        <p className="text-sm font-medium mb-2">Primary Targets:</p>
                        <div className="flex flex-wrap gap-1">
                          {actor.targetSectors?.slice(0, 3).map((sector) => (
                            <Badge key={sector} variant="outline" className="text-xs">
                              {sector}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t">
                        <p className="text-sm font-medium mb-2">Known Campaigns:</p>
                        <div className="text-xs text-gray-600">
                          {actor.campaigns?.slice(0, 2).join(', ')}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-4">
            <div className="space-y-4">
              {campaigns.slice(0, 8).map((campaign) => (
                <Card key={campaign.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{campaign.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getThreatLevelBadge(campaign.impact)}>
                          {campaign.impact}
                        </Badge>
                        <Badge variant={campaign.status === 'ongoing' ? 'destructive' : 'outline'}>
                          {campaign.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Associated Actor:</span>
                          <span className="text-sm font-bold">{campaign.actor?.toUpperCase()}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Start Date:</span>
                          <span className="text-sm">{new Date(campaign.startDate).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Victims:</span>
                          <span className="text-sm font-bold text-red-600">{campaign.victims?.toLocaleString()}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Confidence:</span>
                          <span className="text-sm">{formatConfidence(campaign.confidence)}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-2">Target Sectors:</p>
                          <div className="flex flex-wrap gap-1">
                            {campaign.sectors?.map((sector) => (
                              <Badge key={sector} variant="outline" className="text-xs">
                                {sector}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium mb-2">Geographic Scope:</p>
                          <div className="flex flex-wrap gap-1">
                            {campaign.regions?.map((region) => (
                              <Badge key={region} variant="secondary" className="text-xs">
                                {region.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium mb-2">MITRE Techniques:</p>
                          <div className="flex flex-wrap gap-1">
                            {campaign.techniques?.slice(0, 4).map((technique) => (
                              <Badge key={technique} variant="outline" className="text-xs font-mono">
                                {technique}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Hunting Tab */}
          <TabsContent value="hunting" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm font-medium text-gray-600">Active Rules</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {huntingRules.length}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm font-medium text-gray-600">Avg Effectiveness</p>
                  <p className="text-2xl font-bold text-green-600">
                    {huntingRules.length > 0 
                      ? formatConfidence(huntingRules.reduce((sum, rule) => sum + rule.effectiveness, 0) / huntingRules.length)
                      : '0%'
                    }
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {huntingRules.reduce((sum, rule) => sum + rule.alertsGenerated, 0).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Hunting Rule Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {huntingRules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <Badge variant={getThreatLevelBadge(rule.severity)}>
                          {rule.severity}
                        </Badge>
                        <div>
                          <p className="font-medium">{rule.name}</p>
                          <p className="text-sm text-gray-600">{rule.description}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {rule.category.replace('_', ' ')}
                            </Badge>
                            {rule.mitreTechniques?.slice(0, 2).map((technique) => (
                              <Badge key={technique} variant="secondary" className="text-xs font-mono">
                                {technique}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <div className="text-sm">
                            <span className="font-medium text-green-600">{rule.truePositives}</span>
                            <span className="text-gray-500"> / </span>
                            <span className="font-medium text-red-600">{rule.falsePositives}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Progress value={rule.effectiveness * 100} className="w-20" />
                          <span className="text-sm">{formatConfidence(rule.effectiveness)}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {rule.executionCount} executions
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ThreatIntelligenceDashboardWidget;
