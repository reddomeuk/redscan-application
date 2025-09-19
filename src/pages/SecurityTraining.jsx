/**
 * Security Training & Awareness Dashboard
 * Security awareness, phishing simulation, compliance tracking, gamification
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
  GraduationCap, ShieldCheck, Award, Zap, Users, Mail, Trophy, Star, AlertTriangle, CheckCircle, XCircle, TrendingUp, Filter, Download, RefreshCw, Eye, MessageSquare, BookOpen, PlayCircle, UserCheck, UserX, Clock
} from 'lucide-react';

const SecurityTraining = () => {
  const [trainingData, setTrainingData] = useState({
    modules: [],
    users: [],
    progress: [],
    phishingSimulations: [],
    compliance: [],
    leaderboard: [],
    cultureMetrics: [],
    events: []
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const wsRef = useRef(null);

  useEffect(() => {
    loadTrainingData();
    setupRealTimeConnection();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const loadTrainingData = async () => {
    setLoading(true);
    try {
      const mockData = generateMockTrainingData();
      setTrainingData(mockData);
    } catch (error) {
      console.error('Failed to load training data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeConnection = () => {
    try {
      wsRef.current = new WebSocket('ws://localhost:3001/security-training');
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        updateRealTimeData(data);
      };
      wsRef.current.onopen = () => {
        console.log('Real-time security training connection established');
      };
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to setup real-time connection:', error);
    }
  };

  const updateRealTimeData = (newData) => {
    setTrainingData(prev => ({
      ...prev,
      events: [newData.event, ...prev.events].slice(0, 1000),
      users: prev.users.map(user => user.id === newData.userId ? { ...user, ...newData.userUpdate } : user)
    }));
  };

  const generateMockTrainingData = () => {
    return {
      modules: generateModuleData(),
      users: generateUserData(),
      progress: generateProgressData(),
      phishingSimulations: generatePhishingSimulationData(),
      compliance: generateComplianceData(),
      leaderboard: generateLeaderboardData(),
      cultureMetrics: generateCultureMetrics(),
      events: generateEventData()
    };
  };

  const generateModuleData = () => {
    const modules = [
      { id: 'mod_1', name: 'Phishing Awareness', type: 'video', duration: 15, status: 'active', score: 95 },
      { id: 'mod_2', name: 'Password Security', type: 'quiz', duration: 10, status: 'active', score: 92 },
      { id: 'mod_3', name: 'Social Engineering', type: 'interactive', duration: 20, status: 'active', score: 89 },
      { id: 'mod_4', name: 'Physical Security', type: 'video', duration: 12, status: 'active', score: 90 },
      { id: 'mod_5', name: 'Data Protection', type: 'quiz', duration: 18, status: 'active', score: 94 },
      { id: 'mod_6', name: 'Incident Response', type: 'interactive', duration: 25, status: 'active', score: 91 }
    ];
    return modules;
  };

  const generateUserData = () => {
    return Array.from({ length: 100 }, (_, i) => ({
      id: `user_${i + 1}`,
      name: `User ${i + 1}`,
      email: `user${i + 1}@company.com`,
      completedModules: Math.floor(Math.random() * 6),
      score: Math.floor(Math.random() * 100),
      lastActivity: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      status: ['active', 'inactive'][Math.floor(Math.random() * 2)],
      compliance: Math.random() > 0.2,
      badges: generateUserBadges(),
      rank: i + 1
    }));
  };

  const generateUserBadges = () => {
    const badges = ['Phishing Pro', 'Password Hero', 'Incident Responder', 'Data Guardian', 'Security Champion'];
    return badges.filter(() => Math.random() > 0.7);
  };

  const generateProgressData = () => {
    return Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
      completionRate: Math.floor(Math.random() * 40) + 60,
      averageScore: Math.floor(Math.random() * 20) + 80,
      phishingResilience: Math.floor(Math.random() * 20) + 70,
      complianceRate: Math.floor(Math.random() * 20) + 80
    }));
  };

  const generatePhishingSimulationData = () => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: `sim_${i + 1}`,
      name: `Phishing Simulation ${i + 1}`,
      date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      targets: Math.floor(Math.random() * 80) + 20,
      clicks: Math.floor(Math.random() * 20),
      reported: Math.floor(Math.random() * 10),
      resilience: Math.floor(Math.random() * 20) + 70,
      status: ['completed', 'active', 'scheduled'][Math.floor(Math.random() * 3)],
      findings: Math.floor(Math.random() * 5),
      improvement: Math.floor(Math.random() * 10)
    }));
  };

  const generateComplianceData = () => {
    return [
      { framework: 'SOX', score: 97 },
      { framework: 'GDPR', score: 93 },
      { framework: 'HIPAA', score: 95 },
      { framework: 'PCI DSS', score: 98 }
    ];
  };

  const generateLeaderboardData = () => {
    return Array.from({ length: 10 }, (_, i) => ({
      rank: i + 1,
      name: `User ${i + 1}`,
      score: Math.floor(Math.random() * 100),
      badges: generateUserBadges()
    }));
  };

  const generateCultureMetrics = () => {
    return [
      { metric: 'Phishing Resilience', value: 88 },
      { metric: 'Password Hygiene', value: 92 },
      { metric: 'Incident Reporting', value: 85 },
      { metric: 'Training Completion', value: 94 },
      { metric: 'Security Champions', value: 12 }
    ];
  };

  const generateEventData = () => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: `event_${i + 1}`,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      type: ['module_completed', 'phishing_reported', 'badge_earned', 'quiz_passed', 'training_started'][Math.floor(Math.random() * 5)],
      user: `User ${Math.floor(Math.random() * 100) + 1}`,
      module: `Module ${Math.floor(Math.random() * 6) + 1}`,
      score: Math.floor(Math.random() * 100),
      badge: ['Phishing Pro', 'Password Hero', 'Incident Responder', 'Data Guardian', 'Security Champion'][Math.floor(Math.random() * 5)]
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      scheduled: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      error: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || colors.active;
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const TrainingProgressChart = () => {
    const chartData = trainingData.progress.slice(-7);
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={date => new Date(date).toLocaleDateString()} />
          <YAxis />
          <Tooltip labelFormatter={date => new Date(date).toLocaleDateString()} />
          <Legend />
          <Line type="monotone" dataKey="completionRate" stroke="#3b82f6" name="Completion Rate" />
          <Line type="monotone" dataKey="phishingResilience" stroke="#ef4444" name="Phishing Resilience" />
          <Line type="monotone" dataKey="complianceRate" stroke="#10b981" name="Compliance Rate" />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const LeaderboardChart = () => {
    const chartData = trainingData.leaderboard.map(user => ({
      name: user.name,
      score: user.score
    }));
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="score" fill="#3b82f6" name="Score" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-2">
          <GraduationCap className="w-6 h-6 animate-pulse" />
          <span>Loading Security Training & Awareness...</span>
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
            <GraduationCap className="w-8 h-8 text-blue-600" />
            <span>Security Training & Awareness</span>
          </h1>
          <p className="text-gray-600 mt-1">
            Security awareness, phishing simulation, compliance tracking, and gamification
          </p>
        </div>
        <div className="flex space-x-2">
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
                <p className="text-sm font-medium text-gray-600">Active Modules</p>
                <p className="text-2xl font-bold text-blue-600">{trainingData.modules.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Users Enrolled</p>
                <p className="text-2xl font-bold text-green-600">{trainingData.users.length}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Phishing Simulations</p>
                <p className="text-2xl font-bold text-orange-600">{trainingData.phishingSimulations.length}</p>
              </div>
              <Mail className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliance Rate</p>
                <p className="text-2xl font-bold text-purple-600">{Math.round(trainingData.progress.slice(-1)[0]?.complianceRate || 0)}%</p>
              </div>
              <ShieldCheck className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gamification Badges</p>
                <p className="text-2xl font-bold text-yellow-600">{trainingData.leaderboard.reduce((sum, user) => sum + user.badges.length, 0)}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Security Champions</p>
                <p className="text-2xl font-bold text-red-600">{trainingData.cultureMetrics.find(m => m.metric === 'Security Champions')?.value || 0}</p>
              </div>
              <Trophy className="w-8 h-8 text-red-600" />
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
                placeholder="Search modules, users, badges, or events..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Button>
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="phishing">Phishing</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="culture">Culture</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Training Progress</CardTitle>
                <CardDescription>Completion, resilience, and compliance rates</CardDescription>
              </CardHeader>
              <CardContent>
                <TrainingProgressChart />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Leaderboard</CardTitle>
                <CardDescription>Top performers and badge earners</CardDescription>
              </CardHeader>
              <CardContent>
                <LeaderboardChart />
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {trainingData.events.slice(0, 10).map(event => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <PlayCircle className="w-4 h-4 text-gray-600" />
                          <span className="font-medium text-sm">{event.type.replace('_', ' ')}</span>
                          <Badge className={getScoreColor(event.score)}>
                            Score: {event.score}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600">User: {event.user} | Module: {event.module} | Badge: {event.badge}</p>
                        <span className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Culture Metrics</CardTitle>
                <CardDescription>Security culture and awareness indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {trainingData.cultureMetrics.map(metric => (
                    <div key={metric.metric} className="flex items-center justify-between">
                      <span className="font-medium text-gray-600">{metric.metric}</span>
                      <span className="font-bold text-blue-600">{metric.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Modules Tab */}
        <TabsContent value="modules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Training Modules</CardTitle>
              <CardDescription>Interactive, video, and quiz modules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingData.modules.map(module => (
                  <div key={module.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold">{module.name}</h3>
                          <Badge className={getStatusColor(module.status)}>{module.status}</Badge>
                          <Badge variant="outline" className="text-xs">{module.type}</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Duration:</span>
                            <p className="font-medium">{module.duration} min</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Score:</span>
                            <p className={`font-medium ${getScoreColor(module.score)}`}>{module.score}</p>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Start
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Phishing Tab */}
        <TabsContent value="phishing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Phishing Simulations</CardTitle>
              <CardDescription>Active, completed, and scheduled campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingData.phishingSimulations.map(sim => (
                  <div key={sim.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold">{sim.name}</h3>
                          <Badge className={getStatusColor(sim.status)}>{sim.status}</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Targets:</span>
                            <p className="font-medium">{sim.targets}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Clicks:</span>
                            <p className="font-medium">{sim.clicks}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Reported:</span>
                            <p className="font-medium">{sim.reported}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Resilience:</span>
                            <p className="font-medium text-green-600">{sim.resilience}%</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-3">
                          <span className="text-xs text-gray-500">Date: {new Date(sim.date).toLocaleDateString()}</span>
                          <span className="text-xs text-gray-500">Findings: {sim.findings}</span>
                          <span className="text-xs text-gray-500">Improvement: {sim.improvement}%</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Mail className="w-4 h-4 mr-2" />
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Progress</CardTitle>
              <CardDescription>Training completion, scores, and badges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingData.users.slice(0, 20).map(user => (
                  <div key={user.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold">{user.name}</h3>
                          <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                          <Badge variant="outline" className="text-xs">Rank: {user.rank}</Badge>
                          {user.compliance && (
                            <Badge className="bg-green-100 text-green-800 border-green-200">Compliant</Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Completed Modules:</span>
                            <p className="font-medium">{user.completedModules}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Score:</span>
                            <p className={`font-medium ${getScoreColor(user.score)}`}>{user.score}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Last Activity:</span>
                            <p className="font-medium">{new Date(user.lastActivity).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Badges:</span>
                            <p className="font-medium">{user.badges.join(', ') || 'None'}</p>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Leaderboard</CardTitle>
              <CardDescription>Top performers and badge earners</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingData.leaderboard.map(user => (
                  <div key={user.rank} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold">{user.name}</h3>
                          <Badge variant="outline" className="text-xs">Rank: {user.rank}</Badge>
                          <Badge className={getScoreColor(user.score)}>{user.score}</Badge>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          {user.badges.map(badge => (
                            <Badge key={badge} variant="outline" className="text-xs">{badge}</Badge>
                          ))}
                        </div>
                      </div>
                      <Trophy className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Culture Tab */}
        <TabsContent value="culture" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Culture Metrics</CardTitle>
              <CardDescription>Awareness, reporting, and champion indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {trainingData.cultureMetrics.map(metric => (
                  <div key={metric.metric} className="flex items-center justify-between">
                    <span className="font-medium text-gray-600">{metric.metric}</span>
                    <span className="font-bold text-blue-600">{metric.value}</span>
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
              <CardTitle>Compliance Training Metrics</CardTitle>
              <CardDescription>Framework completion and compliance rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {trainingData.compliance.map(item => (
                  <div key={item.framework} className="text-center">
                    <div className="text-2xl font-bold text-green-600">{item.score}%</div>
                    <div className="text-sm text-gray-600">{item.framework}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Training compliance</strong> is above 90% for all frameworks.
                  </AlertDescription>
                </Alert>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>2 users</strong> have overdue training modules.
                    <Button variant="link" className="p-0 h-auto font-normal">Remind now →</Button>
                  </AlertDescription>
                </Alert>
                <Alert>
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>1 user</strong> failed phishing simulation and needs retraining.
                    <Button variant="link" className="p-0 h-auto font-normal">Assign module →</Button>
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

export default SecurityTraining;