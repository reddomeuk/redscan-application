import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Zap, AlertTriangle, CheckCircle2, Shield } from 'lucide-react';

const MOCK_METRICS = {
    totalAssets: 150,
    openFindings: 258,
    criticalFindings: 12,
    highFindings: 45,
    remediationRate: 78,
};

const MetricCard = ({ title, value, icon: Icon, colorClass }) => (
    <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg bg-opacity-20 ${colorClass}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <div className="text-2xl font-bold text-white">{value}</div>
                    <div className="text-sm text-slate-400">{title}</div>
                </div>
            </div>
        </CardContent>
    </Card>
);

export default function MetricsCards() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <MetricCard title="Total Assets" value={MOCK_METRICS.totalAssets} icon={Target} colorClass="bg-blue-500 text-blue-400" />
      <MetricCard title="Open Findings" value={MOCK_METRICS.openFindings} icon={Zap} colorClass="bg-yellow-500 text-yellow-400" />
      <MetricCard title="Critical Findings" value={MOCK_METRICS.criticalFindings} icon={AlertTriangle} colorClass="bg-red-500 text-red-400" />
      <MetricCard title="High Findings" value={MOCK_METRICS.highFindings} icon={AlertTriangle} colorClass="bg-orange-500 text-orange-400" />
      <MetricCard title="Remediation Rate" value={`${MOCK_METRICS.remediationRate}%`} icon={Shield} colorClass="bg-green-500 text-green-400" />
    </div>
  );
}