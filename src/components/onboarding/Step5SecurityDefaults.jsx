import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Shield, Lock, Users, AlertTriangle } from 'lucide-react';

const SecurityToggle = ({ id, icon: Icon, title, description, enabled, onChange, warning }) => (
  <Card className="bg-[#1E1E1E]/50 border-[#8A8A8A]/20">
    <CardContent className="p-4">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-[#B00020]/20 flex-shrink-0">
          <Icon className="w-5 h-5 text-[#B00020]" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor={id} className="text-white font-medium">{title}</Label>
            <Switch id={id} checked={enabled} onCheckedChange={onChange} />
          </div>
          <p className="text-sm text-slate-400">{description}</p>
          {warning && enabled && (
            <div className="mt-2 flex items-center gap-2 text-xs text-yellow-400">
              <AlertTriangle className="w-3 h-3" />
              {warning}
            </div>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function Step5SecurityDefaults({ data, updateData, nextStep, prevStep }) {
  const handleToggle = (setting, value) => {
    updateData({
      securityDefaults: {
        ...data.securityDefaults,
        [setting]: value
      }
    });
  };

  const enabledCount = Object.values(data.securityDefaults).filter(Boolean).length;

  return (
    <div>
      <h2 className="text-2xl font-semibold text-white mb-2">Security defaults</h2>
      <p className="text-slate-400 mb-8">
        These settings will be applied automatically. You can adjust them later in Settings.
      </p>
      
      <div className="space-y-4 mb-8">
        <SecurityToggle
          id="enforceMFA"
          icon={Lock}
          title="Enforce MFA for all users"
          description="Require multi-factor authentication for all cloud logins. Essential for security."
          enabled={data.securityDefaults.enforceMFA}
          onChange={(value) => handleToggle('enforceMFA', value)}
        />
        
        <SecurityToggle
          id="applyEndpointBaselines"
          icon={Shield}
          title="Apply endpoint security baselines"
          description="Automatically configure Windows BitLocker, macOS FileVault, and mobile device policies."
          enabled={data.securityDefaults.applyEndpointBaselines}
          onChange={(value) => handleToggle('applyEndpointBaselines', value)}
          warning="Requires connected Microsoft/Google accounts for full automation"
        />
        
        <SecurityToggle
          id="blockLegacyAuth"
          icon={Users}
          title="Block legacy authentication"
          description="Disable basic authentication protocols that don't support MFA."
          enabled={data.securityDefaults.blockLegacyAuth}
          onChange={(value) => handleToggle('blockLegacyAuth', value)}
          warning="May require updating older email clients and apps"
        />
      </div>

      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-8">
        <h4 className="font-medium text-white mb-2">
          🛡️ Security Score: {enabledCount}/3 settings enabled
        </h4>
        <p className="text-sm text-green-300">
          {enabledCount === 3 ? 
            "Excellent! You're following security best practices." :
            "Consider enabling all settings for maximum protection."
          }
        </p>
      </div>

      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-8">
        <h4 className="font-medium text-white mb-2">What happens next?</h4>
        <ul className="text-sm text-slate-300 space-y-1">
          <li>• Policies will be created and scheduled for deployment</li>
          <li>• Users will receive setup instructions via email</li>
          <li>• Auto-Pilot will monitor and maintain these settings</li>
          <li>• You'll get compliance evidence automatically</li>
        </ul>
      </div>

      <div className="mt-8 flex gap-4">
        <Button variant="outline" onClick={prevStep} className="flex-1">
          Back
        </Button>
        <Button onClick={nextStep} className="flex-1 bg-[#B00020] hover:bg-[#8B0000]">
          Apply Settings & Continue
        </Button>
      </div>
    </div>
  );
}