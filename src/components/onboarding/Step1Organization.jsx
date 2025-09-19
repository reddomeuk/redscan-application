import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Organization } from '@/api/entities';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';

export default function Step1Organization({ data, updateData, nextStep }) {
  const [orgName, setOrgName] = useState(data.orgName || '');
  const [orgSlug, setOrgSlug] = useState(data.orgSlug || '');
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [isSlugAvailable, setIsSlugAvailable] = useState(null);

  const debouncedSlug = useDebounce(orgSlug, 500);

  useEffect(() => {
    if (orgName && !orgSlug) {
      const slugified = orgName.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setOrgSlug(slugified);
    }
  }, [orgName, orgSlug]);

  useEffect(() => {
    if (debouncedSlug && debouncedSlug.length >= 3) {
      checkSlugAvailability(debouncedSlug);
    } else {
      setIsSlugAvailable(null);
    }
  }, [debouncedSlug]);

  const checkSlugAvailability = async (slug) => {
    setIsCheckingSlug(true);
    try {
      const existing = await Organization.filter({ slug });
      setIsSlugAvailable(existing.length === 0);
    } catch (error) {
      console.error('Error checking slug:', error);
      setIsSlugAvailable(true); // Assume available on error
    }
    setIsCheckingSlug(false);
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!orgName || !orgSlug || isSlugAvailable === false) {
      return;
    }
    
    updateData({ 
      orgName, 
      orgSlug,
      billingEmail: data.user?.email || data.billingEmail
    });
    nextStep();
  };

  const canProceed = orgName && orgSlug && isSlugAvailable === true;

  return (
    <form onSubmit={handleNext}>
      <h2 className="text-2xl font-semibold text-white mb-2">Tell us about your organization</h2>
      <p className="text-slate-400 mb-8">This will create your RedScan workspace.</p>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="orgName">Organization Name</Label>
          <Input 
            id="orgName" 
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="Your Company Inc."
            required
            className="bg-[#1E1E1E]/50 border-[#8A8A8A]/20 text-white"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="orgSlug">RedScan URL</Label>
          <div className="flex items-center">
            <span className="text-slate-400 bg-[#1E1E1E] border border-r-0 border-[#8A8A8A]/20 rounded-l-md px-3 py-2 text-sm">
              app.redscan.ai/
            </span>
            <Input 
              id="orgSlug" 
              value={orgSlug}
              onChange={(e) => setOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              required
              minLength={3}
              className="bg-[#1E1E1E]/50 border-[#8A8A8A]/20 rounded-l-none text-white"
            />
            <div className="w-8 h-10 flex items-center justify-center ml-2">
              {isCheckingSlug && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
              {isSlugAvailable === true && !isCheckingSlug && <CheckCircle2 className="w-4 h-4 text-green-400" />}
              {isSlugAvailable === false && !isCheckingSlug && <XCircle className="w-4 h-4 text-red-400" />}
            </div>
          </div>
          {isSlugAvailable === false && (
            <p className="text-sm text-red-400">This URL is already taken. Please choose a different name.</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="primaryDomain">Primary Email Domain</Label>
          <Input 
            id="primaryDomain"
            value={data.primaryDomain}
            disabled 
            className="bg-[#1E1E1E]/80 border-[#8A8A8A]/20 cursor-not-allowed text-slate-400"
          />
          <p className="text-xs text-slate-500">
            Based on your sign-in email. This will be used for user verification and domain claiming.
          </p>
        </div>
      </div>
      
      <div className="mt-8">
        <Button 
          type="submit" 
          disabled={!canProceed} 
          className="w-full bg-[#B00020] hover:bg-[#8B0000] disabled:opacity-50"
        >
          Continue
        </Button>
      </div>
    </form>
  );
}