
import React, { useState, useEffect, useCallback } from 'react';
import { Supplier, QuestionnaireResponse, SupplierReview, User, SupplierDocument } from '@/api/entities';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ArrowLeft, Check, FileText, Upload, Calendar, UserCheck, ShieldCheck, Mail, Phone, Globe, AlertTriangle } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/table';
import { format, isAfter, differenceInDays } from 'date-fns';

import AiRiskAssessment from '../components/suppliers/AiRiskAssessment';
import SmartQuestionnaire from '../components/suppliers/SmartQuestionnaire';
import LifecycleManager from '../components/suppliers/LifecycleManager';
import SlaManager from '../components/suppliers/SlaManager';
import IncidentTracker from '../components/suppliers/IncidentTracker';
import SlaAiAdvisor from '../components/suppliers/SlaAiAdvisor';
import ContractManager from '../components/suppliers/ContractManager';

const statusColors = {
  Draft: 'bg-slate-500/20 text-slate-400',
  Onboarding: 'bg-blue-500/20 text-blue-400',
  Active: 'bg-green-500/20 text-green-400',
  'In Review': 'bg-yellow-500/20 text-yellow-400',
  'Renewal Due': 'bg-orange-500/20 text-orange-400',
  Suspended: 'bg-red-500/20 text-red-400',
  Terminated: 'bg-slate-600/20 text-slate-500',
};

const OnboardingStepper = ({ currentStep, onStepClick }) => {
  const steps = ["Initiation", "Due Diligence", "Risk Scoring", "Approval", "Active"];
  return (
    <div className="flex justify-between items-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className="flex flex-col items-center cursor-pointer" onClick={() => onStepClick(index + 1)}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${index + 1 <= currentStep ? 'bg-red-500/80 border-[var(--color-primary)]' : 'bg-slate-700 border-slate-600'}`}>
              {index + 1 < currentStep ? <Check className="w-6 h-6 text-white"/> : <span className="text-white font-bold">{index + 1}</span>}
            </div>
            <p className={`mt-2 text-xs font-medium ${index + 1 <= currentStep ? 'text-white' : 'text-slate-400'}`}>{step}</p>
          </div>
          {index < steps.length - 1 && <div className="flex-1 h-0.5 bg-slate-600 mx-4"></div>}
        </React.Fragment>
      ))}
    </div>
  );
};

