import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AssessmentRun } from '@/api/entities';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Plus, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle,
  Brain,
  FileText,
  Users,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import FormRadioGroup from '../components/compliance/FormRadioGroup';
import AiGuidePanel from '../components/compliance/AiGuidePanel';
import { complianceStore } from '../components/compliance/ComplianceAnswerStore';
import ActionButton from '../components/ui/ActionButton';

// Mock CE questions data
const mockCEQuestions = [
  {
    id: 'A1.1',
    section: 'A1',
    text: 'Do you have a firewall configured between your network and the internet?',
    explanation: 'A firewall acts as a security barrier between your internal network and the internet, blocking unauthorized access attempts.',
    eliExplanation: 'Think of a firewall like a security guard at your building - it checks everyone trying to come in and only lets the good people through.',
    currentStatus: {
      status: 'pass',
      summary: '15/18 devices have firewall enabled',
      details: 'Most devices are protected, but 3 laptops need firewall activation'
    },
    canAutoFix: true,
    fixOptions: [
      { name: 'Enable Windows Firewall (via Intune)', type: 'firewall' },
      { name: 'Apply Firewall Baseline', type: 'baseline' }
    ],
    ceMapping: 'Demonstrates boundary protection (A1 - Boundary Firewalls)',
    needsImprovement: true,
    improvementSuggestion: 'Enable firewall on the 3 remaining laptops to achieve 100% coverage.'
  },
  {
    id: 'A2.1',
    section: 'A2',
    text: 'Do all users have unique user accounts with appropriate access permissions?',
    explanation: 'Each person should have their own login account with access only to the systems and data they need for their job.',
    eliExplanation: 'Everyone gets their own key that only opens the doors they need to do their work.',
    currentStatus: {
      status: 'partial',
      summary: '22/25 users have individual accounts',
      details: '3 shared accounts identified in finance team'
    },
    canAutoFix: false,
    ceMapping: 'Ensures access control and accountability (A2 - User Access Control)',
    needsImprovement: true,
    improvementSuggestion: 'Replace shared accounts with individual user accounts and implement proper access reviews.'
  }
];

const generateMockReport = async (framework, runId) => {
  console.log(`Generating ${framework} report for run ${runId}...`);
  await new Promise(resolve => setTimeout(resolve, 4000));
  return { 
    downloadUrl: `/reports/${framework.toLowerCase()}-assessment-${runId}.pdf`,
    itemCount: framework === 'CE' ? 47 : 23
  };
};

