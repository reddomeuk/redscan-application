import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Crown, Zap, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for individuals and small teams getting started',
    icon: Zap,
    color: 'border-slate-600',
    features: {
      assets: '5 assets',
      scans: 'Basic security scans',
      findings: 'Vulnerability tracking', 
      reports: 'Basic reports',
      users: '3 team members',
      support: 'Community support',
      sso: false,
      api: false,
      custom_integrations: false,
      priority_support: false,
      advanced_analytics: false,
      custom_policies: false
    }
  },
  {
    name: 'Pro',
    price: '$29',
    period: 'per user/month',
    description: 'Advanced security for growing teams',
    icon: Crown,
    color: 'border-blue-500',
    popular: true,
    features: {
      assets: '100 assets',
      scans: 'Advanced security scans',
      findings: 'AI-powered vulnerability triage',
      reports: 'Custom reports & dashboards',
      users: '25 team members',
      support: 'Priority email support',
      sso: true,
      api: true,
      custom_integrations: false,
      priority_support: true,
      advanced_analytics: true,
      custom_policies: true
    }
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'pricing',
    description: 'Complete security platform for large organizations',
    icon: Building,
    color: 'border-purple-500',
    features: {
      assets: 'Unlimited assets',
      scans: 'Enterprise security suite',
      findings: 'Advanced AI + human review',
      reports: 'White-label reports',
      users: 'Unlimited team members',
      support: '24/7 phone & chat support',
      sso: true,
      api: true,
      custom_integrations: true,
      priority_support: true,
      advanced_analytics: true,
      custom_policies: true
    }
  }
];

