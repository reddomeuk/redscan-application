import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Brain, AlertTriangle, CheckCircle2, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

const SmartQuestionnaire = ({ supplier, questionnaire, onSubmit }) => {
  const [responses, setResponses] = useState(questionnaire?.responses || {});
  const [aiSuggestions, setAiSuggestions] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const questions = [
    {
      id: 'data_handling',
      question: 'What type of data will this supplier handle?',
      type: 'select',
      options: ['none', 'public', 'internal', 'pii', 'financial'],
      critical: true
    },
    {
      id: 'iso_cert',
      question: 'Does the supplier have ISO 27001 certification?',
      type: 'select',
      options: ['yes', 'no', 'in_progress'],
      critical: true
    },
    {
      id: 'soc2_status',
      question: 'SOC 2 compliance status?',
      type: 'select',
      options: ['type_2', 'type_1', 'none', 'unknown'],
      critical: true
    },
    {
      id: 'access_method',
      question: 'How will the supplier access our systems?',
      type: 'select',
      options: ['vpn', 'sso', 'direct', 'none'],
      critical: false
    },
    {
      id: 'backup_procedures',
      question: 'Describe their data backup and recovery procedures',
      type: 'textarea',
      critical: false
    },
    {
      id: 'incident_response',
      question: 'Do they have a documented incident response plan?',
      type: 'select',
      options: ['yes', 'no', 'basic'],
      critical: true
    }
  ];

  const generateAiSuggestions = async () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const suggestions = {};
    
    // Generate suggestions based on supplier type and documents
    if (supplier.type === 'software' && !supplier.documents?.some(d => d.type === 'SOC 2')) {
      suggestions.soc2_status = {
        suggested: 'none',
        confidence: 0.8,
        reason: 'No SOC 2 documentation found in supplier files'
      };
    }
    
    if (supplier.documents?.some(d => d.type === 'ISO 27001')) {
      suggestions.iso_cert = {
        suggested: 'yes',
        confidence: 0.9,
        reason: 'ISO 27001 certificate detected in uploaded documents'
      };
    }

    if (supplier.type === 'contractor') {
      suggestions.access_method = {
        suggested: 'vpn',
        confidence: 0.7,
        reason: 'VPN access typically required for contractor engagements'
      };
    }

    setAiSuggestions(suggestions);
    setIsAnalyzing(false);
    toast.success('AI suggestions generated');
  };

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const applySuggestion = (questionId, suggestion) => {
    setResponses(prev => ({ ...prev, [questionId]: suggestion.suggested }));
    toast.success('AI suggestion applied');
  };

  const getRiskLevel = (questionId, value) => {
    const riskRules = {
      data_handling: { pii: 'high', financial: 'high', internal: 'medium' },
      iso_cert: { no: 'high', in_progress: 'medium' },
      soc2_status: { none: 'high', unknown: 'medium' },
      incident_response: { no: 'high', basic: 'medium' }
    };
    return riskRules[questionId]?.[value] || 'low';
  };

  const getRiskColor = (level) => {
    switch(level) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      default: return 'text-green-400';
    }
  };

  const handleSubmit = () => {
    const questData = {
      supplier_id: supplier.id,
      responses,
      submitted_at: new Date().toISOString(),
      organization_id: supplier.organization_id
    };
    onSubmit(questData);
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>Due Diligence Questionnaire</span>
          <div className="flex gap-2">
            <Button 
              onClick={generateAiSuggestions} 
              disabled={isAnalyzing}
              variant="outline" 
              size="sm"
              className="border-purple-500/50 text-purple-300"
            >
              <Brain className="w-4 h-4 mr-2" />
              {isAnalyzing ? 'Analyzing...' : 'AI Suggestions'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {questions.map(question => (
          <div key={question.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-white font-medium">
                {question.question}
                {question.critical && <Badge className="ml-2 bg-red-500/20 text-red-400">Critical</Badge>}
              </label>
              {aiSuggestions[question.id] && (
                <Button
                  onClick={() => applySuggestion(question.id, aiSuggestions[question.id])}
                  variant="ghost"
                  size="sm"
                  className="text-purple-300 hover:text-purple-200"
                >
                  <Lightbulb className="w-4 h-4 mr-1" />
                  Apply AI
                </Button>
              )}
            </div>

            {question.type === 'select' ? (
              <Select 
                value={responses[question.id] || ''} 
                onValueChange={(value) => handleResponseChange(question.id, value)}
              >
                <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  {question.options.map(option => (
                    <SelectItem key={option} value={option} className="capitalize">
                      {option.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Textarea
                value={responses[question.id] || ''}
                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                className="bg-slate-900/50 border-slate-700 text-white"
                placeholder="Enter details..."
              />
            )}

            {responses[question.id] && question.critical && (
              <div className="flex items-center gap-2">
                {getRiskLevel(question.id, responses[question.id]) === 'high' && (
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                )}
                {getRiskLevel(question.id, responses[question.id]) === 'low' && (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                )}
                <span className={`text-sm ${getRiskColor(getRiskLevel(question.id, responses[question.id]))}`}>
                  {getRiskLevel(question.id, responses[question.id]).charAt(0).toUpperCase() + getRiskLevel(question.id, responses[question.id]).slice(1)} risk response
                </span>
              </div>
            )}

            {aiSuggestions[question.id] && (
              <div className="p-2 bg-purple-900/20 border border-purple-500/30 rounded-md">
                <p className="text-purple-200 text-sm">
                  <Brain className="w-4 h-4 inline mr-1" />
                  AI suggests: <strong className="capitalize">{aiSuggestions[question.id].suggested.replace('_', ' ')}</strong>
                </p>
                <p className="text-purple-300 text-xs mt-1">{aiSuggestions[question.id].reason}</p>
              </div>
            )}
          </div>
        ))}

        <div className="flex justify-end pt-4">
          <Button onClick={handleSubmit} className="bg-[var(--color-primary)] hover:bg-red-700">
            Submit Questionnaire
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartQuestionnaire;