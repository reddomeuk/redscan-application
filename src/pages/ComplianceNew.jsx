import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, AssessmentRun, EvidenceSnapshot } from '@/api/entities';
import { ChevronLeft, ChevronRight, Shield, Users, Calendar, Database, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import ActionButton from '../components/ui/ActionButton';

const mockEvidenceCollection = async (sources) => {
  console.log('Collecting evidence from:', sources);
  // Simulate evidence collection
  await new Promise(resolve => setTimeout(resolve, 3000));
  return { 
    snapshotId: 'snapshot-' + Date.now(),
    itemsCollected: 127,
    sources: sources
  };
};

const mockCreateAssessment = async (data) => {
  console.log('Creating assessment:', data);
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const assessment = await AssessmentRun.create({
    framework: data.framework,
    scope: data.scope,
    owner_user_id: data.ownerId,
    target_submission_date: data.targetDate,
    evidence_snapshot_id: data.evidenceSnapshotId,
    organization_id: 'org-default'
  });
  
  return assessment;
};

export default function ComplianceNewPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    framework: '',
    scope: {
      whole_org: true,
      byod_included: false,
      home_workers_included: true
    },
    ownerId: '',
    targetDate: '',
    evidenceSources: {
      intune_devices: true,
      google_devices: false,
      mfa_coverage: true,
      patch_status: true,
      firewall_status: true,
      edr_coverage: true,
      cloud_misconfigs: false
    }
  });
  const [evidenceSnapshot, setEvidenceSnapshot] = useState(null);
  const navigate = useNavigate();

  const steps = [
    'Choose Audit Type',
    'Define Scope', 
    'Roles & Dates',
    'Evidence Sources',
    'Confirm & Create'
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleEvidenceCollection = async (sources) => {
    const result = await mockEvidenceCollection(sources);
    setEvidenceSnapshot(result);
    toast.success(`Evidence collected! ${result.itemsCollected} items gathered.`);
    return result;
  };

  const handleCreateAssessment = async () => {
    const assessment = await mockCreateAssessment({
      ...formData,
      evidenceSnapshotId: evidenceSnapshot?.snapshotId
    });
    
    toast.success('Assessment created successfully!');
    navigate(createPageUrl(`Compliance?run=${assessment.id}`));
    return assessment;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Choose Your Audit Type</h2>
              <p className="text-slate-400">Select the type of compliance assessment you want to run.</p>
            </div>
            
            <div className="grid gap-4">
              <Card 
                className={`cursor-pointer border-2 ${formData.framework === 'CE' ? 'border-[#B00020] bg-[#B00020]/10' : 'border-slate-700 bg-slate-800/50'} hover:border-[#B00020]/50 transition-colors`}
                onClick={() => setFormData({...formData, framework: 'CE'})}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Shield className="w-8 h-8 text-[#B00020] flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Cyber Essentials (Self-Assessment)</h3>
                      <p className="text-slate-300 text-sm mb-3">
                        Answer questions about your security controls and practices. Perfect for demonstrating 
                        basic cyber hygiene to clients and insurers.
                      </p>
                      <div className="flex gap-2">
                        <Badge variant="secondary">Self-guided</Badge>
                        <Badge variant="secondary">~2 hours</Badge>
                        <Badge variant="secondary">Certificate ready</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer border-2 ${formData.framework === 'CE_PLUS' ? 'border-[#B00020] bg-[#B00020]/10' : 'border-slate-700 bg-slate-800/50'} hover:border-[#B00020]/50 transition-colors`}
                onClick={() => setFormData({...formData, framework: 'CE_PLUS'})}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Shield className="w-8 h-8 text-amber-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">CE Plus (Technical Verification Rehearsal)</h3>
                      <p className="text-slate-300 text-sm mb-3">
                        Practice run for the hands-on technical verification. We'll check your devices and 
                        systems the same way the official assessor will.
                      </p>
                      <div className="flex gap-2">
                        <Badge variant="secondary">Technical checks</Badge>
                        <Badge variant="secondary">~4 hours</Badge>
                        <Badge variant="secondary">Audit prep</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Define Assessment Scope</h2>
              <p className="text-slate-400">Choose what parts of your organization to include in this assessment.</p>
            </div>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white font-medium">Whole Organization</Label>
                    <p className="text-sm text-slate-400">Include all devices, users, and systems</p>
                  </div>
                  <Switch
                    checked={formData.scope.whole_org}
                    onCheckedChange={(checked) => setFormData({
                      ...formData, 
                      scope: {...formData.scope, whole_org: checked}
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white font-medium">Include BYOD/Personal Devices</Label>
                    <p className="text-sm text-slate-400">Personal devices that access company data</p>
                  </div>
                  <Switch
                    checked={formData.scope.byod_included}
                    onCheckedChange={(checked) => setFormData({
                      ...formData, 
                      scope: {...formData.scope, byod_included: checked}
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white font-medium">Include Home/Remote Workers</Label>
                    <p className="text-sm text-slate-400">Staff working from home or remote locations</p>
                  </div>
                  <Switch
                    checked={formData.scope.home_workers_included}
                    onCheckedChange={(checked) => setFormData({
                      ...formData, 
                      scope: {...formData.scope, home_workers_included: checked}
                    })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="p-4">
                <h4 className="text-white font-medium mb-2">Scope Preview</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Devices:</span>
                    <span className="text-white ml-2">~47 discovered</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Users:</span>
                    <span className="text-white ml-2">~23 active</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Cloud Apps:</span>
                    <span className="text-white ml-2">Microsoft 365, Google</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Networks:</span>
                    <span className="text-white ml-2">Office, VPN</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Roles & Timeline</h2>
              <p className="text-slate-400">Set ownership and target dates for this assessment.</p>
            </div>

            <div className="grid gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label className="text-white font-medium">Assessment Owner</Label>
                    <p className="text-sm text-slate-400 mb-2">Person responsible for completing this assessment</p>
                    <Select value={formData.ownerId} onValueChange={(value) => setFormData({...formData, ownerId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select owner..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current-user">Me (Current User)</SelectItem>
                        <SelectItem value="admin-1">Sarah Johnson (Admin)</SelectItem>
                        <SelectItem value="analyst-1">Mike Chen (Analyst)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white font-medium">
                      {formData.framework === 'CE' ? 'Target Submission Date' : 'Verification Window'}
                    </Label>
                    <p className="text-sm text-slate-400 mb-2">
                      {formData.framework === 'CE' ? 
                        'When do you plan to submit this assessment?' : 
                        'When will you run the technical verification?'
                      }
                    </p>
                    <Input
                      type="date"
                      value={formData.targetDate}
                      onChange={(e) => setFormData({...formData, targetDate: e.target.value})}
                      className="bg-slate-900/50 border-slate-700"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Evidence Sources</h2>
              <p className="text-slate-400">Choose what evidence to collect automatically for your assessment.</p>
            </div>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6 space-y-4">
                {Object.entries({
                  intune_devices: 'Microsoft Intune device compliance and policies',
                  google_devices: 'Google Workspace device management status',
                  mfa_coverage: 'Multi-factor authentication coverage across users',
                  patch_status: 'Operating system and software patch levels',
                  firewall_status: 'Firewall configuration and status on all devices',
                  edr_coverage: 'Endpoint detection and response (antivirus) coverage',
                  cloud_misconfigs: 'Cloud security configuration snapshots'
                }).map(([key, description]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <Label className="text-white font-medium capitalize">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Label>
                      <p className="text-sm text-slate-400">{description}</p>
                    </div>
                    <Switch
                      checked={formData.evidenceSources[key]}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        evidenceSources: {...formData.evidenceSources, [key]: checked}
                      })}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <ActionButton
                actionFn={() => handleEvidenceCollection(formData.evidenceSources)}
                isLongRunning={true}
                taskName="Collecting compliance evidence"
                successToast="Evidence collection completed!"
                className="bg-[#B00020] hover:bg-[#8B0000]"
                disabled={evidenceSnapshot !== null}
              >
                <Database className="w-4 h-4 mr-2" />
                {evidenceSnapshot ? 'Evidence Collected ✓' : 'Collect Evidence Now'}
              </ActionButton>
            </div>

            {evidenceSnapshot && (
              <Card className="bg-green-500/10 border-green-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-medium">Evidence Collection Complete</span>
                  </div>
                  <p className="text-sm text-slate-300">
                    Collected {evidenceSnapshot.itemsCollected} evidence items from {Object.values(formData.evidenceSources).filter(Boolean).length} sources.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Review & Create Assessment</h2>
              <p className="text-slate-400">Review your configuration and create the assessment run.</p>
            </div>

            <div className="grid gap-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Assessment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Framework:</span>
                      <span className="text-white ml-2">
                        {formData.framework === 'CE' ? 'Cyber Essentials' : 'CE Plus'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Scope:</span>
                      <span className="text-white ml-2">
                        {formData.scope.whole_org ? 'Whole Organization' : 'Partial'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Owner:</span>
                      <span className="text-white ml-2">Current User</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Target Date:</span>
                      <span className="text-white ml-2">{formData.targetDate || 'Not set'}</span>
                    </div>
                  </div>
                  
                  {evidenceSnapshot && (
                    <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-sm text-green-400">
                        ✓ Evidence snapshot ready ({evidenceSnapshot.itemsCollected} items)
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center">
              <ActionButton
                actionFn={handleCreateAssessment}
                successToast="Assessment created successfully!"
                className="bg-[#B00020] hover:bg-[#8B0000] px-8"
                disabled={!evidenceSnapshot}
                disabledReason={!evidenceSnapshot ? "Please collect evidence first" : ""}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Create Assessment
              </ActionButton>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E1E1E] via-[#2A2A2A] to-[#1E1E1E] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate(createPageUrl('Compliance'))}
              className="text-slate-400 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Compliance
            </Button>
            <Badge variant="secondary">
              Step {currentStep} of {steps.length}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            {steps.map((step, index) => (
              <React.Fragment key={step}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  index + 1 < currentStep ? 'bg-[#B00020] text-white' :
                  index + 1 === currentStep ? 'bg-[#B00020]/20 text-[#B00020] border border-[#B00020]' :
                  'bg-slate-700 text-slate-400'
                }`}>
                  {index + 1 < currentStep ? '✓' : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 ${
                    index + 1 < currentStep ? 'bg-[#B00020]' : 'bg-slate-700'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
          
          <div className="flex justify-between text-xs text-slate-400">
            {steps.map((step, index) => (
              <span key={step} className={`${index + 1 === currentStep ? 'text-[#B00020] font-medium' : ''}`}>
                {step}
              </span>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardContent className="p-8">
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          {currentStep < steps.length && (
            <Button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !formData.framework) ||
                (currentStep === 4 && !evidenceSnapshot)
              }
              className="bg-[#B00020] hover:bg-[#8B0000]"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}