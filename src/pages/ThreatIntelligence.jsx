/**
 * Advanced Threat Intelligence Dashboard
 * Enhanced threat hunting, attribution analysis, and campaign tracking
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, Area, AreaChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Brain, Search, Target, Globe, AlertTriangle, Shield, 
  Users, Zap, Eye, Database, Clock, TrendingUp,
  Filter, Download, RefreshCw, Map, Network, Bug,
  Fingerprint, Activity, FileText, Link, Star
} from 'lucide-react';

const ThreatIntelligence = () => {
  const [threatData, setThreatData] = useState({
    feeds: [],
    iocs: [],
    campaigns: [],
    actors: [],
    hunts: [],
    intelligence: []
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [huntingMode, setHuntingMode] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const wsRef = useRef(null);

  useEffect(() => {
    loadThreatIntelligence();
    setupRealTimeConnection();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [selectedTimeRange]);

  const loadThreatIntelligence = async () => {
    setLoading(true);
    try {
      // Simulate loading comprehensive threat intelligence data
      const mockData = generateMockThreatData();
      setThreatData(mockData);
    } catch (error) {
      console.error('Failed to load threat intelligence:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeConnection = () => {
    try {
      wsRef.current = new WebSocket('ws://localhost:3001/threat-intelligence');
      
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        updateRealTimeData(data);
      };
      
      wsRef.current.onopen = () => {
        console.log('Real-time threat intelligence connection established');
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to setup real-time connection:', error);
    }
  };

  const updateRealTimeData = (newData) => {
    setThreatData(prev => ({
      ...prev,
      iocs: [newData.ioc, ...prev.iocs].slice(0, 1000), // Keep last 1000 IOCs
      intelligence: [newData.intelligence, ...prev.intelligence].slice(0, 500)
    }));
  };

  const generateMockThreatData = () => {
    return {
      feeds: [
        {
          id: 'misp_feed',
          name: 'MISP Platform',
          type: 'MISP',
          status: 'active',
          lastSync: '2025-09-18T10:30:00Z',
          iocsIngested: 15847,
          quality: 92,
          reliability: 'high',
          priority: 'critical'
        },
        {
          id: 'otx_feed',
          name: 'AlienVault OTX',
          type: 'OTX',
          status: 'active',
          lastSync: '2025-09-18T10:25:00Z',
          iocsIngested: 23156,
          quality: 88,
          reliability: 'high',
          priority: 'high'
        },
        {
          id: 'vt_feed',
          name: 'VirusTotal',
          type: 'VirusTotal',
          status: 'active',
          lastSync: '2025-09-18T10:20:00Z',
          iocsIngested: 8934,
          quality: 95,
          reliability: 'high',
          priority: 'high'
        },
        {
          id: 'cs_feed',
          name: 'CrowdStrike',
          type: 'CrowdStrike',
          status: 'limited',
          lastSync: '2025-09-18T09:45:00Z',
          iocsIngested: 5672,
          quality: 98,
          reliability: 'very_high',
          priority: 'critical'
        },
        {
          id: 'custom_feed',
          name: 'Internal Sources',
          type: 'Custom',
          status: 'active',
          lastSync: '2025-09-18T10:35:00Z',
          iocsIngested: 2134,
          quality: 85,
          reliability: 'medium',
          priority: 'medium'
        }
      ],
      
      iocs: generateIOCData(),
      campaigns: generateCampaignData(),
      actors: generateThreatActorData(),
      hunts: generateThreatHuntData(),
      intelligence: generateIntelligenceData()
    };
  };

  const generateIOCData = () => {
    const iocTypes = ['ip', 'domain', 'url', 'hash', 'email', 'registry'];
    const threatTypes = ['malware', 'phishing', 'botnet', 'apt', 'ransomware', 'trojan'];
    const sources = ['misp', 'otx', 'virustotal', 'crowdstrike', 'internal'];
    
    return Array.from({ length: 200 }, (_, i) => ({
      id: `ioc_${i + 1}`,
      type: iocTypes[Math.floor(Math.random() * iocTypes.length)],
      value: generateIOCValue(),
      threatType: threatTypes[Math.floor(Math.random() * threatTypes.length)],
      confidence: Math.random() * 0.4 + 0.6, // 60-100%
      severity: Math.floor(Math.random() * 10) + 1,
      firstSeen: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      lastSeen: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      source: sources[Math.floor(Math.random() * sources.length)],
      tags: generateTags(),
      attribution: generateAttribution(),
      campaign: generateCampaign(),
      tlp: ['white', 'green', 'amber', 'red'][Math.floor(Math.random() * 4)],
      active: Math.random() > 0.3,
      correlations: Math.floor(Math.random() * 15),
      enrichment: {
        geolocation: generateGeolocation(),
        whois: generateWhoisData(),
        reputation: Math.floor(Math.random() * 100),
        malwareFamilies: generateMalwareFamilies()
      }
    }));
  };

  const generateCampaignData = () => {
    const campaigns = [
      'Operation Aurora', 'APT1 Comment Crew', 'Carbanak Campaign',
      'Operation Cleaver', 'Lazarus Group Campaign', 'FIN7 Campaign',
      'DarkHalo Campaign', 'SolarWinds Supply Chain', 'Operation GhostSecret',
      'Volt Typhoon', 'Scattered Spider', 'BlackCat Ransomware'
    ];
    
    return campaigns.map((name, i) => ({
      id: `campaign_${i + 1}`,
      name,
      description: `Advanced persistent threat campaign targeting critical infrastructure`,
      status: ['active', 'dormant', 'concluded'][Math.floor(Math.random() * 3)],
      firstSeen: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivity: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      attribution: generateAttribution(),
      targets: generateTargets(),
      ttps: generateTTPs(),
      iocCount: Math.floor(Math.random() * 500) + 50,
      confidence: Math.random() * 0.3 + 0.7,
      severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
      sectors: generateTargetSectors(),
      geography: generateGeography(),
      timeline: generateCampaignTimeline()
    }));
  };

  const generateThreatActorData = () => {
    const actors = [
      'APT1', 'APT28 (Fancy Bear)', 'APT29 (Cozy Bear)', 'Lazarus Group',
      'FIN7', 'Carbanak', 'BlackMatter', 'REvil', 'Conti', 'DarkHalo',
      'HAFNIUM', 'Volt Typhoon', 'Scattered Spider', 'UNC2452'
    ];
    
    return actors.map((name, i) => ({
      id: `actor_${i + 1}`,
      name,
      aliases: generateAliases(name),
      type: ['nation_state', 'cybercriminal', 'hacktivist', 'insider'][Math.floor(Math.random() * 4)],
      sophistication: ['low', 'medium', 'high', 'very_high'][Math.floor(Math.random() * 4)],
      motivation: generateMotivations(),
      attribution: generateDetailedAttribution(),
      firstSeen: new Date(Date.now() - Math.random() * 1000 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivity: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
      campaigns: Math.floor(Math.random() * 20) + 5,
      ttps: generateTTPs(),
      targets: generateTargets(),
      tools: generateTools(),
      infrastructure: generateInfrastructure(),
      confidence: Math.random() * 0.3 + 0.7,
      riskScore: Math.floor(Math.random() * 40) + 60
    }));
  };

  const generateThreatHuntData = () => {
    const huntTypes = ['proactive', 'reactive', 'campaign_based', 'hypothesis_driven'];
    const statuses = ['active', 'completed', 'suspended', 'scheduled'];
    
    return Array.from({ length: 25 }, (_, i) => ({
      id: `hunt_${i + 1}`,
      name: `Threat Hunt ${i + 1}`,
      type: huntTypes[Math.floor(Math.random() * huntTypes.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      hypothesis: `Hypothesis for threat hunt ${i + 1}`,
      startDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : null,
      hunter: ['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson'][Math.floor(Math.random() * 4)],
      dataSource: ['logs', 'network', 'endpoint', 'cloud'][Math.floor(Math.random() * 4)],
      iocMatches: Math.floor(Math.random() * 50),
      findings: Math.floor(Math.random() * 10),
      confidence: Math.random() * 0.4 + 0.6,
      priority: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
      tags: generateTags(),
      queries: generateHuntQueries(),
      results: generateHuntResults()
    }));
  };

  const generateIntelligenceData = () => {
    return Array.from({ length: 100 }, (_, i) => ({
      id: `intel_${i + 1}`,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      type: ['tactical', 'operational', 'strategic'][Math.floor(Math.random() * 3)],
      category: ['malware', 'infrastructure', 'ttps', 'attribution'][Math.floor(Math.random() * 4)],
      title: `Intelligence Report ${i + 1}`,
      summary: `Critical intelligence update regarding emerging threats`,
      confidence: Math.random() * 0.3 + 0.7,
      source: ['misp', 'otx', 'internal', 'partner'][Math.floor(Math.random() * 4)],
      classification: ['unclassified', 'internal', 'confidential'][Math.floor(Math.random() * 3)],
      tlp: ['white', 'green', 'amber', 'red'][Math.floor(Math.random() * 4)],
      tags: generateTags(),
      indicators: Math.floor(Math.random() * 20) + 5,
      relevance: Math.random() * 0.4 + 0.6,
      actionable: Math.random() > 0.3
    }));
  };

  // Helper functions for data generation
  const generateIOCValue = () => {
    const generators = {
      ip: () => `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      domain: () => `malicious${Math.floor(Math.random() * 1000)}.com`,
      url: () => `https://malicious${Math.floor(Math.random() * 1000)}.com/payload.exe`,
      hash: () => Math.random().toString(36).substring(2, 34),
      email: () => `attacker${Math.floor(Math.random() * 100)}@malicious.com`,
      registry: () => `HKEY_LOCAL_MACHINE\\Software\\Malware\\${Math.random().toString(36).substring(7)}`
    };
    
    const types = Object.keys(generators);
    const type = types[Math.floor(Math.random() * types.length)];
    return generators[type]();
  };

  const generateTags = () => {
    const tagPool = [
      'apt', 'malware', 'phishing', 'botnet', 'ransomware', 'trojan',
      'banking', 'credential-theft', 'lateral-movement', 'persistence',
      'defense-evasion', 'command-control', 'exfiltration', 'impact'
    ];
    
    const numTags = Math.floor(Math.random() * 4) + 1;
    const selectedTags = [];
    
    for (let i = 0; i < numTags; i++) {
      const tag = tagPool[Math.floor(Math.random() * tagPool.length)];
      if (!selectedTags.includes(tag)) {
        selectedTags.push(tag);
      }
    }
    
    return selectedTags;
  };

  const generateAttribution = () => {
    const actors = [
      'APT1', 'APT28', 'APT29', 'Lazarus Group', 'FIN7', 'Carbanak',
      'BlackMatter', 'REvil', 'Conti', 'DarkHalo', 'HAFNIUM'
    ];
    
    return Math.random() > 0.6 ? actors[Math.floor(Math.random() * actors.length)] : null;
  };

  const generateCampaign = () => {
    const campaigns = [
      'Operation Aurora', 'APT1 Comment Crew', 'Carbanak Campaign',
      'Operation Cleaver', 'Lazarus Group Campaign', 'SolarWinds Supply Chain'
    ];
    
    return Math.random() > 0.7 ? campaigns[Math.floor(Math.random() * campaigns.length)] : null;
  };

  const generateGeolocation = () => ({
    country: ['Russia', 'China', 'North Korea', 'Iran', 'Unknown'][Math.floor(Math.random() * 5)],
    region: ['Eastern Europe', 'East Asia', 'Middle East', 'Global'][Math.floor(Math.random() * 4)],
    coordinates: {
      lat: (Math.random() - 0.5) * 180,
      lng: (Math.random() - 0.5) * 360
    }
  });

  const generateWhoisData = () => ({
    registrar: ['GoDaddy', 'Namecheap', 'CloudFlare', 'MarkMonitor'][Math.floor(Math.random() * 4)],
    registrationDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    expirationDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    privacy: Math.random() > 0.5
  });

  const generateMalwareFamilies = () => {
    const families = ['Zeus', 'Emotet', 'TrickBot', 'Dridex', 'Qakbot', 'IcedID'];
    return families.filter(() => Math.random() > 0.7);
  };

  const generateTargets = () => {
    const targets = ['Government', 'Financial', 'Healthcare', 'Energy', 'Technology', 'Defense'];
    return targets.filter(() => Math.random() > 0.6);
  };

  const generateTTPs = () => {
    const ttps = [
      'T1566.001', 'T1059.001', 'T1055', 'T1083', 'T1027', 'T1105',
      'T1112', 'T1003', 'T1033', 'T1082', 'T1007', 'T1016'
    ];
    return ttps.filter(() => Math.random() > 0.5);
  };

  const generateTargetSectors = () => {
    const sectors = ['Government', 'Financial', 'Healthcare', 'Energy', 'Technology'];
    return sectors.filter(() => Math.random() > 0.6);
  };

  const generateGeography = () => {
    const regions = ['North America', 'Europe', 'Asia Pacific', 'Middle East', 'Global'];
    return regions.filter(() => Math.random() > 0.7);
  };

  const generateCampaignTimeline = () => {
    return Array.from({ length: 5 }, (_, i) => ({
      date: new Date(Date.now() - (4 - i) * 30 * 24 * 60 * 60 * 1000).toISOString(),
      event: `Campaign milestone ${i + 1}`,
      description: `Description of campaign event ${i + 1}`
    }));
  };

  const generateAliases = (name) => {
    const aliasCount = Math.floor(Math.random() * 3) + 1;
    return Array.from({ length: aliasCount }, (_, i) => `${name} Alias ${i + 1}`);
  };

  const generateMotivations = () => {
    const motivations = ['financial', 'espionage', 'sabotage', 'ideology', 'revenge'];
    return motivations.filter(() => Math.random() > 0.6);
  };

  const generateDetailedAttribution = () => ({
    country: ['Russia', 'China', 'North Korea', 'Iran', 'Unknown'][Math.floor(Math.random() * 5)],
    sponsor: ['State', 'Criminal', 'Hacktivist', 'Unknown'][Math.floor(Math.random() * 4)],
    confidence: Math.random() * 0.3 + 0.7
  });

  const generateTools = () => {
    const tools = ['Cobalt Strike', 'Metasploit', 'Empire', 'PoshC2', 'Custom Tools'];
    return tools.filter(() => Math.random() > 0.6);
  };

  const generateInfrastructure = () => ({
    domains: Math.floor(Math.random() * 50) + 10,
    ips: Math.floor(Math.random() * 100) + 20,
    certificates: Math.floor(Math.random() * 20) + 5,
    hosting: ['VPS', 'Compromised', 'Bulletproof', 'Cloud'][Math.floor(Math.random() * 4)]
  });

  const generateHuntQueries = () => {
    return [
      'event.code:4624 AND user.name:admin*',
      'process.name:powershell.exe AND process.args:*-enc*',
      'network.protocol:dns AND dns.question.name:*.tk'
    ];
  };

  const generateHuntResults = () => {
    return Array.from({ length: Math.floor(Math.random() * 10) }, (_, i) => ({
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      description: `Hunt result ${i + 1}`,
      confidence: Math.random() * 0.4 + 0.6
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800 border-green-200',
      dormant: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      concluded: 'bg-gray-100 text-gray-800 border-gray-200',
      limited: 'bg-orange-100 text-orange-800 border-orange-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      suspended: 'bg-red-100 text-red-800 border-red-200',
      scheduled: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[status] || colors.active;
  };

  const getTLPColor = (tlp) => {
    const colors = {
      white: 'bg-white text-gray-800 border-gray-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      amber: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      red: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[tlp] || colors.white;
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'text-red-600',
      high: 'text-orange-600',
      medium: 'text-yellow-600',
      low: 'text-green-600'
    };
    return colors[severity] || colors.medium;
  };

  const startThreatHunt = async () => {
    setHuntingMode(true);
    
    try {
      console.log('Starting threat hunt...');
      
      // Simulate threat hunting process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate hunt results
      const huntResults = {
        query: searchQuery,
        matches: Math.floor(Math.random() * 50) + 10,
        confidence: Math.random() * 0.4 + 0.6,
        timeRange: selectedTimeRange
      };
      
      console.log('Hunt completed:', huntResults);
      setHuntingMode(false);
      
    } catch (error) {
      console.error('Hunt failed:', error);
      setHuntingMode(false);
    }
  };

  const IOCEnrichmentChart = () => {
    const enrichmentData = [
      { source: 'VirusTotal', count: 156, quality: 95 },
      { source: 'MISP', count: 234, quality: 92 },
      { source: 'OTX', count: 189, quality: 88 },
      { source: 'Internal', count: 67, quality: 85 },
      { source: 'Commercial', count: 123, quality: 98 }
    ];

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={enrichmentData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="source" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#3b82f6" name="IOC Count" />
          <Bar dataKey="quality" fill="#10b981" name="Quality Score" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const ThreatActorNetworkChart = () => {
    const networkData = threatData.actors.slice(0, 8).map(actor => ({
      id: actor.name,
      campaigns: actor.campaigns,
      riskScore: actor.riskScore,
      sophistication: actor.sophistication
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart data={networkData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="campaigns" name="Campaigns" />
          <YAxis dataKey="riskScore" name="Risk Score" />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter dataKey="riskScore" fill="#ef4444" />
        </ScatterChart>
      </ResponsiveContainer>
    );
  };

  const CampaignTimelineChart = () => {
    const timelineData = threatData.campaigns.slice(0, 6).map(campaign => ({
      name: campaign.name.split(' ')[0],
      start: new Date(campaign.firstSeen).getTime(),
      end: new Date(campaign.lastActivity).getTime(),
      iocs: campaign.iocCount
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={timelineData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="iocs" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-2">
          <Brain className="w-6 h-6 animate-pulse" />
          <span>Loading Threat Intelligence...</span>
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
            <span>Threat Intelligence</span>
          </h1>
          <p className="text-gray-600 mt-1">
            Advanced threat hunting, attribution analysis, and campaign tracking
          </p>
        </div>
        
        <div className="flex space-x-2">
          <select 
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Threat Hunt Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search IOCs, campaigns, threat actors, or enter hunt query..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Button 
              onClick={startThreatHunt}
              disabled={huntingMode}
              className="bg-red-600 hover:bg-red-700"
            >
              {huntingMode ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              {huntingMode ? 'Hunting...' : 'Hunt'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active IOCs</p>
                <p className="text-2xl font-bold text-blue-600">
                  {threatData.iocs.filter(ioc => ioc.active).length.toLocaleString()}
                </p>
              </div>
              <Database className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                <p className="text-2xl font-bold text-orange-600">
                  {threatData.campaigns.filter(c => c.status === 'active').length}
                </p>
              </div>
              <Target className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Threat Actors</p>
                <p className="text-2xl font-bold text-red-600">{threatData.actors.length}</p>
              </div>
              <Users className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Hunts</p>
                <p className="text-2xl font-bold text-green-600">
                  {threatData.hunts.filter(h => h.status === 'active').length}
                </p>
              </div>
              <Eye className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Feed Quality</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(threatData.feeds.reduce((sum, feed) => sum + feed.quality, 0) / threatData.feeds.length)}%
                </p>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Risk IOCs</p>
                <p className="text-2xl font-bold text-red-600">
                  {threatData.iocs.filter(ioc => ioc.severity >= 8).length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hunting Mode Alert */}
      {huntingMode && (
        <Alert>
          <Search className="h-4 w-4" />
          <AlertDescription>
            Threat hunting in progress... Analyzing data sources and correlating indicators.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="iocs">IOCs</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="actors">Threat Actors</TabsTrigger>
          <TabsTrigger value="hunting">Threat Hunting</TabsTrigger>
          <TabsTrigger value="feeds">Intelligence Feeds</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>IOC Enrichment Sources</CardTitle>
                <CardDescription>Intelligence sources and quality metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <IOCEnrichmentChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Threat Actor Risk Assessment</CardTitle>
                <CardDescription>Actor sophistication vs campaign activity</CardDescription>
              </CardHeader>
              <CardContent>
                <ThreatActorNetworkChart />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Activity Timeline</CardTitle>
                <CardDescription>IOC volume by campaign over time</CardDescription>
              </CardHeader>
              <CardContent>
                <CampaignTimelineChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Intelligence Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {threatData.intelligence.slice(0, 10).map(intel => (
                    <div key={intel.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <FileText className="w-4 h-4 text-gray-600" />
                          <span className="font-medium text-sm">{intel.title}</span>
                          <Badge className={getTLPColor(intel.tlp)}>
                            TLP:{intel.tlp.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600">{intel.summary}</p>
                        <div className="flex items-center space-x-3 mt-2">
                          <span className="text-xs text-gray-500">Source: {intel.source}</span>
                          <span className="text-xs text-gray-500">Confidence: {Math.round(intel.confidence * 100)}%</span>
                          <span className="text-xs text-gray-500">IOCs: {intel.indicators}</span>
                        </div>
                      </div>
                      <Badge variant={intel.actionable ? 'default' : 'secondary'}>
                        {intel.actionable ? 'Actionable' : 'FYI'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* IOCs Tab */}
        <TabsContent value="iocs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Indicators of Compromise</CardTitle>
              <CardDescription>Threat indicators with enrichment and correlation data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {threatData.iocs.slice(0, 20).map(ioc => (
                  <div key={ioc.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge variant="outline">{ioc.type.toUpperCase()}</Badge>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">{ioc.value}</code>
                          <Badge className={getTLPColor(ioc.tlp)}>
                            TLP:{ioc.tlp.toUpperCase()}
                          </Badge>
                          {ioc.active && (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              Active
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Threat Type:</span>
                            <p className="font-medium">{ioc.threatType}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Severity:</span>
                            <p className={`font-medium ${getSeverityColor(ioc.severity >= 8 ? 'critical' : ioc.severity >= 6 ? 'high' : ioc.severity >= 4 ? 'medium' : 'low')}`}>
                              {ioc.severity}/10
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Confidence:</span>
                            <p className="font-medium">{Math.round(ioc.confidence * 100)}%</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Correlations:</span>
                            <p className="font-medium">{ioc.correlations}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-3">
                          <span className="text-xs text-gray-500">Source: {ioc.source}</span>
                          <span className="text-xs text-gray-500">First seen: {new Date(ioc.firstSeen).toLocaleDateString()}</span>
                          {ioc.attribution && (
                            <span className="text-xs text-blue-600">Attribution: {ioc.attribution}</span>
                          )}
                          {ioc.campaign && (
                            <span className="text-xs text-purple-600">Campaign: {ioc.campaign}</span>
                          )}
                        </div>
                        {ioc.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {ioc.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Analyze
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Threat Campaigns</CardTitle>
              <CardDescription>Active and historical threat campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {threatData.campaigns.map(campaign => (
                  <div key={campaign.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg">{campaign.name}</h3>
                          <Badge className={getStatusColor(campaign.status)}>
                            {campaign.status}
                          </Badge>
                          <Badge className={getStatusColor(campaign.severity)}>
                            {campaign.severity}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{campaign.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">IOCs:</span>
                            <p className="font-medium">{campaign.iocCount.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Confidence:</span>
                            <p className="font-medium">{Math.round(campaign.confidence * 100)}%</p>
                          </div>
                          <div>
                            <span className="text-gray-600">First Seen:</span>
                            <p className="font-medium">{new Date(campaign.firstSeen).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Last Activity:</span>
                            <p className="font-medium">{new Date(campaign.lastActivity).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {campaign.attribution && (
                          <p className="text-sm text-blue-600 mt-2">
                            <strong>Attribution:</strong> {campaign.attribution}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-3">
                          <div className="text-xs text-gray-600">
                            <strong>Targets:</strong> {campaign.targets.join(', ')}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <div className="text-xs text-gray-600">
                            <strong>TTPs:</strong> {campaign.ttps.slice(0, 5).join(', ')}
                            {campaign.ttps.length > 5 && '...'}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Target className="w-4 h-4 mr-2" />
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Threat Actors Tab */}
        <TabsContent value="actors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Threat Actors</CardTitle>
              <CardDescription>Known threat actors and their capabilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {threatData.actors.map(actor => (
                  <div key={actor.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg">{actor.name}</h3>
                          <Badge className={getStatusColor(actor.type)}>
                            {actor.type.replace('_', ' ')}
                          </Badge>
                          <Badge className={getStatusColor(actor.sophistication)}>
                            {actor.sophistication.replace('_', ' ')} sophistication
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-600">Risk Score:</span>
                            <p className={`font-medium ${getSeverityColor(actor.riskScore >= 80 ? 'critical' : actor.riskScore >= 60 ? 'high' : 'medium')}`}>
                              {actor.riskScore}/100
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Campaigns:</span>
                            <p className="font-medium">{actor.campaigns}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Confidence:</span>
                            <p className="font-medium">{Math.round(actor.confidence * 100)}%</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Last Activity:</span>
                            <p className="font-medium">{new Date(actor.lastActivity).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {actor.aliases.length > 0 && (
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Aliases:</strong> {actor.aliases.join(', ')}
                          </p>
                        )}
                        <div className="text-sm text-gray-600 mb-2">
                          <strong>Motivation:</strong> {actor.motivation.join(', ')}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          <strong>Targets:</strong> {actor.targets.join(', ')}
                        </div>
                        <div className="text-sm text-gray-600">
                          <strong>Tools:</strong> {actor.tools.join(', ')}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Users className="w-4 h-4 mr-2" />
                        Profile
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Threat Hunting Tab */}
        <TabsContent value="hunting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Threat Hunts</CardTitle>
              <CardDescription>Ongoing and completed threat hunting activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {threatData.hunts.map(hunt => (
                  <div key={hunt.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold">{hunt.name}</h3>
                          <Badge className={getStatusColor(hunt.status)}>
                            {hunt.status}
                          </Badge>
                          <Badge className={getStatusColor(hunt.priority)}>
                            {hunt.priority} priority
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{hunt.hypothesis}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Hunter:</span>
                            <p className="font-medium">{hunt.hunter}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Data Source:</span>
                            <p className="font-medium">{hunt.dataSource}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">IOC Matches:</span>
                            <p className="font-medium">{hunt.iocMatches}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Findings:</span>
                            <p className="font-medium">{hunt.findings}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-3">
                          <span className="text-xs text-gray-500">Start: {new Date(hunt.startDate).toLocaleDateString()}</span>
                          {hunt.endDate && (
                            <span className="text-xs text-gray-500">End: {new Date(hunt.endDate).toLocaleDateString()}</span>
                          )}
                          <span className="text-xs text-gray-500">Confidence: {Math.round(hunt.confidence * 100)}%</span>
                        </div>
                        {hunt.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {hunt.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Results
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Intelligence Feeds Tab */}
        <TabsContent value="feeds" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Intelligence Feeds</CardTitle>
              <CardDescription>Threat intelligence feed status and metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {threatData.feeds.map(feed => (
                  <div key={feed.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold">{feed.name}</h3>
                          <Badge className={getStatusColor(feed.status)}>
                            {feed.status}
                          </Badge>
                          <Badge className={getStatusColor(feed.reliability)}>
                            {feed.reliability.replace('_', ' ')} reliability
                          </Badge>
                          <Badge className={getStatusColor(feed.priority)}>
                            {feed.priority} priority
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Type:</span>
                            <p className="font-medium">{feed.type}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">IOCs Ingested:</span>
                            <p className="font-medium">{feed.iocsIngested.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Quality Score:</span>
                            <p className="font-medium">{feed.quality}%</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Last Sync:</span>
                            <p className="font-medium">{new Date(feed.lastSync).toLocaleTimeString()}</p>
                          </div>
                        </div>
                        <Progress value={feed.quality} className="mt-3" />
                      </div>
                      <div className="text-right ml-4">
                        <Button variant="outline" size="sm">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Sync
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Intelligence Reports</CardTitle>
              <CardDescription>Strategic, operational, and tactical intelligence reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {threatData.intelligence.slice(0, 15).map(intel => (
                  <div key={intel.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <FileText className="w-5 h-5 text-gray-600" />
                          <h3 className="font-semibold">{intel.title}</h3>
                          <Badge variant="outline">{intel.type}</Badge>
                          <Badge className={getTLPColor(intel.tlp)}>
                            TLP:{intel.tlp.toUpperCase()}
                          </Badge>
                          {intel.actionable && (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              Actionable
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">{intel.summary}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Category:</span>
                            <p className="font-medium">{intel.category}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Source:</span>
                            <p className="font-medium">{intel.source}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Confidence:</span>
                            <p className="font-medium">{Math.round(intel.confidence * 100)}%</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Indicators:</span>
                            <p className="font-medium">{intel.indicators}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-3">
                          <span className="text-xs text-gray-500">
                            Published: {new Date(intel.timestamp).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-gray-500">
                            Classification: {intel.classification}
                          </span>
                          <span className="text-xs text-gray-500">
                            Relevance: {Math.round(intel.relevance * 100)}%
                          </span>
                        </div>
                        {intel.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {intel.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4 mr-2" />
                        Read
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ThreatIntelligence;
