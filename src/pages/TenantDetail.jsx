
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Building2, 
  Users, 
  Shield, 
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Target,
  Download
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

const MOCK_TENANT_DETAILS = {
  'org-1': {
    id: 'org-1',
    name: 'Reddome Security',
    slug: 'reddome-security',
    status: 'active',
    subscription_tier: 'enterprise',
    primary_domain: 'reddome.org',
    billing_email: 'billing@reddome.org',
    created_date: '2024-01-15T10:00:00Z',
    last_activity: '2024-12-13T14:30:00Z',
    users: [
      { email: 'bazam@reddome.org', role: 'super_admin', last_login: '2024-12-13T14:30:00Z' },
      { email: 'admin@reddome.org', role: 'admin', last_login: '2024-12-13T12:15:00Z' },
      { email: 'analyst@reddome.org', role: 'analyst', last_login: '2024-12-13T09:45:00Z' }
    ],
    assets: {
      total: 150,
      domains: 25,
      endpoints: 89,
      cloud_accounts: 12,
      code_repos: 24
    },
    security: {
      risk_score: 23,
      ce_readiness: 92,
      findings: { critical: 2, high: 8, medium: 45, low: 89 },
      last_scan: '2024-12-13T06:00:00Z'
    },
    billing: {
      plan: 'Enterprise Annual',
      amount: 24000,
      currency: 'USD',
      next_billing: '2025-01-15',
      status: 'paid'
    }
  },
  'org-2': {
    id: 'org-2',
    name: 'Acme Ltd',
    slug: 'acme-ltd',
    status: 'active',
    subscription_tier: 'pro',
    primary_domain: 'acme.com',
    billing_email: 'admin@acme.com',
    created_date: '2024-02-20T09:15:00Z',
    last_activity: '2024-12-13T11:20:00Z',
    users: [
      { email: 'admin@acme.com', role: 'admin', last_login: '2024-12-13T11:20:00Z' },
      { email: 'security@acme.com', role: 'analyst', last_login: '2024-12-12T16:30:00Z' }
    ],
    assets: {
      total: 89,
      domains: 8,
      endpoints: 65,
      cloud_accounts: 6,
      code_repos: 10
    },
    security: {
      risk_score: 45,
      ce_readiness: 67,
      findings: { critical: 5, high: 18, medium: 67, low: 134 },
      last_scan: '2024-12-12T22:00:00Z'
    },
    billing: {
      plan: 'Pro Monthly',
      amount: 299,
      currency: 'USD',
      next_billing: '2024-12-20',
      status: 'paid'
    }
  },
  'org-3': {
    id: 'org-3',
    name: 'Global Hardware Inc',
    slug: 'global-hardware',
    status: 'suspended',
    subscription_tier: 'free',
    primary_domain: 'globalhw.com',
    billing_email: 'it@globalhw.com',
    created_date: '2024-03-10T16:45:00Z',
    last_activity: '2024-12-10T08:45:00Z',
    users: [
      { email: 'it@globalhw.com', role: 'admin', last_login: '2024-12-10T08:45:00Z' }
    ],
    assets: {
      total: 34,
      domains: 3,
      endpoints: 28,
      cloud_accounts: 2,
      code_repos: 1
    },
    security: {
      risk_score: 78,
      ce_readiness: 34,
      findings: { critical: 12, high: 28, medium: 45, low: 67 },
      last_scan: '2024-12-10T06:00:00Z'
    },
    billing: {
      plan: 'Free',
      amount: 0,
      currency: 'USD',
      next_billing: null,
      status: 'free'
    }
  }
};

