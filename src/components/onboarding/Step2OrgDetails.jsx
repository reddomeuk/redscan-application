import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Organization } from '@/api/entities';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce'; // Assuming a useDebounce hook exists

export default function Step2OrgDetails({ data, updateData, nextStep }) {
  const [orgName, setOrgName] = useState(data.orgName || '');
  const [orgSlug, setOrgSlug] = useState('');
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [isSlugAvailable, setIsSlugAvailable] = useState(null);

  const debouncedSlug = useDebounce(orgSlug, 500);

  useEffect(() => {
    const slugified = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    setOrgSlug(slugified);
  }, [orgName]);

  useEffect(() => {
    if (debouncedSlug) {
      checkSlugAvailability(debouncedSlug);
    } else {
      setIsSlugAvailable(null);
    }
  }, [debouncedSlug]);

  const checkSlugAvailability = async (slug) => {
    setIsCheckingSlug(true);
    const existing = await Organization.filter({ slug });
    setIsSlugAvailable(existing.length === 0);
    setIsCheckingSlug(false);
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!isSlugAvailable) {
        alert("This organization URL is already taken. Please choose a different name.");
        return;
    }
    updateData({ orgName, orgSlug, billingEmail: data.user.email });
    nextStep();
  };

  return (
    <form onSubmit={handleNext}>
      <h2 className="text-2xl font-semibold text-white mb-2">Tell us about your organization</h2>
      <p className="text-slate-400 mb-8">This will create a new workspace for your team.</p>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="orgName">Organization Name</Label>
          <Input 
            id="orgName" 
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="Your Company Inc."
            required
            className="bg-slate-900/50 border-slate-700"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="orgSlug">Organization URL</Label>
          <div className="flex items-center">
            <span className="text-slate-400 bg-slate-900 border border-r-0 border-slate-700 rounded-l-md px-3 py-2">
              redscan.ai/
            </span>
            <Input 
              id="orgSlug" 
              value={orgSlug}
              onChange={(e) => setOrgSlug(e.target.value)}
              required
              className="bg-slate-900/50 border-slate-700 rounded-l-none"
            />
            <div className="w-8 h-10 flex items-center justify-center ml-2">
              {isCheckingSlug && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
              {isSlugAvailable === true && !isCheckingSlug && <CheckCircle className="w-4 h-4 text-green-400" />}
              {isSlugAvailable === false && !isCheckingSlug && <XCircle className="w-4 h-4 text-red-400" />}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="primaryDomain">Primary Domain</Label>
          <Input 
            id="primaryDomain"
            value={data.primaryDomain}
            disabled 
            className="bg-slate-900/80 border-slate-600 cursor-not-allowed"
          />
          <p className="text-xs text-slate-500">This is based on your sign-in email and will be used for user verification.</p>
        </div>
      </div>
      
      <div className="mt-8">
        <Button type="submit" disabled={!orgName || isCheckingSlug || !isSlugAvailable} className="w-full bg-red-600 hover:bg-red-700">
          Continue
        </Button>
      </div>
    </form>
  );
}