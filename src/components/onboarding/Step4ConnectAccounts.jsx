import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ExternalLink, Shield } from 'lucide-react';
import { toast } from 'sonner';

// Mock SVG icons for providers
const MicrosoftIcon = () => (
  <svg viewBox="0 0 21 21" className="w-8 h-8">
    <path fill="#f25022" d="M1 1h9v9H1z"/>
    <path fill="#00a4ef" d="M1 11h9v9H1z"/>
    <path fill="#7fba00" d="M11 1h9v9h-9z"/>
    <path fill="#ffb900" d="M11 11h9v9h-9z"/>
  </svg>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" className="w-8 h-8">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.021,35.596,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
  </svg>
);

const ConnectionCard = ({ provider, icon, title, description, connected, onConnect }) => (
  <Card className="bg-[#1E1E1E]/50 border-[#8A8A8A]/20">
    <CardHeader>
      <div className="flex items-center gap-3">
        {icon}
        <div className="flex-1">
          <CardTitle className="text-white text-lg">{title}</CardTitle>
          <p className="text-slate-400 text-sm">{description}</p>
        </div>
        {connected && <Badge className="bg-green-500/20 text-green-400">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Connected
        </Badge>}
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="text-sm text-slate-300">
          <p className="font-medium mb-2">This enables RedScan to:</p>
          <ul className="space-y-1 text-xs text-slate-400">
            <li>• Enforce MFA across all accounts</li>
            <li>• Apply security baselines to devices</li>
            <li>• Monitor for risky sign-ins</li>
            <li>• Collect compliance evidence automatically</li>
          </ul>
        </div>
        
        <Button 
          onClick={() => onConnect(provider)}
          disabled={connected}
          className={connected ? "bg-green-600 hover:bg-green-600" : "bg-[#B00020] hover:bg-[#8B0000]"}
        >
          {connected ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Connected
            </>
          ) : (
            <>
              <ExternalLink className="w-4 h-4 mr-2" />
              Connect {title}
            </>
          )}
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default function Step4ConnectAccounts({ data, updateData, nextStep, prevStep }) {
  const handleConnect = (provider) => {
    // Simulate OAuth connection
    toast.success(`${provider} connected successfully!`);
    updateData({
      connectedAccounts: {
        ...data.connectedAccounts,
        [provider]: true
      }
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-white mb-2">Connect your accounts</h2>
      <p className="text-slate-400 mb-8">
        Optional but recommended - connecting your accounts lets RedScan apply security settings automatically.
      </p>
      
      <div className="space-y-6 mb-8">
        <ConnectionCard
          provider="microsoft365"
          icon={<MicrosoftIcon />}
          title="Microsoft 365 / Entra"
          description="Connect your Microsoft tenant for automated security"
          connected={data.connectedAccounts.microsoft365}
          onConnect={handleConnect}
        />
        
        <ConnectionCard
          provider="googleWorkspace"
          icon={<GoogleIcon />}
          title="Google Workspace"
          description="Connect your Google Workspace for automated security"
          connected={data.connectedAccounts.googleWorkspace}
          onConnect={handleConnect}
        />
      </div>

      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-8">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-white mb-1">Why connect your accounts?</h4>
            <p className="text-sm text-slate-300 mb-2">
              Connected accounts enable AI Auto-Pilot to automatically apply security fixes while you sleep.
            </p>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• 90% faster compliance with automated evidence collection</li>
              <li>• Immediate threat response without manual intervention</li>
              <li>• Reduced admin overhead with smart policy management</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-4">
        <Button variant="outline" onClick={prevStep} className="flex-1">
          Back
        </Button>
        <Button onClick={nextStep} className="flex-1 bg-[#B00020] hover:bg-[#8B0000]">
          Continue
        </Button>
      </div>

      <p className="text-xs text-slate-500 text-center mt-4">
        You can connect additional accounts later from Settings → Integrations
      </p>
    </div>
  );
}