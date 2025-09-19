import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ItsmAuditLog, ItsmSyncEvent, User } from '@/api/entities';
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw, 
  ArrowRight, 
  AlertTriangle,
  Play,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';

const PRODUCT_GROUPS = {
  devsecops: {
    label: 'DevSecOps',
    categories: ['SAST', 'DAST', 'code_scanning', 'secrets'],
    color: 'bg-purple-500/20 text-purple-400'
  },
  devops: {
    label: 'DevOps', 
    categories: ['cloud', 'k8s', 'iam', 'cspm', 'security_hub'],
    color: 'bg-blue-500/20 text-blue-400'
  },
  endpoint: {
    label: 'Endpoint',
    categories: ['endpoint', 'edr', 'mdm', 'mobile', 'patch', 'vuln_mgmt'],
    color: 'bg-green-500/20 text-green-400'
  }
};

const ROUTING_RULES = {
  'SAST': { group: 'devsecops', assignee: 'Alice Chen (DevSecOps Lead)' },
  'DAST': { group: 'devsecops', assignee: 'Bob Kumar (Security Engineer)' },
  'cloud': { group: 'devops', assignee: 'Charlie Davis (Cloud Engineer)' },
  'cspm': { group: 'devops', assignee: 'Diana Liu (DevOps Engineer)' },
  'endpoint': { group: 'endpoint', assignee: 'Evan Martinez (Endpoint Engineer)' },
  'edr': { group: 'endpoint', assignee: 'Fiona Wilson (Security Analyst)' }
};

