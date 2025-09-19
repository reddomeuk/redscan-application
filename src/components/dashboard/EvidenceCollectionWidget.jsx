import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Shield,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Database,
  Search,
  Filter,
  Eye,
  Lock,
  Verified
} from 'lucide-react';
import { complianceAutomationEngine } from '../../services/ComplianceAutomationEngine';
import { format } from 'date-fns';

export default function EvidenceCollectionWidget({ className }) {
  const [evidenceRepository, setEvidenceRepository] = useState([]);
  const [auditTrail, setAuditTrail] = useState([]);
  const [activeTab, setActiveTab] = useState('evidence');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    initializeEvidenceCollection();
    
    // Set up event listeners
    const handleWorkflowCompleted = (result) => {
      if (result.workflowId === 'evidence_collection') {
        updateEvidenceRepository();
      }
    };

    const handleControlTested = (result) => {
      updateEvidenceRepository();
      updateAuditTrail();
    };

    complianceAutomationEngine.on('workflow_completed', handleWorkflowCompleted);
    complianceAutomationEngine.on('control_tested', handleControlTested);

    // Refresh data periodically
    const interval = setInterval(() => {
      updateEvidenceRepository();
      updateAuditTrail();
    }, 60000);

    return () => {
      complianceAutomationEngine.off('workflow_completed', handleWorkflowCompleted);
      complianceAutomationEngine.off('control_tested', handleControlTested);
      clearInterval(interval);
    };
  }, []);

  const initializeEvidenceCollection = async () => {
    try {
      if (!complianceAutomationEngine.isRunning) {
        await complianceAutomationEngine.initialize();
      }
      
      updateEvidenceRepository();
      updateAuditTrail();
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize evidence collection:', error);
      setIsLoading(false);
    }
  };

  const updateEvidenceRepository = () => {
    const evidence = complianceAutomationEngine.getEvidenceRepository();
    setEvidenceRepository(evidence);
  };

  const updateAuditTrail = () => {
    const trail = complianceAutomationEngine.getRecentAuditTrail(24);
    setAuditTrail(trail);
  };

  const handleRefresh = () => {
    updateEvidenceRepository();
    updateAuditTrail();
  };

  const getEvidenceTypeIcon = (type) => {
    switch (type) {
      case 'automated_test': return <Shield className="w-4 h-4 text-blue-400" />;
      case 'policy_document': return <FileText className="w-4 h-4 text-green-400" />;
      case 'audit_log': return <Database className="w-4 h-4 text-purple-400" />;
      case 'screenshot': return <Eye className="w-4 h-4 text-orange-400" />;
      case 'configuration': return <Shield className="w-4 h-4 text-cyan-400" />;
      default: return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getIntegrityStatus = (verified) => {
    return verified ? (
      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
        <Verified className="w-3 h-3 mr-1" />
        Verified
      </Badge>
    ) : (
      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Unverified
      </Badge>
    );
  };

  const filteredEvidence = evidenceRepository.filter(evidence => {
    const matchesSearch = evidence.controlId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evidence.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || evidence.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getEvidenceTypeColor = (type) => {
    switch (type) {
      case 'automated_test': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'policy_document': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'audit_log': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      case 'screenshot': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'configuration': return 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  if (isLoading) {
    return (
      <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-400" />
            Evidence Collection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-slate-400">
            <Database className="w-8 h-8 animate-pulse mr-2" />
            Loading evidence repository...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-green-400" />
          Evidence Collection
          <Badge className="ml-auto bg-green-500/20 text-green-400 border-green-500/30">
            <Database className="w-3 h-3 mr-1" />
            {evidenceRepository.length} Items
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
          <TabsList className="grid w-full grid-cols-2 bg-slate-700/50">
            <TabsTrigger value="evidence" className="text-xs">Evidence Repository</TabsTrigger>
            <TabsTrigger value="audit" className="text-xs">Audit Trail</TabsTrigger>
          </TabsList>

          <TabsContent value="evidence" className="space-y-4 mt-4">
            {/* Search and Filter */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search evidence..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white text-xs placeholder-slate-400 focus:outline-none focus:border-slate-500"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white text-xs focus:outline-none focus:border-slate-500"
                >
                  <option value="all">All Types</option>
                  <option value="automated_test">Automated Tests</option>
                  <option value="policy_document">Policy Docs</option>
                  <option value="audit_log">Audit Logs</option>
                  <option value="screenshot">Screenshots</option>
                  <option value="configuration">Configurations</option>
                </select>
              </div>
            </div>

            {/* Evidence List */}
            <ScrollArea className="h-56">
              <div className="space-y-2">
                {filteredEvidence.map((evidence) => (
                  <div key={evidence.id} className="p-3 bg-slate-700/30 rounded-lg border border-slate-600">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getEvidenceTypeIcon(evidence.type)}
                        <span className="text-sm text-white font-medium">{evidence.controlId}</span>
                      </div>
                      {getIntegrityStatus(evidence.integrity)}
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getEvidenceTypeColor(evidence.type)}>
                        {evidence.type.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        {format(new Date(evidence.timestamp), 'MMM d, HH:mm')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-300">
                        ID: {evidence.id.slice(-8)}
                      </span>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                          <Download className="w-3 h-3 mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {filteredEvidence.length === 0 && (
              <div className="text-center text-slate-400 py-8">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <div className="text-sm">
                  {searchTerm || filterType !== 'all' ? 'No matching evidence found' : 'No evidence collected yet'}
                </div>
                <div className="text-xs">
                  {searchTerm || filterType !== 'all' ? 'Try adjusting your search criteria' : 'Evidence will appear as controls are tested'}
                </div>
              </div>
            )}

            {/* Evidence Summary */}
            <div className="pt-2 border-t border-slate-600">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-700/30 rounded p-2">
                  <div className="text-lg font-bold text-green-400">
                    {evidenceRepository.filter(e => e.integrity).length}
                  </div>
                  <div className="text-xs text-slate-400">Verified</div>
                </div>
                <div className="bg-slate-700/30 rounded p-2">
                  <div className="text-lg font-bold text-blue-400">
                    {evidenceRepository.filter(e => e.type === 'automated_test').length}
                  </div>
                  <div className="text-xs text-slate-400">Automated</div>
                </div>
                <div className="bg-slate-700/30 rounded p-2">
                  <div className="text-lg font-bold text-purple-400">
                    {evidenceRepository.length}
                  </div>
                  <div className="text-xs text-slate-400">Total</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="audit" className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white">Recent Audit Activity</span>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                <Clock className="w-3 h-3 mr-1" />
                Last 24h
              </Badge>
            </div>
            
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {/* Simulated audit trail entries */}
                {[
                  {
                    id: 1,
                    action: 'Evidence Collection',
                    description: 'Automated access review evidence collected for SOC 2 CC6.1',
                    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                    type: 'collection',
                    status: 'success'
                  },
                  {
                    id: 2,
                    action: 'Control Test',
                    description: 'Vulnerability scanning control executed for PCI DSS Req.11',
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                    type: 'test',
                    status: 'success'
                  },
                  {
                    id: 3,
                    action: 'Evidence Validation',
                    description: 'Evidence integrity verification completed for ISO 27001 A.9.1.1',
                    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                    type: 'validation',
                    status: 'success'
                  },
                  {
                    id: 4,
                    action: 'Policy Review',
                    description: 'Automated policy compliance check for GDPR Art.25',
                    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                    type: 'review',
                    status: 'warning'
                  },
                  {
                    id: 5,
                    action: 'Evidence Export',
                    description: 'Audit evidence package generated for Q3 SOC 2 review',
                    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
                    type: 'export',
                    status: 'success'
                  }
                ].map((entry) => (
                  <div key={entry.id} className="p-3 bg-slate-700/30 rounded-lg border border-slate-600">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {entry.type === 'collection' && <Database className="w-4 h-4 text-green-400" />}
                        {entry.type === 'test' && <Shield className="w-4 h-4 text-blue-400" />}
                        {entry.type === 'validation' && <Verified className="w-4 h-4 text-purple-400" />}
                        {entry.type === 'review' && <FileText className="w-4 h-4 text-yellow-400" />}
                        {entry.type === 'export' && <Download className="w-4 h-4 text-orange-400" />}
                        <span className="text-sm text-white font-medium">{entry.action}</span>
                      </div>
                      <Badge className={
                        entry.status === 'success' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        entry.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                        'bg-red-500/20 text-red-400 border-red-500/30'
                      }>
                        {entry.status === 'success' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {entry.status === 'warning' && <AlertTriangle className="w-3 h-3 mr-1" />}
                        {entry.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="text-xs text-slate-300 mb-2">
                      {entry.description}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>
                        {format(new Date(entry.timestamp), 'MMM d, yyyy HH:mm')}
                      </span>
                      <Button size="sm" variant="ghost" className="h-5 px-1 text-xs">
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {auditTrail.length === 0 && (
              <div className="text-center text-slate-400 py-8">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <div className="text-sm">No recent audit activity</div>
                <div className="text-xs">Audit events will appear here as they occur</div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
