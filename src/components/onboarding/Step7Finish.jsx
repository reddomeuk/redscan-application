import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Users, 
  Shield, 
  Mail, 
  Building2, 
  Calendar,
  Loader2,
  Sparkles
} from 'lucide-react';
import { addDays } from 'date-fns';

const SummaryCard = ({ icon: Icon, title, value, badge }) => (
  <Card className="bg-[#1E1E1E]/50 border-[#8A8A8A]/20">
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[#B00020]/20">
          <Icon className="w-5 h-5 text-[#B00020]" />
        </div>
        <div className="flex-1">
          <div className="text-white font-medium">{title}</div>
          <div className="text-slate-400 text-sm">{value}</div>
        </div>
        {badge}
      </div>
    </CardContent>
  </Card>
);

export default function Step7Finish({ data, finishOnboarding, prevStep, loading }) {
  const trialEndDate = data.plan === 'pro_trial' ? addDays(new Date(), 14) : null;
  const enabledSecurityCount = Object.values(data.securityDefaults).filter(Boolean).length;

  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-[#B00020] to-[#8B0000] rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-white mb-2">Ready to launch!</h2>
        <p className="text-slate-400">
          Review your setup and click finish to create your RedScan workspace.
        </p>
      </div>

      <div className="space-y-4 mb-8">
        <SummaryCard
          icon={Building2}
          title="Organization"
          value={`${data.orgName} (${data.primaryDomain})`}
        />

        <SummaryCard
          icon={Calendar}
          title="Subscription Plan"
          value={data.plan === 'pro_trial' ? 
            `Pro Trial (${data.seats} seats) - ends ${trialEndDate?.toLocaleDateString()}` :
            `${data.plan.charAt(0).toUpperCase() + data.plan.slice(1)} (${data.seats} seats)`
          }
          badge={
            data.plan === 'pro_trial' ? 
              <Badge className="bg-purple-500/20 text-purple-400">14-Day Trial</Badge> : null
          }
        />

        <SummaryCard
          icon={Shield}
          title="Security Defaults"
          value={`${enabledSecurityCount}/3 settings enabled`}
          badge={
            enabledSecurityCount === 3 ? 
              <Badge className="bg-green-500/20 text-green-400">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Secure
              </Badge> : null
          }
        />

        <SummaryCard
          icon={Users}
          title="Team Invitations"
          value={`${data.invites.length} members to invite`}
        />

        {(data.connectedAccounts.microsoft365 || data.connectedAccounts.googleWorkspace) && (
          <SummaryCard
            icon={Mail}
            title="Connected Accounts"
            value={[
              data.connectedAccounts.microsoft365 && 'Microsoft 365',
              data.connectedAccounts.googleWorkspace && 'Google Workspace'
            ].filter(Boolean).join(', ')}
            badge={
              <Badge className="bg-blue-500/20 text-blue-400">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Auto-Pilot Ready
              </Badge>
            }
          />
        )}
      </div>

      <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500/30 rounded-lg p-6 mb-8">
        <h3 className="text-white font-semibold mb-3">🚀 What happens next:</h3>
        <ul className="text-sm text-slate-300 space-y-2">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
            Your RedScan workspace will be created instantly
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
            Security policies will be applied to connected accounts
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
            Team invitations will be sent automatically
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
            AI Auto-Pilot will begin monitoring your environment
          </li>
        </ul>
      </div>

      <div className="mt-8 flex gap-4">
        <Button 
          variant="outline" 
          onClick={prevStep} 
          disabled={loading}
          className="flex-1"
        >
          Back
        </Button>
        <Button 
          onClick={finishOnboarding} 
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-[#B00020] to-[#8B0000] hover:from-[#8B0000] hover:to-[#B00020]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating workspace...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Finish & Launch RedScan
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-slate-500 text-center mt-6">
        By finishing setup, you agree to RedScan's Terms of Service and Privacy Policy
      </p>
    </div>
  );
}