const FeatureComparison = () => {
  const features = [
    { category: 'Assets & Scanning', items: [
      { name: 'Asset monitoring', free: '5 assets', pro: '100 assets', enterprise: 'Unlimited' },
      { name: 'Security scans', free: 'Basic', pro: 'Advanced', enterprise: 'Enterprise suite' },
      { name: 'Scan scheduling', free: false, pro: true, enterprise: true },
      { name: 'Custom scan policies', free: false, pro: true, enterprise: true }
    ]},
    { category: 'Vulnerability Management', items: [
      { name: 'Vulnerability tracking', free: true, pro: true, enterprise: true },
      { name: 'AI-powered triage', free: false, pro: true, enterprise: true },
      { name: 'Risk scoring', free: 'Basic', pro: 'Advanced', enterprise: 'AI-enhanced' },
      { name: 'Remediation guidance', free: 'Basic', pro: 'Detailed', enterprise: 'Expert review' }
    ]},
    { category: 'Reporting & Analytics', items: [
      { name: 'Security reports', free: 'Basic', pro: 'Custom', enterprise: 'White-label' },
      { name: 'Dashboard widgets', free: '5 widgets', pro: '20 widgets', enterprise: 'Unlimited' },
      { name: 'Advanced analytics', free: false, pro: true, enterprise: true },
      { name: 'Compliance reporting', free: false, pro: true, enterprise: true }
    ]},
    { category: 'Team & Access', items: [
      { name: 'Team members', free: '3 users', pro: '25 users', enterprise: 'Unlimited' },
      { name: 'Role-based access', free: true, pro: true, enterprise: true },
      { name: 'SSO integration', free: false, pro: true, enterprise: true },
      { name: 'Multi-factor auth', free: false, pro: true, enterprise: true }
    ]},
    { category: 'Integrations & API', items: [
      { name: 'REST API access', free: false, pro: true, enterprise: true },
      { name: 'Webhook integrations', free: false, pro: true, enterprise: true },
      { name: 'ITSM integrations', free: false, pro: 'Basic', enterprise: 'Advanced' },
      { name: 'Custom integrations', free: false, pro: false, enterprise: true }
    ]},
    { category: 'Support', items: [
      { name: 'Support level', free: 'Community', pro: 'Priority email', enterprise: '24/7 phone & chat' },
      { name: 'Response time', free: 'Best effort', pro: '24 hours', enterprise: '4 hours' },
      { name: 'Onboarding', free: 'Self-service', pro: 'Guided setup', enterprise: 'Dedicated CSM' },
      { name: 'Training', free: 'Documentation', pro: 'Video tutorials', enterprise: 'Live training' }
    ]}
  ];

  const renderFeatureValue = (value) => {
    if (value === true) return <Check className="w-5 h-5 text-green-400" />;
    if (value === false) return <X className="w-5 h-5 text-slate-500" />;
    return <span className="text-slate-300 text-sm">{value}</span>;
  };

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-white mb-8 text-center">Feature Comparison</h2>
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
        <div className="grid grid-cols-4 gap-4 p-4 border-b border-slate-700 bg-slate-900/50">
          <div className="font-medium text-white">Features</div>
          <div className="font-medium text-center text-white">Free</div>
          <div className="font-medium text-center text-white">Pro</div>
          <div className="font-medium text-center text-white">Enterprise</div>
        </div>
        
        {features.map((category, categoryIndex) => (
          <div key={categoryIndex}>
            <div className="p-4 bg-slate-900/30 border-b border-slate-700">
              <h3 className="font-medium text-slate-200">{category.category}</h3>
            </div>
            {category.items.map((item, itemIndex) => (
              <div key={itemIndex} className="grid grid-cols-4 gap-4 p-4 border-b border-slate-700 hover:bg-slate-800/30">
                <div className="text-slate-300">{item.name}</div>
                <div className="text-center">{renderFeatureValue(item.free)}</div>
                <div className="text-center">{renderFeatureValue(item.pro)}</div>
                <div className="text-center">{renderFeatureValue(item.enterprise)}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function PricingPage() {
  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-[#1E1E1E] via-[#2A2A2A] to-[#1E1E1E] min-h-screen text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Choose Your RedScan Plan
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Protect your digital assets with the RedScan Security Platform. 
            Start free and scale as your team grows.
          </p>
          <div className="mt-6">
            <Link to={createPageUrl('GetStarted')}>
              <Button size="lg" className="bg-[#B00020] hover:bg-[#8B0000] text-white">Get Started for Free</Button>
            </Link>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card key={plan.name} className={`relative bg-[#1E1E1E]/50 border ${plan.color} backdrop-blur-sm ${plan.popular ? 'ring-2 ring-blue-500' : 'border-[#8A8A8A]/20'}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-3">
                    <Icon className={`w-8 h-8 ${plan.name === 'Pro' ? 'text-blue-400' : 'text-[#B00020]'}`} />
                  </div>
                  <CardTitle className="text-2xl font-bold text-white">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-white">
                    {plan.price}
                    <span className="text-sm font-normal text-slate-400">/{plan.period}</span>
                  </div>
                  <p className="text-slate-400">{plan.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {Object.values(plan.features).map((feature, index) => {
                      if (typeof feature === 'string') {
                        return (
                          <div key={index} className="flex items-center gap-3">
                            <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                            <span className="text-slate-300">{feature}</span>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                  
                  <div className="pt-4">
                    {plan.name === 'Enterprise' ? (
                      <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                        Contact Sales
                      </Button>
                    ) : (
                      <Link to={createPageUrl('Billing')}>
                        <Button className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#B00020] hover:bg-[#8B0000]'} text-white`}>
                          {plan.name === 'Free' ? 'Get Started Free' : 'Start 14-Day Trial'}
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* <FeatureComparison /> */}

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-white mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-[#1E1E1E]/50 border border-[#8A8A8A]/20 text-left">
              <CardContent className="p-6">
                <h3 className="font-medium text-white mb-2">Can I change plans anytime?</h3>
                <p className="text-slate-400 text-sm">Yes, you can upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle.</p>
              </CardContent>
            </Card>
            <Card className="bg-[#1E1E1E]/50 border border-[#8A8A8A]/20 text-left">
              <CardContent className="p-6">
                <h3 className="font-medium text-white mb-2">What happens during the trial?</h3>
                <p className="text-slate-400 text-sm">You get full access to Pro features for 14 days. No credit card required to start.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}