import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Brain, Zap, BookOpen, CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react';
import ActionButton from '../ui/ActionButton';

const mockFixAction = async (controlType) => {
  console.log(`Applying fix for ${controlType}...`);
  await new Promise(resolve => setTimeout(resolve, 2000));
  return { success: true, message: `${controlType} has been configured successfully.` };
};

const AiGuidePanel = ({ currentQuestion, framework = 'CE' }) => {
  const [explainLikeImFive, setExplainLikeImFive] = useState(false);

  if (!currentQuestion) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6 text-center">
          <Brain className="w-12 h-12 text-[#B00020] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">AI Compliance Guide</h3>
          <p className="text-slate-400">Select a question to get personalized guidance and automated fixes.</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'fail': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return <HelpCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getExplanation = () => {
    if (explainLikeImFive) {
      return currentQuestion.eliExplanation || "This makes sure your computers are safe from bad people trying to get in.";
    }
    return currentQuestion.explanation || "This control helps protect your organization's digital assets.";
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700 sticky top-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#B00020]" />
            AI Guide
          </CardTitle>
          <div className="flex items-center gap-2 text-xs">
            <Label htmlFor="eli5-toggle" className="text-slate-400">ELI5</Label>
            <Switch 
              id="eli5-toggle"
              checked={explainLikeImFive} 
              onCheckedChange={setExplainLikeImFive}
              size="sm"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium text-white mb-2">What this means:</h4>
          <p className="text-sm text-slate-300">{getExplanation()}</p>
        </div>

        <div>
          <h4 className="font-medium text-white mb-2 flex items-center gap-2">
            Your status now:
            {getStatusIcon(currentQuestion.currentStatus?.status)}
          </h4>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <p className="text-sm text-slate-300 mb-2">
              {currentQuestion.currentStatus?.summary || "Status not available"}
            </p>
            {currentQuestion.currentStatus?.details && (
              <div className="text-xs text-slate-400">
                <p>{currentQuestion.currentStatus.details}</p>
              </div>
            )}
          </div>
        </div>

        {currentQuestion.canAutoFix && (
          <div className="space-y-3">
            <h4 className="font-medium text-white">Quick actions:</h4>
            {currentQuestion.fixOptions?.map((option, index) => (
              <ActionButton
                key={index}
                actionFn={() => mockFixAction(option.type)}
                successToast={`${option.name} applied successfully!`}
                variant="outline"
                className="w-full justify-start"
              >
                <Zap className="w-4 h-4 mr-2" />
                {option.name}
              </ActionButton>
            ))}
            
            <Button variant="ghost" className="w-full justify-start text-slate-400">
              <BookOpen className="w-4 h-4 mr-2" />
              Show me how (step-by-step)
            </Button>
          </div>
        )}

        <div>
          <h4 className="font-medium text-white mb-2">What this proves for {framework}:</h4>
          <p className="text-xs text-slate-400">
            {currentQuestion.ceMapping || "Demonstrates your organization follows security best practices."}
          </p>
        </div>

        {currentQuestion.needsImprovement && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            <h5 className="text-sm font-medium text-amber-400 mb-1">Suggested improvement:</h5>
            <p className="text-xs text-amber-300">
              {currentQuestion.improvementSuggestion}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AiGuidePanel;