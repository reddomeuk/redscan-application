
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, ShieldAlert, BarChart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function AiTriageReport({ finding, onTriage }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-slate-300 mb-2">AI Triage Analysis</h3>
      <Card className="bg-slate-900/50 border-slate-700">
        <CardContent className="p-4 space-y-4">
          {!finding.exploitability_score ? (
            <div className="text-center py-4">
              <p className="text-slate-400 mb-3">Run AI analysis to assess exploitability and priority.</p>
              <Button onClick={onTriage} variant="outline" className="border-purple-500/50 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20">
                <Zap className="w-4 h-4 mr-2" />
                Run AI Triage
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <BarChart className="w-4 h-4 text-blue-400"/>
                  <span className="text-sm text-slate-400">Exploitability Score</span>
                </div>
                <Badge className="text-lg bg-blue-500/20 text-blue-300">
                  {(finding.exploitability_score * 100).toFixed(0)}%
                </Badge>
              </div>
              
              {finding.action_now && (
                <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-400"/>
                    <h4 className="text-white font-semibold">Immediate Action Recommended</h4>
                  </div>
                  <p className="text-sm text-slate-300 mt-1 pl-7">{finding.priority_reason}</p>
                </div>
              )}

              {!finding.action_now && (
                 <div className="p-3 bg-slate-800/60 rounded-lg">
                    <h4 className="text-white font-medium">Priority Assessment</h4>
                    <p className="text-sm text-slate-400 mt-1">{finding.priority_reason}</p>
                 </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
