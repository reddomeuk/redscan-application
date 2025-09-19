
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, ShieldOff, ShieldCheck, Edit, Download, Trash2, Search, Plus, Sparkles } from 'lucide-react';
import { Organization, User, Asset } from '@/api/entities';
import OrgEditorModal from './OrgEditorModal';
import { toast } from 'sonner';

export default function OrgDirectory() {
  const [orgs, setOrgs] = useState([]);
  const [orgDetails, setOrgDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingOrg, setEditingOrg] = useState(null);

  const loadOrgs = useCallback(async () => {
    setLoading(true);
    try {
      const orgData = await Organization.list('-created_date');
      
      // Don't filter duplicates here anymore - show all so admin can see the issue
      setOrgs(orgData);

      // Fetch details for each org
      const detailsPromises = orgData.map(async (org) => {
        const [users, assets] = await Promise.all([
          User.filter({ organization_id: org.id }),
          Asset.filter({ organization_id: org.id })
        ]);
        return { [org.id]: { userCount: users.length, assetCount: assets.length } };
      });
      const detailsArray = await Promise.all(detailsPromises);
      const detailsMap = Object.assign({}, ...detailsArray);
      setOrgDetails(detailsMap);

    } catch (error) {
      console.error("Error loading organizations:", error);
      toast.error("Failed to load organizations.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadOrgs();
  }, [loadOrgs]);

  const cleanupDuplicates = async () => {
    const confirmation = confirm("This will remove duplicate organizations, keeping the most complete record for each name. Are you sure?");
    if (!confirmation) return;

    try {
      const duplicateGroups = {};
      
      // Group organizations by name
      orgs.forEach(org => {
        if (!duplicateGroups[org.name]) {
          duplicateGroups[org.name] = [];
        }
        duplicateGroups[org.name].push(org);
      });

      let deletedCount = 0;

      // Process each group
      for (const [orgName, orgList] of Object.entries(duplicateGroups)) {
        if (orgList.length > 1) {
          // Sort by completeness (more fields filled = better record)
          const sortedOrgs = orgList.sort((a, b) => {
            const scoreA = (a.primary_domain ? 1 : 0) + 
                          (a.verified_domains?.length || 0) + 
                          (a.settings ? 1 : 0) + 
                          (a.branding ? 1 : 0) +
                          (orgDetails[a.id]?.userCount || 0) +
                          (orgDetails[a.id]?.assetCount || 0);
            
            const scoreB = (b.primary_domain ? 1 : 0) + 
                          (b.verified_domains?.length || 0) + 
                          (b.settings ? 1 : 0) + 
                          (b.branding ? 1 : 0) +
                          (orgDetails[b.id]?.userCount || 0) +
                          (orgDetails[b.id]?.assetCount || 0);
            
            return scoreB - scoreA; // Descending order
          });

          // Keep the first (most complete) record, delete the rest
          const keepOrg = sortedOrgs[0];
          const deleteOrgs = sortedOrgs.slice(1);

          for (const orgToDelete of deleteOrgs) {
            await Organization.delete(orgToDelete.id);
            deletedCount++;
          }
        }
      }

      toast.success(`Cleaned up ${deletedCount} duplicate organizations.`);
      loadOrgs(); // Reload the list
    } catch (error) {
      console.error("Error cleaning up duplicates:", error);
      toast.error("Failed to cleanup duplicates.");
    }
  };

  const handleToggleSuspend = async (org) => {
    const newStatus = org.status === 'suspended' ? 'active' : 'suspended';
    try {
      await Organization.update(org.id, { status: newStatus });
      toast.success(`Organization ${org.name} has been ${newStatus}.`);
      loadOrgs();
    } catch (error) {
      toast.error(`Failed to update organization status.`);
    }
  };

  const handleDeleteOrg = async (org) => {
    const confirmation = prompt(`This action is irreversible. To delete ${org.name}, type its name below:`);
    if (confirmation === org.name) {
      try {
        await Organization.delete(org.id);
        toast.success(`Organization ${org.name} has been deleted.`);
        loadOrgs();
      } catch (error) {
        toast.error("Failed to delete organization.");
      }
    } else {
      toast.warning("Deletion cancelled. Confirmation did not match.");
    }
  };

  const handleExportData = (org) => {
    toast.info(`Simulating data export for ${org.name}...`);
    // In a real app, this would trigger a backend job.
    const data = { org, details: orgDetails[org.id] };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `${org.slug}-export.json`;
    link.click();
  };

  const filteredOrgs = orgs.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.primary_domain?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Organizations</CardTitle>
        <div className="flex justify-between items-center mt-2">
          <div className="relative w-1/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input 
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-900/50 border-slate-700"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={cleanupDuplicates} 
              variant="outline" 
              className="bg-yellow-600 hover:bg-yellow-700 border-yellow-500 text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Clean Duplicates
            </Button>
            <Button onClick={() => setEditingOrg({})} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Organization
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700">
              <TableHead className="text-slate-300">Organization</TableHead>
              <TableHead className="text-slate-300">Plan</TableHead>
              <TableHead className="text-slate-300">Status</TableHead>
              <TableHead className="text-slate-300">Users</TableHead>
              <TableHead className="text-slate-300">Assets</TableHead>
              <TableHead className="text-slate-300">Created</TableHead>
              <TableHead className="text-slate-300 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center text-slate-400">Loading...</TableCell></TableRow>
            ) : (
              filteredOrgs.map(org => (
                <TableRow key={org.id} className="border-slate-700 hover:bg-slate-800/30">
                  <TableCell>
                    <div className="font-medium text-white">{org.name}</div>
                    <div className="text-sm text-slate-400">{org.primary_domain}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize border-slate-600 text-slate-300">{org.subscription_tier}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={org.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                      {org.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white">{orgDetails[org.id]?.userCount} / {org.seats}</TableCell>
                  <TableCell className="text-white">{orgDetails[org.id]?.assetCount}</TableCell>
                  <TableCell className="text-slate-400">{new Date(org.created_date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-slate-800 border-slate-700 text-white">
                        <DropdownMenuItem onSelect={() => toast.info("Impersonation started (read-only).", { description: "You are now viewing the platform as an admin of this organization."})}>
                          <Eye className="w-4 h-4 mr-2" /> Impersonate
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setEditingOrg(org)}>
                          <Edit className="w-4 h-4 mr-2" /> Edit Organization
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleToggleSuspend(org)}>
                          {org.status === 'suspended' ? <ShieldCheck className="w-4 h-4 mr-2 text-green-400" /> : <ShieldOff className="w-4 h-4 mr-2 text-yellow-400" />}
                          {org.status === 'suspended' ? 'Resume' : 'Suspend'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleExportData(org)}>
                          <Download className="w-4 h-4 mr-2" /> Export Data
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleDeleteOrg(org)} className="text-red-400">
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
      {editingOrg && (
        <OrgEditorModal 
          org={editingOrg}
          onClose={() => setEditingOrg(null)}
          onSave={() => {
            setEditingOrg(null);
            loadOrgs();
          }}
        />
      )}
    </Card>
  );
}
