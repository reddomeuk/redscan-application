import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, AlertTriangle } from 'lucide-react';

const CriticalCVEs = ({ onRemove }) => {
  const mockCVEs = [
    { id: 'CVE-2024-1234', title: 'Exchange Server RCE', score: 9.8, assets: 3 },
    { id: 'CVE-2024-5678', title: 'Windows Kernel Elevation', score: 8.1, assets: 15 },
    { id: 'CVE-2024-9012', title: 'Apache Log4j Memory Corruption', score: 9.0, assets: 2 }
  ];

  const getScoreColor = (score) => {
    if (score >= 9.0) return 'bg-red-500/20 text-red-400';
    if (score >= 7.0) return 'bg-orange-500/20 text-orange-400';
    if (score >= 4.0) return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-green-500/20 text-green-400';
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          Critical CVEs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockCVEs.map(cve => (
            <div key={cve.id} className="flex items-start justify-between p-2 bg-slate-900/50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{cve.id}</p>
                <p className="text-xs text-slate-400 truncate">{cve.title}</p>
                <p className="text-xs text-blue-400 mt-1">{cve.assets} assets affected</p>
              </div>
              <Badge className={getScoreColor(cve.score)}>
                {cve.score}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const AISummaries = ({ onRemove }) => {
  const mockSummaries = [
    { title: 'Exchange Server Threats Rising', summary: 'Multiple threat actors targeting Exchange servers with new exploits.' },
    { title: 'Supply Chain Compromise Alert', summary: 'Software vendor compromise affecting 1000+ organizations globally.' }
  ];

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-400" />
          AI Threat Summaries
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockSummaries.map((item, index) => (
            <div key={index} className="p-2 bg-slate-900/50 rounded-lg">
              <p className="text-sm font-medium text-white mb-1">{item.title}</p>
              <p className="text-xs text-slate-400">{item.summary}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default {
  CriticalCVEs,
  AISummaries
};