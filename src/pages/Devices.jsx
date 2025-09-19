
import React, { useState, useEffect, useMemo } from 'react';
import { Device, MdmConnection } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { HardDrive, CheckCircle, XCircle, HelpCircle, BarChart3, PieChart as PieChartIcon, Link, Smartphone, RefreshCw, GitCompareArrows } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { toast } from 'sonner';
import ActionButton from '../components/ui/ActionButton';

const COMPLIANCE_COLORS = { Compliant: '#22c55e', 'Non-Compliant': '#ef4444', Unknown: '#64748b', Pending: '#f59e0b' };

const ConnectionPrerequisite = ({ connections }) => (
    <Card className="bg-slate-800/50 border-slate-700 text-center py-16">
        <CardHeader>
            <Smartphone className="mx-auto w-16 h-16 text-slate-500" />
            <CardTitle className="text-white mt-4">Connect Your Device Manager</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-slate-400 mb-6">
                To manage endpoints, first connect Microsoft Intune or Google Workspace.
            </p>
            <div className="flex justify-center gap-4">
                 <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => toast.info("Redirecting to Microsoft 365 Admin...")}>
                    Connect Intune
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => toast.info("Redirecting to Google Workspace Admin...")}>
                    Connect Google Workspace
                </Button>
            </div>
        </CardContent>
    </Card>
);

const forceSyncAction = async (deviceId) => {
    console.log("Forcing sync for device:", deviceId);
    await new Promise(res => setTimeout(res, 1500));
    return { success: true };
};

export default function DevicesPage() {
  const [devices, setDevices] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ os: 'all', compliance: 'all', source: 'all' });
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
        setLoading(true);
        try {
            const [fetchedConnections, fetchedDevices] = await Promise.all([
                MdmConnection.list(),
                Device.list()
            ]);
            setConnections(fetchedConnections);
            setDevices(fetchedDevices);
        } catch (error) {
            toast.error("Failed to load device data.");
            console.error(error);
        }
        setLoading(false);
    };
    loadData();
  }, []);
  
  const hasActiveConnection = connections.some(c => c.status === 'connected');

  const filteredDevices = useMemo(() => {
    return devices.filter(device => {
      const nameMatch = device.hostname?.toLowerCase().includes(searchTerm.toLowerCase());
      const osMatch = filters.os === 'all' || device.platform === filters.os;
      const complianceMatch = filters.compliance === 'all' || device.compliance_state === filters.compliance;
      const sourceMatch = filters.source === 'all' || device.source === filters.source;
      return nameMatch && osMatch && complianceMatch && sourceMatch;
    });
  }, [devices, searchTerm, filters]);
  
  const complianceDistribution = useMemo(() => {
    const distribution = { Compliant: 0, 'Non-Compliant': 0, Unknown: 0, Pending: 0 };
    devices.forEach(d => {
        if(d.compliance_state in distribution) distribution[d.compliance_state]++;
    });
    return Object.entries(distribution).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
  }, [devices]);

  const getComplianceBadge = (status) => {
    if (status === 'Compliant') return <Badge className="bg-green-500/20 text-green-400"><CheckCircle className="w-3 h-3 mr-1"/>Compliant</Badge>;
    if (status === 'Non-Compliant') return <Badge className="bg-red-500/20 text-red-400"><XCircle className="w-3 h-3 mr-1"/>Non-Compliant</Badge>;
    if (status === 'Pending') return <Badge className="bg-yellow-500/20 text-yellow-400"><HelpCircle className="w-3 h-3 mr-1"/>Pending</Badge>;
    return <Badge className="bg-slate-500/20 text-slate-400"><HelpCircle className="w-3 h-3 mr-1"/>Unknown</Badge>;
  };

  if (loading) {
    return <div className="p-8 text-white">Loading device data...</div>;
  }
  
  if (!hasActiveConnection) {
      return <ConnectionPrerequisite connections={connections} />;
  }

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Endpoints</h1>
          <p className="text-slate-400">Monitor and manage devices from Intune and Google Workspace.</p>
        </div>
        <div className="flex items-center gap-2">
            <p className="text-sm text-slate-400">Data provided by:</p>
            {connections.map(c => c.status === 'connected' && (
                <Badge key={c.id} variant="secondary">{c.provider === 'intune' ? 'Microsoft Intune' : 'Google Workspace'}</Badge>
            ))}
             <Button onClick={() => navigate(createPageUrl('DeviceBaselines'))} className="bg-blue-600 hover:bg-blue-700 ml-4">
                <GitCompareArrows className="w-4 h-4 mr-2" /> Manage Baselines
            </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 border-slate-700 lg:col-span-2">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><PieChartIcon className="w-5 h-5 text-blue-400" />Compliance Distribution</CardTitle></CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={complianceDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                    {complianceDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={COMPLIANCE_COLORS[entry.name]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        {/* Other charts can go here */}
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Device Directory</CardTitle>
          <div className="flex gap-4 mt-4 flex-wrap">
            <Input 
              placeholder="Search by hostname..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="max-w-sm bg-slate-900/50 border-slate-700" 
            />
            <Select value={filters.source} onValueChange={v => setFilters(prev => ({ ...prev, source: v }))}>
              <SelectTrigger className="w-48 bg-slate-900/50 border-slate-700"><SelectValue placeholder="All Sources" /></SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="intune">Intune</SelectItem>
                <SelectItem value="google_workspace">Google Workspace</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.compliance} onValueChange={v => setFilters(prev => ({ ...prev, compliance: v }))}>
              <SelectTrigger className="w-48 bg-slate-900/50 border-slate-700"><SelectValue placeholder="All Compliance" /></SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="all">All Compliance</SelectItem>
                <SelectItem value="Compliant">Compliant</SelectItem>
                <SelectItem value="Non-Compliant">Non-Compliant</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700 hover:bg-transparent">
                <TableHead className="text-slate-300">Hostname</TableHead>
                <TableHead className="text-slate-300">Platform</TableHead>
                <TableHead className="text-slate-300">Source</TableHead>
                <TableHead className="text-slate-300">Compliance</TableHead>
                <TableHead className="text-slate-300">Last Seen</TableHead>
                <TableHead className="text-slate-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDevices.map(device => (
                <TableRow key={device.id} className="cursor-pointer hover:bg-slate-800 border-slate-800">
                  <TableCell onClick={() => navigate(createPageUrl(`DeviceDetail?id=${device.id}`))} className="font-medium text-white">{device.hostname}</TableCell>
                  <TableCell onClick={() => navigate(createPageUrl(`DeviceDetail?id=${device.id}`))} className="text-slate-300 capitalize">{device.platform}</TableCell>
                   <TableCell onClick={() => navigate(createPageUrl(`DeviceDetail?id=${device.id}`))}>
                     <Badge variant="secondary" className="capitalize">{(device.source || '').replace('_', ' ')}</Badge>
                   </TableCell>
                  <TableCell onClick={() => navigate(createPageUrl(`DeviceDetail?id=${device.id}`))}>{getComplianceBadge(device.compliance_state)}</TableCell>
                  <TableCell onClick={() => navigate(createPageUrl(`DeviceDetail?id=${device.id}`))} className="text-slate-400">{new Date(device.last_seen).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <ActionButton
                        actionFn={() => forceSyncAction(device.id)}
                        successToast={`Sync command sent to ${device.hostname}`}
                        variant="ghost"
                        size="sm"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </ActionButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
