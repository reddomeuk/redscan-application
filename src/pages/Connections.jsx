import React, { useState, useEffect, useCallback } from 'react';
import { ItsmConnection, User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plug, Server, Link, Power, Activity, Settings, Users, Webhook } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import IntegrationHealthDashboard from '../components/connections/IntegrationHealthDashboard';
import SetupWizard from '../components/connections/SetupWizard';
import SyncQueue from '../components/connections/SyncQueue';
import WebhookSimulator from '../components/connections/WebhookSimulator';
import { toast } from 'sonner';

const ConnectionCard = ({ connection, onSave }) => {
  const [config, setConfig] = useState({
    instance_url: connection?.instance_url || '',
    client_id: connection?.client_id || '',
    client_secret: '',
    sync_enabled: connection?.sync_enabled || false,
    auto_assignment_enabled: connection?.auto_assignment_enabled || false,
  });

  const isConnected = connection?.status === 'connected';

  const handleSave = () => {
    const mockUpdate = {
      ...config,
      status: connection.id ? connection.status : 'disconnected',
    };
    onSave(connection.id, mockUpdate);
    toast.success(`${connection.platform === 'servicenow' ? 'ServiceNow' : 'Jira'} settings saved. Backend connection required to activate.`);
  };

  const handleConnect = () => {
    toast.info(`Redirecting to ${connection.platform} for authentication... (Simulated)`);
     onSave(connection.id, { ...connection, status: 'connected', last_sync: new Date().toISOString() });
  };
  
  const handleDisconnect = () => {
    onSave(connection.id, { ...connection, status: 'disconnected' });
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white capitalize flex items-center gap-2">
          <Server className="w-5 h-5"/>
          {connection.platform}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge className={
            isConnected ? 'bg-green-500/20 text-green-400' : 
            connection?.status === 'error' ? 'bg-red-500/20 text-red-400' : 
            'bg-slate-500/20 text-slate-400'
          }>
            {connection?.status || 'Not Configured'}
          </Badge>
          <SetupWizard 
            platform={connection.platform} 
            connection={connection}
            onComplete={() => onSave(connection.id, { ...connection, status: 'connected' })}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor={`instance_url_${connection.platform}`}>Instance URL</Label>
          <Input 
            id={`instance_url_${connection.platform}`} 
            value={config.instance_url} 
            onChange={e => setConfig({...config, instance_url: e.target.value})} 
            placeholder={connection.platform === 'servicenow' ? 'https://my-org.service-now.com' : 'https://my-org.atlassian.net'} 
            className="bg-slate-900/50 border-slate-700" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`client_id_${connection.platform}`}>Client ID</Label>
          <Input 
            id={`client_id_${connection.platform}`} 
            value={config.client_id} 
            onChange={e => setConfig({...config, client_id: e.target.value})} 
            className="bg-slate-900/50 border-slate-700" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`client_secret_${connection.platform}`}>Client Secret</Label>
          <Input 
            id={`client_secret_${connection.platform}`} 
            type="password" 
            onChange={e => setConfig({...config, client_secret: e.target.value})} 
            placeholder="••••••••••••••••" 
            className="bg-slate-900/50 border-slate-700" 
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor={`sync_enabled_${connection.platform}`} className="flex flex-col">
            <span>Enable Sync</span>
            <span className="text-xs text-slate-400">Bi-directional data synchronization</span>
          </Label>
          <Switch 
            id={`sync_enabled_${connection.platform}`} 
            checked={config.sync_enabled} 
            onCheckedChange={c => setConfig({...config, sync_enabled: c})} 
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor={`auto_assign_${connection.platform}`} className="flex flex-col">
            <span>Auto-Assignment</span>
            <span className="text-xs text-slate-400">Route tickets based on role</span>
          </Label>
          <Switch 
            id={`auto_assign_${connection.platform}`} 
            checked={config.auto_assignment_enabled} 
            onCheckedChange={c => setConfig({...config, auto_assignment_enabled: c})} 
          />
        </div>
        <div className="flex justify-between items-center pt-4">
          {isConnected ? (
            <Button variant="destructive" onClick={handleDisconnect}>
              <Power className="w-4 h-4 mr-2"/>
              Disconnect
            </Button>
          ) : (
            <Button onClick={handleConnect} className="bg-green-600 hover:bg-green-700 text-white">
              <Link className="w-4 h-4 mr-2"/>
              Connect
            </Button>
          )}
          <Button onClick={handleSave}>
            <span className="mr-2">💾</span>
            Save Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function ConnectionsPage() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadConnections = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ItsmConnection.list();
      
      let servicenow = data.find(c => c.platform === 'servicenow');
      let jira = data.find(c => c.platform === 'jira');

      if (!servicenow) {
        servicenow = await ItsmConnection.create({ 
          platform: 'servicenow', 
          instance_url: 'https://your-org.service-now.com',
          organization_id: 'demo-org-1' 
        });
      }
       if (!jira) {
        jira = await ItsmConnection.create({ 
          platform: 'jira', 
          instance_url: 'https://your-org.atlassian.net',
          organization_id: 'demo-org-1' 
        });
      }

      setConnections([servicenow, jira]);
    } catch (error) {
      console.error("Failed to load connections", error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  const handleSaveConnection = async (id, data) => {
    try {
      await ItsmConnection.update(id, data);
      loadConnections();
    } catch(e) {
      console.error("Failed to save connection", e);
      toast.error("Failed to save connection settings.");
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Plug className="w-8 h-8 text-[var(--color-primary)]" /> 
                ITSM Connections
              </h1>
              <p className="text-slate-400">Manage bi-directional integrations with your ITSM platforms.</p>
            </div>
            <div className="flex gap-3">
              <WebhookSimulator />
              <RouterLink to={createPageUrl('AssignmentRules')}>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Users className="w-4 h-4 mr-2" />
                  Assignment Rules
                </Button>
              </RouterLink>
            </div>
          </div>
        </div>

        <Tabs defaultValue="config" className="w-full">
            <TabsList className="bg-slate-800/50 border border-slate-700 mb-6">
                <TabsTrigger value="config">Configuration</TabsTrigger>
                <TabsTrigger value="health">Integration Health</TabsTrigger>
                <TabsTrigger value="queue">Sync Queue</TabsTrigger>
            </TabsList>
            
            <TabsContent value="config">
                <div className="grid md:grid-cols-2 gap-8">
                    {connections.map(conn => (
                        <ConnectionCard key={conn.id} connection={conn} onSave={handleSaveConnection} />
                    ))}
                </div>
            </TabsContent>
            
            <TabsContent value="health">
                <IntegrationHealthDashboard connections={connections} />
            </TabsContent>

            <TabsContent value="queue">
                <SyncQueue />
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}