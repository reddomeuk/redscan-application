import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Shield, 
  AlertTriangle, 
  Globe,
  FileWarning,
  Hash,
  RefreshCw,
  Plus,
  Eye,
  Clock,
  Target,
  Zap,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';

export default function IOCTrackerWidget({ className }) {
  const [iocs, setIocs] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadIOCs();
    const interval = setInterval(loadIOCs, 120000); // Refresh every 2 minutes
    return () => clearInterval(interval);
  }, []);

  const loadIOCs = async () => {
    try {
      // Simulate loading IOCs from various threat intelligence sources
      const mockIOCs = generateMockIOCs();
      setIocs(mockIOCs);
      
      // Calculate statistics
      const iocStats = calculateIOCStats(mockIOCs);
      setStats(iocStats);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load IOCs:', error);
      setIsLoading(false);
    }
  };

  const generateMockIOCs = () => {
    return [
      {
        id: 'ioc_001',
        type: 'ip',
        value: '185.220.101.42',
        source: 'AlienVault OTX',
        confidence: 95,
        threat_type: 'c2_server',
        severity: 'critical',
        first_seen: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        last_seen: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        tags: ['botnet', 'malware', 'c2'],
        description: 'Known command and control server for banking trojan',
        detections: 23,
        status: 'active',
        related_threats: ['Emotet', 'Trickbot'],
        geolocation: { country: 'RU', city: 'Moscow' }
      },
      {
        id: 'ioc_002',
        type: 'domain',
        value: 'evil-phishing-site.com',
        source: 'PhishTank',
        confidence: 88,
        threat_type: 'phishing',
        severity: 'high',
        first_seen: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        last_seen: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
        tags: ['phishing', 'credential_theft'],
        description: 'Phishing site impersonating major bank login page',
        detections: 8,
        status: 'active',
        related_threats: ['Credential Harvesting'],
        registrar: 'NameCheap Inc.'
      },
      {
        id: 'ioc_003',
        type: 'hash',
        value: 'd41d8cd98f00b204e9800998ecf8427e',
        hash_type: 'md5',
        source: 'VirusTotal',
        confidence: 92,
        threat_type: 'malware',
        severity: 'critical',
        first_seen: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        last_seen: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        tags: ['ransomware', 'encryption'],
        description: 'Ransomware payload with file encryption capabilities',
        detections: 45,
        status: 'active',
        related_threats: ['WannaCry', 'Ryuk'],
        file_names: ['update.exe', 'installer.msi']
      },
      {
        id: 'ioc_004',
        type: 'url',
        value: 'http://malicious-download.net/payload.exe',
        source: 'Hybrid Analysis',
        confidence: 76,
        threat_type: 'dropper',
        severity: 'medium',
        first_seen: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        last_seen: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        tags: ['dropper', 'download'],
        description: 'Malicious download URL serving trojans',
        detections: 12,
        status: 'monitoring',
        related_threats: ['Generic Trojan']
      },
      {
        id: 'ioc_005',
        type: 'email',
        value: 'admin@suspicious-domain.org',
        source: 'Internal SIEM',
        confidence: 67,
        threat_type: 'phishing',
        severity: 'medium',
        first_seen: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18 hours ago
        last_seen: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        tags: ['phishing', 'social_engineering'],
        description: 'Email address used in spear phishing campaigns',
        detections: 5,
        status: 'resolved',
        related_threats: ['Business Email Compromise']
      }
    ];
  };

  const calculateIOCStats = (iocList) => {
    return {
      total: iocList.length,
      byType: {
        ip: iocList.filter(ioc => ioc.type === 'ip').length,
        domain: iocList.filter(ioc => ioc.type === 'domain').length,
        hash: iocList.filter(ioc => ioc.type === 'hash').length,
        url: iocList.filter(ioc => ioc.type === 'url').length,
        email: iocList.filter(ioc => ioc.type === 'email').length
      },
      bySeverity: {
        critical: iocList.filter(ioc => ioc.severity === 'critical').length,
        high: iocList.filter(ioc => ioc.severity === 'high').length,
        medium: iocList.filter(ioc => ioc.severity === 'medium').length,
        low: iocList.filter(ioc => ioc.severity === 'low').length
      },
      byStatus: {
        active: iocList.filter(ioc => ioc.status === 'active').length,
        monitoring: iocList.filter(ioc => ioc.status === 'monitoring').length,
        resolved: iocList.filter(ioc => ioc.status === 'resolved').length
      },
      totalDetections: iocList.reduce((sum, ioc) => sum + ioc.detections, 0),
      averageConfidence: iocList.reduce((sum, ioc) => sum + ioc.confidence, 0) / iocList.length
    };
  };

  const filteredIOCs = iocs.filter(ioc =>
    ioc.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ioc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ioc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getTypeIcon = (type) => {
    switch (type) {
      case 'ip': return <Globe className="w-4 h-4 text-blue-400" />;
      case 'domain': return <Globe className="w-4 h-4 text-green-400" />;
      case 'hash': return <Hash className="w-4 h-4 text-purple-400" />;
      case 'url': return <ExternalLink className="w-4 h-4 text-orange-400" />;
      case 'email': return <Target className="w-4 h-4 text-cyan-400" />;
      default: return <FileWarning className="w-4 h-4 text-gray-400" />;
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-red-400 bg-red-500/20';
      case 'monitoring': return 'text-yellow-400 bg-yellow-500/20';
      case 'resolved': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-green-400';
    if (confidence >= 70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const handleRefresh = () => {
    setIsLoading(true);
    loadIOCs();
  };

  if (isLoading) {
    return (
      <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-400" />
            IOC Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-slate-400">
            <Shield className="w-8 h-8 animate-pulse mr-2" />
            Loading threat indicators...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-400" />
          IOC Tracker
          <Badge className="ml-auto bg-red-500/20 text-red-400 border-red-500/30">
            {stats?.byStatus.active || 0} Active
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
            <TabsTrigger value="indicators" className="text-xs">Indicators</TabsTrigger>
            <TabsTrigger value="feeds" className="text-xs">Feeds</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Summary Statistics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-2xl font-bold text-red-400">
                  {stats?.total || 0}
                </div>
                <div className="text-xs text-slate-400">Total IOCs</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-2xl font-bold text-orange-400">
                  {stats?.totalDetections || 0}
                </div>
                <div className="text-xs text-slate-400">Detections</div>
              </div>
            </div>

            {/* IOC Type Distribution */}
            <div className="space-y-3">
              <span className="text-sm text-white">IOC Types</span>
              <div className="space-y-2">
                {Object.entries(stats?.byType || {}).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(type)}
                      <span className="text-xs text-white capitalize">{type}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">{count}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Severity Distribution */}
            <div className="space-y-3">
              <span className="text-sm text-white">Severity Levels</span>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(stats?.bySeverity || {}).map(([severity, count]) => (
                  <div key={severity} className={`p-2 rounded text-center ${getSeverityColor(severity)}`}>
                    <div className="text-lg font-bold">{count}</div>
                    <div className="text-xs capitalize">{severity}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Average Confidence */}
            <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded">
              <span className="text-sm text-white">Average Confidence</span>
              <span className={`text-sm font-medium ${getConfidenceColor(stats?.averageConfidence || 0)}`}>
                {stats?.averageConfidence ? stats.averageConfidence.toFixed(1) : 0}%
              </span>
            </div>
          </TabsContent>

          <TabsContent value="indicators" className="space-y-4 mt-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search IOCs, descriptions, tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700/50 border-slate-600 text-white"
              />
            </div>

            {/* IOC List */}
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {filteredIOCs.map((ioc) => (
                  <div key={ioc.id} className="p-3 bg-slate-700/30 rounded-lg border border-slate-600">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(ioc.type)}
                        <Badge className={getSeverityColor(ioc.severity)}>
                          {ioc.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <Badge className={getStatusColor(ioc.status)}>
                        {ioc.status}
                      </Badge>
                    </div>

                    <div className="text-sm text-white font-mono mb-1 truncate">
                      {ioc.value}
                    </div>

                    <div className="text-xs text-slate-300 mb-2">
                      {ioc.description}
                    </div>

                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-slate-400">Source: {ioc.source}</span>
                      <span className={`${getConfidenceColor(ioc.confidence)}`}>
                        {ioc.confidence}% confidence
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="text-slate-400">
                          {format(ioc.last_seen, 'MMM dd, HH:mm')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-blue-400" />
                        <span className="text-blue-400">{ioc.detections}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    {ioc.tags && ioc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {ioc.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {ioc.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{ioc.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Related Threats */}
                    {ioc.related_threats && ioc.related_threats.length > 0 && (
                      <div className="mt-2 text-xs text-orange-400">
                        Related: {ioc.related_threats.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {filteredIOCs.length === 0 && searchTerm && (
              <div className="text-center text-slate-400 py-8">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <div className="text-sm">No IOCs found</div>
                <div className="text-xs">Try different search terms</div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="feeds" className="space-y-4 mt-4">
            {/* Feed Sources */}
            <div className="space-y-3">
              <span className="text-sm text-white">Intelligence Feeds</span>
              <div className="space-y-2">
                {[
                  { name: 'AlienVault OTX', status: 'active', lastUpdate: '2 min ago', iocs: 1247 },
                  { name: 'VirusTotal', status: 'active', lastUpdate: '5 min ago', iocs: 892 },
                  { name: 'PhishTank', status: 'active', lastUpdate: '1 min ago', iocs: 334 },
                  { name: 'Hybrid Analysis', status: 'active', lastUpdate: '8 min ago', iocs: 156 },
                  { name: 'Internal SIEM', status: 'active', lastUpdate: '30 sec ago', iocs: 89 }
                ].map((feed, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-sm text-white">{feed.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-white">{feed.iocs} IOCs</div>
                      <div className="text-xs text-slate-400">{feed.lastUpdate}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feed Statistics */}
            <div className="space-y-2">
              <span className="text-sm text-white">Feed Performance</span>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-green-400">99.8%</div>
                  <div className="text-xs text-slate-400">Uptime</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-blue-400">2.3s</div>
                  <div className="text-xs text-slate-400">Avg Latency</div>
                </div>
              </div>
            </div>

            {/* Manual IOC Addition */}
            <div className="space-y-2">
              <span className="text-sm text-white">Manual Entry</span>
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Custom IOC
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
