import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Organization, DomainVerification } from '@/api/entities';
import { toast } from 'sonner';
import { Globe, KeyRound, CreditCard, Save } from 'lucide-react';

const DomainManager = ({ org }) => {
  const [domains, setDomains] = useState(org.verified_domains || []);
  const [newDomain, setNewDomain] = useState('');

  const handleAddDomain = async () => {
    if (!newDomain.trim()) return;
    try {
      // Simulate creating a verification record
      await DomainVerification.create({
        domain: newDomain,
        organization_id: org.id,
        status: 'pending_txt',
        txt_record_token: `redscan-verification=${Math.random().toString(36).substring(2, 15)}`
      });
      // In a real app, we'd update the org with the new domain from the verification entity.
      // Here, we just add it to the local state.
      const updatedDomains = [...domains, { domain: newDomain, status: 'pending' }];
      setDomains(updatedDomains);
      await Organization.update(org.id, { verified_domains: updatedDomains });
      setNewDomain('');
      toast.success(`Verification initiated for ${newDomain}. Add the TXT record to your DNS.`);
    } catch (error) {
      toast.error("Failed to add domain.");
    }
  };
  
  const handleVerifyDomain = async (domain) => {
    // Simulate verification
    const updatedDomains = domains.map(d => d.domain === domain ? { ...d, status: 'verified' } : d);
    setDomains(updatedDomains);
    await Organization.update(org.id, { verified_domains: updatedDomains });
    toast.success(`${domain} has been verified!`);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Primary Domain</Label>
        <Input value={org.primary_domain || ''} disabled className="bg-slate-900/50" />
      </div>
      <div>
        <Label>Verified Domains</Label>
        <div className="space-y-2">
          {domains.map(d => (
            <div key={d.domain} className="flex items-center justify-between p-2 bg-slate-900/50 rounded-md">
              <span className="text-white">{d.domain}</span>
              {d.status === 'pending' ? (
                <Button size="sm" variant="outline" onClick={() => handleVerifyDomain(d.domain)}>Verify Now</Button>
              ) : (
                <span className="text-xs text-green-400">Verified</span>
              )}
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label>Add New Domain</Label>
        <div className="flex gap-2">
          <Input 
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            placeholder="e.g., new-company-domain.com"
            className="bg-slate-900/50"
          />
          <Button onClick={handleAddDomain}>Add</Button>
        </div>
      </div>
    </div>
  );
};

export default function OrgEditorModal({ org, onClose, onSave }) {
  const [formData, setFormData] = useState({ ...org });

  const handleSave = async () => {
    try {
      if (formData.id) {
        await Organization.update(formData.id, formData);
        toast.success("Organization updated successfully.");
      } else {
        await Organization.create(formData);
        toast.success("Organization created successfully.");
      }
      onSave();
    } catch (error) {
      console.error("Failed to save organization:", error);
      toast.error("Failed to save organization.");
    }
  };
  
  const isNew = !org.id;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isNew ? "Create Organization" : `Edit ${org.name}`}</DialogTitle>
          <DialogDescription>Manage organization details, domains, and subscription.</DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="general">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="domains">Domains</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label>Organization Name</Label>
              <Input value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-slate-900/50" />
            </div>
            <div className="space-y-2">
              <Label>Organization Slug</Label>
              <Input value={formData.slug || ''} onChange={e => setFormData({...formData, slug: e.target.value})} className="bg-slate-900/50" />
            </div>
             <div className="space-y-2">
              <Label>Primary Domain</Label>
              <Input value={formData.primary_domain || ''} onChange={e => setFormData({...formData, primary_domain: e.target.value})} className="bg-slate-900/50" />
            </div>
          </TabsContent>

          <TabsContent value="domains" className="mt-4">
            <DomainManager org={formData} />
          </TabsContent>

          <TabsContent value="subscription" className="mt-4 space-y-4">
             <div className="space-y-2">
              <Label>Subscription Plan</Label>
              <Select value={formData.subscription_tier || 'free'} onValueChange={value => setFormData({...formData, subscription_tier: value})}>
                  <SelectTrigger className="bg-slate-900/50"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-800">
                    <SelectItem value="free" className="text-white">Free</SelectItem>
                    <SelectItem value="pro" className="text-white">Pro</SelectItem>
                    <SelectItem value="enterprise" className="text-white">Enterprise</SelectItem>
                    <SelectItem value="trial" className="text-white">Trial</SelectItem>
                  </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Seats</Label>
              <Input type="number" value={formData.seats || 0} onChange={e => setFormData({...formData, seats: parseInt(e.target.value)})} className="bg-slate-900/50" />
            </div>
          </TabsContent>
          
          <TabsContent value="security" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>SSO Provider</Label>
                <p className="text-sm text-slate-400">Configure via Organization Settings page.</p>
              </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" /> Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}