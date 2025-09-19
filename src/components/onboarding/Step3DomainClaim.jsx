import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DomainVerification } from '@/api/entities';
import { Copy, RefreshCw, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function Step3DomainClaim({ data, nextStep, prevStep }) {
  const [verificationToken, setVerificationToken] = useState('');

  useEffect(() => {
    // Generate a unique token for domain verification
    setVerificationToken(`redscan-verify=${Math.random().toString(36).substring(2, 15)}`);
  }, []);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleSendEmailVerification = () => {
    toast.info("Verification Email Sent (Simulated)", {
      description: `An email has been sent to admin@${data.primaryDomain} with a verification link.`
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-white mb-2">Verify your domain</h2>
      <p className="text-slate-400 mb-8">Prove you own <span className="font-medium text-red-400">{data.primaryDomain}</span> to unlock security features and auto-join for your team.</p>
      
      <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 space-y-4">
        <p className="text-slate-300">Add the following TXT record to your domain's DNS settings:</p>
        <div className="space-y-2">
          <Label>Record Type</Label>
          <Input value="TXT" disabled className="bg-slate-800" />
        </div>
        <div className="space-y-2">
          <Label>Host / Name</Label>
          <Input value="@" disabled className="bg-slate-800" />
        </div>
        <div className="space-y-2">
          <Label>Value / Content</Label>
          <div className="flex gap-2">
            <Input value={verificationToken} readOnly className="bg-slate-800 font-mono" />
            <Button variant="ghost" size="icon" onClick={() => handleCopy(verificationToken)}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-slate-500">DNS changes can take up to 24 hours to propagate. You can continue and verify this later from your organization settings.</p>
      </div>

      <div className="text-center my-6 text-slate-500 text-sm">OR</div>

      <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
        <p className="text-slate-300 mb-4">Alternatively, we can send a verification link to an admin email address at your domain.</p>
        <Button onClick={handleSendEmailVerification} variant="outline" className="w-full">
          <Mail className="w-4 h-4 mr-2" />
          Send Verification Email to admin@{data.primaryDomain}
        </Button>
      </div>

      <div className="mt-8 flex gap-4">
        <Button variant="outline" onClick={prevStep} className="flex-1">Back</Button>
        <Button onClick={nextStep} className="flex-1 bg-red-600 hover:bg-red-700">Verify Later & Continue</Button>
      </div>
    </div>
  );
}