export default function CompliancePage() {
  const [assessmentRuns, setAssessmentRuns] = useState([]);
  const [currentRun, setCurrentRun] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answers, setAnswers] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const loadAssessmentRuns = async () => {
      try {
        const runs = await AssessmentRun.list();
        setAssessmentRuns(runs);
        
        // Set current run (most recent or from URL param)
        if (runs.length > 0) {
          setCurrentRun(runs[0]);
          setSelectedQuestion(mockCEQuestions[0]);
        }
      } catch (error) {
        console.error('Failed to load assessment runs:', error);
      }
    };
    
    loadAssessmentRuns();
  }, []);

  // Subscribe to answer store changes
  useEffect(() => {
    const unsubscribe = complianceStore.subscribe(() => {
      // Force re-render when answers change
      setAnswers({...complianceStore.answers});
    });
    return unsubscribe;
  }, []);

  const handleAnswerChange = (questionId, value) => {
    if (!currentRun) return;
    complianceStore.setAnswer(currentRun.framework, questionId, value);
  };

  const handleNoteChange = (questionId, note) => {
    if (!currentRun) return;
    const currentAnswer = complianceStore.getAnswer(currentRun.framework, questionId);
    complianceStore.setAnswer(currentRun.framework, questionId, currentAnswer.value, note);
  };

  const getQuestionAnswer = (questionId) => {
    if (!currentRun) return { value: '', note: '', saved: true };
    return complianceStore.getAnswer(currentRun.framework, questionId);
  };

  const calculateSectionScore = (sectionQuestions) => {
    let totalAnswered = 0;
    let passCount = 0;
    
    sectionQuestions.forEach(question => {
      const answer = getQuestionAnswer(question.id);
      if (answer.value && answer.value !== 'Not applicable') {
        totalAnswered++;
        if (answer.value === 'Yes') {
          passCount++;
        }
      }
    });
    
    return totalAnswered > 0 ? Math.round((passCount / totalAnswered) * 100) : 0;
  };

  const getOverallScore = () => {
    const allAnswered = mockCEQuestions.filter(q => {
      const answer = getQuestionAnswer(q.id);
      return answer.value && answer.value !== 'Not applicable';
    });
    
    const passCount = allAnswered.filter(q => {
      const answer = getQuestionAnswer(q.id);
      return answer.value === 'Yes';
    });
    
    return allAnswered.length > 0 ? Math.round((passCount.length / allAnswered.length) * 100) : 0;
  };

  if (!currentRun) {
    return (
      <div className="space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Compliance Center</h1>
            <p className="text-slate-400">Get certified and demonstrate your security posture.</p>
          </div>
          <Button 
            onClick={() => navigate(createPageUrl('ComplianceNew'))}
            className="bg-[#B00020] hover:bg-[#8B0000]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Start New Audit
          </Button>
        </header>
        
        <Card className="bg-slate-800/50 border-slate-700 text-center py-16">
          <CardContent>
            <Shield className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Active Assessments</h3>
            <p className="text-slate-400 mb-6">Start your first compliance assessment to demonstrate your security posture.</p>
            <Button 
              onClick={() => navigate(createPageUrl('ComplianceNew'))}
              className="bg-[#B00020] hover:bg-[#8B0000]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Start New Audit
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const overallScore = getOverallScore();
  const hasUnsavedChanges = complianceStore.hasUnsavedChanges(currentRun.framework);

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-white">Compliance Center</h1>
            {hasUnsavedChanges && (
              <Badge variant="secondary" className="bg-amber-500/20 text-amber-400">
                Unsaved changes
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Select value={currentRun?.id} onValueChange={(runId) => {
              const run = assessmentRuns.find(r => r.id === runId);
              setCurrentRun(run);
            }}>
              <SelectTrigger className="w-64 bg-slate-900/50 border-slate-700">
                <SelectValue placeholder="Select assessment run..." />
              </SelectTrigger>
              <SelectContent>
                {assessmentRuns.map(run => (
                  <SelectItem key={run.id} value={run.id}>
                    {run.framework} - {run.status} (Started {new Date(run.started_at).toLocaleDateString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge className={
              currentRun?.status === 'Draft' ? 'bg-slate-500/20 text-slate-400' :
              currentRun?.status === 'Submitted' ? 'bg-green-500/20 text-green-400' :
              'bg-blue-500/20 text-blue-400'
            }>
              {currentRun?.status}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => navigate(createPageUrl('ComplianceNew'))}
          >
            <Plus className="w-4 h-4 mr-2" />
            Start New Audit
          </Button>
          <ActionButton
            actionFn={() => generateMockReport(currentRun.framework, currentRun.id)}
            isLongRunning={true}
            taskName={`Generating ${currentRun.framework} assessment pack`}
            successToast="Assessment pack generated successfully!"
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Pack
          </ActionButton>
        </div>
      </header>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Overall Score</span>
              <Shield className="w-4 h-4 text-[#B00020]" />
            </div>
            <div className="text-2xl font-bold text-white">{overallScore}%</div>
            <Progress value={overallScore} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Completed</span>
              <CheckCircle className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {mockCEQuestions.filter(q => getQuestionAnswer(q.id).value).length}
            </div>
            <p className="text-xs text-slate-400">of {mockCEQuestions.length} questions</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">At Risk</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {mockCEQuestions.filter(q => {
                const answer = getQuestionAnswer(q.id);
                return answer.value === 'No' || answer.value === 'Partially';
              }).length}
            </div>
            <p className="text-xs text-slate-400">need attention</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Target Date</span>
              <Calendar className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-lg font-bold text-white">
              {currentRun.target_submission_date ? 
                new Date(currentRun.target_submission_date).toLocaleDateString() : 
                'Not set'
              }
            </div>
            <p className="text-xs text-slate-400">
              {currentRun.target_submission_date ? 
                `${Math.ceil((new Date(currentRun.target_submission_date) - new Date()) / (1000 * 60 * 60 * 24))} days left` : 
                'No deadline'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Questions List */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">
                {currentRun.framework === 'CE' ? 'Cyber Essentials Questions' : 'CE Plus Technical Checks'}
              </CardTitle>
              <CardDescription>
                Answer all questions to complete your assessment. AI guidance available on the right.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {mockCEQuestions.map((question) => {
                const answer = getQuestionAnswer(question.id);
                const isSelected = selectedQuestion?.id === question.id;
                
                return (
                  <div 
                    key={question.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      isSelected ? 
                        'border-[#B00020] bg-[#B00020]/10' : 
                        'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                    }`}
                    onClick={() => setSelectedQuestion(question)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">{question.id}</Badge>
                        {answer.value === 'Yes' && <CheckCircle className="w-4 h-4 text-green-400" />}
                        {(answer.value === 'No' || answer.value === 'Partially') && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                        {!answer.value && <HelpCircle className="w-4 h-4 text-slate-400" />}
                      </div>
                      {!answer.saved && (
                        <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 text-xs">
                          Saving...
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="text-white font-medium mb-3">{question.text}</h3>
                    
                    <FormRadioGroup
                      name={`question-${question.id}`}
                      value={answer.value}
                      onChange={(value) => handleAnswerChange(question.id, value)}
                      requiresNote={true}
                      note={answer.note}
                      onNoteChange={(note) => handleNoteChange(question.id, note)}
                      disabledReason={currentRun.status === 'Submitted' ? 'Assessment is submitted and read-only' : null}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* AI Guide Panel */}
        <div className="lg:col-span-1">
          <AiGuidePanel 
            currentQuestion={selectedQuestion} 
            framework={currentRun.framework}
          />
        </div>
      </div>
      
      {/* Submit Assessment */}
      {currentRun.status === 'Draft' && (
        <Card className="bg-gradient-to-r from-[#B00020]/20 to-[#8B0000]/20 border-[#B00020]/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Ready to Submit?</h3>
                <p className="text-slate-300">
                  Complete all required questions to generate your {currentRun.framework} assessment pack.
                </p>
              </div>
              <ActionButton
                actionFn={() => generateMockReport(currentRun.framework, currentRun.id)}
                isLongRunning={true}
                taskName="Generating final assessment pack"
                successToast="Assessment submitted successfully!"
                className="bg-[#B00020] hover:bg-[#8B0000]"
                disabled={overallScore < 80}
                disabledReason={overallScore < 80 ? "Complete more questions to reach submission threshold" : ""}
              >
                <FileText className="w-4 h-4 mr-2" />
                Review & Submit
              </ActionButton>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}