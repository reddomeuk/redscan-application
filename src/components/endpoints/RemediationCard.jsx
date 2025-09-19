
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  ExternalLink,
  Brain
} from 'lucide-react';
import { RemediationTask, RemediationEvent, RemediationPlaybook } from '@/api/entities';
import { RemediationEngine } from './RemediationEngine';
import { toast } from 'sonner';

export default function RemediationCard({ deviceId }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRemediationTasks = useCallback(async () => {
    setLoading(true);
    try {
      const taskData = await RemediationTask.filter({ 
        device_id: deviceId 
      });
      setTasks(taskData.sort((a, b) => new Date(b.started_at) - new Date(a.started_at)));
    } catch (error) {
      console.error('Error loading remediation tasks:', error);
    }
    setLoading(false);
  }, [deviceId]);

  useEffect(() => {
    loadRemediationTasks();
  }, [loadRemediationTasks]);

  const handleCheckAgain = async (taskId) => {
    try {
      await RemediationEngine.checkRemediationStatus(taskId);
      loadRemediationTasks();
    } catch (error) {
      toast.error('Failed to check remediation status');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-gray-500/20 text-gray-400',
      in_progress: 'bg-blue-500/20 text-blue-400',
      resolved: 'bg-green-500/20 text-green-400',
      failed: 'bg-red-500/20 text-red-400',
      expired: 'bg-yellow-500/20 text-yellow-400',
      escalated: 'bg-orange-500/20 text-orange-400'
    };
    
    return <Badge className={styles[status]}>{status.replace('_', ' ')}</Badge>;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-400" />;
      case 'resolved': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'failed': 
      case 'escalated': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return <Wrench className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatIssueType = (issueType) => {
    return issueType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
            <span className="text-slate-400">Loading remediation status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card className="bg-green-900/20 border-green-500/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className="text-green-300 font-medium">No remediation needed</span>
          </div>
          <p className="text-green-200 text-sm mt-2">This device is compliant with all security policies.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map(task => (
        <Card key={task.id} className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(task.status)}
                <div>
                  <CardTitle className="text-white text-lg">
                    {formatIssueType(task.issue_type)}
                  </CardTitle>
                  <p className="text-slate-400 text-sm">{task.trigger_reason}</p>
                </div>
              </div>
              {getStatusBadge(task.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {task.status === 'in_progress' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Progress</span>
                  <span className="text-slate-300">{task.current_step}/{task.total_steps} steps</span>
                </div>
                <Progress 
                  value={(task.current_step / task.total_steps) * 100} 
                  className="h-2 bg-slate-700"
                />
                {task.estimated_completion && (
                  <p className="text-xs text-slate-500">
                    ETA: {new Date(task.estimated_completion).toLocaleTimeString()}
                  </p>
                )}
              </div>
            )}

            {task.manual_intervention_required && (
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="text-yellow-300 font-medium">Manual Action Required</h4>
                    <p className="text-yellow-200 text-sm mt-1">{task.user_instructions}</p>
                  </div>
                </div>
              </div>
            )}

            {task.success_likelihood && (
              <div className="flex items-center gap-2 text-sm">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="text-slate-400">AI Success Prediction:</span>
                <span className="text-purple-300">{(task.success_likelihood * 100).toFixed(0)}%</span>
              </div>
            )}

            {(task.status === 'failed' || task.manual_intervention_required) && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCheckAgain(task.id)}
                  className="border-slate-600 text-slate-300"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Check Again
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-600 text-slate-300"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Get Help
                </Button>
              </div>
            )}

            {task.status === 'resolved' && (
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-green-300 font-medium">Remediation Successful</span>
                </div>
                <p className="text-green-200 text-sm mt-1">
                  Completed at {new Date(task.completed_at).toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
