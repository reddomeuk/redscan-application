import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { 
  Shield, 
  Clock, 
  X, 
  Plus, 
  Download,
  AlertTriangle,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { format, isBefore, addDays } from 'date-fns';
import { toast } from 'sonner';

// Mock exception data - in real app this would come from an Exception entity
const mockExceptions = [
  {
    id: 'exc-1',
    device_id: 'device-1',
    device_name: 'LAPTOP-001',
    issue_type: 'encryption_missing',
    reason: 'Legacy system compatibility issues',
    approved_by: 'admin@redscan.ai',
    approved_at: '2024-01-15T10:30:00Z',
    expires_at: '2024-02-15T23:59:59Z',
    status: 'active'
  },
  {
    id: 'exc-2', 
    device_id: 'device-2',
    device_name: 'MAC-DEV-05',
    issue_type: 'outdated_os',
    reason: 'Critical development environment - scheduled for maintenance',
    approved_by: 'admin@redscan.ai',
    approved_at: '2024-01-20T14:15:00Z',
    expires_at: '2024-01-28T23:59:59Z',
    status: 'expired'
  },
  {
    id: 'exc-3',
    device_id: 'device-3',
    device_name: 'TABLET-HR-02',
    issue_type: 'missing_edr',
    reason: 'BYOD device - limited management capabilities',
    approved_by: 'security@redscan.ai',
    approved_at: '2024-01-10T09:00:00Z',
    expires_at: '2024-03-10T23:59:59Z',
    status: 'active'
  }
];

export default function ExceptionManager({ devices, canManage, onDataChange }) {
  const [exceptions, setExceptions] = useState(mockExceptions);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredExceptions = exceptions.filter(exc =>
    exc.device_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exc.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRevokeException = async (exceptionId) => {
    try {
      // Simulate revoke action
      setExceptions(prev => 
        prev.map(exc => 
          exc.id === exceptionId 
            ? { ...exc, status: 'revoked' }
            : exc
        )
      );
      toast.success('Exception revoked successfully');
      onDataChange();
    } catch (error) {
      toast.error('Failed to revoke exception');
    }
  };

  const handleExtendException = async (exceptionId) => {
    try {
      // Simulate extend action
      setExceptions(prev => 
        prev.map(exc => 
          exc.id === exceptionId 
            ? { ...exc, expires_at: addDays(new Date(exc.expires_at), 30).toISOString() }
            : exc
        )
      );
      toast.success('Exception extended by 30 days');
      onDataChange();
    } catch (error) {
      toast.error('Failed to extend exception');
    }
  };

  const handleExportExceptions = () => {
    const csvHeaders = 'Device,Issue Type,Reason,Approved By,Approved Date,Expires,Status\n';
    const csvData = exceptions.map(exc => 
      `"${exc.device_name}","${exc.issue_type}","${exc.reason}","${exc.approved_by}","${format(new Date(exc.approved_at), 'yyyy-MM-dd')}","${format(new Date(exc.expires_at), 'yyyy-MM-dd')}","${exc.status}"`
    ).join('\n');
    
    const blob = new Blob([csvHeaders + csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compliance_exceptions_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Exceptions exported to CSV');
  };

  const getStatusBadge = (exception) => {
    const now = new Date();
    const expiresAt = new Date(exception.expires_at);
    
    if (exception.status === 'revoked') {
      return <Badge className="bg-red-500/20 text-red-400">Revoked</Badge>;
    }
    
    if (isBefore(expiresAt, now)) {
      return <Badge className="bg-yellow-500/20 text-yellow-400">Expired</Badge>;
    }
    
    return <Badge className="bg-green-500/20 text-green-400">Active</Badge>;
  };

  const getIssueTypeBadge = (issueType) => {
    const types = {
      encryption_missing: { color: 'bg-red-500/20 text-red-400', text: 'Missing Encryption' },
      outdated_os: { color: 'bg-orange-500/20 text-orange-400', text: 'Outdated OS' },
      missing_edr: { color: 'bg-purple-500/20 text-purple-400', text: 'Missing EDR' },
      firewall_disabled: { color: 'bg-yellow-500/20 text-yellow-400', text: 'Firewall Disabled' }
    };
    
    const config = types[issueType] || { color: 'bg-slate-500/20 text-slate-400', text: issueType };
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  const activeExceptions = exceptions.filter(exc => {
    const now = new Date();
    const expiresAt = new Date(exc.expires_at);
    return exc.status === 'active' && !isBefore(expiresAt, now);
  }).length;

  const expiredExceptions = exceptions.filter(exc => {
    const now = new Date();
    const expiresAt = new Date(exc.expires_at);
    return isBefore(expiresAt, now) && exc.status !== 'revoked';
  }).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-400">{activeExceptions}</div>
            <div className="text-sm text-slate-400">Active Exceptions</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-400">{expiredExceptions}</div>
            <div className="text-sm text-slate-400">Expired/Need Review</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-slate-400">{exceptions.length}</div>
            <div className="text-sm text-slate-400">Total Exceptions</div>
          </CardContent>
        </Card>
      </div>

      {/* Exception Management */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-yellow-400" />
              Compliance Exceptions
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-slate-600"
                onClick={handleExportExceptions}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              {canManage && (
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Exception
                </Button>
              )}
            </div>
          </CardTitle>
          
          <div className="mt-4">
            <Input
              placeholder="Search exceptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm bg-slate-900/50 border-slate-700"
            />
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700 hover:bg-transparent">
                <TableHead className="text-slate-300">Device</TableHead>
                <TableHead className="text-slate-300">Issue</TableHead>
                <TableHead className="text-slate-300">Reason</TableHead>
                <TableHead className="text-slate-300">Approved By</TableHead>
                <TableHead className="text-slate-300">Expires</TableHead>
                <TableHead className="text-slate-300">Status</TableHead>
                {canManage && <TableHead className="text-slate-300">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExceptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canManage ? 7 : 6} className="text-center py-8 text-slate-400">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No compliance exceptions found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredExceptions.map((exception) => {
                  const isExpired = isBefore(new Date(exception.expires_at), new Date());
                  
                  return (
                    <TableRow key={exception.id} className="border-slate-800 hover:bg-slate-800/30">
                      <TableCell>
                        <div className="font-medium text-white">{exception.device_name}</div>
                      </TableCell>
                      <TableCell>
                        {getIssueTypeBadge(exception.issue_type)}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs text-sm text-slate-300 truncate" title={exception.reason}>
                          {exception.reason}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-400 text-sm">
                        {exception.approved_by}
                      </TableCell>
                      <TableCell className="text-slate-400 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(exception.expires_at), 'MMM dd, yyyy')}
                          {isExpired && (
                            <AlertTriangle className="w-3 h-3 text-yellow-400" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(exception)}
                      </TableCell>
                      {canManage && (
                        <TableCell>
                          <div className="flex gap-1">
                            {exception.status === 'active' && !isExpired && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-blue-500/50 text-blue-300 text-xs"
                                  onClick={() => handleExtendException(exception.id)}
                                >
                                  <Clock className="w-3 h-3 mr-1" />
                                  Extend
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-500/50 text-red-300 text-xs"
                                  onClick={() => handleRevokeException(exception.id)}
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  Revoke
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}