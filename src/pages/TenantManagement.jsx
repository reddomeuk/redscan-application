
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User, Organization } from '@/api/entities';
import { 
  Building2, 
  Users, 
  Shield, 
  Download, 
  AlertTriangle,
  CheckCircle2,
  Pause,
  Play,
  Eye,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';

const MOCK_TENANTS = [
  {
    id: 'org-1',
    name: 'Reddome Security',
    slug: 'reddome-security',
    status: 'active',
    subscription_tier: 'enterprise',
    primary_domain: 'reddome.org',
    user_count: 25,
    asset_count: 150,
    risk_score: 23,
    ce_readiness: 92,
    created_date: '2024-01-15T10:00:00Z',
    last_activity: '2024-12-13T14:30:00Z',
    billing_email: 'billing@reddome.org'
  },
  {
    id: 'org-2',
    name: 'Acme Ltd',
    slug: 'acme-ltd',
    status: 'active',
    subscription_tier: 'pro',
    primary_domain: 'acme.com',
    user_count: 12,
    asset_count: 89,
    risk_score: 45,
    ce_readiness: 67,
    created_date: '2024-02-20T09:15:00Z',
    last_activity: '2024-12-13T11:20:00Z',
    billing_email: 'admin@acme.com'
  },
  {
    id: 'org-3',
    name: 'Global Hardware Inc',
    slug: 'global-hardware',
    status: 'suspended',
    subscription_tier: 'free',
    primary_domain: 'globalhw.com',
    user_count: 8,
    asset_count: 34,
    risk_score: 78,
    ce_readiness: 34,
    created_date: '2024-03-10T16:45:00Z',
    last_activity: '2024-12-10T08:45:00Z',
    billing_email: 'it@globalhw.com'
  }
];

export default function TenantManagementPage() {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState(MOCK_TENANTS);
  const [filteredTenants, setFilteredTenants] = useState(MOCK_TENANTS);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    tier: 'all'
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      if (currentUser.role !== 'super_admin') {
        toast.error('Access denied. Super Admin privileges required.');
        navigate(createPageUrl('Dashboard'));
        return;
      }
      
      // In production, this would load actual tenant data
      setTenants(MOCK_TENANTS);
    } catch (error) {
      console.error('Failed to load tenant data:', error);
      toast.error('Failed to load tenant data');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const applyFilters = useCallback(() => {
    let filtered = tenants;

    if (filters.search) {
      filtered = filtered.filter(tenant =>
        tenant.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        tenant.primary_domain.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(tenant => tenant.status === filters.status);
    }

    if (filters.tier !== 'all') {
      filtered = filtered.filter(tenant => tenant.subscription_tier === filters.tier);
    }

    setFilteredTenants(filtered);
  }, [tenants, filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleSuspendTenant = async (tenantId) => {
    try {
      const tenant = tenants.find(t => t.id === tenantId);
      const newStatus = tenant.status === 'active' ? 'suspended' : 'active';
      const action = newStatus === 'suspended' ? 'suspended' : 'reactivated';
      
      const updatedTenants = tenants.map(t =>
        t.id === tenantId ? { ...t, status: newStatus } : t
      );
      
      setTenants(updatedTenants);
      toast.success(`Tenant ${tenant.name} has been ${action}`);
      
      // In production, this would log to Evidence Vault
      console.log(`AUDIT: Tenant ${tenantId} ${action} by ${user.email} at ${new Date().toISOString()}`);
    } catch (error) {
      toast.error('Failed to update tenant status');
    }
  };

  const handleViewTenant = (tenantId) => {
    navigate(createPageUrl(`TenantDetail?id=${tenantId}`));
  };

  const exportTenants = async (format = 'csv') => {
    toast.info(`Exporting tenants as ${format.toUpperCase()}...`);
    
    // Mock export - in production this would generate and download the file
    setTimeout(() => {
      toast.success(`Tenant registry exported as ${format.toUpperCase()}`);
    }, 1500);
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: 'bg-green-500/20 text-green-400',
      suspended: 'bg-red-500/20 text-red-400',
      pending: 'bg-yellow-500/20 text-yellow-400'
    };
    return variants[status] || 'bg-slate-500/20 text-slate-400';
  };

  const getTierBadge = (tier) => {
    const variants = {
      enterprise: 'bg-purple-500/20 text-purple-400',
      pro: 'bg-blue-500/20 text-blue-400',
      free: 'bg-slate-500/20 text-slate-400'
    };
    return variants[tier] || 'bg-slate-500/20 text-slate-400';
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

  if (!user || user.role !== 'super_admin') {
    return (
      <div className="text-center py-12">
        <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-slate-400">Super Admin privileges required to access this page.</p>
      </div>
    );
  }

  const totalTenants = tenants.length;
  const activeTenants = tenants.filter(t => t.status === 'active').length;
  const avgCEReadiness = Math.round(tenants.reduce((sum, t) => sum + t.ce_readiness, 0) / tenants.length);
  const totalUsers = tenants.reduce((sum, t) => sum + t.user_count, 0);

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">RedScan Super Admin Console</h1>
          <p className="text-slate-400">Multi-tenant platform management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportTenants('csv')}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => exportTenants('pdf')}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </header>

      {/* Global KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <Building2 className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{totalTenants}</div>
            <div className="text-sm text-slate-400">Total Tenants</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{activeTenants}</div>
            <div className="text-sm text-slate-400">Active Tenants</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <Shield className="w-6 h-6 text-[#B00020] mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{avgCEReadiness}%</div>
            <div className="text-sm text-slate-400">Avg CE+ Readiness</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{totalUsers}</div>
            <div className="text-sm text-slate-400">Total Users</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Tenant Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Search tenants..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="bg-slate-900 border-slate-700"
            />
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger className="w-40 bg-slate-900 border-slate-700">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.tier}
              onValueChange={(value) => setFilters({ ...filters, tier: value })}
            >
              <SelectTrigger className="w-40 bg-slate-900 border-slate-700">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="free">Free</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-300">Organization</TableHead>
                <TableHead className="text-slate-300">Status</TableHead>
                <TableHead className="text-slate-300">Plan</TableHead>
                <TableHead className="text-slate-300">Users</TableHead>
                <TableHead className="text-slate-300">Risk Score</TableHead>
                <TableHead className="text-slate-300">CE+ Ready</TableHead>
                <TableHead className="text-slate-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenants.map((tenant) => (
                <TableRow key={tenant.id} className="border-slate-800">
                  <TableCell>
                    <div>
                      <div className="font-medium text-white">{tenant.name}</div>
                      <div className="text-sm text-slate-400">{tenant.primary_domain}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(tenant.status)}>
                      {tenant.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTierBadge(tenant.subscription_tier)}>
                      {tenant.subscription_tier}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white">{tenant.user_count}</TableCell>
                  <TableCell>
                    <span className={getRiskColor(tenant.risk_score)}>
                      {tenant.risk_score}
                    </span>
                  </TableCell>
                  <TableCell className="text-white">{tenant.ce_readiness}%</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewTenant(tenant.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={tenant.status === 'active' ? 'destructive' : 'default'}
                        onClick={() => handleSuspendTenant(tenant.id)}
                      >
                        {tenant.status === 'active' ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