export default function TenantDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  const urlParams = new URLSearchParams(location.search);
  const tenantId = urlParams.get('id');

  const loadTenantDetail = useCallback(async () => {
    try {
      // In production, this would be an API call
      const tenantData = MOCK_TENANT_DETAILS[tenantId];
      if (!tenantData) {
        toast.error('Tenant not found');
        navigate(createPageUrl('TenantManagement'));
        return;
      }
      setTenant(tenantData);
    } catch (error) {
      console.error('Failed to load tenant details:', error);
      toast.error('Failed to load tenant details');
    } finally {
      setLoading(false);
    }
  }, [tenantId, navigate]); // Added navigate to dependencies

  useEffect(() => {
    loadTenantDetail();
  }, [loadTenantDetail]); // Now depends on the memoized function

  const exportTenantReport = async () => {
    toast.info('Generating tenant report...');
    // Mock export
    setTimeout(() => {
      toast.success('Tenant report exported successfully');
    }, 2000);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'suspended': return 'bg-red-500/20 text-red-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getRiskColor = (score) => {
    if (score < 30) return 'text-green-400';
    if (score < 60) return 'text-yellow-400';
    if (score < 80) return 'text-orange-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B00020]"></div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Tenant Not Found</h2>
        <p className="text-slate-400">The requested tenant could not be found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(createPageUrl('TenantManagement'))}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tenants
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">{tenant.name}</h1>
            <p className="text-slate-400">{tenant.primary_domain}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className={getStatusColor(tenant.status)}>
            {tenant.status}
          </Badge>
          <Button variant="outline" onClick={exportTenantReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{tenant.users.length}</div>
            <div className="text-sm text-slate-400">Active Users</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{tenant.assets.total}</div>
            <div className="text-sm text-slate-400">Total Assets</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <Shield className="w-6 h-6 text-[#B00020] mx-auto mb-2" />
            <div className={`text-2xl font-bold ${getRiskColor(tenant.security.risk_score)}`}>
              {tenant.security.risk_score}
            </div>
            <div className="text-sm text-slate-400">Risk Score</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{tenant.security.ce_readiness}%</div>
            <div className="text-sm text-slate-400">CE+ Ready</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Organization Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400">Organization Name</label>
                  <p className="text-white">{tenant.name}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Primary Domain</label>
                  <p className="text-white">{tenant.primary_domain}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Billing Email</label>
                  <p className="text-white">{tenant.billing_email}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Created Date</label>
                  <p className="text-white">{new Date(tenant.created_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Last Activity</label>
                  <p className="text-white">{new Date(tenant.last_activity).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Security Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400">Risk Score</label>
                    <p className={`text-2xl font-bold ${getRiskColor(tenant.security.risk_score)}`}>
                      {tenant.security.risk_score}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">CE+ Readiness</label>
                    <p className="text-2xl font-bold text-white">{tenant.security.ce_readiness}%</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Finding Summary</label>
                  <div className="flex gap-2 mt-1">
                    <Badge className="bg-red-500/20 text-red-400">
                      {tenant.security.findings.critical} Critical
                    </Badge>
                    <Badge className="bg-orange-500/20 text-orange-400">
                      {tenant.security.findings.high} High
                    </Badge>
                    <Badge className="bg-yellow-500/20 text-yellow-400">
                      {tenant.security.findings.medium} Medium
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Last Scan</label>
                  <p className="text-white">{new Date(tenant.security.last_scan).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">User Directory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tenant.users.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{user.email}</p>
                      <p className="text-sm text-slate-400">Last login: {new Date(user.last_login).toLocaleString()}</p>
                    </div>
                    <Badge className={user.role === 'super_admin' ? 'bg-purple-500/20 text-purple-400' : user.role === 'admin' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}>
                      {user.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Asset Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{tenant.assets.domains}</div>
                  <div className="text-sm text-slate-400">Domains</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{tenant.assets.endpoints}</div>
                  <div className="text-sm text-slate-400">Endpoints</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{tenant.assets.cloud_accounts}</div>
                  <div className="text-sm text-slate-400">Cloud Accounts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{tenant.assets.code_repos}</div>
                  <div className="text-sm text-slate-400">Code Repos</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Security Findings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Critical</span>
                    <Badge className="bg-red-500/20 text-red-400">
                      {tenant.security.findings.critical}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">High</span>
                    <Badge className="bg-orange-500/20 text-orange-400">
                      {tenant.security.findings.high}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Medium</span>
                    <Badge className="bg-yellow-500/20 text-yellow-400">
                      {tenant.security.findings.medium}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Low</span>
                    <Badge className="bg-green-500/20 text-green-400">
                      {tenant.security.findings.low}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Compliance Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400">CE+ Readiness</span>
                      <span className="text-white font-bold">{tenant.security.ce_readiness}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-[#B00020] h-2 rounded-full" 
                        style={{ width: `${tenant.security.ce_readiness}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400">Risk Score</span>
                      <span className={`font-bold ${getRiskColor(tenant.security.risk_score)}`}>
                        {tenant.security.risk_score}/100
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${tenant.security.risk_score > 60 ? 'bg-red-400' : tenant.security.risk_score > 30 ? 'bg-yellow-400' : 'bg-green-400'}`}
                        style={{ width: `${tenant.security.risk_score}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="billing">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Billing Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-400">Current Plan</label>
                    <p className="text-white font-medium">{tenant.billing.plan}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Amount</label>
                    <p className="text-white font-medium">
                      {tenant.billing.amount > 0 
                        ? `${tenant.billing.currency} $${tenant.billing.amount.toLocaleString()}`
                        : 'Free'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Next Billing Date</label>
                    <p className="text-white">
                      {tenant.billing.next_billing 
                        ? new Date(tenant.billing.next_billing).toLocaleDateString()
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Status</label>
                    <Badge className={tenant.billing.status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}>
                      {tenant.billing.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
