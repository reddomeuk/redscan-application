import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Bot, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Settings,
  Zap,
  Eye,
  Play,
  Pause,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

const AutoPilotStatusBanner = ({ isEnabled, onToggle, stats }) => {
  if (!isEnabled) {
    return (
      <Card className="bg-gradient-to-r from-blue-800/20 to-purple-700/20 border-blue-500/30 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600/20 rounded-lg">
                <Bot className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">RedScan Auto-Pilot</h3>
                <p className="text-[#F5F5F5] text-sm">
                  Let AI continuously secure your business while you focus on what you do best
                </p>
              </div>
            </div>
            <Button 
              onClick={onToggle}
              className="bg-[#B00020] hover:bg-[#8B0000] text-white shadow-lg"
            >
              <Play className="w-4 h-4 mr-2" />
              Enable Auto-Pilot
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-green-800/20 to-[#B00020]/20 border-green-500/30 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-600/20 rounded-lg relative">
              <Shield className="w-8 h-8 text-green-400" />
              <div className="absolute -top-1 -right-1">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                RedScan Auto-Pilot is protecting your organization 24/7
              </h3>
              <p className="text-[#F5F5F5] text-sm">
                {stats.fixedToday} issues fixed today • {stats.monitoring} systems monitored
              </p>
            </div>
          </div>
          <Button 
            onClick={onToggle}
            variant="outline"
            className="border-[#8A8A8A]/20 text-[#8A8A8A] hover:text-white"
          >
            <Pause className="w-4 h-4 mr-2" />
            Disable
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const AutoPilotScorecard = ({ stats, recentActions }) => {
  const automationRate = Math.round((stats.autoFixed / (stats.autoFixed + stats.pendingApproval)) * 100) || 0;

  return (
    <Card className="bg-[#F5F5F5]/5 border-[#8A8A8A]/20 shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#B00020]" />
          Auto-Pilot Scorecard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-[#F5F5F5]/5 rounded-lg">
            <div className="text-2xl font-bold text-green-400">{stats.autoFixed}</div>
            <div className="text-xs text-[#8A8A8A]">Auto-Fixed</div>
          </div>
          <div className="text-center p-3 bg-[#F5F5F5]/5 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400">{stats.pendingApproval}</div>
            <div className="text-xs text-[#8A8A8A]">Pending Approval</div>
          </div>
          <div className="text-center p-3 bg-[#F5F5F5]/5 rounded-lg">
            <div className="text-2xl font-bold text-[#B00020]">{stats.totalDetected}</div>
            <div className="text-xs text-[#8A8A8A]">Issues Detected</div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-[#8A8A8A]">Automation Rate</span>
            <span className="text-lg font-bold text-white">{automationRate}%</span>
          </div>
          <Progress value={automationRate} className="h-3" />
          <p className="text-xs text-[#8A8A8A] mt-1">
            {automationRate}% of issues resolved automatically
          </p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-white mb-3">Recent Auto-Pilot Actions</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {recentActions.map((action, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-[#F5F5F5]/5 rounded-lg">
                <div className={`p-1 rounded ${
                  action.status === 'fixed' ? 'bg-green-500/20' :
                  action.status === 'pending' ? 'bg-yellow-500/20' : 'bg-blue-500/20'
                }`}>
                  {action.status === 'fixed' && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                  {action.status === 'pending' && <Clock className="w-4 h-4 text-yellow-400" />}
                  {action.status === 'monitoring' && <Eye className="w-4 h-4 text-blue-400" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">{action.description}</p>
                  <p className="text-xs text-[#8A8A8A]">{action.explanation}</p>
                </div>
                <div className="text-xs text-[#8A8A8A]">
                  {action.timestamp}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function AutoPilotControl({ autoPilotEnabled, onToggle, stats, recentActions }) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="space-y-6">
      <AutoPilotStatusBanner 
        isEnabled={autoPilotEnabled}
        onToggle={onToggle}
        stats={stats}
      />
      
      {autoPilotEnabled && (
        <AutoPilotScorecard 
          stats={stats}
          recentActions={recentActions}
        />
      )}
    </div>
  );
}