
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, KeyRound, Building2, Wallet, Shield, Plus, Download, Zap } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserManagement from '../components/superadmin/UserManagement'; // Assuming this path is correct
import GeolocationControls from '../components/security/GeolocationControls'; // Assuming this path is correct

// Mock User object for demonstration purposes. In a real application,
// this would be an imported service/API call that fetches user details.
const User = {
  me: () => Promise.resolve({ role: 'admin', id: 'user-123', name: 'Admin User' }),
  // To test 'super_admin' role, uncomment the line below and comment the one above:
  // me: () => Promise.resolve({ role: 'super_admin', id: 'user-456', name: 'Super Admin User' }),
};

const VendorApiSettings = () => (
  <Card className="bg-slate-800/50 border-slate-700">
    <CardHeader>
      <CardTitle className="text-white">Vendor API Management</CardTitle>
      <CardDescription className="text-slate-400">Manage API keys for pentest vendors to push data securely.</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-lg">
          <div>
            <h4 className="font-medium text-white">RedTeam Security API Key</h4>
            <p className="text-sm text-slate-400">Prefix: <span className="font-mono">rs_pk_...aBc1</span></p>
            <p className="text-xs text-slate-500">Last used: 2 days ago</p>
          </div>
          <Button variant="destructive">Revoke</Button>
        </div>
        <Button className="bg-[#B00020] hover:bg-[#8B0000]">
          <Plus className="w-4 h-4 mr-2" /> Generate New Key
        </Button>
      </div>
    </CardContent>
    <CardFooter className="flex gap-4 border-t border-slate-700 pt-4 mt-6">
      <Button variant="outline">
        <Download className="w-4 h-4 mr-2" /> Download Postman Collection
      </Button>
      <Button variant="outline">View Webhook Logs</Button>
    </CardFooter>
  </Card>
);

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    User.me().then(setUser);
  }, []);

  const getUserRole = () => user?.role || 'viewer';
  const canManage = () => getUserRole() === 'admin' || getUserRole() === 'super_admin';
  const isSuperAdmin = () => getUserRole() === 'super_admin';

  if (!user) {
    return <div className="text-white p-8">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-slate-400">Manage your organization and security settings.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="flex">
        <TabsList className="w-48 bg-slate-800/50 border border-slate-700 mr-4 p-2">
          <TabsTrigger value="general" className="w-full justify-start text-white data-[state=active]:bg-slate-700 data-[state=active]:text-white">
            <Building2 className="w-4 h-4 mr-2" />Organization
          </TabsTrigger>
          <TabsTrigger value="users" className="w-full justify-start text-white data-[state=active]:bg-slate-700 data-[state=active]:text-white">
            <Users className="w-4 h-4 mr-2" />User Management
          </TabsTrigger>
          <TabsTrigger value="billing" className="w-full justify-start text-white data-[state=active]:bg-slate-700 data-[state=active]:text-white">
            <Wallet className="w-4 h-4 mr-2" />Billing
          </TabsTrigger>
          <TabsTrigger value="security" className="w-full justify-start text-white data-[state=active]:bg-slate-700 data-[state=active]:text-white">
            <Shield className="w-4 h-4 mr-2" />Security
          </TabsTrigger>
          <TabsTrigger value="vendor_api" className="w-full justify-start text-white data-[state=active]:bg-slate-700 data-[state=active]:text-white">
            <KeyRound className="w-4 h-4 mr-2" />Vendor API
          </TabsTrigger>
          {isSuperAdmin() && (
            <TabsTrigger value="super_admin" className="w-full justify-start text-white data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <Zap className="w-4 h-4 mr-2" />Super Admin
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="general" className="ml-6 flex-1">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">General Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">Organization general settings will go here (e.g., name, logo, default timezone).</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users" className="ml-6 flex-1">
            <UserManagement />
        </TabsContent>
        <TabsContent value="billing" className="ml-6 flex-1">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Billing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">Manage your subscription and payment methods.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="security" className="ml-6 flex-1">
            <GeolocationControls />
        </TabsContent>
        <TabsContent value="vendor_api" className="ml-6 flex-1">
          <VendorApiSettings />
        </TabsContent>
        {isSuperAdmin() && (
          <TabsContent value="super_admin" className="ml-6 flex-1">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader><CardTitle className="text-white">Super Admin Controls</CardTitle></CardHeader>
              <CardContent>
                <p className="text-slate-400">Global platform settings such as feature flags, system health, etc.</p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
