
import React, { useState, useEffect } from 'react';
import { AccessReviewCampaign, SupplierAccessReview, Supplier, User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Clock, Plus, Users, Shield, AlertTriangle, Calendar } from 'lucide-react';
import { format, isAfter, isBefore } from 'date-fns';

export default function AccessReviews() {
  const [campaigns, setCampaigns] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [campaignData, reviewData, supplierData, userData] = await Promise.all([
        AccessReviewCampaign.list('-created_date'),
        SupplierAccessReview.list('-created_date'),
        Supplier.list(),
        // Load all users and filter for suppliers in the component
        User.list()
      ]);
      setCampaigns(campaignData);
      setReviews(reviewData);
      setSuppliers(supplierData);
      // Filter for supplier users
      setUsers(userData.filter(u => u.user_type === 'supplier'));
    } catch (error) {
      console.error('Error loading access reviews:', error);
      toast.error('Failed to load access review data');
    }
    setLoading(false);
  };

  const createCampaign = async (campaignData) => {
    try {
      const newCampaign = await AccessReviewCampaign.create({
        ...campaignData,
        organization_id: 'org-default'
      });
      
      // Generate reviews for all suppliers matching the scope
      const targetSuppliers = suppliers.filter(s => {
        if (campaignData.scope_filters?.supplier_risk_tiers?.length > 0) {
          return campaignData.scope_filters.supplier_risk_tiers.includes(s.risk_tier);
        }
        return true;
      });

      // Create review items for each supplier's users
      for (const supplier of targetSuppliers) {
        const supplierUsers = users.filter(u => u.supplier_id === supplier.id);
        
        for (const user of supplierUsers) {
          await SupplierAccessReview.create({
            campaign_id: newCampaign.id,
            supplier_id: supplier.id,
            reviewer_email: campaignData.reviewers[0] || 'admin@company.com',
            user_id: user.id,
            access_type: 'user_account',
            resource_id: user.id,
            due_date: campaignData.end_date,
            organization_id: 'org-default'
          });
        }
      }

      toast.success('Access review campaign created successfully');
      setShowNewCampaign(false);
      loadData();
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign');
    }
  };

  const updateReviewDecision = async (reviewId, decision, justification) => {
    try {
      const updates = {
        decision,
        justification,
        completed_at: new Date().toISOString()
      };

      if (decision === 'denied') {
        updates.remediation_tasks = [
          'Disable user account access',
          'Revoke system permissions',
          'Remove from supplier group'
        ];
      }

      await SupplierAccessReview.update(reviewId, updates);
      toast.success('Review decision updated');
      loadData();
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('Failed to update review');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400';
      case 'denied': return 'bg-red-500/20 text-red-400';
      case 'needs_remediation': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getSupplierRiskColor = (tier) => {
    switch (tier) {
      case 'Critical': return 'bg-red-500/20 text-red-400';
      case 'High': return 'bg-orange-500/20 text-orange-400';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'Low': return 'bg-green-500/20 text-green-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-400" />
              Access Reviews
            </h1>
            <p className="text-slate-400">Governance and compliance for supplier access management</p>
          </div>
          <Button onClick={() => setShowNewCampaign(true)} className="bg-[var(--color-primary)] hover:bg-red-700">
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </div>

        <Tabs defaultValue="campaigns" className="w-full">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="campaigns">Review Campaigns</TabsTrigger>
            <TabsTrigger value="pending">Pending Reviews</TabsTrigger>
            <TabsTrigger value="dashboard">Access Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Access Review Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">Campaign</TableHead>
                      <TableHead className="text-slate-300">Type</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-300">Period</TableHead>
                      <TableHead className="text-slate-300">Reviews</TableHead>
                      <TableHead className="text-slate-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map(campaign => {
                      const campaignReviews = reviews.filter(r => r.campaign_id === campaign.id);
                      const completed = campaignReviews.filter(r => r.decision !== 'pending').length;
                      
                      return (
                        <TableRow key={campaign.id} className="border-slate-700">
                          <TableCell className="font-medium text-white">{campaign.name}</TableCell>
                          <TableCell className="text-slate-300 capitalize">{campaign.campaign_type.replace('_', ' ')}</TableCell>
                          <TableCell>
                            <Badge className={campaign.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}>
                              {campaign.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {campaign.start_date && format(new Date(campaign.start_date), 'MMM dd')} - {campaign.end_date && format(new Date(campaign.end_date), 'MMM dd')}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {completed}/{campaignReviews.length}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedCampaign(campaign)}
                              className="border-slate-600 text-slate-300"
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Pending Access Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">Supplier</TableHead>
                      <TableHead className="text-slate-300">User</TableHead>
                      <TableHead className="text-slate-300">Risk Tier</TableHead>
                      <TableHead className="text-slate-300">Access Type</TableHead>
                      <TableHead className="text-slate-300">Due Date</TableHead>
                      <TableHead className="text-slate-300">Decision</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews.filter(r => r.decision === 'pending').map(review => {
                      const supplier = suppliers.find(s => s.id === review.supplier_id);
                      const user = users.find(u => u.id === review.user_id);
                      
                      return (
                        <TableRow key={review.id} className="border-slate-700">
                          <TableCell className="font-medium text-white">
                            <div>
                              {supplier?.name}
                              <div className="text-xs text-slate-400">{supplier?.type}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-white">
                            {user?.full_name}
                            <div className="text-xs text-slate-400">{user?.email}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getSupplierRiskColor(supplier?.risk_tier)}>
                              {supplier?.risk_tier}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-300 capitalize">
                            {review.access_type.replace('_', ' ')}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {review.due_date && format(new Date(review.due_date), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => updateReviewDecision(review.id, 'approved', 'Access approved after review')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                onClick={() => updateReviewDecision(review.id, 'denied', 'Access denied - security concerns')}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dashboard" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-white">{users.length}</div>
                  <div className="text-sm text-slate-400">Supplier Users</div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-white">{reviews.filter(r => r.decision === 'pending').length}</div>
                  <div className="text-sm text-slate-400">Pending Reviews</div>
                </CardContent>
              </Card>
              <Card className="bg-red-900/30 border-red-500/50">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-white">
                    {users.filter(u => {
                      const supplier = suppliers.find(s => s.id === u.supplier_id);
                      return supplier && ['High', 'Critical'].includes(supplier.risk_tier);
                    }).length}
                  </div>
                  <div className="text-sm text-red-300">High-Risk Supplier Access</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Supplier Access Risk Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">Supplier</TableHead>
                      <TableHead className="text-slate-300">Risk Tier</TableHead>
                      <TableHead className="text-slate-300">Active Users</TableHead>
                      <TableHead className="text-slate-300">Contract Status</TableHead>
                      <TableHead className="text-slate-300">Device Compliance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.map(supplier => {
                      const supplierUsers = users.filter(u => u.supplier_id === supplier.id);
                      const compliantDevices = supplierUsers.filter(u => u.device_compliance_status === 'compliant').length;
                      
                      return (
                        <TableRow key={supplier.id} className="border-slate-700">
                          <TableCell className="font-medium text-white">{supplier.name}</TableCell>
                          <TableCell>
                            <Badge className={getSupplierRiskColor(supplier.risk_tier)}>
                              {supplier.risk_tier}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-300">{supplierUsers.length}</TableCell>
                          <TableCell>
                            <Badge className={supplier.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                              {supplier.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {supplierUsers.length > 0 ? `${compliantDevices}/${supplierUsers.length}` : 'N/A'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* New Campaign Modal */}
        {showNewCampaign && (
          <NewCampaignModal 
            onClose={() => setShowNewCampaign(false)}
            onSubmit={createCampaign}
          />
        )}
      </div>
    </div>
  );
}

const NewCampaignModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    campaign_type: 'supplier_access',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    scope_filters: { supplier_risk_tiers: ['High', 'Critical'] },
    reviewers: ['admin@company.com'],
    auto_remediation: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="bg-slate-800 border-slate-700 w-full max-w-2xl mx-4">
        <CardHeader>
          <CardTitle className="text-white">Create Access Review Campaign</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-slate-300 text-sm font-medium">Campaign Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Q4 2024 Supplier Access Review"
                className="bg-slate-900/50 border-slate-700 text-white"
                required
              />
            </div>
            <div>
              <label className="text-slate-300 text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Quarterly review of all supplier access rights..."
                className="bg-slate-900/50 border-slate-700 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  className="bg-slate-900/50 border-slate-700 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-slate-300 text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  className="bg-slate-900/50 border-slate-700 text-white"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose} className="border-slate-600">
                Cancel
              </Button>
              <Button type="submit" className="bg-[var(--color-primary)] hover:bg-red-700">
                Create Campaign
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
