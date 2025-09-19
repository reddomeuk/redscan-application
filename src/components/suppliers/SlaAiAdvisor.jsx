import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, TrendingUp, TrendingDown, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const SlaAiAdvisor = ({ supplier }) => {
  const advisories = [
    { 
      text: "Repeated minor outages in the last 60 days may predict a major SLA breach within the next quarter.",
      risk: 'Increasing',
      type: 'prediction'
    },
    {
      text: "Supplier has missed two consecutive patching cycles. This elevates vulnerability risk.",
      risk: 'High',
      type: 'observation'
    },
  ];

  if (supplier.sla_status === 'Met') {
    return (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              AI SLA Watcher
            </CardTitle>
          </CardHeader>
          <CardContent>
              <p className="text-green-300 text-sm">Supplier performance is stable and meets all defined SLAs. No leading risk indicators found.</p>
          </CardContent>
        </Card>
    );
  }

  return (
    <Card className="bg-purple-900/20 border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          AI SLA Watcher
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {advisories.map((advisory, index) => (
          <div key={index} className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-purple-300 mt-1 flex-shrink-0" />
            <div>
              <p className="text-purple-200 text-sm">{advisory.text}</p>
              <div className="mt-1">
                {advisory.risk === 'Increasing' ? 
                  <Badge variant="outline" className="text-yellow-300 border-yellow-500/50"><TrendingUp className="w-3 h-3 mr-1" />Risk Increasing</Badge> :
                  <Badge variant="outline" className="text-red-300 border-red-500/50"><TrendingDown className="w-3 h-3 mr-1" />High Risk</Badge>
                }
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SlaAiAdvisor;