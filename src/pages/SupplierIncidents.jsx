import React, { useState, useEffect, useMemo } from 'react';
import { Supplier, SupplierIncident } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Siren, Eye, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const severityColors = {
  Low: 'bg-blue-500/20 text-blue-400',
  Medium: 'bg-yellow-500/20 text-yellow-400',
  High: 'bg-orange-500/20 text-orange-400',
  Critical: 'bg-red-500/20 text-red-400',
};

const statusColors = {
  Open: 'bg-red-500/20 text-red-400',
  'Under Investigation': 'bg-yellow-500/20 text-yellow-400',
  Contained: 'bg-blue-500/20 text-blue-400',
  Resolved: 'bg-purple-500/20 text-purple-400',
  Closed: 'bg-green-500/20 text-green-400',
};

export default function SupplierIncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [suppliers, setSuppliers] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ status: 'all', severity: 'all' });
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [incidentData, supplierData] = await Promise.all([
          SupplierIncident.list('-created_date'),
          Supplier.list(),
        ]);
        setIncidents(incidentData);
        const supplierMap = supplierData.reduce((acc, s) => ({ ...acc, [s.id]: s.name }), {});
        setSuppliers(supplierMap);
      } catch (e) {
        console.error("Failed to load data", e);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const filteredIncidents = useMemo(() => {
    return incidents.filter(incident => {
      const searchTermMatch = !searchTerm || incident.title.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = filters.status === 'all' || incident.status === filters.status;
      const severityMatch = filters.severity === 'all' || incident.severity === filters.severity;
      return searchTermMatch && statusMatch && severityMatch;
    });
  }, [incidents, searchTerm, filters]);

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white">Supplier Incident Register</h1>
          <p className="text-slate-400">A central log of all reported supplier incidents.</p>
        </header>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white flex items-center gap-2"><Siren className="w-5 h-5 text-red-400" />Incidents</CardTitle>
              <div className="flex items-center gap-3">
                <Filter className="w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Search by title..." 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                  className="w-48 bg-slate-900/50 border-slate-700 text-white" 
                />
                <Select value={filters.status} onValueChange={v => setFilters(p => ({...p, status: v}))}>
                  <SelectTrigger className="w-36 bg-slate-900/50 border-slate-700 text-white"><SelectValue/></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="Under Investigation">Under Investigation</SelectItem>
                    <SelectItem value="Contained">Contained</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.severity} onValueChange={v => setFilters(p => ({...p, severity: v}))}>
                  <SelectTrigger className="w-36 bg-slate-900/50 border-slate-700 text-white"><SelectValue/></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? <p className="text-slate-300">Loading incidents...</p> : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-transparent">
                    <TableHead className="text-slate-300">Date</TableHead>
                    <TableHead className="text-slate-300">Supplier</TableHead>
                    <TableHead className="text-slate-300">Title</TableHead>
                    <TableHead className="text-slate-300">Severity</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIncidents.map(incident => (
                    <TableRow key={incident.id} className="border-slate-800">
                      <TableCell className="text-slate-400">{format(new Date(incident.incident_date), 'yyyy-MM-dd')}</TableCell>
                      <TableCell className="text-white font-medium">{suppliers[incident.supplier_id] || 'Unknown'}</TableCell>
                      <TableCell className="text-slate-300">{incident.title}</TableCell>
                      <TableCell><Badge className={severityColors[incident.severity]}>{incident.severity}</Badge></TableCell>
                      <TableCell><Badge className={statusColors[incident.status]}>{incident.status}</Badge></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl(`SupplierIncidentDetail?id=${incident.id}`))}>
                          <Eye className="w-4 h-4 text-slate-400" />
                        </Button>
                      </TableCell>
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