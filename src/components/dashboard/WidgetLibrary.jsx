import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { realTimeService } from '@/services/RealTimeDataService';
import { 
  Shield, 
  Target, 
  Mail, 
  Award, 
  Smartphone, 
  Building2, 
  BookOpen,
  BarChart,
  PieChart,
  LineChart,
  Hash,
  Search,
  Wifi,
  WifiOff
} from 'lucide-react';
import { toast } from 'sonner';

const WIDGET_CATEGORIES = {
  'risk': {
    title: 'Risk Governance',
    icon: Shield,
    widgets: [
      { id: 'top-risks', name: 'Top 5 Risks', description: 'Highest scoring risks by severity (Real-time)', type: 'table', component: 'TopRisks', realTime: true },
      { id: 'risk-heatmap', name: 'Risk Heatmap', description: 'Likelihood vs Impact matrix', type: 'heatmap', component: 'RiskHeatmap', realTime: false },
      { id: 'accepted-risks', name: 'Accepted Risks', description: 'Risks nearing expiry', type: 'list', component: 'AcceptedRisks', realTime: false },
      { id: 'framework-risks', name: 'Risks by Framework', description: 'Risk count per compliance framework', type: 'bar_chart', component: 'FrameworkRisks', realTime: false }
    ]
  },
  'attack-surface': {
    title: 'Attack Surface',
    icon: Target,
    widgets: [
      { id: 'new-paths', name: 'New Attack Paths', description: 'Recently discovered paths (Real-time)', type: 'counter', component: 'AttackPaths', realTime: true },
      { id: 'path-trends', name: 'Path Trends', description: 'Resolved vs persisting paths', type: 'line_chart', component: 'PathTrends', realTime: true },
      { id: 'critical-path', name: 'Most Critical Path', description: 'Highest risk path with remediation', type: 'card', component: 'CriticalPath', realTime: false }
    ]
  },
  'phishing': {
    title: 'Phishing Simulator',
    icon: Mail,
    widgets: [
      { id: 'active-campaigns', name: 'Active Campaigns', description: 'Campaign status and metrics (Live updates)', type: 'list', component: 'ActiveCampaigns', realTime: true },
      { id: 'training-completion', name: 'Training Completion', description: 'Completion rates by department', type: 'bar_chart', component: 'TrainingCompletion', realTime: true },
      { id: 'risky-users', name: 'Users Needing Training', description: 'Users who failed recent campaigns', type: 'list', component: 'RiskyUsers', realTime: true },
      { id: 'phishing-summary', name: 'Campaign Summary', description: 'Last campaign results', type: 'card', component: 'PhishingSummary', realTime: false }
    ]
  },
  'compliance': {
    title: 'Compliance',
    icon: Award,
    widgets: [
      { id: 'ce-readiness', name: 'CE+ Readiness Score', description: 'Current compliance percentage (Real-time)', type: 'gauge', component: 'CEReadiness', realTime: true },
      { id: 'framework-coverage', name: 'Framework Coverage', description: 'Progress across all frameworks', type: 'progress', component: 'FrameworkCoverage', realTime: true },
      { id: 'control-gaps', name: 'Open Control Gaps', description: 'Failing controls by priority (Live)', type: 'list', component: 'ControlGaps', realTime: true }
    ]
  },
  'endpoints': {
    title: 'Endpoints',
    icon: Smartphone,
    widgets: [
      { id: 'compliance-overview', name: 'Device Compliance', description: 'Compliant vs non-compliant devices (Live)', type: 'pie_chart', component: 'EndpointCompliance', realTime: true },
      { id: 'encryption-coverage', name: 'Encryption Coverage', description: 'Encryption status by platform', type: 'progress', component: 'EncryptionCoverage', realTime: true },
      { id: 'patch-sla', name: 'Patch SLA', description: 'Devices within patching SLA (Real-time)', type: 'gauge', component: 'PatchSLA', realTime: true }
    ]
  },
  'suppliers': {
    title: 'Suppliers',
    icon: Building2,
    widgets: [
      { id: 'supplier-risks', name: 'High Risk Suppliers', description: 'Suppliers requiring attention', type: 'list', component: 'SupplierRisks', realTime: false },
      { id: 'sla-breaches', name: 'SLA Breaches', description: 'Suppliers missing SLAs (Live updates)', type: 'list', component: 'SLABreaches', realTime: true },
      { id: 'missing-certs', name: 'Missing Certifications', description: 'Required certifications status', type: 'list', component: 'MissingCertifications', realTime: false }
    ]
  },
  'threat-intel': {
    title: 'Threat Intelligence',
    icon: BookOpen,
    widgets: [
      { id: 'critical-cves', name: 'Critical CVEs', description: 'High-impact CVEs affecting assets (Real-time)', type: 'list', component: 'CriticalCVEs', realTime: true },
      { id: 'ai-summaries', name: 'AI Threat Summaries', description: 'AI-generated threat briefings (Live)', type: 'card', component: 'AISummaries', realTime: true }
    ]
  }
};

