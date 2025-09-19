import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Zap, CheckCircle2, Clock } from 'lucide-react';

const Scorecard = ({ onRemove }) => {
  const mockAutoPilotData = {
    detected: 24,
    autoFixed: 18,
    pendingApproval: 4,
    escalated: 2,
    successRate: 75
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Bot className="w-5 h-5 text-cyan-400" />
          Auto-Pilot Scorecard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">{mockAutoPilotData.detected}</div>
            <div className="text-xs text-slate-400">Issues Detected</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{mockAutoPilotData.autoFixed}</div>
            <div className="text-xs text-slate-400">Auto-Fixed</div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-white">Success Rate</span>
            <span className="text-sm text-green-400 font-bold">{mockAutoPilotData.successRate}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Pending Approval</span>
            <Badge className="bg-yellow-500/20 text-yellow-400">{mockAutoPilotData.pendingApproval}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const RecentActions = ({ onRemove }) => {
  const mockActions = [
    { id: 1, action: 'Auto-patched critical vulnerability', type: 'fix', timestamp: '2 hours ago' },
    { id: 2, action: 'Deployed firewall rule', type: 'deploy', timestamp: '4 hours ago' },
    { id: 3, action: 'Escalated unrecognized device', type: 'escalate', timestamp: '6 hours ago' }
  ];

  const getActionIcon = (type) => {
    switch(type) {
      case 'fix': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'deploy': return <Zap className="w-4 h-4 text-blue-400" />;
      case 'escalate': return <Clock className="w-4 h-4 text-orange-400" />;
      default: return <Bot className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Bot className="w-5 h-5 text-cyan-400" />
          Last 24h Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockActions.map(action => (
            <div key={action.id} className="flex items-start gap-3 p-2 bg-slate-900/50 rounded-lg">
              {getActionIcon(action.type)}
              <div className="flex-1">
                <p className="text-sm text-white">{action.action}</p>
                <p className="text-xs text-slate-400">{action.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default {
  Scorecard,
  RecentActions
};