
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldCheck, Calendar, User, GitBranch, Link, Info, History, Plus } from 'lucide-react';
import ActionButton from '../components/ui/ActionButton';

const MOCK_RISKS = {
    'risk-1': { id: 'risk-1', title: 'Critical web vulnerability allows remote code execution', description: 'A SQL injection vulnerability in the main web application could allow an attacker to gain full control of the underlying database server.', sourceModule: 'AttackSurface', score: 16, likelihood: 'High', impact: 'Critical', status: 'Identified', ownerUserId: 'user-1', treatmentPlan: 'Mitigate', frameworkMappings: [{ framework: 'CE+', controlRef: 'A2.1' }, { framework: 'ISO 27001', controlRef: 'A.8.16' }] },
    'risk-2': { id: 'risk-2', title: 'Laptops missing disk encryption', description: 'A subset of company laptops are not enforcing BitLocker or FileVault, posing a data leakage risk if a device is lost or stolen.', sourceModule: 'Endpoints', score: 9, likelihood: 'Medium', impact: 'High', status: 'In Mitigation', ownerUserId: 'user-2', treatmentPlan: 'Mitigate', frameworkMappings: [{ framework: 'CE+', controlRef: 'A4.7' }, { framework: 'NIST', controlRef: 'SC-28' }] },
    'risk-6': { id: 'risk-6', title: 'Legacy finance application running on unsupported OS', description: 'The core finance application runs on Windows Server 2008, which is no longer supported and receives no security patches.', sourceModule: 'Manual', score: 6, likelihood: 'Low', impact: 'Critical', status: 'Accepted', ownerUserId: 'user-3', treatmentPlan: 'Accept', expiryDate: '2024-12-31', justification: 'Application is scheduled for replacement in Q1 2025. It is isolated on a separate network segment with strict firewall rules as a compensating control.' }
};

const LIKELIHOOD_MAP = { 'Low': 1, 'Medium': 2, 'High': 3, 'Very High': 4 };
const IMPACT_MAP = { 'Low': 1, 'Medium': 2, 'High': 3, 'Critical': 4 };

const getRiskScoreColor = (score) => {
    if (score > 15) return 'bg-red-500/20 text-red-400';
    if (score > 10) return 'bg-orange-500/20 text-orange-400';
    if (score > 5) return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-green-500/20 text-green-400';
};

const getStatusColor = (status) => {
    switch(status) {
        case 'Identified': return 'bg-blue-500/20 text-blue-400';
        case 'In Mitigation': return 'bg-purple-500/20 text-purple-400';
        case 'Accepted': return 'bg-slate-500/20 text-slate-400';
        case 'Resolved': return 'bg-green-500/20 text-green-400';
        case 'Expired': return 'bg-amber-500/20 text-amber-400';
        default: return 'bg-gray-500/20 text-gray-400';
    }
};

const AiAdvisor = ({ risk }) => (
    <Card className="bg-blue-900/30 border-blue-500/30">
        <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-400" />
                AI Risk Advisor
            </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-200 space-y-3">
            <p>Based on the risk type and description, the recommended treatment is to **{risk.treatmentPlan}**.</p>
            {risk.id === 'risk-2' && <p>Consider deploying an Intune baseline to enforce encryption across all Windows and macOS devices.</p>}
            {risk.frameworkMappings?.length > 0 && <p>This risk appears to map to the following compliance controls. Would you like to confirm these links?</p>}
        </CardContent>
    </Card>
);

