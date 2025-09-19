import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SupplierIncident } from '@/api/entities';

export default function LogIncidentModal({ supplier, onClose, onIncidentLogged }) {
  const [incident, setIncident] = useState({
    title: '',
    description: '',
    incident_date: new Date().toISOString().split('T')[0],
    type: 'Security Breach',
    severity: 'Medium',
    status: 'Open',
    source: 'Manual'
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await SupplierIncident.create({
        ...incident,
        supplier_id: supplier.id,
        organization_id: supplier.organization_id
      });
      onIncidentLogged();
    } catch (e) {
      console.error("Failed to log incident", e);
    }
    setIsSaving(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Log New Incident for {supplier.name}</DialogTitle>
          <DialogDescription>Record a new security or performance incident.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">Title</Label>
            <Input id="title" value={incident.title} onChange={e => setIncident(p => ({...p, title: e.target.value}))} className="col-span-3 bg-slate-700 border-slate-600"/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Textarea id="description" value={incident.description} onChange={e => setIncident(p => ({...p, description: e.target.value}))} className="col-span-3 bg-slate-700 border-slate-600"/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">Incident Date</Label>
            <Input id="date" type="date" value={incident.incident_date} onChange={e => setIncident(p => ({...p, incident_date: e.target.value}))} className="col-span-3 bg-slate-700 border-slate-600"/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">Type</Label>
            <Select value={incident.type} onValueChange={v => setIncident(p => ({...p, type: v}))}>
              <SelectTrigger className="col-span-3 bg-slate-700 border-slate-600"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="Data Breach">Data Breach</SelectItem>
                <SelectItem value="Security Breach">Security Breach</SelectItem>
                <SelectItem value="Outage">Outage</SelectItem>
                <SelectItem value="Non-Compliance">Non-Compliance</SelectItem>
                <SelectItem value="Delay">Delay</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="severity" className="text-right">Severity</Label>
            <Select value={incident.severity} onValueChange={v => setIncident(p => ({...p, severity: v}))}>
              <SelectTrigger className="col-span-3 bg-slate-700 border-slate-600"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-[var(--color-primary)] hover:bg-red-700">{isSaving ? "Saving..." : "Save Incident"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}