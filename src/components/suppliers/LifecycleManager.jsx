import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowRight, Clock, CheckCircle2, AlertTriangle, XCircle, 
  Calendar, User, FileText, Shield, Zap 
} from 'lucide-react';
import { toast } from 'sonner';
import { format, differenceInDays, isAfter, isBefore } from 'date-fns';

const LifecycleManager = ({ supplier, onUpdate }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionReason, setTransitionReason] = useState('');
  const [selectedStage, setSelectedStage] = useState(supplier.lifecycle_stage);

  const lifecycleStages = [
    { value: 'Draft', label: 'Draft', color: 'bg-slate-500/20 text-slate-400', icon: FileText },
    { value: 'Onboarding', label: 'Onboarding', color: 'bg-blue-500/20 text-blue-400', icon: Clock },
    { value: 'Active', label: 'Active', color: 'bg-green-500/20 text-green-400', icon: CheckCircle2 },
    { value: 'In Review', label: 'In Review', color: 'bg-yellow-500/20 text-yellow-400', icon: Shield },
    { value: 'Renewal Due', label: 'Renewal Due', color: 'bg-orange-500/20 text-orange-400', icon: Calendar },
    { value: 'Suspended', label: 'Suspended', color: 'bg-red-500/20 text-red-400', icon: AlertTriangle },
    { value: 'Terminated', label: 'Terminated', color: 'bg-slate-600/20 text-slate-500', icon: XCircle }
  ];

  const currentStage = lifecycleStages.find(s => s.value === supplier.lifecycle_stage);
  const CurrentIcon = currentStage?.icon || Clock;

  const getStageColor = (stage) => {
    return lifecycleStages.find(s => s.value === stage)?.color || 'bg-slate-500/20 text-slate-400';
  };

  const calculateDaysUntilExpiry = () => {
    if (!supplier.contract_end) return null;
    return differenceInDays(new Date(supplier.contract_end), new Date());
  };

  const calculateDaysInStage = () => {
    if (!supplier.stage_entered_at) return 0;
    return differenceInDays(new Date(), new Date(supplier.stage_entered_at));
  };

  const getAutomatedTransitions = () => {
    const transitions = [];
    const daysUntilExpiry = calculateDaysUntilExpiry();

    if (supplier.lifecycle_stage === 'Active' && daysUntilExpiry !== null) {
      if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
        transitions.push({
          target: 'Renewal Due',
          reason: `Contract expires in ${daysUntilExpiry} days`,
          automated: true,
          urgent: daysUntilExpiry <= 7
        });
      } else if (daysUntilExpiry <= 0) {
        transitions.push({
          target: 'Suspended',
          reason: 'Contract expired',
          automated: true,
          urgent: true
        });
      }
    }

    if (supplier.lifecycle_stage === 'Suspended' && calculateDaysInStage() >= 30) {
      transitions.push({
        target: 'Terminated',
        reason: 'Auto-terminate after 30 days of suspension',
        automated: true,
        urgent: true
      });
    }

    return transitions;
  };

  const generateAiRenewalRecommendation = async () => {
    setIsTransitioning(true);
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 1500));

    const riskScore = supplier.risk_score || 50;
    const hasExpiredDocs = supplier.documents?.some(d => 
      d.expiry_date && isBefore(new Date(d.expiry_date), new Date())
    );
    const hasHighRisk = riskScore >= 70;

    let decision = 'renew';
    let confidence = 0.8;
    let reasoning = 'Supplier demonstrates good security posture and compliance.';
    let conditions = [];

    if (hasHighRisk || hasExpiredDocs) {
      decision = hasHighRisk && hasExpiredDocs ? 'do_not_renew' : 'conditional_renew';
      confidence = hasHighRisk && hasExpiredDocs ? 0.9 : 0.6;
      reasoning = hasHighRisk 
        ? 'High risk score indicates significant security concerns.' 
        : 'Expired compliance documents require immediate attention.';
      
      if (decision === 'conditional_renew') {
        conditions = [
          hasExpiredDocs ? 'Update all expired compliance certificates' : '',
          hasHighRisk ? 'Address high-risk security findings' : '',
          'Provide updated security questionnaire responses'
        ].filter(Boolean);
      }
    }

    const aiRecommendation = {
      decision,
      confidence,
      reasoning,
      conditions,
      generated_at: new Date().toISOString()
    };

    await onUpdate(supplier.id, { ai_renewal_recommendation: aiRecommendation });
    setIsTransitioning(false);
    toast.success('AI renewal recommendation generated');
  };

  const handleStageTransition = async () => {
    if (selectedStage === supplier.lifecycle_stage) return;
    
    setIsTransitioning(true);
    const lifecycleTransition = {
      from_stage: supplier.lifecycle_stage,
      to_stage: selectedStage,
      transitioned_at: new Date().toISOString(),
      reason: transitionReason,
      triggered_by: 'manual'
    };

    const updates = {
      lifecycle_stage: selectedStage,
      status: selectedStage, // Keep status in sync
      stage_entered_at: new Date().toISOString(),
      lifecycle_history: [
        ...(supplier.lifecycle_history || []),
        lifecycleTransition
      ]
    };

    // Set next review date for active suppliers
    if (selectedStage === 'Active' && !supplier.next_review_date) {
      const nextReview = new Date();
      nextReview.setFullYear(nextReview.getFullYear() + 1);
      updates.next_review_date = nextReview.toISOString().split('T')[0];
    }

    await onUpdate(supplier.id, updates);
    setIsTransitioning(false);
    setTransitionReason('');
    toast.success(`Supplier transitioned to ${selectedStage}`);
  };

  const automatedTransitions = getAutomatedTransitions();
  const daysUntilExpiry = calculateDaysUntilExpiry();
  const daysInStage = calculateDaysInStage();

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <CurrentIcon className="w-5 h-5" />
            Lifecycle Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className={getStageColor(supplier.lifecycle_stage)}>
                {supplier.lifecycle_stage}
              </Badge>
              <span className="text-slate-400 text-sm">
                {daysInStage} days in current stage
              </span>
            </div>
            {daysUntilExpiry !== null && (
              <div className="text-right">
                <div className="text-white font-medium">
                  {daysUntilExpiry > 0 ? `${daysUntilExpiry} days until expiry` : 'Contract expired'}
                </div>
                <div className="text-slate-400 text-sm">
                  {supplier.contract_end ? format(new Date(supplier.contract_end), 'MMM dd, yyyy') : 'No end date'}
                </div>
              </div>
            )}
          </div>

          {automatedTransitions.length > 0 && (
            <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <h4 className="text-yellow-300 font-medium mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Automated Transitions Available
              </h4>
              {automatedTransitions.map((transition, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="text-yellow-100 text-sm">
                    {transition.reason} → <strong>{transition.target}</strong>
                  </div>
                  {transition.urgent && (
                    <Badge className="bg-red-500/20 text-red-400 text-xs">Urgent</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Transition */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Manual Stage Transition</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedStage} onValueChange={setSelectedStage}>
            <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {lifecycleStages.map(stage => (
                <SelectItem key={stage.value} value={stage.value} className="text-white">
                  {stage.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Textarea
            placeholder="Reason for transition..."
            value={transitionReason}
            onChange={(e) => setTransitionReason(e.target.value)}
            className="bg-slate-900/50 border-slate-700 text-white"
          />
          
          <Button 
            onClick={handleStageTransition}
            disabled={isTransitioning || selectedStage === supplier.lifecycle_stage || !transitionReason}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isTransitioning ? 'Processing...' : 'Update Stage'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* AI Renewal Recommendation */}
      {supplier.lifecycle_stage === 'Renewal Due' && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              AI Renewal Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {supplier.ai_renewal_recommendation ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge className={
                    supplier.ai_renewal_recommendation.decision === 'renew' ? 'bg-green-500/20 text-green-400' :
                    supplier.ai_renewal_recommendation.decision === 'conditional_renew' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }>
                    {supplier.ai_renewal_recommendation.decision.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <span className="text-slate-400 text-sm">
                    {Math.round(supplier.ai_renewal_recommendation.confidence * 100)}% confidence
                  </span>
                </div>
                <p className="text-slate-300 text-sm mb-3">
                  {supplier.ai_renewal_recommendation.reasoning}
                </p>
                {supplier.ai_renewal_recommendation.conditions?.length > 0 && (
                  <div>
                    <h5 className="text-white font-medium text-sm mb-2">Conditions for Renewal:</h5>
                    <ul className="list-disc list-inside space-y-1">
                      {supplier.ai_renewal_recommendation.conditions.map((condition, index) => (
                        <li key={index} className="text-slate-300 text-sm">{condition}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <Button 
                onClick={generateAiRenewalRecommendation}
                disabled={isTransitioning}
                variant="outline"
                className="border-purple-500/50 text-purple-300"
              >
                <Shield className="w-4 h-4 mr-2" />
                {isTransitioning ? 'Analyzing...' : 'Generate AI Recommendation'}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Lifecycle History */}
      {supplier.lifecycle_history?.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Lifecycle History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {supplier.lifecycle_history.slice(-5).reverse().map((transition, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-slate-300">
                      <strong>{transition.from_stage}</strong> → <strong>{transition.to_stage}</strong>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {transition.triggered_by}
                    </Badge>
                  </div>
                  <div className="text-slate-400 text-sm">
                    {format(new Date(transition.transitioned_at), 'MMM dd, yyyy')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LifecycleManager;