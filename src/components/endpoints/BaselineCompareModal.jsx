import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

const mockProviderSettings = {
    'BitLocker Encryption': 'Enabled (AES-256)',
    'Secure Boot': 'Enabled',
    'Screen Lock Timeout': '15 minutes',
    'Password Complexity': 'Weak', // Gap
    'Firewall': 'Enabled',
    'Defender EDR': 'Active',
};

export default function BaselineCompareModal({ isOpen, onClose, baseline }) {
  if (!baseline) return null;

  const baselineConfig = baseline.configuration || {};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Baseline Gap Analysis: {baseline.name}</DialogTitle>
          <DialogDescription>
            Comparing live provider settings against RedScan's recommended baseline.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 mt-4 max-h-[60vh] overflow-y-auto">
          <div>
            <h3 className="font-semibold mb-2 text-slate-300">Live Settings ({baseline.provider})</h3>
            <div className="space-y-2">
              {Object.entries(mockProviderSettings).map(([key, value]) => (
                <div key={key} className="p-2 bg-slate-800 rounded">
                  <p className="font-medium text-sm">{key}</p>
                  <p className="text-xs text-slate-400">{value}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-slate-300">RedScan Baseline v{baseline.version}</h3>
            <div className="space-y-2">
              {Object.entries(baselineConfig).map(([key, value]) => {
                const liveValue = mockProviderSettings[key];
                const isGap = liveValue && liveValue !== value;
                return (
                  <div key={key} className={`p-2 rounded ${isGap ? 'bg-red-900/50 border border-red-500/50' : 'bg-slate-800'}`}>
                    <div className="flex justify-between items-center">
                        <p className="font-medium text-sm">{key}</p>
                        {isGap && <Badge variant="destructive">Gap</Badge>}
                    </div>
                    <p className="text-xs text-slate-400">{value}</p>
                    {isGap && <p className="text-xs text-red-400 mt-1">Live setting is '{liveValue}'</p>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}