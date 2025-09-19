import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const PLANS = {
  pro_trial: {
    name: 'Pro Trial',
    price: 'Free for 14 days',
    assets: '100 assets',
    users: '10 users',
    features: ['Advanced Security Scans', 'AI-Powered Triage', 'API Access & SSO', 'Priority Support']
  },
  free: {
    name: 'Free',
    price: '$0 forever',
    assets: '5 assets',
    users: '3 users',
    features: ['Basic Security Scans', 'Vulnerability Tracking', 'Basic Reporting', 'Community Support']
  }
};

const PlanCard = ({ planKey, data, updateData }) => {
  const plan = PLANS[planKey];
  const isSelected = data.plan === planKey;

  return (
    <div 
      onClick={() => updateData({ plan: planKey })}
      className={cn(
        "border rounded-lg p-6 cursor-pointer transition-all",
        isSelected ? "border-red-500 ring-2 ring-red-500/50 bg-slate-800" : "border-slate-700 bg-slate-900/50 hover:border-slate-500"
      )}
    >
      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
      <p className="text-slate-400 mb-4">{plan.price}</p>
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

export default function Step4PlanSelection({ data, updateData, nextStep, prevStep }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-white mb-2">Choose your plan</h2>
      <p className="text-slate-400 mb-8">Start with a 14-day Pro trial or select the Free plan.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PlanCard planKey="pro_trial" data={data} updateData={updateData} />
        <PlanCard planKey="free" data={data} updateData={updateData} />
      </div>

      <div className="mt-8 flex gap-4">
        <Button variant="outline" onClick={prevStep} className="flex-1">Back</Button>
        <Button onClick={nextStep} className="flex-1 bg-red-600 hover:bg-red-700">Continue</Button>
      </div>
    </div>
  );
}