import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Asset } from '@/api/entities';
import { Target, Cloud, GitBranch } from 'lucide-react';

export default function AssetOverview() {
    const [assets, setAssets] = useState([]);
    useEffect(() => {
        Asset.list('-created_date', 5).then(setAssets);
    }, []);

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            Asset Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700">
              <TableHead className="text-slate-300">Name</TableHead>
              <TableHead className="text-slate-300">Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map(asset => (
              <TableRow key={asset.id} className="border-slate-800">
                <TableCell className="text-white font-medium">{asset.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{asset.type}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}