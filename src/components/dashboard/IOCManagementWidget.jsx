/**
 * IOC Management Widget
 * Advanced indicator of compromise management with enrichment,
 * threat scoring, and correlation capabilities
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
  ScatterChart, Scatter, Area, AreaChart
} from 'recharts';
import { 
  Database, Search, Filter, Plus, Edit, Trash2, Download, Upload,
  AlertTriangle, Shield, Eye, Brain, Network, Globe, Hash,
  Clock, TrendingUp, Activity, Target, Zap, Link
} from 'lucide-react';
import { threatIntelligenceEngine } from '../../services/ThreatIntelligenceEngine';

const IOCManagementWidget = ({ className = "" }) => {
  const [indicators, setIndicators] = useState([]);
  const [filteredIndicators, setFilteredIndicators] = useState([]);
  const [selectedIOC, setSelectedIOC] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewIOCDialog, setShowNewIOCDialog] = useState(false);
  const [showEnrichmentDialog, setShowEnrichmentDialog] = useState(false);
  const [enrichmentResults, setEnrichmentResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedIndicators, setSelectedIndicators] = useState(new Set());
  const [bulkAction, setBulkAction] = useState('');
  
  // New IOC form state
  const [newIOC, setNewIOC] = useState({
    value: '',
    type: 'hash',
    description: '',
    tags: '',
    source: 'manual',
    confidence: 0.8,
    severity: 'medium'
  });

  useEffect(() => {
    fetchIndicators();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [indicators, searchTerm, typeFilter, severityFilter, statusFilter]);

  const fetchIndicators = async () => {
    try {
      setLoading(true);
      const iocs = await threatIntelligenceEngine.getIndicators({ limit: 1000 });
      setIndicators(iocs);
    } catch (error) {
      console.error('Failed to fetch indicators:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = indicators;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(ioc => 
        ioc.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ioc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ioc.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(ioc => ioc.type === typeFilter);
    }

    // Apply severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(ioc => ioc.severity === severityFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(ioc => ioc.status === statusFilter);
    }

    setFilteredIndicators(filtered);
  };

  const enrichIndicator = async (iocValue, iocType) => {
    try {
      setLoading(true);
      const enrichment = await threatIntelligenceEngine.enrichIndicator(iocValue, {
        type: iocType,
        includeThreatIntel: true,
        includeRelated: true,
        includeContext: true
      });
      setEnrichmentResults(enrichment);
      setShowEnrichmentDialog(true);
    } catch (error) {
      console.error('Failed to enrich indicator:', error);
    } finally {
      setLoading(false);
    }
  };

  const addNewIOC = async () => {
    try {
      setLoading(true);
      const tags = newIOC.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      await threatIntelligenceEngine.addIndicator({
        ...newIOC,
        tags,
        firstSeen: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        threatScore: newIOC.confidence
      });

      setShowNewIOCDialog(false);
      setNewIOC({
        value: '',
        type: 'hash',
        description: '',
        tags: '',
        source: 'manual',
        confidence: 0.8,
        severity: 'medium'
      });
      
      await fetchIndicators();
    } catch (error) {
      console.error('Failed to add indicator:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedIndicators.size === 0) return;

    try {
      setLoading(true);
      const indicatorIds = Array.from(selectedIndicators);
      
      switch (bulkAction) {
        case 'delete':
          await Promise.all(indicatorIds.map(id => 
            threatIntelligenceEngine.removeIndicator(id)
          ));
          break;
        case 'enrich':
          await Promise.all(indicatorIds.map(id => {
            const ioc = indicators.find(i => i.id === id);
            return threatIntelligenceEngine.enrichIndicator(ioc.value, { type: ioc.type });
          }));
          break;
        case 'mark_reviewed':
          await Promise.all(indicatorIds.map(id =>
            threatIntelligenceEngine.updateIndicator(id, { status: 'reviewed' })
          ));
          break;
      }
      
      setSelectedIndicators(new Set());
      setBulkAction('');
      await fetchIndicators();
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleIndicatorSelection = (id) => {
    const newSelection = new Set(selectedIndicators);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIndicators(newSelection);
  };

  const selectAllIndicators = () => {
    if (selectedIndicators.size === filteredIndicators.length) {
      setSelectedIndicators(new Set());
    } else {
      setSelectedIndicators(new Set(filteredIndicators.map(ioc => ioc.id)));
    }
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

  const getTypeIcon = (type) => {
    switch (type) {
      case 'hash': return <Hash className="w-4 h-4" />;
      case 'domain': return <Globe className="w-4 h-4" />;
      case 'ip': return <Network className="w-4 h-4" />;
      case 'url': return <Link className="w-4 h-4" />;
      case 'email': return <Database className="w-4 h-4" />;
      default: return <Database className="w-4 h-4" />;
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
  const typeDistribution = indicators.reduce((acc, ioc) => {
    acc[ioc.type] = (acc[ioc.type] || 0) + 1;
    return acc;
  }, {});

  const typeDistributionData = Object.entries(typeDistribution).map(([type, count]) => ({
    name: type.toUpperCase(),
    value: count
  }));

  const severityDistribution = indicators.reduce((acc, ioc) => {
    acc[ioc.severity] = (acc[ioc.severity] || 0) + 1;
    return acc;
  }, {});

  const severityData = Object.entries(severityDistribution).map(([severity, count]) => ({
    name: severity,
    value: count
  }));

  const threatScoreData = indicators.map(ioc => ({
    name: ioc.value.substring(0, 10) + '...',
    score: (ioc.threatScore * 100).toFixed(1),
    confidence: (ioc.confidence * 100).toFixed(1)
  })).slice(0, 20);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>IOC Management</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {filteredIndicators.length} / {indicators.length} indicators
            </Badge>
            <Dialog open={showNewIOCDialog} onOpenChange={setShowNewIOCDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add IOC
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Indicator</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ioc-type">Type</Label>
                    <Select value={newIOC.type} onValueChange={(value) => setNewIOC({...newIOC, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hash">Hash</SelectItem>
                        <SelectItem value="domain">Domain</SelectItem>
                        <SelectItem value="ip">IP Address</SelectItem>
                        <SelectItem value="url">URL</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="ioc-value">Value</Label>
                    <Input
                      id="ioc-value"
                      value={newIOC.value}
                      onChange={(e) => setNewIOC({...newIOC, value: e.target.value})}
                      placeholder="Enter indicator value..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="ioc-description">Description</Label>
                    <Textarea
                      id="ioc-description"
                      value={newIOC.description}
                      onChange={(e) => setNewIOC({...newIOC, description: e.target.value})}
                      placeholder="Description of the threat..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="ioc-tags">Tags (comma-separated)</Label>
                    <Input
                      id="ioc-tags"
                      value={newIOC.tags}
                      onChange={(e) => setNewIOC({...newIOC, tags: e.target.value})}
                      placeholder="malware, apt29, phishing..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="ioc-severity">Severity</Label>
                    <Select value={newIOC.severity} onValueChange={(value) => setNewIOC({...newIOC, severity: value})}>
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
                    <Label htmlFor="ioc-confidence">Confidence: {formatConfidence(newIOC.confidence)}</Label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={newIOC.confidence}
                      onChange={(e) => setNewIOC({...newIOC, confidence: parseFloat(e.target.value)})}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowNewIOCDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addNewIOC} disabled={loading || !newIOC.value}>
                      {loading ? 'Adding...' : 'Add IOC'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="list" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="list">Indicator List</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="enrichment">Enrichment</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Actions</TabsTrigger>
          </TabsList>

          {/* Indicator List Tab */}
          <TabsContent value="list" className="space-y-4">
            {/* Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Search indicators..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="hash">Hashes</SelectItem>
                  <SelectItem value="domain">Domains</SelectItem>
                  <SelectItem value="ip">IPs</SelectItem>
                  <SelectItem value="url">URLs</SelectItem>
                  <SelectItem value="email">Emails</SelectItem>
                </SelectContent>
              </Select>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Indicator Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedIndicators.size === filteredIndicators.length && filteredIndicators.length > 0}
                      onCheckedChange={selectAllIndicators}
                    />
                    <span className="text-sm font-medium">
                      {selectedIndicators.size > 0 && `${selectedIndicators.size} selected`}
                    </span>
                  </div>
                  {selectedIndicators.size > 0 && (
                    <div className="flex items-center space-x-2">
                      <Select value={bulkAction} onValueChange={setBulkAction}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Bulk action..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="enrich">Enrich All</SelectItem>
                          <SelectItem value="mark_reviewed">Mark Reviewed</SelectItem>
                          <SelectItem value="delete">Delete</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        size="sm" 
                        onClick={handleBulkAction}
                        disabled={!bulkAction || loading}
                      >
                        Apply
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredIndicators.map((ioc) => (
                    <div key={ioc.id} className="flex items-center space-x-3 p-3 border rounded hover:bg-gray-50">
                      <Checkbox
                        checked={selectedIndicators.has(ioc.id)}
                        onCheckedChange={() => toggleIndicatorSelection(ioc.id)}
                      />
                      
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(ioc.type)}
                        <Badge variant="outline" className="text-xs">
                          {ioc.type.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm truncate">{ioc.value}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          {ioc.tags?.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <Badge variant={getSeverityBadge(ioc.severity)}>
                          {ioc.severity}
                        </Badge>
                        <p className="text-xs text-gray-600 mt-1">
                          {formatConfidence(ioc.threatScore)}
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm font-medium">
                          {formatTimeAgo(ioc.firstSeen)}
                        </p>
                        <p className="text-xs text-gray-600">
                          {ioc.source}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => enrichIndicator(ioc.value, ioc.type)}
                          disabled={loading}
                        >
                          <Brain className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedIOC(ioc)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
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
                  <CardTitle>Type Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={typeDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {typeDistributionData.map((entry, index) => (
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
                  <CardTitle>Severity Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={severityData}>
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

            <Card>
              <CardHeader>
                <CardTitle>Threat Score Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={threatScoreData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="score" name="Threat Score" unit="%" />
                    <YAxis dataKey="confidence" name="Confidence" unit="%" />
                    <Tooltip 
                      formatter={(value, name) => [`${value}%`, name === 'score' ? 'Threat Score' : 'Confidence']}
                    />
                    <Scatter name="Indicators" dataKey="confidence" fill="#ef4444" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enrichment Tab */}
          <TabsContent value="enrichment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Manual Enrichment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Select>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hash">Hash</SelectItem>
                        <SelectItem value="domain">Domain</SelectItem>
                        <SelectItem value="ip">IP</SelectItem>
                        <SelectItem value="url">URL</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input placeholder="Enter indicator value..." className="flex-1" />
                    <Button>
                      <Search className="w-4 h-4 mr-2" />
                      Enrich
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enrichment Results Dialog */}
            <Dialog open={showEnrichmentDialog} onOpenChange={setShowEnrichmentDialog}>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Enrichment Results</DialogTitle>
                </DialogHeader>
                {enrichmentResults && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <p className="text-sm font-medium text-gray-600">Threat Score</p>
                          <p className="text-2xl font-bold text-red-600">
                            {formatConfidence(enrichmentResults.threatScore)}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <p className="text-sm font-medium text-gray-600">Reputation</p>
                          <Badge variant={enrichmentResults.reputation === 'malicious' ? 'destructive' : 'success'}>
                            {enrichmentResults.reputation}
                          </Badge>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <p className="text-sm font-medium text-gray-600">Sources</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {enrichmentResults.sources?.length || 0}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {enrichmentResults.related && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Related Indicators</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {enrichmentResults.related.slice(0, 10).map((related, index) => (
                              <div key={index} className="flex items-center justify-between p-2 border rounded">
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline">{related.type}</Badge>
                                  <span className="font-mono text-sm">{related.value}</span>
                                </div>
                                <Badge variant={related.malicious ? 'destructive' : 'success'}>
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
          </TabsContent>

          {/* Bulk Actions Tab */}
          <TabsContent value="bulk" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Import IOCs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-sm text-gray-600">
                        Drop CSV/JSON files here or click to browse
                      </p>
                      <Button variant="outline" className="mt-2">
                        Select Files
                      </Button>
                    </div>
                    <Alert>
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription>
                        Supported formats: CSV (value,type,description), JSON, STIX, MISP
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Export IOCs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Export Format</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="stix">STIX 2.1</SelectItem>
                          <SelectItem value="misp">MISP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Filter Criteria</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="hash">Hashes</SelectItem>
                            <SelectItem value="domain">Domains</SelectItem>
                            <SelectItem value="ip">IPs</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Severity" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Severities</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Export IOCs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default IOCManagementWidget;
