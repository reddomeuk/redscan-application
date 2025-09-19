
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Subscription, Invoice, User, Organization } from '@/api/entities';
import { 
  CreditCard, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  Calendar,
  Receipt,
  Crown,
  Building,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';
import { format, differenceInDays, addDays, addMonths } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const PLANS = {
  free: { name: 'Free', price: 0, assets: 5, users: 3, features: ['Basic scans', 'Community support'] },
  pro: { name: 'Pro', price: 29, assets: 100, users: 25, features: ['Advanced scans', 'Priority support', 'API access', 'SSO'] },
  enterprise: { name: 'Enterprise', price: 99, assets: 'Unlimited', users: 'Unlimited', features: ['Enterprise suite', '24/7 support', 'Custom integrations'] }
};

const CheckoutModal = ({ open, onOpenChange, onSubscribe }) => {
  const [formData, setFormData] = useState({
    plan: 'pro',
    seats: 5,
    billing_email: '',
    company_name: '',
    vat_id: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate checkout process
    setTimeout(() => {
      if (Math.random() > 0.1) { // 90% success rate
        onSubscribe({
          ...formData,
          status: 'success',
          monthly_amount: PLANS[formData.plan].price * formData.seats * 100 // Convert to cents
        });
        toast.success('Subscription activated successfully!');
      } else {
        toast.error('Payment failed. Please try again.');
      }
      setLoading(false);
      onOpenChange(false);
    }, 2000);
  };

  const totalMonthly = PLANS[formData.plan].price * formData.seats;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1E1E1E] border-[#8A8A8A]/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Subscribe to RedScan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Plan</Label>
            <Select value={formData.plan} onValueChange={(value) => setFormData({...formData, plan: value})}>
              <SelectTrigger className="bg-[#1E1E1E]/50 border-[#8A8A8A]/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1E1E1E] border-[#8A8A8A]/20">
                <SelectItem value="pro" className="text-white">Pro - $29/user/month</SelectItem>
                <SelectItem value="enterprise" className="text-white">Enterprise - $99/user/month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Number of Seats</Label>
            <Input
              type="number"
              min="1"
              max="1000"
              value={formData.seats}
              onChange={(e) => setFormData({...formData, seats: parseInt(e.target.value) || 1})}
              className="bg-[#1E1E1E]/50 border-[#8A8A8A]/20"
            />
          </div>

          <div className="space-y-2">
            <Label>Billing Email</Label>
            <Input
              type="email"
              value={formData.billing_email}
              onChange={(e) => setFormData({...formData, billing_email: e.target.value})}
              className="bg-[#1E1E1E]/50 border-[#8A8A8A]/20"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input
              value={formData.company_name}
              onChange={(e) => setFormData({...formData, company_name: e.target.value})}
              className="bg-[#1E1E1E]/50 border-[#8A8A8A]/20"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>VAT/Tax ID (Optional)</Label>
            <Input
              value={formData.vat_id}
              onChange={(e) => setFormData({...formData, vat_id: e.target.value})}
              className="bg-[#1E1E1E]/50 border-[#8A8A8A]/20"
            />
          </div>

          <div className="border-t border-[#8A8A8A]/20 pt-4">
            <div className="flex justify-between text-slate-300 mb-2">
              <span>{PLANS[formData.plan].name} × {formData.seats} seats</span>
              <span>${totalMonthly}/month</span>
            </div>
            <div className="flex justify-between font-medium text-white text-lg">
              <span>Total</span>
              <span>${totalMonthly}/month</span>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-[#B00020] hover:bg-[#8B0000]">
              {loading ? 'Processing...' : 'Subscribe Now'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const InvoiceModal = ({ invoice, open, onOpenChange }) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1E1E1E] border-[#8A8A8A]/20 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Invoice #{invoice.invoice_number}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 printable-invoice">
          <div className="flex justify-between">
            <div>
              <h2 className="font-bold text-lg text-white mb-2">RedScan</h2>
              <p className="text-slate-400 text-sm">
                Powered by Reddome.org<br/>
                123 Security Street<br/>
                San Francisco, CA 94105
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-300">Invoice Date: {format(new Date(invoice.issue_date), 'MMM dd, yyyy')}</p>
              <p className="text-slate-300">Due Date: {format(new Date(invoice.due_date), 'MMM dd, yyyy')}</p>
              <Badge className={invoice.status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                {invoice.status.toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="border-t border-[#8A8A8A]/20 pt-4">
            <h3 className="font-medium text-white mb-4">Line Items</h3>
            <Table>
              <TableHeader>
                <TableRow className="border-[#8A8A8A]/20">
                  <TableHead className="text-slate-300">Description</TableHead>
                  <TableHead className="text-slate-300 text-right">Quantity</TableHead>
                  <TableHead className="text-slate-300 text-right">Unit Price</TableHead>
                  <TableHead className="text-slate-300 text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.line_items?.map((item, index) => (
                  <TableRow key={index} className="border-[#8A8A8A]/20">
                    <TableCell className="text-white">{item.description}</TableCell>
                    <TableCell className="text-right text-slate-300">{item.quantity}</TableCell>
                    <TableCell className="text-right text-slate-300">${(item.unit_price / 100).toFixed(2)}</TableCell>
                    <TableCell className="text-right text-white">${(item.amount / 100).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="border-t border-[#8A8A8A]/20 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-white">Total Amount</span>
              <span className="text-2xl font-bold text-white">${(invoice.amount / 100).toFixed(2)} {invoice.currency.toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Close
          </Button>
          <Button onClick={handlePrint} className="flex-1 bg-[#B00020] hover:bg-[#8B0000]">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function BillingPage() {
  const [subscription, setSubscription] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      if (currentUser.organization_id) {
        const [subData, invoiceData] = await Promise.all([
          Subscription.filter({ organization_id: currentUser.organization_id }),
          Invoice.filter({ organization_id: currentUser.organization_id }, '-created_date', 50)
        ]);
        
        setSubscription(subData[0] || null);
        setInvoices(invoiceData);

        if (subData.length === 0) {
          const freeSub = await Subscription.create({
            organization_id: currentUser.organization_id,
            plan: 'free',
            status: 'active',
            seats: 3,
            start_date: new Date().toISOString(),
            monthly_amount: 0
          });
          setSubscription(freeSub);
        }
      }
    } catch (error) {
      console.error('Error loading billing data:', error);
      // Use mock data on error for demo purposes
      setUser({ organization_id: 'demo-org' });
      setSubscription({ plan: 'pro', seats: 10, monthly_amount: 29000, status: 'trialing', trial_end_date: addDays(new Date(), 10).toISOString() });
      setInvoices([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubscribe = async (checkoutData) => {
    try {
      const newSub = await Subscription.create({
        organization_id: user.organization_id,
        plan: checkoutData.plan,
        status: checkoutData.status === 'success' ? 'active' : 'trialing',
        seats: checkoutData.seats,
        billing_email: checkoutData.billing_email,
        company_name: checkoutData.company_name,
        vat_id: checkoutData.vat_id,
        start_date: new Date().toISOString(),
        trial_end_date: checkoutData.plan === 'pro' ? addDays(new Date(), 14).toISOString() : null,
        next_renewal_date: addMonths(new Date(), 1).toISOString(),
        monthly_amount: checkoutData.monthly_amount
      });

      const invoice = await Invoice.create({
        organization_id: user.organization_id,
        subscription_id: newSub.id,
        invoice_number: `INV-${Date.now()}`,
        amount: checkoutData.monthly_amount,
        currency: 'usd',
        status: 'paid',
        issue_date: new Date().toISOString(),
        due_date: addDays(new Date(), 30).toISOString(),
        paid_date: new Date().toISOString(),
        line_items: [{
          description: `${PLANS[checkoutData.plan].name} Plan - ${checkoutData.seats} seats`,
          quantity: checkoutData.seats,
          unit_price: PLANS[checkoutData.plan].price * 100,
          amount: checkoutData.monthly_amount
        }]
      });

      setSubscription(newSub);
      setInvoices([invoice, ...invoices]);
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast.error('Failed to create subscription');
    }
  };

  const getTrialDaysLeft = () => {
    if (!subscription?.trial_end_date) return 0;
    return Math.max(0, differenceInDays(new Date(subscription.trial_end_date), new Date()));
  };

  const currentPlan = PLANS[subscription?.plan || 'free'];
  const trialDaysLeft = getTrialDaysLeft();
  const isTrialing = subscription?.status === 'trialing' && trialDaysLeft > 0;
  const isPastDue = subscription?.status === 'past_due';

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="text-white">Loading billing information...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-[#1E1E1E] via-[#2A2A2A] to-[#1E1E1E] min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Billing & Subscription</h1>
            <p className="text-slate-400">Manage your RedScan subscription and billing</p>
          </div>
          <Link to={createPageUrl('Pricing')}>
            <Button variant="outline">View Plans</Button>
          </Link>
        </div>

        {isTrialing && (
          <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="font-medium text-yellow-300">Trial Period Active</p>
                <p className="text-sm text-yellow-200">
                  Your {currentPlan.name} trial expires in {trialDaysLeft} days.
                </p>
              </div>
              <Button onClick={() => setShowCheckout(true)} className="ml-auto bg-yellow-600 hover:bg-yellow-700">
                Subscribe Now
              </Button>
            </div>
          </div>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-[#1E1E1E]/50 border border-[#8A8A8A]/20">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-[#1E1E1E]/50 border border-[#8A8A8A]/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#B00020]" />
                  Current Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-5 h-5 text-yellow-400" />
                      <span className="font-medium text-white text-lg">{currentPlan.name}</span>
                    </div>
                    <Badge className={
                      subscription?.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      subscription?.status === 'trialing' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-slate-500/20 text-slate-400'
                    }>
                      {subscription?.status?.replace('_', ' ')?.toUpperCase() || 'ACTIVE'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Monthly Cost</p>
                    <p className="text-2xl font-bold text-white">
                      ${subscription?.monthly_amount ? (subscription.monthly_amount / 100).toFixed(0) : 0}
                      <span className="text-sm font-normal text-slate-400">/month</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Seats</p>
                    <p className="text-xl font-medium text-white">{subscription?.seats || 3} users</p>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-[#8A8A8A]/20">
                  {subscription?.plan === 'free' && (
                    <Button onClick={() => setShowCheckout(true)} className="bg-[#B00020] hover:bg-[#8B0000]">
                      Upgrade to Pro
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices">
            <Card className="bg-[#1E1E1E]/50 border border-[#8A8A8A]/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-[#B00020]" />
                  Invoice History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {invoices.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Receipt className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                    <p>No invoices yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#8A8A8A]/20">
                        <TableHead className="text-slate-300">Invoice</TableHead>
                        <TableHead className="text-slate-300">Date</TableHead>
                        <TableHead className="text-slate-300">Amount</TableHead>
                        <TableHead className="text-slate-300">Status</TableHead>
                        <TableHead className="text-slate-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id} className="border-[#8A8A8A]/20">
                          <TableCell className="font-medium text-white">#{invoice.invoice_number}</TableCell>
                          <TableCell className="text-slate-300">{format(new Date(invoice.issue_date), 'MMM dd, yyyy')}</TableCell>
                          <TableCell className="text-white">${(invoice.amount / 100).toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge className={invoice.status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                              {invoice.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" onClick={() => setSelectedInvoice(invoice)}>
                              <Download className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <CheckoutModal
          open={showCheckout}
          onOpenChange={setShowCheckout}
          onSubscribe={handleSubscribe}
        />

        <InvoiceModal
          invoice={selectedInvoice}
          open={!!selectedInvoice}
          onOpenChange={(open) => !open && setSelectedInvoice(null)}
        />
      </div>
    </div>
  );
}
