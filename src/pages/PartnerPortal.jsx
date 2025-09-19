import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  Eye, 
  Clock, 
  FileText, 
  Upload, 
  Download, 
  MessageSquare, 
  AlertTriangle,
  CheckCircle,
  User,
  Settings,
  LogOut,
  Key,
  Activity,
  Calendar,
  Target,
  Users,
  Globe,
  Building
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import partnerManagementEngine from '../services/PartnerManagementEngine';

// Mock partner session data
const mockPartnerSession = {
  id: 'partner_123',
  name: 'CyberShield Security',
  email: 'contact@cybershield.com',
  accessLevel: 'trusted_partner',
  sessionStartTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours
  lastActivity: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
  ipAddress: '203.0.113.42',
  mfaVerified: true,
  activeEngagements: [
    {
      id: 'eng_001',
      clientName: 'TechCorp Industries',
      clientCode: 'TC-2024-001',
      type: 'Web Application Penetration Test',
      status: 'in_progress',
      startDate: '2024-09-15',
      deadline: '2024-09-30',
      progress: 65,
      allowedAssets: [
        'https://app.techcorp.com',
        '203.0.113.0/24',
        'api.techcorp.com'
      ],
      restrictions: [
        'No production data download',
        'Testing hours: 9 AM - 5 PM PST',
        'Escalation required for critical findings'
      ],
      deliverables: [
        { name: 'Vulnerability Assessment Report', status: 'pending', dueDate: '2024-09-25' },
        { name: 'Executive Summary', status: 'pending', dueDate: '2024-09-30' },
        { name: 'Technical Remediation Guide', status: 'pending', dueDate: '2024-09-30' }
      ]
    },
    {
      id: 'eng_002',
      clientName: 'FinanceSecure Ltd',
      clientCode: 'FS-2024-008',
      type: 'Network Infrastructure Assessment',
      status: 'planning',
      startDate: '2024-10-01',
      deadline: '2024-10-15',
      progress: 15,
      allowedAssets: [
        '10.0.0.0/8',
        'mail.financesecure.com'
      ],
      restrictions: [
        'PCI DSS compliance required',
        'No network disruption allowed',
        'Coordination with internal team required'
      ],
      deliverables: [
        { name: 'Network Security Assessment', status: 'pending', dueDate: '2024-10-10' },
        { name: 'PCI Compliance Report', status: 'pending', dueDate: '2024-10-15' }
      ]
    }
  ]
};