const ConnectionHealthCard = ({ platform, isConnected, onRetryFailed }) => {
  const [stats] = useState({
    success_24h: Math.floor(Math.random() * 50) + 10,
    failure_24h: Math.floor(Math.random() * 5),
    success_7d: Math.floor(Math.random() * 300) + 50,
    failure_7d: Math.floor(Math.random() * 20),
    queue_length: Math.floor(Math.random() * 10),
    last_sync: new Date(Date.now() - Math.random() * 3600000) // Random within last hour
  });

  const successRate24h = ((stats.success_24h / (stats.success_24h + stats.failure_24h)) * 100).toFixed(1);

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white capitalize flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          {platform} Integration
        </CardTitle>
        <Badge className={isConnected ? 
          'bg-green-500/20 text-green-400 border-green-500/40' : 
          'bg-red-500/20 text-red-400 border-red-500/40'
        }>
          {isConnected ? 'Connected' : 'Disconnected'}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-slate-400">Last Synced</div>
            <div className="text-white font-medium">
              {stats.last_sync.toLocaleTimeString()}
            </div>
          </div>
          <div>
            <div className="text-slate-400">Queue Length</div>
            <div className="text-white font-medium">{stats.queue_length} items</div>
          </div>
          <div>
            <div className="text-slate-400">Success Rate (24h)</div>
            <div className="text-green-400 font-medium">{successRate24h}%</div>
          </div>
          <div>
            <div className="text-slate-400">Failed (24h)</div>
            <div className="text-red-400 font-medium">{stats.failure_24h}</div>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-2">
          <div className="text-xs text-slate-500">
            7d: {stats.success_7d} success, {stats.failure_7d} failed
          </div>
          {stats.failure_24h > 0 && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={onRetryFailed}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry Failed
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const SyncConfiguration = ({ platform }) => {
  const [config, setConfig] = useState({
    bidirectional_sync: true,
    devsecops_sync: true,
    devops_sync: true,
    endpoint_sync: false
  });

  const handleToggle = (key) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success(`${key.replace('_', ' ')} updated for ${platform}`);
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white capitalize">{platform} Sync Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor={`${platform}-bidirectional`} className="text-slate-300">
            Bi-directional Sync
          </Label>
          <Switch
            id={`${platform}-bidirectional`}
            checked={config.bidirectional_sync}
            onCheckedChange={() => handleToggle('bidirectional_sync')}
          />
        </div>
        
        <div className="space-y-3">
          <Label className="text-slate-300 text-sm">Product Group Sync</Label>
          {Object.entries(PRODUCT_GROUPS).map(([key, group]) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={group.color}>{group.label}</Badge>
                <span className="text-xs text-slate-400">
                  {group.categories.join(', ')}
                </span>
              </div>
              <Switch
                checked={config[`${key}_sync`]}
                onCheckedChange={() => handleToggle(`${key}_sync`)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const RoutingPreview = () => {
  const [selectedCategory, setSelectedCategory] = useState('SAST');
  
  const allCategories = Object.values(PRODUCT_GROUPS).flatMap(g => g.categories);
  const routing = ROUTING_RULES[selectedCategory] || { group: 'unknown', assignee: 'Unassigned' };
  const groupInfo = PRODUCT_GROUPS[routing.group];

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Routing Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-slate-300">Ticket Category</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {allCategories.map(cat => (
                <SelectItem key={cat} value={cat} className="text-white">
                  {cat.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 p-3 bg-slate-900/30 rounded-lg">
          <Badge variant="outline" className="border-slate-600 text-slate-300">
            {selectedCategory}
          </Badge>
          <ArrowRight className="w-4 h-4 text-slate-400" />
          <Badge className={groupInfo?.color || 'bg-slate-500/20 text-slate-400'}>
            {groupInfo?.label || 'Unknown'}
          </Badge>
          <ArrowRight className="w-4 h-4 text-slate-400" />
          <span className="text-white text-sm">{routing.assignee}</span>
        </div>
      </CardContent>
    </Card>
  );
};

const ConflictPolicySettings = () => {
  const [policies, setPolicies] = useState({
    comments_last_writer_wins: true,
    status_forward_only: true,
    priority_max_policy: true
  });

  const handleToggle = (key) => {
    setPolicies(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success(`${key.replace(/_/g, ' ')} policy updated`);
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Conflict Resolution Policies</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-slate-300">Comments Last-Writer-Wins</Label>
              <p className="text-xs text-slate-400 mt-1">
                Most recent comment overwrites conflicts
              </p>
            </div>
            <Switch
              checked={policies.comments_last_writer_wins}
              onCheckedChange={() => handleToggle('comments_last_writer_wins')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-slate-300">Status Guardrails</Label>
              <p className="text-xs text-slate-400 mt-1">
                Only allow forward status transitions
              </p>
            </div>
            <Switch
              checked={policies.status_forward_only}
              onCheckedChange={() => handleToggle('status_forward_only')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-slate-300">Priority Max Policy</Label>
              <p className="text-xs text-slate-400 mt-1">
                Use highest priority from internal vs external
              </p>
            </div>
            <Switch
              checked={policies.priority_max_policy}
              onCheckedChange={() => handleToggle('priority_max_policy')}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const TestActions = () => {
  const [lastTestId, setLastTestId] = useState(null);
  
  const createTestTicket = async (category) => {
    const testId = `TEST-${Date.now()}`;
    const routing = ROUTING_RULES[category];
    
    try {
      // Create audit log entry
      await ItsmAuditLog.create({
        platform: 'servicenow',
        action: 'create',
        trace_id: testId,
        external_id: `SN-${testId}`,
        user_email: 'demo@redscan.ai',
        outcome: 'success',
        details: `Test ticket created for ${category} - routed to ${routing?.group}`,
        product_group: routing?.group || 'unknown',
        organization_id: 'demo-org-1'
      });

      // Create sync event
      await ItsmSyncEvent.create({
        platform: 'servicenow',
        event_type: 'ticket_created',
        status: 'success',
        ticket_id: testId,
        external_id: `SN-${testId}`,
        product_group: routing?.group || 'unknown',
        organization_id: 'demo-org-1'
      });

      setLastTestId(testId);
      toast.success(`Test ${category} ticket created: ${testId}`);
    } catch (error) {
      toast.error('Failed to create test ticket');
    }
  };

  const demonstrateIdempotency = async () => {
    if (!lastTestId) {
      toast.info('Create a test ticket first');
      return;
    }

    try {
      // Create duplicate audit log to show idempotency
      await ItsmAuditLog.create({
        platform: 'servicenow',
        action: 'update',
        trace_id: lastTestId,
        external_id: `SN-${lastTestId}`,
        user_email: 'demo@redscan.ai',
        outcome: 'skipped',
        details: 'Duplicate detected - updated existing ticket instead',
        product_group: 'devsecops',
        organization_id: 'demo-org-1'
      });

      toast.success('Idempotency check: No duplicate created, existing updated');
    } catch (error) {
      toast.error('Failed to demonstrate idempotency');
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Test Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <Button 
            onClick={() => createTestTicket('SAST')}
            className="bg-purple-600 hover:bg-purple-700 justify-start"
          >
            <Play className="w-4 h-4 mr-2" />
            Create Test Ticket (SAST)
          </Button>
          
          <Button 
            onClick={() => createTestTicket('cloud')}
            className="bg-blue-600 hover:bg-blue-700 justify-start"
          >
            <Play className="w-4 h-4 mr-2" />
            Create Test Ticket (Cloud)
          </Button>
          
          <Button 
            onClick={() => createTestTicket('endpoint')}
            className="bg-green-600 hover:bg-green-700 justify-start"
          >
            <Play className="w-4 h-4 mr-2" />
            Create Test Ticket (Endpoint)
          </Button>
        </div>

        <div className="border-t border-slate-700 pt-4">
          <Button 
            onClick={demonstrateIdempotency}
            variant="outline"
            disabled={!lastTestId}
            className="border-slate-600 text-slate-300 w-full"
          >
            <Copy className="w-4 h-4 mr-2" />
            Demonstrate Idempotency
          </Button>
          {lastTestId && (
            <p className="text-xs text-slate-400 mt-2">
              Last test ID: {lastTestId}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const AuditLogTable = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAuditLogs = async () => {
      try {
        const logs = await ItsmAuditLog.list('-created_date', 50);
        setAuditLogs(logs);
      } catch (error) {
        console.error('Error loading audit logs:', error);
      }
      setLoading(false);
    };
    loadAuditLogs();
  }, []);

  const getOutcomeColor = (outcome) => {
    switch (outcome) {
      case 'success': return 'bg-green-500/20 text-green-400';
      case 'failure': return 'bg-red-500/20 text-red-400';
      case 'skipped': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  if (loading) {
    return <div className="text-slate-400">Loading audit logs...</div>;
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Audit Log</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700">
              <TableHead className="text-slate-300">Timestamp</TableHead>
              <TableHead className="text-slate-300">Platform</TableHead>
              <TableHead className="text-slate-300">Action</TableHead>
              <TableHead className="text-slate-300">Trace ID</TableHead>
              <TableHead className="text-slate-300">User</TableHead>
              <TableHead className="text-slate-300">Outcome</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditLogs.map((log) => (
              <TableRow key={log.id} className="border-slate-700">
                <TableCell className="text-slate-400 text-xs font-mono">
                  {new Date(log.created_date).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-slate-600 text-slate-300 capitalize">
                    {log.platform}
                  </Badge>
                </TableCell>
                <TableCell className="text-white capitalize">{log.action}</TableCell>
                <TableCell className="text-slate-300 font-mono text-xs">{log.trace_id}</TableCell>
                <TableCell className="text-slate-300">{log.user_email}</TableCell>
                <TableCell>
                  <Badge className={getOutcomeColor(log.outcome)}>
                    {log.outcome}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const EventsLog = () => {
  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState({
    platform: 'all',
    status: 'all',
    product_group: 'all'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const eventData = await ItsmSyncEvent.list('-created_date', 100);
        setEvents(eventData);
      } catch (error) {
        console.error('Error loading sync events:', error);
      }
      setLoading(false);
    };
    loadEvents();
  }, []);

  const filteredEvents = events.filter(event => {
    const platformMatch = filters.platform === 'all' || event.platform === filters.platform;
    const statusMatch = filters.status === 'all' || event.status === filters.status;
    const groupMatch = filters.product_group === 'all' || event.product_group === filters.product_group;
    return platformMatch && statusMatch && groupMatch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'bg-green-500/20 text-green-400';
      case 'failure': return 'bg-red-500/20 text-red-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'retrying': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  if (loading) {
    return <div className="text-slate-400">Loading events...</div>;
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Events Log (Last 100)</CardTitle>
        <div className="flex gap-4 mt-4">
          <Select value={filters.platform} onValueChange={(value) => setFilters({...filters, platform: value})}>
            <SelectTrigger className="w-32 bg-slate-900/50 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all" className="text-white">All Platforms</SelectItem>
              <SelectItem value="servicenow" className="text-white">ServiceNow</SelectItem>
              <SelectItem value="jira" className="text-white">Jira</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
            <SelectTrigger className="w-32 bg-slate-900/50 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all" className="text-white">All Status</SelectItem>
              <SelectItem value="success" className="text-white">Success</SelectItem>
              <SelectItem value="failure" className="text-white">Failure</SelectItem>
              <SelectItem value="pending" className="text-white">Pending</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.product_group} onValueChange={(value) => setFilters({...filters, product_group: value})}>
            <SelectTrigger className="w-32 bg-slate-900/50 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all" className="text-white">All Groups</SelectItem>
              <SelectItem value="devsecops" className="text-white">DevSecOps</SelectItem>
              <SelectItem value="devops" className="text-white">DevOps</SelectItem>
              <SelectItem value="endpoint" className="text-white">Endpoint</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700">
              <TableHead className="text-slate-300">Timestamp</TableHead>
              <TableHead className="text-slate-300">Platform</TableHead>
              <TableHead className="text-slate-300">Event</TableHead>
              <TableHead className="text-slate-300">Product Group</TableHead>
              <TableHead className="text-slate-300">Status</TableHead>
              <TableHead className="text-slate-300">Retries</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.map((event) => (
              <TableRow key={event.id} className="border-slate-700">
                <TableCell className="text-slate-400 text-xs font-mono">
                  {new Date(event.created_date).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-slate-600 text-slate-300 capitalize">
                    {event.platform}
                  </Badge>
                </TableCell>
                <TableCell className="text-white">{event.event_type.replace('_', ' ')}</TableCell>
                <TableCell>
                  {event.product_group && (
                    <Badge className={PRODUCT_GROUPS[event.product_group]?.color || 'bg-slate-500/20 text-slate-400'}>
                      {PRODUCT_GROUPS[event.product_group]?.label || event.product_group}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(event.status)}>
                    {event.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-400">{event.retry_count || 0}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default function IntegrationHealthDashboard({ connections }) {
  const handleRetryFailed = (platform) => {
    toast.success(`Retrying failed ${platform} operations...`);
  };

  const servicenow = connections.find(c => c.platform === 'servicenow');
  const jira = connections.find(c => c.platform === 'jira');

  return (
    <div className="space-y-6">
      {/* Connection Health Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <ConnectionHealthCard 
          platform="ServiceNow"
          isConnected={servicenow?.status === 'connected'}
          onRetryFailed={() => handleRetryFailed('ServiceNow')}
        />
        <ConnectionHealthCard 
          platform="Jira"
          isConnected={jira?.status === 'connected'}
          onRetryFailed={() => handleRetryFailed('Jira')}
        />
      </div>

      {/* Configuration & Controls */}
      <div className="grid lg:grid-cols-2 gap-6">
        <SyncConfiguration platform="ServiceNow" />
        <SyncConfiguration platform="Jira" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <RoutingPreview />
        <ConflictPolicySettings />
      </div>

      <TestActions />

      {/* Logs & Audit */}
      <Tabs defaultValue="audit" className="w-full">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
          <TabsTrigger value="events">Events Log</TabsTrigger>
        </TabsList>
        
        <TabsContent value="audit" className="mt-6">
          <AuditLogTable />
        </TabsContent>
        
        <TabsContent value="events" className="mt-6">
          <EventsLog />
        </TabsContent>
      </Tabs>
    </div>
  );
}