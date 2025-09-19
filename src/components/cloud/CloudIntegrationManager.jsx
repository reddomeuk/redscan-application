import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Cloud, 
  Shield, 
  Key, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink,
  RefreshCw,
  Disconnect,
  Settings,
  Eye,
  EyeOff,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { cloudAuthManager, CLOUD_PROVIDERS } from '@/services/CloudAuthManager';
import { useApiError, useNetworkError, useRetry } from '@/hooks/useErrorHandling';

/**
 * Consent-Based Cloud Integration Component
 * Provides secure OAuth 2.0/OpenID Connect authentication for multiple cloud providers
 */
export default function CloudIntegrationManager() {
  const [connections, setConnections] = useState(new Map());
  const [selectedProvider, setSelectedProvider] = useState('');
  const [azureTenantId, setAzureTenantId] = useState('');
  const [awsAccountId, setAwsAccountId] = useState('');
  const [awsRoleArn, setAwsRoleArn] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customScopes, setCustomScopes] = useState({});

  // Enhanced error handling
  const { executeAsync, isLoading, error, clearError } = useApiError();
  const { isOnline, networkError } = useNetworkError();
  const { retry, retryCount, isRetrying } = useRetry();

  useEffect(() => {
    // Initialize cloud auth manager event listeners
    const handleConnectionEstablished = ({ provider, connection }) => {
      setConnections(prev => new Map(prev.set(provider, connection)));
      toast.success(`Successfully connected to ${CLOUD_PROVIDERS[provider.toUpperCase()].name}`);
      clearError();
    };

    const handleConnectionExpired = ({ provider }) => {
      setConnections(prev => {
        const updated = new Map(prev);
        updated.delete(provider);
        return updated;
      });
      toast.warning(`Connection to ${CLOUD_PROVIDERS[provider.toUpperCase()].name} has expired`);
    };

    const handleTokenRefreshed = ({ provider }) => {
      toast.success(`Refreshed authentication for ${CLOUD_PROVIDERS[provider.toUpperCase()].name}`);
    };

    cloudAuthManager.on('connection:established', handleConnectionEstablished);
    cloudAuthManager.on('connection:expired', handleConnectionExpired);
    cloudAuthManager.on('token:refreshed', handleTokenRefreshed);

    return () => {
      cloudAuthManager.removeListener('connection:established', handleConnectionEstablished);
      cloudAuthManager.removeListener('connection:expired', handleConnectionExpired);
      cloudAuthManager.removeListener('token:refreshed', handleTokenRefreshed);
    };
  }, []);

  const handleConnect = async (provider) => {
    setLoading(true);
    
    try {
      switch (provider) {
        case 'azure':
          if (!azureTenantId) {
            toast.error('Please provide Azure Tenant ID');
            setLoading(false);
            return;
          }
          await cloudAuthManager.connectAzure(azureTenantId, customScopes.azure || []);
          break;
        
        case 'aws':
          if (!awsAccountId || !awsRoleArn) {
            toast.error('Please provide AWS Account ID and Role ARN');
            setLoading(false);
            return;
          }
          await cloudAuthManager.connectAWS(awsAccountId, awsRoleArn);
          break;
        
        case 'google':
          await cloudAuthManager.connectGoogle(null, customScopes.google || []);
          break;
        
        case 'github':
          await cloudAuthManager.connectGitHub(customScopes.github || []);
          break;
        
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
    } catch (error) {
      console.error('Connection failed:', error);
      toast.error(`Failed to connect to ${provider}: ${error.message}`);
      setLoading(false);
    }
  };

  const handleDisconnect = (provider) => {
    cloudAuthManager.disconnect(provider);
    setConnections(prev => {
      const updated = new Map(prev);
      updated.delete(provider);
      return updated;
    });
    toast.info(`Disconnected from ${CLOUD_PROVIDERS[provider.toUpperCase()].name}`);
  };

  const getConnectionStatus = (provider) => {
    const connection = connections.get(provider);
    if (!connection) return 'disconnected';
    
    const expiresAt = new Date(connection.expiresAt);
    const now = new Date();
    
    if (expiresAt <= now) return 'expired';
    if (expiresAt.getTime() - now.getTime() < 300000) return 'expiring'; // 5 minutes
    return 'connected';
  };

  const getStatusBadge = (provider) => {
    const status = getConnectionStatus(provider);
    const config = CLOUD_PROVIDERS[provider.toUpperCase()];
    
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-500/20 text-green-400">Connected</Badge>;
      case 'expiring':
        return <Badge className="bg-yellow-500/20 text-yellow-400">Expiring Soon</Badge>;
      case 'expired':
        return <Badge className="bg-red-500/20 text-red-400">Expired</Badge>;
      default:
        return <Badge className="bg-slate-500/20 text-slate-400">Not Connected</Badge>;
    }
  };

  const renderProviderCard = (providerId) => {
    const config = CLOUD_PROVIDERS[providerId.toUpperCase()];
    const connection = connections.get(providerId);
    const status = getConnectionStatus(providerId);
    const isConnected = status === 'connected';

    return (
      <Card key={providerId} className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Cloud className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-white">{config.name}</CardTitle>
                <p className="text-sm text-slate-400">
                  {isConnected ? `Connected as ${connection?.userInfo?.email || 'User'}` : 'Not connected'}
                </p>
              </div>
            </div>
            {getStatusBadge(providerId)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Provider-specific configuration */}
          {providerId === 'azure' && (
            <div className="space-y-2">
              <Label htmlFor="azure-tenant">Azure Tenant ID</Label>
              <Input
                id="azure-tenant"
                value={azureTenantId}
                onChange={(e) => setAzureTenantId(e.target.value)}
                placeholder="Enter Azure Tenant ID or 'common'"
                className="bg-slate-900/50 border-slate-700"
              />
              <p className="text-xs text-slate-400">
                Use 'common' for multi-tenant applications or your specific tenant ID
              </p>
            </div>
          )}

          {providerId === 'aws' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="aws-account">AWS Account ID</Label>
                <Input
                  id="aws-account"
                  value={awsAccountId}
                  onChange={(e) => setAwsAccountId(e.target.value)}
                  placeholder="123456789012"
                  className="bg-slate-900/50 border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aws-role">Cross-Account Role ARN</Label>
                <Input
                  id="aws-role"
                  value={awsRoleArn}
                  onChange={(e) => setAwsRoleArn(e.target.value)}
                  placeholder="arn:aws:iam::123456789012:role/RedScanSecurityAuditRole"
                  className="bg-slate-900/50 border-slate-700"
                />
              </div>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Create a cross-account IAM role with SecurityAudit policy and trust relationship to RedScan
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Permissions Overview */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Required Permissions
            </Label>
            <div className="text-xs text-slate-400 space-y-1">
              {providerId === 'azure' && (
                <>
                  <div>• Read security alerts and recommendations</div>
                  <div>• Access identity protection data</div>
                  <div>• Read Azure resource configurations</div>
                  <div>• Office 365 security events (if enabled)</div>
                </>
              )}
              {providerId === 'aws' && (
                <>
                  <div>• Security audit read-only access</div>
                  <div>• CloudTrail and GuardDuty read access</div>
                  <div>• Config and Inspector read access</div>
                  <div>• EC2 and IAM describe permissions</div>
                </>
              )}
              {providerId === 'google' && (
                <>
                  <div>• Google Workspace admin read access</div>
                  <div>• Cloud platform read-only access</div>
                  <div>• Security Center read access</div>
                  <div>• Audit log read access</div>
                </>
              )}
              {providerId === 'github' && (
                <>
                  <div>• Repository security events access</div>
                  <div>• Organization read access</div>
                  <div>• Security advisories read access</div>
                  <div>• Code scanning alerts access</div>
                </>
              )}
            </div>
          </div>

          {/* Connection Actions */}
          <div className="flex gap-2 pt-2">
            {!isConnected ? (
              <Button
                onClick={() => handleConnect(providerId)}
                disabled={loading}
                className="bg-[var(--color-primary)] hover:bg-red-700 flex-1"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ExternalLink className="w-4 h-4 mr-2" />
                )}
                Connect with OAuth 2.0
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => handleDisconnect(providerId)}
                  variant="outline"
                  className="border-slate-600 text-slate-300"
                >
                  <Disconnect className="w-4 h-4 mr-2" />
                  Disconnect
                </Button>
                <Button
                  onClick={() => cloudAuthManager.performSecurityScan(providerId, 'security_center')}
                  className="bg-blue-600 hover:bg-blue-700 flex-1"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Run Security Scan
                </Button>
              </>
            )}
          </div>

          {/* Connection Details */}
          {isConnected && connection && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              <div className="text-xs text-slate-400 space-y-1">
                <div>Connected: {new Date(connection.connectedAt).toLocaleString()}</div>
                <div>Expires: {new Date(connection.expiresAt).toLocaleString()}</div>
                <div>Scopes: {connection.scopes.length} permissions granted</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">Cloud Integrations</h1>
          <p className="text-slate-400">
            Securely connect to cloud providers using OAuth 2.0 consent-based authentication
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={showAdvanced}
            onCheckedChange={setShowAdvanced}
            id="advanced-mode"
          />
          <Label htmlFor="advanced-mode" className="text-sm text-slate-400">
            Advanced Options
          </Label>
        </div>
      </div>

      {/* Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Secure Authentication:</strong> All connections use industry-standard OAuth 2.0 with PKCE 
          for secure, consent-based access. Tokens are encrypted and automatically refreshed.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="providers" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
          <TabsTrigger value="providers">Cloud Providers</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.keys(CLOUD_PROVIDERS).map(providerId => 
              renderProviderCard(providerId.toLowerCase())
            )}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Permission Scopes</CardTitle>
              <p className="text-slate-400">Configure additional permissions for each provider</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(CLOUD_PROVIDERS).map(([providerId, config]) => (
                <div key={providerId} className="space-y-2">
                  <Label className="text-white">{config.name}</Label>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    {Object.entries(config.scopes).map(([category, scopes]) => (
                      <div key={category} className="space-y-1">
                        <div className="font-medium text-slate-300 capitalize">{category}</div>
                        <div className="text-slate-400 space-y-0.5">
                          {scopes.slice(0, 3).map(scope => (
                            <div key={scope}>• {scope}</div>
                          ))}
                          {scopes.length > 3 && <div>• ... and {scopes.length - 3} more</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Active Connections</p>
                    <p className="text-2xl font-bold text-white">{connections.size}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Expiring Soon</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      {Array.from(connections.values()).filter(conn => {
                        const expiresAt = new Date(conn.expiresAt);
                        const now = new Date();
                        return expiresAt.getTime() - now.getTime() < 300000;
                      }).length}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Total Scans Today</p>
                    <p className="text-2xl font-bold text-blue-400">0</p>
                  </div>
                  <Shield className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Last Refresh</p>
                    <p className="text-sm font-medium text-white">
                      {connections.size > 0 ? 'Just now' : 'Never'}
                    </p>
                  </div>
                  <RefreshCw className="w-8 h-8 text-slate-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
