import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PhishingCampaign } from '@/api/entities';
import { Mail, Plus, Download, BarChart, Users, Play, Pause, Copy, Trash, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import ActionButton from '../components/ui/ActionButton';

const mockCampaignAction = async (action, campaign) => {
  console.log(`${action} campaign:`, campaign.name);
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (action === 'pause') {
    return { status: 'Paused' };
  } else if (action === 'resume') {
    return { status: 'Sending' };
  } else if (action === 'duplicate') {
    return { id: `${campaign.id}-copy`, name: `${campaign.name} (Copy)` };
  }
  
  return { success: true };
};

const mockExportReport = async (campaignId) => {
  console.log(`Exporting report for campaign: ${campaignId}`);
  await new Promise(resolve => setTimeout(resolve, 2000));
  return { downloadUrl: `/reports/phishing-campaign-${campaignId}.pdf` };
};

export default function PhishingSimulatorPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    provider: 'all',
    search: ''
  });

  useEffect(() => {
    loadCampaigns();
  }, []);

  useEffect(() => {
    let filtered = campaigns;
    
    if (filters.status !== 'all') {
      filtered = filtered.filter(c => c.status === filters.status);
    }
    
    if (filters.provider !== 'all') {
      filtered = filtered.filter(c => c.provider === filters.provider);
    }
    
    if (filters.search) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    setFilteredCampaigns(filtered);
  }, [campaigns, filters]);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const items = await PhishingCampaign.list('-created_date', 50);
      setCampaigns(items);
    } catch (error) {
      toast.error("Failed to load phishing campaigns.");
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-500/20 text-green-400';
      case 'Sending': return 'bg-blue-500/20 text-blue-400';
      case 'Scheduled': return 'bg-purple-500/20 text-purple-400';
      case 'Paused': return 'bg-yellow-500/20 text-yellow-400';
      case 'Draft': return 'bg-slate-500/20 text-slate-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getProviderIcon = (provider) => {
    return provider === 'M365' ? '🏢' : '🌐';
  };

  const calculateClickRate = (campaign) => {
    const metrics = campaign.metrics || {};
    const sent = metrics.sent || 0;
    const clicked = metrics.clicked || 0;
    return sent > 0 ? Math.round((clicked / sent) * 100) : 0;
  };

  const calculateRiskScore = (campaign) => {
    const metrics = campaign.metrics || {};
    const sent = metrics.sent || 0;
    const submitted = metrics.submitted || 0;
    return sent > 0 ? Math.round((submitted / sent) * 100) : 0;
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Phishing Simulator</h1>
          <p className="text-slate-400">Train your users and test your defenses against phishing attacks.</p>
        </div>
        <div className="flex gap-2">
          <Link to={createPageUrl('PhishingTemplates')}>
            <Button variant="outline">
              <Mail className="w-4 h-4 mr-2" />
              Templates
            </Button>
          </Link>
          <Link to={createPageUrl('PhishingCampaignNew')}>
            <Button className="bg-[#B00020] hover:bg-[#8B0000]">
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </Link>
        </div>
      </header>

      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          {/* Filters */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex gap-4 items-center flex-wrap">
                <Input
                  placeholder="Search campaigns..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="max-w-sm bg-slate-900/50 border-slate-700"
                />
                <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Sending">Sending</SelectItem>
                    <SelectItem value="Paused">Paused</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.provider} onValueChange={(value) => setFilters({...filters, provider: value})}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Providers</SelectItem>
                    <SelectItem value="M365">Microsoft 365</SelectItem>
                    <SelectItem value="GWS">Google Workspace</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Campaigns Table */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#B00020]" />
                Active Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Campaign</TableHead>
                    <TableHead className="text-slate-300">Provider</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Recipients</TableHead>
                    <TableHead className="text-slate-300">Open Rate</TableHead>
                    <TableHead className="text-slate-300">Click Rate</TableHead>
                    <TableHead className="text-slate-300">Submit Rate</TableHead>
                    <TableHead className="text-slate-300">Training</TableHead>
                    <TableHead className="text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan="9" className="text-center text-slate-400">Loading campaigns...</TableCell>
                    </TableRow>
                  ) : filteredCampaigns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan="9" className="text-center text-slate-400">No campaigns found</TableCell>
                    </TableRow>
                  ) : (
                    filteredCampaigns.map((campaign) => {
                      const metrics = campaign.metrics || {};
                      const sent = metrics.sent || 0;
                      const opened = metrics.opened || 0;
                      const clicked = metrics.clicked || 0;
                      const submitted = metrics.submitted || 0;
                      const trained = metrics.training_completed || 0;

                      return (
                        <TableRow key={campaign.id} className="border-slate-700 hover:bg-slate-700/30">
                          <TableCell>
                            <Link 
                              to={createPageUrl(`PhishingCampaignDetail?id=${campaign.id}`)}
                              className="font-medium text-white hover:text-[#B00020]"
                            >
                              {campaign.name}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getProviderIcon(campaign.provider)}</span>
                              <span className="text-slate-300">{campaign.provider}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(campaign.status)}>
                              {campaign.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white">{sent}</TableCell>
                          <TableCell className="text-blue-400">
                            {sent > 0 ? `${Math.round((opened / sent) * 100)}%` : '0%'}
                          </TableCell>
                          <TableCell className="text-yellow-400">
                            {sent > 0 ? `${Math.round((clicked / sent) * 100)}%` : '0%'}
                          </TableCell>
                          <TableCell className="text-red-400">
                            {sent > 0 ? `${Math.round((submitted / sent) * 100)}%` : '0%'}
                          </TableCell>
                          <TableCell className="text-green-400">
                            {clicked > 0 ? `${Math.round((trained / clicked) * 100)}%` : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {campaign.status === 'Sending' ? (
                                <ActionButton
                                  actionFn={() => mockCampaignAction('pause', campaign)}
                                  successToast="Campaign paused"
                                  size="sm"
                                  variant="ghost"
                                >
                                  <Pause className="w-3 h-3" />
                                </ActionButton>
                              ) : campaign.status === 'Paused' ? (
                                <ActionButton
                                  actionFn={() => mockCampaignAction('resume', campaign)}
                                  successToast="Campaign resumed"
                                  size="sm"
                                  variant="ghost"
                                >
                                  <Play className="w-3 h-3" />
                                </ActionButton>
                              ) : null}
                              
                              <ActionButton
                                actionFn={() => mockCampaignAction('duplicate', campaign)}
                                successToast="Campaign duplicated"
                                size="sm"
                                variant="ghost"
                              >
                                <Copy className="w-3 h-3" />
                              </ActionButton>
                              
                              <ActionButton
                                actionFn={() => mockExportReport(campaign.id)}
                                isLongRunning={true}
                                taskName={`Exporting ${campaign.name} report`}
                                successToast="Report generated successfully!"
                                size="sm"
                                variant="ghost"
                              >
                                <Download className="w-3 h-3" />
                              </ActionButton>
                              
                              <ActionButton
                                actionFn={() => mockCampaignAction('delete', campaign)}
                                confirm={{
                                  title: `Delete campaign "${campaign.name}"?`,
                                  description: "This action cannot be undone."
                                }}
                                successToast="Campaign deleted"
                                size="sm"
                                variant="ghost"
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash className="w-3 h-3" />
                              </ActionButton>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Total Campaigns</p>
                    <p className="text-2xl font-bold text-white">{campaigns.length}</p>
                  </div>
                  <BarChart className="w-8 h-8 text-[#B00020]" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Avg Click Rate</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      {campaigns.length > 0 ? 
                        `${Math.round(campaigns.reduce((acc, c) => acc + calculateClickRate(c), 0) / campaigns.length)}%` : 
                        '0%'
                      }
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Users Trained</p>
                    <p className="text-2xl font-bold text-green-400">
                      {campaigns.reduce((acc, c) => acc + (c.metrics?.training_completed || 0), 0)}
                    </p>
                  </div>
                  <Badge className="w-8 h-8 bg-green-500/20 text-green-400 flex items-center justify-center">✓</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Phishing Awareness Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-slate-400">
                <p>Analytics chart would be rendered here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Phishing Simulator Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-white font-medium mb-4">Provider Configuration</h4>
                <div className="grid gap-4">
                  <div className="p-4 border border-slate-600 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-white font-medium">Microsoft 365 / Exchange Online</h5>
                        <p className="text-sm text-slate-400">Send phishing simulations via Exchange Online</p>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400">Connected</Badge>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-slate-600 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-white font-medium">Google Workspace / Gmail</h5>
                        <p className="text-sm text-slate-400">Send phishing simulations via Gmail API</p>
                      </div>
                      <Badge className="bg-slate-500/20 text-slate-400">Not Connected</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-medium mb-4">Safety & Compliance</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Auto-assign training to clicked users</span>
                    <Badge className="bg-green-500/20 text-green-400">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Show safety notices on landing pages</span>
                    <Badge className="bg-green-500/20 text-green-400">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Honor opt-out requests</span>
                    <Badge className="bg-green-500/20 text-green-400">Enabled</Badge>
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