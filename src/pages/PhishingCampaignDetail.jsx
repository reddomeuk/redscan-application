
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { PhishingCampaign, PhishingRecipient } from '@/api/entities';
import { 
  ChevronLeft, 
  Mail, 
  Eye, 
  MousePointer, 
  Shield, 
  GraduationCap, 
  Download,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import ActionButton from '../components/ui/ActionButton';
import { toast } from 'sonner';

const mockExportReport = async (campaignId) => {
  console.log(`Exporting detailed report for campaign: ${campaignId}`);
  await new Promise(resolve => setTimeout(resolve, 2500));
  return { downloadUrl: `/reports/phishing-detailed-${campaignId}.pdf` };
};

export default function PhishingCampaignDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get campaign ID from URL params
  const urlParams = new URLSearchParams(location.search);
  const campaignId = urlParams.get('id');

  const loadCampaignDetails = useCallback(async () => {
    if (!campaignId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // In a real app, these would be actual API calls
      // For now, we'll use mock data based on the campaign ID
      const mockCampaign = {
        id: campaignId,
        name: 'Q1 2024 Security Awareness Campaign',
        status: 'Completed',
        provider: 'M365',
        from_name: 'IT Security Team',
        from_email: 'security@company.com',
        subject: 'Urgent: Update Your Password',
        created_at: '2024-01-15T09:00:00Z',
        metrics: {
          sent: 47,
          delivered: 45,
          bounced: 2,
          opened: 32,
          clicked: 18,
          submitted: 8,
          reported: 3,
          training_completed: 15
        },
        timeline_data: [
          { timestamp: '2024-01-15T09:00:00Z', event: 'Campaign Started', count: 1 },
          { timestamp: '2024-01-15T09:30:00Z', event: 'Emails Sent', count: 47 },
          { timestamp: '2024-01-15T10:15:00Z', event: 'First Opens', count: 12 },
          { timestamp: '2024-01-15T11:00:00Z', event: 'First Clicks', count: 5 },
          { timestamp: '2024-01-15T14:30:00Z', event: 'Training Assigned', count: 18 }
        ],
        risky_users: [
          { user_id: '1', name: 'John Smith', email: 'john@company.com', actions: ['opened', 'clicked', 'submitted'], risk_score: 85 },
          { user_id: '2', name: 'Sarah Johnson', email: 'sarah@company.com', actions: ['opened', 'clicked'], risk_score: 65 },
          { user_id: '3', name: 'Mike Chen', email: 'mike@company.com', actions: ['clicked', 'submitted'], risk_score: 90 }
        ]
      };

      // Mock recipients data
      const mockRecipients = [
        { id: '1', campaign_id: campaignId, user_email: 'john@company.com', user_name: 'John Smith', status: 'Submitted', sent_at: '2024-01-15T09:30:00Z', opened_at: '2024-01-15T10:15:00Z', clicked_at: '2024-01-15T10:45:00Z', submitted_at: '2024-01-15T10:47:00Z', training_assigned_at: '2024-01-15T11:00:00Z' },
        { id: '2', campaign_id: campaignId, user_email: 'sarah@company.com', user_name: 'Sarah Johnson', status: 'Clicked', sent_at: '2024-01-15T09:31:00Z', opened_at: '2024-01-15T11:20:00Z', clicked_at: '2024-01-15T11:22:00Z', training_assigned_at: '2024-01-15T11:25:00Z' },
        { id: '3', campaign_id: campaignId, user_email: 'mike@company.com', user_name: 'Mike Chen', status: 'CompletedTraining', sent_at: '2024-01-15T09:32:00Z', opened_at: '2024-01-15T14:10:00Z', clicked_at: '2024-01-15T14:12:00Z', submitted_at: '2024-01-15T14:15:00Z', training_assigned_at: '2024-01-15T14:20:00Z', training_completed_at: '2024-01-16T09:30:00Z' },
        { id: '4', campaign_id: campaignId, user_email: 'emma@company.com', user_name: 'Emma Wilson', status: 'Reported', sent_at: '2024-01-15T09:33:00Z', opened_at: '2024-01-15T15:45:00Z', reported_at: '2024-01-15T15:47:00Z' }
      ];

      setCampaign(mockCampaign);
      setRecipients(mockRecipients);
    } catch (error) {
      console.error('Failed to load campaign details:', error);
      toast.error('Failed to load campaign details');
    }
    setLoading(false);
  }, [campaignId]); // campaignId is a dependency for useCallback

  useEffect(() => {
    loadCampaignDetails();
  }, [loadCampaignDetails]); // loadCampaignDetails is now a stable function thanks to useCallback

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Submitted': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'Clicked': return <MousePointer className="w-4 h-4 text-yellow-400" />;
      case 'CompletedTraining': return <GraduationCap className="w-4 h-4 text-green-400" />;
      case 'Reported': return <Shield className="w-4 h-4 text-blue-400" />;
      case 'Opened': return <Eye className="w-4 h-4 text-purple-400" />;
      case 'Delivered': return <CheckCircle className="w-4 h-4 text-slate-400" />;
      default: return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted': return 'bg-red-500/20 text-red-400';
      case 'Clicked': return 'bg-yellow-500/20 text-yellow-400';
      case 'CompletedTraining': return 'bg-green-500/20 text-green-400';
      case 'Reported': return 'bg-blue-500/20 text-blue-400';
      case 'Opened': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading campaign details...</div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Campaign not found</div>
      </div>
    );
  }

  const metrics = campaign.metrics || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(createPageUrl('PhishingSimulator'))}
            className="text-slate-400 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Campaigns
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">{campaign.name}</h1>
            <div className="flex items-center gap-4 mt-2">
              <Badge className={
                campaign.status === 'Completed' ? 'bg-green-500/20 text-green-400' :
                campaign.status === 'Sending' ? 'bg-blue-500/20 text-blue-400' :
                'bg-slate-500/20 text-slate-400'
              }>
                {campaign.status}
              </Badge>
              <span className="text-slate-400">Created {new Date(campaign.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <ActionButton
            actionFn={() => mockExportReport(campaign.id)}
            isLongRunning={true}
            taskName={`Exporting ${campaign.name} detailed report`}
            successToast="Detailed report generated successfully!"
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </ActionButton>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {[
          { label: 'Sent', value: metrics.sent, icon: Mail, color: 'text-slate-400' },
          { label: 'Delivered', value: metrics.delivered, icon: CheckCircle, color: 'text-green-400' },
          { label: 'Opened', value: metrics.opened, icon: Eye, color: 'text-purple-400' },
          { label: 'Clicked', value: metrics.clicked, icon: MousePointer, color: 'text-yellow-400' },
          { label: 'Submitted', value: metrics.submitted, icon: AlertTriangle, color: 'text-red-400' },
          { label: 'Reported', value: metrics.reported, icon: Shield, color: 'text-blue-400' },
          { label: 'Training', value: metrics.training_completed, icon: GraduationCap, color: 'text-green-400' },
          { label: 'Bounced', value: metrics.bounced, icon: AlertTriangle, color: 'text-red-400' }
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">{metric.label}</span>
                  <Icon className={`w-4 h-4 ${metric.color}`} />
                </div>
                <div className="text-2xl font-bold text-white">{metric.value || 0}</div>
                {metric.label !== 'Sent' && metric.label !== 'Bounced' && metrics.sent > 0 && (
                  <div className="text-xs text-slate-400">
                    {Math.round(((metric.value || 0) / metrics.sent) * 100)}%
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="recipients" className="w-full">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="recipients">Recipients ({recipients.length})</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="delivery">Delivery Log</TabsTrigger>
        </TabsList>

        <TabsContent value="recipients" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Recipient Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Recipient</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Sent</TableHead>
                    <TableHead className="text-slate-300">Opened</TableHead>
                    <TableHead className="text-slate-300">Clicked</TableHead>
                    <TableHead className="text-slate-300">Submitted</TableHead>
                    <TableHead className="text-slate-300">Training</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recipients.map((recipient) => (
                    <TableRow key={recipient.id} className="border-slate-700">
                      <TableCell>
                        <div>
                          <div className="font-medium text-white">{recipient.user_name}</div>
                          <div className="text-sm text-slate-400">{recipient.user_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(recipient.status)}
                          <Badge className={getStatusColor(recipient.status)}>
                            {recipient.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-400">
                        {recipient.sent_at ? new Date(recipient.sent_at).toLocaleString() : '-'}
                      </TableCell>
                      <TableCell className="text-slate-400">
                        {recipient.opened_at ? new Date(recipient.opened_at).toLocaleTimeString() : '-'}
                      </TableCell>
                      <TableCell className="text-slate-400">
                        {recipient.clicked_at ? new Date(recipient.clicked_at).toLocaleTimeString() : '-'}
                      </TableCell>
                      <TableCell className="text-slate-400">
                        {recipient.submitted_at ? new Date(recipient.submitted_at).toLocaleTimeString() : '-'}
                      </TableCell>
                      <TableCell>
                        {recipient.training_completed_at ? (
                          <Badge className="bg-green-500/20 text-green-400">Completed</Badge>
                        ) : recipient.training_assigned_at ? (
                          <Badge className="bg-yellow-500/20 text-yellow-400">Assigned</Badge>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Campaign Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaign.timeline_data?.map((event, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-lg">
                    <div className="w-2 h-2 bg-[#B00020] rounded-full"></div>
                    <div className="flex-1">
                      <div className="font-medium text-white">{event.event}</div>
                      <div className="text-sm text-slate-400">
                        {new Date(event.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-slate-300">
                      {event.count}
                    </Badge>
                  </div>
                )) || (
                  <p className="text-slate-400 text-center py-8">No timeline data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Training Assigned</p>
                    <p className="text-2xl font-bold text-white">{metrics.clicked || 0}</p>
                  </div>
                  <GraduationCap className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Training Completed</p>
                    <p className="text-2xl font-bold text-white">{metrics.training_completed || 0}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Completion Rate</p>
                    <p className="text-2xl font-bold text-white">
                      {metrics.clicked > 0 ? 
                        `${Math.round(((metrics.training_completed || 0) / metrics.clicked) * 100)}%` : 
                        '0%'
                      }
                    </p>
                  </div>
                  <Progress 
                    value={metrics.clicked > 0 ? ((metrics.training_completed || 0) / metrics.clicked) * 100 : 0} 
                    className="w-8" 
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Training Module: Spotting Phishing Emails</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Duration: 8 minutes</span>
                  <span className="text-slate-300">Pass threshold: 80%</span>
                </div>
                <div className="p-4 bg-slate-900/50 rounded-lg">
                  <h5 className="text-white font-medium mb-2">Topics Covered:</h5>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li>• Identifying suspicious sender addresses</li>
                    <li>• Recognizing urgency tactics and social engineering</li>
                    <li>• Checking links before clicking</li>
                    <li>• Verifying requests through alternative channels</li>
                    <li>• Reporting suspected phishing emails</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Delivery Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{metrics.sent}</div>
                  <div className="text-sm text-slate-400">Total Sent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{metrics.delivered}</div>
                  <div className="text-sm text-slate-400">Delivered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">{metrics.bounced}</div>
                  <div className="text-sm text-slate-400">Bounced</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-400">4.2s</div>
                  <div className="text-sm text-slate-400">Avg Send Time</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h5 className="text-white font-medium">Provider Logs</h5>
                <div className="space-y-2">
                  <div className="p-3 bg-slate-900/50 rounded-lg flex justify-between items-center">
                    <span className="text-slate-300">Bulk send initiated</span>
                    <span className="text-sm text-slate-400">2024-01-15 09:30:00</span>
                  </div>
                  <div className="p-3 bg-slate-900/50 rounded-lg flex justify-between items-center">
                    <span className="text-slate-300">47 messages queued</span>
                    <span className="text-sm text-slate-400">2024-01-15 09:30:05</span>
                  </div>
                  <div className="p-3 bg-slate-900/50 rounded-lg flex justify-between items-center">
                    <span className="text-slate-300">45 messages delivered successfully</span>
                    <span className="text-sm text-slate-400">2024-01-15 09:35:22</span>
                  </div>
                  <div className="p-3 bg-red-900/20 rounded-lg flex justify-between items-center">
                    <span className="text-red-300">2 messages bounced (invalid addresses)</span>
                    <span className="text-sm text-slate-400">2024-01-15 09:36:10</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
