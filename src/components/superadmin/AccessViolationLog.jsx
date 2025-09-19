import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AccessViolationLog } from '@/api/entities';
import { toast } from 'sonner';

export default function AccessViolationLogComponent() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const logData = await AccessViolationLog.list('-created_date', 100);
      setLogs(logData);
    } catch (error) {
      console.error("Error loading access violation logs:", error);
      toast.error("Failed to load access logs.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Access Violation Logs</CardTitle>
        <p className="text-slate-400">Recorded attempts to access resources across organization boundaries.</p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700">
              <TableHead className="text-slate-300">Timestamp</TableHead>
              <TableHead className="text-slate-300">User</TableHead>
              <TableHead className="text-slate-300">User's Org ID</TableHead>
              <TableHead className="text-slate-300">Target Resource</TableHead>
              <TableHead className="text-slate-300">Target Org ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center text-slate-400">Loading logs...</TableCell></TableRow>
            ) : logs.length === 0 ? (
               <TableRow><TableCell colSpan={5} className="text-center text-slate-400">No access violations recorded. Excellent!</TableCell></TableRow>
            ) : (
              logs.map(log => (
                <TableRow key={log.id} className="border-slate-700">
                  <TableCell className="text-slate-400">{new Date(log.created_date).toLocaleString()}</TableCell>
                  <TableCell className="text-white">{log.user_email}</TableCell>
                  <TableCell className="text-slate-400 truncate max-w-xs">{log.organization_id}</TableCell>
                  <TableCell className="text-white">{log.target_resource_type}:{log.target_resource_id}</TableCell>
                  <TableCell className="text-slate-400 truncate max-w-xs">{log.target_organization_id}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}