import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Organization, User, Subscription, AuthPolicy, DomainVerification, OnboardingAuditLog, Invitation 
} from '@/api/entities';
import { Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { addDays } from 'date-fns';
import { createPageUrl } from '@/utils';

import Step1Organization from '../components/onboarding/Step1Organization';
import Step2DomainClaim from '../components/onboarding/Step2DomainClaim';
import Step3PlanTrial from '../components/onboarding/Step3PlanTrial';
import Step4ConnectAccounts from '../components/onboarding/Step4ConnectAccounts';
import Step5SecurityDefaults from '../components/onboarding/Step5SecurityDefaults';
import Step6InviteTeam from '../components/onboarding/Step6InviteTeam';
import Step7Finish from '../components/onboarding/Step7Finish';

const STEPS = [
  'Organization',
  'Domain', 
  'Plan & Trial',
  'Connect Accounts', 
  'Security Defaults',
  'Invite Team',
  'Finish'
];

export default function GetStartedPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [onboardingData, setOnboardingData] = useState({
    user: null,
    provider: '',
    orgName: '',
    orgSlug: '',
    billingEmail: '',
    primaryDomain: '',
    plan: 'pro_trial',
    seats: 10,
    invites: [],
    securityDefaults: {
      enforceMFA: true,
      applyEndpointBaselines: true,
      blockLegacyAuth: true
    },
    connectedAccounts: {
      microsoft365: false,
      googleWorkspace: false
    }
  });

  const location = useLocation();
  const navigate = useNavigate();
  const isDemo = new URLSearchParams(location.search).get('demo') === 'true';

  const updateData = useCallback((data) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
  }, []);

  useEffect(() => {
    // Check if we have auth data from login
    const storedUser = sessionStorage.getItem('onboarding_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      const domain = user.email.split('@')[1];
      
      updateData({
        user,
        provider: user.provider,
        billingEmail: user.email,
        primaryDomain: domain,
        orgName: isDemo ? 'Demo Startup Inc.' : domain.split('.')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      });
    } else if (!isDemo) {
      // No auth data and not demo - redirect to home
      navigate(createPageUrl('Home'));
    } else if (isDemo) {
      // Demo mode
      const demoUser = {
        full_name: 'Demo User',
        email: 'demo@startup.com',
        provider: 'demo'
      };
      updateData({
        user: demoUser,
        provider: 'demo',
        billingEmail: demoUser.email,
        primaryDomain: 'startup.com',
        orgName: 'Demo Startup Inc.'
      });
    }
  }, [isDemo, navigate, updateData]);

  const finishOnboarding = async () => {
    setLoading(true);
    try {
      // 1. Create Organization
      const newOrg = await Organization.create({
        name: onboardingData.orgName,
        slug: onboardingData.orgSlug,
        primary_domain: onboardingData.primaryDomain,
        billing_email: onboardingData.billingEmail,
        subscription_tier: onboardingData.plan === 'pro_trial' ? 'trial' : onboardingData.plan,
        trial_end_date: onboardingData.plan === 'pro_trial' ? addDays(new Date(), 14).toISOString() : null,
        seats: onboardingData.seats,
        status: 'active'
      });

      await OnboardingAuditLog.create({ 
        step: 'org_created', 
        user_email: onboardingData.user.email, 
        organization_id: newOrg.id, 
        organization_name: newOrg.name,
        selected_plan: onboardingData.plan
      });

      // 2. Create admin user
      const newUser = await User.create({
        full_name: onboardingData.user.full_name,
        email: onboardingData.user.email,
        role: 'admin',
        organization_id: newOrg.id,
        identity_provider: onboardingData.provider
      });

      // 3. Create Subscription
      await Subscription.create({
        organization_id: newOrg.id,
        plan: onboardingData.plan === 'pro_trial' ? 'pro' : onboardingData.plan,
        status: onboardingData.plan === 'pro_trial' ? 'trialing' : 'active',
        seats: onboardingData.seats,
        start_date: new Date().toISOString(),
        trial_end_date: onboardingData.plan === 'pro_trial' ? addDays(new Date(), 14).toISOString() : null,
        next_renewal_date: addDays(new Date(), onboardingData.plan === 'pro_trial' ? 14 : 30).toISOString(),
        monthly_amount: onboardingData.plan === 'free' ? 0 : onboardingData.plan === 'pro' ? 2900 : 9900
      });
      
      // 4. Create Auth Policy with security defaults
      await AuthPolicy.create({
        organization_id: newOrg.id,
        mfa_policy: onboardingData.securityDefaults.enforceMFA ? 'required_all' : 'optional',
        sso_enforcement: 'off',
        allowed_providers: ['google', 'microsoft'],
        password_policy: {
          min_length: 12,
          require_upper: true,
          require_lower: true,
          require_number: true,
          require_symbol: true
        }
      });

      // 5. Create Domain Verification record
      await DomainVerification.create({
        domain: onboardingData.primaryDomain,
        organization_id: newOrg.id,
        status: 'pending_txt',
        txt_record_token: `redscan-verify=${Math.random().toString(36).substring(2, 15)}`,
        initiated_by: onboardingData.user.email
      });

      // 6. Send Invites
      if (onboardingData.invites.length > 0) {
        const invitePromises = onboardingData.invites.map(invite => 
          Invitation.create({
            email: invite.email,
            role: invite.role || 'viewer',
            organization_id: newOrg.id,
            expires_at: addDays(new Date(), 7).toISOString()
          })
        );
        await Promise.all(invitePromises);
      }

      await OnboardingAuditLog.create({ 
        step: 'finished', 
        user_email: onboardingData.user.email, 
        organization_id: newOrg.id, 
        selected_plan: onboardingData.plan 
      });

      // Clear temporary session data
      sessionStorage.removeItem('onboarding_user');

      const trialMessage = onboardingData.plan === 'pro_trial' ? 
        `Welcome to RedScan! Your Pro trial is active until ${addDays(new Date(), 14).toLocaleDateString()}.` :
        'Welcome to RedScan! Your account is ready.';
        
      toast.success(trialMessage);
      navigate(createPageUrl('Dashboard') + '?first_run=true');

    } catch (error) {
      console.error("Onboarding failed:", error);
      toast.error("Onboarding Failed", { 
        description: "Something went wrong. Please try again or contact support." 
      });
      await OnboardingAuditLog.create({ 
        step: `error_at_step_${step}`, 
        user_email: onboardingData.user?.email || 'unknown', 
        error_message: error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0: return (
        <Step1Organization 
          data={onboardingData} 
          updateData={updateData} 
          nextStep={() => setStep(1)} 
        />
      );
      case 1: return (
        <Step2DomainClaim 
          data={onboardingData} 
          updateData={updateData} 
          nextStep={() => setStep(2)} 
          prevStep={() => setStep(0)} 
        />
      );
      case 2: return (
        <Step3PlanTrial 
          data={onboardingData} 
          updateData={updateData} 
          nextStep={() => setStep(3)} 
          prevStep={() => setStep(1)} 
        />
      );
      case 3: return (
        <Step4ConnectAccounts 
          data={onboardingData} 
          updateData={updateData} 
          nextStep={() => setStep(4)} 
          prevStep={() => setStep(2)} 
        />
      );
      case 4: return (
        <Step5SecurityDefaults 
          data={onboardingData} 
          updateData={updateData} 
          nextStep={() => setStep(5)} 
          prevStep={() => setStep(3)} 
        />
      );
      case 5: return (
        <Step6InviteTeam 
          data={onboardingData} 
          updateData={updateData} 
          nextStep={() => setStep(6)} 
          prevStep={() => setStep(4)} 
        />
      );
      case 6: return (
        <Step7Finish 
          data={onboardingData} 
          finishOnboarding={finishOnboarding} 
          prevStep={() => setStep(5)} 
          loading={loading} 
        />
      );
      default: return (
        <Step1Organization 
          data={onboardingData} 
          updateData={updateData} 
          nextStep={() => setStep(1)} 
        />
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white flex flex-col items-center justify-center p-4 relative">
      <div className="absolute inset-0 opacity-5">
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="onboardingHex" patternUnits="userSpaceOnUse" width="20" height="17.32">
              <polygon points="10,1 18.66,6 18.66,15 10,20 1.34,15 1.34,6" fill="none" stroke="#B00020" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#onboardingHex)" />
        </svg>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-[#1E1E1E]/50 rounded-lg border border-[#8A8A8A]/20 mb-4">
            <Shield className="w-8 h-8 text-[#B00020]" />
          </div>
          <h1 className="text-3xl font-bold mt-4">Welcome to RedScan</h1>
          <p className="text-slate-400">Let's get your organization secured in minutes.</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEPS.map((s, i) => (
              <span key={i} className={`text-xs font-medium ${i <= step ? 'text-white' : 'text-slate-500'}`}>
                {s}
              </span>
            ))}
          </div>
          <div className="w-full bg-[#8A8A8A]/20 rounded-full h-2">
            <div 
              className="bg-[#B00020] h-2 rounded-full transition-all duration-500" 
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-[#1E1E1E]/80 border border-[#8A8A8A]/20 rounded-xl p-6 md:p-8 shadow-2xl backdrop-blur-sm">
          {renderStep()}
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-slate-500">
            RedScan — Powered by <span className="text-[#B00020] font-medium">Reddome.org</span>
          </p>
        </div>
      </div>
    </div>
  );
}