/**
 * Threat Actor Profiling Widget
 * Advanced threat actor analysis with behavioral patterns,
 * attribution tracking, and campaign correlation
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, Area, AreaChart
} from 'recharts';
import { 
  Users, Shield, Target, Activity, Brain, Clock, TrendingUp,
  Globe, Network, Zap, Eye, Search, Filter, Map, Flag,
  AlertTriangle, Award, Calendar, Building, Hash
} from 'lucide-react';
import { threatIntelligenceEngine } from '../../services/ThreatIntelligenceEngine';

const ThreatActorProfilingWidget = ({ className = "" }) => {
  const [threatActors, setThreatActors] = useState([]);
  const [selectedActor, setSelectedActor] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sophisticationFilter, setSophisticationFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [showActorDetail, setShowActorDetail] = useState(false);
  const [actorTimeline, setActorTimeline] = useState([]);
  const [relatedActors, setRelatedActors] = useState([]);

  useEffect(() => {
    fetchThreatActors();
    fetchCampaigns();
  }, []);

  const fetchThreatActors = async () => {
    try {
      setLoading(true);
      const actors = await threatIntelligenceEngine.getThreatActors();
      setThreatActors(actors);
    } catch (error) {
      console.error('Failed to fetch threat actors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const campaignData = await threatIntelligenceEngine.getCampaigns();
      setCampaigns(campaignData);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    }
  };

  const fetchActorDetails = async (actorId) => {
    try {
      setLoading(true);
      const [timeline, related] = await Promise.all([
        threatIntelligenceEngine.getActorTimeline(actorId),
        threatIntelligenceEngine.getRelatedActors(actorId)
      ]);
      setActorTimeline(timeline);
      setRelatedActors(related);
    } catch (error) {
      console.error('Failed to fetch actor details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActorSelect = async (actor) => {
    setSelectedActor(actor);
    await fetchActorDetails(actor.id);
    setShowActorDetail(true);
  };

  const getSophisticationColor = (level) => {
    switch (level) {
      case 'advanced': return 'text-red-600';
      case 'medium-high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getSophisticationBadge = (level) => {
    switch (level) {
      case 'advanced': return 'destructive';
      case 'medium-high': return 'warning';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
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
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  // Filter actors based on search and filters
  const filteredActors = threatActors.filter(actor => {
    const matchesSearch = searchTerm === '' || 
      actor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      actor.attribution.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSophistication = sophisticationFilter === 'all' || 
      actor.sophistication === sophisticationFilter;
    
    const matchesRegion = regionFilter === 'all' || 
      actor.origin === regionFilter;
    
    return matchesSearch && matchesSophistication && matchesRegion;
  });

  // Prepare chart data
  const sophisticationData = threatActors.reduce((acc, actor) => {
    acc[actor.sophistication] = (acc[actor.sophistication] || 0) + 1;
    return acc;
  }, {});

  const sophisticationChartData = Object.entries(sophisticationData).map(([level, count]) => ({
    name: level.replace('-', ' '),
    value: count
  }));

  const regionData = threatActors.reduce((acc, actor) => {
    acc[actor.origin] = (acc[actor.origin] || 0) + 1;
    return acc;
  }, {});

  const regionChartData = Object.entries(regionData).map(([region, count]) => ({
    name: region.replace('_', ' '),
    value: count
  }));

  const riskVsSophisticationData = threatActors.map(actor => ({
    name: actor.name.replace(/APT|Group/g, '').trim(),
    risk: (actor.riskScore * 100).toFixed(1),
    sophistication: actor.sophistication === 'advanced' ? 100 : 
                   actor.sophistication === 'medium-high' ? 75 : 
                   actor.sophistication === 'medium' ? 50 : 25,
    campaigns: actor.campaigns?.length || 0
  }));

  const activityTimelineData = threatActors.map(actor => ({
    name: actor.name.substring(0, 10),
    lastActivity: new Date(actor.lastActivity).getTime(),
    campaigns: actor.campaigns?.length || 0,
    victims: actor.campaigns?.reduce((sum, c) => sum + (c.victims || 0), 0) || 0
  })).sort((a, b) => b.lastActivity - a.lastActivity).slice(0, 15);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  if (loading && threatActors.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Threat Actor Profiling</span>
            </CardTitle>
            <Skeleton className="h-5 w-20" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Stats skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Charts skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-5 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-64 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Actor cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[...Array(4)].map((_, j) => (
                        <div key={j} className="flex justify-between">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
            <Users className="w-5 h-5" />
            <span>Threat Actor Profiling</span>
          </CardTitle>
          <Badge variant="outline">
            {filteredActors.length} / {threatActors.length} actors
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="profiles">Actor Profiles</TabsTrigger>
            <TabsTrigger value="analysis">Behavioral Analysis</TabsTrigger>
            <TabsTrigger value="attribution">Attribution</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Actors</p>
                      <p className="text-2xl font-bold text-blue-600">{threatActors.length}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                      <p className="text-2xl font-bold text-red-600">
                        {campaigns.filter(c => c.status === 'ongoing').length}
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">High-Risk Actors</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {threatActors.filter(a => a.riskScore > 0.7).length}
                      </p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Advanced Actors</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {threatActors.filter(a => a.sophistication === 'advanced').length}
                      </p>
                    </div>
                    <Award className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sophistication Levels</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={sophisticationChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {sophisticationChartData.map((entry, index) => (
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
                  <CardTitle>Geographic Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={regionChartData}>
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

            {/* Risk vs Sophistication Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Risk vs Sophistication Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <ScatterChart data={riskVsSophisticationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="risk" name="Risk Score" unit="%" />
                    <YAxis dataKey="sophistication" name="Sophistication" unit="%" />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'risk' ? `${value}%` : `${value}%`,
                        name === 'risk' ? 'Risk Score' : 'Sophistication'
                      ]}
                      labelFormatter={(label, payload) => payload?.[0]?.payload?.name || ''}
                    />
                    <Scatter 
                      name="Threat Actors" 
                      dataKey="sophistication" 
                      fill="#ef4444"
                      r={6}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Actor Profiles Tab */}
          <TabsContent value="profiles" className="space-y-4">
            {/* Search and Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Search threat actors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select value={sophisticationFilter} onValueChange={setSophisticationFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sophistication</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="medium-high">Medium-High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="russia">Russia</SelectItem>
                  <SelectItem value="china">China</SelectItem>
                  <SelectItem value="north_korea">North Korea</SelectItem>
                  <SelectItem value="iran">Iran</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actor Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredActors.map((actor) => (
                <Card key={actor.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{actor.name}</CardTitle>
                      <div className="flex items-center space-x-1">
                        <Badge variant={getThreatLevelBadge(actor.threat_level)}>
                          {actor.threat_level}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleActorSelect(actor)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Attribution:</span>
                        <div className="flex items-center space-x-1">
                          <Flag className="w-3 h-3" />
                          <span className="text-sm">{actor.attribution}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Risk Score:</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={actor.riskScore * 100} className="w-16" />
                          <span className="text-sm font-bold">
                            {formatConfidence(actor.riskScore)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Sophistication:</span>
                        <Badge variant={getSophisticationBadge(actor.sophistication)}>
                          {actor.sophistication.replace('-', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Campaigns:</span>
                        <span className="text-sm font-bold text-red-600">
                          {actor.campaigns?.length || 0}
                        </span>
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
                              {sector.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t">
                        <p className="text-sm font-medium mb-2">Known TTPs:</p>
                        <div className="flex flex-wrap gap-1">
                          {actor.techniques?.slice(0, 4).map((technique) => (
                            <Badge key={technique} variant="secondary" className="text-xs font-mono">
                              {technique}
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

          {/* Behavioral Analysis Tab */}
          <TabsContent value="analysis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={activityTimelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="campaigns"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      name="Campaigns"
                    />
                    <Area
                      type="monotone"
                      dataKey="victims"
                      stackId="1"
                      stroke="#ef4444"
                      fill="#ef4444"
                      name="Victims"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Attack Patterns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {threatActors.slice(0, 5).map((actor, index) => (
                      <div key={actor.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{actor.name}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {actor.primaryTTP || 'Unknown TTP'}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-red-600">
                            {actor.campaigns?.length || 0} campaigns
                          </p>
                          <p className="text-xs text-gray-600">
                            {formatTimeAgo(actor.lastActivity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Target Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {threatActors.slice(0, 5).map((actor) => (
                      <div key={actor.id} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{actor.name}</span>
                          <span className="text-sm">{actor.targetSectors?.length || 0} sectors</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {actor.targetSectors?.slice(0, 4).map((sector) => (
                            <Badge key={sector} variant="outline" className="text-xs">
                              {sector.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Attribution Tab */}
          <TabsContent value="attribution" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Attribution Confidence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {threatActors.slice(0, 10).map((actor) => (
                    <div key={actor.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <Flag className="w-5 h-5" />
                        <div>
                          <p className="font-medium">{actor.name}</p>
                          <p className="text-sm text-gray-600">{actor.attribution}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="text-sm font-medium">Attribution</p>
                          <Progress value={actor.attributionConfidence * 100} className="w-20" />
                          <p className="text-xs">{formatConfidence(actor.attributionConfidence)}</p>
                        </div>
                        <Badge variant={actor.origin === 'unknown' ? 'outline' : 'secondary'}>
                          {actor.origin?.replace('_', ' ') || 'Unknown'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Actor Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {threatActors.map((actor) => (
                    <div key={actor.id} className="flex items-start space-x-4 p-3 border rounded">
                      <div className="flex-shrink-0">
                        <div className={`w-3 h-3 rounded-full ${
                          new Date(actor.lastActivity) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                            ? 'bg-red-500' : 'bg-gray-300'
                        }`}></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{actor.name}</h4>
                          <span className="text-sm text-gray-600">
                            {formatTimeAgo(actor.lastActivity)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Last active: {new Date(actor.lastActivity).toLocaleDateString()}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {actor.campaigns?.length || 0} campaigns
                          </Badge>
                          <Badge variant={getSophisticationBadge(actor.sophistication)} className="text-xs">
                            {actor.sophistication}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actor Detail Dialog */}
        <Dialog open={showActorDetail} onOpenChange={setShowActorDetail}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>{selectedActor?.name}</span>
                <Badge variant={getThreatLevelBadge(selectedActor?.threat_level)}>
                  {selectedActor?.threat_level}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            
            {selectedActor && (
              <div className="space-y-6">
                {/* Actor Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm font-medium text-gray-600">Risk Score</p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatConfidence(selectedActor.riskScore)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm font-medium text-gray-600">Attribution</p>
                      <p className="text-lg font-bold">{selectedActor.attribution}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm font-medium text-gray-600">Active Since</p>
                      <p className="text-lg font-bold">
                        {new Date(selectedActor.firstSeen).getFullYear()}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Detailed Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Capabilities & TTPs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-2">Sophistication Level:</p>
                          <Badge variant={getSophisticationBadge(selectedActor.sophistication)}>
                            {selectedActor.sophistication}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Known Techniques:</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedActor.techniques?.map((technique) => (
                              <Badge key={technique} variant="outline" className="text-xs font-mono">
                                {technique}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Primary Tools:</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedActor.tools?.map((tool) => (
                              <Badge key={tool} variant="secondary" className="text-xs">
                                {tool}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Targeting Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-2">Target Sectors:</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedActor.targetSectors?.map((sector) => (
                              <Badge key={sector} variant="outline" className="text-xs">
                                {sector.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Geographic Focus:</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedActor.targetRegions?.map((region) => (
                              <Badge key={region} variant="secondary" className="text-xs">
                                {region.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Motivations:</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedActor.motivations?.map((motivation) => (
                              <Badge key={motivation} variant="outline" className="text-xs">
                                {motivation.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Related Actors */}
                {relatedActors.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Related Threat Actors</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {relatedActors.map((related) => (
                          <div key={related.id} className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <p className="font-medium">{related.name}</p>
                              <p className="text-sm text-gray-600">{related.relationship}</p>
                            </div>
                            <Badge variant="outline">
                              {formatConfidence(related.confidence)}
                            </Badge>
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

export default ThreatActorProfilingWidget;
