import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, LineChart, PieChart, TrendingUp, ShieldCheck, CheckCircle2, AlertOctagon, Archive } from 'lucide-react';
import { ResponsiveContainer, Pie, Cell } from 'recharts';

const RiskHeatmap = ({ data }) => {
    const likelihoods = ['Very High', 'High', 'Medium', 'Low'];
    const impacts = ['Low', 'Medium', 'High', 'Critical'];
    
    const heatmapData = likelihoods.map(l => impacts.map(i => 
        data.filter(d => d.likelihood === l && d.impact === i).length
    ));

    const getColor = (count) => {
        if (count > 5) return 'bg-red-500/80';
        if (count > 2) return 'bg-orange-500/80';
        if (count > 0) return 'bg-yellow-500/80';
        return 'bg-green-500/20';
    };

    return (
        <div className="p-1">
            <div className="flex">
                <div className="w-20"></div>
                {impacts.map(i => <div key={i} className="flex-1 text-center text-xs font-bold text-slate-300 pb-2">{i}</div>)}
            </div>
            {likelihoods.map((l, lIndex) => (
                <div key={l} className="flex items-center">
                    <div className="w-20 text-xs font-bold text-slate-300 text-right pr-2">{l}</div>
                    {heatmapData[lIndex].map((count, iIndex) => (
                        <div key={iIndex} className={`flex-1 m-1 h-12 flex items-center justify-center rounded-md ${getColor(count)}`}>
                            <span className="text-white font-bold text-lg">{count}</span>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default function RiskDashboardPage() {
    const mockData = [
        { score: 16, likelihood: 'High', impact: 'Critical' },
        { score: 9, likelihood: 'Medium', impact: 'High' },
        { score: 12, likelihood: 'High', impact: 'High' },
        { score: 12, likelihood: 'High', impact: 'High' },
        { score: 16, likelihood: 'Very High', impact: 'Critical' },
        { score: 6, likelihood: 'Low', impact: 'Critical' },
    ];
    
    const summary = { total: 7, accepted: 1, resolved: 0, expired: 1 };
    
    const frameworkData = [
        { name: 'CE/CE+', value: 4 },
        { name: 'ISO 27001', value: 3 },
        { name: 'NIST', value: 2 }
    ];
    const COLORS = ['#B00020', '#8B0000', '#FF6B6B'];

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-white">Risk Dashboard</h1>
                <p className="text-slate-400">High-level overview of the organization's risk posture.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-slate-800/50 border-slate-700"><CardContent className="p-4"><div className="text-sm text-slate-400">Total Risks</div><div className="text-2xl font-bold text-white">{summary.total}</div></CardContent></Card>
                <Card className="bg-slate-800/50 border-slate-700"><CardContent className="p-4"><div className="text-sm text-slate-400">Accepted</div><div className="text-2xl font-bold text-yellow-400">{summary.accepted}</div></CardContent></Card>
                <Card className="bg-slate-800/50 border-slate-700"><CardContent className="p-4"><div className="text-sm text-slate-400">Resolved</div><div className="text-2xl font-bold text-green-400">{summary.resolved}</div></CardContent></Card>
                <Card className="bg-slate-800/50 border-slate-700"><CardContent className="p-4"><div className="text-sm text-slate-400">Expired</div><div className="text-2xl font-bold text-orange-400">{summary.expired}</div></CardContent></Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader><CardTitle className="text-white flex items-center gap-2"><AlertOctagon className="w-5 h-5 text-red-400"/>Risk Heatmap</CardTitle></CardHeader>
                    <CardContent>
                        <RiskHeatmap data={mockData} />
                    </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader><CardTitle className="text-white flex items-center gap-2"><PieChart className="w-5 h-5 text-blue-400"/>Risks by Framework</CardTitle></CardHeader>
                    <CardContent className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={frameworkData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                    {frameworkData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}