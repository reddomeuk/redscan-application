import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, AlertTriangle, TrendingDown } from 'lucide-react';

const SupplierRisks = ({ onRemove }) => {
  const mockSuppliers = [
    { name: 'Acme Hosting', riskTier: 'High', issue: 'Missing SOC 2' },
    { name: 'DataCorp Services', riskTier: 'Medium', issue: 'Cert expiring' },
    { name: 'CloudTech Inc', riskTier: 'High', issue: 'Recent breach' }
  ];

  const getRiskColor = (tier) => {
    switch(tier) {
      case 'High': return 'bg-red-500/20 text-red-400';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'Low': return 'bg-green-500/20 text-green-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-orange-400" />
          High Risk Suppliers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockSuppliers.map(supplier => (
            <div key={supplier.name} className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{supplier.name}</p>
                <p className="text-xs text-slate-400">{supplier.issue}</p>
              </div>
              <Badge className={getRiskColor(supplier.riskTier)}>
                {supplier.riskTier}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const SLABreaches = ({ onRemove }) => {
  const mockSLAs = [
    { supplier: 'CloudTech Inc', metric: 'Uptime', target: '99.9%', actual: '98.2%' },
    { supplier: 'DataCorp Services', metric: 'Response Time', target: '4h', actual: '6h' }
  ];

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-red-400" />
          SLA Breaches
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockSLAs.map((sla, index) => (
            <div key={index} className="p-2 bg-slate-900/50 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-white">{sla.supplier}</p>
                <Badge className="bg-red-500/20 text-red-400">Breach</Badge>
              </div>
              <p className="text-xs text-slate-400">{sla.metric}: {sla.actual} (target: {sla.target})</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const MissingCertifications = ({ onRemove }) => {
  const mockMissing = [
    { supplier: 'Acme Hosting', missing: 'SOC 2 Type II', priority: 'High' },
    { supplier: 'TechVendor Ltd', missing: 'ISO 27001', priority: 'Medium' }
  ];

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          Missing Certifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockMissing.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{item.supplier}</p>
                <p className="text-xs text-slate-400">{item.missing}</p>
              </div>
              <Badge className={item.priority === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}>
                {item.priority}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default {
  SupplierRisks,
  SLABreaches,
  MissingCertifications
};