export default function PartnerPortal() {
  const [partnerSession, setPartnerSession] = useState(mockPartnerSession);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedEngagement, setSelectedEngagement] = useState(null);
  const [uploadingReport, setUploadingReport] = useState(false);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(0);
  const [activityLog, setActivityLog] = useState([]);

  useEffect(() => {
    // Calculate session time remaining
    const updateSessionTimer = () => {
      const elapsed = Date.now() - partnerSession.sessionStartTime.getTime();
      const remaining = Math.max(0, partnerSession.sessionTimeout - elapsed);
      setSessionTimeRemaining(remaining);
    };

    updateSessionTimer();
    const timer = setInterval(updateSessionTimer, 1000);

    // Initialize activity log
    setActivityLog([
      { time: new Date(Date.now() - 10 * 60 * 1000), action: 'Logged into partner portal', ip: partnerSession.ipAddress },
      { time: new Date(Date.now() - 8 * 60 * 1000), action: 'Viewed engagement TC-2024-001', ip: partnerSession.ipAddress },
      { time: new Date(Date.now() - 5 * 60 * 1000), action: 'Downloaded client asset list', ip: partnerSession.ipAddress }
    ]);

    return () => clearInterval(timer);
  }, [partnerSession]);

  const formatTimeRemaining = (milliseconds) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleReportUpload = async (engagementId, reportType) => {
    setUploadingReport(true);
    try {
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Log activity
      const newActivity = {
        time: new Date(),
        action: `Uploaded ${reportType} for engagement ${engagementId}`,
        ip: partnerSession.ipAddress
      };
      setActivityLog(prev => [newActivity, ...prev]);
      
      console.log(`Report uploaded: ${reportType} for engagement ${engagementId}`);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploadingReport(false);
    }
  };

  const handleLogout = () => {
    // Log activity
    const logoutActivity = {
      time: new Date(),
      action: 'Logged out of partner portal',
      ip: partnerSession.ipAddress
    };
    setActivityLog(prev => [logoutActivity, ...prev]);
    
    // Redirect to login
    console.log('Logging out partner...');
  };

  const getEngagementStatusColor = (status) => {
    switch (status) {
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'on_hold': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderSecurityStatus = () => (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Security Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Multi-Factor Authentication</span>
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
            <span className="text-green-400">Verified</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Session Time Remaining</span>
          <span className="text-white font-medium">
            {formatTimeRemaining(sessionTimeRemaining)}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-slate-400">IP Address</span>
          <span className="text-white font-mono">{partnerSession.ipAddress}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Access Level</span>
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
            {partnerSession.accessLevel.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
        
        <Alert>
          <Lock className="w-4 h-4" />
          <AlertDescription>
            Your session is secured with end-to-end encryption and all activities are logged for security compliance.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Shield className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-xl font-bold text-white">Partner Portal</h1>
              <p className="text-slate-400 text-sm">Secure Access Environment</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-white font-medium">{partnerSession.name}</p>
              <p className="text-slate-400 text-xs">
                Session: {formatTimeRemaining(sessionTimeRemaining)}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="border-slate-600"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-slate-800/50 border-r border-slate-700 min-h-screen">
          <nav className="p-4 space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'
              }`}
            >
              <Activity className="w-4 h-4 mr-3" />
              Dashboard
            </button>
            
            <button
              onClick={() => setActiveTab('engagements')}
              className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === 'engagements' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'
              }`}
            >
              <Target className="w-4 h-4 mr-3" />
              Active Engagements
            </button>
            
            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === 'reports' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'
              }`}
            >
              <FileText className="w-4 h-4 mr-3" />
              Report Submission
            </button>
            
            <button
              onClick={() => setActiveTab('communications')}
              className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === 'communications' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'
              }`}
            >
              <MessageSquare className="w-4 h-4 mr-3" />
              Client Communications
            </button>
            
            <button
              onClick={() => setActiveTab('activity')}
              className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === 'activity' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'
              }`}
            >
              <Clock className="w-4 h-4 mr-3" />
              Activity Log
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Dashboard</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Engagements Overview */}
                <div className="lg:col-span-2">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">Active Engagements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {partnerSession.activeEngagements.map(engagement => (
                          <div key={engagement.id} className="border border-slate-600 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="text-white font-medium">{engagement.clientName}</h4>
                                <p className="text-slate-400 text-sm">{engagement.type}</p>
                              </div>
                              <Badge variant="outline" className={getEngagementStatusColor(engagement.status)}>
                                {engagement.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Progress</span>
                                <span className="text-white">{engagement.progress}%</span>
                              </div>
                              <Progress value={engagement.progress} className="h-2" />
                              <div className="flex justify-between text-xs text-slate-400">
                                <span>Due: {engagement.deadline}</span>
                                <span>Code: {engagement.clientCode}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Security Status */}
                <div>
                  {renderSecurityStatus()}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'engagements' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Active Engagements</h2>
              
              {partnerSession.activeEngagements.map(engagement => (
                <Card key={engagement.id} className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white">{engagement.clientName}</CardTitle>
                        <p className="text-slate-400">{engagement.type}</p>
                      </div>
                      <Badge variant="outline" className={getEngagementStatusColor(engagement.status)}>
                        {engagement.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Overall Progress</span>
                        <span className="text-white">{engagement.progress}%</span>
                      </div>
                      <Progress value={engagement.progress} className="h-3" />
                    </div>

                    {/* Allowed Assets */}
                    <div>
                      <h4 className="text-white font-medium mb-2">Allowed Assets & Scope</h4>
                      <div className="bg-slate-700/30 rounded p-3 space-y-1">
                        {engagement.allowedAssets.map((asset, index) => (
                          <div key={index} className="flex items-center text-sm">
                            <Globe className="w-3 h-3 mr-2 text-green-400" />
                            <span className="text-slate-300 font-mono">{asset}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Restrictions */}
                    <div>
                      <h4 className="text-white font-medium mb-2">Testing Restrictions</h4>
                      <div className="space-y-2">
                        {engagement.restrictions.map((restriction, index) => (
                          <div key={index} className="flex items-start text-sm">
                            <AlertTriangle className="w-3 h-3 mr-2 text-red-400 mt-0.5" />
                            <span className="text-slate-300">{restriction}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Deliverables */}
                    <div>
                      <h4 className="text-white font-medium mb-2">Deliverables</h4>
                      <div className="space-y-2">
                        {engagement.deliverables.map((deliverable, index) => (
                          <div key={index} className="flex items-center justify-between bg-slate-700/30 rounded p-2">
                            <span className="text-slate-300 text-sm">{deliverable.name}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-slate-400">Due: {deliverable.dueDate}</span>
                              <Badge variant="outline" className={
                                deliverable.status === 'completed' 
                                  ? 'bg-green-100 text-green-800 border-green-200'
                                  : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              }>
                                {deliverable.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Report Submission</h2>
              
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Upload Deliverables</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {partnerSession.activeEngagements.map(engagement => (
                    <div key={engagement.id} className="border border-slate-600 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-3">{engagement.clientName} - {engagement.clientCode}</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {engagement.deliverables.map((deliverable, index) => (
                          <div key={index} className="bg-slate-700/30 rounded p-3">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-slate-300 text-sm">{deliverable.name}</span>
                              <Badge variant="outline" className={
                                deliverable.status === 'completed' 
                                  ? 'bg-green-100 text-green-800 border-green-200'
                                  : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              }>
                                {deliverable.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-400 mb-3">Due: {deliverable.dueDate}</p>
                            
                            <Button 
                              size="sm" 
                              className="w-full bg-blue-600 hover:bg-blue-700"
                              onClick={() => handleReportUpload(engagement.id, deliverable.name)}
                              disabled={uploadingReport || deliverable.status === 'completed'}
                            >
                              <Upload className="w-3 h-3 mr-2" />
                              {deliverable.status === 'completed' ? 'Uploaded' : 'Upload Report'}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'communications' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Client Communications</h2>
              
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Secure Messaging</CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-4">
                    <MessageSquare className="w-4 h-4" />
                    <AlertDescription>
                      All communications are encrypted and logged for security compliance. Use this channel for official engagement communications only.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-slate-400 text-sm">Select Engagement</label>
                      <select className="w-full mt-1 bg-slate-700 border border-slate-600 rounded p-2 text-white">
                        {partnerSession.activeEngagements.map(engagement => (
                          <option key={engagement.id} value={engagement.id}>
                            {engagement.clientName} - {engagement.clientCode}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-slate-400 text-sm">Message</label>
                      <Textarea 
                        className="mt-1 bg-slate-700 border-slate-600" 
                        placeholder="Type your secure message to the client..."
                        rows={4}
                      />
                    </div>
                    
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send Secure Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Activity Log</h2>
              
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Session Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activityLog.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between border-b border-slate-600 pb-2">
                        <div>
                          <p className="text-slate-300 text-sm">{activity.action}</p>
                          <p className="text-slate-500 text-xs">IP: {activity.ip}</p>
                        </div>
                        <span className="text-slate-400 text-xs">
                          {activity.time.toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}