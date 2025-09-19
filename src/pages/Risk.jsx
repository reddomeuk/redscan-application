import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Plus, LayoutDashboard } from 'lucide-react';
import ActionButton from '../components/ui/ActionButton';

const MOCK_RISKS = [
    { id: 'risk-1', title: 'Critical web vulnerability allows remote code execution', sourceModule: 'AttackSurface', score: 16, likelihood: 'High', impact: 'Critical', status: 'Identified', ownerUserId: 'user-1', treatmentPlan: 'Mitigate' },
    { id: 'risk-2', title: 'Laptops missing disk encryption', sourceModule: 'Endpoints', score: 9, likelihood: 'Medium', impact: 'High', status: 'In Mitigation', ownerUserId: 'user-2', treatmentPlan: 'Mitigate' },
    { id: 'risk-3', title: 'Key supplier (Acme Hosting) lacks SOC 2 Type II report', sourceModule: 'Suppliers', score: 12, likelihood: 'High', impact: 'High', status: 'Identified', ownerUserId: 'user-3', treatmentPlan: 'Transfer' },
    { id: 'risk-4', title: 'MFA not enforced for all admin accounts', sourceModule: 'Compliance', score: 12, likelihood: 'High', impact: 'High', status: 'In Mitigation', ownerUserId: 'user-1', treatmentPlan: 'Mitigate' },
    { id: 'risk-5', title: 'Threat actor targeting Exchange servers with CVE-2025-1234', sourceModule: 'ThreatIntel', score: 16, likelihood: 'Very High', impact: 'Critical', status: 'Identified', ownerUserId: 'user-2', treatmentPlan: 'Mitigate' },
    { id: 'risk-6', title: 'Legacy finance application running on unsupported OS', sourceModule: 'Manual', score: 6, likelihood: 'Low', impact: 'Critical', status: 'Accepted', ownerUserId: 'user-3', treatmentPlan: 'Accept', expiryDate: '2024-12-31' },
    { id: 'risk-7', title: 'Expired risk needs review', sourceModule: 'Manual', score: 6, likelihood: 'Low', impact: 'Critical', status: 'Expired', ownerUserId: 'user-3', treatmentPlan: 'Accept', expiryDate: '2024-09-01' }
];

const LIKELIHOOD_MAP = { 'Low': 1, 'Medium': 2, 'High': 3, 'Very High': 4 };
const IMPACT_MAP = { 'Low': 1, 'Medium': 2, 'High': 3, 'Critical': 4 };

const getRiskScoreColor = (score) => {
    if (score > 15) return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (score > 10) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    if (score > 5) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-green-500/20 text-green-400 border-green-500/30';
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

export default function RiskPage() {
    const [risks, setRisks] = useState(MOCK_RISKS);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({ search: '', status: 'all', source: 'all' });
    const navigate = useNavigate();

    const filteredRisks = useMemo(() => {
        return risks.filter(risk => {
            const searchMatch = !filters.search || risk.title.toLowerCase().includes(filters.search.toLowerCase());
            const statusMatch = filters.status === 'all' || risk.status === filters.status;
            const sourceMatch = filters.source === 'all' || risk.sourceModule === filters.source;
            return searchMatch && statusMatch && sourceMatch;
        });
    }, [risks, filters]);

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Risk Register</h1>
                    <p className="text-slate-400">Central repository for identifying, tracking, and managing organizational risks.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate(createPageUrl('RiskDashboard'))}>
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        View Dashboard
                    </Button>
                    <ActionButton actionFn={async () => { console.log("Add risk clicked"); }} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Risk
                    </ActionButton>
                </div>
            </header>

            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <CardTitle className="text-white">All Risks</CardTitle>
                        <div className="flex gap-2 flex-wrap">
                            <Input
                                placeholder="Search risks..."
                                value={filters.search}
                                onChange={e => setFilters(prev => ({...prev, search: e.target.value}))}
                                className="max-w-sm bg-slate-900/50 border-slate-700"
                            />
                            <Select value={filters.status} onValueChange={v => setFilters(prev => ({...prev, status: v}))}>
                                <SelectTrigger className="w-40 bg-slate-900/50 border-slate-700"><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="Identified">Identified</SelectItem>
                                    <SelectItem value="In Mitigation">In Mitigation</SelectItem>
                                    <SelectItem value="Accepted">Accepted</SelectItem>
                                    <SelectItem value="Resolved">Resolved</SelectItem>
                                    <SelectItem value="Expired">Expired</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-700 hover:bg-transparent">
                                <TableHead className="text-slate-300">Risk</TableHead>
                                <TableHead className="text-slate-300">Source</TableHead>
                                <TableHead className="text-slate-300">Score</TableHead>
                                <TableHead className="text-slate-300">Status</TableHead>
                                <TableHead className="text-slate-300">Treatment</TableHead>
                                <TableHead className="text-slate-300">Expiry</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan="6" className="text-center text-slate-400">Loading risks...</TableCell></TableRow>
                            ) : filteredRisks.map(risk => (
                                <TableRow key={risk.id} onClick={() => navigate(createPageUrl(`RiskDetail?id=${risk.id}`))} className="cursor-pointer hover:bg-slate-800 border-slate-800">
                                    <TableCell className="font-medium text-white max-w-md truncate">{risk.title}</TableCell>
                                    <TableCell><Badge variant="secondary">{risk.sourceModule}</Badge></TableCell>
                                    <TableCell>
                                        <Badge className={`${getRiskScoreColor(risk.score)}`}>
                                            {risk.score} ({risk.likelihood[0] + 'x' + risk.impact[0]})
                                        </Badge>
                                    </TableCell>
                                    <TableCell><Badge className={getStatusColor(risk.status)}>{risk.status}</Badge></TableCell>
                                    <TableCell className="text-slate-300">{risk.treatmentPlan}</TableCell>
                                    <TableCell className="text-slate-400">{risk.expiryDate || 'N/A'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}