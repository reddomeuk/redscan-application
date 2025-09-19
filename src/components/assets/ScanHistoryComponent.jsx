import React, { useState, useEffect } from "react";
import { Scan } from "@/api/entities";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Activity, XCircle, Clock } from "lucide-react";

const ScanHistoryComponent = ({ assetId }) => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScans();
  }, [assetId]);

  const loadScans = async () => {
    try {
      const allScans = await Scan.list('-created_date', 100);
      const assetScans = allScans.filter(scan => scan.asset_id === assetId);
      setScans(assetScans);
    } catch (error) {
      console.error('Error loading scans:', error);
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'running': return 'bg-blue-500/20 text-blue-400';
      case 'failed': return 'bg-red-500/20 text-red-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return CheckCircle2;
      case 'running': return Activity;
      case 'failed': return XCircle;
      default: return Clock;
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  };

  if (loading) {
    return <div className="text-slate-400">Loading scan history...</div>;
  }

  if (scans.length === 0) {
    return <div className="text-slate-400 text-center py-8">No scans have been run for this asset</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-slate-700">
          <TableHead className="text-slate-300">Date</TableHead>
          <TableHead className="text-slate-300">Type</TableHead>
          <TableHead className="text-slate-300">Status</TableHead>
          <TableHead className="text-slate-300">Findings</TableHead>
          <TableHead className="text-slate-300">Duration</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {scans.map(scan => {
          const StatusIcon = getStatusIcon(scan.status);
          return (
            <TableRow key={scan.id} className="border-slate-700">
              <TableCell className="text-white">
                {scan.started_at ? new Date(scan.started_at).toLocaleDateString() : '-'}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-slate-300 border-slate-600">
                  {scan.scan_type}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <StatusIcon className="w-4 h-4" />
                  <Badge className={getStatusColor(scan.status)}>
                    {scan.status}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="text-white">
                {scan.summary?.findings_count || '-'}
              </TableCell>
              <TableCell className="text-slate-400">
                {formatDuration(scan.summary?.duration_seconds)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default ScanHistoryComponent;