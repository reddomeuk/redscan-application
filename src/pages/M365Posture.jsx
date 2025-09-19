import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Building2, 
  Shield,
  CheckCircle2,
  AlertTriangle,
  Play,
  Copy,
  Download,
  Calendar,
  Eye,
  Settings,
  ExternalLink
} from 'lucide-react';
import { M365PostureProfile, M365PostureRun } from '@/api/entities';
import { toast } from 'sonner';
import ActionButton from '../components/ui/ActionButton';

// Mock data for demo - in production this would come from the API
const MOCK_PROFILE = {
  id: 'profile-1',
  name: 'Contoso Ltd',
  tenant_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  tenant_domain: 'contoso.onmicrosoft.com',
  connection_status: 'connected',
  granted_scopes: ['Directory.Read.All', 'Device.Read.All', 'Policy.Read.All'],
  last_sync: '2024-01-15T10:30:00Z',
  schedule: 'weekly',
  notifications_enabled: true,
  organization_id: 'org-1'
};

const MOCK_LATEST_RUN = {
  id: 'run-1',
  profile_id: 'profile-1',
  status: 'completed',
  started_at: '2024-01-15T09:00:00Z',
  completed_at: '2024-01-15T09:12:00Z',
  duration_seconds: 720,
  results_summary: {
    total_tests: 156,
    passed: 128,
    failed: 24,
    skipped: 4,
    severity_breakdown: {
      high: 3,
      medium: 8,
      low: 13
    }
  },
  top_issues: [
    {
      rule_name: 'MFA_EnforcedForAllUsers',
      severity: 'high',
      description: 'Multi-factor authentication is not enforced for all users',
      fix_guidance: 'Enable MFA requirement for all users in Conditional Access policies',
      affected_object: 'Default User Risk Policy'
    },
    {
      rule_name: 'LegacyAuth_Blocked',
      severity: 'high', 
      description: 'Legacy authentication protocols are still enabled',
      fix_guidance: 'Block legacy authentication in Conditional Access',
      affected_object: 'Exchange Online'
    },
    {
      rule_name: 'Device_ComplianceRequired',
      severity: 'medium',
      description: '12 devices do not meet compliance requirements',
      fix_guidance: 'Deploy device compliance policies via Intune',
      affected_object: 'Mobile Device Management'
    }
  ],
  organization_id: 'org-1'
};

const ConnectionStatus = ({ profile, onConnect, onRunPosture }) => {
  const getStatusBadge = () => {
    switch (profile?.connection_status) {
      case 'connected':
        return <Badge className="bg-green-500/20 text-green-400">Connected</Badge>;
      case 'needs_admin_approval':
        return <Badge className="bg-yellow-500/20 text-yellow-400">Needs Admin Approval</Badge>;
      case 'not_connected':
        return <Badge className="bg-red-500/20 text-red-400">Not Connected</Badge>;
      case 'error':
        return <Badge className="bg-red-500/20 text-red-400">Connection Error</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400">Unknown</Badge>;
    }
  };

  const adminConsentUrl = `https://login.microsoftonline.com/organizations/v2.0/adminconsent?client_id=YOUR_APP_ID&redirect_uri=${encodeURIComponent(window.location.origin + '/cloud/microsoft365/posture/consent/callback')}&scope=${encodeURIComponent('offline_access openid email Directory.Read.All Device.Read.All Policy.Read.All')}`;

  const copyAdminLink = () => {
    navigator.clipboard.writeText(adminConsentUrl);
    toast.success('Admin approval link copied to clipboard');
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-400" />
          Microsoft 365 Connection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              {profile?.connection_status === 'connected' && (
                <span className="text-sm text-slate-400">
                  Last sync: {new Date(profile.last_sync).toLocaleDateString()}
                </span>
              )}
            </div>
            {profile?.tenant_domain && (
              <p className="text-sm text-slate-400 mt-1">Tenant: {profile.tenant_domain}</p>
            )}
          </div>
          
          <div className="flex gap-2">
            {profile?.connection_status === 'not_connected' && (
              <ActionButton actionFn={onConnect} className="bg-blue-600 hover:bg-blue-700">
                Continue with Microsoft
              </ActionButton>
            )}
            
            {profile?.connection_status === 'needs_admin_approval' && (
              <>
                <Button variant="outline" onClick={copyAdminLink}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Admin Link
                </Button>
                <ActionButton actionFn={onConnect}>
                  Approve & Continue
                </ActionButton>
              </>
            )}
            
            {profile?.connection_status === 'connected' && (
              <ActionButton 
                actionFn={onRunPosture}
                className="bg-[#B00020] hover:bg-red-700"
                isLongRunning={true}
                taskName="Microsoft 365 Posture Check"
              >
                <Play className="w-4 h-4 mr-2" />
                Run Posture Check
              </ActionButton>
            )}
          </div>
        </div>
        
        <p className="text-sm text-slate-400 bg-slate-900/50 p-3 rounded-lg">
          <Shield className="w-4 h-4 inline mr-2" />
          RedScan will read Microsoft 365 security settings to check posture. We won't change anything.
        </p>
      </CardContent>
    </Card>
  );
};

