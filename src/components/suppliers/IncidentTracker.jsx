
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Plus, Upload, Eye } from 'lucide-react';
import { SupplierIncident, Finding } from '@/api/entities';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import LogIncidentModal from './LogIncidentModal';


const IncidentTracker = ({ supplier }) => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const navigate = useNavigate();

  const loadIncidents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await SupplierIncident.filter({ supplier_id: supplier.id });
      setIncidents(data);
    } catch (error) {
      toast.error("Failed to load incidents");
    }
    setLoading(false);
  }, [supplier.id]);
  
  useEffect(() => {
    if(supplier?.id) {
      loadIncidents();
    }
  }, [loadIncidents, supplier.id]);

  const handleIncidentLogged = () => {
    setShowLogModal(false);
    loadIncidents();
    toast.success("Incident logged successfully!");
  }

  const impactColors = {
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

  return (
    <>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              Incident Log
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="border-slate-600" onClick={() => setShowLogModal(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Log Incident
              </Button>
            </div>
          </CardTitle>
          <CardDescription>Manually logged performance incidents and breaches.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <p>Loading incidents...</p> : incidents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-transparent">
                  <TableHead className="text-slate-300">Date</TableHead>
                  <TableHead className="text-slate-300">Title</TableHead>
                  <TableHead className="text-slate-300">Severity</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidents.map(incident => (
                  <TableRow key={incident.id} className="border-slate-800">
                    <TableCell className="text-slate-400 text-sm">{format(new Date(incident.incident_date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell className="text-white">{incident.title}</TableCell>
                    <TableCell>
                      <Badge className={`${impactColors[incident.severity]}`}>{incident.severity}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[incident.status]}>{incident.status}</Badge>
                    </TableCell>
                    <TableCell>
                       <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl(`SupplierIncidentDetail?id=${incident.id}`))}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <p className="text-slate-400 text-center py-4">No incidents logged for this supplier.</p>
          )}
        </CardContent>
      </Card>
      {showLogModal && (
        <LogIncidentModal 
          supplier={supplier}
          onClose={() => setShowLogModal(false)}
          onIncidentLogged={handleIncidentLogged}
        />
      )}
    </>
  );
};

export default IncidentTracker;
