import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ActionButton from '@/components/ui/ActionButton';

const deployBaselineAction = async (baseline, targetGroup) => {
    console.log(`Deploying baseline ${baseline.name} to ${targetGroup}`);
    // Simulate long-running backend job
    await new Promise(res => setTimeout(res, 8000));
    return { resultUrl: `/jobs/deployment-log-123.txt` };
};

export default function BaselineDeployModal({ isOpen, onClose, baseline }) {
  const [targetGroup, setTargetGroup] = useState('');

  if (!baseline) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Deploy Baseline: {baseline.name}</DialogTitle>
          <DialogDescription>
            This action will create or update policies in {baseline.provider} to match this baseline.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <p>You are about to deploy <span className="font-bold text-red-400">{baseline.name} v{baseline.version}</span>.</p>
            <p className="text-sm text-slate-400">RedScan will only add or strengthen settings. It will not weaken existing stricter policies.</p>
            <div>
                <Label htmlFor="target-group">Target Device Group</Label>
                <Select onValueChange={setTargetGroup}>
                    <SelectTrigger id="target-group" className="bg-slate-800 border-slate-600">
                        <SelectValue placeholder="Select a group..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600 text-white">
                        <SelectItem value="All Windows Devices">All Windows Devices (10)</SelectItem>
                        <SelectItem value="Finance Laptops">Finance Laptops (3)</SelectItem>
                        <SelectItem value="Test Group">Test Group (1)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <ActionButton
            actionFn={() => deployBaselineAction(baseline, targetGroup)}
            isLongRunning={true}
            taskName={`Deploying ${baseline.name}`}
            successToast="Baseline deployment started. See task drawer for progress."
            disabled={!targetGroup}
            disabledReason="Please select a target group"
            onClick={() => onClose()}
          >
            Confirm & Deploy
          </ActionButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}