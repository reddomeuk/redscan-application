
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AuthPolicy, User, UserSession, SsoBypass, Organization, GeolocationAuditLog } from '@/api/entities';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  Key,
  Monitor,
  UserX,
  RefreshCw,
  Settings,
  Smartphone,
  Globe,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';

import { GeolocationPolicyCard, UserGeolocationCard, GeolocationAuditCard } from '../components/security/GeolocationControls';

const SecurityPostureCard = ({ policy, users, sessions }) => {
  const calculatePostureScore = () => {
    let score = 0;
    let maxScore = 100;

    // MFA enforcement (25 points)
    if (policy?.mfa_policy === 'required_all') score += 25;
    else if (policy?.mfa_policy === 'required_admins') score += 15;

    // SSO enforcement (20 points)
    if (policy?.sso_enforcement === 'enforce') score += 20;
    else if (policy?.sso_enforcement === 'prefer') score += 10;

    // Session timeouts (15 points)
    if (policy?.session_policy?.idle_timeout_minutes <= 30) score += 10;
    if (policy?.session_policy?.absolute_timeout_hours <= 8) score += 5;

    // Password policy (20 points)
    if (policy?.password_policy?.min_length >= 12) score += 5;
    if (policy?.password_policy?.expiry_days <= 90) score += 5;
    if (policy?.password_policy?.reuse_limit >= 5) score += 5;
    if (policy?.password_policy?.require_symbol) score += 5;

    // Step-up MFA (10 points)
    if (policy?.step_up_mfa_required) score += 10;

    // MFA adoption rate (10 points)
    const mfaUsers = users.filter(u => u.mfa_enabled).length;
    const adoptionRate = users.length > 0 ? (mfaUsers / users.length) * 100 : 0;
    score += Math.round((adoptionRate / 100) * 10);

    return Math.min(score, maxScore);
  };

  const score = calculatePostureScore();
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRecommendations = () => {
    const recommendations = [];
    
    if (policy?.mfa_policy === 'optional') {
      recommendations.push({ text: 'Require MFA for all users', priority: 'high' });
    }
    if (policy?.sso_enforcement === 'off') {
      recommendations.push({ text: 'Configure SSO enforcement', priority: 'medium' });
    }
    if (!policy?.step_up_mfa_required) {
      recommendations.push({ text: 'Enable step-up MFA for sensitive actions', priority: 'medium' });
    }
    if (policy?.session_policy?.idle_timeout_minutes > 60) {
      recommendations.push({ text: 'Reduce session idle timeout to 60 minutes or less', priority: 'low' });
    }
    
    return recommendations;
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-400" />
          Security Posture Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
            {score}/100
          </div>
          <div className="text-slate-400 text-sm mt-1">Overall Security Score</div>
          <Progress value={score} className="mt-3" />
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-white">Recommendations</h4>
          {getRecommendations().length > 0 ? getRecommendations().map((rec, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className={`w-4 h-4 ${rec.priority === 'high' ? 'text-red-400' : rec.priority === 'medium' ? 'text-yellow-400' : 'text-blue-400'}`} />
                <span className="text-sm text-slate-300">{rec.text}</span>
              </div>
              <Badge className={`${rec.priority === 'high' ? 'bg-red-500/20 text-red-400' : rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>
                {rec.priority}
              </Badge>
            </div>
          )) : (
            <div className="text-center py-4 text-green-400">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
              All recommendations implemented!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const BreakGlassAccountsCard = ({ users, onUpdate }) => {
  const breakGlassUsers = users.filter(u => u.break_glass);
  const [creatingAccount, setCreatingAccount] = useState(false);

  const handleCreateBreakGlass = async () => {
    if (breakGlassUsers.length >= 2) {
      toast.error('Maximum of 2 break-glass accounts allowed per organization');
      return;
    }

    setCreatingAccount(true);
    try {
      // Generate recovery codes
      const recoveryCodes = Array.from({length: 10}, () => 
        Math.random().toString(36).substring(2, 8).toUpperCase()
      );

      const newUser = await User.create({
        email: `breakglass${breakGlassUsers.length + 1}@demo-org.local`,
        full_name: `Break Glass Account ${breakGlassUsers.length + 1}`,
        role: 'admin',
        break_glass: true,
        mfa_enabled: true,
        recovery_codes: recoveryCodes,
        organization_id: 'demo-org-1'
      });

      toast.success(`Break-glass account created. Recovery codes generated.`);
      onUpdate();
    } catch (error) {
      toast.error('Failed to create break-glass account');
    }
    setCreatingAccount(false);
  };

  const handleRotateRecoveryCodes = async (userId) => {
    try {
      const newCodes = Array.from({length: 10}, () => 
        Math.random().toString(36).substring(2, 8).toUpperCase()
      );
      
      await User.update(userId, { recovery_codes: newCodes });
      toast.success('Recovery codes rotated successfully');
      onUpdate();
    } catch (error) {
      toast.error('Failed to rotate recovery codes');
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Key className="w-5 h-5 text-orange-400" />
          Break-Glass Accounts ({breakGlassUsers.length}/2)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {breakGlassUsers.length === 0 ? (
          <div className="text-center py-6">
            <UserX className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p className="text-slate-400 mb-4">No break-glass accounts configured</p>
            <Button onClick={handleCreateBreakGlass} disabled={creatingAccount}>
              {creatingAccount ? 'Creating...' : 'Create Break-Glass Account'}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {breakGlassUsers.map(user => (
              <div key={user.id} className="p-4 bg-slate-900/30 border border-orange-500/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-white">{user.full_name}</h4>
                    <p className="text-sm text-slate-400">{user.email}</p>
                  </div>
                  <Badge className="bg-orange-500/20 text-orange-400">Break-Glass</Badge>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => handleRotateRecoveryCodes(user.id)}>
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Rotate Codes
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="w-3 h-3 mr-1" />
                    Configure
                  </Button>
                </div>
              </div>
            ))}
            {breakGlassUsers.length < 2 && (
              <Button onClick={handleCreateBreakGlass} disabled={creatingAccount} className="w-full">
                {creatingAccount ? 'Creating...' : 'Create Additional Break-Glass Account'}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const PolicySettingsCard = ({ policy, onUpdate }) => {
  const [localPolicy, setLocalPolicy] = useState(policy || {});

  const handleSave = async () => {
    try {
      if (policy?.id) {
        await AuthPolicy.update(policy.id, localPolicy);
      } else {
        await AuthPolicy.create({ ...localPolicy, organization_id: 'demo-org-1' });
      }
      toast.success('Authentication policy updated');
      onUpdate();
    } catch (error) {
      toast.error('Failed to update policy');
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-purple-400" />
          Authentication Policies
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-slate-300">MFA Policy</Label>
          <Select 
            value={localPolicy.mfa_policy || 'optional'} 
            onValueChange={(value) => setLocalPolicy({...localPolicy, mfa_policy: value})}
          >
            <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="optional" className="text-white">Optional</SelectItem>
              <SelectItem value="required_admins" className="text-white">Required for Admins</SelectItem>
              <SelectItem value="required_all" className="text-white">Required for All Users</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-slate-300">SSO Enforcement</Label>
          <Select 
            value={localPolicy.sso_enforcement || 'off'} 
            onValueChange={(value) => setLocalPolicy({...localPolicy, sso_enforcement: value})}
          >
            <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="off" className="text-white">Off</SelectItem>
              <SelectItem value="prefer" className="text-white">Prefer SSO</SelectItem>
              <SelectItem value="enforce" className="text-white">Enforce SSO Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-slate-300">Idle Timeout (minutes)</Label>
            <Input 
              type="number"
              value={localPolicy.session_policy?.idle_timeout_minutes || 60}
              onChange={(e) => setLocalPolicy({
                ...localPolicy, 
                session_policy: {
                  ...localPolicy.session_policy,
                  idle_timeout_minutes: parseInt(e.target.value)
                }
              })}
              className="bg-slate-900/50 border-slate-700 text-white"
            />
          </div>
          <div>
            <Label className="text-slate-300">Max Sessions</Label>
            <Input 
              type="number"
              value={localPolicy.session_policy?.concurrent_sessions || 5}
              onChange={(e) => setLocalPolicy({
                ...localPolicy, 
                session_policy: {
                  ...localPolicy.session_policy,
                  concurrent_sessions: parseInt(e.target.value)
                }
              })}
              className="bg-slate-900/50 border-slate-700 text-white"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-slate-300">Require Step-up MFA for Sensitive Operations</Label>
          <Switch 
            checked={localPolicy.step_up_mfa_required || false}
            onCheckedChange={(checked) => setLocalPolicy({...localPolicy, step_up_mfa_required: checked})}
          />
        </div>

        <Button onClick={handleSave} className="w-full bg-[var(--color-primary)] hover:bg-red-700">
          Save Policy
        </Button>
      </CardContent>
    </Card>
  );
};

const ActiveSessionsCard = ({ sessions, onRevoke }) => {
  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Monitor className="w-5 h-5 text-green-400" />
          Active Sessions ({sessions.filter(s => s.is_active).length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700">
              <TableHead className="text-slate-300">Device</TableHead>
              <TableHead className="text-slate-300">Location</TableHead>
              <TableHead className="text-slate-300">Last Seen</TableHead>
              <TableHead className="text-slate-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.filter(s => s.is_active).slice(0, 10).map(session => (
              <TableRow key={session.id} className="border-slate-700">
                <TableCell>
                  <div className="flex items-center gap-2">
                    {session.device_info?.includes('Mobile') ? 
                      <Smartphone className="w-4 h-4 text-slate-400" /> : 
                      <Monitor className="w-4 h-4 text-slate-400" />
                    }
                    <div>
                      <p className="text-white text-sm font-medium">
                        {session.device_info || 'Unknown Device'}
                      </p>
                      <p className="text-slate-400 text-xs">{session.ip_address}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Globe className="w-3 h-3 text-slate-400" />
                    <span className="text-slate-300">{session.country || 'Unknown'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-slate-400">
                  {new Date(session.last_seen).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => onRevoke(session.id)}
                    className="border-slate-600 text-slate-300"
                  >
                    Revoke
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default function SecurityCenter() {
  const [policy, setPolicy] = useState(null);
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [organization, setOrganization] = useState(null);
  const [geoAuditLogs, setGeoAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [policyData, userData, sessionData, orgData, geoLogs] = await Promise.all([
        AuthPolicy.list().then(results => results[0] || null),
        User.filter({ organization_id: 'demo-org-1' }),
        UserSession.filter({ organization_id: 'demo-org-1' }),
        Organization.get('demo-org-1'),
        GeolocationAuditLog.filter({ organization_id: 'demo-org-1' }, '-created_date', 50).catch(() => [])
      ]);
      
      setPolicy(policyData);
      setUsers(userData);
      setSessions(sessionData);
      setOrganization(orgData);
      setGeoAuditLogs(geoLogs);
    } catch (error) {
      console.error('Error loading security data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRevokeSession = async (sessionId) => {
    try {
      await UserSession.update(sessionId, { is_active: false });
      toast.success('Session revoked successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to revoke session');
    }
  };

  const handleUpdateOrganization = async (data) => {
    try {
      await Organization.update(organization.id, data);
      toast.success('Organization settings updated');
      loadData();
    } catch (error) {
      toast.error('Failed to update organization');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading security center...</div>;
  }

  const geoBlocksToday = geoAuditLogs.filter(log => {
    const logDate = new Date(log.created_date);
    const today = new Date();
    return logDate.toDateString() === today.toDateString() && log.decision === 'blocked';
  }).length;

  const uniqueCountriesToday = [...new Set(
    geoAuditLogs.filter(log => {
      const logDate = new Date(log.created_date);
      const today = new Date();
      return logDate.toDateString() === today.toDateString();
    }).map(log => log.geo_country_code)
  )].length;

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Security Center</h1>
          <p className="text-slate-400">Manage authentication policies, break-glass accounts, and security monitoring</p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-slate-800/50 border border-slate-700 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="break-glass">Break-Glass</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="geolocation">Geolocation</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <SecurityPostureCard policy={policy} users={users} sessions={sessions} />
              <div className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-slate-900/30 rounded-lg">
                      <div className="text-2xl font-bold text-white">{users.filter(u => u.mfa_enabled).length}</div>
                      <div className="text-xs text-slate-400">MFA Enabled</div>
                    </div>
                    <div className="text-center p-3 bg-slate-900/30 rounded-lg">
                      <div className="text-2xl font-bold text-white">{sessions.filter(s => s.is_active).length}</div>
                      <div className="text-xs text-slate-400">Active Sessions</div>
                    </div>
                    <div className="text-center p-3 bg-slate-900/30 rounded-lg">
                      <div className="text-2xl font-bold text-white">{users.filter(u => u.break_glass).length}</div>
                      <div className="text-xs text-slate-400">Break-Glass Accounts</div>
                    </div>
                    <div className="text-center p-3 bg-slate-900/30 rounded-lg">
                      <div className="text-2xl font-bold text-red-400">{geoBlocksToday}</div>
                      <div className="text-xs text-slate-400">Geo Blocks (24h)</div>
                    </div>
                    <div className="text-center p-3 bg-slate-900/30 rounded-lg col-span-2">
                      <div className="text-2xl font-bold text-blue-400">{uniqueCountriesToday}</div>
                      <div className="text-xs text-slate-400">Countries Accessed (24h)</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="policies">
            <PolicySettingsCard policy={policy} onUpdate={loadData} />
          </TabsContent>

          <TabsContent value="break-glass">
            <BreakGlassAccountsCard users={users} onUpdate={loadData} />
          </TabsContent>

          <TabsContent value="sessions">
            <ActiveSessionsCard sessions={sessions} onRevoke={handleRevokeSession} />
          </TabsContent>

          <TabsContent value="geolocation" className="space-y-8">
            <GeolocationPolicyCard organization={organization} onUpdate={handleUpdateOrganization} />
            <UserGeolocationCard users={users} onUpdate={loadData} />
            <GeolocationAuditCard auditLogs={geoAuditLogs} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
