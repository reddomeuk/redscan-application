import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Plus, Zap } from 'lucide-react';

export default function AssignmentRulesPage() {
    const mockRules = [
        { id: 1, name: 'Critical Web Vulns', categories: ['Web'], target: 'DevSecOps', active: true },
        { id: 2, name: 'Endpoint Compliance', categories: ['Endpoint'], target: 'Endpoint Team', active: true },
        { id: 3, name: 'Cloud Misconfigurations', categories: ['Cloud', 'IaC'], target: 'DevOps', active: true },
    ];
  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Assignment Rules</h1>
          <p className="text-slate-400">Automate finding triage and assignment to the correct teams.</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700">
          <Plus className="w-4 h-4 mr-2" />
          New Rule
        </Button>
      </header>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader><CardTitle className="text-white">Rule Configuration</CardTitle></CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow className="border-slate-700">
                        <TableHead className="text-slate-300">Rule Name</TableHead>
                        <TableHead className="text-slate-300">Categories</TableHead>
                        <TableHead className="text-slate-300">Target Group</TableHead>
                        <TableHead className="text-slate-300">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {mockRules.map(rule => (
                        <TableRow key={rule.id} className="border-slate-800">
                            <TableCell className="font-medium text-white">{rule.name}</TableCell>
                            <TableCell>
                                {rule.categories.map(cat => <Badge key={cat} variant="secondary" className="mr-1">{cat}</Badge>)}
                            </TableCell>
                            <TableCell className="text-slate-300">{rule.target}</TableCell>
                            <TableCell>
                                <Badge className={rule.active ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}>
                                    {rule.active ? 'Active' : 'Inactive'}
                                </Badge>
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