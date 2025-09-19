import React, { useState, useEffect } from 'react';
import { Asset } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Target, Plus, Upload } from 'lucide-react';
import AddAssetModal from '../components/assets/AddAssetModal';

export default function AssetsPage({ assetTypeFilter = null }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadAssets = async () => {
      setLoading(true);
      const query = assetTypeFilter ? { type: assetTypeFilter } : {};
      const fetchedAssets = await Asset.filter(query, '-created_date', 100);
      setAssets(fetchedAssets);
      setLoading(false);
    };
    loadAssets();
  }, [assetTypeFilter]);

  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Asset Inventory</h1>
          <p className="text-slate-400">Discover and manage all your digital assets.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add Asset
            </Button>
             <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" /> Bulk Import
            </Button>
        </div>
      </header>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex justify-between">
            <CardTitle className="text-white">All Assets</CardTitle>
            <Input 
                placeholder="Search assets..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="max-w-sm bg-slate-900/50 border-slate-700" 
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700 hover:bg-transparent">
                <TableHead className="text-slate-300">Name</TableHead>
                <TableHead className="text-slate-300">Type</TableHead>
                <TableHead className="text-slate-300">Risk</TableHead>
                <TableHead className="text-slate-300">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan="4" className="text-center text-slate-400">Loading assets...</TableCell></TableRow>
              ) : filteredAssets.map(asset => (
                <TableRow key={asset.id} onClick={() => navigate(createPageUrl(`AssetDetail?id=${asset.id}`))} className="cursor-pointer hover:bg-slate-800 border-slate-800">
                  <TableCell className="font-medium text-white">{asset.name}</TableCell>
                  <TableCell><Badge variant="secondary">{asset.type}</Badge></TableCell>
                  <TableCell className="text-red-400">{asset.risk_score || 'N/A'}</TableCell>
                  <TableCell><Badge variant={asset.status === 'active' ? 'default' : 'destructive'}>{asset.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddAssetModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAssetAdded={() => {
        setShowAddModal(false);
        // This would ideally re-fetch assets
      }}/>
    </div>
  );
}