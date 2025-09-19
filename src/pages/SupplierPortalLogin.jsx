import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import { toast } from 'sonner';
import { secureAuthManager } from '@/services/SecureAuthManager';

export default function SupplierPortalLogin() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      const verifyToken = async () => {
        setLoading(true);
        try {
          const users = await User.filter({ portal_access_token: token });
          if (users.length > 0) {
            const user = users[0];
            // Use secure authentication manager instead of localStorage
            await secureAuthManager.login({
              email: user.email,
              type: 'supplier_portal',
              token: token
            });
            toast.success('Login successful!');
            navigate('/SupplierPortalDashboard');
          } else {
            toast.error('Invalid or expired login link.');
          }
        } catch (error) {
          toast.error('An error occurred during login.');
        }
        setLoading(false);
      };
      verifyToken();
    }
  }, [token, navigate]);

  const handleRequestLink = async () => {
    setLoading(true);
    toast.info(`If an account exists for ${email}, a login link has been sent. (This is a simulation)`);
    // Simulate sending a magic link
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
  };

  if (token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 animate-pulse" />
          <h1 className="text-2xl font-bold">Verifying your access...</h1>
          <p className="text-slate-400">Please wait while we securely log you in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <Card className="w-[400px] bg-slate-800/50 border-slate-700 text-white">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle>Supplier Portal</CardTitle>
          <CardDescription className="text-slate-400">Access your secure supplier dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                id="email"
                type="email"
                placeholder="Enter your business email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-900/50 border-slate-700"
              />
            </div>
            <Button onClick={handleRequestLink} disabled={loading} className="w-full bg-[var(--color-primary)] hover:bg-red-700">
              {loading ? 'Sending...' : 'Send Magic Link'}
            </Button>
            <p className="text-xs text-slate-500 text-center">
              Enter the email address associated with your supplier account to receive a secure, one-time login link.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}