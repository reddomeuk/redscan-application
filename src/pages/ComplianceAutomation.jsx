/**
 * Compliance Automation Framework
 * Comprehensive compliance management with framework templates and automated evidence collection
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  Shield, CheckCircle, AlertTriangle, FileText, Settings, 
  Calendar, Clock, Users, Database, Lock, Eye,
  Download, Upload, RefreshCw, Target, TrendingUp,
  BookOpen, Award, AlertCircle, CheckSquare
} from 'lucide-react';

const ComplianceAutomation = () => {
  const [complianceData, setComplianceData] = useState({
    frameworks: [],
    assessments: [],
    evidence: [],
    gaps: [],
    controls: [],
    audits: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedFramework, setSelectedFramework] = useState('soc2');
  const [assessmentStatus, setAssessmentStatus] = useState('idle');

  useEffect(() => {
    loadComplianceData();
  }, [selectedFramework]);

  const loadComplianceData = async () => {
    setLoading(true);
    try {
      // Simulate loading compliance framework data
      const mockData = generateMockComplianceData();
      setComplianceData(mockData);
    } catch (error) {
      console.error('Failed to load compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockComplianceData = () => {
    return {
      frameworks: [
        {
          id: 'soc2',
          name: 'SOC 2 Type II',
          description: 'System and Organization Controls 2',
          status: 'active',
          lastAssessment: '2024-01-15T00:00:00Z',
          nextAssessment: '2024-07-15T00:00:00Z',
          overallScore: 87,
          controlsTotal: 64,
          controlsCompliant: 56,
          controlsPartial: 6,
          controlsNonCompliant: 2,
          categories: [
            { name: 'Security', score: 92, controls: 23, compliant: 21 },
            { name: 'Availability', score: 88, controls: 15, compliant: 13 },
            { name: 'Processing Integrity', score: 85, controls: 12, compliant: 10 },
            { name: 'Confidentiality', score: 83, controls: 8, compliant: 7 },
            { name: 'Privacy', score: 90, controls: 6, compliant: 5 }
          ]
        },
        {
          id: 'iso27001',
          name: 'ISO 27001:2022',
          description: 'Information Security Management Systems',
          status: 'in_progress',
          lastAssessment: '2023-12-01T00:00:00Z',
          nextAssessment: '2024-06-01T00:00:00Z',
          overallScore: 73,
          controlsTotal: 93,
          controlsCompliant: 68,
          controlsPartial: 18,
          controlsNonCompliant: 7,
          categories: [
            { name: 'Information Security Policies', score: 95, controls: 2, compliant: 2 },
            { name: 'Organization of Information Security', score: 78, controls: 7, compliant: 5 },
            { name: 'Human Resource Security', score: 82, controls: 6, compliant: 5 },
            { name: 'Asset Management', score: 75, controls: 10, compliant: 7 },
            { name: 'Access Control', score: 69, controls: 14, compliant: 9 }
          ]
        },
        {
          id: 'gdpr',
          name: 'GDPR',
          description: 'General Data Protection Regulation',
          status: 'active',
          lastAssessment: '2024-01-10T00:00:00Z',
          nextAssessment: '2024-04-10T00:00:00Z',
          overallScore: 91,
          controlsTotal: 47,
          controlsCompliant: 43,
          controlsPartial: 3,
          controlsNonCompliant: 1,
          categories: [
            { name: 'Lawfulness of Processing', score: 95, controls: 8, compliant: 8 },
            { name: 'Data Subject Rights', score: 88, controls: 12, compliant: 10 },
            { name: 'Data Protection by Design', score: 92, controls: 9, compliant: 8 },
            { name: 'Security of Processing', score: 89, controls: 10, compliant: 9 },
            { name: 'Data Breach Notification', score: 94, controls: 8, compliant: 8 }
          ]
        },
        {
          id: 'hipaa',
          name: 'HIPAA',
          description: 'Health Insurance Portability and Accountability Act',
          status: 'pending',
          lastAssessment: null,
          nextAssessment: '2024-03-01T00:00:00Z',
          overallScore: 0,
          controlsTotal: 54,
          controlsCompliant: 0,
          controlsPartial: 0,
          controlsNonCompliant: 0,
          categories: [
            { name: 'Administrative Safeguards', score: 0, controls: 18, compliant: 0 },
            { name: 'Physical Safeguards', score: 0, controls: 12, compliant: 0 },
            { name: 'Technical Safeguards', score: 0, controls: 15, compliant: 0 },
            { name: 'Breach Notification', score: 0, controls: 9, compliant: 0 }
          ]
        }
      ],
      
      assessments: [
        {
          id: 'assess_001',
          framework: 'soc2',
          type: 'annual',
          status: 'completed',
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-15T00:00:00Z',
          auditor: 'External Audit Firm ABC',
          score: 87,
          findings: 8,
          recommendations: 12
        },
        {
          id: 'assess_002',
          framework: 'iso27001',
          type: 'gap_analysis',
          status: 'in_progress',
          startDate: '2024-01-20T00:00:00Z',
          endDate: null,
          auditor: 'Internal Team',
          score: null,
          findings: 15,
          recommendations: 23
        },
        {
          id: 'assess_003',
          framework: 'gdpr',
          type: 'quarterly',
          status: 'scheduled',
          startDate: '2024-02-01T00:00:00Z',
          endDate: null,
          auditor: 'Privacy Consultant XYZ',
          score: null,
          findings: 0,
          recommendations: 0
        }
      ],
      
      evidence: [
        {
          id: 'ev_001',
          framework: 'soc2',
          control: 'CC6.1',
          type: 'policy_document',
          name: 'Information Security Policy',
          status: 'current',
          lastUpdated: '2024-01-10T00:00:00Z',
          nextReview: '2024-07-10T00:00:00Z',
          automated: false
        },
        {
          id: 'ev_002',
          framework: 'soc2',
          control: 'CC6.2',
          type: 'system_configuration',
          name: 'Firewall Configuration Backup',
          status: 'current',
          lastUpdated: '2024-01-25T00:00:00Z',
          nextReview: '2024-02-25T00:00:00Z',
          automated: true
        },
        {
          id: 'ev_003',
          framework: 'gdpr',
          control: 'Art.30',
          type: 'data_inventory',
          name: 'Records of Processing Activities',
          status: 'needs_update',
          lastUpdated: '2023-12-15T00:00:00Z',
          nextReview: '2024-01-15T00:00:00Z',
          automated: false
        }
      ],
      
      gaps: [
        {
          id: 'gap_001',
          framework: 'iso27001',
          control: 'A.8.2.1',
          title: 'Classification of Information',
          description: 'Data classification policy not fully implemented',
          severity: 'medium',
          impact: 'Inconsistent handling of sensitive data',
          recommendation: 'Implement comprehensive data classification scheme',
          dueDate: '2024-03-15T00:00:00Z',
          assignee: 'Security Team',
          status: 'open'
        },
        {
          id: 'gap_002',
          framework: 'soc2',
          control: 'CC7.1',
          title: 'System Monitoring',
          description: 'Monitoring coverage gaps in network infrastructure',
          severity: 'high',
          impact: 'Reduced visibility into security events',
          recommendation: 'Deploy additional monitoring tools',
          dueDate: '2024-02-28T00:00:00Z',
          assignee: 'IT Operations',
          status: 'in_progress'
        },
        {
          id: 'gap_003',
          framework: 'gdpr',
          control: 'Art.32',
          title: 'Encryption at Rest',
          description: 'Some databases lack encryption at rest',
          severity: 'high',
          impact: 'Data confidentiality risk',
          recommendation: 'Enable database encryption for all production systems',
          dueDate: '2024-02-15T00:00:00Z',
          assignee: 'Database Team',
          status: 'overdue'
        }
      ],
      
      controls: generateControlsData(),
      
      audits: [
        {
          id: 'audit_001',
          type: 'external',
          framework: 'soc2',
          auditor: 'Big Four Accounting Firm',
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-15T00:00:00Z',
          status: 'completed',
          opinion: 'unqualified',
          findings: 3,
          reportDate: '2024-01-30T00:00:00Z'
        },
        {
          id: 'audit_002',
          type: 'internal',
          framework: 'iso27001',
          auditor: 'Internal Audit Team',
          startDate: '2024-01-20T00:00:00Z',
          endDate: null,
          status: 'in_progress',
          opinion: null,
          findings: 8,
          reportDate: null
        }
      ]
    };
  };

  const generateControlsData = () => {
    const controls = [];
    const frameworks = ['soc2', 'iso27001', 'gdpr'];
    const statuses = ['compliant', 'partial', 'non_compliant'];
    const severities = ['low', 'medium', 'high', 'critical'];
    
    for (let i = 1; i <= 50; i++) {
      controls.push({
        id: `ctrl_${i.toString().padStart(3, '0')}`,
        framework: frameworks[Math.floor(Math.random() * frameworks.length)],
        controlId: `CTRL-${i}`,
        title: `Control ${i}`,
        description: `Description for control ${i}`,
        category: ['Technical', 'Administrative', 'Physical'][Math.floor(Math.random() * 3)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        lastTested: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        nextTest: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        automated: Math.random() > 0.6,
        owner: ['Security Team', 'IT Operations', 'Compliance', 'HR'][Math.floor(Math.random() * 4)]
      });
    }
    
    return controls;
  };

  const getStatusColor = (status) => {
    const colors = {
      compliant: 'bg-green-100 text-green-800 border-green-200',
      partial: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      non_compliant: 'bg-red-100 text-red-800 border-red-200',
      current: 'bg-blue-100 text-blue-800 border-blue-200',
      needs_update: 'bg-orange-100 text-orange-800 border-orange-200',
      open: 'bg-red-100 text-red-800 border-red-200',
      in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      overdue: 'bg-red-100 text-red-800 border-red-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      active: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || colors.pending;
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'text-red-600',
      high: 'text-orange-600',
      medium: 'text-yellow-600',
      low: 'text-green-600'
    };
    return colors[severity] || colors.medium;
  };

  const startAssessment = async (frameworkId) => {
    setAssessmentStatus('running');
    
    // Simulate assessment process
    try {
      console.log(`Starting assessment for framework: ${frameworkId}`);
      
      // Simulate automated evidence collection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate control testing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate assessment report
      const results = await generateAssessmentReport(frameworkId);
      
      setAssessmentStatus('completed');
      console.log('Assessment completed:', results);
      
      // Refresh data
      loadComplianceData();
      
    } catch (error) {
      console.error('Assessment failed:', error);
      setAssessmentStatus('failed');
    }
  };

  const generateAssessmentReport = async (frameworkId) => {
    // Simulate report generation
    return {
      framework: frameworkId,
      timestamp: new Date().toISOString(),
      overallScore: Math.floor(Math.random() * 30) + 70,
      findings: Math.floor(Math.random() * 10) + 5,
      recommendations: Math.floor(Math.random() * 15) + 10
    };
  };

  const FrameworkOverviewChart = ({ framework }) => {
    const data = framework.categories.map(cat => ({
      name: cat.name,
      score: cat.score,
      compliant: cat.compliant,
      total: cat.controls
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="score" fill="#3b82f6" name="Compliance Score %" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const ComplianceTrendChart = () => {
    const trendData = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(Date.now() - (11 - i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en', { month: 'short' }),
      soc2: Math.floor(Math.random() * 10) + 80,
      iso27001: Math.floor(Math.random() * 15) + 65,
      gdpr: Math.floor(Math.random() * 8) + 85
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="soc2" stroke="#3b82f6" strokeWidth={2} name="SOC 2" />
          <Line type="monotone" dataKey="iso27001" stroke="#ef4444" strokeWidth={2} name="ISO 27001" />
          <Line type="monotone" dataKey="gdpr" stroke="#10b981" strokeWidth={2} name="GDPR" />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const GapAnalysisChart = () => {
    const severityData = [
      { name: 'Critical', value: complianceData.gaps.filter(g => g.severity === 'critical').length, color: '#ef4444' },
      { name: 'High', value: complianceData.gaps.filter(g => g.severity === 'high').length, color: '#f97316' },
      { name: 'Medium', value: complianceData.gaps.filter(g => g.severity === 'medium').length, color: '#eab308' },
      { name: 'Low', value: complianceData.gaps.filter(g => g.severity === 'low').length, color: '#22c55e' }
    ];

    return (
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={severityData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="value"
            label={({ name, value }) => `${name}: ${value}`}
          >
            {severityData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
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
          <Shield className="w-6 h-6 animate-pulse" />
          <span>Loading Compliance Framework...</span>
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

  const selectedFrameworkData = complianceData.frameworks.find(f => f.id === selectedFramework);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <span>Compliance Automation</span>
          </h1>
          <p className="text-gray-600 mt-1">
            Automated compliance management and continuous monitoring
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={() => startAssessment(selectedFramework)}
            disabled={assessmentStatus === 'running'}
          >
            {assessmentStatus === 'running' ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Target className="w-4 h-4 mr-2" />
            )}
            Run Assessment
          </Button>
        </div>
      </div>

      {/* Framework Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {complianceData.frameworks.map(framework => (
          <Card 
            key={framework.id}
            className={`cursor-pointer transition-all ${
              selectedFramework === framework.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedFramework(framework.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{framework.name}</h3>
                <Badge className={getStatusColor(framework.status)}>
                  {framework.status}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Overall Score</span>
                  <span className="font-bold text-lg">{framework.overallScore}%</span>
                </div>
                <Progress value={framework.overallScore} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{framework.controlsCompliant}/{framework.controlsTotal} Controls</span>
                  <span>
                    {framework.lastAssessment ? 
                      new Date(framework.lastAssessment).toLocaleDateString() : 
                      'No assessment'
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Assessment Status Alert */}
      {assessmentStatus !== 'idle' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {assessmentStatus === 'running' && 'Assessment in progress... Collecting evidence and testing controls.'}
            {assessmentStatus === 'completed' && 'Assessment completed successfully. Results have been updated.'}
            {assessmentStatus === 'failed' && 'Assessment failed. Please check the logs and try again.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="controls">Controls</TabsTrigger>
          <TabsTrigger value="gaps">Gap Analysis</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="audits">Audits</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Framework Compliance Breakdown</CardTitle>
                <CardDescription>
                  Compliance scores by category for {selectedFrameworkData?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedFrameworkData && <FrameworkOverviewChart framework={selectedFrameworkData} />}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Trends</CardTitle>
                <CardDescription>Historical compliance scores over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ComplianceTrendChart />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Assessments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {complianceData.assessments
                    .filter(a => a.status === 'in_progress' || a.status === 'scheduled')
                    .map(assessment => (
                    <div key={assessment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{assessment.framework.toUpperCase()}</p>
                        <p className="text-sm text-gray-600">{assessment.type}</p>
                      </div>
                      <Badge className={getStatusColor(assessment.status)}>
                        {assessment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Evidence Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {complianceData.evidence.slice(0, 5).map(evidence => (
                    <div key={evidence.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{evidence.name}</p>
                        <p className="text-xs text-gray-600">{evidence.control}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(evidence.status)}>
                          {evidence.status}
                        </Badge>
                        {evidence.automated && (
                          <p className="text-xs text-blue-600 mt-1">Automated</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gap Analysis Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <GapAnalysisChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Controls Tab */}
        <TabsContent value="controls" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Control Status Overview</CardTitle>
              <CardDescription>Status of all compliance controls</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceData.controls.slice(0, 10).map(control => (
                  <div key={control.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          control.status === 'compliant' ? 'bg-green-600' :
                          control.status === 'partial' ? 'bg-yellow-600' : 'bg-red-600'
                        }`} />
                        <div>
                          <p className="font-medium">{control.controlId}: {control.title}</p>
                          <p className="text-sm text-gray-600">{control.description}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500">Framework: {control.framework.toUpperCase()}</span>
                            <span className="text-xs text-gray-500">Category: {control.category}</span>
                            <span className="text-xs text-gray-500">Owner: {control.owner}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(control.status)}>
                        {control.status}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        Last tested: {new Date(control.lastTested).toLocaleDateString()}
                      </p>
                      {control.automated && (
                        <p className="text-xs text-blue-600">Automated Testing</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gap Analysis Tab */}
        <TabsContent value="gaps" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Gaps</CardTitle>
              <CardDescription>Identified gaps and remediation actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceData.gaps.map(gap => (
                  <div key={gap.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertTriangle className={`w-5 h-5 ${getSeverityColor(gap.severity)}`} />
                          <h3 className="font-semibold">{gap.title}</h3>
                          <Badge className={getStatusColor(gap.severity)}>
                            {gap.severity}
                          </Badge>
                          <Badge className={getStatusColor(gap.status)}>
                            {gap.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">{gap.description}</p>
                        <p className="text-sm text-gray-700 mb-3">
                          <strong>Impact:</strong> {gap.impact}
                        </p>
                        <p className="text-sm text-blue-700">
                          <strong>Recommendation:</strong> {gap.recommendation}
                        </p>
                        <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                          <span>Framework: {gap.framework.toUpperCase()}</span>
                          <span>Control: {gap.control}</span>
                          <span>Assignee: {gap.assignee}</span>
                          <span>Due: {new Date(gap.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evidence Tab */}
        <TabsContent value="evidence" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Evidence Repository</CardTitle>
              <CardDescription>Compliance evidence and documentation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceData.evidence.map(evidence => (
                  <div key={evidence.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium">{evidence.name}</p>
                        <p className="text-sm text-gray-600">
                          {evidence.framework.toUpperCase()} - Control {evidence.control}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500">Type: {evidence.type}</span>
                          <span className="text-xs text-gray-500">
                            Updated: {new Date(evidence.lastUpdated).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-gray-500">
                            Next Review: {new Date(evidence.nextReview).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(evidence.status)}>
                        {evidence.status}
                      </Badge>
                      {evidence.automated && (
                        <p className="text-xs text-blue-600 mt-1">Auto-collected</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assessments Tab */}
        <TabsContent value="assessments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assessment History</CardTitle>
              <CardDescription>Past and scheduled compliance assessments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceData.assessments.map(assessment => (
                  <div key={assessment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold">{assessment.framework.toUpperCase()} Assessment</h3>
                        <Badge className={getStatusColor(assessment.status)}>
                          {assessment.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">Type: {assessment.type}</p>
                      <p className="text-sm text-gray-600 mb-1">Auditor: {assessment.auditor}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Start: {new Date(assessment.startDate).toLocaleDateString()}</span>
                        {assessment.endDate && (
                          <span>End: {new Date(assessment.endDate).toLocaleDateString()}</span>
                        )}
                        {assessment.findings > 0 && (
                          <span>Findings: {assessment.findings}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {assessment.score && (
                        <p className="text-lg font-bold">{assessment.score}%</p>
                      )}
                      <Button variant="outline" size="sm" className="mt-2">
                        <Eye className="w-4 h-4 mr-2" />
                        View Report
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audits Tab */}
        <TabsContent value="audits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audit Management</CardTitle>
              <CardDescription>External and internal audit tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceData.audits.map(audit => (
                  <div key={audit.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Award className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold">{audit.framework.toUpperCase()} Audit</h3>
                        <Badge className={getStatusColor(audit.status)}>
                          {audit.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">Type: {audit.type}</p>
                      <p className="text-sm text-gray-600 mb-1">Auditor: {audit.auditor}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Start: {new Date(audit.startDate).toLocaleDateString()}</span>
                        {audit.endDate && (
                          <span>End: {new Date(audit.endDate).toLocaleDateString()}</span>
                        )}
                        <span>Findings: {audit.findings}</span>
                        {audit.opinion && (
                          <span>Opinion: {audit.opinion}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4 mr-2" />
                        View Report
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComplianceAutomation;
