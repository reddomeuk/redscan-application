
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Supplier, SupplierDocument, QuestionnaireResponse } from '@/api/entities';
import PortalLayout from '../components/suppliers/portal/PortalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, CheckCircle2, Clock, FileText, MessageSquare, FileQuestion } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

const statusColors = {
  Draft: 'bg-slate-500/20 text-slate-400',
  Onboarding: 'bg-blue-500/20 text-blue-400',
  Active: 'bg-green-500/20 text-green-400',
  'In Review': 'bg-yellow-500/20 text-yellow-400',
  'Renewal Due': 'bg-orange-500/20 text-orange-400',
  Suspended: 'bg-red-500/20 text-red-400',
  Terminated: 'bg-slate-600/20 text-slate-500',
};

const riskTierColors = {
  Low: 'text-green-400',
  Medium: 'text-yellow-400',
  High: 'text-orange-400',
  Critical: 'text-red-400',
};

export default function SupplierPortalDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [supplier, setSupplier] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [questionnaires, setQuestionnaires] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('supplierPortalUser'));
    if (!loggedInUser || !loggedInUser.supplier_id) {
      navigate('/SupplierPortalLogin');
      return;
    }
    setUser(loggedInUser);

    const fetchData = async () => {
      try {
        const [supplierData, docsData, questionnaireData] = await Promise.all([
          Supplier.get(loggedInUser.supplier_id),
          SupplierDocument.filter({ supplier_id: loggedInUser.supplier_id }),
          QuestionnaireResponse.filter({ supplier_id: loggedInUser.supplier_id }),
        ]);
        setSupplier(supplierData);
        setDocuments(docsData);
        setQuestionnaires(questionnaireData);
      } catch (error) {
        console.error("Failed to load supplier data", error);
      }
      setLoading(false);
    };

    fetchData();
  }, [navigate]);

  if (loading || !supplier) {
    return <PortalLayout><div className="text-center p-8">Loading dashboard...</div></PortalLayout>;
  }
  
  if (supplier.status === 'Suspended' || supplier.status === 'Terminated') {
      return (
          <PortalLayout>
              <div className="text-center p-8">
                  <AlertTriangle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                  <h1 className="text-2xl font-bold text-white">Portal Access Suspended</h1>
                  <p className="text-slate-400 mt-2">
                      Your portal access is currently {supplier.status.toLowerCase()}. Please contact your account manager for more information.
                  </p>
              </div>
          </PortalLayout>
      );
  }

  const upcomingActions = [
    ...documents.filter(d => d.status === 'Missing' || d.status === 'Needs Clarification' || d.status === 'Rejected').map(d => ({
      type: 'document',
      title: `Document Required: ${d.name}`,
      status: d.status,
      link: '/SupplierPortalDocuments',
    })),
    ...documents.filter(d => d.expiry_date && differenceInDays(new Date(d.expiry_date), new Date()) <= 30).map(d => ({
      type: 'document',
      title: `Document Expiring: ${d.name}`,
      status: `Expires in ${differenceInDays(new Date(d.expiry_date), new Date())} days`,
      link: '/SupplierPortalDocuments',
    })),
    ...questionnaires.filter(q => q.status === 'Draft' || q.status === 'Needs Clarification').map(q => ({
      type: 'questionnaire',
      title: 'Questionnaire requires attention',
      status: q.status,
      link: '/SupplierPortalQuestionnaire',
    }))
  ];

  return (
    <PortalLayout>
      <h1 className="text-3xl font-bold mb-6">Welcome, {supplier.name}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle>Your Status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <Badge className={statusColors[supplier.lifecycle_stage]}>{supplier.lifecycle_stage}</Badge>
                <p className="text-slate-400 mt-2 text-sm">
                  {supplier.lifecycle_stage === 'Renewal Due' ? `Your contract is up for renewal. Please complete all required actions.` :
                   supplier.lifecycle_stage === 'Onboarding' ? 'Please complete the onboarding steps to become an active supplier.' :
                   'You are an active and approved supplier.'}
                </p>
              </div>
              {supplier.contract_end && (
                <div className="text-right">
                  <p className="font-semibold text-white">Contract End Date</p>
                  <p className="text-slate-300">{format(new Date(supplier.contract_end), 'MMM dd, yyyy')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle>Upcoming Actions</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingActions.length > 0 ? (
                <ul className="space-y-3">
                  {upcomingActions.map((action, i) => (
                    <li key={i} className="flex justify-between items-center p-3 bg-slate-900/40 rounded-lg">
                      <div className="flex items-center gap-3">
                        {action.type === 'document' ? <FileText className="w-5 h-5 text-blue-400" /> : <FileQuestion className="w-5 h-5 text-purple-400" />}
                        <div>
                          <p className="text-white">{action.title}</p>
                          <Badge variant="outline" className="text-xs">{action.status}</Badge>
                        </div>
                      </div>
                      <Button variant="ghost" onClick={() => navigate(action.link)}>View</Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-6 text-green-400">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2" />
                  <p>No outstanding actions required. Well done!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle>Risk Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className={`text-4xl font-bold ${riskTierColors[supplier.risk_tier]}`}>{supplier.risk_score || 'N/A'}</p>
                <p className="text-slate-400 text-sm">{supplier.risk_tier} Risk</p>
              </div>
              <p className="text-xs text-slate-500 mt-4 text-center">
                This is an AI-generated score based on your submitted information. It is used for internal risk management.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-semibold text-white">Your RedScan.ai Contact</p>
              <p className="text-slate-300">Security & Risk Team</p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <MessageSquare className="w-4 h-4 mr-2" /> Secure Message
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalLayout>
  );
}
