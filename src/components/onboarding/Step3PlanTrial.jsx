import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const PLANS = {
  free: {
    name: 'Free',
    price: '$0 forever',
    assets: '5 assets',
    users: '3 users',
    features: ['Basic Security Scans', 'Manual Remediation', 'Community Support'],
    highlight: false
  },
  pro_trial: {
    name: 'Pro Trial',
    price: 'Free for 14 days, then $29/month',
    assets: '100 assets',
    users: 'Up to 25 users',
    features: ['Advanced Security Scans', 'AI Auto-Pilot Mode', 'Compliance Templates', 'Priority Support'],
    highlight: true
  },
  enterprise: {
    name: 'Enterprise',
    price: 'Contact for pricing',
    assets: 'Unlimited assets',
    users: 'Unlimited users',
    features: ['Everything in Pro', 'Custom Compliance', 'Dedicated Support', 'SLA Guarantees'],
    highlight: false
  }
};

const PlanCard = ({ planKey, data, updateData }) => {
  const plan = PLANS[planKey];
  const isSelected = data.plan === planKey;

  return (
    <div 
      onClick={() => updateData({ plan: planKey })}
      className={cn(
        "border rounded-lg p-6 cursor-pointer transition-all relative",
        isSelected ? 
          "border-[#B00020] ring-2 ring-[#B00020]/50 bg-[#1E1E1E]/50" : 
          "border-[#8A8A8A]/20 bg-[#1E1E1E]/30 hover:border-[#8A8A8A]/40"
      )}
    >
      {plan.highlight && (
        <Badge className="absolute -top-3 left-6 bg-[#B00020] text-white">
          <Zap className="w-3 h-3 mr-1" />
          Recommended
        </Badge>
      )}
      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
      <p className="text-slate-400 mb-4">{plan.price}</p>
      <div className="mb-4">
        <p className="text-sm text-slate-300 mb-1">{plan.assets}</p>
        <p className="text-sm text-slate-300">{plan.users}</p>
      </div>
      <div className="space-y-2">
        {plan.features.map((feature, i) => (
          <div key={i} className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400" />
            <span className="text-sm text-slate-300">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Step3PlanTrial({ data, updateData, nextStep, prevStep }) {
  const selectedPlan = PLANS[data.plan];
  const showSeatsInput = data.plan === 'pro_trial' || data.plan === 'enterprise';

  const handleSeatsChange = (seats) => {
    const numSeats = Math.max(1, Math.min(1000, parseInt(seats) || 1));
    updateData({ seats: numSeats });
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-white mb-2">Choose your plan</h2>
      <p className="text-slate-400 mb-8">
        Start with a 14-day Pro trial or select another plan. You can change anytime.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <PlanCard planKey="free" data={data} updateData={updateData} />
        <PlanCard planKey="pro_trial" data={data} updateData={updateData} />
        <PlanCard planKey="enterprise" data={data} updateData={updateData} />
      </div>

      {showSeatsInput && (
        <div className="mb-8">
          <div className="bg-[#1E1E1E]/50 p-4 rounded-lg border border-[#8A8A8A]/20">
            <Label htmlFor="seats" className="text-white mb-2 block">
              How many users will need access to RedScan?
            </Label>
            <div className="flex items-center gap-4">
              <Input
                id="seats"
                type="number"
                min="1"
                max="1000"
                value={data.seats}
                onChange={(e) => handleSeatsChange(e.target.value)}
                className="w-24 bg-[#1E1E1E] border-[#8A8A8A]/20 text-white"
              />
              <span className="text-slate-400 text-sm">
                seats included in {selectedPlan?.name}
              </span>
            </div>
            {data.plan === 'pro_trial' && (
              <p className="text-xs text-slate-500 mt-2">
                After your trial, you'll be charged ${Math.round(data.seats * 2900 / 100)}/month for {data.seats} seats.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-8">
        <h4 className="font-medium text-white mb-2">✨ What's included in your trial:</h4>
        <ul className="text-sm text-slate-300 space-y-1">
          <li>• AI Auto-Pilot continuously secures your environment</li>
          <li>• Cyber Essentials+ compliance templates and guidance</li>
          <li>• Automated endpoint and cloud security baselines</li>
          <li>• Supplier risk management and due diligence</li>
          <li>• Priority support and onboarding assistance</li>
        </ul>
      </div>

      <div className="mt-8 flex gap-4">
        <Button variant="outline" onClick={prevStep} className="flex-1">
          Back
        </Button>
        <Button onClick={nextStep} className="flex-1 bg-[#B00020] hover:bg-[#8B0000]">
          Continue with {selectedPlan?.name}
        </Button>
      </div>
    </div>
  );
}