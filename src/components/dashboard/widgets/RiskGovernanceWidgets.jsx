import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShieldCheck, AlertTriangle, Clock, TrendingUp } from 'lucide-react';

const TopRisks = ({ onRemove }) => {
  const mockRisks = [
    { id: 1, title: 'Critical web vulnerability', score: 16, status: 'Identified' },
    { id: 2, title: 'MFA not enforced', score: 12, status: 'In Mitigation' },
    { id: 3, title: 'Supplier lacks SOC 2', score: 12, status: 'Identified' },
    { id: 4, title: 'Missing endpoint encryption', score: 9, status: 'In Mitigation' },
    { id: 5, title: 'Exchange CVE exposure', score: 16, status: 'Identified' }
  ];

  const getRiskColor = (score) => {
    if (score > 15) return 'bg-red-500/20 text-red-400';
    if (score > 10) return 'bg-orange-500/20 text-orange-400';
    if (score > 5) return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-green-500/20 text-green-400';
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#B00020]" />
          Top 5 Risks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockRisks.map(risk => (
            <div key={risk.id} className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-white truncate">{risk.title}</p>
                <p className="text-xs text-slate-400">{risk.status}</p>
              </div>
              <Badge className={getRiskColor(risk.score)}>
                {risk.score}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const RiskHeatmap = ({ onRemove }) => {
  const likelihoods = ['Very High', 'High', 'Medium', 'Low'];
  const impacts = ['Low', 'Medium', 'High', 'Critical'];
  
  const mockData = {
    'Very High,Critical': 1,
    'High,Critical': 2,
    'High,High': 3,
    'Medium,High': 2,
    'Low,Critical': 1
  };

  const getColor = (likelihood, impact) => {
    const count = mockData[`${likelihood},${impact}`] || 0;
    if (count > 2) return 'bg-red-500/80';
    if (count > 1) return 'bg-orange-500/80';
    if (count > 0) return 'bg-yellow-500/80';
    return 'bg-slate-700/50';
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-400" />
          Risk Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="flex">
            <div className="w-16"></div>
            {impacts.map(i => (
              <div key={i} className="flex-1 text-center text-xs text-slate-400 pb-1">{i}</div>
            ))}
          </div>
          {likelihoods.map(l => (
            <div key={l} className="flex items-center">
              <div className="w-16 text-xs text-slate-400 text-right pr-2">{l}</div>
              {impacts.map(i => (
                <div key={i} className={`flex-1 m-0.5 h-8 flex items-center justify-center rounded ${getColor(l, i)}`}>
                  <span className="text-white font-bold text-sm">
                    {mockData[`${l},${i}`] || 0}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const AcceptedRisks = ({ onRemove }) => {
  const mockAcceptedRisks = [
    { id: 1, title: 'Legacy finance application', expiryDays: 15 },
    { id: 2, title: 'Third-party integration delay', expiryDays: 42 },
    { id: 3, title: 'Temporary firewall exception', expiryDays: 7 }
  ];

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-yellow-400" />
          Accepted Risks Expiring Soon
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockAcceptedRisks.map(risk => (
            <div key={risk.id} className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-white truncate">{risk.title}</p>
                <p className="text-xs text-slate-400">Accepted Risk</p>
              </div>
              <Badge className={risk.expiryDays <= 14 ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}>
                {risk.expiryDays}d
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default {
  TopRisks,
  RiskHeatmap,
  AcceptedRisks
};