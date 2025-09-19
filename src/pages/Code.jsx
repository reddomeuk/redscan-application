
import React, { useState, useEffect } from "react";
import { Asset, Finding, User, Scan } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Code2, 
  GitBranch, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Scan as ScanIcon, 
  Upload,
  Plus
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import AddRepoModal from "../components/code/AddRepoModal";
import UploadResultsModal from "../components/code/UploadResultsModal";
import CiCdSnippet from "../components/code/CiCdSnippet";

const getSeverityColor = (severity) => {
  switch (severity) {
    case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/40';
    case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
    case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
    default: return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
  }
};

const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/40';
      case 'running': return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/40';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
    }
};

export default function CodePage() {
  const [codeAssets, setCodeAssets] = useState([]);
  const [codeFindings, setCodeFindings] = useState([]);
  const [codeScans, setCodeScans] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCodeData = async () => {
    setLoading(true);
    try {
      const currentUser = await User.me(); // Fetch current user first
      setUser(currentUser);

      const orgId = currentUser.organization_id;
      const isSuperAdmin = currentUser.role === 'super_admin';

      let allAssetsPromise, allFindingsPromise, allScansPromise;

      if (isSuperAdmin) {
        allAssetsPromise = Asset.list('-created_date', 100);
        allFindingsPromise = Finding.list('-created_date', 500);
        allScansPromise = Scan.list('-created_date', 100);
      } else {
        const filter = { organization_id: orgId };
        allAssetsPromise = Asset.filter(filter, '-created_date', 100);
        allFindingsPromise = Finding.filter(filter, '-created_date', 500);
        allScansPromise = Scan.filter(filter, '-created_date', 100);
      }

      const [allAssets, allFindings, allScans] = await Promise.all([
        allAssetsPromise,
        allFindingsPromise,
        allScansPromise
      ]);
      
      const codeRelatedAssets = allAssets.filter(asset => asset.type === 'code_repository');
      setCodeAssets(codeRelatedAssets);
      
      const codeAssetIds = codeRelatedAssets.map(a => a.id);
      const codeSources = ['sast', 'sca', 'secrets', 'iac'];

      const codeRelatedFindings = allFindings.filter(finding => 
        codeAssetIds.includes(finding.asset_id) || codeSources.includes(finding.source)
      );
      setCodeFindings(codeRelatedFindings);

      const codeRelatedScans = allScans.filter(scan => codeAssetIds.includes(scan.asset_id));
      setCodeScans(codeRelatedScans);

    } catch (error) {
      console.error('Error loading code data:', error);
    }
    setLoading(false);
  };
  
  useEffect(() => {
    loadCodeData();
  }, []);

  const getUserRole = () => user?.role || 'viewer';
  const canEdit = () => ['admin', 'analyst'].includes(getUserRole());

  const codeMetrics = {
    totalRepos: codeAssets.length,
    vulnerabilities: codeFindings.length,
    critical: codeFindings.filter(f => f.severity === 'critical').length,
    resolved: codeFindings.filter(f => f.status === 'resolved').length,
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Code Security</h1>
            <p className="text-slate-400">Static analysis, dependency scanning, and secret detection.</p>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-blue-500/10 border-blue-500/30 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Repositories</p>
                <p className="text-2xl font-bold text-white">{codeMetrics.totalRepos}</p>
              </div>
              <GitBranch className="w-8 h-8 text-blue-400" />
            </CardContent>
          </Card>
          <Card className="bg-red-500/10 border-red-500/30 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Vulnerabilities</p>
                <p className="text-2xl font-bold text-white">{codeMetrics.vulnerabilities}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </CardContent>
          </Card>
          <Card className="bg-orange-500/10 border-orange-500/30 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Critical</p>
                <p className="text-2xl font-bold text-white">{codeMetrics.critical}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-400" />
            </CardContent>
          </Card>
          <Card className="bg-green-500/10 border-green-500/30 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Resolved</p>
                <p className="text-2xl font-bold text-white">{codeMetrics.resolved}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="repositories" className="w-full">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="repositories">Repositories</TabsTrigger>
            <TabsTrigger value="scans">Scans</TabsTrigger>
            <TabsTrigger value="findings">Findings</TabsTrigger>
            <TabsTrigger value="ci-cd">CI/CD Integration</TabsTrigger>
          </TabsList>
          
          {/* Repositories Tab */}
          <TabsContent value="repositories" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-blue-400" />
                  Code Repositories
                </CardTitle>
                {canEdit() && (
                  <div className="flex gap-2">
                    <UploadResultsModal codeAssets={codeAssets} onUploadComplete={loadCodeData} />
                    <AddRepoModal onRepoAdded={loadCodeData} />
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-40 w-full bg-slate-700" />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-300">Repository</TableHead>
                        <TableHead className="text-slate-300">Provider</TableHead>
                        <TableHead className="text-slate-300">Default Branch</TableHead>
                        <TableHead className="text-slate-300">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {codeAssets.map((repo) => (
                        <TableRow key={repo.id} className="border-slate-700">
                          <TableCell className="font-medium text-white">{repo.name}</TableCell>
                          <TableCell className="text-slate-300 capitalize">{repo.metadata?.provider || 'N/A'}</TableCell>
                          <TableCell className="text-slate-300">{repo.metadata?.default_branch || 'main'}</TableCell>
                          <TableCell><Badge className={getStatusColor(repo.status)}>{repo.status}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Scans Tab */}
          <TabsContent value="scans" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Code Scans</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-40 w-full bg-slate-700" />
                ) : (
                   <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-300">Asset</TableHead>
                        <TableHead className="text-slate-300">Scan Type</TableHead>
                        <TableHead className="text-slate-300">Status</TableHead>
                        <TableHead className="text-slate-300">Finished</TableHead>
                        <TableHead className="text-slate-300">Findings</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {codeScans.map((scan) => (
                        <TableRow key={scan.id} className="border-slate-700">
                           <TableCell className="font-medium text-white">{codeAssets.find(a => a.id === scan.asset_id)?.name || 'Unknown'}</TableCell>
                           <TableCell><Badge variant="outline" className="text-slate-300 border-slate-600 uppercase">{scan.scan_type}</Badge></TableCell>
                           <TableCell><Badge className={getStatusColor(scan.status)}>{scan.status}</Badge></TableCell>
                           <TableCell className="text-slate-400">{scan.finished_at ? new Date(scan.finished_at).toLocaleString() : 'N/A'}</TableCell>
                           <TableCell className="text-white">{scan.summary?.findings_count || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Findings Tab */}
          <TabsContent value="findings" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Code Security Findings</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-40 w-full bg-slate-700" />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-300">Severity</TableHead>
                        <TableHead className="text-slate-300">Finding</TableHead>
                        <TableHead className="text-slate-300">Repository</TableHead>
                        <TableHead className="text-slate-300">Source</TableHead>
                        <TableHead className="text-slate-300">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {codeFindings.map((finding) => (
                        <TableRow key={finding.id} className="border-slate-700">
                          <TableCell><Badge className={getSeverityColor(finding.severity)}>{finding.severity}</Badge></TableCell>
                          <TableCell className="font-medium text-white">{finding.title}</TableCell>
                          <TableCell className="text-slate-300">{codeAssets.find(a => a.id === finding.asset_id)?.name || 'N/A'}</TableCell>
                          <TableCell><Badge variant="outline" className="text-slate-300 border-slate-600 uppercase">{finding.source}</Badge></TableCell>
                          <TableCell><Badge className={getStatusColor(finding.status)}>{finding.status}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* CI/CD Tab */}
          <TabsContent value="ci-cd" className="mt-6">
            <CiCdSnippet />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
