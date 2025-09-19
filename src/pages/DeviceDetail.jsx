
import React, { useState, useEffect, useCallback } from 'react';
import { Device, SoftwareItem, PostureItem, Finding } from '@/api/entities';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, HardDrive, CheckCircle, XCircle, HelpCircle, Shield, List, AlertTriangle, Wrench } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';
import RemediationCard from '../components/endpoints/RemediationCard';
import { RemediationEngine } from '../components/endpoints/RemediationEngine';

const platformIcons = {
  windows: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3,6H21V18H3V6M3,6L12,2L21,6"/><path d="M12,2V18"/></svg>,
  macos: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16.5 15.5c-1.5 2-4.5 2-6 0"/><path d="M9 13a3 3 0 0 1 3-3c1 0 2.5 1.5 2.5 1.5"/></svg>,
};

export default function DeviceDetailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const deviceId = searchParams.get('id');

  const [device, setDevice] = useState(null);
  const [software, setSoftware] = useState([]);
  const [posture, setPosture] = useState([]);
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);

  const triggerRemediationIfNeeded = useCallback(async (device, posture) => {
    try {
      // Check for specific compliance issues and trigger remediation
      const failedPostureChecks = posture.filter(p => p.status === 'fail');
      
      for (const check of failedPostureChecks) {
        let issueType = null;
        switch (check.key) {
          case 'disk_encryption':
            issueType = 'encryption_missing';
            break;
          case 'antivirus_installed':
            issueType = 'missing_edr';
            break;
          case 'firewall_enabled':
            issueType = 'firewall_disabled';
            break;
          case 'os_update_current':
            issueType = 'outdated_os';
            break;
        }

        if (issueType) {
          await RemediationEngine.createRemediationTask(
            device.id,
            issueType,
            `Non-compliant posture check: ${check.key}`
          );
        }
      }
    } catch (error) {
      console.error('Error triggering remediation:', error);
      toast.error("Failed to trigger remediation.");
    }
  }, []);

  const loadData = useCallback(async () => {
    if (!deviceId) return;
    setLoading(true);
    try {
      const [deviceData, softwareData, postureData, findingData] = await Promise.all([
        Device.get(deviceId),
        SoftwareItem.filter({ device_id: deviceId }),
        PostureItem.filter({ device_id: deviceId }),
        Finding.filter({ asset_id: deviceId }) // assuming asset_id on finding can be device_id
      ]);
      setDevice(deviceData);
      setSoftware(softwareData);
      setPosture(postureData);
      setFindings(findingData);

      // Trigger automatic remediation for non-compliant devices if compliance is below 80%
      if (deviceData.compliance_percent < 80) {
        await triggerRemediationIfNeeded(deviceData, postureData);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load device details.");
    }
    setLoading(false);
  }, [deviceId, triggerRemediationIfNeeded]); // deviceId and triggerRemediationIfNeeded are dependencies for loadData

  useEffect(() => {
    if (!deviceId) {
      toast.error("No device ID provided.");
      navigate(createPageUrl('Devices'));
      return;
    }
    loadData();
  }, [deviceId, navigate, loadData]); // Added navigate and loadData to dependencies

  const getComplianceStatus = (compliancePercent) => {
    if (compliancePercent >= 90) return 'Compliant';
    if (compliancePercent < 90 && compliancePercent > 0) return 'Non-Compliant';
    return 'Unknown';
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
        <div className="p-8 text-white">Loading device details...</div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="p-4 md:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
        <div className="p-8 text-white">Device not found.</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(createPageUrl('Devices'))} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back to Devices</Button>

        <header className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="text-slate-500">{platformIcons[device.platform]}</div>
            <div>
              <h1 className="text-3xl font-bold">{device.hostname}</h1>
              <p className="text-slate-400">{device.os_name} {device.os_version}</p>
            </div>
          </div>
          <Badge className={
            getComplianceStatus(device.compliance_percent) === 'Compliant' ? "bg-green-500/20 text-green-400" :
            getComplianceStatus(device.compliance_percent) === 'Non-Compliant' ? "bg-red-500/20 text-red-400" :
            "bg-slate-500/20 text-slate-400"
          }>{getComplianceStatus(device.compliance_percent)}</Badge>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Device Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-300">Compliance</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{device.compliance_percent}%</div>
                        <Progress value={device.compliance_percent} className="mt-2" />
                    </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-300">Risk Score</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-white">{device.risk_score}</div></CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-300">Last Seen</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-white">{format(new Date(device.last_seen), 'MMM dd, yyyy')}</div></CardContent>
                </Card>
            </div>

            {/* Security Posture */}
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader><CardTitle className="text-white flex items-center gap-2"><Shield className="w-5 h-5 text-blue-400"/>Security Posture</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableBody>
                            {posture.map(item => (
                                <TableRow key={item.id} className="border-slate-800">
                                    <TableCell className="font-medium text-white capitalize">{item.key.replace(/_/g, ' ')}</TableCell>
                                    <TableCell className="text-right">
                                        {item.status === 'pass' ? <Badge className="bg-green-500/20 text-green-400"><CheckCircle className="w-3 h-3 mr-1"/>Pass</Badge> :
                                        item.status === 'fail' ? <Badge className="bg-red-500/20 text-red-400"><XCircle className="w-3 h-3 mr-1"/>Fail</Badge> :
                                        <Badge className="bg-yellow-500/20 text-yellow-400"><HelpCircle className="w-3 h-3 mr-1"/>Warn</Badge>}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Installed Software */}
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader><CardTitle className="text-white flex items-center gap-2"><List className="w-5 h-5 text-blue-400"/>Installed Software</CardTitle></CardHeader>
                <CardContent className="max-h-96 overflow-y-auto">
                    <Table>
                         <TableHeader><TableRow className="border-slate-700 hover:bg-transparent">
                            <TableHead className="text-slate-300">Name</TableHead>
                            <TableHead className="text-slate-300">Version</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                           {software.map(item => (
                                <TableRow key={item.id} className="border-slate-800">
                                    <TableCell className="text-white">{item.name}</TableCell>
                                    <TableCell className="text-slate-400">{item.version}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Remediation Status */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-orange-400" />
                Remediation Status
              </h3>
              <RemediationCard deviceId={deviceId} />
            </div>
          </div>
        </div>

        <Card className="mt-6 bg-slate-800/50 border-slate-700">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-orange-400"/>Open Findings</CardTitle></CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader><TableRow className="border-slate-700 hover:bg-transparent">
                        <TableHead className="text-slate-300">Finding</TableHead>
                        <TableHead className="text-slate-300">Severity</TableHead>
                        <TableHead className="text-slate-300">Source</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                        {findings.filter(f => f.status === 'open').map(finding => (
                            <TableRow key={finding.id} className="border-slate-800">
                                <TableCell className="text-white">{finding.title}</TableCell>
                                <TableCell><Badge className={
                                    finding.severity === 'critical' ? 'bg-red-700/20 text-red-500' :
                                    finding.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                                    'bg-yellow-500/20 text-yellow-400'
                                }>{finding.severity}</Badge></TableCell>
                                <TableCell className="text-slate-400 capitalize">{finding.source}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
