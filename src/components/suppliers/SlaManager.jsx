import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Target, TrendingUp, AlertOctagon, ShieldCheck, History, Plus } from 'lucide-react';
import { SupplierSla } from '@/api/entities';
import { toast } from 'sonner';

const SlaManager = ({ supplier }) => {
  const [slas, setSlas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlas = async () => {
      setLoading(true);
      try {
        const data = await SupplierSla.filter({ supplier_id: supplier.id });
        setSlas(data);
      } catch (error) {
        toast.error("Failed to load SLAs");
      }
      setLoading(false);
    };
    fetchSlas();
  }, [supplier.id]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Met': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Breached': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const performanceData = [
    { name: 'Jan', compliance: 99 }, { name: 'Feb', compliance: 98 }, { name: 'Mar', compliance: 99.5 },
    { name: 'Apr', compliance: 97 }, { name: 'May', compliance: 95 }, { name: 'Jun', compliance: 98 },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              SLA Compliance Overview
            </div>
            <Badge className={getStatusColor(supplier.sla_status || 'Met')}>
              Overall: {supplier.sla_status || 'Met'}
            </Badge>
          </CardTitle>
          <CardDescription>Current SLA performance and historical trends.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-full">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300">Quarterly Compliance</span>
                <span className="text-white font-bold">{supplier.sla_compliance_percentage || 100}%</span>
              </div>
              <Progress value={supplier.sla_compliance_percentage || 100} className="w-full" />
            </div>
          </div>
          
          <h4 className="text-white font-medium mb-2">Performance Trend (Last 6 Months)</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[90, 100]} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                <Legend wrapperStyle={{fontSize: '12px'}} />
                <Line type="monotone" dataKey="compliance" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} name="Compliance %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
               <History className="w-5 h-5 text-blue-400" />
               Defined SLAs
            </div>
            <Button size="sm" variant="outline" className="border-slate-600">
                <Plus className="w-4 h-4 mr-2" /> Add SLA Metric
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <p>Loading SLAs...</p> : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-transparent">
                  <TableHead className="text-slate-300">Metric</TableHead>
                  <TableHead className="text-slate-300">Target</TableHead>
                  <TableHead className="text-slate-300 text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slas.map(sla => (
                  <TableRow key={sla.id} className="border-slate-800">
                    <TableCell className="font-medium text-white">{sla.metric}</TableCell>
                    <TableCell className="text-slate-300">{sla.target}</TableCell>
                    <TableCell className="text-right">
                      <Badge className={getStatusColor(sla.status)}>{sla.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SlaManager;