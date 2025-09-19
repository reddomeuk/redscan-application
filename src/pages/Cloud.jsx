import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Cloud, 
  Plus, 
  Settings,
  Shield,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Upload,
  Download
} from 'lucide-react';
import { User } from '@/api/entities';
import { toast } from 'sonner';
import AddCloudAccountModal from '../components/cloud/AddCloudAccountModal';
import UploadCloudResultsModal from '../components/cloud/UploadCloudResultsModal';

const MOCK_ACCOUNTS = [
  {
    id: 'aws-1',
    name: 'Production AWS',
    provider: 'AWS',
    status: 'connected',
    lastScan: '2024-01-15T10:30:00Z',
    findings: { critical: 2, high: 8, medium: 15, low: 22 }
  },
  {
    id: 'azure-1', 
    name: 'Azure Subscription',
    provider: 'Azure',
    status: 'error',
    lastScan: '2024-01-14T08:15:00Z',
    findings: { critical: 0, high: 3, medium: 7, low: 12 }
  }
];

export default function CloudSecurityPage() {
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState(MOCK_ACCOUNTS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const canManage = () => user?.role === 'admin' || user?.role === 'super_admin';

  const getStatusBadge = (status) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-500/20 text-green-400">Connected</Badge>;
      case 'error':
        return <Badge className="bg-red-500/20 text-red-400">Error</Badge>;
      case 'scanning':
        return <Badge className="bg-blue-500/20 text-blue-400">Scanning</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400">Unknown</Badge>;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">Cloud Security</h1>
          <p className="text-slate-400">Monitor cloud infrastructure security across AWS, Azure, GCP, and Microsoft 365</p>
        </div>
        {canManage() && (
          <div className="flex gap-2">
            <Button onClick={() => setShowUploadModal(true)} variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Upload Results
            </Button>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Account
            </Button>
          </div>
        )}
      </header>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to={createPageUrl("M365Posture")}>
          <Card className="bg-slate-800/50 border-slate-700 hover:border-[#B00020] transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">Microsoft 365</h3>
              <p className="text-slate-400 text-sm">One-click posture assessment</p>
              <Badge className="mt-2 bg-green-500/20 text-green-400">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Ready
              </Badge>
            </CardContent>
          </Card>
        </Link>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">AWS</h3>
            <p className="text-slate-400 text-sm">EC2, S3, IAM configuration</p>
            <Badge className="mt-2 bg-yellow-500/20 text-yellow-400">
              <Settings className="w-3 h-3 mr-1" />
              Setup Required
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Azure</h3>
            <p className="text-slate-400 text-sm">Resource security policies</p>
            <Badge className="mt-2 bg-yellow-500/20 text-yellow-400">
              <Settings className="w-3 h-3 mr-1" />
              Setup Required
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Google Cloud</h3>
            <p className="text-slate-400 text-sm">GCP resource configuration</p>
            <Badge className="mt-2 bg-yellow-500/20 text-yellow-400">
              <Settings className="w-3 h-3 mr-1" />
              Setup Required
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Connected Accounts */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Cloud className="w-5 h-5 text-[#B00020]" />
            Connected Cloud Accounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div className="text-center py-8">
              <Cloud className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">No cloud accounts connected</h3>
              <p className="text-slate-400 mb-4">Connect your cloud providers to start monitoring security configurations</p>
              {canManage() && (
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Account
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {accounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
                      <Cloud className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{account.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-slate-400 text-sm">{account.provider}</span>
                        {getStatusBadge(account.status)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-slate-400 text-sm">Findings</p>
                      <div className="flex gap-2 mt-1">
                        <span className={`text-sm font-medium ${getSeverityColor('critical')}`}>
                          {account.findings.critical}C
                        </span>
                        <span className={`text-sm font-medium ${getSeverityColor('high')}`}>
                          {account.findings.high}H
                        </span>
                        <span className={`text-sm font-medium ${getSeverityColor('medium')}`}>
                          {account.findings.medium}M
                        </span>
                        <span className={`text-sm font-medium ${getSeverityColor('low')}`}>
                          {account.findings.low}L
                        </span>
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddCloudAccountModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAccountAdded={(account) => {
          setAccounts([...accounts, account]);
          toast.success('Cloud account added successfully');
        }}
      />

      <UploadCloudResultsModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onResultsUploaded={() => {
          toast.success('Cloud results uploaded successfully');
        }}
      />
    </div>
  );
}