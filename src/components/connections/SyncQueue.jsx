
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SyncQueueItem } from '@/api/entities';
import { RefreshCw, X, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const getStatusColor = (status) => {
  switch (status) {
    case 'completed': return 'bg-green-500/20 text-green-400';
    case 'processing': return 'bg-blue-500/20 text-blue-400';
    case 'failed': return 'bg-red-500/20 text-red-400';
    case 'pending': return 'bg-yellow-500/20 text-yellow-400';
    case 'cancelled': return 'bg-slate-500/20 text-slate-400';
    default: return 'bg-slate-500/20 text-slate-400';
  }
};

const getBackoffDelay = (attempts) => {
  const delays = [5, 30, 300]; // 5s, 30s, 5m
  return delays[Math.min(attempts, delays.length - 1)];
};

export default function SyncQueue() {
  const [queueItems, setQueueItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Memoize loadQueueItems to make it stable across renders
  const loadQueueItems = useCallback(async () => {
    try {
      const items = await SyncQueueItem.list('-created_date', 50);
      setQueueItems(items);
    } catch (error) {
      console.error('Error loading queue items:', error);
    }
    setLoading(false);
  }, [setQueueItems, setLoading]); // Dependencies for useCallback

  // Memoize seedDemoQueue, depending on the stable loadQueueItems
  const seedDemoQueue = useCallback(async () => {
    try {
      const existingItems = await SyncQueueItem.list();
      if (existingItems.length === 0) {
        // Create some sample queue items
        const sampleItems = [
          {
            platform: 'servicenow',
            action: 'create',
            ticket_id: 'TICKET-001',
            external_id: 'INC0010001',
            payload: { title: 'SAST finding: SQL injection vulnerability', severity: 'high' },
            status: 'completed',
            attempts: 1,
            organization_id: 'demo-org-1'
          },
          {
            platform: 'jira',
            action: 'update',
            ticket_id: 'TICKET-002',
            external_id: 'SEC-123',
            payload: { status: 'investigating' },
            status: 'failed',
            attempts: 2,
            next_retry_at: new Date(Date.now() + 30000).toISOString(),
            error_message: 'HTTP 429 - Rate limit exceeded',
            organization_id: 'demo-org-1'
          },
          {
            platform: 'servicenow',
            action: 'comment',
            ticket_id: 'TICKET-003',
            external_id: 'INC0010002',
            payload: { comment: 'Updated with latest scan results' },
            status: 'pending',
            attempts: 0,
            organization_id: 'demo-org-1'
          }
        ];

        for (const item of sampleItems) {
          await SyncQueueItem.create(item);
        }
        loadQueueItems();
      }
    } catch (error) {
      console.error('Error seeding demo queue:', error);
    }
  }, [loadQueueItems]); // seedDemoQueue depends on loadQueueItems

  // useEffect now correctly depends on stable loadQueueItems and seedDemoQueue
  useEffect(() => {
    loadQueueItems();
    seedDemoQueue();
  }, [loadQueueItems, seedDemoQueue]);

  const handleRetryItem = async (item) => {
    try {
      const updatedItem = {
        ...item,
        status: 'pending',
        attempts: item.attempts + 1,
        next_retry_at: new Date(Date.now() + getBackoffDelay(item.attempts) * 1000).toISOString(),
        error_message: null
      };
      
      await SyncQueueItem.update(item.id, updatedItem);
      toast.success('Item queued for retry');
      loadQueueItems();
    } catch (error) {
      toast.error('Failed to retry item');
    }
  };

  const handleCancelItem = async (item) => {
    try {
      await SyncQueueItem.update(item.id, { ...item, status: 'cancelled' });
      toast.success('Item cancelled');
      loadQueueItems();
    } catch (error) {
      toast.error('Failed to cancel item');
    }
  };

  const handleRetryAll = async () => {
    const failedItems = queueItems.filter(item => item.status === 'failed');
    for (const item of failedItems) {
      await handleRetryItem(item);
    }
    toast.success(`Retrying ${failedItems.length} failed items`);
  };

  if (loading) {
    return <div className="text-slate-400">Loading sync queue...</div>;
  }

  const pendingCount = queueItems.filter(item => item.status === 'pending').length;
  const failedCount = queueItems.filter(item => item.status === 'failed').length;
  const processingCount = queueItems.filter(item => item.status === 'processing').length;

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Sync Queue
          </CardTitle>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="text-sm text-slate-400">{pendingCount} Pending</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-sm text-slate-400">{processingCount} Processing</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span className="text-sm text-slate-400">{failedCount} Failed</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadQueueItems} variant="outline" size="sm" className="border-slate-600">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {failedCount > 0 && (
            <Button onClick={handleRetryAll} size="sm" className="bg-blue-600 hover:bg-blue-700">
              Retry All Failed
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700">
              <TableHead className="text-slate-300">Platform</TableHead>
              <TableHead className="text-slate-300">Action</TableHead>
              <TableHead className="text-slate-300">Ticket ID</TableHead>
              <TableHead className="text-slate-300">Status</TableHead>
              <TableHead className="text-slate-300">Attempts</TableHead>
              <TableHead className="text-slate-300">Next Retry</TableHead>
              <TableHead className="text-slate-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {queueItems.map((item) => (
              <TableRow key={item.id} className="border-slate-700">
                <TableCell>
                  <Badge variant="outline" className="border-slate-600 text-slate-300 capitalize">
                    {item.platform}
                  </Badge>
                </TableCell>
                <TableCell className="text-white capitalize">{item.action}</TableCell>
                <TableCell className="text-slate-300 font-mono text-sm">{item.ticket_id}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-400">
                  {item.attempts}/{item.max_attempts}
                </TableCell>
                <TableCell className="text-slate-400 text-xs">
                  {item.next_retry_at ? new Date(item.next_retry_at).toLocaleString() : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {item.status === 'failed' && (
                      <Button
                        onClick={() => handleRetryItem(item)}
                        variant="ghost"
                        size="sm"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </Button>
                    )}
                    {['pending', 'failed'].includes(item.status) && (
                      <Button
                        onClick={() => handleCancelItem(item)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {queueItems.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p>Sync queue is empty</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
