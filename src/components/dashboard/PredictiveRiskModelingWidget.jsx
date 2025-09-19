/**
 * Predictive Risk Modeling Widget
 * Advanced predictive analytics with machine learning models,
 * scenario analysis, and risk forecasting
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ComposedChart
} from 'recharts';
import { 
  Brain, TrendingUp, Target, AlertTriangle, Zap, Clock, 
  BarChart3, Activity, Cpu, Database, Eye
} from 'lucide-react';
import { advancedRiskAnalyticsEngine } from '../../services/AdvancedRiskAnalyticsEngine';

const PredictiveRiskModelingWidget = ({ className = "" }) => {
  const [predictions, setPredictions] = useState(null);
  const [scenarioAnalysis, setScenarioAnalysis] = useState([]);
  const [modelPerformance, setModelPerformance] = useState([]);
  const [forecasts, setForecasts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedModel, setSelectedModel] = useState('all');
  const [selectedHorizon, setSelectedHorizon] = useState('30d');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchPredictiveData();
    const interval = setInterval(fetchPredictiveData, 45000); // Update every 45 seconds
    return () => clearInterval(interval);
  }, [selectedModel, selectedHorizon]);

  const fetchPredictiveData = async () => {
    try {
      setRefreshing(true);
      
      // Get predictive analysis data
      const predictiveData = await advancedRiskAnalyticsEngine.getPredictiveAnalysis();
      setPredictions(predictiveData);
      
      // Generate mock scenario analysis
      const scenarios = generateScenarioAnalysis();
      setScenarioAnalysis(scenarios);
      
      // Generate model performance metrics
      const performance = generateModelPerformance();
      setModelPerformance(performance);
      
      // Generate forecasts
      const forecastData = generateForecasts();
      setForecasts(forecastData);
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch predictive data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const generateScenarioAnalysis = () => {
    const scenarios = [
      {
        id: 'base_case',
        name: 'Base Case',
        description: 'Current trend continues',
        probability: 0.6,
        riskScore: 0.45,
        businessImpact: 2500000,
        timeline: '3 months',
        confidence: 0.85
      },
      {
        id: 'optimistic',
        name: 'Optimistic Scenario',
        description: 'Security improvements implemented',
        probability: 0.25,
        riskScore: 0.32,
        businessImpact: 1200000,
        timeline: '6 months',
        confidence: 0.72
      },
      {
        id: 'pessimistic',
        name: 'Pessimistic Scenario',
        description: 'Major security incident occurs',
        probability: 0.15,
        riskScore: 0.78,
        businessImpact: 8500000,
        timeline: '1 month',
        confidence: 0.68
      },
      {
        id: 'stress_test',
        name: 'Extreme Stress',
        description: 'Multiple simultaneous incidents',
        probability: 0.05,
        riskScore: 0.92,
        businessImpact: 25000000,
        timeline: '2 weeks',
        confidence: 0.55
      }
    ];

    return scenarios;
  };

  const generateModelPerformance = () => {
    return [
      {
        modelId: 'risk_trend_predictor',
        name: 'Risk Trend Predictor',
        algorithm: 'LSTM Neural Network',
        accuracy: 0.84,
        precision: 0.82,
        recall: 0.86,
        f1Score: 0.84,
        mae: 0.058, // Mean Absolute Error
        rmse: 0.074, // Root Mean Square Error
        lastTraining: '2024-01-15',
        trainingData: 2840,
        predictionHorizon: '90 days'
      },
      {
        modelId: 'incident_probability_model',
        name: 'Incident Probability Model',
        algorithm: 'Random Forest',
        accuracy: 0.78,
        precision: 0.75,
        recall: 0.81,
        f1Score: 0.78,
        mae: 0.082,
        rmse: 0.105,
        lastTraining: '2024-01-14',
        trainingData: 1950,
        predictionHorizon: '30 days'
      },
      {
        modelId: 'financial_impact_predictor',
        name: 'Financial Impact Predictor',
        algorithm: 'Monte Carlo Simulation',
        accuracy: 0.82,
        precision: 0.80,
        recall: 0.84,
        f1Score: 0.82,
        mae: 0.065,
        rmse: 0.089,
        lastTraining: '2024-01-16',
        trainingData: 3200,
        predictionHorizon: '180 days'
      },
      {
        modelId: 'business_disruption_model',
        name: 'Business Disruption Model',
        algorithm: 'Bayesian Network',
        accuracy: 0.76,
        precision: 0.73,
        recall: 0.79,
        f1Score: 0.76,
        mae: 0.095,
        rmse: 0.118,
        lastTraining: '2024-01-13',
        trainingData: 1680,
        predictionHorizon: '60 days'
      }
    ];
  };

  const generateForecasts = () => {
    const forecasts = [];
    const currentDate = new Date();
    
    // Generate 30 days of forecast data
    for (let i = 0; i <= 30; i++) {
      const date = new Date(currentDate.getTime() + (i * 24 * 60 * 60 * 1000));
      const baseRisk = 0.45;
      const trend = i * 0.005; // Slight upward trend
      const noise = (Math.random() - 0.5) * 0.1;
      const seasonal = Math.sin(i / 7) * 0.05; // Weekly seasonality
      
      forecasts.push({
        date: date.toISOString().split('T')[0],
        predicted: Math.max(0, Math.min(1, baseRisk + trend + noise + seasonal)),
        confidence_upper: Math.max(0, Math.min(1, baseRisk + trend + noise + seasonal + 0.15)),
        confidence_lower: Math.max(0, Math.min(1, baseRisk + trend + noise + seasonal - 0.15)),
        actual: i <= 7 ? Math.max(0, Math.min(1, baseRisk + (Math.random() - 0.5) * 0.08)) : null
      });
    }
    
    return forecasts;
  };

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getModelAccuracyBadge = (accuracy) => {
    if (accuracy >= 0.8) return 'success';
    if (accuracy >= 0.7) return 'warning';
    return 'destructive';
  };

  if (!predictions) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5" />
            <span>Predictive Risk Modeling</span>
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
            <span>Predictive Risk Modeling</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={selectedHorizon} onValueChange={setSelectedHorizon}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
                <SelectItem value="90d">90 Days</SelectItem>
                <SelectItem value="180d">180 Days</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline" className="text-xs">
              Updated: {lastUpdate.toLocaleTimeString()}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPredictiveData}
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
        <Tabs defaultValue="forecasts" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
            <TabsTrigger value="models">Model Performance</TabsTrigger>
            <TabsTrigger value="quantitative">Quantitative</TabsTrigger>
            <TabsTrigger value="sensitivity">Sensitivity</TabsTrigger>
          </TabsList>

          {/* Risk Forecasts Tab */}
          <TabsContent value="forecasts" className="space-y-4">
            {/* Forecast Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">7-Day Forecast</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatPercentage(forecasts[7]?.predicted || 0)}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">30-Day Forecast</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {formatPercentage(forecasts[30]?.predicted || 0)}
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
                      <p className="text-sm font-medium text-gray-600">Prediction Accuracy</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatPercentage(0.84)}
                      </p>
                    </div>
                    <Activity className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Confidence Level</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {formatPercentage(0.88)}
                      </p>
                    </div>
                    <Eye className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Risk Forecast Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Level Forecast with Confidence Intervals</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={forecasts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis 
                      domain={[0, 1]}
                      tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                    />
                    <Tooltip 
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      formatter={(value, name) => [formatPercentage(value), name]}
                    />
                    <Legend />
                    
                    {/* Confidence interval area */}
                    <Area
                      dataKey="confidence_upper"
                      fill="#3b82f6"
                      fillOpacity={0.1}
                      stroke="none"
                      name="Confidence Interval"
                    />
                    <Area
                      dataKey="confidence_lower"
                      fill="#ffffff"
                      fillOpacity={1}
                      stroke="none"
                    />
                    
                    {/* Predicted risk line */}
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Predicted Risk"
                      dot={false}
                    />
                    
                    {/* Actual risk points */}
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="#10b981"
                      strokeWidth={3}
                      name="Actual Risk"
                      dot={{ r: 4 }}
                      connectNulls={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Active Predictions */}
            <Card>
              <CardHeader>
                <CardTitle>Active Model Predictions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {predictions.models?.map((model) => (
                    <div key={model.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline">{model.algorithm}</Badge>
                          <span className="font-medium">{model.name}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Horizon: {model.predictionHorizon} | 
                          Accuracy: {formatPercentage(model.accuracy)}
                        </p>
                      </div>
                      <div className="text-right">
                        {model.latestPrediction && (
                          <div>
                            <p className="text-lg font-bold text-blue-600">
                              {formatPercentage(model.latestPrediction.value)}
                            </p>
                            <p className={`text-sm ${getConfidenceColor(model.latestPrediction.confidence)}`}>
                              {formatPercentage(model.latestPrediction.confidence)} confidence
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scenario Analysis Tab */}
          <TabsContent value="scenarios" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Risk Scenario Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scenarioAnalysis.map((scenario) => (
                    <Card key={scenario.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{scenario.name}</CardTitle>
                          <Badge variant={scenario.id === 'stress_test' ? 'destructive' : 
                                         scenario.id === 'pessimistic' ? 'warning' : 'outline'}>
                            {formatPercentage(scenario.probability)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600">{scenario.description}</p>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Risk Score:</span>
                              <span className="text-sm font-bold text-red-600">
                                {formatPercentage(scenario.riskScore)}
                              </span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Business Impact:</span>
                              <span className="text-sm font-bold">
                                {formatCurrency(scenario.businessImpact)}
                              </span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Timeline:</span>
                              <span className="text-sm">{scenario.timeline}</span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Confidence:</span>
                              <span className={`text-sm font-medium ${getConfidenceColor(scenario.confidence)}`}>
                                {formatPercentage(scenario.confidence)}
                              </span>
                            </div>
                          </div>
                          
                          <Progress value={scenario.riskScore * 100} className="mt-2" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Scenario Comparison Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Scenario Risk Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={scenarioAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="riskScore" fill="#ef4444" name="Risk Score" />
                    <Bar dataKey="probability" fill="#3b82f6" name="Probability" />
                    <Bar dataKey="confidence" fill="#10b981" name="Confidence" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Model Performance Tab */}
          <TabsContent value="models" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modelPerformance.map((model) => (
                <Card key={model.modelId}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{model.name}</CardTitle>
                      <Badge variant={getModelAccuracyBadge(model.accuracy)}>
                        {formatPercentage(model.accuracy)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Algorithm:</span>
                        <Badge variant="outline">{model.algorithm}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-600">Precision</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={model.precision * 100} className="flex-1" />
                            <span className="text-sm">{formatPercentage(model.precision)}</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-600">Recall</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={model.recall * 100} className="flex-1" />
                            <span className="text-sm">{formatPercentage(model.recall)}</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-600">F1-Score</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={model.f1Score * 100} className="flex-1" />
                            <span className="text-sm">{formatPercentage(model.f1Score)}</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-600">MAE</p>
                          <span className="text-sm font-medium">{model.mae.toFixed(3)}</span>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t">
                        <div className="flex justify-between text-sm">
                          <span>Training Data:</span>
                          <span className="font-medium">{model.trainingData.toLocaleString()} samples</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Last Training:</span>
                          <span className="font-medium">{new Date(model.lastTraining).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Prediction Horizon:</span>
                          <span className="font-medium">{model.predictionHorizon}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Model Performance Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Model Performance Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={modelPerformance.map(model => ({
                    model: model.name.replace(/Model|Predictor/g, '').trim(),
                    accuracy: model.accuracy * 100,
                    precision: model.precision * 100,
                    recall: model.recall * 100,
                    f1Score: model.f1Score * 100
                  }))}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="model" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar
                      name="Accuracy"
                      dataKey="accuracy"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name="Precision"
                      dataKey="precision"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name="Recall"
                      dataKey="recall"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.3}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quantitative Analysis Tab */}
          <TabsContent value="quantitative" className="space-y-4">
            {predictions.quantitativeAnalysis && (
              <>
                {/* VaR and Loss Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">VaR (95%)</p>
                        <p className="text-2xl font-bold text-red-600">
                          {formatCurrency(predictions.quantitativeAnalysis.var95 || 0)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">VaR (99%)</p>
                        <p className="text-2xl font-bold text-red-700">
                          {formatCurrency(predictions.quantitativeAnalysis.var99 || 0)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">Expected Loss</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {formatCurrency(predictions.quantitativeAnalysis.expectedLoss || 0)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">Unexpected Loss</p>
                        <p className="text-2xl font-bold text-yellow-600">
                          {formatCurrency(predictions.quantitativeAnalysis.unexpectedLoss || 0)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Confidence Intervals */}
                {predictions.quantitativeAnalysis.confidenceInterval && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Loss Distribution Confidence Intervals</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-3">95% Confidence Interval</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Lower Bound:</span>
                              <span className="font-medium text-green-600">
                                {formatCurrency(predictions.quantitativeAnalysis.confidenceInterval.lower95)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Upper Bound:</span>
                              <span className="font-medium text-red-600">
                                {formatCurrency(predictions.quantitativeAnalysis.confidenceInterval.upper95)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-3">99% Confidence Interval</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Lower Bound:</span>
                              <span className="font-medium text-green-600">
                                {formatCurrency(predictions.quantitativeAnalysis.confidenceInterval.lower99)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Upper Bound:</span>
                              <span className="font-medium text-red-600">
                                {formatCurrency(predictions.quantitativeAnalysis.confidenceInterval.upper99)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Stress Test Results */}
                {predictions.quantitativeAnalysis.stressTestResults && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Stress Test Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(predictions.quantitativeAnalysis.stressTestResults).map(([scenario, result]) => (
                          <div key={scenario} className="p-3 border rounded">
                            <h4 className="font-medium mb-2">{scenario}</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm">Risk Score:</span>
                                <Badge variant={result.overallRiskScore > 0.7 ? 'destructive' : 'warning'}>
                                  {formatPercentage(result.overallRiskScore)}
                                </Badge>
                              </div>
                              {result.impactedModels && result.impactedModels.length > 0 && (
                                <div>
                                  <p className="text-sm font-medium">Most Impacted:</p>
                                  <div className="space-y-1">
                                    {result.impactedModels.slice(0, 3).map((model, index) => (
                                      <div key={index} className="flex justify-between text-xs">
                                        <span>{model.name}</span>
                                        <span>{formatPercentage(model.score)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* Sensitivity Analysis Tab */}
          <TabsContent value="sensitivity" className="space-y-4">
            {predictions.quantitativeAnalysis?.sensitivityAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle>Risk Factor Sensitivity Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(predictions.quantitativeAnalysis.sensitivityAnalysis)
                      .sort(([,a], [,b]) => Math.abs(b) - Math.abs(a))
                      .map(([factor, sensitivity]) => (
                        <div key={factor} className="flex items-center justify-between p-3 border rounded">
                          <span className="font-medium">
                            {factor.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          <div className="flex items-center space-x-3">
                            <div className="w-32">
                              <Progress 
                                value={Math.abs(sensitivity) * 100} 
                                className={sensitivity > 0 ? 'bg-red-100' : 'bg-blue-100'}
                              />
                            </div>
                            <span className={`font-bold w-16 text-right ${sensitivity > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                              {sensitivity > 0 ? '+' : ''}{(sensitivity * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    <p>
                      Sensitivity analysis shows the impact of a 10% increase in each risk factor on the overall risk score.
                      Positive values indicate increased risk, negative values indicate decreased risk.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PredictiveRiskModelingWidget;
