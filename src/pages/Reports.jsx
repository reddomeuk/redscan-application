import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Plus, Download } from 'lucide-react';
import ActionButton from '../components/ui/ActionButton';

const generateReportAction = async () => {
    // This is a mock for a long-running backend process
    console.log("Starting report generation...");
    await new Promise(res => setTimeout(res, 5000)); // Simulate work
    console.log("Report generation finished.");
    return { downloadUrl: '/reports/q3-summary.pdf' };
};

export default function ReportsPage() {
    const mockReports = [
        { id: 1, name: 'Executive Summary - Q3 2024', type: 'Executive', date: '2024-10-01' },
        { id: 2, name: 'Endpoint Snapshot - October', type: 'Endpoint', date: '2024-10-05' },
        { id: 3, name: 'Threat Intel Digest - Week 40', type: 'Threat Intel', date: '2024-10-07' },
        { id: 4, name: 'CE+ Evidence Pack - Audit Prep', type: 'Compliance', date: '2024-09-20' },
    ];
  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Report Center</h1>
          <p className="text-slate-400">Generate and manage custom security reports.</p>
        </div>
        <ActionButton
            actionFn={generateReportAction}
            isLongRunning={true}
            taskName="Generating Executive Summary"
            successToast="Report generation started. See task drawer for progress."
            className="bg-red-600 hover:bg-red-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Executive Report
        </ActionButton>
      </header>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader><CardTitle className="text-white">Generated Reports</CardTitle></CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow className="border-slate-700">
                        <TableHead className="text-slate-300">Report Name</TableHead>
                        <TableHead className="text-slate-300">Type</TableHead>
                        <TableHead className="text-slate-300">Date Generated</TableHead>
                        <TableHead className="text-slate-300">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {mockReports.map(report => (
                        <TableRow key={report.id} className="border-slate-800">
                            <TableCell className="font-medium text-white">{report.name}</TableCell>
                            <TableCell className="text-slate-300">{report.type}</TableCell>
                            <TableCell className="text-slate-300">{report.date}</TableCell>
                            <TableCell>
                                <Button variant="outline" size="sm"><Download className="w-3 h-3 mr-1" /> Download</Button>
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