import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, AlertTriangle, CheckCircle, Clock, X, ExternalLink } from 'lucide-react';
import ActionButton from '../ui/ActionButton';

const dismissAlertAction = async (alertId) => {
  console.log(`Dismissing alert: ${alertId}`);
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true };
};

const createTicketAction = async (alert) => {
  console.log(`Creating ticket for alert: ${alert.title}`);
  await new Promise(resolve => setTimeout(resolve, 1500));
  return { ticketId: 'TICKET-' + Math.random().toString(36).substr(2, 9) };
};

const AttackSurfaceAlerts = ({ alerts = [], onAlertDismiss, onCreateTicket }) => {
  // Mock alerts for demonstration
  const mockAlerts = alerts.length > 0 ? alerts : [
    {
      id: 'alert-1',
      alert_type: 'new_path',
      severity: 'critical',
      title: 'New Critical Attack Path Discovered',
      description: 'A new attack path from compromised user credentials to your SharePoint data has been identified. Risk score: 89. Immediate action recommended.',
      recommended_actions: [
        'Enable MFA for all admin accounts',
        'Implement conditional access policies',
        'Review SharePoint permissions'
      ],
      is_read: false,
      created_at: '2024-01-15T08:30:00Z'
    },
    {
      id: 'alert-2',
      alert_type: 'persistent_path',
      severity: 'high',
      title: 'Persistent Vulnerability Chain',
      description: 'The SQL injection vulnerability path (Path ID: path-1) has persisted for 5 analysis runs without remediation.',
      recommended_actions: [
        'Apply security patches to web server',
        'Implement Web Application Firewall',
        'Conduct penetration testing'
      ],
      is_read: false,
      created_at: '2024-01-15T07:45:00Z'
    },
    {
      id: 'alert-3',
      alert_type: 'trend_alert',
      severity: 'medium',
      title: 'Increasing Attack Surface',
      description: 'Your attack surface has grown by 25% over the past week, with 3 new entry points identified.',
      recommended_actions: [
        'Review recent infrastructure changes',
        'Audit new service deployments',
        'Update asset inventory'
      ],
      is_read: true,
      created_at: '2024-01-15T06:00:00Z'
    }
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/40';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'new_path': return <AlertTriangle className="w-4 h-4" />;
      case 'critical_path': return <AlertTriangle className="w-4 h-4" />;
      case 'persistent_path': return <Clock className="w-4 h-4" />;
      case 'trend_alert': return <Bell className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const unreadCount = mockAlerts.filter(alert => !alert.is_read).length;

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-400" />
            Security Alerts
          </span>
          {unreadCount > 0 && (
            <Badge className="bg-red-500/20 text-red-400">
              {unreadCount} New
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {mockAlerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <h3 className="text-white font-medium mb-2">All Clear!</h3>
            <p className="text-slate-400">No active security alerts detected.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {mockAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-4 rounded-lg border transition-colors ${
                  alert.is_read ? 'bg-slate-900/30 border-slate-600' : 'bg-slate-800/50 border-slate-500'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-1 rounded ${getSeverityColor(alert.severity).replace(/text-\w+-\d+/, 'text-current')}`}>
                      {getAlertIcon(alert.alert_type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-1">{alert.title}</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {new Date(alert.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 mb-3">{alert.description}</p>
                    </div>
                  </div>
                  <ActionButton
                    actionFn={() => dismissAlertAction(alert.id)}
                    successToast="Alert dismissed"
                    variant="ghost"
                    size="sm"
                  >
                    <X className="w-4 h-4" />
                  </ActionButton>
                </div>

                {alert.recommended_actions && alert.recommended_actions.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-slate-300 mb-2">Recommended Actions:</h5>
                    <ul className="space-y-1">
                      {alert.recommended_actions.map((action, index) => (
                        <li key={index} className="text-sm text-slate-400 flex items-start gap-2">
                          <span className="w-1 h-1 bg-slate-500 rounded-full mt-2 flex-shrink-0"></span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2">
                  <ActionButton
                    actionFn={() => createTicketAction(alert)}
                    successToast="Ticket created successfully!"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Create Ticket
                  </ActionButton>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AttackSurfaceAlerts;