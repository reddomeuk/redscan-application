import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, FileText, AlertTriangle, CheckCircle, ShieldCheck } from 'lucide-react';

const AiContractAnalysis = ({ contract, onClose }) => {
  // AI analysis is simulated for demonstration
  const aiAnalysis = contract.ai_analysis || {
    summary: 'This is a standard Master Services Agreement with typical clauses for liability, data protection, and service levels. No major deviations from industry standards were detected.',
    risky_clauses: contract.title.includes('Expired') ? ['Termination clause is unfavorable', 'Data processing terms are outdated'] : ['Liability is capped at a low amount.'],
    recommendation: contract.title.includes('Expired') ? 'Terminate' : 'Renegotiate',
  };

  const getRecommendationPill = (recommendation) => {
    switch (recommendation) {
      case 'Renew':
        return <Badge className="bg-green-500/20 text-green-400"><CheckCircle className="w-3 h-3 mr-1" />Renew</Badge>;
      case 'Renegotiate':
        return <Badge className="bg-yellow-500/20 text-yellow-400"><AlertTriangle className="w-3 h-3 mr-1" />Renegotiate</Badge>;
      case 'Terminate':
        return <Badge className="bg-red-500/20 text-red-400"><AlertTriangle className="w-3 h-3 mr-1" />Terminate</Badge>;
      default:
        return null;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            AI Contract Analysis
          </DialogTitle>
          <DialogDescription>{contract.title}</DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <h3 className="font-semibold text-white mb-2">AI Recommendation</h3>
              <div className="flex items-center justify-between">
                <p className="text-slate-300">Based on contract terms and supplier performance:</p>
                {getRecommendationPill(aiAnalysis.recommendation)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <h3 className="font-semibold text-white mb-2">Key Summary</h3>
              <p className="text-slate-300 text-sm">{aiAnalysis.summary}</p>
            </CardContent>
          </Card>

          {aiAnalysis.risky_clauses?.length > 0 && (
            <Card className="bg-red-900/20 border-red-500/30">
              <CardContent className="p-4">
                <h3 className="font-semibold text-red-300 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Risky Clauses Identified
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  {aiAnalysis.risky_clauses.map((clause, index) => (
                    <li key={index} className="text-red-200 text-sm">{clause}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AiContractAnalysis;