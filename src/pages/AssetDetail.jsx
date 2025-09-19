
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Asset, Finding, Project, User } from "@/api/entities"; // Assuming Scan will be added here or imported separately
import { Scan, ensureInitialScansForAsset } from "@/api/entities"; // Import the new Scan entity and helper
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ArrowLeft,
  Shield,
  AlertTriangle,
  Activity,
  Calendar,
  Globe,
  Server,
  GitBranch,
  Cloud,
  Play,
  Edit,
  Trash2
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

// New component for displaying scan history
function ScanHistoryComponent({ assetId }) {
  const [scans, setScans] = useState([]);
  const [loadingScans, setLoadingScans] = useState(true);

  const getScanStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/40';
      case 'scanning': return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/40';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
    }
  };

  const loadScans = useCallback(async () => {
    setLoadingScans(true);
    try {
      const assetScans = await Scan.list({ asset_id: assetId });
      setScans(assetScans);
    } catch (error) {
      console.error('Error loading scans:', error);
    }
    setLoadingScans(false);
  }, [assetId]);

  useEffect(() => {
    if (assetId) {
      loadScans();
    }
    // Set up a polling mechanism to reflect 'scanning' state changes more dynamically
    // In a real application, consider WebSockets or server-sent events for real-time updates.
    const interval = setInterval(() => {
      // Only poll if there's an ongoing scan to save resources
      if (scans.some(s => s.status === 'scanning')) {
        loadScans();
      }
    }, 1000); // Poll every second if there's an ongoing scan

    return () => clearInterval(interval); // Cleanup on unmount or dependency change
  }, [assetId, loadScans, scans]); // `scans` is a dependency to react to changes for polling

  if (loadingScans) {
    return <div className="text-slate-400 text-center py-8">Loading scan history...</div>;
  }

  if (scans.length === 0) {
    return <p className="text-slate-400 text-center py-8">No scan history available for this asset.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-slate-700">
          <TableHead className="text-slate-300">Date</TableHead>
          <TableHead className="text-slate-300">Status</TableHead>
          <TableHead className="text-slate-300">Findings</TableHead>
          <TableHead className="text-slate-300">Duration</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {scans.map(scan => (
          <TableRow key={scan.id} className="border-slate-700">
            <TableCell className="text-white">
              {new Date(scan.date).toLocaleDateString()} {new Date(scan.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </TableCell>
            <TableCell>
              <Badge className={getScanStatusColor(scan.status)}>
                {scan.status}
              </Badge>
            </TableCell>
            <TableCell className="text-white">{scan.findings_count !== undefined ? scan.findings_count : 'N/A'}</TableCell>
            <TableCell className="text-slate-400">{scan.duration || 'N/A'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function AssetDetailPage() {
  const [searchParams] = useSearchParams();
  const assetId = searchParams.get('id');

  const [asset, setAsset] = useState(null);
  const [findings, setFindings] = useState([]);
  const [project, setProject] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const loadAssetData = useCallback(async () => {
    setLoading(true);
    try {
      const [assetData, allFindings, currentUser] = await Promise.all([
        Asset.get(assetId),
        Finding.list('-created_date', 100),
        User.me()
      ]);

      setAsset(assetData);
      setUser(currentUser);

      // Filter findings for this asset
      const assetFindings = allFindings.filter(f => f.asset_id === assetId);
      setFindings(assetFindings);

      // Load project if available
      if (assetData.project_id) {
        const projectData = await Project.get(assetData.project_id);
        setProject(projectData);
      }
    } catch (error) {
      console.error('Error loading asset data:', error);
    }
    setLoading(false);
  }, [assetId]);

  useEffect(() => {
    if (assetId) {
      loadAssetData();
      // Ensure mock scan data is generated for this asset if it doesn't exist
      ensureInitialScansForAsset(assetId);
    }
  }, [assetId, loadAssetData]);

  const getAssetIcon = (type) => {
    switch (type) {
      case 'domain': return Globe;
      case 'ip': return Server;
      case 'repo': return GitBranch;
      case 'cloud': return Cloud;
      default: return Shield;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/40';
      case 'scanning': return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/40';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
    }
  };

  const handleStartScan = async () => {
    if (!asset || asset.status === 'scanning') return; // Prevent multiple scans

    try {
      // 1. Update asset status to 'scanning'
      await Asset.update(asset.id, { status: 'scanning' });

      // 2. Create a new Scan record with 'scanning' status
      const newScan = await Scan.create({
        asset_id: asset.id,
        status: 'scanning',
        date: new Date().toISOString(),
      });

      // Optimistically update UI
      setAsset(prevAsset => prevAsset ? { ...prevAsset, status: 'scanning' } : null);

      // Simulate scan completion after a delay
      setTimeout(async () => {
        // 3. Update asset status back to 'active' and last_scan_date
        await Asset.update(asset.id, { status: 'active', last_scan_date: new Date().toISOString() });

        // 4. Update the Scan record with completion details
        await Scan.update(newScan.id, {
          status: 'completed',
          findings_count: Math.floor(Math.random() * 20), // Simulate findings
          duration: `${Math.floor(Math.random() * 5) + 1}m ${Math.floor(Math.random() * 59)}s` // Simulate duration
        });

        // Reload all data to reflect changes in asset and findings, and trigger ScanHistoryComponent refresh
        loadAssetData();
      }, 3000);
    } catch (error) {
      console.error("Error starting scan:", error);
      // Revert asset status if an error occurs
      if (asset) {
        setAsset(prevAsset => prevAsset ? { ...prevAsset, status: 'error' } : null);
      }
    }
  };


  const getUserRole = () => user?.role || 'viewer';
  const canEdit = () => ['admin', 'analyst'].includes(getUserRole());

  if (loading) {
    return (
      <div className="p-4 md:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12 text-slate-400">
            Loading asset details...
          </div>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="p-4 md:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12 text-slate-400">
            Asset not found
          </div>
        </div>
      </div>
    );
  }

  const IconComponent = getAssetIcon(asset.type);

  // Mock activity data (keeping this as it's not part of scan history)
  const mockActivity = [
    { id: 1, action: 'Scan completed', user: 'System', date: '2024-12-26 14:30' },
    { id: 2, action: 'Scan started', user: 'John Doe', date: '2024-12-26 14:27' },
    { id: 3, action: 'Asset updated', user: 'Jane Smith', date: '2024-12-25 09:15' },
    { id: 4, action: 'Finding resolved', user: 'John Doe', date: '2024-12-24 16:42' }
  ];

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            to={createPageUrl("Assets")}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <IconComponent className="w-6 h-6 text-slate-400" />
              <h1 className="text-3xl font-bold text-white">{asset.name}</h1>
              <Badge className={getStatusColor(asset.status)}>
                {asset.status}
              </Badge>
            </div>
            <p className="text-slate-400">{asset.url}</p>
          </div>
          <div className="flex items-center gap-2">
            {canEdit() && (
              <>
                <Button
                  onClick={handleStartScan}
                  disabled={asset.status === 'scanning'}
                  className="bg-[var(--color-primary)] hover:bg-red-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {asset.status === 'scanning' ? 'Scanning...' : 'Start Scan'}
                </Button>
                <Button variant="outline" className="border-slate-600 text-slate-300">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Asset Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {asset.risk_score ? asset.risk_score.toFixed(1) : 'N/A'}
                </div>
                <div className="text-sm text-slate-400">Risk Score</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{findings.length}</div>
                <div className="text-sm text-slate-400">Total Findings</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {findings.filter(f => f.status === 'open').length}
                </div>
                <div className="text-sm text-slate-400">Open Findings</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {asset.last_scan_date
                    ? Math.floor((Date.now() - new Date(asset.last_scan_date).getTime()) / (1000 * 60 * 60 * 24))
                    : 'Never'
                  }
                </div>
                <div className="text-sm text-slate-400">Days Since Scan</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="overview" className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700">
              Overview
            </TabsTrigger>
            <TabsTrigger value="scans" className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700">
              Scans
            </TabsTrigger>
            <TabsTrigger value="findings" className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700">
              Findings
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700">
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Asset Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-400">Type</p>
                        <p className="font-medium text-white capitalize">{asset.type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Status</p>
                        <Badge className={getStatusColor(asset.status)}>
                          {asset.status}
                        </Badge>
                      </div>
                      {project && (
                        <div>
                          <p className="text-sm text-slate-400">Project</p>
                          <p className="font-medium text-white">{project.name}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-slate-400">Last Scan</p>
                        <p className="font-medium text-white">
                          {asset.last_scan_date
                            ? new Date(asset.last_scan_date).toLocaleDateString()
                            : 'Never'
                          }
                        </p>
                      </div>
                    </div>
                    {asset.tags && asset.tags.length > 0 && (
                      <div>
                        <p className="text-sm text-slate-400 mb-2">Tags</p>
                        <div className="flex flex-wrap gap-2">
                          {asset.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="bg-slate-700 text-slate-300">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-400" />
                      Recent Findings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {findings.length === 0 ? (
                      <p className="text-slate-400 text-center py-4">No findings yet</p>
                    ) : (
                      <div className="space-y-3">
                        {findings.slice(0, 5).map(finding => (
                          <div key={finding.id} className="p-3 bg-slate-900/30 border border-slate-700 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-white text-sm">{finding.title}</h4>
                              <Badge className={`text-xs ${getSeverityColor(finding.severity)}`}>
                                {finding.severity}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-2">{finding.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="scans">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Scan History</CardTitle>
              </CardHeader>
              <CardContent>
                <ScanHistoryComponent assetId={asset.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="findings">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">All Findings</CardTitle>
              </CardHeader>
              <CardContent>
                {findings.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No findings for this asset</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-300">Finding</TableHead>
                        <TableHead className="text-slate-300">Severity</TableHead>
                        <TableHead className="text-slate-300">Status</TableHead>
                        <TableHead className="text-slate-300">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {findings.map(finding => (
                        <TableRow key={finding.id} className="border-slate-700">
                          <TableCell>
                            <div>
                              <div className="font-medium text-white">{finding.title}</div>
                              <div className="text-sm text-slate-400 line-clamp-1">{finding.description}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getSeverityColor(finding.severity)}>
                              {finding.severity}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-slate-300 border-slate-600">
                              {finding.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-400">
                            {new Date(finding.created_date).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  Activity Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockActivity.map(activity => (
                    <div key={activity.id} className="flex items-center gap-3 p-3 bg-slate-900/30 border border-slate-700 rounded-lg">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <div className="flex-1">
                        <p className="text-white">{activity.action}</p>
                        <p className="text-sm text-slate-400">by {activity.user} • {activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/*
  -------------------------------------------------------------------------------------------------
  NOTE: The following code should be placed in `src/entities/Scan.js` as it defines the new entity.
  -------------------------------------------------------------------------------------------------
*/

// // src/entities/Scan.js
//
// const allMockScans = {}; // Object to hold scans, keyed by asset_id
//
// // Helper to generate unique IDs
// let nextScanId = 1001;
//
// class Scan {
//   constructor(data) {
//     this.id = data.id || `scan-${nextScanId++}`;
//     this.asset_id = data.asset_id;
//     this.date = data.date || new Date().toISOString();
//     this.status = data.status || 'completed';
//     this.findings_count = data.findings_count; // Can be undefined initially for 'scanning'
//     this.duration = data.duration; // Can be undefined initially
//   }
//
//   static async list(filter = {}) {
//     await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call
//     const assetScans = allMockScans[filter.asset_id] || [];
//
//     let filteredScans = [...assetScans];
//
//     // Sort by date descending
//     filteredScans.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
//     return filteredScans;
//   }
//
//   static async get(id) {
//     await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call
//     for (const assetId in allMockScans) {
//       const scan = allMockScans[assetId].find(scan => scan.id === id);
//       if (scan) return scan;
//     }
//     return null;
//   }
//
//   static async create(data) {
//     await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call
//     const newScan = new Scan(data);
//     if (!allMockScans[data.asset_id]) {
//       allMockScans[data.asset_id] = [];
//     }
//     allMockScans[data.asset_id].push(newScan);
//     return newScan;
//   }
//
//   static async update(id, updates) {
//     await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call
//     for (const assetId in allMockScans) {
//       const index = allMockScans[assetId].findIndex(scan => scan.id === id);
//       if (index > -1) {
//         allMockScans[assetId][index] = { ...allMockScans[assetId][index], ...updates };
//         return allMockScans[assetId][index];
//       }
//     }
//     return null;
//   }
// }
//
// // Function to generate initial mock data for a specific asset
// // This should be called once when the asset page loads to populate initial mock data.
// const ensureInitialScansForAsset = (assetId) => {
//   if (!assetId || allMockScans[assetId]) {
//     // Already has mock scans or no assetId
//     return;
//   }
//
//   allMockScans[assetId] = []; // Initialize for this asset
//   const now = new Date();
//   for (let i = 0; i < 3; i++) {
//     const scanDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000); // Subtract days
//     allMockScans[assetId].push(new Scan({
//       asset_id: assetId,
//       date: scanDate.toISOString(),
//       status: 'completed',
//       findings_count: Math.floor(Math.random() * 20),
//       duration: `${Math.floor(Math.random() * 5) + 1}m ${Math.floor(Math.random() * 59)}s`
//     }));
//   }
// };
//
// export { Scan, ensureInitialScansForAsset };
