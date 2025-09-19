import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Users, AlertTriangle, Play } from 'lucide-react';

const CampaignSummary = ({ onRemove }) => {
  const mockCampaign = {
    name: 'Q1 Security Awareness',
    status: 'Completed',
    clickRate: 18,
    submitRate: 8,
    trainingCompleted: 15
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Mail className="w-5 h-5 text-blue-400" />
          Last Phishing Campaign
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-white font-medium">{mockCampaign.name}</p>
            <Badge className="bg-green-500/20 text-green-400 mt-1">{mockCampaign.status}</Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-bold text-yellow-400">{mockCampaign.clickRate}%</div>
              <div className="text-xs text-slate-400">Clicked</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-400">{mockCampaign.submitRate}%</div>
              <div className="text-xs text-slate-400">Submitted</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-400">{mockCampaign.trainingCompleted}</div>
              <div className="text-xs text-slate-400">Trained</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const TrainingCompletion = ({ onRemove }) => {
  const mockDepartments = [
    { name: 'Engineering', completion: 95 },
    { name: 'Sales', completion: 78 },
    { name: 'Marketing', completion: 82 },
    { name: 'Finance', completion: 90 }
  ];

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-green-400" />
          Training Completion by Dept
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockDepartments.map(dept => (
            <div key={dept.name} className="flex items-center justify-between">
              <span className="text-sm text-white">{dept.name}</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-green-400 h-2 rounded-full" 
                    style={{ width: `${dept.completion}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400 w-8">{dept.completion}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const RiskyUsers = ({ onRemove }) => {
  const mockRiskyUsers = [
    { name: 'John Smith', email: 'john@company.com', riskScore: 85, actions: ['clicked', 'submitted'] },
    { name: 'Sarah Johnson', email: 'sarah@company.com', riskScore: 65, actions: ['clicked'] },
    { name: 'Mike Chen', email: 'mike@company.com', riskScore: 90, actions: ['clicked', 'submitted'] }
  ];

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          Users Needing Training
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockRiskyUsers.map(user => (
            <div key={user.email} className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-slate-400">{user.actions.join(', ')}</p>
              </div>
              <Badge className="bg-red-500/20 text-red-400">
                {user.riskScore}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const ActiveCampaigns = ({ onRemove }) => {
  const mockCampaigns = [
    { name: 'Q2 Awareness Test', status: 'Sending', progress: 67 },
    { name: 'Executive Training', status: 'Scheduled', progress: 0 }
  ];

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Play className="w-5 h-5 text-blue-400" />
          Active Campaigns
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockCampaigns.map(campaign => (
            <div key={campaign.name} className="p-2 bg-slate-900/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-white truncate">{campaign.name}</p>
                <Badge className={campaign.status === 'Sending' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}>
                  {campaign.status}
                </Badge>
              </div>
              {campaign.progress > 0 && (
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                  <div 
                    className="bg-blue-400 h-1.5 rounded-full" 
                    style={{ width: `${campaign.progress}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default {
  CampaignSummary,
  TrainingCompletion,
  RiskyUsers,
  ActiveCampaigns
};