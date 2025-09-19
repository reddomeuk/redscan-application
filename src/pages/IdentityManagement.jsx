/**
 * Identity & Access Management Dashboard
 * Comprehensive IAM with user lifecycle, PAM, SSO, and access analytics
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Area, AreaChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter
} from 'recharts';
import { 
  Users, UserCheck, UserX, Shield, Key, Lock, 
  Activity, AlertTriangle, Clock, Settings,
  Eye, EyeOff, Fingerprint, Smartphone, Globe,
  CheckCircle, XCircle, Plus, Search, Filter,
  Download, RefreshCw, Calendar, Database,
  Zap, TrendingUp, BarChart3, Target,
  Crown, Award, Star, MessageSquare
} from 'lucide-react';

const IdentityManagement = () => {
  const [iamData, setIamData] = useState({
    users: [],
    roles: [],
    permissions: [],
    accessReviews: [],
    privilegedAccounts: [],
    ssoConnections: [],
    accessEvents: [],
    riskScores: []
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    loadIdentityData();
    setupRealTimeConnection();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [selectedTimeRange]);

  const loadIdentityData = async () => {
    setLoading(true);
    try {
      // Simulate loading comprehensive IAM data
      const mockData = generateMockIAMData();
      setIamData(mockData);
    } catch (error) {
      console.error('Failed to load IAM data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeConnection = () => {
    try {
      wsRef.current = new WebSocket('ws://localhost:3001/identity-management');
      
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        updateRealTimeData(data);
      };
      
      wsRef.current.onopen = () => {
        console.log('Real-time IAM connection established');
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to setup real-time connection:', error);
    }
  };

  const updateRealTimeData = (newData) => {
    setIamData(prev => ({
      ...prev,
      accessEvents: [newData.event, ...prev.accessEvents].slice(0, 1000),
      users: prev.users.map(user => 
        user.id === newData.userId ? { ...user, ...newData.userUpdate } : user
      )
    }));
  };

  const generateMockIAMData = () => {
    return {
      users: generateUserData(),
      roles: generateRoleData(),
      permissions: generatePermissionData(),
      accessReviews: generateAccessReviewData(),
      privilegedAccounts: generatePrivilegedAccountData(),
      ssoConnections: generateSSOConnectionData(),
      accessEvents: generateAccessEventData(),
      riskScores: generateRiskScoreData()
    };
  };

  const generateUserData = () => {
    const departments = ['Engineering', 'Security', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
    const locations = ['New York', 'San Francisco', 'London', 'Tokyo', 'Remote'];
    const statuses = ['active', 'inactive', 'locked', 'pending'];
    
    return Array.from({ length: 250 }, (_, i) => ({
      id: `user_${i + 1}`,
      username: `user${i + 1}`,
      email: `user${i + 1}@company.com`,
      firstName: `First${i + 1}`,
      lastName: `Last${i + 1}`,
      department: departments[Math.floor(Math.random() * departments.length)],
      title: `Position ${i + 1}`,
      location: locations[Math.floor(Math.random() * locations.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      createdDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      loginCount: Math.floor(Math.random() * 1000) + 50,
      roles: generateUserRoles(),
      permissions: generateUserPermissions(),
      riskScore: Math.floor(Math.random() * 100),
      mfaEnabled: Math.random() > 0.3,
      ssoEnabled: Math.random() > 0.4,
      privilegedAccess: Math.random() > 0.8,
      accessReviewStatus: ['compliant', 'pending', 'overdue'][Math.floor(Math.random() * 3)],
      manager: i > 10 ? `user${Math.floor(Math.random() * 10) + 1}` : null,
      directReports: Math.floor(Math.random() * 10),
      lastPasswordChange: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      failedLoginAttempts: Math.floor(Math.random() * 5),
      accountExpiry: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000),
      groups: generateUserGroups(),
      devices: generateUserDevices(),
      applications: generateUserApplications()
    }));
  };

  const generateRoleData = () => {
    const roleTypes = ['built-in', 'custom', 'application-specific'];
    const riskLevels = ['low', 'medium', 'high', 'critical'];
    
    const baseRoles = [
      { name: 'Administrator', description: 'Full system access', type: 'built-in', risk: 'critical' },
      { name: 'Security Analyst', description: 'Security operations access', type: 'built-in', risk: 'high' },
      { name: 'User Manager', description: 'User management capabilities', type: 'built-in', risk: 'medium' },
      { name: 'Auditor', description: 'Read-only audit access', type: 'built-in', risk: 'low' },
      { name: 'Developer', description: 'Development environment access', type: 'custom', risk: 'medium' },
      { name: 'Finance Manager', description: 'Financial system access', type: 'custom', risk: 'high' },
      { name: 'HR Specialist', description: 'HR system access', type: 'custom', risk: 'medium' },
      { name: 'Support Agent', description: 'Customer support access', type: 'custom', risk: 'low' },
      { name: 'Sales Manager', description: 'Sales system access', type: 'custom', risk: 'medium' },
      { name: 'Marketing User', description: 'Marketing tools access', type: 'custom', risk: 'low' }
    ];
    
    return baseRoles.map((role, i) => ({
      id: `role_${i + 1}`,
      ...role,
      userCount: Math.floor(Math.random() * 50) + 5,
      permissions: generateRolePermissions(),
      createdDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      lastModified: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      isActive: Math.random() > 0.1,
      requiresApproval: Math.random() > 0.5,
      maxDuration: Math.random() > 0.7 ? Math.floor(Math.random() * 365) + 30 : null,
      inheritedFrom: Math.random() > 0.8 ? 'Active Directory' : null,
      compliance: {
        sox: Math.random() > 0.6,
        gdpr: Math.random() > 0.5,
        hipaa: Math.random() > 0.7,
        pci: Math.random() > 0.8
      }
    }));
  };

  const generatePermissionData = () => {
    const permissionCategories = ['System', 'Application', 'Data', 'Network', 'Security'];
    const actions = ['Read', 'Write', 'Execute', 'Delete', 'Admin'];
    
    return Array.from({ length: 100 }, (_, i) => ({
      id: `perm_${i + 1}`,
      name: `Permission ${i + 1}`,
      description: `Permission description ${i + 1}`,
      category: permissionCategories[Math.floor(Math.random() * permissionCategories.length)],
      action: actions[Math.floor(Math.random() * actions.length)],
      resource: `Resource ${Math.floor(Math.random() * 20) + 1}`,
      riskLevel: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
      userCount: Math.floor(Math.random() * 100) + 10,
      roleCount: Math.floor(Math.random() * 10) + 1,
      isPrivileged: Math.random() > 0.7,
      requiresJustification: Math.random() > 0.6,
      autoExpiry: Math.random() > 0.5,
      auditLog: Math.random() > 0.8,
      createdDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      lastUsed: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      usageCount: Math.floor(Math.random() * 1000) + 50
    }));
  };

  const generateAccessReviewData = () => {
    const reviewTypes = ['periodic', 'role-based', 'user-based', 'application-based'];
    const statuses = ['pending', 'in-progress', 'completed', 'overdue'];
    
    return Array.from({ length: 50 }, (_, i) => ({
      id: `review_${i + 1}`,
      name: `Access Review ${i + 1}`,
      type: reviewTypes[Math.floor(Math.random() * reviewTypes.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      reviewer: `reviewer${Math.floor(Math.random() * 20) + 1}@company.com`,
      scope: `Scope ${i + 1}`,
      startDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
      completionDate: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000) : null,
      userCount: Math.floor(Math.random() * 100) + 20,
      reviewedCount: Math.floor(Math.random() * 80) + 10,
      approvedCount: Math.floor(Math.random() * 70) + 5,
      revokedCount: Math.floor(Math.random() * 10) + 1,
      pendingCount: Math.floor(Math.random() * 20) + 5,
      riskFindings: Math.floor(Math.random() * 15) + 2,
      complianceIssues: Math.floor(Math.random() * 8) + 1,
      priority: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
      autoReminder: Math.random() > 0.3,
      escalationLevel: Math.floor(Math.random() * 3)
    }));
  };

  const generatePrivilegedAccountData = () => {
    const accountTypes = ['service', 'administrative', 'emergency', 'shared'];
    const systems = ['Active Directory', 'Database', 'Cloud Platform', 'Network Equipment', 'Security Tools'];
    
    return Array.from({ length: 75 }, (_, i) => ({
      id: `priv_${i + 1}`,
      accountName: `priv_account_${i + 1}`,
      type: accountTypes[Math.floor(Math.random() * accountTypes.length)],
      system: systems[Math.floor(Math.random() * systems.length)],
      owner: `owner${Math.floor(Math.random() * 30) + 1}@company.com`,
      custodian: `custodian${Math.floor(Math.random() * 20) + 1}@company.com`,
      status: ['active', 'inactive', 'locked', 'disabled'][Math.floor(Math.random() * 4)],
      lastUsed: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      lastPasswordChange: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      passwordExpiry: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000),
      sessionCount: Math.floor(Math.random() * 100) + 10,
      riskScore: Math.floor(Math.random() * 100),
      isVaulted: Math.random() > 0.2,
      autoRotation: Math.random() > 0.3,
      sessionRecording: Math.random() > 0.4,
      approvalRequired: Math.random() > 0.5,
      maxSessionDuration: Math.floor(Math.random() * 480) + 60, // minutes
      allowedHours: '09:00-18:00',
      ipRestrictions: Math.random() > 0.6,
      geolocationRestrictions: Math.random() > 0.7,
      mfaRequired: Math.random() > 0.8,
      auditTrail: Math.random() > 0.9,
      complianceFlags: {
        sox: Math.random() > 0.7,
        gdpr: Math.random() > 0.6,
        hipaa: Math.random() > 0.8,
        pci: Math.random() > 0.9
      }
    }));
  };

  const generateSSOConnectionData = () => {
    const providers = ['Azure AD', 'Okta', 'Google Workspace', 'ADFS', 'Ping Identity', 'Auth0'];
    const protocols = ['SAML 2.0', 'OpenID Connect', 'OAuth 2.0', 'LDAP'];
    
    return providers.map((provider, i) => ({
      id: `sso_${i + 1}`,
      name: provider,
      protocol: protocols[Math.floor(Math.random() * protocols.length)],
      status: ['active', 'inactive', 'error'][Math.floor(Math.random() * 3)],
      userCount: Math.floor(Math.random() * 200) + 50,
      applications: Math.floor(Math.random() * 20) + 5,
      lastSync: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      syncFrequency: ['real-time', 'hourly', 'daily'][Math.floor(Math.random() * 3)],
      errorCount: Math.floor(Math.random() * 10),
      successRate: Math.random() * 0.15 + 0.85, // 85-100%
      averageResponseTime: Math.floor(Math.random() * 500) + 100, // ms
      certificateExpiry: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000),
      jitProvisioning: Math.random() > 0.4,
      groupMapping: Math.random() > 0.3,
      attributeMapping: Math.random() > 0.2,
      encryption: Math.random() > 0.8,
      auditLogging: Math.random() > 0.9
    }));
  };

  const generateAccessEventData = () => {
    const eventTypes = ['login', 'logout', 'failed_login', 'privilege_escalation', 'password_change', 'role_assignment', 'permission_grant'];
    const results = ['success', 'failure', 'blocked'];
    
    return Array.from({ length: 1000 }, (_, i) => ({
      id: `event_${i + 1}`,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      result: results[Math.floor(Math.random() * results.length)],
      username: `user${Math.floor(Math.random() * 250) + 1}`,
      sourceIp: generateRandomIP(),
      userAgent: generateUserAgent(),
      application: `app_${Math.floor(Math.random() * 20) + 1}`,
      resource: `resource_${Math.floor(Math.random() * 50) + 1}`,
      riskScore: Math.floor(Math.random() * 100),
      location: generateLocation(),
      deviceId: `device_${Math.floor(Math.random() * 100) + 1}`,
      sessionId: `session_${Math.random().toString(36).substr(2, 16)}`,
      duration: Math.floor(Math.random() * 28800) + 300, // 5 min to 8 hours in seconds
      mfaUsed: Math.random() > 0.4,
      anomalyScore: Math.random(),
      correlationId: `corr_${Math.random().toString(36).substr(2, 12)}`
    }));
  };

  const generateRiskScoreData = () => {
    return Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
      averageRisk: Math.floor(Math.random() * 40) + 30,
      highRiskUsers: Math.floor(Math.random() * 20) + 5,
      privilegedRisk: Math.floor(Math.random() * 60) + 40,
      complianceScore: Math.floor(Math.random() * 20) + 80
    }));
  };

  // Helper functions for data generation
  const generateUserRoles = () => {
    const roles = ['User', 'Analyst', 'Manager', 'Administrator', 'Auditor'];
    const roleCount = Math.floor(Math.random() * 3) + 1;
    return Array.from({ length: roleCount }, () => roles[Math.floor(Math.random() * roles.length)]);
  };

  const generateUserPermissions = () => {
    return Math.floor(Math.random() * 50) + 10;
  };

  const generateUserGroups = () => {
    const groups = ['Engineering', 'Security', 'Marketing', 'Sales', 'HR', 'Finance'];
    return groups.filter(() => Math.random() > 0.6);
  };

  const generateUserDevices = () => {
    return Math.floor(Math.random() * 5) + 1;
  };

  const generateUserApplications = () => {
    return Math.floor(Math.random() * 20) + 5;
  };

  const generateRolePermissions = () => {
    return Math.floor(Math.random() * 30) + 5;
  };

  const generateRandomIP = () => {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  };

  const generateUserAgent = () => {
    const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
    return browsers[Math.floor(Math.random() * browsers.length)];
  };

  const generateLocation = () => {
    const locations = ['New York', 'San Francisco', 'London', 'Tokyo', 'Sydney'];
    return locations[Math.floor(Math.random() * locations.length)];
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      locked: 'bg-red-100 text-red-800 border-red-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      disabled: 'bg-red-100 text-red-800 border-red-200',
      error: 'bg-red-100 text-red-800 border-red-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      overdue: 'bg-red-100 text-red-800 border-red-200',
      'in-progress': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[status] || colors.active;
  };

  const getRiskColor = (risk) => {
    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      critical: 'text-red-600'
    };
    return colors[risk] || colors.medium;
  };

  const UserRiskChart = () => {
    const chartData = iamData.riskScores.slice(-7);
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
          <YAxis />
          <Tooltip labelFormatter={(date) => new Date(date).toLocaleDateString()} />
          <Legend />
          <Line type="monotone" dataKey="averageRisk" stroke="#3b82f6" name="Average Risk" />
          <Line type="monotone" dataKey="privilegedRisk" stroke="#ef4444" name="Privileged Risk" />
          <Line type="monotone" dataKey="complianceScore" stroke="#10b981" name="Compliance Score" />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const AccessDistributionChart = () => {
    const roleData = iamData.roles.slice(0, 6).map(role => ({
      name: role.name,
      users: role.userCount,
      risk: role.risk === 'critical' ? 4 : role.risk === 'high' ? 3 : role.risk === 'medium' ? 2 : 1
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={roleData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="users" fill="#3b82f6" name="User Count" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const PrivilegedAccountChart = () => {
    const privilegedData = iamData.privilegedAccounts.reduce((acc, account) => {
      acc[account.system] = (acc[account.system] || 0) + 1;
      return acc;
    }, {});

    const chartData = Object.entries(privilegedData).map(([system, count]) => ({
      name: system,
      value: count
    }));

    const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-2">
          <Users className="w-6 h-6 animate-pulse" />
          <span>Loading Identity & Access Management...</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-32 bg-gray-100" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <Users className="w-8 h-8 text-blue-600" />
            <span>Identity & Access Management</span>
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive user lifecycle, privileged access, and compliance management
          </p>
        </div>
        
        <div className="flex space-x-2">
          <select 
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-blue-600">
                  {iamData.users.length.toLocaleString()}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-green-600">
                  {iamData.users.filter(u => u.status === 'active').length}
                </p>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Privileged Accounts</p>
                <p className="text-2xl font-bold text-red-600">
                  {iamData.privilegedAccounts.filter(p => p.status === 'active').length}
                </p>
              </div>
              <Crown className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Access Reviews</p>
                <p className="text-2xl font-bold text-orange-600">
                  {iamData.accessReviews.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <Eye className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">SSO Connections</p>
                <p className="text-2xl font-bold text-purple-600">
                  {iamData.ssoConnections.filter(s => s.status === 'active').length}
                </p>
              </div>
              <Key className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Risk Users</p>
                <p className="text-2xl font-bold text-red-600">
                  {iamData.users.filter(u => u.riskScore >= 80).length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search users, roles, permissions, or access events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Button>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="privileged">Privileged</TabsTrigger>
          <TabsTrigger value="reviews">Access Reviews</TabsTrigger>
          <TabsTrigger value="sso">SSO</TabsTrigger>
          <TabsTrigger value="events">Audit Trail</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Trends</CardTitle>
                <CardDescription>User and privileged access risk over time</CardDescription>
              </CardHeader>
              <CardContent>
                <UserRiskChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Role Distribution</CardTitle>
                <CardDescription>User count by role assignment</CardDescription>
              </CardHeader>
              <CardContent>
                <AccessDistributionChart />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Privileged Account Distribution</CardTitle>
                <CardDescription>Privileged accounts by system</CardDescription>
              </CardHeader>
              <CardContent>
                <PrivilegedAccountChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Access Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {iamData.accessEvents.slice(0, 10).map(event => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Activity className="w-4 h-4 text-gray-600" />
                          <span className="font-medium text-sm">{event.type.replace('_', ' ')}</span>
                          <Badge className={getStatusColor(event.result)}>
                            {event.result}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600">
                          User: {event.username} | IP: {event.sourceIp} | App: {event.application}
                        </p>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-xs text-gray-500">
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-500">Risk: {event.riskScore}</span>
                          {event.mfaUsed && (
                            <Badge variant="outline" className="text-xs">MFA</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Complete user lifecycle and access management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {iamData.users.slice(0, 20).map(user => (
                  <div key={user.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold">{user.firstName} {user.lastName}</h3>
                          <Badge className={getStatusColor(user.status)}>
                            {user.status}
                          </Badge>
                          <Badge className={getStatusColor(user.accessReviewStatus)}>
                            Review: {user.accessReviewStatus}
                          </Badge>
                          {user.privilegedAccess && (
                            <Badge className="bg-red-100 text-red-800 border-red-200">
                              <Crown className="w-3 h-3 mr-1" />
                              Privileged
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Email:</span>
                            <p className="font-medium">{user.email}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Department:</span>
                            <p className="font-medium">{user.department}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Risk Score:</span>
                            <p className={`font-medium ${getRiskColor(user.riskScore >= 80 ? 'critical' : user.riskScore >= 60 ? 'high' : user.riskScore >= 40 ? 'medium' : 'low')}`}>
                              {user.riskScore}/100
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Last Login:</span>
                            <p className="font-medium">{new Date(user.lastLogin).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-3">
                          <span className="text-xs text-gray-500">Roles: {user.roles.join(', ')}</span>
                          <span className="text-xs text-gray-500">Permissions: {user.permissions}</span>
                          {user.mfaEnabled && (
                            <Badge variant="outline" className="text-xs">
                              <Smartphone className="w-3 h-3 mr-1" />
                              MFA
                            </Badge>
                          )}
                          {user.ssoEnabled && (
                            <Badge variant="outline" className="text-xs">
                              <Key className="w-3 h-3 mr-1" />
                              SSO
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Role Management</CardTitle>
              <CardDescription>Role-based access control and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {iamData.roles.map(role => (
                  <div key={role.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold">{role.name}</h3>
                          <Badge className={getStatusColor(role.type)}>
                            {role.type}
                          </Badge>
                          <Badge className={getStatusColor(role.risk)}>
                            {role.risk} risk
                          </Badge>
                          {!role.isActive && (
                            <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">{role.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Users:</span>
                            <p className="font-medium">{role.userCount.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Permissions:</span>
                            <p className="font-medium">{role.permissions}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Created:</span>
                            <p className="font-medium">{new Date(role.createdDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Modified:</span>
                            <p className="font-medium">{new Date(role.lastModified).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-3">
                          {role.requiresApproval && (
                            <Badge variant="outline" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approval Required
                            </Badge>
                          )}
                          {role.maxDuration && (
                            <Badge variant="outline" className="text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              Max {role.maxDuration} days
                            </Badge>
                          )}
                          {role.inheritedFrom && (
                            <Badge variant="outline" className="text-xs">
                              Inherited from {role.inheritedFrom}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privileged Tab */}
        <TabsContent value="privileged" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privileged Account Management</CardTitle>
              <CardDescription>High-privilege account monitoring and control</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {iamData.privilegedAccounts.slice(0, 15).map(account => (
                  <div key={account.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold">{account.accountName}</h3>
                          <Badge className={getStatusColor(account.status)}>
                            {account.status}
                          </Badge>
                          <Badge className={getStatusColor(account.type)}>
                            {account.type}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">System:</span>
                            <p className="font-medium">{account.system}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Owner:</span>
                            <p className="font-medium">{account.owner}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Risk Score:</span>
                            <p className={`font-medium ${getRiskColor(account.riskScore >= 80 ? 'critical' : account.riskScore >= 60 ? 'high' : 'medium')}`}>
                              {account.riskScore}/100
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Last Used:</span>
                            <p className="font-medium">{new Date(account.lastUsed).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {account.isVaulted && (
                            <Badge variant="outline" className="text-xs">
                              <Lock className="w-3 h-3 mr-1" />
                              Vaulted
                            </Badge>
                          )}
                          {account.autoRotation && (
                            <Badge variant="outline" className="text-xs">
                              <RefreshCw className="w-3 h-3 mr-1" />
                              Auto-Rotation
                            </Badge>
                          )}
                          {account.sessionRecording && (
                            <Badge variant="outline" className="text-xs">
                              <Eye className="w-3 h-3 mr-1" />
                              Session Recording
                            </Badge>
                          )}
                          {account.mfaRequired && (
                            <Badge variant="outline" className="text-xs">
                              <Smartphone className="w-3 h-3 mr-1" />
                              MFA Required
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Shield className="w-4 h-4 mr-2" />
                        Manage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Access Reviews Tab */}
        <TabsContent value="reviews" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Access Reviews</CardTitle>
              <CardDescription>Periodic access certification and compliance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {iamData.accessReviews.map(review => (
                  <div key={review.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold">{review.name}</h3>
                          <Badge className={getStatusColor(review.status)}>
                            {review.status}
                          </Badge>
                          <Badge className={getStatusColor(review.priority)}>
                            {review.priority} priority
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-600">Reviewer:</span>
                            <p className="font-medium">{review.reviewer}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Users:</span>
                            <p className="font-medium">{review.userCount}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Progress:</span>
                            <p className="font-medium">{Math.round((review.reviewedCount / review.userCount) * 100)}%</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Due Date:</span>
                            <p className="font-medium">{new Date(review.dueDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Progress value={(review.reviewedCount / review.userCount) * 100} className="mb-3" />
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Approved:</span>
                            <p className="font-medium text-green-600">{review.approvedCount}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Revoked:</span>
                            <p className="font-medium text-red-600">{review.revokedCount}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Pending:</span>
                            <p className="font-medium text-yellow-600">{review.pendingCount}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Risk Findings:</span>
                            <p className="font-medium text-orange-600">{review.riskFindings}</p>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SSO Tab */}
        <TabsContent value="sso" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Single Sign-On Management</CardTitle>
              <CardDescription>Identity provider connections and configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {iamData.ssoConnections.map(connection => (
                  <div key={connection.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold">{connection.name}</h3>
                          <Badge className={getStatusColor(connection.status)}>
                            {connection.status}
                          </Badge>
                          <Badge variant="outline">{connection.protocol}</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Users:</span>
                            <p className="font-medium">{connection.userCount.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Applications:</span>
                            <p className="font-medium">{connection.applications}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Success Rate:</span>
                            <p className="font-medium text-green-600">{Math.round(connection.successRate * 100)}%</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Response Time:</span>
                            <p className="font-medium">{connection.averageResponseTime}ms</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-3">
                          <span className="text-xs text-gray-500">
                            Last Sync: {new Date(connection.lastSync).toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-500">
                            Sync: {connection.syncFrequency}
                          </span>
                          {connection.errorCount > 0 && (
                            <Badge variant="outline" className="text-xs text-red-600">
                              {connection.errorCount} Errors
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {connection.jitProvisioning && (
                            <Badge variant="outline" className="text-xs">JIT Provisioning</Badge>
                          )}
                          {connection.groupMapping && (
                            <Badge variant="outline" className="text-xs">Group Mapping</Badge>
                          )}
                          {connection.encryption && (
                            <Badge variant="outline" className="text-xs">Encrypted</Badge>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Access Event Audit Trail</CardTitle>
              <CardDescription>Comprehensive access and authentication logging</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {iamData.accessEvents.slice(0, 50).map(event => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Activity className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-sm">{event.type.replace('_', ' ')}</span>
                        <Badge className={getStatusColor(event.result)}>
                          {event.result}
                        </Badge>
                        <Badge className={`${getRiskColor(event.riskScore >= 80 ? 'critical' : event.riskScore >= 60 ? 'high' : 'medium')} bg-transparent border-0 p-0`}>
                          Risk: {event.riskScore}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">
                        User: {event.username} | IP: {event.sourceIp} | Location: {event.location}
                      </p>
                      <p className="text-xs text-gray-600">
                        App: {event.application} | Device: {event.deviceId} | Duration: {Math.round(event.duration / 60)}m
                      </p>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-xs text-gray-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                        {event.mfaUsed && (
                          <Badge variant="outline" className="text-xs">MFA</Badge>
                        )}
                        {event.anomalyScore > 0.8 && (
                          <Badge variant="outline" className="text-xs text-red-600">Anomaly</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Dashboard</CardTitle>
              <CardDescription>Identity governance and regulatory compliance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">94%</div>
                  <div className="text-sm text-gray-600">SOX Compliance</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">87%</div>
                  <div className="text-sm text-gray-600">GDPR Compliance</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">91%</div>
                  <div className="text-sm text-gray-600">HIPAA Compliance</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">96%</div>
                  <div className="text-sm text-gray-600">PCI DSS Compliance</div>
                </div>
              </div>

              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>5 users</strong> have privileged access without recent access review.
                    <Button variant="link" className="p-0 h-auto font-normal">
                      Review now →
                    </Button>
                  </AlertDescription>
                </Alert>

                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    <strong>12 access reviews</strong> are overdue for completion.
                    <Button variant="link" className="p-0 h-auto font-normal">
                      View overdue →
                    </Button>
                  </AlertDescription>
                </Alert>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>8 users</strong> have not enabled MFA for privileged accounts.
                    <Button variant="link" className="p-0 h-auto font-normal">
                      Enforce MFA →
                    </Button>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IdentityManagement;
