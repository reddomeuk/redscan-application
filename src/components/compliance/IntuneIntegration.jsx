
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IntunePolicy, IntuneConnection, ComplianceCheck, User } from '@/api/entities';
import { 
  Shield, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Rocket, // Changed from Deploy to Rocket
  Undo,
  Laptop,
  Smartphone,
  Monitor,
  Loader2,
  Settings,
  Cloud
} from 'lucide-react';
import { toast } from 'sonner';

const getStatusColor = (status) => {
  switch (status) {
    case 'connected':
    case 'deployed': return 'bg-green-500/20 text-green-400 border-green-500/40';
    case 'out_of_sync': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
    case 'not_connected':
    case 'not_deployed':
    case 'failed':
    case 'error': return 'bg-red-500/20 text-red-400 border-red-500/40';
    default: return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
  }
};

const getPlatformIcon = (platform) => {
  switch (platform) {
    case 'windows': return <Monitor className="w-5 h-5 text-blue-400" />;
    case 'macos': return <Laptop className="w-5 h-5 text-gray-400" />;
    case 'ios':
    case 'android': return <Smartphone className="w-5 h-5 text-green-400" />;
    default: return <Shield className="w-5 h-5 text-slate-400" />;
  }
};

const IntuneConnector = ({ connection, onUpdate }) => {
  const [connectionData, setConnectionData] = useState({
    connection_name: connection?.connection_name || '',
    tenant_id: connection?.tenant_id || '',
    client_id: connection?.client_id || '',
    client_secret: connection?.client_secret || ''
  });
  const [testing, setTesting] = useState(false);

  const handleConnect = async () => {
    setTesting(true);
    try {
      if (connection) {
        await IntuneConnection.update(connection.id, {
          ...connectionData,
          status: 'connected',
          last_sync: new Date().toISOString()
        });
      } else {
        await IntuneConnection.create({
          ...connectionData,
          organization_id: 'demo-org-1',
          status: 'connected',
          last_sync: new Date().toISOString()
        });
      }
      toast.success('Successfully connected to Microsoft Intune');
      onUpdate();
    } catch (error) {
      toast.error('Failed to connect to Intune');
      console.error('Connection error:', error);
    }
    setTesting(false);
  };

  const handleDisconnect = async () => {
    if (!connection) return;
    try {
      await IntuneConnection.update(connection.id, { status: 'not_connected' });
      toast.success('Disconnected from Microsoft Intune');
      onUpdate();
    } catch (error) {
      toast.error('Failed to disconnect');
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Cloud className="w-5 h-5 text-blue-400" />
          Microsoft Intune Connection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg">
          <div>
            <h4 className="font-medium text-white">Connection Status</h4>
            <p className="text-sm text-slate-400">
              {connection?.last_sync ? `Last sync: ${new Date(connection.last_sync).toLocaleString()}` : 'Never connected'}
            </p>
          </div>
          <Badge className={getStatusColor(connection?.status || 'not_connected')}>
            {connection?.status?.replace('_', ' ') || 'Not Connected'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-300">Connection Name</Label>
            <Input
              value={connectionData.connection_name}
              onChange={(e) => setConnectionData({...connectionData, connection_name: e.target.value})}
              placeholder="Production Tenant"
              className="bg-slate-900/50 border-slate-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300">Tenant ID</Label>
            <Input
              value={connectionData.tenant_id}
              onChange={(e) => setConnectionData({...connectionData, tenant_id: e.target.value})}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              className="bg-slate-900/50 border-slate-700 text-white font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300">Client ID</Label>
            <Input
              value={connectionData.client_id}
              onChange={(e) => setConnectionData({...connectionData, client_id: e.target.value})}
              placeholder="Application (client) ID"
              className="bg-slate-900/50 border-slate-700 text-white font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300">Client Secret</Label>
            <Input
              type="password"
              value={connectionData.client_secret}
              onChange={(e) => setConnectionData({...connectionData, client_secret: e.target.value})}
              placeholder="Client secret value"
              className="bg-slate-900/50 border-slate-700 text-white font-mono"
            />
          </div>
        </div>

        <div className="flex gap-3">
          {connection?.status === 'connected' ? (
            <Button onClick={handleDisconnect} variant="outline" className="border-slate-600 text-slate-300">
              Disconnect
            </Button>
          ) : (
            <Button 
              onClick={handleConnect} 
              disabled={testing || !connectionData.tenant_id || !connectionData.client_id}
              className="bg-[var(--color-primary)] hover:bg-red-700"
            >
              {testing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {testing ? 'Connecting...' : 'Connect'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const PolicyCatalogue = ({ policies, connection, onUpdate }) => {
  const [deploying, setDeploying] = useState(null);

  const handleDeploy = async (policyId) => {
    setDeploying(policyId);
    try {
      const user = await User.me();
      await IntunePolicy.update(policyId, {
        status: 'deployed',
        deployed_at: new Date().toISOString(),
        deployed_by: user.email
      });
      toast.success('Policy deployed successfully');
      onUpdate();
    } catch (error) {
      toast.error('Failed to deploy policy');
    }
    setDeploying(null);
  };

  const handleRollback = async (policyId) => {
    try {
      await IntunePolicy.update(policyId, {
        status: 'not_deployed',
        deployed_at: null,
        deployed_by: null
      });
      toast.success('Policy rolled back successfully');
      onUpdate();
    } catch (error) {
      toast.error('Failed to rollback policy');
    }
  };

  const handleBulkDeploy = async () => {
    setDeploying('bulk');
    try {
      const user = await User.me();
      const baselinePolicies = policies.filter(p => p.is_baseline && p.status === 'not_deployed');
      
      for (const policy of baselinePolicies) {
        await IntunePolicy.update(policy.id, {
          status: 'deployed',
          deployed_at: new Date().toISOString(),
          deployed_by: user.email
        });
      }
      toast.success(`Deployed ${baselinePolicies.length} baseline policies`);
      onUpdate();
    } catch (error) {
      toast.error('Failed to bulk deploy policies');
    }
    setDeploying(null);
  };

  const platforms = ['windows', 'macos', 'ios', 'android', 'byod'];

  if (connection?.status !== 'connected') {
    return (
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-slate-600" />
          <h3 className="text-xl font-semibold text-white mb-2">Intune Not Connected</h3>
          <p className="text-slate-400">Connect to Microsoft Intune to manage device policies.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">Recommended Security Baselines</h3>
          <p className="text-slate-400">Deploy CE+ aligned policies across your device fleet</p>
        </div>
        <Button 
          onClick={handleBulkDeploy}
          disabled={deploying === 'bulk'}
          className="bg-[var(--color-primary)] hover:bg-red-700"
        >
          {deploying === 'bulk' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Bulk Deploy Baselines
        </Button>
      </div>

      <Tabs defaultValue="windows" className="w-full">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          {platforms.map(platform => (
            <TabsTrigger key={platform} value={platform} className="capitalize">
              <div className="flex items-center gap-2">
                {getPlatformIcon(platform)}
                {platform}
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        {platforms.map(platform => (
          <TabsContent key={platform} value={platform} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {policies.filter(p => p.platform === platform).map(policy => (
                <Card key={policy.id} className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getPlatformIcon(policy.platform)}
                        {policy.is_baseline && (
                          <Badge variant="outline" className="text-xs border-yellow-500/50 text-yellow-400">
                            Baseline
                          </Badge>
                        )}
                      </div>
                      <Badge className={getStatusColor(policy.status)}>
                        {policy.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <h4 className="font-medium text-white mb-2">{policy.name}</h4>
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">{policy.description}</p>
                    
                    {policy.ce_control_mapping?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-slate-500 mb-1">Maps to CE+ controls:</p>
                        <div className="flex flex-wrap gap-1">
                          {policy.ce_control_mapping.map(control => (
                            <Badge key={control} variant="outline" className="text-xs border-slate-600">
                              {control}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      {policy.status === 'deployed' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRollback(policy.id)}
                          className="border-slate-600 text-slate-300 flex-1"
                        >
                          <Undo className="w-3 h-3 mr-1" />
                          Rollback
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleDeploy(policy.id)}
                          disabled={deploying === policy.id}
                          className="bg-[var(--color-primary)] hover:bg-red-700 flex-1"
                        >
                          {deploying === policy.id && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                          <Rocket className="w-3 h-3 mr-1" /> {/* Changed from Deploy to Rocket */}
                          Deploy
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default function IntuneIntegration() {
  const [connection, setConnection] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [connectionData, policyData] = await Promise.all([
        IntuneConnection.list().then(results => results[0] || null),
        IntunePolicy.list('-created_date', 100)
      ]);
      
      setConnection(connectionData);
      setPolicies(policyData);
    } catch (error) {
      console.error('Error loading Intune data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading Intune integration...</div>;
  }

  return (
    <div className="space-y-8">
      <IntuneConnector connection={connection} onUpdate={loadData} />
      <PolicyCatalogue policies={policies} connection={connection} onUpdate={loadData} />
    </div>
  );
}
