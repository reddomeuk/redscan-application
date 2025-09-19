import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { SupplierContract, Supplier } from '@/api/entities';
import { toast } from 'sonner';
import { format, differenceInDays, isBefore } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { FileSignature, AlertTriangle, CheckCircle, Clock, Download } from 'lucide-react';

const COLORS = {
  Active: '#22c55e',
  'In Renewal': '#f59e0b',
  Expired: '#ef4444',
};

const TYPE_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

export default function ContractsDashboard() {
  const [contracts, setContracts] = useState([]);
  const [suppliers, setSuppliers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [contractData, supplierData] = await Promise.all([
          SupplierContract.list(),
          Supplier.list(),
        ]);
        setContracts(contractData);
        const supplierMap = supplierData.reduce((acc, s) => ({ ...acc, [s.id]: s.name }), {});
        setSuppliers(supplierMap);
      } catch (error) {
        toast.error("Failed to load dashboard data");
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const getStatus = (contract) => {
    const today = new Date();
    const endDate = new Date(contract.end_date);
    if (isBefore(today, endDate)) {
      const daysLeft = differenceInDays(endDate, today);
      if (daysLeft <= 90) return 'In Renewal';
      return 'Active';
    }
    return 'Expired';
  };

  const statusData = contracts.reduce((acc, contract) => {
    const status = getStatus(contract);
    const existing = acc.find(item => item.name === status);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: status, value: 1 });
    }
    return acc;
  }, []);

  const typeData = contracts.reduce((acc, contract) => {
    const existing = acc.find(item => item.name === contract.type);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: contract.type, value: 1 });
    }
    return acc;
  }, []);

  const expiringSoon = contracts
    .filter(c => getStatus(c) === 'In Renewal')
    .sort((a, b) => new Date(a.end_date) - new Date(b.end_date))
    .slice(0, 5);

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen text-white">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-3xl font-bold">Contracts Dashboard</h1>
                <p className="text-slate-400">Portfolio-wide view of supplier contracts</p>
            </div>
            <Button variant="outline" className="border-slate-600">
                <Download className="w-4 h-4 mr-2"/> Export Register (CSV)
            </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 bg-slate-800/50 border-slate-700">
            <CardHeader><CardTitle>Contract Status</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700">
            <CardHeader><CardTitle>Contracts by Type</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                  <Bar dataKey="value" name="Count">
                     {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3 bg-slate-800/50 border-slate-700">
            <CardHeader><CardTitle>Contract Renewal Pipeline (Next 90 Days)</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow className="border-slate-700 hover:bg-transparent">
                  <TableHead className="text-slate-300">Supplier</TableHead>
                  <TableHead className="text-slate-300">Contract</TableHead>
                  <TableHead className="text-slate-300">End Date</TableHead>
                  <TableHead className="text-slate-300">Days Left</TableHead>
                  <TableHead className="text-slate-300">Owner</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {expiringSoon.map(c => (
                    <TableRow key={c.id} className="border-slate-800">
                      <TableCell className="font-medium text-white">{suppliers[c.supplier_id] || 'Unknown'}</TableCell>
                      <TableCell className="text-slate-300">{c.title}</TableCell>
                      <TableCell className="text-slate-300">{format(new Date(c.end_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="text-yellow-400">{differenceInDays(new Date(c.end_date), new Date())}</TableCell>
                      <TableCell className="text-slate-400">{c.contract_owner}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}