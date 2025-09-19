import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Copy, RefreshCw, Mail, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Step2DomainClaim({ data, nextStep, prevStep }) {
  const [verificationToken, setVerificationToken] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('unverified'); // unverified, pending, verified
  const [selectedMethod, setSelectedMethod] = useState('dns'); // dns, email

  useEffect(() => {
    // Generate a unique token for domain verification
    setVerificationToken(`redscan-verify=${Math.random().toString(36).substring(2, 15)}`);
  }, []);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleSendEmailVerification = () => {
    setVerificationStatus('pending');
    toast.info("Verification Email Sent", {
      description: `An email has been sent to admin@${data.primaryDomain} with a verification link.`
    });
  };

  const handleDNSVerification = () => {
    setVerificationStatus('pending');
    toast.info("DNS Verification Started", {
      description: "We'll check for the TXT record. This may take a few minutes to propagate."
    });
  };

  const simulateVerification = () => {
    setVerificationStatus('verified');
    toast.success("Domain verified successfully!");
  };

  const getStatusBadge = () => {
    switch (verificationStatus) {
      case 'verified':
        return <Badge className="bg-green-500/20 text-green-400"><CheckCircle2 className="w-3 h-3 mr-1" />Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400">Pending Verification</Badge>;
      default:
        return <Badge className="bg-red-500/20 text-red-400">Unverified</Badge>;
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-white mb-2">Verify your domain</h2>
      <div className="flex items-center gap-3 mb-6">
        <p className="text-slate-400">
          Prove you own <span className="font-medium text-[#B00020]">{data.primaryDomain}</span> to unlock security features
        </p>
        {getStatusBadge()}
      </div>
      
      {/* Verification Method Tabs */}
      <div className="flex mb-6 bg-[#1E1E1E]/50 rounded-lg p-1 border border-[#8A8A8A]/20">
        <button
          onClick={() => setSelectedMethod('dns')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            selectedMethod === 'dns' ? 'bg-[#B00020] text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          DNS Verification
        </button>
        <button
          onClick={() => setSelectedMethod('email')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            selectedMethod === 'email' ? 'bg-[#B00020] text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Email Verification
        </button>
      </div>

      {selectedMethod === 'dns' && (
        <div className="bg-[#1E1E1E]/50 p-4 rounded-lg border border-[#8A8A8A]/20 space-y-4 mb-6">
          <p className="text-slate-300">Add the following TXT record to your domain's DNS settings:</p>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Record Type</Label>
              <Input value="TXT" disabled className="bg-[#1E1E1E] text-slate-400" />
            </div>
            <div className="space-y-2">
              <Label>Host / Name</Label>
              <Input value="@" disabled className="bg-[#1E1E1E] text-slate-400" />
            </div>
            <div className="space-y-2">
              <Label>Value / Content</Label>
              <div className="flex gap-2">
                <Input value={verificationToken} readOnly className="bg-[#1E1E1E] font-mono text-slate-300" />
                <Button variant="outline" size="icon" onClick={() => handleCopy(verificationToken)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            DNS changes can take up to 24 hours to propagate. Click "Verify DNS" when ready.
          </p>
          <div className="flex gap-2">
            <Button onClick={handleDNSVerification} disabled={verificationStatus === 'pending'}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Verify DNS
            </Button>
            {/* Demo helper */}
            <Button onClick={simulateVerification} variant="outline" size="sm" className="text-xs">
              (Demo: Simulate Success)
            </Button>
          </div>
        </div>
      )}

      {selectedMethod === 'email' && (
        <div className="bg-[#1E1E1E]/50 p-4 rounded-lg border border-[#8A8A8A]/20 mb-6">
          <p className="text-slate-300 mb-4">
            We'll send a verification link to an admin email address at your domain.
          </p>
          <div className="flex gap-2">
            <Button onClick={handleSendEmailVerification} disabled={verificationStatus === 'pending'}>
              <Mail className="w-4 h-4 mr-2" />
              Send to admin@{data.primaryDomain}
            </Button>
            {/* Demo helper */}
            <Button onClick={simulateVerification} variant="outline" size="sm" className="text-xs">
              (Demo: Simulate Success)
            </Button>
          </div>
          {verificationStatus === 'pending' && (
            <p className="text-sm text-yellow-400 mt-2">
              Check your email and click the verification link.
            </p>
          )}
        </div>
      )}

      <div className="mt-8 flex gap-4">
        <Button variant="outline" onClick={prevStep} className="flex-1">
          Back
        </Button>
        <Button 
          onClick={nextStep} 
          className="flex-1 bg-[#B00020] hover:bg-[#8B0000]"
        >
          {verificationStatus === 'verified' ? 'Continue' : 'Verify Later & Continue'}
        </Button>
      </div>

      {verificationStatus !== 'verified' && (
        <p className="text-xs text-slate-500 mt-4 text-center">
          You can complete domain verification later from your organization settings.
        </p>
      )}
    </div>
  );
}