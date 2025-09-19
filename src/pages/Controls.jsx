import React, { useState, useEffect, useCallback } from 'react';
import { Control, Finding, IntunePolicy, Asset, User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { 
  Library, 
  Search, 
  Filter, 
  Eye,
  Link,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MoreHorizontal
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const FRAMEWORKS = {
  ce_plus: "Cyber Essentials Plus",
  ce_basic: "Cyber Essentials Basic",
  iso27001: "ISO 27001",
  nist_csf: "NIST CSF"
};

const PLATFORMS = ["windows", "macos", "ios", "android", "cloud", "m365"];

const getStatusColor = (status) => {
  switch (status) {
    case 'compliant': return 'bg-green-500/20 text-green-400 border-green-500/40';
    case 'partial': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
    case 'non_compliant': return 'bg-red-500/20 text-red-400 border-red-500/40';
    default: return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'compliant': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
    case 'partial': return <AlertCircle className="w-4 h-4 text-yellow-400" />;
    case 'non_compliant': return <XCircle className="w-4 h-4 text-red-400" />;
    default: return <MoreHorizontal className="w-4 h-4 text-slate-400" />;
  }
};

export default function ControlsPage() {
  const [controls, setControls] = useState([]);
  const [filteredControls, setFilteredControls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedControls, setSelectedControls] = useState([]);
  const [selectedControl, setSelectedControl] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [frameworkFilter, setFrameworkFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadData = async () => {
    setLoading(true);
    try {
      const controlData = await Control.list('-created_date', 500);
      setControls(controlData);
    } catch (error) {
      console.error('Error loading controls:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = controls;
    if (searchTerm) {
      filtered = filtered.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (frameworkFilter !== "all") {
      filtered = filtered.filter(c => c.framework_mappings?.some(m => m.framework === frameworkFilter));
    }
    if (platformFilter !== "all") {
      filtered = filtered.filter(c => c.platforms?.includes(platformFilter));
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter(c => c.status === statusFilter);
    }
    setFilteredControls(filtered);
  }, [controls, searchTerm, frameworkFilter, platformFilter, statusFilter]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleSelectAll = (checked) => {
    setSelectedControls(checked ? filteredControls.map(c => c.id) : []);
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Library className="w-8 h-8 text-purple-400" />
              Controls Library
            </h1>
            <p className="text-slate-400">Central repository for all security controls and compliance mappings.</p>
          </div>
        </div>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search controls..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-900/50 border-slate-700 text-white"
                />
              </div>
              <Select value={frameworkFilter} onValueChange={setFrameworkFilter}>
                <SelectTrigger className="w-full md:w-48 bg-slate-900/50 border-slate-700 text-white">
                  <SelectValue placeholder="Framework" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all" className="text-white">All Frameworks</SelectItem>
                  {Object.entries(FRAMEWORKS).map(([key, name]) => (
                    <SelectItem key={key} value={key} className="text-white">{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="w-full md:w-40 bg-slate-900/50 border-slate-700 text-white">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all" className="text-white">All Platforms</SelectItem>
                  {PLATFORMS.map(p => <SelectItem key={p} value={p} className="text-white capitalize">{p}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40 bg-slate-900/50 border-slate-700 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all" className="text-white">All Statuses</SelectItem>
                  <SelectItem value="compliant" className="text-white">Compliant</SelectItem>
                  <SelectItem value="partial" className="text-white">Partial</SelectItem>
                  <SelectItem value="non_compliant" className="text-white">Non-Compliant</SelectItem>
                  <SelectItem value="not_applicable" className="text-white">Not Applicable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="w-12"><Checkbox checked={selectedControls.length > 0 && selectedControls.length === filteredControls.length} onCheckedChange={handleSelectAll} /></TableHead>
                  <TableHead className="text-slate-300">Control</TableHead>
                  <TableHead className="text-slate-300">Category</TableHead>
                  <TableHead className="text-slate-300">Platforms</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300 w-20 text-center">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array(5).fill(0).map((_, i) => <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-8 bg-slate-700" /></TableCell></TableRow>)
                ) : filteredControls.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-400">No controls found.</TableCell></TableRow>
                ) : (
                  filteredControls.map((control) => (
                    <TableRow key={control.id} className="border-slate-700 hover:bg-slate-700/30">
                      <TableCell>
                        <Checkbox 
                          checked={selectedControls.includes(control.id)}
                          onCheckedChange={(checked) => {
                            setSelectedControls(current => checked ? [...current, control.id] : current.filter(id => id !== control.id));
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-white">{control.name}</TableCell>
                      <TableCell className="text-slate-400">{control.category}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {control.platforms?.map(p => <Badge key={p} variant="secondary" className="bg-slate-700 text-slate-300 capitalize">{p}</Badge>)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(control.status)}>{control.status.replace('_', ' ')}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Sheet onOpenChange={(isOpen) => !isOpen && setSelectedControl(null)}>
                          <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white" onClick={() => setSelectedControl(control)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="bg-slate-800 border-l-slate-700 text-white w-[600px] sm:w-[600px] overflow-y-auto">
                            {selectedControl && (
                              <>
                                <SheetHeader>
                                  <SheetTitle className="text-white text-xl">{selectedControl.name}</SheetTitle>
                                </SheetHeader>
                                <div className="space-y-6 mt-6">
                                  <div className="flex items-center gap-4">
                                    {getStatusIcon(selectedControl.status)}
                                    <Badge className={getStatusColor(selectedControl.status) + " text-base"}>{selectedControl.status.replace('_', ' ')}</Badge>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-slate-300 mb-2">Description</h4>
                                    <p className="text-slate-400">{selectedControl.description}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-slate-300 mb-2">Remediation</h4>
                                    <p className="text-slate-400">{selectedControl.remediation}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-slate-300 mb-2">Framework Mappings</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {selectedControl.framework_mappings?.map(m => (
                                        <Badge key={`${m.framework}-${m.control_id}`} variant="outline" className="border-slate-600 text-slate-300">
                                          {FRAMEWORKS[m.framework]}: {m.control_id}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-slate-300 mb-2">Evidence Notes</h4>
                                    <p className="text-slate-400 p-3 bg-slate-900/50 rounded-md border border-slate-700">
                                      {selectedControl.evidence_notes || "No manual evidence provided."}
                                    </p>
                                  </div>
                                  <div className="flex justify-end">
                                      <Button variant="outline" className="border-slate-600 text-slate-300">Edit Control</Button>
                                  </div>
                                </div>
                              </>
                            )}
                          </SheetContent>
                        </Sheet>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}