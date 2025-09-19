import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Play, 
  Pause, 
  AlertTriangle, 
  ExternalLink, 
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { RemediationTask, ItsmConnection } from '@/api/entities';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function RemediationControlTable({ 
  devices, 
  tasks, 
  selectedDevices, 
  onDeviceSelection, 
  onSelectAll, 
  canManage, 
  canBulkAction,
  onDataChange 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    os: 'all',
    severity: 'all',
    issueType: 'all',
    complianceState: 'all'
  });

  const getDeviceTask = (deviceId) => {
    return tasks
      .filter(t => t.device_id === deviceId)
      .sort((a, b) => new Date(b.started_at) - new Date(a.started_at))[0];
  };

  const getComplianceStatus = (compliancePercent) => {
    if (compliancePercent >= 90) return { status: 'Compliant', color: 'bg-green-500/20 text-green-400' };
    if (compliancePercent >= 70) return { status: 'Partial', color: 'bg-yellow-500/20 text-yellow-400' };
    return { status: 'Non-Compliant', color: 'bg-red-500/20 text-red-400' };
  };

  const getSeverityBadge = (device) => {
    const compliance = device.compliance_percent;
    const vulns = device.vuln_count || 0;
    
    if (compliance < 50 || vulns > 10) return { severity: 'Critical', color: 'bg-red-500/20 text-red-400' };
    if (compliance < 70 || vulns > 5) return { severity: 'High', color: 'bg-orange-500/20 text-orange-400' };
    if (compliance < 90 || vulns > 0) return { severity: 'Medium', color: 'bg-yellow-500/20 text-yellow-400' };
    return { severity: 'Low', color: 'bg-blue-500/20 text-blue-400' };
  };

  const getRemediationStatusBadge = (task) => {
    if (!task) return <Badge className="bg-slate-500/20 text-slate-400">No Task</Badge>;
    
    const statusConfig = {
      pending: { color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
      in_progress: { color: 'bg-blue-500/20 text-blue-400', icon: Play },
      resolved: { color: 'bg-green-500/20 text-green-400', icon: CheckCircle2 },
      failed: { color: 'bg-red-500/20 text-red-400', icon: XCircle },
      escalated: { color: 'bg-purple-500/20 text-purple-400', icon: ExternalLink },
      expired: { color: 'bg-slate-500/20 text-slate-400', icon: HelpCircle }
    };

    const config = statusConfig[task.status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {task.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  const filteredDevices = useMemo(() => {
    return devices.filter(device => {
      const nameMatch = device.hostname?.toLowerCase().includes(searchTerm.toLowerCase());
      const osMatch = filters.os === 'all' || device.platform === filters.os;
      
      const severity = getSeverityBadge(device).severity.toLowerCase();
      const severityMatch = filters.severity === 'all' || severity === filters.severity;
      
      const complianceStatus = getComplianceStatus(device.compliance_percent).status.toLowerCase();
      const complianceMatch = filters.complianceState === 'all' || complianceStatus.includes(filters.complianceState);
      
      return nameMatch && osMatch && severityMatch && complianceMatch;
    });
  }, [devices, searchTerm, filters]);

  const handleForceRemediate = async (deviceId) => {
    try {
      await RemediationTask.create({
        device_id: deviceId,
        playbook_id: 'playbook-auto',
        issue_type: 'encryption_missing',
        status: 'pending',
        trigger_reason: 'Manual force remediation',
        started_at: new Date().toISOString(),
        organization_id: 'org_default'
      });
      toast.success('Remediation task created');
      onDataChange();
    } catch (error) {
      toast.error('Failed to create remediation task');
    }
  };

  const handleQuarantine = async (deviceId) => {
    try {
      // Simulate quarantine action
      toast.success('Device quarantined - SSO access blocked');
      onDataChange();
    } catch (error) {
      toast.error('Failed to quarantine device');
    }
  };

  const handleEscalateToItsm = async (deviceId) => {
    try {
      // Simulate ITSM escalation
      const device = devices.find(d => d.id === deviceId);
      toast.success(`Escalated ${device?.hostname} to ServiceNow`);
      onDataChange();
    } catch (error) {
      toast.error('Failed to escalate to ITSM');
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>Device Remediation Control</span>
          <div className="text-sm text-slate-400">
            {filteredDevices.length} devices • {selectedDevices.length} selected
          </div>
        </CardTitle>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mt-4">
          <Input
            placeholder="Search devices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm bg-slate-900/50 border-slate-700"
          />
          
          <Select value={filters.os} onValueChange={(v) => setFilters(prev => ({...prev, os: v}))}>
            <SelectTrigger className="w-32 bg-slate-900/50 border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all" className="text-white">All OS</SelectItem>
              <SelectItem value="windows" className="text-white">Windows</SelectItem>
              <SelectItem value="macos" className="text-white">macOS</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.severity} onValueChange={(v) => setFilters(prev => ({...prev, severity: v}))}>
            <SelectTrigger className="w-36 bg-slate-900/50 border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all" className="text-white">All Severity</SelectItem>
              <SelectItem value="critical" className="text-white">Critical</SelectItem>
              <SelectItem value="high" className="text-white">High</SelectItem>
              <SelectItem value="medium" className="text-white">Medium</SelectItem>
              <SelectItem value="low" className="text-white">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.complianceState} onValueChange={(v) => setFilters(prev => ({...prev, complianceState: v}))}>
            <SelectTrigger className="w-44 bg-slate-900/50 border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all" className="text-white">All States</SelectItem>
              <SelectItem value="compliant" className="text-white">Compliant</SelectItem>
              <SelectItem value="non-compliant" className="text-white">Non-Compliant</SelectItem>
              <SelectItem value="partial" className="text-white">Partial</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700 hover:bg-transparent">
              {canBulkAction && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedDevices.length === filteredDevices.filter(d => d.compliance_percent < 90).length && filteredDevices.filter(d => d.compliance_percent < 90).length > 0}
                    onCheckedChange={onSelectAll}
                  />
                </TableHead>
              )}
              <TableHead className="text-slate-300">Device</TableHead>
              <TableHead className="text-slate-300">OS</TableHead>
              <TableHead className="text-slate-300">Severity</TableHead>
              <TableHead className="text-slate-300">Compliance</TableHead>
              <TableHead className="text-slate-300">Last Seen</TableHead>
              <TableHead className="text-slate-300">Remediation</TableHead>
              <TableHead className="text-slate-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDevices.map((device) => {
              const task = getDeviceTask(device.id);
              const compliance = getComplianceStatus(device.compliance_percent);
              const severity = getSeverityBadge(device);
              const isSelected = selectedDevices.includes(device.id);
              const isNonCompliant = device.compliance_percent < 90;

              return (
                <TableRow key={device.id} className="border-slate-800 hover:bg-slate-800/30">
                  {canBulkAction && (
                    <TableCell>
                      {isNonCompliant && (
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => onDeviceSelection(device.id, checked)}
                        />
                      )}
                    </TableCell>
                  )}
                  <TableCell>
                    <div>
                      <div className="font-medium text-white">{device.hostname}</div>
                      <div className="text-xs text-slate-400">{device.owner_note || 'Unassigned'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="capitalize text-slate-300">{device.platform}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={severity.color}>{severity.severity}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={compliance.color}>{compliance.status}</Badge>
                    <div className="text-xs text-slate-400 mt-1">{device.compliance_percent}%</div>
                  </TableCell>
                  <TableCell className="text-slate-400 text-sm">
                    {device.last_seen ? format(new Date(device.last_seen), 'MMM dd, HH:mm') : 'Never'}
                  </TableCell>
                  <TableCell>
                    {getRemediationStatusBadge(task)}
                  </TableCell>
                  <TableCell>
                    {canManage && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-500/50 text-blue-300 text-xs"
                          onClick={() => handleForceRemediate(device.id)}
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Fix
                        </Button>
                        {isNonCompliant && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-500/50 text-red-300 text-xs"
                              onClick={() => handleQuarantine(device.id)}
                            >
                              <Pause className="w-3 h-3 mr-1" />
                              Block
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-purple-500/50 text-purple-300 text-xs"
                              onClick={() => handleEscalateToItsm(device.id)}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              ITSM
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}