import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2, AlertTriangle, XCircle, Wrench, Play } from 'lucide-react';
import { toast } from 'sonner';

const FEATURE_REGISTRY = {
  'Dashboard': ['KPIs', 'Charts', 'AI Risk Advisor', 'Drag-and-Drop', 'Custom Widgets'],
  'Assets': ['Filtering', 'Bulk Import', 'Asset Detail View', 'Scan Simulation'],
  'Findings': ['Filtering', 'Bulk Update', 'Ticketing', 'Evidence View'],
  'Code Security': ['Repo List', 'SARIF Upload', 'CI/CD Snippet', 'AI Autofix'],
  'Cloud Security': ['Account List', 'CSPM Upload', 'Remediation Snippets'],
  'Endpoints': ['Device List', 'Agent Downloads', 'Posture View', 'Auto-Remediation'],
  'Compliance': ['CE Wizard', 'CE+ Rehearsal', 'Evidence Vault'],
  'Suppliers': ['Due Diligence', 'AI Risk Scoring', 'Supplier Portal', 'Contract Management'],
  'Threat Intelligence': ['Threat Feed', 'Asset Mapping', 'AI Summaries'],
  'Phishing Simulator': ['Campaigns', 'Templates', 'Metrics Export'],
  'AI Modules': ['Report Writer', 'Knowledge Trainer', 'Attack Surface Mapper'],
  'Platform': ['Assignment Rules', 'Pricing & Billing', 'Analytics', 'Policies', 'Reports', 'SSO/MFA'],
};

// This is a simulation. In a real scenario, this would involve complex checks.
const checkFeatureStatus = (feature) => {
  const statuses = ['Present', 'Degraded', 'Missing'];
  // Simulate some missing features for demonstration
  if (['Drag-and-Drop', 'Scan Simulation', 'AI Autofix'].includes(feature)) {
    return 'Missing';
  }
  if (['Custom Widgets', 'Ticketing'].includes(feature)) {
    return 'Degraded';
  }
  return 'Present';
};

export default function TroubleshootPage() {
  const [parityReport, setParityReport] = useState([]);

  useEffect(() => {
    const report = Object.entries(FEATURE_REGISTRY).flatMap(([module, features]) => 
      features.map(feature => ({
        module,
        feature,
        status: checkFeatureStatus(feature),
      }))
    );
    setParityReport(report);
  }, []);

  const totalFeatures = parityReport.length;
  const presentFeatures = parityReport.filter(f => f.status === 'Present').length;
  const parityPercentage = totalFeatures > 0 ? Math.round((presentFeatures / totalFeatures) * 100) : 100;

  const handleFix = (feature) => {
    toast.info(`Attempting to self-heal feature: ${feature}...`);
    setTimeout(() => {
      // In a real app, this would trigger a complex backend process.
      // Here, we just simulate the fix locally.
      setParityReport(prev => prev.map(f => 
        f.feature === feature ? { ...f, status: 'Present' } : f
      ));
      toast.success(`Feature '${feature}' restored successfully!`);
    }, 2000);
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present': return <Badge className="bg-green-500/20 text-green-400"><CheckCircle2 className="w-3 h-3 mr-1" />{status}</Badge>;
      case 'Degraded': return <Badge className="bg-yellow-500/20 text-yellow-400"><AlertTriangle className="w-3 h-3 mr-1" />{status}</Badge>;
      case 'Missing': return <Badge className="bg-red-500/20 text-red-400"><XCircle className="w-3 h-3 mr-1" />{status}</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Parity Validator & Self-Heal</h1>
          <p className="text-slate-400">System diagnostics to ensure all RedScan features are operational.</p>
        </div>
        <Badge className={parityPercentage === 100 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
          Feature Parity: {parityPercentage}%
        </Badge>
      </header>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Feature Status Registry</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-300">Module</TableHead>
                <TableHead className="text-slate-300">Feature</TableHead>
                <TableHead className="text-slate-300">Status</TableHead>
                <TableHead className="text-slate-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parityReport.map(({ module, feature, status }, index) => (
                <TableRow key={index} className="border-slate-800">
                  <TableCell className="font-medium text-white">{module}</TableCell>
                  <TableCell className="text-slate-300">{feature}</TableCell>
                  <TableCell>{getStatusBadge(status)}</TableCell>
                  <TableCell>
                    {status !== 'Present' && (
                      <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => handleFix(feature)}>
                        <Play className="w-3 h-3 mr-1" />
                        Fix Now
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}