const getTypeIcon = (type) => {
  switch(type) {
    case 'bar_chart': return <BarChart className="w-4 h-4" />;
    case 'pie_chart': return <PieChart className="w-4 h-4" />;
    case 'line_chart': return <LineChart className="w-4 h-4" />;
    case 'counter': return <Hash className="w-4 h-4" />;
    default: return <BarChart className="w-4 h-4" />;
  }
};

export default function WidgetLibrary({ isOpen, onClose, onAddWidget }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('risk');
  const [connectionStatus, setConnectionStatus] = useState(null);

  useEffect(() => {
    // Subscribe to real-time connection status
    const unsubscribe = realTimeService.subscribe('connection', (status) => {
      setConnectionStatus(status);
    });

    // Get initial status
    setConnectionStatus(realTimeService.getConnectionStatus());

    return unsubscribe;
  }, []);

  const handleAddWidget = (widget, category) => {
    const widgetConfig = {
      id: `${category}-${widget.id}-${Date.now()}`,
      component: widget.component,
      title: widget.name,
      config: {
        type: widget.type,
        category: category,
        realTime: widget.realTime || false,
        dataSource: widget.realTime ? 'realtime' : 'api'
      }
    };

    onAddWidget(widgetConfig);
    
    const message = widget.realTime ? 
      `${widget.name} added with real-time data connection` :
      `${widget.name} added to dashboard`;
    
    toast.success(message);
  };

  const filteredWidgets = searchTerm 
    ? Object.entries(WIDGET_CATEGORIES).reduce((acc, [key, category]) => {
        const filtered = category.widgets.filter(w => 
          w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (filtered.length > 0) {
          acc[key] = { ...category, widgets: filtered };
        }
        return acc;
      }, {})
    : WIDGET_CATEGORIES;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Widget Library</span>
            <div className="flex items-center gap-2">
              {connectionStatus?.connected ? 
                <Wifi className="w-4 h-4 text-green-400" title="Real-time data available" /> :
                <WifiOff className="w-4 h-4 text-red-400" title="Real-time data unavailable" />
              }
              <Badge 
                variant={connectionStatus?.connected ? "default" : "destructive"} 
                className="text-xs"
              >
                {connectionStatus?.connected ? 'Live Data' : 'Static Data'}
              </Badge>
            </div>
          </DialogTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search widgets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-900 border-slate-700"
            />
          </div>
        </DialogHeader>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="bg-slate-900 overflow-x-auto">
            {Object.entries(filteredWidgets).map(([key, category]) => {
              const IconComponent = category.icon;
              return (
                <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                  <IconComponent className="w-4 h-4" />
                  {category.title}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {Object.entries(filteredWidgets).map(([key, category]) => (
            <TabsContent key={key} value={key} className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {category.widgets.map((widget) => (
                  <div key={widget.id} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(widget.type)}
                        <h4 className="font-medium text-white">{widget.name}</h4>
                        {widget.realTime && (
                          <Badge variant="outline" className="text-xs border-green-400 text-green-400">
                            Live
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {widget.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{widget.description}</p>
                    {widget.realTime && !connectionStatus?.connected && (
                      <p className="text-xs text-orange-400 mb-2">
                        ⚠️ Real-time features will work in static mode
                      </p>
                    )}
                    <Button 
                      size="sm" 
                      onClick={() => handleAddWidget(widget, key)}
                      className="w-full bg-[#B00020] hover:bg-[#8B0000]"
                    >
                      Add Widget
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex justify-end pt-4 border-t border-slate-700">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}