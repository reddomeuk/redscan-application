import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SupplierIncident, Supplier } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Siren, Calendar, Shield, Activity, Save, Brain, FileText, User, Bell } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

const AiBreachSummary = ({ incident, supplier }) => {
  if (!incident) return null;
  const summary = `A ${incident.severity.toLowerCase()} ${incident.type.toLowerCase()} was detected for supplier ${supplier?.name} on ${format(new Date(incident.incident_date), 'PPP')}. The incident appears to impact data related to customer PII and internal operational metrics.`;
  const timeline = [
    { event: 'Incident Detected', time: incident.detected_at || incident.created_date },
    { event: 'Initial Report Logged', time: incident.reported_at || incident.created_date },
  ];
  const obligations = incident.regulatory_obligations || ['GDPR (Potential)', 'ADHICS (Possible)'];

  return (
    <Card className="bg-purple-900/20 border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2"><Brain className="w-5 h-5 text-purple-400" />AI-Generated Breach Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-purple-200 font-medium mb-1">Impact Analysis</h4>
          <p className="text-slate-300 text-sm">{incident.impact_summary || summary}</p>
        </div>
        <div>
          <h4 className="text-purple-200 font-medium mb-2">Timeline</h4>
          <ul className="space-y-1">
            {timeline.map((item, i) => (
              <li key={i} className="text-slate-400 text-sm">{format(new Date(item.time), 'Pp')} - {item.event}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-purple-200 font-medium mb-1">Potential Regulatory Obligations</h4>
          <div className="flex gap-2">
            {obligations.map(ob => <Badge key={ob} variant="outline" className="text-yellow-300 border-yellow-500/50">{ob}</Badge>)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


export default function SupplierIncidentDetailPage() {
  const [searchParams] = useSearchParams();
  const incidentId = searchParams.get('id');
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = useCallback(async () => {
    if (!incidentId) return;
    setLoading(true);
    try {
      const incidentData = await SupplierIncident.get(incidentId);
      setIncident(incidentData);
      if (incidentData.supplier_id) {
        const supplierData = await Supplier.get(incidentData.supplier_id);
        setSupplier(supplierData);
      }
    } catch (e) {
      toast.error("Failed to load incident details");
      console.error(e);
    }
    setLoading(false);
  }, [incidentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      await SupplierIncident.update(incidentId, incident);
      toast.success("Incident updated");
      loadData();
    } catch (e) {
      toast.error("Failed to update incident");
    }
    setIsSaving(false);
  };
  
  const handleFieldChange = (field, value) => {
    setIncident(prev => ({...prev, [field]: value}));
  };

  const severityColors = {
    Low: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    High: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    Critical: 'bg-red-500/20 text-red-400 border-red-500/40',
  };
  
  const statusColors = {
    Open: 'bg-red-500/20 text-red-400 border-red-500/40',
    'Under Investigation': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    Contained: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    Resolved: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
    Closed: 'bg-green-500/20 text-green-400 border-green-500/40',
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;
  if (!incident) return <div className="p-8 text-white">Incident not found</div>;

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen text-white">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(createPageUrl('SupplierIncidents'))} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back to Incident Register</Button>

        <header className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold">{incident.title}</h1>
            <p className="text-slate-300">Incident for <span className="font-medium text-white hover:underline cursor-pointer" onClick={() => navigate(createPageUrl(`SupplierDetail?id=${supplier.id}`))}>{supplier?.name || 'Unknown Supplier'}</span></p>
          </div>
          <Button onClick={handleUpdate} disabled={isSaving}><Save className="w-4 h-4 mr-2" />{isSaving ? 'Saving...' : 'Save Changes'}</Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <AiBreachSummary incident={incident} supplier={supplier} />
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader><CardTitle className="text-white">Investigation & Remediation</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-slate-300 mb-2">Root Cause Analysis</h4>
                  <Textarea value={incident.root_cause || ''} onChange={e => handleFieldChange('root_cause', e.target.value)} className="bg-slate-900/50 border-slate-700" rows={4} placeholder="Enter root cause analysis details..."/>
                </div>
                <div>
                  <h4 className="text-slate-300 mb-2">Remediation Plan</h4>
                  <Textarea value={incident.remediation_plan || ''} onChange={e => handleFieldChange('remediation_plan', e.target.value)} className="bg-slate-900/50 border-slate-700" rows={4} placeholder="Describe the plan to remediate this incident..."/>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader><CardTitle className="text-white">Incident Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center"><span className="text-slate-400">Severity</span> <Badge className={severityColors[incident.severity]}>{incident.severity}</Badge></div>
                <div className="flex justify-between items-center"><span className="text-slate-400">Status</span>
                  <Select value={incident.status} onValueChange={v => handleFieldChange('status', v)}>
                    <SelectTrigger className="w-48 bg-transparent border-none text-right focus:ring-0">
                       <SelectValue asChild>
                         <Badge className={statusColors[incident.status]}>{incident.status}</Badge>
                       </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="Under Investigation">Under Investigation</SelectItem>
                      <SelectItem value="Contained">Contained</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-between items-center"><span className="text-slate-400">Date</span> <span className="text-white">{format(new Date(incident.incident_date), 'PPP')}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-400">Type</span> <span className="text-white">{incident.type}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-400">Source</span> <Badge variant="outline" className="text-slate-300">{incident.source}</Badge></div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader><CardTitle className="text-white">Linked Items</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-slate-400 flex items-center gap-2"><FileText className="w-4 h-4"/> No linked assets</p>
                <p className="text-sm text-slate-400 flex items-center gap-2"><User className="w-4 h-4"/> No impacted users</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}