import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Users, Mail, Globe, Clock, Shield } from 'lucide-react';
import ActionButton from '../ui/ActionButton';

const CAMPAIGN_STEPS = [
  { id: 'basics', title: 'Basics', icon: Mail },
  { id: 'audience', title: 'Audience', icon: Users },
  { id: 'template', title: 'Template', icon: Globe },
  { id: 'landing', title: 'Landing Page', icon: Shield },
  { id: 'schedule', title: 'Schedule', icon: Clock },
  { id: 'tracking', title: 'Tracking & Training', icon: Shield },
  { id: 'review', title: 'Review & Launch', icon: Mail }
];

const mockCreateCampaign = async (campaignData) => {
  console.log('Creating campaign:', campaignData);
  await new Promise(resolve => setTimeout(resolve, 2000));
  return { 
    id: 'campaign-' + Date.now(),
    status: 'Scheduled',
    ...campaignData
  };
};

export default function CampaignBuilder({ onComplete, onCancel }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [campaignData, setCampaignData] = useState({
    name: '',
    provider: 'M365',
    from_name: 'IT Security Team',
    from_email: '',
    subject: '',
    template_id: '',
    landing_page_id: '',
    audience_group: '',
    audience_count: 0,
    send_window: {
      start: '',
      end: ''
    },
    throttle_per_min: 10,
    track_opens: true,
    track_clicks: true,
    record_submits: true,
    auto_training: true
  });

  const handleNext = () => {
    if (currentStep < CAMPAIGN_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleLaunch = async () => {
    const result = await mockCreateCampaign(campaignData);
    onComplete?.(result);
  };

  const renderStepContent = () => {
    const step = CAMPAIGN_STEPS[currentStep];

    switch (step.id) {
      case 'basics':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Campaign Basics</h3>
              <p className="text-slate-400">Set up the core details for your phishing simulation.</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-slate-300">Campaign Name</Label>
                <Input
                  value={campaignData.name}
                  onChange={(e) => setCampaignData({...campaignData, name: e.target.value})}
                  placeholder="Q1 2024 Security Awareness"
                  className="bg-slate-900/50 border-slate-700 text-white"
                />
              </div>
              
              <div>
                <Label className="text-slate-300">Email Provider</Label>
                <Select value={campaignData.provider} onValueChange={(value) => setCampaignData({...campaignData, provider: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M365">Microsoft 365 / Exchange Online</SelectItem>
                    <SelectItem value="GWS">Google Workspace / Gmail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">From Name</Label>
                  <Input
                    value={campaignData.from_name}
                    onChange={(e) => setCampaignData({...campaignData, from_name: e.target.value})}
                    placeholder="IT Security Team"
                    className="bg-slate-900/50 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">From Email</Label>
                  <Input
                    value={campaignData.from_email}
                    onChange={(e) => setCampaignData({...campaignData, from_email: e.target.value})}
                    placeholder="security@company.com"
                    className="bg-slate-900/50 border-slate-700 text-white"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-slate-300">Email Subject</Label>
                <Input
                  value={campaignData.subject}
                  onChange={(e) => setCampaignData({...campaignData, subject: e.target.value})}
                  placeholder="Urgent: Action Required - Update Your Password"
                  className="bg-slate-900/50 border-slate-700 text-white"
                />
              </div>
            </div>
          </div>
        );

      case 'audience':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Select Audience</h3>
              <p className="text-slate-400">Choose who will receive this phishing simulation.</p>
            </div>
            
            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-300">Target Group</Label>
                    <Select value={campaignData.audience_group} onValueChange={(value) => setCampaignData({...campaignData, audience_group: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target group..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-users">All Users</SelectItem>
                        <SelectItem value="finance">Finance Department</SelectItem>
                        <SelectItem value="hr">HR Department</SelectItem>
                        <SelectItem value="it">IT Department</SelectItem>
                        <SelectItem value="sales">Sales Team</SelectItem>
                        <SelectItem value="executives">Executive Team</SelectItem>
                        <SelectItem value="new-hires">New Hires (Last 90 Days)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {campaignData.audience_group && (
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-400 font-medium">Audience Preview</span>
                      </div>
                      <div className="text-sm text-slate-300">
                        <p>Selected group: <strong>{campaignData.audience_group.replace('-', ' ').toUpperCase()}</strong></p>
                        <p>Estimated recipients: <strong>47 users</strong></p>
                        <p>Suppression list exclusions: <strong>3 users</strong></p>
                        <p>Final count: <strong>44 users</strong></p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'template':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Choose Email Template</h3>
              <p className="text-slate-400">Select a phishing email template for your campaign.</p>
            </div>
            
            <div className="grid gap-4">
              {[
                { id: 'onedrive-share', name: 'OneDrive Share', category: 'File Sharing', risk: 'Medium', preview: 'A document has been shared with you...' },
                { id: 'teams-alert', name: 'Teams Security Alert', category: 'Security Alert', risk: 'High', preview: 'Suspicious activity detected on your account...' },
                { id: 'payroll-update', name: 'Payroll System Update', category: 'HR', risk: 'High', preview: 'Action required: Update your payroll information...' },
                { id: 'password-expire', name: 'Password Expiration', category: 'IT Alert', risk: 'Low', preview: 'Your password will expire in 3 days...' }
              ].map((template) => (
                <Card 
                  key={template.id}
                  className={`cursor-pointer border-2 transition-colors ${
                    campaignData.template_id === template.id ? 
                    'border-[#B00020] bg-[#B00020]/10' : 
                    'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                  }`}
                  onClick={() => setCampaignData({...campaignData, template_id: template.id})}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-white font-medium">{template.name}</h4>
                        <p className="text-sm text-slate-400 mb-2">{template.preview}</p>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">{template.category}</Badge>
                          <Badge className={`text-xs ${
                            template.risk === 'High' ? 'bg-red-500/20 text-red-400' :
                            template.risk === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {template.risk} Risk
                          </Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">Preview</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'landing':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Landing Page Configuration</h3>
              <p className="text-slate-400">Choose what happens when users click the phishing link.</p>
            </div>
            
            <div className="grid gap-4">
              {[
                { id: 'credential-harvest', name: 'Credential Harvest', description: 'Fake login page that captures dummy credentials' },
                { id: 'link-only', name: 'Link Only', description: 'Simple click tracking without additional interaction' },
                { id: 'file-download', name: 'File Download', description: 'Simulates downloading a malicious file' },
                { id: 'oauth-consent', name: 'OAuth Consent', description: 'Fake app permission request page' }
              ].map((page) => (
                <Card 
                  key={page.id}
                  className={`cursor-pointer border-2 transition-colors ${
                    campaignData.landing_page_id === page.id ? 
                    'border-[#B00020] bg-[#B00020]/10' : 
                    'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                  }`}
                  onClick={() => setCampaignData({...campaignData, landing_page_id: page.id})}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-white font-medium">{page.name}</h4>
                        <p className="text-sm text-slate-400">{page.description}</p>
                      </div>
                      <Button variant="ghost" size="sm">Preview</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card className="bg-green-900/20 border-green-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-medium">Safety Notice Enabled</span>
                </div>
                <p className="text-sm text-slate-300 mt-2">
                  All landing pages will immediately show a safety notice explaining this was a simulation.
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 'schedule':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Campaign Schedule</h3>
              <p className="text-slate-400">Set when and how fast to send the phishing emails.</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Start Time</Label>
                  <Input
                    type="datetime-local"
                    value={campaignData.send_window.start}
                    onChange={(e) => setCampaignData({
                      ...campaignData, 
                      send_window: {...campaignData.send_window, start: e.target.value}
                    })}
                    className="bg-slate-900/50 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">End Time (Optional)</Label>
                  <Input
                    type="datetime-local"
                    value={campaignData.send_window.end}
                    onChange={(e) => setCampaignData({
                      ...campaignData, 
                      send_window: {...campaignData.send_window, end: e.target.value}
                    })}
                    className="bg-slate-900/50 border-slate-700 text-white"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-slate-300">Sending Rate (emails per minute)</Label>
                <Select 
                  value={campaignData.throttle_per_min.toString()} 
                  onValueChange={(value) => setCampaignData({...campaignData, throttle_per_min: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 per minute (Slow)</SelectItem>
                    <SelectItem value="10">10 per minute (Normal)</SelectItem>
                    <SelectItem value="20">20 per minute (Fast)</SelectItem>
                    <SelectItem value="50">50 per minute (Very Fast)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-400 mt-1">
                  Estimated delivery time: ~{Math.ceil(44 / campaignData.throttle_per_min)} minutes
                </p>
              </div>
            </div>
          </div>
        );

      case 'tracking':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Tracking & Training</h3>
              <p className="text-slate-400">Configure what to track and how to respond to user actions.</p>
            </div>
            
            <div className="space-y-6">
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Tracking Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Track Email Opens</Label>
                      <p className="text-sm text-slate-400">Use tracking pixels to detect when emails are opened</p>
                    </div>
                    <Switch
                      checked={campaignData.track_opens}
                      onCheckedChange={(checked) => setCampaignData({...campaignData, track_opens: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Track Link Clicks</Label>
                      <p className="text-sm text-slate-400">Monitor when users click on phishing links</p>
                    </div>
                    <Switch
                      checked={campaignData.track_clicks}
                      onCheckedChange={(checked) => setCampaignData({...campaignData, track_clicks: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Record Form Submissions</Label>
                      <p className="text-sm text-slate-400">Track when users submit credentials (dummy data only)</p>
                    </div>
                    <Switch
                      checked={campaignData.record_submits}
                      onCheckedChange={(checked) => setCampaignData({...campaignData, record_submits: checked})}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Auto-Training</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <Label className="text-white">Assign Training Automatically</Label>
                      <p className="text-sm text-slate-400">Auto-assign security awareness training to users who click or submit</p>
                    </div>
                    <Switch
                      checked={campaignData.auto_training}
                      onCheckedChange={(checked) => setCampaignData({...campaignData, auto_training: checked})}
                    />
                  </div>
                  
                  {campaignData.auto_training && (
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <h5 className="text-blue-400 font-medium mb-2">Training Module</h5>
                      <p className="text-sm text-slate-300 mb-2">Spotting Phishing Emails (8 minutes)</p>
                      <p className="text-xs text-slate-400">
                        Users who click links or submit forms will automatically receive training with a friendly reminder email.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Review & Launch Campaign</h3>
              <p className="text-slate-400">Review your campaign settings before launching.</p>
            </div>
            
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Campaign Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Campaign Name:</span>
                    <span className="text-white ml-2">{campaignData.name || 'Untitled Campaign'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Provider:</span>
                    <span className="text-white ml-2">{campaignData.provider}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">From:</span>
                    <span className="text-white ml-2">{campaignData.from_name} &lt;{campaignData.from_email}&gt;</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Subject:</span>
                    <span className="text-white ml-2">{campaignData.subject || 'No subject set'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Recipients:</span>
                    <span className="text-white ml-2">44 users</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Send Rate:</span>
                    <span className="text-white ml-2">{campaignData.throttle_per_min} per minute</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-700">
                  <h5 className="text-white font-medium mb-2">Enabled Features</h5>
                  <div className="flex flex-wrap gap-2">
                    {campaignData.track_opens && <Badge className="bg-blue-500/20 text-blue-400">Open Tracking</Badge>}
                    {campaignData.track_clicks && <Badge className="bg-yellow-500/20 text-yellow-400">Click Tracking</Badge>}
                    {campaignData.record_submits && <Badge className="bg-red-500/20 text-red-400">Form Tracking</Badge>}
                    {campaignData.auto_training && <Badge className="bg-green-500/20 text-green-400">Auto Training</Badge>}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <ActionButton
                actionFn={handleLaunch}
                successToast="Campaign launched successfully!"
                className="bg-[#B00020] hover:bg-[#8B0000] px-8"
              >
                🚀 Launch Campaign
              </ActionButton>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Create Phishing Campaign</h2>
          <Badge variant="secondary">Step {currentStep + 1} of {CAMPAIGN_STEPS.length}</Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {CAMPAIGN_STEPS.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium ${
                index < currentStep ? 'bg-[#B00020] text-white' :
                index === currentStep ? 'bg-[#B00020]/20 text-[#B00020] border border-[#B00020]' :
                'bg-slate-700 text-slate-400'
              }`}>
                {index < currentStep ? '✓' : index + 1}
              </div>
              {index < CAMPAIGN_STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 ${
                  index < currentStep ? 'bg-[#B00020]' : 'bg-slate-700'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
        
        <div className="flex justify-between text-xs text-slate-400 mt-2">
          {CAMPAIGN_STEPS.map((step, index) => (
            <span key={step.id} className={index === currentStep ? 'text-[#B00020] font-medium' : ''}>
              {step.title}
            </span>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-8">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={currentStep === 0 ? onCancel : handlePrev}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          {currentStep === 0 ? 'Cancel' : 'Previous'}
        </Button>
        
        {currentStep < CAMPAIGN_STEPS.length - 1 && (
          <Button onClick={handleNext} className="bg-[#B00020] hover:bg-[#8B0000]">
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}