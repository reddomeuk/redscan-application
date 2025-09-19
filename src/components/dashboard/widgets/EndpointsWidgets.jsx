import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Smartphone, Shield, Lock, Calendar } from 'lucide-react';

const ComplianceOverview = ({ onRemove }) => {
  const mockCompliance = {
    compliant: 85,
    nonCompliant: 12,
    pending: 3,
    total: 100
  };

  const compliancePercentage = Math.round((mockCompliance.compliant / mockCompliance.total) * 100);

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-blue-400" />
          Endpoint Compliance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-4">
          <div className="text-3xl font-bold text-white">{compliancePercentage}%</div>
          <div className="text-sm text-slate-400">
            {mockCompliance.compliant}/{mockCompliance.total} devices compliant
          </div>
          <Progress value={compliancePercentage} className="mt-2" />
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <div className="text-green-400 font-bold">{mockCompliance.compliant}</div>
            <div className="text-slate-400">Compliant</div>
          </div>
          <div>
            <div className="text-red-400 font-bold">{mockCompliance.nonCompliant}</div>
            <div className="text-slate-400">Non-Compliant</div>
          </div>
          <div>
            <div className="text-yellow-400 font-bold">{mockCompliance.pending}</div>
            <div className="text-slate-400">Pending</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const EncryptionCoverage = ({ onRemove }) => {
  const mockEncryption = {
    windows: { enabled: 45, total: 50 },
    macos: { enabled: 28, total: 30 },
    mobile: { enabled: 18, total: 20 }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-green-400" />
          Encryption Coverage
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(mockEncryption).map(([platform, data]) => {
            const percentage = Math.round((data.enabled / data.total) * 100);
            return (
              <div key={platform}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white font-medium capitalize">{platform}</span>
                  <span className="text-sm text-slate-400">{percentage}%</span>
                </div>
                <Progress value={percentage} className="h-2" />
                <p className="text-xs text-slate-400 mt-1">
                  {data.enabled}/{data.total} devices
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

const PatchSLA = ({ onRemove }) => {
  const mockPatching = {
    withinSLA: 78,
    overdue: 15,
    critical: 7
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-yellow-400" />
          Patch SLA (14 days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-2xl font-bold text-green-400">{mockPatching.withinSLA}%</div>
            <div className="text-xs text-slate-400">Within SLA</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-400">{mockPatching.overdue}</div>
            <div className="text-xs text-slate-400">Overdue</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-400">{mockPatching.critical}</div>
            <div className="text-xs text-slate-400">Critical</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default {
  ComplianceOverview,
  EncryptionCoverage,
  PatchSLA
};