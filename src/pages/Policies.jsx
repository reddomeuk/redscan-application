import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Plus } from 'lucide-react';

export default function PoliciesPage() {
    const mockPolicies = [
        { id: 1, name: 'Endpoint Baseline (Windows)', status: 'active', type: 'Endpoint' },
        { id: 2, name: 'SaaS MFA Enforcement', status: 'active', type: 'SaaS' },
        { id: 3, name: 'Cloud Guardrails (AWS)', status: 'draft', type: 'Cloud' },
        { id: 4, name: 'Supplier Due Diligence', status: 'active', type: 'Supplier' },
    ];
  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Security Policies</h1>
          <p className="text-slate-400">Define and manage your organization's security and compliance rules.</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700">
          <Plus className="w-4 h-4 mr-2" />
          New Policy
        </Button>
      </header>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader><CardTitle className="text-white">Policy Library</CardTitle></CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow className="border-slate-700">
                        <TableHead className="text-slate-300">Policy Name</TableHead>
                        <TableHead className="text-slate-300">Type</TableHead>
                        <TableHead className="text-slate-300">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {mockPolicies.map(policy => (
                        <TableRow key={policy.id} className="border-slate-800">
                            <TableCell className="font-medium text-white">{policy.name}</TableCell>
                            <TableCell className="text-slate-300">{policy.type}</TableCell>
                            <TableCell>
                                <Badge className={policy.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>{policy.status}</Badge>
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