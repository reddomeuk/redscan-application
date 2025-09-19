import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, AlertTriangle, Play } from 'lucide-react';

const MOCK_RISKS = [
    { id: 1, title: 'Unsecured S3 bucket with customer data', priority: 'Critical' },
    { id: 2, title: 'Admin account missing MFA', priority: 'High' },
    { id: 3, title: 'Outdated server software (Apache)', priority: 'High' },
];

export default function AiRiskAdvisor() {
  return (
    <Card className="bg-gradient-to-br from-red-900/30 to-slate-800/50 border-red-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-red-400"/>
            AI Risk Advisor: Fix First
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {MOCK_RISKS.map(risk => (
            <div key={risk.id} className="p-3 bg-slate-900/50 rounded-lg flex justify-between items-center">
                <div>
                    <p className="text-sm text-white font-medium">{risk.title}</p>
                    <p className="text-xs text-red-400">{risk.priority} Priority</p>
                </div>
                <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-900/50">
                    <Play className="w-3 h-3 mr-1" /> Fix
                </Button>
            </div>
        ))}
      </CardContent>
    </Card>
  );
}