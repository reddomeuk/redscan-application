// Minimal Dashboard for debugging
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Dashboard() {
  return (
    <div className="space-y-6 p-4">
      <h1 className="text-3xl font-bold text-white">RedScan Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Security Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300">System is operational and monitoring 127 assets.</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Findings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300">3 new vulnerabilities detected in the last 24 hours.</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Compliance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300">92% compliant with security frameworks.</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Run Scan
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              View Reports
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
              Security Settings
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