// NEW: Portal Management Component
const PortalManagement = ({ supplier }) => {
  const [inviteLink, setInviteLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const generateInvite = async () => {
    setIsGenerating(true);
    // This would typically involve creating a User record if one doesn't exist,
    // and then generating a unique token. We'll simulate this.
    const token = `magic_${supplier.id}_${Date.now()}`;
    const link = `${window.location.origin}/SupplierPortalLogin?token=${token}`;

    // In a real app, you would save this token to the supplier's primary contact User record.
    // For now, we'll just display it.
    await new Promise(res => setTimeout(res, 500));
    
    setInviteLink(link);
    setIsGenerating(false);
    toast.success("Supplier portal invite link generated.");
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle>Portal Access Management</CardTitle>
        <CardDescription>Invite supplier contacts to the external portal to manage their profile.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={generateInvite} disabled={isGenerating}>
          {isGenerating ? "Generating..." : "Generate Portal Invite Link"}
        </Button>
        {inviteLink && (
          <div className="space-y-2">
            <Label>Share this secure link with your supplier contact:</Label>
            <Input readOnly value={inviteLink} className="bg-slate-900/80 border-slate-700" />
            <Button variant="ghost" onClick={() => { navigator.clipboard.writeText(inviteLink); toast.success("Link copied!"); }}>
              Copy Link
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};


export default function SupplierDetailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const supplierId = searchParams.get('id');
  const isNew = searchParams.get('new') === 'true';

  const [supplier, setSupplier] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [questionnaire, setQuestionnaire] = useState(null);
  const [supplierDocs, setSupplierDocs] = useState([]); // New state for documents
  const [user, setUser] = useState(null);
  const [supplierUsers, setSupplierUsers] = useState([]); // New state for supplier users
  const [loading, setLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);

  const isAdmin = user?.role === 'admin';

  const loadData = useCallback(async () => {
    if (!supplierId && !isNew) return; // Only return if no ID and not a new supplier
    setLoading(true);
    try {
      const [supplierData, reviewsData, questionnaireData, userData, supplierUsersData, docsData] = await Promise.all([
        supplierId ? Supplier.get(supplierId) : Promise.resolve(null),
        supplierId ? SupplierReview.filter({ supplier_id: supplierId }) : Promise.resolve([]),
        supplierId ? QuestionnaireResponse.filter({ supplier_id: supplierId }).then(res => res[0]) : Promise.resolve(null),
        User.me(),
        supplierId ? User.filter({ supplier_id: supplierId, user_type: 'supplier' }) : Promise.resolve([]),
        supplierId ? SupplierDocument.filter({ supplier_id: supplierId }) : Promise.resolve([]) // fetch docs
      ]);
      setSupplier(supplierData);
      setReviews(reviewsData);
      setQuestionnaire(questionnaireData);
      setUser(userData);
      setSupplierUsers(supplierUsersData || []);
      setSupplierDocs(docsData || []); // set docs
    } catch (error) {
      toast.error("Failed to load supplier details.");
      console.error(error);
    }
    setLoading(false);
  }, [supplierId, isNew]);

  useEffect(() => {
    if (!isNew) {
      loadData();
    } else {
      setSupplier({
        name: '', type: 'software', criticality: 'Medium', lifecycle_stage: 'Draft', onboarding_step: 1,
        contact_email: '', contact_phone: '', country: '', business_domain: ''
      });
      User.me().then(setUser);
    }
  }, [isNew, loadData]);

  const handleFieldChange = (field, value) => {
    setSupplier(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (updates) => {
    if (isSaving) return;
    setIsSaving(true);
    const dataToSave = { ...supplier, ...updates };

    try {
      let savedSupplier;
      if (isNew && !supplier.id) {
        savedSupplier = await Supplier.create(dataToSave);
        toast.success("Supplier created successfully!");
        navigate(createPageUrl(`SupplierDetail?id=${savedSupplier.id}`), { replace: true });
      } else {
        savedSupplier = await Supplier.update(supplier.id, dataToSave);
        setSupplier(savedSupplier);
        toast.success("Supplier updated.");
      }
    } catch (error) {
      toast.error("Failed to save supplier.");
      console.error(error);
    }
    setIsSaving(false);
  };
  
  const calculateRiskScore = (supplier, responses) => {
    let score = 0;
    // Base score from criticality
    if (supplier.criticality === 'High') score += 40;
    if (supplier.criticality === 'Medium') score += 20;
    
    // Questionnaire factors
    if (responses?.data_handling === 'pii') score += 30;
    if (responses?.iso_cert === 'no') score += 20;
    if (responses?.soc2_status === 'none') score += 15;
    if (responses?.incident_response === 'no') score += 10;
    
    // Country risk (simplified)
    if (['China', 'Russia', 'Iran', 'North Korea'].includes(supplier.country)) {
      score += 25;
    }
    
    return Math.min(100, score);
  };

  const handleQuestionnaire = async (questionnaireData) => {
    try {
      await QuestionnaireResponse.create(questionnaireData);
      const riskScore = calculateRiskScore(supplier, questionnaireData.responses);
      await handleSave({ 
        risk_score: riskScore,
        onboarding_step: 3,
        ai_explanation: `Risk score calculated based on questionnaire responses. ${riskScore > 70 ? 'High risk factors identified.' : 'Acceptable risk profile.'}`
      });
      loadData();
      toast.success('Questionnaire submitted and risk score calculated');
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      toast.error('Failed to submit questionnaire');
    }
  };

  const handleOnboardingStep = async (nextStep) => {
    let updates = { onboarding_step: nextStep };
    // Risk score is now calculated by handleQuestionnaire and AiRiskAssessment
    // if (nextStep === 3) { // Risk Scoring
    //   const riskScore = calculateRiskScore(supplier, questionnaire?.responses);
    //   updates.risk_score = riskScore;
    // }
    if (nextStep === 5) { // Activation
      updates.lifecycle_stage = 'Active';
      updates.status = 'Active';
      updates.stage_entered_at = new Date().toISOString();

      // Create required document stubs on activation
      const requiredDocs = ['ISO 27001', 'SOC 2', 'Contract'];
      for (const docType of requiredDocs) {
        // Check if it already exists
        const existing = await SupplierDocument.filter({ supplier_id: supplier.id, name: docType });
        if(existing.length === 0) {
            await SupplierDocument.create({
                supplier_id: supplier.id,
                organization_id: supplier.organization_id, // Assuming organization_id is available on supplier
                name: docType,
                type: docType,
                status: 'Missing',
            });
        }
      }
      loadData(); // Re-fetch data to show new documents
    }
    handleSave(updates);
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;
  if (!supplier && !isNew) return <div className="p-8 text-white">Supplier not found.</div>;
  if (!supplier && isNew) return null; // Render nothing initially for new supplier until default state is set

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen text-white">
      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(createPageUrl('Suppliers'))} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back to Suppliers</Button>
        <header className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold">{supplier.name || "New Supplier"}</h1>
            <Badge className={statusColors[supplier.lifecycle_stage || supplier.status]}>{supplier.lifecycle_stage || supplier.status}</Badge>
          </div>
          {!isNew && (
            <Button onClick={() => handleSave()} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
          )}
        </header>

        <Tabs defaultValue="overview">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="lifecycle">Lifecycle</TabsTrigger>
            <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
            <TabsTrigger value="performance">Performance & SLA</TabsTrigger>
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="access">Access</TabsTrigger>
            <TabsTrigger value="portal">Portal</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div><Label>Supplier Name</Label><Input value={supplier.name} onChange={e => handleFieldChange('name', e.target.value)} className="bg-slate-900/50 border-slate-700"/></div>
                  <div><Label>Business Domain</Label><Input value={supplier.business_domain} onChange={e => handleFieldChange('business_domain', e.target.value)} className="bg-slate-900/50 border-slate-700"/></div>
                  <div><Label>Contact Email</Label><Input type="email" value={supplier.contact_email} onChange={e => handleFieldChange('contact_email', e.target.value)} className="bg-slate-900/50 border-slate-700"/></div>
                  <div><Label>Contact Phone</Label><Input value={supplier.contact_phone} onChange={e => handleFieldChange('contact_phone', e.target.value)} className="bg-slate-900/50 border-slate-700"/></div>
                  <div><Label>Country</Label><Input value={supplier.country} onChange={e => handleFieldChange('country', e.target.value)} className="bg-slate-900/50 border-slate-700"/></div>
                </div>
                <div className="space-y-4">
                  <div><Label>Type</Label><Select value={supplier.type} onValueChange={v => handleFieldChange('type', v)}><SelectTrigger className="bg-slate-900/50 border-slate-700"><SelectValue/></SelectTrigger><SelectContent className="bg-slate-800 border-slate-700 text-white"><SelectItem value="software">Software</SelectItem><SelectItem value="hardware">Hardware</SelectItem><SelectItem value="service">Service</SelectItem><SelectItem value="contractor">Contractor</SelectItem></SelectContent></Select></div>
                  <div><Label>Criticality</Label><Select value={supplier.criticality} onValueChange={v => handleFieldChange('criticality', v)}><SelectTrigger className="bg-slate-900/50 border-slate-700"><SelectValue/></SelectTrigger><SelectContent className="bg-slate-800 border-slate-700 text-white"><SelectItem value="Low">Low</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="High">High</SelectItem></SelectContent></Select></div>
                  <div><Label>Risk Score</Label><Input disabled value={supplier.risk_score || 'Not Calculated'} className="bg-slate-900/50 border-slate-700"/></div>
                  {isNew && <Button onClick={() => handleSave()} className="w-full bg-[var(--color-primary)] hover:bg-red-700">Create Supplier</Button>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lifecycle" className="mt-6">
            <LifecycleManager supplier={supplier} onUpdate={handleSave} />
          </TabsContent>

          <TabsContent value="onboarding" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <OnboardingStepper currentStep={supplier.onboarding_step} onStepClick={(step) => handleFieldChange('onboarding_step', step)} />
              {/* Step 1: Initiation */}
              {supplier.onboarding_step === 1 && (
                <div><CardTitle className="mb-4">Step 1: Initiation</CardTitle><p className="text-slate-400">Initial supplier details have been recorded. Proceed to Due Diligence.</p><Button onClick={() => handleOnboardingStep(2)} className="mt-4">Next Step</Button></div>
              )}
              {/* Step 2: Due Diligence */}
              {supplier.onboarding_step === 2 && (
                <div>
                  <CardTitle className="mb-4">Step 2: Due Diligence Questionnaire</CardTitle>
                  <SmartQuestionnaire 
                    supplier={supplier}
                    questionnaire={questionnaire}
                    onSubmit={handleQuestionnaire}
                  />
                </div>
              )}
              {/* Step 3: AI Risk Scoring */}
              {supplier.onboarding_step === 3 && (
                <div>
                  <CardTitle className="mb-4">Step 3: AI Risk Assessment</CardTitle>
                  <AiRiskAssessment 
                    supplier={supplier} 
                    onUpdate={async (id, updates) => {
                      await handleSave(updates);
                      loadData();
                    }}
                  />
                  <Button onClick={() => handleOnboardingStep(4)} className="mt-4">Proceed to Approval</Button>
                </div>
              )}
              {/* Step 4: Approval */}
              {supplier.onboarding_step === 4 && (
                <div><CardTitle className="mb-4">Step 4: Approval</CardTitle><p className="text-slate-400">Review the supplier details and risk score. An administrator must approve to activate this supplier.</p>{isAdmin ? <Button onClick={() => handleOnboardingStep(5)} className="mt-4 bg-green-600 hover:bg-green-700"><ShieldCheck className="w-4 h-4 mr-2"/>Approve and Activate</Button> : <p className="text-yellow-400 mt-4">Waiting for administrator approval.</p>}</div>
              )}
              {/* Step 5: Active */}
              {supplier.onboarding_step === 5 && (
                <div><CardTitle className="mb-4">Step 5: Active</CardTitle><p className="text-green-400">This supplier is now active and can be integrated with assets and policies.</p></div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="mt-6 space-y-6">
            <SlaManager supplier={supplier} />
            <SlaAiAdvisor supplier={supplier} />
          </TabsContent>

          {/* NEW Incidents Tab Content */}
          <TabsContent value="incidents" className="mt-6">
            <IncidentTracker supplier={supplier} />
          </TabsContent>

          <TabsContent value="contracts" className="mt-6">
            <ContractManager supplier={supplier} />
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
             <Card className="bg-slate-800/50 border-slate-700"><CardHeader><CardTitle>Compliance Documents</CardTitle></CardHeader>
               <CardContent>
                 {supplierDocs.length > 0 ? (
                    <Table>
                      <TableHeader><TableRow className="border-slate-700"><TableHead className="text-slate-300">Document</TableHead><TableHead className="text-slate-300">Status</TableHead><TableHead className="text-slate-300">Expiry</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {supplierDocs.map(doc => (
                          <TableRow key={doc.id} className="border-slate-700"><TableCell className="text-white">{doc.name}</TableCell><TableCell><Badge>{doc.status}</Badge></TableCell><TableCell className="text-slate-300">{doc.expiry_date ? format(new Date(doc.expiry_date), 'MMM dd, yyyy') : 'N/A'}</TableCell></TableRow>
                        ))}
                      </TableBody>
                    </Table>
                 ) : <p className="text-slate-400">No documents found. Documents will be requested upon supplier activation.</p>}
               </CardContent>
             </Card>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700"><CardHeader><CardTitle>Periodic Reviews</CardTitle></CardHeader><CardContent><p className="text-slate-400">Review tracking coming soon.</p></CardContent></Card>
          </TabsContent>

          {/* New Access Tab Content */}
          <TabsContent value="access" className="mt-6">
            <div className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Linked Access Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-slate-900/50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-white">{supplierUsers.length}</div>
                      <div className="text-sm text-slate-400">Active Users</div>
                    </div>
                    <div className="p-4 bg-slate-900/50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-white">
                        {supplierUsers.filter(u => u.device_compliance_status === 'compliant').length}
                      </div>
                      <div className="text-sm text-slate-400">Compliant Devices</div>
                    </div>
                    <div className="p-4 bg-slate-900/50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-white">
                        {supplierUsers.filter(u => u.access_status === 'active').length}
                      </div>
                      <div className="text-sm text-slate-400">Active Access</div>
                    </div>
                  </div>

                  <h3 className="text-white font-medium mb-4">Supplier Users</h3>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-300">User</TableHead>
                        <TableHead className="text-slate-300">Role</TableHead>
                        <TableHead className="text-slate-300">Contract Period</TableHead>
                        <TableHead className="text-slate-300">Last Access</TableHead>
                        <TableHead className="text-slate-300">Device Status</TableHead>
                        <TableHead className="text-slate-300">Access Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {supplierUsers.map(user => (
                        <TableRow key={user.id} className="border-slate-700">
                          <TableCell className="font-medium text-white">
                            <div>
                              {user.full_name}
                              <div className="text-xs text-slate-400">{user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-300 capitalize">{user.role}</TableCell>
                          <TableCell className="text-slate-300">
                            {user.contract_start && user.contract_end ? 
                              `${format(new Date(user.contract_start), 'MMM yyyy')} - ${format(new Date(user.contract_end), 'MMM yyyy')}` : 
                              'Not set'
                            }
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {user.last_access ? format(new Date(user.last_access), 'MMM dd, yyyy') : 'Never'}
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              user.device_compliance_status === 'compliant' ? 'bg-green-500/20 text-green-400' :
                              user.device_compliance_status === 'non_compliant' ? 'bg-red-500/20 text-red-400' :
                              'bg-slate-500/20 text-slate-400'
                            }>
                              {user.device_compliance_status?.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              user.access_status === 'active' ? 'bg-green-500/20 text-green-400' :
                              user.access_status === 'suspended' ? 'bg-red-500/20 text-red-400' :
                              user.access_status === 'expired' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-slate-500/20 text-slate-400'
                            }>
                              {user.access_status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {supplierUsers.filter(u => u.access_status === 'expired' || (u.contract_end && isAfter(new Date(), new Date(u.contract_end)))).length > 0 && (
                    <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                      <div className="flex items-center gap-2 text-red-300 font-medium">
                        <AlertTriangle className="w-4 h-4" />
                        Access Governance Alert
                      </div>
                      <p className="text-red-200 text-sm mt-1">
                        Some users have access beyond their contract end date or have expired access status.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* New Portal Tab Content */}
          <TabsContent value="portal" className="mt-6">
            <PortalManagement supplier={supplier} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
