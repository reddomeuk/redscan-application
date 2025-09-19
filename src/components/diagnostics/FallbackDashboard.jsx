import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Server, CheckCircle } from 'lucide-react';

export default function FallbackDashboard() {
  return (
    <div className="p-4 md:p-8 bg-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard (Safe Mode)</h1>
        <p className="text-slate-400 mb-8">
          The app is running in Safe Mode. Only static information is shown.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Assets</CardTitle>
              <Server className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">5</div>
              <p className="text-xs text-slate-400">monitored</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Open Findings</CardTitle>
              <AlertTriangle className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">12</div>
              <p className="text-xs text-slate-400">3 critical</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Compliance</CardTitle>
              <CheckCircle className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">92%</div>
              <p className="text-xs text-slate-400">overall score</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
                <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-slate-300">All data fetching and background processes are currently disabled. To see live data, please attempt to switch to Normal Mode using the banner at the top of the page.</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}