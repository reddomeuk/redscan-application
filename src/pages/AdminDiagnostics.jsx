
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, AlertCircle, Play, FileText, Smartphone, Shield, Zap, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import ActionButton from '../components/ui/ActionButton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bug, FileCheck2, Activity, ShieldCheck, Server, AlertTriangle } from 'lucide-react';

const MOCK_ACTION_INVENTORY = [
    { page: 'Dashboard', action: 'Export PDF', status: 'Present' },
    { page: 'Findings', action: 'Bulk Update', status: 'Present' },
    { page: 'Findings', action: 'Create Ticket', status: 'Present' },
    { page: 'Endpoints', action: 'Force Remediate', status: 'Missing' },
    { page: 'Compliance', action: 'Generate Pack', status: 'Present' },
    { page: 'Suppliers', action: 'Start Onboarding', status: 'Degraded' },
    { page: 'Multi-Tenant', action: 'Suspend Tenant', status: 'Present' },
];

const MOCK_ACTION_LOG = [
    { id: 1, traceId: 'a1b2-c3d4', action: 'Create Ticket', user: 'admin@demo.com', status: 'Success', duration: '780ms' },
    { id: 2, traceId: 'e5f6-g7h8', action: 'Generate Report', user: 'admin@demo.com', status: 'Success (Job)', duration: '120ms' },
    { id: 3, traceId: 'i9j0-k1l2', action: 'Create Ticket', user: 'admin@demo.com', status: 'Failure', duration: '950ms', error: 'Permission Denied' },
];

const runSmokeTestAction = async () => {
    toast.info("Starting button smoke test...");
    await new Promise(r => setTimeout(r, 1000));
    toast.success("Dashboard actions: PASS");
    await new Promise(r => setTimeout(r, 500));
    toast.success("Findings actions: PASS");
    await new Promise(r => setTimeout(r, 500));
    toast.error("Endpoints actions: FAIL (Force Remediate handler missing)");
    await new Promise(r => setTimeout(r, 500));
    toast.warning("Suppliers actions: DEGRADED (SLA check timed out)");
    await new Promise(r => setTimeout(r, 1000));
    toast.success("Smoke test complete. 2 issues found.");
    return { success: true };
}

const getStatusBadge = (status) => {
    switch(status) {
        case 'Present': return <Badge className="bg-green-500/20 text-green-400"><CheckCircle className="w-3 h-3 mr-1"/>Present</Badge>;
        case 'Missing': return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1"/>Missing</Badge>;
        case 'Degraded': return <Badge className="bg-yellow-500/20 text-yellow-400"><AlertCircle className="w-3 h-3 mr-1"/>Degraded</Badge>;
        default: return <Badge variant="secondary">{status}</Badge>;
    }
}

const ActionInventory = () => {
    return (
        <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
                <CardTitle className="text-white">Action Inventory</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow className="border-slate-700">
                        <TableHead className="text-slate-300">Page/Module</TableHead>
                        <TableHead className="text-slate-300">Action</TableHead>
                        <TableHead className="text-slate-300">Status</TableHead>
                        <TableHead className="text-slate-300">Actions</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                        {MOCK_ACTION_INVENTORY.map(item => (
                            <TableRow key={`${item.page}-${item.action}`} className="border-slate-800">
                                <TableCell className="font-medium text-white">{item.page}</TableCell>
                                <TableCell className="text-slate-300">{item.action}</TableCell>
                                <TableCell>{getStatusBadge(item.status)}</TableCell>
                                <TableCell>
                                    {item.status !== 'Present' && <Button variant="outline" size="sm">Fix Now</Button>}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

const ActionLog = () => {
    return (
        <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
                <CardTitle className="text-white">Central Action Log (Last 100)</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow className="border-slate-700">
                        <TableHead className="text-slate-300">Timestamp</TableHead>
                        <TableHead className="text-slate-300">Action</TableHead>
                        <TableHead className="text-slate-300">User</TableHead>
                        <TableHead className="text-slate-300">Status</TableHead>
                        <TableHead className="text-slate-300">Trace ID</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                        {MOCK_ACTION_LOG.map(log => (
                            <TableRow key={log.id} className="border-slate-800">
                                <TableCell className="text-slate-400">{new Date().toLocaleString()}</TableCell>
                                <TableCell className="text-white">{log.action}</TableCell>
                                <TableCell className="text-slate-300">{log.user}</TableCell>
                                <TableCell>{log.status === 'Success' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}</TableCell>
                                <TableCell className="text-slate-500 font-mono text-xs">{log.traceId}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

const SmokeTestRunner = () => (
    <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
            <CardTitle className="text-white">Run Smoke Tests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <p className="text-slate-400">Execute a comprehensive smoke test suite to verify critical system actions.</p>
            <ActionButton
                actionFn={runSmokeTestAction}
                isLongRunning={true}
                taskName="Running Button Smoke Test"
                successToast="Smoke test initiated..."
            >
                <Play className="w-4 h-4 mr-2" /> Run Full Smoke Test
            </ActionButton>
        </CardContent>
    </Card>
);

export default function AdminDiagnosticsPage() {
  const last100Actions = []; // Placeholder

  return (
    <div className="p-4 md:p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Bug className="w-8 h-8 text-red-500" />
          Admin Diagnostics
        </h1>
        <p className="text-slate-400">System health, action inventory, and diagnostics tools for super admins.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">System Status</CardTitle>
                <Server className="w-4 h-4 text-slate-400"/>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-green-400">All Systems Go</div>
                <p className="text-xs text-slate-400">Last check: just now</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Total Actions</CardTitle>
                <Activity className="w-4 h-4 text-slate-400"/>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-white">{MOCK_ACTION_INVENTORY.length}</div>
                <p className="text-xs text-slate-400">
                  <Badge className="bg-green-500/20 text-green-400 mr-1">{MOCK_ACTION_INVENTORY.filter(a => a.status === 'Present').length} Present</Badge>
                  <Badge className="bg-red-500/20 text-red-400">{MOCK_ACTION_INVENTORY.filter(a => a.status !== 'Present').length} Issues</Badge>
                </p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Smoke Test</CardTitle>
                <FileCheck2 className="w-4 h-4 text-slate-400"/>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-white">Not Run</div>
                <p className="text-xs text-slate-400">
                    <Badge className="bg-yellow-500/20 text-yellow-400">Pending</Badge>
                </p>
            </CardContent>
          </Card>
           <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Error State</CardTitle>
                <AlertTriangle className="w-4 h-4 text-slate-400"/>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-white">Disabled</div>
                <p className="text-xs text-slate-400">
                    <Badge className="bg-slate-500/20 text-slate-400">Global error boundary off</Badge>
                </p>
            </CardContent>
          </Card>
      </div>

      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-700/50 border-slate-700">
            <TabsTrigger value="inventory">Action Inventory</TabsTrigger>
            <TabsTrigger value="log">Action Log</TabsTrigger>
            <TabsTrigger value="smoke-test">Smoke Tests</TabsTrigger>
        </TabsList>
        <TabsContent value="inventory" className="mt-4">
            <ActionInventory />
        </TabsContent>
        <TabsContent value="log" className="mt-4">
            <ActionLog />
        </TabsContent>
        <TabsContent value="smoke-test" className="mt-4">
            <SmokeTestRunner />
        </TabsContent>
      </Tabs>
    </div>
  );
}
