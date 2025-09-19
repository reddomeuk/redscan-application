import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuestionnaireResponse } from '@/api/entities';
import PortalLayout from '../components/suppliers/portal/PortalLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

const questions = [
  { id: 'data_handling', section: 'Data Handling', text: 'What type of data will you be handling?', type: 'select', options: ['None', 'Non-sensitive', 'PII', 'Financial'] },
  { id: 'iso_cert', section: 'Compliance', text: 'Are you ISO 27001 certified?', type: 'select', options: ['Yes', 'No', 'In Progress'] },
  { id: 'soc2_status', section: 'Compliance', text: 'What is your SOC 2 compliance status?', type: 'select', options: ['None', 'Type I', 'Type II'] },
  { id: 'incident_response', section: 'Security', text: 'Do you have a documented incident response plan?', type: 'select', options: ['Yes', 'No'] },
  { id: 'security_contact', section: 'Security', text: 'Please provide a security contact email.', type: 'email' },
  { id: 'pen_test', section: 'Security', text: 'When was your last third-party penetration test?', type: 'date' },
  { id: 'notes', section: 'General', text: 'Any additional notes or comments?', type: 'textarea' },
];

export default function SupplierPortalQuestionnaire() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [questionnaire, setQuestionnaire] = useState(null);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('supplierPortalUser'));
    if (!loggedInUser || !loggedInUser.supplier_id) {
      navigate('/SupplierPortalLogin');
      return;
    }
    setUser(loggedInUser);

    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await QuestionnaireResponse.filter({ supplier_id: loggedInUser.supplier_id });
        const existingQuestionnaire = data[0];
        setQuestionnaire(existingQuestionnaire);
        if (existingQuestionnaire) {
          setResponses(existingQuestionnaire.responses || {});
        }
      } catch (error) {
        toast.error("Failed to load questionnaire.");
      }
      setLoading(false);
    };
    fetchData();
  }, [navigate]);
  
  const handleResponseChange = (id, value) => {
    setResponses(prev => ({...prev, [id]: value}));
  };
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const dataToSave = {
        supplier_id: user.supplier_id,
        organization_id: user.organization_id,
        questionnaire_version: questionnaire?.questionnaire_version || '1.0',
        responses,
        status: 'Submitted',
        submitted_at: new Date().toISOString()
      };

      if (questionnaire?.id) {
        await QuestionnaireResponse.update(questionnaire.id, dataToSave);
      } else {
        await QuestionnaireResponse.create(dataToSave);
      }
      toast.success('Questionnaire submitted successfully!');
      const updatedData = await QuestionnaireResponse.filter({ supplier_id: user.supplier_id });
      setQuestionnaire(updatedData[0]);

    } catch (error) {
      toast.error('Failed to submit questionnaire.');
    }
    setIsSubmitting(false);
  };

  const sections = [...new Set(questions.map(q => q.section))];
  const isReadOnly = questionnaire?.status && ['Submitted', 'In Review', 'Accepted'].includes(questionnaire.status);

  return (
    <PortalLayout>
      <h1 className="text-3xl font-bold mb-2">Due Diligence Questionnaire</h1>
      <p className="text-slate-400 mb-6">Please complete the following questions to help us assess your security and compliance posture.</p>

      {isReadOnly && (
        <div className={`p-4 mb-6 rounded-lg flex items-center gap-3 ${questionnaire.status === 'Accepted' ? 'bg-green-900/30 text-green-300' : 'bg-yellow-900/30 text-yellow-300'}`}>
          {questionnaire.status === 'Accepted' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          This questionnaire has been submitted and is currently "{questionnaire.status}". To make changes, please contact your account manager.
        </div>
      )}

      {questionnaire?.status === 'Needs Clarification' && (
        <div className="p-4 mb-6 rounded-lg bg-orange-900/30 text-orange-300">
          <h3 className="font-bold mb-2 flex items-center gap-2"><AlertTriangle />Action Required</h3>
          <p>Feedback from our team: "{questionnaire.feedback}". Please update your responses and resubmit.</p>
        </div>
      )}

      <div className="space-y-8">
        {sections.map(section => (
          <Card key={section} className="bg-slate-800/50 border-slate-700">
            <CardHeader><CardTitle>{section}</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              {questions.filter(q => q.section === section).map(q => (
                <div key={q.id}>
                  <Label htmlFor={q.id} className="text-slate-300">{q.text}</Label>
                  {q.type === 'select' && (
                    <Select value={responses[q.id] || ''} onValueChange={(val) => handleResponseChange(q.id, val)} disabled={isReadOnly}>
                      <SelectTrigger id={q.id} className="bg-slate-900/50 border-slate-700 mt-2"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        {q.options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                  {q.type === 'email' && <Input id={q.id} type="email" value={responses[q.id] || ''} onChange={e => handleResponseChange(q.id, e.target.value)} disabled={isReadOnly} className="bg-slate-900/50 border-slate-700 mt-2" />}
                  {q.type === 'date' && <Input id={q.id} type="date" value={responses[q.id] || ''} onChange={e => handleResponseChange(q.id, e.target.value)} disabled={isReadOnly} className="bg-slate-900/50 border-slate-700 mt-2" />}
                  {q.type === 'textarea' && <Textarea id={q.id} value={responses[q.id] || ''} onChange={e => handleResponseChange(q.id, e.target.value)} disabled={isReadOnly} className="bg-slate-900/50 border-slate-700 mt-2" />}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        {!isReadOnly && (
          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-[var(--color-primary)] hover:bg-red-700">
              {isSubmitting ? 'Submitting...' : 'Submit for Review'}
            </Button>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}