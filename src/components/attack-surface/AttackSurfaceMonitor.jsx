import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Clock, TrendingUp, TrendingDown, Minus, Play, Pause, Settings } from 'lucide-react';
import ActionButton from '../ui/ActionButton';

const runAnalysisAction = async (mode = 'live') => {
  console.log(`Starting attack surface analysis in ${mode} mode...`);
  await new Promise(resolve => setTimeout(resolve, 3000));
  return { 
    analysis_id: 'analysis-' + Date.now(), 
    paths_found: 12, 
    new_paths: 2, 
    resolved_paths: 1 
  };
};

const AttackSurfaceMonitor = ({ 
  lastAnalysis, 
  continuousEnabled, 
  onToggleContinuous, 
  onRunAnalysis 
}) => {
  const [analysisMode, setAnalysisMode] = useState('live');
  const [frequency, setFrequency] = useState('daily');

  // Mock recent analysis data
  const mockLastAnalysis = lastAnalysis || {
    completed_at: '2024-01-15T02:00:00Z',
    total_paths_found: 12,
    new_paths: 2,
    resolved_paths: 1,
    persisting_paths: 9,
    high_risk_paths: 4,
    analysis_summary: {
      entry_points: 5,
      critical_assets_at_risk: 8,
      avg_path_length: 2.3,
      most_common_vulnerability: 'Missing MFA'
    },
    delta_from_previous: {
      risk_trend: 'increasing'
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-red-400" />;
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-green-400" />;
      default: return <Minus className="w-4 h-4 text-slate-400" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'increasing': return 'text-red-400';
      case 'decreasing': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Analysis Controls */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            Analysis Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-white font-medium">Continuous Monitoring</label>
              <p className="text-sm text-slate-400">Automatically run analysis on schedule</p>
            </div>
            <Switch 
              checked={continuousEnabled || false}
              onCheckedChange={onToggleContinuous}
            />
          </div>

          {continuousEnabled && (
            <div className="space-y-3 pt-3 border-t border-slate-600">
              <div>
                <label className="text-sm text-slate-300 mb-2 block">Frequency</label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger className="bg-slate-700 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily (2:00 AM)</SelectItem>
                    <SelectItem value="weekly">Weekly (Sunday 2:00 AM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="space-y-3 pt-3 border-t border-slate-600">
            <div>
              <label className="text-sm text-slate-300 mb-2 block">Analysis Mode</label>
              <Select value={analysisMode} onValueChange={setAnalysisMode}>
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="simulate">Simulate (Demo Data)</SelectItem>
                  <SelectItem value="live">Live (Real Assets)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-600">
            <ActionButton
              actionFn={() => runAnalysisAction(analysisMode)}
              isLongRunning={true}
              taskName="Attack Surface Analysis"
              successToast="Analysis completed successfully!"
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Run Analysis Now
            </ActionButton>
          </div>
        </CardContent>
      </Card>

      {/* Last Analysis Results */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-400" />
              Last Analysis
            </span>
            <Badge variant="outline" className="text-slate-300">
              {new Date(mockLastAnalysis.completed_at).toLocaleString()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-900/50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-white">{mockLastAnalysis.total_paths_found}</div>
              <div className="text-sm text-slate-400">Total Paths</div>
            </div>
            <div className="bg-slate-900/50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-red-400">{mockLastAnalysis.new_paths}</div>
              <div className="text-sm text-slate-400">New Paths</div>
            </div>
            <div className="bg-slate-900/50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{mockLastAnalysis.resolved_paths}</div>
              <div className="text-sm text-slate-400">Resolved</div>
            </div>
            <div className="bg-slate-900/50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-orange-400">{mockLastAnalysis.high_risk_paths}</div>
              <div className="text-sm text-slate-400">High Risk</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg">
              <span className="text-slate-300">Risk Trend</span>
              <div className={`flex items-center gap-2 ${getTrendColor(mockLastAnalysis.delta_from_previous.risk_trend)}`}>
                {getTrendIcon(mockLastAnalysis.delta_from_previous.risk_trend)}
                <span className="font-medium capitalize">{mockLastAnalysis.delta_from_previous.risk_trend}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg">
              <span className="text-slate-300">Entry Points</span>
              <span className="text-white font-medium">{mockLastAnalysis.analysis_summary.entry_points}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg">
              <span className="text-slate-300">Assets at Risk</span>
              <span className="text-white font-medium">{mockLastAnalysis.analysis_summary.critical_assets_at_risk}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg">
              <span className="text-slate-300">Most Common Issue</span>
              <Badge className="bg-red-500/20 text-red-400">
                {mockLastAnalysis.analysis_summary.most_common_vulnerability}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttackSurfaceMonitor;