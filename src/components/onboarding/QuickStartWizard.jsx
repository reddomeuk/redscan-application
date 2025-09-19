
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Shield, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Smartphone,
  Cloud,
  Users,
  Building2,
  Award,
  Bot,
  Play,
  Sparkles,
  Zap,
  Globe,
  Lock,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { Organization, Device, Supplier } from '@/api/entities';

const WIZARD_STEPS = [
  { id: 1, title: 'Connect Accounts', icon: Globe, required: true },
  { id: 2, title: 'Secure Endpoints', icon: Smartphone, required: true },
  { id: 3, title: 'Secure SaaS & Apps', icon: Shield, required: true },
  { id: 4, title: 'Cloud & Servers', icon: Cloud, required: false },
  { id: 5, title: 'Supplier Setup', icon: Building2, required: false },
  { id: 6, title: 'Security Score', icon: Award, required: true },
  { id: 7, title: 'Next Steps', icon: CheckCircle2, required: true }
];

const ConnectAccountsStep = ({ onNext, wizardData, updateWizardData }) => {
  const [connections, setConnections] = useState({
    google_workspace: false,
    microsoft365: false,
    aws: false,
    azure: false,
    gcp: false
  });

  const handleConnect = async (service) => {
    toast.info(`Connecting to ${service}...`);
    setTimeout(() => {
      setConnections(prev => ({ ...prev, [service]: true }));
      updateWizardData({ connections: { ...connections, [service]: true } });
      toast.success(`${service} connected successfully!`);
    }, 2000);
  };

  const canProceed = connections.google_workspace || connections.microsoft365;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Connect Your Business Accounts</h2>
        <p className="text-slate-400">Let's connect your business systems so we can secure them for you.</p>
      </div>

      <div className="space-y-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Google Workspace</h3>
                  <p className="text-sm text-slate-400">Gmail, Drive, Calendar, Meet</p>
                </div>
              </div>
              {connections.google_workspace ? (
                <Badge className="bg-green-500/20 text-green-400">Connected</Badge>
              ) : (
                <Button 
                  onClick={() => handleConnect('google_workspace')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Connect
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Microsoft 365</h3>
                  <p className="text-sm text-slate-400">Outlook, Teams, SharePoint, OneDrive</p>
                </div>
              </div>
              {connections.microsoft365 ? (
                <Badge className="bg-green-500/20 text-green-400">Connected</Badge>
              ) : (
                <Button 
                  onClick={() => handleConnect('microsoft365')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Connect
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="border-t border-slate-700 pt-4">
          <h3 className="text-white font-medium mb-3">Optional Cloud Providers</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {['aws', 'azure', 'gcp'].map(service => (
              <Card key={service} className="bg-slate-800/30 border-slate-700">
                <CardContent className="p-3 text-center">
                  <h4 className="text-white font-medium capitalize">{service === 'gcp' ? 'Google Cloud' : service}</h4>
                  {connections[service] ? (
                    <Badge className="bg-green-500/20 text-green-400 mt-2">Connected</Badge>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleConnect(service)}
                      className="mt-2 border-slate-600"
                    >
                      Connect
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={onNext}
          disabled={!canProceed}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Next Step
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

const SecureEndpointsStep = ({ onNext, onPrev, wizardData, updateWizardData }) => {
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [deviceStats, setDeviceStats] = useState({
    total: 10,
    secured: 0,
    policies: ['BitLocker Encryption', 'Windows Defender', 'Firewall', 'Auto Updates', 'Screen Lock']
  });

  const handleSecureDevices = async () => {
    setApplying(true);
    toast.info('Applying security policies to your devices...');
    
    // Simulate policy application
    for (let i = 0; i <= 7; i++) {
      setTimeout(() => {
        setDeviceStats(prev => ({ ...prev, secured: i }));
      }, i * 500);
    }
    
    setTimeout(() => {
      setApplying(false);
      setApplied(true);
      updateWizardData({ endpoints: { secured: 7, total: 10 } });
      toast.success('Security policies applied successfully!');
    }, 4000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Secure Your Endpoints</h2>
        <p className="text-slate-400">Let's protect your laptops, phones, and tablets with industry-standard security policies.</p>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-white">{deviceStats.total}</div>
            <div className="text-slate-400">Devices Detected</div>
          </div>

          {!applied && !applying && (
            <div className="space-y-4">
              <h3 className="font-medium text-white">Security Policies to Apply:</h3>
              <div className="space-y-2">
                {deviceStats.policies.map((policy, index) => (
                  <div key={index} className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    {policy}
                  </div>
                ))}
              </div>
              <Button 
                onClick={handleSecureDevices}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Lock className="w-4 h-4 mr-2" />
                Secure My Devices
              </Button>
            </div>
          )}

          {applying && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-xl font-bold text-white">{deviceStats.secured}/{deviceStats.total}</div>
                <div className="text-slate-400">Devices Secured</div>
              </div>
              <Progress value={(deviceStats.secured / deviceStats.total) * 100} className="h-3" />
              <div className="text-center text-slate-400">Applying security policies...</div>
            </div>
          )}

          {applied && (
            <div className="text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto" />
              <div>
                <div className="text-xl font-bold text-white">7/10 Devices Secured</div>
                <div className="text-slate-400">3 devices need manual attention</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} className="border-slate-600">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button 
          onClick={onNext}
          disabled={applying}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Next Step
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

const SecureSaasStep = ({ onNext, onPrev, wizardData, updateWizardData }) => {
  const [apps, setApps] = useState([
    { name: 'Google Workspace', users: 15, mfaCovered: 10, canAutoFix: true, secured: false },
    { name: 'Salesforce', users: 8, mfaCovered: 3, canAutoFix: false, secured: false },
    { name: 'Slack', users: 15, mfaCovered: 15, canAutoFix: true, secured: true }
  ]);

  const [applying, setApplying] = useState(false);

  const handleSecureApps = async () => {
    setApplying(true);
    toast.info('Applying MFA and security settings...');
    
    setTimeout(() => {
      setApps(prev => prev.map(app => ({
        ...app,
        secured: app.canAutoFix ? true : app.secured,
        mfaCovered: app.canAutoFix ? app.users : app.mfaCovered
      })));
      setApplying(false);
      updateWizardData({ apps: { totalUsers: 38, mfaCovered: 33 } });
      toast.success('SaaS security settings applied!');
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Secure Your SaaS & Apps</h2>
        <p className="text-slate-400">Enable multi-factor authentication and secure settings across your business apps.</p>
      </div>

      <div className="space-y-4">
        {apps.map((app, index) => (
          <Card key={index} className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">{app.name}</h3>
                  <p className="text-sm text-slate-400">
                    MFA: {app.mfaCovered}/{app.users} users
                  </p>
                </div>
                {app.secured ? (
                  <Badge className="bg-green-500/20 text-green-400">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Secured
                  </Badge>
                ) : app.canAutoFix ? (
                  <Badge className="bg-yellow-500/20 text-yellow-400">Can Auto-Fix</Badge>
                ) : (
                  <Badge className="bg-red-500/20 text-red-400">Manual Setup Needed</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button 
        onClick={handleSecureApps}
        disabled={applying}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        {applying ? 'Applying Security Settings...' : 'Secure All Apps'}
        <Shield className="w-4 h-4 ml-2" />
      </Button>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} className="border-slate-600">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button 
          onClick={onNext}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Next Step
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

const SecurityScoreStep = ({ onNext, onPrev, wizardData }) => {
  const overallScore = 72;
  const scoreBreakdown = {
    endpoints: 70,
    saas: 80,
    cloud: 85,
    suppliers: 60,
    compliance: 65
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreStatus = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Work';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Your First Security Score!</h2>
        <p className="text-slate-400">Here's how secure your business is right now.</p>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-8 text-center">
          <div className={`text-6xl font-bold ${getScoreColor(overallScore)} mb-2`}>
            {overallScore}
          </div>
          <div className="text-xl text-white mb-1">{getScoreStatus(overallScore)}</div>
          <div className="text-slate-400">Overall Security Health</div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="font-medium text-white">Security Breakdown:</h3>
        {Object.entries(scoreBreakdown).map(([area, score]) => (
          <div key={area} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
            <span className="text-slate-300 capitalize">{area.replace('_', ' ')}</span>
            <span className={`font-bold ${getScoreColor(score)}`}>{score}%</span>
          </div>
        ))}
      </div>

      <Card className="bg-purple-900/20 border-purple-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Bot className="w-6 h-6 text-purple-400 mt-1" />
            <div>
              <h4 className="font-medium text-white mb-2">AI Analysis</h4>
              <p className="text-slate-300 text-sm">
                Great progress! You've secured {wizardData.endpoints?.secured || 7}/10 endpoints and improved MFA coverage. 
                Your biggest quick win: enable MFA for the remaining 5 users in Salesforce.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} className="border-slate-600">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button 
          onClick={onNext}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Next Step
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

const NextStepsStep = ({ onComplete, onPrev }) => {
  const [tasks] = useState([
    { id: 1, title: 'Enable MFA for Salesforce users', impact: 'High', effort: 'Low', done: false },
    { id: 2, title: 'Update 3 Windows devices', impact: 'Medium', effort: 'Medium', done: false },
    { id: 3, title: 'Enable AWS CloudTrail', impact: 'High', effort: 'Low', done: false }
  ]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Your Security Action Plan</h2>
        <p className="text-slate-400">Here are the top 3 things to do next for maximum security improvement.</p>
      </div>

      <div className="space-y-4">
        {tasks.map(task => (
          <Card key={task.id} className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-white">{task.title}</h3>
                  <div className="flex gap-2 mt-1">
                    <Badge className={task.impact === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}>
                      {task.impact} Impact
                    </Badge>
                    <Badge className="bg-blue-500/20 text-blue-400">
                      {task.effort} Effort
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Fix Now
                  </Button>
                  <Button size="sm" variant="outline" className="border-slate-600">
                    Later
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-900/20 border-blue-500/30">
        <CardContent className="p-6 text-center">
          <Award className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Ready for Compliance!</h3>
          <p className="text-slate-300 mb-4">
            You're 60% ready for Cyber Essentials Plus certification. 
            We can generate your evidence pack anytime.
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Generate CE+ Report
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} className="border-slate-600">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button 
          onClick={onComplete}
          className="bg-green-600 hover:bg-green-700"
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Complete Setup
        </Button>
      </div>
    </div>
  );
};

export default function QuickStartWizard({ isOpen, onClose, onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState({});

  const updateWizardData = (data) => {
    setWizardData(prev => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    toast.success('Quick Start setup completed!');
    onComplete(wizardData);
    onClose();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <ConnectAccountsStep onNext={handleNext} wizardData={wizardData} updateWizardData={updateWizardData} />;
      case 2:
        return <SecureEndpointsStep onNext={handleNext} onPrev={handlePrev} wizardData={wizardData} updateWizardData={updateWizardData} />;
      case 3:
        return <SecureSaasStep onNext={handleNext} onPrev={handlePrev} wizardData={wizardData} updateWizardData={updateWizardData} />;
      case 4:
        return (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-white">Cloud & Servers (Optional)</h2>
            <p className="text-slate-400">We'll skip this for now since you haven't connected any cloud providers.</p>
            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePrev} className="border-slate-600">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button onClick={handleNext} className="bg-purple-600 hover:bg-purple-700">
                Skip to Score
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-white">Supplier Setup (Optional)</h2>
            <p className="text-slate-400">You can add suppliers later from the Suppliers page.</p>
            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePrev} className="border-slate-600">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button onClick={handleNext} className="bg-purple-600 hover:bg-purple-700">
                Skip to Score
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );
      case 6:
        return <SecurityScoreStep onNext={handleNext} onPrev={handlePrev} wizardData={wizardData} />;
      case 7:
        return <NextStepsStep onComplete={handleComplete} onPrev={handlePrev} />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  const currentStepData = WIZARD_STEPS.find(step => step.id === currentStep);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Quick Start Wizard</h1>
                <p className="text-slate-400">Secure your business in under 30 minutes</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Progress value={(currentStep / WIZARD_STEPS.length) * 100} className="flex-1 mr-4" />
            <span className="text-sm text-slate-400">{currentStep}/{WIZARD_STEPS.length}</span>
          </div>
          
          <div className="flex items-center gap-4 mt-4">
            {currentStepData && (
              <>
                <currentStepData.icon className="w-5 h-5 text-purple-400" />
                <span className="font-medium text-white">{currentStepData.title}</span>
              </>
            )}
          </div>
        </div>

        <div className="p-6">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
