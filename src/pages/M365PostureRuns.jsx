import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Play,
  Download,
  Eye,
  Filter
} from 'lucide-react';
import { M365PostureRun } from '@/api/entities';
import { toast } from 'sonner';

const MOCK_RUNS = [
  {
    id: 'run-3',
    status: 'completed',
    started_at: '2024-01-15T09:00:00Z',
    completed_at: '2024-01-15T09:12:00Z',
    duration_seconds: 720,
    results_summary: {
      passed: 128,
      failed: 24,
      skipped: 4,
      severity_breakdown: { high: 3, medium: 8, low: 13 }
    }
  },
  {
    id: 'run-2',
    status: 'completed',
    started_at: '2024-01-08T09:00:00Z',
    completed_at: '2024-01-08T09:15:00Z',
    duration_seconds: 900,
    results_summary: {
      passed: 125,
      failed: 27,
      skipped: 4,
      severity_breakdown: { high: 4, medium: 9, low: 14 }
    }
  },
  {
    id: 'run-1',
    status: 'failed',
    started_at: '2024-01-01T09:00:00Z',
    completed_at: '2024-01-01T09:03:00Z',
    duration_seconds: 180,
    results_summary: null
  }
];

const StatusBadge = ({ status }) => {
  const config = {
    completed: { color: 'bg-green-500/20 text-green-400', icon: CheckCircle2 },
    failed: { color: 'bg-red-500/20 text-red-400', icon: XCircle },
    running: { color: 'bg-blue-500/20 text-blue-400', icon: Play },
    queued: { color: 'bg-yellow-500/20 text-yellow-400', icon: Clock }
  }[status] || { color: 'bg-gray-500/20 text-gray-400', icon: AlertCircle };
  
  const Icon = config.icon;
  
  return (
    <Badge className={config.color}>
      <Icon className="w-3 h-3 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

const RunsTable = ({ runs, onViewRun, onExportRun }) => (
  <Card className="bg-slate-800/50 border-slate-700">
    <CardHeader>
      <CardTitle className="text-white">Posture Assessment Runs</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow className="border-slate-700">
            <TableHead className="text-slate-300">Date</TableHead>
            <TableHead className="text-slate-300">Status</TableHead>
            <TableHead className="text-slate-300">Results</TableHead>
            <TableHead className="text-slate-300">Issues</TableHead>
            <TableHead className="text-slate-300">Duration</TableHead>
            <TableHead className="text-slate-300">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {runs.map(run => (
            <TableRow key={run.id} className="border-slate-800">
              <TableCell className="text-white">
                {new Date(run.started_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <StatusBadge status={run.status} />
              </TableCell>
              <TableCell className="text-white">
                {run.results_summary ? (
                  <div className="flex gap-2 text-sm">
                    <span className="text-green-400">{run.results_summary.passed}P</span>
                    <span className="text-red-400">{run.results_summary.failed}F</span>
                    <span className="text-yellow-400">{run.results_summary.skipped}S</span>
                  </div>
                ) : '-'}
              </TableCell>
              <TableCell>
                {run.results_summary ? (
                  <div className="flex gap-2 text-sm">
                    <span className="text-red-400">{run.results_summary.severity_breakdown.high}H</span>
                    <span className="text-orange-400">{run.results_summary.severity_breakdown.medium}M</span>
                    <span className="text-yellow-400">{run.results_summary.severity_breakdown.low}L</span>
                  </div>
                ) : '-'}
              </TableCell>
              <TableCell className="text-white">
                {Math.floor(run.duration_seconds / 60)}m {run.duration_seconds % 60}s
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => onViewRun(run.id)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  {run.status === 'completed' && (
                    <Button size="sm" variant="ghost" onClick={() => onExportRun(run.id)}>
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

export default function M365PostureRunsPage() {
  const [runs, setRuns] = useState(MOCK_RUNS);
  const [filteredRuns, setFilteredRuns] = useState(MOCK_RUNS);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    dateRange: '30d'
  });

  const applyFilters = useCallback(() => {
    let filtered = runs;

    if (filters.status !== 'all') {
      filtered = filtered.filter(run => run.status === filters.status);
    }

    setFilteredRuns(filtered);
  }, [runs, filters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleViewRun = (runId) => {
    window.location.href = createPageUrl(`M365PostureRunDetail?id=${runId}`);
  };

  const handleExportRun = async (runId) => {
    toast.success('Exporting run results...');
    // In production, trigger export and create Evidence Vault entry
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">Microsoft 365 Posture Runs</h1>
          <p className="text-slate-400">History of security posture assessments</p>
        </div>
        <Button asChild>
          <Link to={createPageUrl('AzurePosture')}>
            Back to Overview
          </Link>
        </Button>
      </header>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Select 
            value={filters.status} 
            onValueChange={value => setFilters(prev => ({...prev, status: value}))}
          >
            <SelectTrigger className="w-48 bg-slate-900 border-slate-700">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="queued">Queued</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={filters.dateRange} 
            onValueChange={value => setFilters(prev => ({...prev, dateRange: value}))}
          >
            <SelectTrigger className="w-48 bg-slate-900 border-slate-700">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <RunsTable 
        runs={filteredRuns}
        onViewRun={handleViewRun}
        onExportRun={handleExportRun}
      />
    </div>
  );
}