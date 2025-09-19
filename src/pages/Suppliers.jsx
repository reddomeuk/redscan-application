import React, { useState, useEffect, useMemo } from 'react';
import { Supplier } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Plus, Building2, BarChart3, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const RISK_TIERS = {
  Low: { color: 'bg-green-500/20 text-green-400', indicator: '🟢' },
  Medium: { color: 'bg-yellow-500/20 text-yellow-400', indicator: '🟡' },
  High: { color: 'bg-red-500/20 text-red-400', indicator: '🔴' },
};

const MOCK_SUPPLIERS = [
    { id: 'sup-1', name: 'CloudProvider Inc.', type: 'software', status: 'Active', risk_tier: 'Low', risk_score: 15, issues: 'None' },
    { id: 'sup-2', name: 'Marketing SaaS Co.', type: 'service', status: 'Active', risk_tier: 'Medium', risk_score: 45, issues: 'Missing SOC 2' },
    { id: 'sup-3', name: 'TempContractor Ltd', type: 'contractor', status: 'Active', risk_tier: 'High', risk_score: 85, issues: 'Recent data breach' },
];

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ status: 'all', risk: 'all' });
  const navigate = useNavigate();

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    setLoading(true);
    setSuppliers(MOCK_SUPPLIERS);
    setLoading(false);
  };
  
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(supplier => {
      const nameMatch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = filters.status === 'all' || supplier.status === filters.status;
      const riskMatch = filters.risk === 'all' || supplier.risk_tier === filters.risk;
      return nameMatch && statusMatch && riskMatch;
    });
  }, [suppliers, searchTerm, filters]);
  
  const summaryStats = useMemo(() => {
      const total = suppliers.length;
      const highRisk = suppliers.filter(s => s.risk_tier === 'High' || s.risk_tier === 'Critical').length;
      return { total, highRisk };
  }, [suppliers]);
  
  const riskDistribution = useMemo(() => {
    const distribution = { Low: 0, Medium: 0, High: 0 };
    suppliers.forEach(s => { if (s.risk_tier) distribution[s.risk_tier]++; });
    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  }, [suppliers]);


  if (loading) {
    return <div className="p-8 text-white">Loading supplier data...</div>;
  }

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Suppliers</h1>
          <p className="text-slate-400">Oversee third-party vendor risk and compliance.</p>
        </div>
        <Button onClick={() => navigate(createPageUrl('SupplierDetail?new=true'))} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Start Due Diligence
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-800/50 border-slate-700"><CardContent className="p-6 text-center"><div className="text-3xl font-bold text-white">{summaryStats.total}</div><div className="text-sm text-slate-400">Total Suppliers</div></CardContent></Card>
        <Card className="bg-slate-800/50 border-slate-700"><CardContent className="p-6 text-center"><div className="text-3xl font-bold text-red-400">{summaryStats.highRisk}</div><div className="text-sm text-slate-400">High-Risk</div></CardContent></Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="p-4 pb-0"><CardTitle className="text-sm font-medium text-slate-300">Risk Distribution</CardTitle></CardHeader>
          <CardContent className="h-24">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={riskDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={25} outerRadius={40}>
                    {riskDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={RISK_TIERS[entry.name]?.indicator.includes('🟢') ? '#22c55e' : RISK_TIERS[entry.name]?.indicator.includes('🟡') ? '#f59e0b' : '#ef4444'} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Supplier Directory</CardTitle>
          <div className="flex gap-4 mt-4 flex-wrap">
            <Input 
              placeholder="Search by name..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="max-w-sm bg-slate-900/50 border-slate-700" 
            />
            <Select value={filters.risk} onValueChange={v => setFilters(prev => ({ ...prev, risk: v }))}>
              <SelectTrigger className="w-40 bg-slate-900/50 border-slate-700"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="all">All Risk Tiers</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700 hover:bg-transparent">
                <TableHead className="text-slate-300">Supplier</TableHead>
                <TableHead className="text-slate-300">Risk</TableHead>
                <TableHead className="text-slate-300">Key Issue</TableHead>
                <TableHead className="text-slate-300">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.map(supplier => (
                <TableRow key={supplier.id} onClick={() => navigate(createPageUrl(`SupplierDetail?id=${supplier.id}`))} className="cursor-pointer hover:bg-slate-800 border-slate-800">
                  <TableCell className="font-medium text-white">{supplier.name}</TableCell>
                  <TableCell><Badge className={RISK_TIERS[supplier.risk_tier]?.color}>{supplier.risk_tier}</Badge></TableCell>
                  <TableCell className="text-slate-300">{supplier.issues}</TableCell>
                  <TableCell><Badge className="bg-green-500/20 text-green-400">{supplier.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}