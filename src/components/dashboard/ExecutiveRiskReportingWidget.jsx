/**
 * Executive Risk Reporting Widget
 * C-level executive dashboard for comprehensive risk oversight,
 * strategic risk insights, and business impact analysis
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadialBarChart, RadialBar, ComposedChart
} from 'recharts';
import { 
  Crown, TrendingUp, TrendingDown, AlertTriangle, Shield, Target,
  DollarSign, Building2, Users, Clock, FileText, Award,
  BarChart3, PieChart as PieChartIcon, TrendingUpIcon
} from 'lucide-react';
import { advancedRiskAnalyticsEngine } from '../../services/AdvancedRiskAnalyticsEngine';

const ExecutiveRiskReportingWidget = ({ className = "" }) => {
  const [executiveMetrics, setExecutiveMetrics] = useState(null);
  const [kpiData, setKpiData] = useState([]);
  const [riskTrends, setRiskTrends] = useState([]);
  const [portfolioAnalysis, setPortfolioAnalysis] = useState(null);
  const [complianceStatus, setComplianceStatus] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('quarterly');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchExecutiveData();
    const interval = setInterval(fetchExecutiveData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [selectedPeriod]);

  const fetchExecutiveData = async () => {
    try {
      setRefreshing(true);
      
      // Get risk overview data
      const riskOverview = await advancedRiskAnalyticsEngine.getRiskOverview();
      setExecutiveMetrics(riskOverview.executiveMetrics);
      
      // Generate executive KPIs
      const kpis = generateExecutiveKPIs(riskOverview);
      setKpiData(kpis);
      
      // Generate risk trends
      const trends = generateRiskTrends();
      setRiskTrends(trends);
      
      // Generate portfolio analysis
      const portfolio = generatePortfolioAnalysis(riskOverview);
      setPortfolioAnalysis(portfolio);
      
      // Generate compliance status
      const compliance = generateComplianceStatus();
      setComplianceStatus(compliance);
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch executive data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const generateExecutiveKPIs = (riskData) => {
    return [
      {
        id: 'overall_risk_posture',
        name: 'Overall Risk Posture',
        value: riskData.overallScore,
        target: 0.6,
        trend: 'improving',
        category: 'risk',
        unit: 'percentage',
        description: 'Aggregate organizational risk level'
      },
      {
        id: 'risk_adjusted_returns',
        name: 'Risk-Adjusted Returns',
        value: 0.142, // 14.2%
        target: 0.15,
        trend: 'stable',
        category: 'financial',
        unit: 'percentage',
        description: 'Return on investment adjusted for risk'
      },
      {
        id: 'cyber_resilience_score',
        name: 'Cyber Resilience Score',
        value: 0.78,
        target: 0.85,
        trend: 'improving',
        category: 'security',
        unit: 'percentage',
        description: 'Organizational cybersecurity maturity'
      },
      {
        id: 'regulatory_compliance',
        name: 'Regulatory Compliance',
        value: 0.91,
        target: 0.95,
        trend: 'improving',
        category: 'compliance',
        unit: 'percentage',
        description: 'Overall regulatory compliance status'
      },
      {
        id: 'business_continuity',
        name: 'Business Continuity',
        value: 0.85,
        target: 0.90,
        trend: 'stable',
        category: 'operational',
        unit: 'percentage',
        description: 'Business process resilience and continuity'
      },
      {
        id: 'third_party_risk',
        name: 'Third Party Risk',
        value: 0.42,
        target: 0.35,
        trend: 'deteriorating',
        category: 'vendor',
        unit: 'percentage',
        description: 'Risk exposure from vendors and suppliers'
      }
    ];
  };

  const generateRiskTrends = () => {
    const trends = [];
    const currentDate = new Date();
    
    // Generate 12 months of trend data
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const baseRisk = 0.45;
      const monthlyVariation = (Math.random() - 0.5) * 0.1;
      const seasonalEffect = Math.sin((date.getMonth() / 12) * 2 * Math.PI) * 0.05;
      
      trends.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        overallRisk: Math.max(0.2, Math.min(0.8, baseRisk + monthlyVariation + seasonalEffect)),
        cyberRisk: Math.max(0.3, Math.min(0.9, 0.55 + monthlyVariation * 1.2)),
        operationalRisk: Math.max(0.2, Math.min(0.7, 0.38 + monthlyVariation * 0.8)),
        financialRisk: Math.max(0.1, Math.min(0.6, 0.28 + monthlyVariation * 0.6)),
        complianceRisk: Math.max(0.1, Math.min(0.5, 0.22 + monthlyVariation * 0.4)),
        budget: 2500000 + (Math.random() - 0.5) * 500000 // Risk management budget
      });
    }
    
    return trends;
  };

  const generatePortfolioAnalysis = (riskData) => {
    return {
      totalAssetValue: 850000000, // $850M
      riskExposure: 42500000, // $42.5M
      riskCapacity: 85000000, // $85M (10% of total assets)
      riskAppetite: 51000000, // $51M (6% of total assets)
      diversificationBenefit: 0.15, // 15% risk reduction from diversification
      concentrationRisk: 0.23, // 23% concentration in single risk factors
      riskAdjustedCapital: 127500000, // $127.5M
      economicCapital: 102000000, // $102M
      sectors: [
        { name: 'Technology', exposure: 35, risk: 0.45 },
        { name: 'Financial Services', exposure: 25, risk: 0.38 },
        { name: 'Healthcare', exposure: 20, risk: 0.52 },
        { name: 'Manufacturing', exposure: 12, risk: 0.33 },
        { name: 'Retail', exposure: 8, risk: 0.41 }
      ],
      geographicDistribution: [
        { region: 'North America', exposure: 55, risk: 0.35 },
        { region: 'Europe', exposure: 30, risk: 0.42 },
        { region: 'Asia Pacific', exposure: 12, risk: 0.58 },
        { region: 'Other', exposure: 3, risk: 0.48 }
      ]
    };
  };

  const generateComplianceStatus = () => {
    return [
      {
        framework: 'SOC 2 Type II',
        status: 'compliant',
        score: 0.94,
        lastAudit: '2024-01-15',
        nextAudit: '2024-07-15',
        findings: 2,
        criticalFindings: 0
      },
      {
        framework: 'ISO 27001',
        status: 'compliant',
        score: 0.91,
        lastAudit: '2024-01-10',
        nextAudit: '2025-01-10',
        findings: 4,
        criticalFindings: 0
      },
      {
        framework: 'NIST CSF',
        status: 'compliant',
        score: 0.88,
        lastAudit: '2023-12-20',
        nextAudit: '2024-06-20',
        findings: 6,
        criticalFindings: 1
      },
      {
        framework: 'GDPR',
        status: 'compliant',
        score: 0.96,
        lastAudit: '2024-01-05',
        nextAudit: '2024-04-05',
        findings: 1,
        criticalFindings: 0
      },
      {
        framework: 'PCI-DSS',
        status: 'remediation',
        score: 0.82,
        lastAudit: '2024-01-12',
        nextAudit: '2024-04-12',
        findings: 8,
        criticalFindings: 2
      },
      {
        framework: 'HIPAA',
        status: 'compliant',
        score: 0.89,
        lastAudit: '2023-12-28',
        nextAudit: '2024-06-28',
        findings: 5,
        criticalFindings: 0
      }
    ];
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatMillions = (value) => {
    return `$${(value / 1000000).toFixed(1)}M`;
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      case 'deteriorating':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      default:
        return <TrendingUpIcon className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'compliant':
        return <Badge variant="success">Compliant</Badge>;
      case 'remediation':
        return <Badge variant="warning">Remediation</Badge>;
      case 'non-compliant':
        return <Badge variant="destructive">Non-Compliant</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  if (!executiveMetrics) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="w-5 h-5" />
            <span>Executive Risk Reporting</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Crown className="w-5 h-5" />
            <span>Executive Risk Dashboard</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchExecutiveData}
              disabled={refreshing}
            >
              {refreshing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              ) : (
                'Refresh'
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="kpis">Key Metrics</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          {/* Executive Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Risk Alerts */}
            {executiveMetrics?.riskExceeded && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Risk Tolerance Exceeded:</strong> Current risk level requires immediate executive attention.
                </AlertDescription>
              </Alert>
            )}

            {/* Executive Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Risk Score</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {formatPercentage(executiveMetrics?.overallRiskScore || 0)}
                      </p>
                      <p className="text-xs text-gray-600">vs. {formatPercentage(executiveMetrics?.riskTolerance || 0.7)} tolerance</p>
                    </div>
                    <Shield className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Business Impact</p>
                      <p className="text-2xl font-bold text-green-700">
                        {formatMillions(executiveMetrics?.businessImpact?.potentialLoss || 0)}
                      </p>
                      <p className="text-xs text-gray-600">potential exposure</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Asset Value</p>
                      <p className="text-2xl font-bold text-purple-700">
                        {portfolioAnalysis ? formatMillions(portfolioAnalysis.totalAssetValue) : '$850M'}
                      </p>
                      <p className="text-xs text-gray-600">under management</p>
                    </div>
                    <Building2 className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Risk Trend</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-orange-700 capitalize">
                          {executiveMetrics?.riskTrend || 'Stable'}
                        </span>
                        {getTrendIcon(executiveMetrics?.riskTrend)}
                      </div>
                    </div>
                    <TrendingUpIcon className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Risks Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Top Strategic Risk Areas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {executiveMetrics?.topRisks?.slice(0, 3).map((risk, index) => (
                    <div key={risk.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <Badge variant={risk.score >= 0.7 ? 'destructive' : 'warning'}>
                          {formatPercentage(risk.score)}
                        </Badge>
                      </div>
                      <h4 className="font-medium mb-2">{risk.name}</h4>
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(risk.trend)}
                        <span className="text-sm text-gray-600 capitalize">{risk.trend}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Risk Capacity Utilization */}
            {portfolioAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle>Risk Capacity Utilization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Risk Exposure</span>
                      <span className="text-lg font-bold">{formatCurrency(portfolioAnalysis.riskExposure)}</span>
                    </div>
                    <Progress 
                      value={(portfolioAnalysis.riskExposure / portfolioAnalysis.riskCapacity) * 100} 
                      className="h-3"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Risk Appetite: {formatCurrency(portfolioAnalysis.riskAppetite)}</span>
                      <span>Risk Capacity: {formatCurrency(portfolioAnalysis.riskCapacity)}</span>
                    </div>
                    
                    {portfolioAnalysis.riskExposure > portfolioAnalysis.riskAppetite && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Risk exposure exceeds appetite by {formatCurrency(portfolioAnalysis.riskExposure - portfolioAnalysis.riskAppetite)}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Key Performance Indicators Tab */}
          <TabsContent value="kpis" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {kpiData.map((kpi) => (
                <Card key={kpi.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{kpi.name}</CardTitle>
                      {getTrendIcon(kpi.trend)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-end space-x-2">
                        <span className="text-3xl font-bold text-blue-600">
                          {kpi.unit === 'percentage' ? formatPercentage(kpi.value) : kpi.value}
                        </span>
                        <span className="text-sm text-gray-600">
                          / {kpi.unit === 'percentage' ? formatPercentage(kpi.target) : kpi.target}
                        </span>
                      </div>
                      
                      <Progress 
                        value={kpi.unit === 'percentage' ? (kpi.value / kpi.target) * 100 : (kpi.value / kpi.target) * 100} 
                        className="h-2"
                      />
                      
                      <p className="text-sm text-gray-600">{kpi.description}</p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant="outline" className="capitalize">{kpi.category}</Badge>
                        <span className={`capitalize ${
                          kpi.trend === 'improving' ? 'text-green-600' : 
                          kpi.trend === 'deteriorating' ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {kpi.trend}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* KPI Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle>KPI Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={riskTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 1]} tickFormatter={formatPercentage} />
                    <Tooltip formatter={(value) => formatPercentage(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="overallRisk" stroke="#3b82f6" name="Overall Risk" strokeWidth={2} />
                    <Line type="monotone" dataKey="cyberRisk" stroke="#ef4444" name="Cyber Risk" strokeWidth={2} />
                    <Line type="monotone" dataKey="operationalRisk" stroke="#f59e0b" name="Operational Risk" strokeWidth={2} />
                    <Line type="monotone" dataKey="complianceRisk" stroke="#10b981" name="Compliance Risk" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Portfolio Analysis Tab */}
          <TabsContent value="portfolio" className="space-y-4">
            {portfolioAnalysis && (
              <>
                {/* Portfolio Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm font-medium text-gray-600">Total Assets</p>
                      <p className="text-2xl font-bold">{formatCurrency(portfolioAnalysis.totalAssetValue)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm font-medium text-gray-600">Risk-Adjusted Capital</p>
                      <p className="text-2xl font-bold">{formatCurrency(portfolioAnalysis.riskAdjustedCapital)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm font-medium text-gray-600">Economic Capital</p>
                      <p className="text-2xl font-bold">{formatCurrency(portfolioAnalysis.economicCapital)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm font-medium text-gray-600">Diversification Benefit</p>
                      <p className="text-2xl font-bold text-green-600">{formatPercentage(portfolioAnalysis.diversificationBenefit)}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Sector Risk Distribution */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Sector Risk Exposure</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={portfolioAnalysis.sectors}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, exposure }) => `${name}: ${exposure}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="exposure"
                          >
                            {portfolioAnalysis.sectors.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Geographic Risk Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={portfolioAnalysis.geographicDistribution}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="region" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="exposure" fill="#3b82f6" name="Exposure %" />
                          <Bar dataKey="risk" fill="#ef4444" name="Risk Level" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Sector Risk Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Sector Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {portfolioAnalysis.sectors.map((sector, index) => (
                        <div key={sector.name} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-4 h-4 rounded" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="font-medium">{sector.name}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Exposure</p>
                              <p className="font-medium">{sector.exposure}%</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Risk Level</p>
                              <Badge variant={sector.risk > 0.5 ? 'destructive' : 'warning'}>
                                {formatPercentage(sector.risk)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-4">
            {/* Compliance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm font-medium text-gray-600">Compliant Frameworks</p>
                  <p className="text-3xl font-bold text-green-600">
                    {complianceStatus.filter(c => c.status === 'compliant').length}
                  </p>
                  <p className="text-sm text-gray-600">of {complianceStatus.length} total</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {formatPercentage(complianceStatus.reduce((sum, c) => sum + c.score, 0) / complianceStatus.length)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm font-medium text-gray-600">Critical Findings</p>
                  <p className="text-3xl font-bold text-red-600">
                    {complianceStatus.reduce((sum, c) => sum + c.criticalFindings, 0)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Compliance Status Table */}
            <Card>
              <CardHeader>
                <CardTitle>Regulatory Compliance Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {complianceStatus.map((compliance) => (
                    <div key={compliance.framework} className="flex items-center justify-between p-4 border rounded">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="font-medium">{compliance.framework}</h4>
                          <p className="text-sm text-gray-600">
                            Last audit: {new Date(compliance.lastAudit).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Score</p>
                          <p className="font-bold">{formatPercentage(compliance.score)}</p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Findings</p>
                          <div className="space-x-1">
                            <span className="font-medium">{compliance.findings}</span>
                            {compliance.criticalFindings > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {compliance.criticalFindings} critical
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Status</p>
                          {getStatusBadge(compliance.status)}
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Next Audit</p>
                          <p className="text-sm font-medium">
                            {new Date(compliance.nextAudit).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Compliance Scores Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Framework Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={complianceStatus}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="framework" />
                    <YAxis domain={[0.7, 1]} tickFormatter={formatPercentage} />
                    <Tooltip formatter={(value) => formatPercentage(value)} />
                    <Bar dataKey="score" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-4">
            {/* Risk Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle>12-Month Risk Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={riskTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" domain={[0, 1]} tickFormatter={formatPercentage} />
                    <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => formatMillions(value)} />
                    <Tooltip />
                    <Legend />
                    
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="overallRisk"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      name="Overall Risk"
                    />
                    
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="budget"
                      stroke="#10b981"
                      strokeWidth={3}
                      name="Risk Management Budget"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Risk Budget Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Management Investment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Annual Budget</p>
                    <p className="text-2xl font-bold">{formatMillions(2500000)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">YTD Spent</p>
                    <p className="text-2xl font-bold text-orange-600">{formatMillions(520000)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">ROI on Risk Investment</p>
                    <p className="text-2xl font-bold text-green-600">340%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ExecutiveRiskReportingWidget;
