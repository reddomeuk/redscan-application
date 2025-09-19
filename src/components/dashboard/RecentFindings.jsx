import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Finding } from '@/api/entities';
import { Zap } from 'lucide-react';

export default function RecentFindings() {
    const [findings, setFindings] = useState([]);
    useEffect(() => {
        Finding.list('-created_date', 5).then(setFindings);
    }, []);

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Recent Findings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700">
              <TableHead className="text-slate-300">Title</TableHead>
              <TableHead className="text-slate-300">Severity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {findings.map(finding => (
              <TableRow key={finding.id} className="border-slate-800">
                <TableCell className="text-white font-medium">{finding.title}</TableCell>
                <TableCell>
                  <Badge variant={finding.severity}>{finding.severity}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}