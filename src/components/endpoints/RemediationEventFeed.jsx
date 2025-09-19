import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink,
  RefreshCw,
  Play,
  AlertTriangle,
  Brain
} from 'lucide-react';
import { RemediationEvent } from '@/api/entities';
import { format } from 'date-fns';

export default function RemediationEventFeed({ events, devices, tasks }) {
  const [realtimeEvents, setRealtimeEvents] = useState(events);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    setRealtimeEvents(events);
  }, [events]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(async () => {
      try {
        const freshEvents = await RemediationEvent.list('-created_date', 50);
        setRealtimeEvents(freshEvents);
      } catch (error) {
        console.error('Error refreshing events:', error);
      }
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getEventIcon = (eventType) => {
    const icons = {
      task_created: Clock,
      automation_started: Play,
      step_completed: CheckCircle2,
      user_action_required: AlertTriangle,
      resolved: CheckCircle2,
      failed: XCircle,
      escalated: ExternalLink,
      user_check_requested: Brain
    };
    return icons[eventType] || Activity;
  };

  const getEventBadge = (eventType) => {
    const configs = {
      task_created: { color: 'bg-blue-500/20 text-blue-400', text: 'Created' },
      automation_started: { color: 'bg-purple-500/20 text-purple-400', text: 'Started' },
      step_completed: { color: 'bg-green-500/20 text-green-400', text: 'Step Done' },
      user_action_required: { color: 'bg-yellow-500/20 text-yellow-400', text: 'User Action' },
      resolved: { color: 'bg-green-500/20 text-green-400', text: 'Resolved' },
      failed: { color: 'bg-red-500/20 text-red-400', text: 'Failed' },
      escalated: { color: 'bg-purple-500/20 text-purple-400', text: 'Escalated' },
      user_check_requested: { color: 'bg-blue-500/20 text-blue-400', text: 'Check Requested' }
    };
    
    const config = configs[eventType] || { color: 'bg-slate-500/20 text-slate-400', text: 'Unknown' };
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  const getDeviceName = (deviceId) => {
    const device = devices.find(d => d.id === deviceId);
    return device?.hostname || `Device ${deviceId.substring(0, 8)}`;
  };

  const getTaskInfo = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    return task ? {
      issueType: task.issue_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      status: task.status
    } : null;
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Real-Time Event Feed
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`} />
                <span className="text-sm text-slate-400">
                  {autoRefresh ? 'Live' : 'Paused'}
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-slate-600"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? 'Pause' : 'Resume'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Event Stream */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-0">
          <ScrollArea className="h-96">
            <div className="p-4 space-y-3">
              {realtimeEvents.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No recent remediation events</p>
                </div>
              ) : (
                realtimeEvents.map((event) => {
                  const Icon = getEventIcon(event.event_type);
                  const taskInfo = getTaskInfo(event.task_id);
                  
                  return (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/30 border border-slate-700/50"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-blue-400" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getEventBadge(event.event_type)}
                          <span className="text-xs text-slate-400">
                            {format(new Date(event.created_date), 'MMM dd, HH:mm:ss')}
                          </span>
                        </div>
                        
                        <p className="text-sm text-white mb-1">
                          <strong>{getDeviceName(event.device_id)}</strong>
                          {taskInfo && (
                            <span className="text-slate-400 ml-2">
                              • {taskInfo.issueType}
                            </span>
                          )}
                        </p>
                        
                        <p className="text-sm text-slate-300">{event.message}</p>
                        
                        {event.details && Object.keys(event.details).length > 0 && (
                          <div className="mt-2 p-2 bg-slate-800/50 rounded text-xs">
                            <pre className="text-slate-400 whitespace-pre-wrap">
                              {JSON.stringify(event.details, null, 2)}
                            </pre>
                          </div>
                        )}
                        
                        {event.user_email && (
                          <div className="mt-1 text-xs text-slate-500">
                            Triggered by: {event.user_email}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}