const HealthMeter = ({ run }) => {
  if (!run) return null;
  
  const { results_summary } = run;
  const totalIssues = results_summary.severity_breakdown.high + results_summary.severity_breakdown.medium;
  const healthScore = Math.max(0, 100 - (totalIssues * 5));
  
  const getHealthStatus = () => {
    if (healthScore >= 80) return { label: 'Good', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (healthScore >= 60) return { label: 'Needs Attention', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    return { label: 'At Risk', color: 'text-red-400', bg: 'bg-red-500/20' };
  };
  
  const health = getHealthStatus();
  
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Security Health</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full ${health.bg} flex items-center justify-center`}>
            <span className={`text-xl font-bold ${health.color}`}>{healthScore}</span>
          </div>
          <div>
            <p className={`text-lg font-medium ${health.color}`}>{health.label}</p>
            <p className="text-sm text-slate-400">
              {totalIssues} issues require attention
            </p>
          </div>
        </div>
        <Progress value={healthScore} className="mt-4" />
      </CardContent>
    </Card>
  );
};

const TopIssues = ({ run }) => {
  if (!run?.top_issues) return null;
  
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-orange-400 bg-orange-500/20';
      case 'low': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };
  
  const getFixUrl = (ruleName) => {
    // Map common rules to helpful links
    const urlMap = {
      'MFA_EnforcedForAllUsers': 'https://portal.azure.com/#view/Microsoft_AAD_ConditionalAccess/ConditionalAccessBlade',
      'LegacyAuth_Blocked': 'https://portal.azure.com/#view/Microsoft_AAD_ConditionalAccess/ConditionalAccessBlade',
      'Device_ComplianceRequired': createPageUrl('Devices')
    };
    return urlMap[ruleName] || '#';
  };
  
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-400" />
          Top Issues Requiring Attention
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {run.top_issues.slice(0, 5).map((issue, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={getSeverityColor(issue.severity)}>
                    {issue.severity.toUpperCase()}
                  </Badge>
                  <span className="text-white font-medium">{issue.description}</span>
                </div>
                <p className="text-sm text-slate-400">{issue.fix_guidance}</p>
                {issue.affected_object && (
                  <p className="text-xs text-slate-500 mt-1">Affects: {issue.affected_object}</p>
                )}
              </div>
              <div className="ml-4">
                <Button size="sm" variant="outline" asChild>
                  <Link to={getFixUrl(issue.rule_name)}>
                    Fix Now
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default function M365PosturePage() {
  const [profile, setProfile] = useState(MOCK_PROFILE);
  const [latestRun, setLatestRun] = useState(MOCK_LATEST_RUN);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    // In production, load from API
    setProfile(MOCK_PROFILE);
    setLatestRun(MOCK_LATEST_RUN);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleConnect = async () => {
    // In production, initiate OAuth flow
    toast.success('Redirecting to Microsoft for authentication...');
    // Simulate connection
    setTimeout(() => {
      setProfile(prev => ({ ...prev, connection_status: 'connected', last_sync: new Date().toISOString() }));
      toast.success('Successfully connected to Microsoft 365');
    }, 2000);
  };

  const handleRunPosture = async () => {
    // In production, start posture run job
    toast.success('Starting Microsoft 365 posture assessment...');
    // This would typically create a new run and redirect to the run detail page
    return new Promise(resolve => {
      setTimeout(() => {
        toast.success('Posture assessment completed successfully');
        resolve();
      }, 3000);
    });
  };

  const handleExportSummary = async () => {
    // Generate PDF summary
    toast.success('Generating security posture summary...');
    return new Promise(resolve => {
      setTimeout(() => {
        toast.success('Summary exported successfully');
        resolve();
      }, 2000);
    });
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">Microsoft 365 Posture</h1>
          <p className="text-slate-400">One-click security posture assessment for your Microsoft 365 tenant</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={createPageUrl('M365PostureRuns')}>
              <Eye className="w-4 h-4 mr-2" />
              View All Runs
            </Link>
          </Button>
          <ActionButton 
            actionFn={handleExportSummary}
            variant="outline"
            successToast="Summary exported to Evidence Vault"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Summary
          </ActionButton>
        </div>
      </header>

      <ConnectionStatus 
        profile={profile}
        onConnect={handleConnect}
        onRunPosture={handleRunPosture}
      />

      {latestRun && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HealthMeter run={latestRun} />
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Latest Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-400">{latestRun.results_summary.passed}</div>
                  <div className="text-sm text-slate-400">Passed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-400">{latestRun.results_summary.failed}</div>
                  <div className="text-sm text-slate-400">Failed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">{latestRun.results_summary.skipped}</div>
                  <div className="text-sm text-slate-400">Skipped</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-700">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Last run:</span>
                  <span className="text-white">{new Date(latestRun.completed_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-slate-400">Duration:</span>
                  <span className="text-white">{Math.floor(latestRun.duration_seconds / 60)}m {latestRun.duration_seconds % 60}s</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {latestRun && <TopIssues run={latestRun} />}

      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="schedule">Schedule & Notifications</TabsTrigger>
          <TabsTrigger value="settings">Advanced Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="schedule" className="mt-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Automated Scheduling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Select value={profile?.schedule} onValueChange={(value) => setProfile(prev => ({ ...prev, schedule: value }))}>
                  <SelectTrigger className="w-48 bg-slate-900 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual only</SelectItem>
                    <SelectItem value="weekly">Weekly (Sunday 2:00 AM)</SelectItem>
                  </SelectContent>
                </Select>
                {profile?.schedule === 'weekly' && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-slate-400">Next run: Sunday, 2:00 AM</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Email Notifications</p>
                  <p className="text-sm text-slate-400">Get notified when posture checks complete</p>
                </div>
                <Button 
                  variant={profile?.notifications_enabled ? "default" : "outline"}
                  size="sm"
                  onClick={() => setProfile(prev => ({ ...prev, notifications_enabled: !prev.notifications_enabled }))}
                >
                  {profile?.notifications_enabled ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Connection Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-400 mb-2">Granted Permissions:</p>
                <div className="flex flex-wrap gap-2">
                  {profile?.granted_scopes?.map(scope => (
                    <Badge key={scope} variant="outline">{scope}</Badge>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-700">
                <p className="text-sm text-slate-400 mb-2">Data Retention:</p>
                <p className="text-sm text-white">Posture run results are kept for 12 months. Older results are archived in the Evidence Vault.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}