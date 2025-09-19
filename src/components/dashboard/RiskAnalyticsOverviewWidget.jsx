/**
 * Risk Analytics Overview Widget
 * Comprehensive risk analytics dashboard with sophisticated scoring,
 * predictive modeling, and executive reporting capabilities
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter
} from 'recharts';
import { 
  TrendingUp, TrendingDown, AlertTriangle, Shield, Target, 
  Brain, Activity, DollarSign, Users, Building2, Clock,
  BarChart3, PieChart, LineChart as LineChartIcon, Radar as RadarIcon
} from 'lucide-react';
import { advancedRiskAnalyticsEngine } from '../../services/AdvancedRiskAnalyticsEngine';

const RiskAnalyticsOverviewWidget = ({ className = "" }) => {
  const [riskOverview, setRiskOverview] = useState(null);
  const [riskFactors, setRiskFactors] = useState([]);
  const [predictiveAnalysis, setPredictiveAnalysis] = useState(null);
  const [businessAssets, setBusinessAssets] = useState([]);
  const [correlationAnalysis, setCorrelationAnalysis] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');

  useEffect(() => {
    initializeRiskAnalytics();
    const interval = setInterval(fetchRiskData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const initializeRiskAnalytics = async () => {
    try {
      if (!advancedRiskAnalyticsEngine.isRunning) {
        await advancedRiskAnalyticsEngine.initialize();
      }
      fetchRiskData();
    } catch (error) {
      console.error('Failed to initialize risk analytics:', error);
    }
  };

  const fetchRiskData = async () => {
    try {
      setRefreshing(true);
      
      const [overview, factors, predictions, assets, correlations] = await Promise.all([
        advancedRiskAnalyticsEngine.getRiskOverview(),
        advancedRiskAnalyticsEngine.getRiskFactors(),
        advancedRiskAnalyticsEngine.getPredictiveAnalysis(),
        advancedRiskAnalyticsEngine.getBusinessAssets(),
        advancedRiskAnalyticsEngine.getCorrelationAnalysis()
      ]);

      setRiskOverview(overview);
      setRiskFactors(factors);
      setPredictiveAnalysis(predictions);
      setBusinessAssets(assets);
      setCorrelationAnalysis(correlations);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch risk data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getRiskScoreColor = (score) => {
    if (score >= 0.8) return 'text-red-600';
    if (score >= 0.6) return 'text-orange-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getRiskScoreBadgeVariant = (score) => {
    if (score >= 0.8) return 'destructive';
    if (score >= 0.6) return 'warning';
    if (score >= 0.4) return 'secondary';
    return 'success';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      default:
        return <Activity className="w-4 h-4 text-blue-500" />;
    }
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

  // Prepare chart data
  const riskModelChartData = riskOverview?.models?.map(model => ({
    name: model.name.replace(/Risk Model|Model/g, '').trim(),
    score: (model.score * 100).toFixed(1),
    confidence: (model.confidence * 100).toFixed(1)
  })) || [];

  const riskFactorsByCategory = riskFactors.reduce((acc, factor) => {
    if (!acc[factor.category]) {
      acc[factor.category] = [];
    }
    acc[factor.category].push(factor);
    return acc;
  }, {});

  const businessImpactData = businessAssets?.map(asset => ({
    name: asset.name.length > 15 ? asset.name.substring(0, 15) + '...' : asset.name,
    value: asset.financialValue / 1000000, // Convert to millions
    risk: asset.currentRiskLevel * 100,
    criticality: asset.criticality
  })) || [];

  if (!riskOverview) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5" />
            <span>Risk Analytics Overview</span>
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
            <Brain className="w-5 h-5" />
            <span>Advanced Risk Analytics</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRiskData}
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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="models">Risk Models</TabsTrigger>
            <TabsTrigger value="factors">Risk Factors</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="assets">Business Impact</TabsTrigger>
            <TabsTrigger value="correlations">Correlations</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Executive Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Overall Risk Score</p>
                      <p className={`text-2xl font-bold ${getRiskScoreColor(riskOverview.overallScore)}`}>
                        {formatPercentage(riskOverview.overallScore)}
                      </p>
                    </div>
                    <Shield className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Risk Tolerance</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {formatPercentage(riskOverview.executiveMetrics?.riskTolerance || 0.7)}
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Business Impact</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(riskOverview.businessImpact?.potentialLoss || 0)}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Risk Trend</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold">
                          {riskOverview.executiveMetrics?.riskTrend || 'Stable'}
                        </span>
                        {getTrendIcon(riskOverview.executiveMetrics?.riskTrend)}
                      </div>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Risk Tolerance Alerts */}
            {riskOverview.executiveMetrics?.riskExceeded && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Current risk level ({formatPercentage(riskOverview.overallScore)}) exceeds risk tolerance threshold ({formatPercentage(riskOverview.executiveMetrics.riskTolerance)})
                </AlertDescription>
              </Alert>
            )}

            {riskOverview.executiveMetrics?.appetiteExceeded && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Current risk level exceeds risk appetite threshold ({formatPercentage(riskOverview.executiveMetrics.riskAppetite)})
                </AlertDescription>
              </Alert>
            )}

            {/* Top Risks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Top Risk Areas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {riskOverview.executiveMetrics?.topRisks?.map((risk, index) => (
                    <div key={risk.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{index + 1}</Badge>
                        <div>
                          <p className="font-medium">{risk.name}</p>
                          <div className="flex items-center space-x-2">
                            {getTrendIcon(risk.trend)}
                            <span className="text-sm text-gray-600 capitalize">{risk.trend}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={getRiskScoreBadgeVariant(risk.score)}>
                          {formatPercentage(risk.score)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Risk Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Model Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={riskModelChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="score" fill="#3b82f6" name="Risk Score %" />
                    <Bar dataKey="confidence" fill="#10b981" name="Confidence %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risk Models Tab */}
          <TabsContent value="models" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {riskOverview.models?.map((model) => (
                <Card key={model.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{model.name}</CardTitle>
                      <Badge variant={getRiskScoreBadgeVariant(model.score)}>
                        {formatPercentage(model.score)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Risk Score</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={model.score * 100} className="w-20" />
                          <span className="text-sm">{formatPercentage(model.score)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Confidence</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={model.confidence * 100} className="w-20" />
                          <span className="text-sm">{formatPercentage(model.confidence)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Trend</span>
                        <div className="flex items-center space-x-2">
                          {getTrendIcon(model.trend)}
                          <span className="text-sm capitalize">{model.trend}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Risk Factors Tab */}
          <TabsContent value="factors" className="space-y-4">
            {Object.entries(riskFactorsByCategory).map(([category, factors]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="capitalize">{category.replace('_', ' ')} Risk Factors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {factors.map((factor) => (
                      <div key={factor.id} className="p-3 border rounded">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{factor.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                          <Badge variant={getRiskScoreBadgeVariant(factor.value)}>
                            {formatPercentage(factor.value)}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <Progress value={factor.value * 100} />
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              {getTrendIcon(factor.trend)}
                              <span className="capitalize">{factor.trend}</span>
                            </div>
                            <span>Volatility: {formatPercentage(factor.volatility)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-4">
            {predictiveAnalysis && (
              <>
                {/* Predictive Models */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="w-4 h-4" />
                      <span>Predictive Models</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {predictiveAnalysis.models?.map((model) => (
                        <div key={model.id} className="p-4 border rounded">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{model.name}</h4>
                              <Badge variant="outline">{model.algorithm}</Badge>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Accuracy:</span>
                                <span className="font-medium">{formatPercentage(model.accuracy)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Horizon:</span>
                                <span className="font-medium">{model.predictionHorizon}</span>
                              </div>
                              {model.latestPrediction && (
                                <div className="flex justify-between text-sm">
                                  <span>Latest Prediction:</span>
                                  <span className={`font-medium ${getRiskScoreColor(model.latestPrediction.value)}`}>
                                    {formatPercentage(model.latestPrediction.value)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quantitative Analysis */}
                {predictiveAnalysis.quantitativeAnalysis && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Quantitative Risk Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-3 border rounded">
                          <p className="text-sm font-medium text-gray-600">Value at Risk (95%)</p>
                          <p className="text-lg font-bold text-red-600">
                            {formatCurrency(predictiveAnalysis.quantitativeAnalysis.var95 || 0)}
                          </p>
                        </div>
                        <div className="p-3 border rounded">
                          <p className="text-sm font-medium text-gray-600">Value at Risk (99%)</p>
                          <p className="text-lg font-bold text-red-700">
                            {formatCurrency(predictiveAnalysis.quantitativeAnalysis.var99 || 0)}
                          </p>
                        </div>
                        <div className="p-3 border rounded">
                          <p className="text-sm font-medium text-gray-600">Expected Loss</p>
                          <p className="text-lg font-bold text-orange-600">
                            {formatCurrency(predictiveAnalysis.quantitativeAnalysis.expectedLoss || 0)}
                          </p>
                        </div>
                        <div className="p-3 border rounded">
                          <p className="text-sm font-medium text-gray-600">Unexpected Loss</p>
                          <p className="text-lg font-bold text-yellow-600">
                            {formatCurrency(predictiveAnalysis.quantitativeAnalysis.unexpectedLoss || 0)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* Business Impact Tab */}
          <TabsContent value="assets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Business Asset Risk Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={businessImpactData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="value" name="Asset Value" unit="M" />
                    <YAxis dataKey="risk" name="Risk Level" unit="%" />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'value' ? `$${value}M` : `${value}%`,
                        name === 'value' ? 'Asset Value' : 'Risk Level'
                      ]}
                    />
                    <Scatter name="Business Assets" dataKey="risk" fill="#3b82f6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {businessAssets.map((asset) => (
                <Card key={asset.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{asset.name}</CardTitle>
                      <Badge variant={asset.criticality === 'critical' ? 'destructive' : 
                                     asset.criticality === 'high' ? 'warning' : 'secondary'}>
                        {asset.criticality}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Asset Value:</span>
                        <span className="text-sm font-bold">{formatCurrency(asset.financialValue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Current Risk:</span>
                        <Badge variant={getRiskScoreBadgeVariant(asset.currentRiskLevel)}>
                          {formatPercentage(asset.currentRiskLevel)}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Type:</span>
                        <span className="text-sm capitalize">{asset.type}</span>
                      </div>
                      {asset.impactAnalysis && (
                        <div className="pt-2 border-t">
                          <p className="text-sm font-medium mb-2">Impact Analysis:</p>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span>Direct Costs:</span>
                              <span>{formatCurrency(asset.impactAnalysis.directCosts)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Regulatory Fines:</span>
                              <span>{formatCurrency(asset.impactAnalysis.regulatoryFines)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Reputation Damage:</span>
                              <span>{formatCurrency(asset.impactAnalysis.reputationDamage)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Correlations Tab */}
          <TabsContent value="correlations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Risk Factor Correlations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {correlationAnalysis.slice(0, 10).map((correlation, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">
                            {correlation.factor1.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          <span className="text-gray-500">↔</span>
                          <span className="font-medium text-sm">
                            {correlation.factor2.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {correlation.strength} correlation
                        </Badge>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold ${correlation.correlation > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                          {correlation.correlation > 0 ? '+' : ''}{(correlation.correlation * 100).toFixed(1)}%
                        </span>
                        <Progress 
                          value={Math.abs(correlation.correlation) * 100} 
                          className="w-20 mt-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RiskAnalyticsOverviewWidget;
