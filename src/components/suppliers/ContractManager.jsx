import React, { useState, useEffect, useCallback } from 'react';
import { SupplierContract } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { format, differenceInDays, isBefore, isAfter } from 'date-fns';
import { Plus, FileText, Upload, Brain, FileSignature } from 'lucide-react';
import AiContractAnalysis from './AiContractAnalysis';

const ContractManager = ({ supplier }) => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAiModal, setShowAiModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);

  const loadContracts = useCallback(async () => {
    if (!supplier?.id) return;
    setLoading(true);
    try {
      const data = await SupplierContract.filter({ supplier_id: supplier.id });
      setContracts(data.sort((a, b) => new Date(b.end_date) - new Date(a.end_date)));
    } catch (error) {
      toast.error("Failed to load contracts");
    }
    setLoading(false);
  }, [supplier?.id]);

  useEffect(() => {
    loadContracts();
  }, [loadContracts]);

  const getStatus = (contract) => {
    const today = new Date();
    const endDate = new Date(contract.end_date);
    if (isBefore(today, endDate)) {
      const daysLeft = differenceInDays(endDate, today);
      if (daysLeft <= 90) return { label: 'In Renewal', color: 'bg-yellow-500/20 text-yellow-400' };
      return { label: 'Active', color: 'bg-green-500/20 text-green-400' };
    }
    return { label: 'Expired', color: 'bg-red-500/20 text-red-400' };
  };

  const handleAiAnalysis = (contract) => {
    setSelectedContract(contract);
    setShowAiModal(true);
  };

  return (
    <>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-blue-400" />
              Contract Management
            </div>
            <Button size="sm" variant="outline" className="border-slate-600">
              <Upload className="w-4 h-4 mr-2" /> Upload Contract
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <p>Loading contracts...</p> : contracts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-transparent">
                  <TableHead className="text-slate-300">Title</TableHead>
                  <TableHead className="text-slate-300">Type</TableHead>
                  <TableHead className="text-slate-300">End Date</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map(contract => {
                  const status = getStatus(contract);
                  return (
                    <TableRow key={contract.id} className="border-slate-800">
                      <TableCell className="font-medium text-white">{contract.title}</TableCell>
                      <TableCell className="text-slate-400">{contract.type}</TableCell>
                      <TableCell className="text-slate-400">{format(new Date(contract.end_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell><Badge className={status.color}>{status.label}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleAiAnalysis(contract)}>
                          <Brain className="w-4 h-4 mr-2" /> Analyze
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-slate-400 text-center py-4">No contracts found for this supplier.</p>
          )}
        </CardContent>
      </Card>
      {showAiModal && selectedContract && (
        <AiContractAnalysis
          contract={selectedContract}
          onClose={() => setShowAiModal(false)}
        />
      )}
    </>
  );
};

export default ContractManager;