export default function RiskDetailPage() {
    const location = useLocation();
    const [risk, setRisk] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const riskId = params.get('id');
        setRisk(MOCK_RISKS[riskId] || MOCK_RISKS['risk-1']);
        setLoading(false);
    }, [location.search]);

    if (loading || !risk) {
        return <div className="p-8 text-white">Loading risk details...</div>;
    }

    return (
        <div className="space-y-8">
            <header>
                <div className="flex items-center gap-4 mb-2">
                    <Badge className={getStatusColor(risk.status)}>{risk.status}</Badge>
                    <Badge className={getRiskScoreColor(risk.score)}>Score: {risk.score}</Badge>
                </div>
                <h1 className="text-3xl font-bold text-white">{risk.title}</h1>
                <p className="text-slate-400 mt-2 max-w-3xl">{risk.description}</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Tabs defaultValue="overview">
                        <TabsList className="mb-4 bg-slate-800/50 border border-slate-700">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
                            <TabsTrigger value="history">History</TabsTrigger>
                        </TabsList>
                        <TabsContent value="overview">
                            <Card className="bg-slate-800/50 border-slate-700">
                                <CardContent className="p-6 grid grid-cols-2 gap-6 text-sm">
                                    <div className="space-y-1"><div className="text-slate-400">Source Module</div><div className="text-white font-medium">{risk.sourceModule}</div></div>
                                    <div className="space-y-1"><div className="text-slate-400">Risk Type</div><div className="text-white font-medium">{risk.riskType || 'Cyber'}</div></div>
                                    <div className="space-y-1"><div className="text-slate-400">Likelihood</div><div className="text-white font-medium">{risk.likelihood}</div></div>
                                    <div className="space-y-1"><div className="text-slate-400">Impact</div><div className="text-white font-medium">{risk.impact}</div></div>
                                    <div className="space-y-1"><div className="text-slate-400">Owner</div><div className="text-white font-medium">{risk.ownerUserId}</div></div>
                                    <div className="space-y-1"><div className="text-slate-400">Treatment Plan</div><div className="text-white font-medium">{risk.treatmentPlan}</div></div>
                                </CardContent>
                            </Card>
                            {risk.status === 'Accepted' && (
                                <Card className="mt-6 bg-yellow-900/30 border-yellow-500/30">
                                    <CardHeader>
                                        <CardTitle className="text-yellow-300 text-base flex items-center gap-2"><ShieldCheck className="w-5 h-5"/>Accepted Risk Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm text-yellow-200 space-y-4">
                                        <div><div className="text-yellow-400/80">Justification</div><div>{risk.justification}</div></div>
                                        <div><div className="text-yellow-400/80">Expiry Date</div><div>{risk.expiryDate}</div></div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                        <TabsContent value="frameworks">
                            <Card className="bg-slate-800/50 border-slate-700">
                                <CardHeader><CardTitle className="text-white">Linked Compliance Controls</CardTitle></CardHeader>
                                <CardContent>
                                    {risk.frameworkMappings?.length > 0 ? (
                                        <div className="space-y-2">
                                            {risk.frameworkMappings.map(m => (
                                                <div key={m.controlRef} className="flex items-center gap-4 p-2 bg-slate-900/50 rounded-md">
                                                    <Badge>{m.framework}</Badge>
                                                    <span className="font-mono text-xs text-slate-400">{m.controlRef}</span>
                                                    <span className="text-slate-300">{m.controlTitle || `Control title for ${m.controlRef}`}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p className="text-slate-400">No framework controls linked yet.</p>}
                                     <ActionButton actionFn={async ()=>{}} className="mt-4"><Plus className="w-4 h-4 mr-2"/>Link Control</ActionButton>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="history">
                             <Card className="bg-slate-800/50 border-slate-700">
                                <CardHeader><CardTitle className="text-white">Risk History</CardTitle></CardHeader>
                                <CardContent><p className="text-slate-400">Lifecycle audit trail placeholder...</p></CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
                <div className="space-y-6">
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                             <ActionButton actionFn={async ()=>{}} confirm={{title: "Accept Risk?", description: "This will require justification and an expiry date."}}>Accept Risk</ActionButton>
                             <ActionButton actionFn={async ()=>{}} variant="outline">Assign Owner</ActionButton>
                             <ActionButton actionFn={async ()=>{}} variant="outline">Export PDF</ActionButton>
                        </CardContent>
                    </Card>
                    <AiAdvisor risk={risk} />
                </div>
            </div>
        </div>
    );
}
