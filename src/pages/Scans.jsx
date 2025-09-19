
import React, { useState, useEffect, useCallback } from "react";
import { Scan, Asset, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  Eye,
  AlertTriangle
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from 'sonner';

export default function ScansPage() {
  const [scans, setScans] = useState([]);
  const [assets, setAssets] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: 'all', status: 'all' });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const orgId = currentUser.organization_id;
      const isSuperAdmin = currentUser.role === 'super_admin';
      const filter = isSuperAdmin ? {} : { organization_id: orgId };

      const [scanData, assetData] = await Promise.all([
        isSuperAdmin ? Scan.list('-created_date', 100) : Scan.filter(filter, '-created_date', 100),
        isSuperAdmin ? Asset.list() : Asset.filter(filter)
      ]);

      setScans(scanData);
      setAssets(assetData);
    } catch (error) {
      console.error('Error loading scans data:', error);
      toast.error("Failed to load scans.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/40';
      case 'running': return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'queued': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return CheckCircle2;
      case 'running': return Activity;
      case 'failed': return XCircle;
      case 'queued': return Clock;
      default: return Clock;
    }
  };

  const getScanTypeColor = (scanType) => {
    const colors = {
      subdomain: 'bg-purple-500/20 text-purple-400',
      portscan: 'bg-blue-500/20 text-blue-400',
      webscan: 'bg-green-500/20 text-green-400',
      sast: 'bg-orange-500/20 text-orange-400',
      sca: 'bg-pink-500/20 text-pink-400',
      secrets: 'bg-red-500/20 text-red-400',
      iac: 'bg-cyan-500/20 text-cyan-400',
      cspm: 'bg-indigo-500/20 text-indigo-400'
    };
    return colors[scanType] || 'bg-slate-500/20 text-slate-400';
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  };

  const getAssetName = (assetId) => {
    const asset = assets.find(a => a.id === assetId);
    return asset ? asset.name : 'Unknown Asset';
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Security Scans</h1>
            <p className="text-slate-400">Monitor and manage all security scanning activities</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{scans.length}</div>
                <div className="text-sm text-slate-400">Total Scans</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {scans.filter(s => s.status === 'running').length}
                </div>
                <div className="text-sm text-slate-400">Running</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {scans.filter(s => s.status === 'completed').length}
                </div>
                <div className="text-sm text-slate-400">Completed</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {scans.reduce((sum, s) => sum + (s.summary?.findings_count || 0), 0)}
                </div>
                <div className="text-sm text-slate-400">Total Findings</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scans Table */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Asset</TableHead>
                  <TableHead className="text-slate-300">Scan Type</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Findings</TableHead>
                  <TableHead className="text-slate-300">Duration</TableHead>
                  <TableHead className="text-slate-300">Started</TableHead>
                  <TableHead className="text-slate-300 w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i} className="border-slate-700">
                      <TableCell colSpan={7} className="text-center py-8">
                        <Skeleton className="h-4 w-full bg-slate-700" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : scans.length === 0 ? (
                  <TableRow className="border-slate-700">
                    <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                      No scans have been run yet
                    </TableCell>
                  </TableRow>
                ) : (
                  scans.map((scan) => {
                    const StatusIcon = getStatusIcon(scan.status);

                    return (
                      <TableRow key={scan.id} className="border-slate-700 hover:bg-slate-700/30">
                        <TableCell>
                          <div className="font-medium text-white">{getAssetName(scan.asset_id)}</div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getScanTypeColor(scan.scan_type)}>
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
                        <TableCell>
                          {scan.summary?.findings_count ? (
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium">{scan.summary.findings_count}</span>
                              {scan.summary.critical_count > 0 && (
                                <Badge className="bg-red-500/20 text-red-400 text-xs">
                                  {scan.summary.critical_count} critical
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-400">
                          {formatDuration(scan.summary?.duration_seconds)}
                        </TableCell>
                        <TableCell className="text-slate-400 text-sm">
                          {scan.started_at
                            ? new Date(scan.started_at).toLocaleDateString()
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          <Link to={createPageUrl(`AssetDetail?id=${scan.asset_id}`)}>
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
