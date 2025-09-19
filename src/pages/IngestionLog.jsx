import React, { useState, useEffect } from 'react';
import { AgentEvent, Device } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { List } from 'lucide-react';
import { format } from 'date-fns';

export default function IngestionLog() {
  const [events, setEvents] = useState([]);
  const [devices, setDevices] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      try {
        const [eventData, deviceData] = await Promise.all([
          AgentEvent.list('-received_at', 100),
          Device.list()
        ]);
        setEvents(eventData);
        const deviceMap = deviceData.reduce((acc, dev) => {
          acc[dev.id] = dev;
          return acc;
        }, {});
        setDevices(deviceMap);
      } catch (e) {
        console.error("Failed to load ingestion log", e);
      }
      setLoading(false);
    };
    loadLogs();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'bg-green-500/20 text-green-400 border-green-500/40';
      case 'failure': return 'bg-red-500/20 text-red-400 border-red-500/40';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Agent Ingestion Log</h1>
          <p className="text-slate-400">A log of recent agent check-ins and data ingestion events.</p>
        </div>

        <Card className="mt-8 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2"><List className="w-5 h-5 text-blue-400"/>Recent Events</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full bg-slate-700" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Timestamp</TableHead>
                    <TableHead className="text-slate-300">Device</TableHead>
                    <TableHead className="text-slate-300">Summary</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map(event => (
                    <TableRow key={event.id} className="border-slate-700">
                      <TableCell className="text-slate-400 font-mono text-xs">{format(new Date(event.received_at), 'yyyy-MM-dd HH:mm:ss')}</TableCell>
                      <TableCell className="text-white font-medium">{devices[event.device_id]?.hostname || 'Unknown Device'}</TableCell>
                      <TableCell className="text-slate-300">{event.summary}</TableCell>
                      <TableCell><Badge className={getStatusColor(event.status)}>{event.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}