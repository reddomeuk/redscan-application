import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { MoreHorizontal, Search, Edit, Shield, ShieldOff, Trash2, Eye } from 'lucide-react';
import { User, Organization } from '@/api/entities';
import { toast } from 'sonner';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [editingUser, setEditingUser] = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const [userData, orgData] = await Promise.all([
        User.list('-created_date', 500),
        Organization.list()
      ]);
      
      setUsers(userData);
      
      // Create organization lookup map
      const orgMap = {};
      orgData.forEach(org => {
        orgMap[org.id] = org;
      });
      setOrganizations(orgMap);
      
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleUpdateUser = async (userId, updates) => {
    try {
      await User.update(userId, updates);
      toast.success("User updated successfully.");
      loadUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user.");
    }
  };

  const handleDeleteUser = async (user) => {
    const confirmation = prompt(`To delete ${user.full_name} (${user.email}), type their email address:`);
    if (confirmation === user.email) {
      try {
        await User.delete(user.id);
        toast.success(`User ${user.full_name} has been deleted.`);
        loadUsers();
      } catch (error) {
        toast.error("Failed to delete user.");
      }
    } else {
      toast.warning("Deletion cancelled. Email confirmation did not match.");
    }
  };

  const handleImpersonateUser = (user) => {
    toast.info(`Impersonation started for ${user.full_name}. (This is a simulation - in a real app, you'd be switched to their context.)`, {
      description: "You are now viewing the platform as this user."
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      case 'admin': return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'analyst': return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'viewer': return 'bg-green-500/20 text-green-400 border-green-500/40';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      organizations[user.organization_id]?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const UserEditModal = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState({ ...user });

    const handleSave = () => {
      onSave(user.id, formData);
      onClose();
    };

    return (
      <Dialog open={!!user} onOpenChange={onClose}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Edit User: {user.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input value={formData.email} disabled className="bg-slate-900/50" />
            </div>
            <div>
              <Label>Full Name</Label>
              <Input 
                value={formData.full_name || ''} 
                onChange={e => setFormData({...formData, full_name: e.target.value})}
                className="bg-slate-900/50 border-slate-700"
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={formData.role} onValueChange={value => setFormData({...formData, role: value})}>
                <SelectTrigger className="bg-slate-900/50 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="viewer" className="text-white">Viewer</SelectItem>
                  <SelectItem value="analyst" className="text-white">Analyst</SelectItem>
                  <SelectItem value="admin" className="text-white">Admin</SelectItem>
                  <SelectItem value="super_admin" className="text-white">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Organization</Label>
              <Select value={formData.organization_id} onValueChange={value => setFormData({...formData, organization_id: value})}>
                <SelectTrigger className="bg-slate-900/50 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {Object.values(organizations).map(org => (
                    <SelectItem key={org.id} value={org.id} className="text-white">{org.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Platform User Management</CardTitle>
        <div className="flex justify-between items-center mt-4 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input 
              placeholder="Search users, emails, or organizations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-900/50 border-slate-700"
            />
          </div>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-40 bg-slate-900/50 border-slate-700">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all" className="text-white">All Roles</SelectItem>
              <SelectItem value="super_admin" className="text-white">Super Admin</SelectItem>
              <SelectItem value="admin" className="text-white">Admin</SelectItem>
              <SelectItem value="analyst" className="text-white">Analyst</SelectItem>
              <SelectItem value="viewer" className="text-white">Viewer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700">
              <TableHead className="text-slate-300">User</TableHead>
              <TableHead className="text-slate-300">Organization</TableHead>
              <TableHead className="text-slate-300">Role</TableHead>
              <TableHead className="text-slate-300">Last Login</TableHead>
              <TableHead className="text-slate-300">Status</TableHead>
              <TableHead className="text-slate-300 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center text-slate-400">Loading users...</TableCell></TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="border-slate-700">
                  <TableCell>
                    <div>
                      <div className="font-medium text-white">{user.full_name || 'No Name'}</div>
                      <div className="text-sm text-slate-400">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {organizations[user.organization_id]?.name || 'No Organization'}
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(user.role)}>
                      {user.role?.replace('_', ' ') || 'No Role'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-400">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                      {user.mfa_enabled && <Badge className="bg-blue-500/20 text-blue-400 text-xs">MFA</Badge>}
                      {user.break_glass && <Badge className="bg-orange-500/20 text-orange-400 text-xs">Break-Glass</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-slate-800 border-slate-700 text-white">
                        <DropdownMenuItem onSelect={() => handleImpersonateUser(user)}>
                          <Eye className="w-4 h-4 mr-2" /> Impersonate User
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setEditingUser(user)}>
                          <Edit className="w-4 h-4 mr-2" /> Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleUpdateUser(user.id, { role: user.role === 'admin' ? 'viewer' : 'admin' })}>
                          {user.role === 'admin' ? <ShieldOff className="w-4 h-4 mr-2 text-yellow-400" /> : <Shield className="w-4 h-4 mr-2 text-blue-400" />}
                          {user.role === 'admin' ? 'Demote to Viewer' : 'Promote to Admin'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleDeleteUser(user)} className="text-red-400">
                          <Trash2 className="w-4 h-4 mr-2" /> Delete User
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
      
      {editingUser && (
        <UserEditModal 
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleUpdateUser}
        />
      )}
    </Card>
  );
}