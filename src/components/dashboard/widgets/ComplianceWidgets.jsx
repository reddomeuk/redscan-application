import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, Award, CheckCircle, AlertTriangle } from 'lucide-react';

const CEReadiness = ({ onRemove }) => {
  const mockReadiness = {
    score: 78,
    controlsPassed: 35,
    totalControls: 47,
    gaps: ['MFA for admin accounts', 'Endpoint encryption', 'Patch management']
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#B00020]" />
          CE+ Readiness
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-4">
          <div className="text-3xl font-bold text-white">{mockReadiness.score}%</div>
          <div className="text-sm text-slate-400">
            {mockReadiness.controlsPassed}/{mockReadiness.totalControls} controls
          </div>
          <Progress value={mockReadiness.score} className="mt-2" />
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-2">Top gaps to address:</p>
          <div className="space-y-1">
            {mockReadiness.gaps.slice(0, 3).map((gap, index) => (
              <p key={index} className="text-xs text-red-400">• {gap}</p>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const FrameworkCoverage = ({ onRemove }) => {
  const mockFrameworks = [
    { name: 'CE+', coverage: 78, controls: 47 },
    { name: 'ISO 27001', coverage: 45, controls: 114 },
    { name: 'NIST CSF', coverage: 23, controls: 108 }
  ];

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-400" />
          Framework Coverage
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockFrameworks.map(framework => (
            <div key={framework.name}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white font-medium">{framework.name}</span>
                <span className="text-sm text-slate-400">{framework.coverage}%</span>
              </div>
              <Progress value={framework.coverage} className="h-2" />
              <p className="text-xs text-slate-400 mt-1">{framework.controls} total controls</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const ControlGaps = ({ onRemove }) => {
  const mockGaps = [
    { control: 'A7.13 - MFA Implementation', framework: 'CE+', priority: 'High' },
    { control: 'A4.7 - Disk Encryption', framework: 'CE+', priority: 'High' },
    { control: 'A8.8 - Patch Management', framework: 'ISO', priority: 'Medium' },
    { control: 'SC-28 - Data Protection', framework: 'NIST', priority: 'Medium' }
  ];

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-400" />
          Open Control Gaps
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockGaps.map((gap, index) => (
            <div key={index} className="flex items-start justify-between p-2 bg-slate-900/50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{gap.control}</p>
                <p className="text-xs text-slate-400">{gap.framework}</p>
              </div>
              <Badge className={gap.priority === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}>
                {gap.priority}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const Overview = ({ onRemove }) => {
  return (
    <div className="grid grid-cols-4 gap-4">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-400">78%</div>
          <div className="text-sm text-slate-400">CE+ Ready</div>
        </CardContent>
      </Card>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">3</div>
          <div className="text-sm text-slate-400">Frameworks</div>
        </CardContent>
      </Card>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-red-400">8</div>
          <div className="text-sm text-slate-400">Open Gaps</div>
        </CardContent>
      </Card>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">35</div>
          <div className="text-sm text-slate-400">Passed</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default {
  CEReadiness,
  FrameworkCoverage,
  ControlGaps,
  Overview
};