import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User } from '@/api/entities';
import OrgDirectory from '../components/superadmin/OrgDirectory';
import AccessViolationLog from '../components/superadmin/AccessViolationLog';
import UserManagement from '../components/superadmin/UserManagement';
import { Shield, University, KeyRound, Construction, AlertTriangle, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function SuperAdminDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        
        // Check if user is super admin (either by role or specific email)
        const isSuperAdmin = currentUser.role === 'super_admin' || currentUser.email === 'bazam@reddome.org';
        
        if (!isSuperAdmin) {
          toast.error("Access Denied: You do not have super admin privileges.");
          // In a real app, you would redirect here.
        }
      } catch (error) {
        toast.error("Authentication failed. Please log in.");
      }
      setLoading(false);
    };
    checkUserRole();
  }, []);

  if (loading) {
    return <div className="p-8 text-white">Loading...</div>;
  }

  const isSuperAdmin = user?.role === 'super_admin' || user?.email === 'bazam@reddome.org';
  
  if (!isSuperAdmin) {
    return (
      <div className="p-8 text-center text-white">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
        <h1 className="mt-4 text-xl font-bold">Access Denied</h1>
        <p className="mt-2 text-slate-400">This area is restricted to super administrators.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-purple-400" />
            Super Admin Dashboard
          </h1>
          <p className="text-slate-400">Platform-wide organization and security management.</p>
        </div>

        <Tabs defaultValue="organizations" className="w-full">
          <TabsList className="bg-slate-800/50 border border-slate-700 mb-6">
            <TabsTrigger value="organizations">
              <University className="w-4 h-4 mr-2" />
              Organizations
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="access-logs">
              <KeyRound className="w-4 h-4 mr-2" />
              Access Violation Logs
            </TabsTrigger>
             <TabsTrigger value="platform-settings" disabled>
              <Construction className="w-4 h-4 mr-2" />
              Platform Settings (TBD)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="organizations">
            <OrgDirectory />
          </TabsContent>
          
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="access-logs">
            <AccessViolationLog />
          </TabsContent>
          
           <TabsContent value="platform-settings">
            {/* Placeholder for future platform-wide settings */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}