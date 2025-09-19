/**
 * Incident Response Dashboard Widget
 * Comprehensive incident management with automated playbook execution,
 * real-time status tracking, and stakeholder coordination
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
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, RadialBarChart, RadialBar
} from 'recharts';
import { 
  AlertTriangle, Shield, Clock, Users, Play, Pause, CheckCircle2,
  FileText, Eye, Edit, RefreshCw, Filter, Download, Bell,
  Activity, Target, Brain, Zap, Calendar, MapPin, Hash
} from 'lucide-react';
import { incidentResponseEngine } from '../../services/IncidentResponseEngine';

const IncidentResponseDashboardWidget = ({ className = "" }) => {
  const [incidents, setIncidents] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [playbooks, setPlaybooks] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showIncidentDetail, setShowIncidentDetail] = useState(false);
  const [showCreateIncident, setShowCreateIncident] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    severity: 'all',
    timeRange: '24h'
  });
  
  // New incident form state
  const [newIncident, setNewIncident] = useState({
    title: '',
    description: '',
    severity: 'medium',
    category: 'security',
    affectedAssets: '',
    indicators: ''
  });

  useEffect(() => {
    initializeIncidentEngine();
    fetchIncidentData();
    
    const interval = setInterval(fetchIncidentData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const initializeIncidentEngine = async () => {
    try {
      if (!incidentResponseEngine.isRunning) {
        await incidentResponseEngine.initialize();
      }
    } catch (error) {
      console.error('Failed to initialize incident response engine:', error);
    }
  };

  const fetchIncidentData = async () => {
    try {
      setRefreshing(true);
      
      const [incidentList, incidentMetrics, playbookList] = await Promise.all([
        incidentResponseEngine.getIncidents({ limit: 100 }),
        incidentResponseEngine.getMetrics(),
        incidentResponseEngine.getPlaybooks()
      ]);

      setIncidents(incidentList);
      setMetrics(incidentMetrics);
      setPlaybooks(playbookList);
    } catch (error) {
      console.error('Failed to fetch incident data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const createIncident = async () => {
    try {
      setLoading(true);
      
      const alertData = {
        title: newIncident.title,
        description: newIncident.description,
        category: newIncident.category,
        severity: newIncident.severity,
        affectedAssets: newIncident.affectedAssets.split(',').map(asset => ({
          id: asset.trim(),
          name: asset.trim(),
          type: 'unknown'
        })).filter(asset => asset.id),
        indicators: newIncident.indicators.split(',').map(ioc => ({
          value: ioc.trim(),
          type: 'unknown'
        })).filter(ioc => ioc.value)
      };

      await incidentResponseEngine.createIncident(alertData);
      
      setShowCreateIncident(false);
      setNewIncident({
        title: '',
        description: '',
        severity: 'medium',
        category: 'security',
        affectedAssets: '',
        indicators: ''
      });
      
      await fetchIncidentData();
    } catch (error) {
      console.error('Failed to create incident:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateIncidentStatus = async (incidentId, newStatus) => {
    try {
      await incidentResponseEngine.updateIncidentStatus(incidentId, newStatus, 'Status updated via dashboard');
      await fetchIncidentData();
    } catch (error) {
      console.error('Failed to update incident status:', error);
    }
  };

  const viewIncidentDetails = async (incident) => {
    setSelectedIncident(incident);
    setShowIncidentDetail(true);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'warning';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'text-red-600';
      case 'investigating': return 'text-orange-600';
      case 'contained': return 'text-yellow-600';
      case 'resolved': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'investigating': return 'warning';
      case 'contained': return 'secondary';
      case 'resolved': return 'outline';
      default: return 'outline';
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const calculateIncidentAge = (incident) => {
    const created = new Date(incident.createdAt);
    const now = new Date();
    return Math.floor((now - created) / (1000 * 60)); // Age in minutes
  };

  // Filter incidents based on current filters
  const filteredIncidents = incidents.filter(incident => {
    if (filters.status !== 'all' && incident.status !== filters.status) return false;
    if (filters.severity !== 'all' && incident.severity !== filters.severity) return false;
    
    if (filters.timeRange !== 'all') {
      const ageInHours = calculateIncidentAge(incident) / 60;
      switch (filters.timeRange) {
        case '24h': return ageInHours <= 24;
        case '7d': return ageInHours <= 168;
        case '30d': return ageInHours <= 720;
        default: return true;
      }
    }
    
    return true;
  });

  // Prepare chart data
  const severityDistribution = incidents.reduce((acc, incident) => {
    acc[incident.severity] = (acc[incident.severity] || 0) + 1;
    return acc;
  }, {});

  const severityData = Object.entries(severityDistribution).map(([severity, count]) => ({
    name: severity,
    value: count
  }));

  const statusDistribution = incidents.reduce((acc, incident) => {
    acc[incident.status] = (acc[incident.status] || 0) + 1;
    return acc;
  }, {});

  const statusData = Object.entries(statusDistribution).map(([status, count]) => ({
    name: status,
    value: count
  }));

  const responseTimeData = incidents.slice(0, 10).map(incident => ({
    id: incident.id.split('-')[2],
    responseTime: calculateIncidentAge(incident),
    severity: incident.severity
  }));

  const playbookUsageData = playbooks.map(playbook => ({
    name: playbook.name.substring(0, 15) + '...',
    executions: playbook.metrics.executions,
    successRate: (playbook.metrics.successRate * 100).toFixed(1)
  }));

  const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>Incident Response Center</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {filteredIncidents.length} incidents
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchIncidentData}
              disabled={refreshing}
            >
              {refreshing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
            <Dialog open={showCreateIncident} onOpenChange={setShowCreateIncident}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Create Incident
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Incident</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="incident-title">Title</Label>
                    <Input
                      id="incident-title"
                      value={newIncident.title}
                      onChange={(e) => setNewIncident({...newIncident, title: e.target.value})}
                      placeholder="Incident title..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="incident-description">Description</Label>
                    <Textarea
                      id="incident-description"
                      value={newIncident.description}
                      onChange={(e) => setNewIncident({...newIncident, description: e.target.value})}
                      placeholder="Detailed description..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="incident-severity">Severity</Label>
                      <Select value={newIncident.severity} onValueChange={(value) => setNewIncident({...newIncident, severity: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="incident-category">Category</Label>
                      <Select value={newIncident.category} onValueChange={(value) => setNewIncident({...newIncident, category: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="security">Security</SelectItem>
                          <SelectItem value="privacy">Privacy</SelectItem>
                          <SelectItem value="operational">Operational</SelectItem>
                          <SelectItem value="compliance">Compliance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="affected-assets">Affected Assets (comma-separated)</Label>
                    <Input
                      id="affected-assets"
                      value={newIncident.affectedAssets}
                      onChange={(e) => setNewIncident({...newIncident, affectedAssets: e.target.value})}
                      placeholder="server1, workstation2, database3..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="indicators">Indicators (comma-separated)</Label>
                    <Input
                      id="indicators"
                      value={newIncident.indicators}
                      onChange={(e) => setNewIncident({...newIncident, indicators: e.target.value})}
                      placeholder="malicious.exe, 192.168.1.100, evil.com..."
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowCreateIncident(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createIncident} disabled={loading || !newIncident.title}>
                      {loading ? 'Creating...' : 'Create Incident'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
            <TabsTrigger value="playbooks">Playbooks</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="evidence">Evidence</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Incidents</p>
                      <p className="text-2xl font-bold text-red-600">
                        {metrics.activeIncidents || 0}
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
                      <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {metrics.averageResponseTime || 0}m
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Playbook Executions</p>
                      <p className="text-2xl font-bold text-green-600">
                        {metrics.playbookExecutions || 0}
                      </p>
                    </div>
                    <Play className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Evidence Collected</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {metrics.evidenceCollected || 0}
                      </p>
                    </div>
                    <FileText className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Incident Severity Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={severityData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {severityData.map((entry, index) => (
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
                  <CardTitle>Incident Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={statusData}>
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

            {/* Recent Critical Incidents */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Critical Incidents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {incidents.filter(i => i.severity === 'critical' || i.severity === 'high')
                    .slice(0, 5)
                    .map((incident) => (
                    <div key={incident.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <Badge variant={getSeverityBadge(incident.severity)}>
                          {incident.severity}
                        </Badge>
                        <div>
                          <p className="font-medium">{incident.title}</p>
                          <p className="text-sm text-gray-600">
                            {incident.affectedAssets.length} assets affected
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={getStatusBadge(incident.status)}>
                          {incident.status}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatTimeAgo(incident.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Incidents Tab */}
          <TabsContent value="incidents" className="space-y-4">
            {/* Filters */}
            <div className="flex items-center space-x-4">
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="contained">Contained</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filters.severity} onValueChange={(value) => setFilters({...filters, severity: value})}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filters.timeRange} onValueChange={(value) => setFilters({...filters, timeRange: value})}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Incident List */}
            <Card>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredIncidents.map((incident) => (
                    <div key={incident.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <Badge variant={getSeverityBadge(incident.severity)}>
                          {incident.severity}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{incident.title}</p>
                          <p className="text-sm text-gray-600">{incident.id}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {incident.category}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {incident.affectedAssets.length} assets
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <Badge variant={getStatusBadge(incident.status)}>
                          {incident.status}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatTimeAgo(incident.createdAt)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Age: {calculateIncidentAge(incident)}m
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewIncidentDetails(incident)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {incident.status === 'open' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateIncidentStatus(incident.id, 'investigating')}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                        {(incident.status === 'investigating' || incident.status === 'contained') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateIncidentStatus(incident.id, 'resolved')}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Playbooks Tab */}
          <TabsContent value="playbooks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Playbook Usage Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={playbookUsageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="executions" fill="#3b82f6" name="Executions" />
                    <Bar dataKey="successRate" fill="#10b981" name="Success Rate %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {playbooks.slice(0, 6).map((playbook) => (
                <Card key={playbook.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{playbook.name}</CardTitle>
                      <Badge variant={getSeverityBadge(playbook.severity)}>
                        {playbook.severity}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">{playbook.description}</p>
                      
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Category:</span>
                        <Badge variant="outline">{playbook.category}</Badge>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Steps:</span>
                        <span className="text-sm">{playbook.steps.length}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Executions:</span>
                        <span className="text-sm font-bold">{playbook.metrics.executions}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Success Rate:</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={playbook.metrics.successRate * 100} className="w-16" />
                          <span className="text-sm">{(playbook.metrics.successRate * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t">
                        <p className="text-sm font-medium mb-2">Trigger Conditions:</p>
                        <div className="flex flex-wrap gap-1">
                          {playbook.triggerConditions.slice(0, 3).map((condition, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {condition.pattern}
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

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Response Time Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={responseTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="id" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="responseTime"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      name="Response Time (min)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>MTTR by Severity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['critical', 'high', 'medium', 'low'].map(severity => {
                      const severityIncidents = incidents.filter(i => i.severity === severity);
                      const avgTime = severityIncidents.length > 0
                        ? severityIncidents.reduce((sum, i) => sum + calculateIncidentAge(i), 0) / severityIncidents.length
                        : 0;
                      
                      return (
                        <div key={severity} className="flex items-center justify-between">
                          <Badge variant={getSeverityBadge(severity)} className="w-20">
                            {severity}
                          </Badge>
                          <div className="flex items-center space-x-2">
                            <Progress value={Math.min(avgTime / 10, 100)} className="w-32" />
                            <span className="text-sm font-medium">{avgTime.toFixed(0)}m</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Automation Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Automated Actions:</span>
                      <span className="text-lg font-bold text-blue-600">
                        {metrics.automatedActions || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Playbook Success Rate:</span>
                      <span className="text-lg font-bold text-green-600">
                        {playbooks.length > 0
                          ? ((playbooks.reduce((sum, p) => sum + p.metrics.successRate, 0) / playbooks.length) * 100).toFixed(1)
                          : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Evidence Collection Rate:</span>
                      <span className="text-lg font-bold text-purple-600">
                        {incidents.length > 0
                          ? ((incidents.filter(i => i.evidence?.length > 0).length / incidents.length) * 100).toFixed(1)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Evidence Tab */}
          <TabsContent value="evidence" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Evidence Collection Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm font-medium text-gray-600">Total Evidence Items</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {metrics.evidenceCollected || 0}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm font-medium text-gray-600">Incidents with Evidence</p>
                      <p className="text-2xl font-bold text-green-600">
                        {incidents.filter(i => i.evidence?.length > 0).length}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm font-medium text-gray-600">Chain of Custody</p>
                      <p className="text-2xl font-bold text-purple-600">100%</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Evidence Collection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {incidents.filter(i => i.evidence?.length > 0).slice(0, 10).map((incident) => (
                    <div key={incident.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-medium">{incident.title}</p>
                          <p className="text-sm text-gray-600">{incident.id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">
                          {incident.evidence?.length || 0} items
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatTimeAgo(incident.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Incident Detail Dialog */}
        <Dialog open={showIncidentDetail} onOpenChange={setShowIncidentDetail}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>{selectedIncident?.title}</span>
                <Badge variant={getSeverityBadge(selectedIncident?.severity)}>
                  {selectedIncident?.severity}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            
            {selectedIncident && (
              <div className="space-y-6">
                {/* Incident Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm font-medium text-gray-600">Status</p>
                      <Badge variant={getStatusBadge(selectedIncident.status)}>
                        {selectedIncident.status}
                      </Badge>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm font-medium text-gray-600">Age</p>
                      <p className="text-lg font-bold">{calculateIncidentAge(selectedIncident)} minutes</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm font-medium text-gray-600">Affected Assets</p>
                      <p className="text-lg font-bold">{selectedIncident.affectedAssets.length}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle>Incident Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-64 overflow-y-auto">
                      {selectedIncident.timeline?.map((event, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{event.event.replace('_', ' ')}</p>
                              <span className="text-sm text-gray-600">
                                {formatTimeAgo(event.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{event.description}</p>
                            {event.notes && (
                              <p className="text-sm text-blue-600 mt-1">{event.notes}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Affected Assets and Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Affected Assets</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedIncident.affectedAssets.map((asset, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <span className="font-mono text-sm">{asset.name || asset.id}</span>
                            <Badge variant="outline">{asset.type}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Indicators</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedIncident.indicators?.map((indicator, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <span className="font-mono text-sm">{indicator.value}</span>
                            <Badge variant="outline">{indicator.type}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default IncidentResponseDashboardWidget;
