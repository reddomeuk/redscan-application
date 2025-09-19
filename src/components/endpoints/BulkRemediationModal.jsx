import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Play, 
  Pause, 
  ExternalLink, 
  Download,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { RemediationTask } from '@/api/entities';
import { toast } from 'sonner';

export default function BulkRemediationModal({ 
  selectedDevices, 
  devices, 
  onClose, 
  onComplete 
}) {
  const [action, setAction] = useState('');
  const [options, setOptions] = useState({
    forceRemediate: false,
    quarantine: false,
    escalateToItsm: false,
    exportCsv: false
  });
  const [loading, setLoading] = useState(false);

  const selectedDeviceData = devices.filter(d => selectedDevices.includes(d.id));

  const handleExecute = async () => {
    if (!action) {
      toast.error('Please select an action');
      return;
    }

    setLoading(true);
    try {
      switch (action) {
        case 'force_remediate':
          // Create remediation tasks for all selected devices
          for (const deviceId of selectedDevices) {
            await RemediationTask.create({
              device_id: deviceId,
              playbook_id: 'playbook-bulk',
              issue_type: 'encryption_missing',
              status: 'pending',
              trigger_reason: 'Bulk remediation action',
              started_at: new Date().toISOString(),
              organization_id: 'org_default'
            });
          }
          toast.success(`Remediation tasks created for ${selectedDevices.length} devices`);
          break;

        case 'push_baseline':
          // Simulate pushing baseline policies
          await new Promise(resolve => setTimeout(resolve, 2000));
          toast.success(`Baseline policies pushed to ${selectedDevices.length} devices via Intune/Google MDM`);
          break;

        case 'compliance_recheck':
          // Simulate compliance recheck
          await new Promise(resolve => setTimeout(resolve, 1500));
          toast.success(`Compliance recheck triggered for ${selectedDevices.length} devices`);
          break;

        case 'quarantine':
          // Simulate quarantine
          await new Promise(resolve => setTimeout(resolve, 1000));
          toast.success(`${selectedDevices.length} devices quarantined - SSO access blocked`);
          break;

        case 'export_csv':
          // Generate CSV export
          const csvHeaders = 'Device ID,Hostname,Platform,Compliance %,Risk Score,Last Seen\n';
          const csvData = selectedDeviceData.map(d => 
            `${d.id},${d.hostname},${d.platform},${d.compliance_percent},${d.risk_score},${d.last_seen || 'Never'}`
          ).join('\n');
          
          const blob = new Blob([csvHeaders + csvData], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `bulk_devices_${new Date().toISOString().split('T')[0]}.csv`;
          link.click();
          URL.revokeObjectURL(url);
          
          toast.success('CSV export downloaded');
          break;

        default:
          toast.error('Unknown action');
          return;
      }

      onComplete();
    } catch (error) {
      console.error('Bulk action failed:', error);
      toast.error('Bulk action failed');
    }
    setLoading(false);
  };

  const getActionDescription = () => {
    const descriptions = {
      force_remediate: 'Create remediation tasks and attempt automated fixes for all selected devices',
      push_baseline: 'Deploy RedScan security baseline policies via Intune and Google MDM',
      compliance_recheck: 'Trigger immediate compliance check and policy sync',
      quarantine: 'Block SSO access until devices become compliant',
      export_csv: 'Download device list as CSV for offline tracking'
    };
    return descriptions[action] || '';
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="w-5 h-5 text-blue-400" />
            Bulk Device Actions
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selected Devices Summary */}
          <div className="bg-slate-900/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">
              Selected Devices ({selectedDevices.length})
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {selectedDeviceData.map((device) => (
                <div key={device.id} className="flex items-center justify-between text-sm">
                  <span className="text-white">{device.hostname}</span>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-slate-700 text-slate-300 capitalize">
                      {device.platform}
                    </Badge>
                    <Badge className={
                      device.compliance_percent >= 90 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }>
                      {device.compliance_percent}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Selection */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-2">
                Select Action
              </label>
              <Select value={action} onValueChange={setAction}>
                <SelectTrigger className="bg-slate-900/50 border-slate-700">
                  <SelectValue placeholder="Choose an action to perform" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="force_remediate" className="text-white">
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4 text-blue-400" />
                      Force Remediation
                    </div>
                  </SelectItem>
                  <SelectItem value="push_baseline" className="text-white">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      Push Baseline Policies
                    </div>
                  </SelectItem>
                  <SelectItem value="compliance_recheck" className="text-white">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-yellow-400" />
                      Trigger Compliance Recheck
                    </div>
                  </SelectItem>
                  <SelectItem value="quarantine" className="text-white">
                    <div className="flex items-center gap-2">
                      <Pause className="w-4 h-4 text-red-400" />
                      Quarantine Devices
                    </div>
                  </SelectItem>
                  <SelectItem value="export_csv" className="text-white">
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-slate-400" />
                      Export to CSV
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {action && (
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                <p className="text-sm text-blue-300">
                  <strong>Action:</strong> {getActionDescription()}
                </p>
              </div>
            )}

            {action === 'quarantine' && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-medium text-red-300">Warning</span>
                </div>
                <p className="text-sm text-red-300">
                  This action will immediately block SSO access for selected devices. 
                  Users will not be able to access corporate applications until their devices become compliant.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="border-slate-600 text-slate-300"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleExecute}
              disabled={!action || loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Executing...' : `Execute Action`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}