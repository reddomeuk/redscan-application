import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowRight } from 'lucide-react';
import { User } from '@/api/entities';
import { toast } from 'sonner';

// Mock SVG icons for providers
const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" className="w-5 h-5 mr-2">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.021,35.596,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
  </svg>
);

const MicrosoftIcon = () => (
  <svg viewBox="0 0 21 21" className="w-5 h-5 mr-2">
    <path fill="#f25022" d="M1 1h9v9H1z"/>
    <path fill="#00a4ef" d="M1 11h9v9H1z"/>
    <path fill="#7fba00" d="M11 1h9v9h-9z"/>
    <path fill="#ffb900" d="M11 11h9v9h-9z"/>
  </svg>
);

export default function Step1Auth({ onAuthSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      // Simulate Google OAuth flow
      // In a real app, this would redirect to Google OAuth and return with user data
      const mockUser = {
        full_name: 'John Smith',
        email: 'john.smith@company.com'
      };
      
      toast.success('Google authentication successful!');
      await onAuthSuccess(mockUser, 'google');
    } catch (error) {
      toast.error('Google authentication failed');
    }
    setLoading(false);
  };

  const handleMicrosoftAuth = async () => {
    setLoading(true);
    try {
      // Simulate Microsoft OAuth flow
      const mockUser = {
        full_name: 'Sarah Johnson', 
        email: 'sarah.johnson@enterprise.com'
      };
      
      toast.success('Microsoft authentication successful!');
      await onAuthSuccess(mockUser, 'microsoft');
    } catch (error) {
      toast.error('Microsoft authentication failed');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Choose your authentication method</h2>
        <p className="text-slate-400">
          Sign up with your work account to get started with RedScan.ai
        </p>
      </div>

      <div className="space-y-4">
        <Button
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full bg-white text-slate-800 hover:bg-slate-200 h-12"
        >
          <GoogleIcon />
          Continue with Google
        </Button>

        <Button
          onClick={handleMicrosoftAuth}
          disabled={loading}
          className="w-full bg-white text-slate-800 hover:bg-slate-200 h-12"
        >
          <MicrosoftIcon />
          Continue with Microsoft Work/School
        </Button>
      </div>

      <div className="mt-8 p-4 bg-slate-700/30 rounded-lg">
        <h3 className="font-semibold text-white mb-2">Why do we need work authentication?</h3>
        <ul className="text-sm text-slate-400 space-y-1">
          <li>• Verify your organization's domain ownership</li>
          <li>• Enable secure single sign-on (SSO) integration</li>
          <li>• Ensure proper access controls and compliance</li>
        </ul>
      </div>

      <p className="text-xs text-slate-500 text-center">
        By continuing, you agree to RedScan.ai's{' '}
        <a href="#" className="text-blue-400 hover:text-blue-300">Terms of Service</a>
        {' '}and{' '}
        <a href="#" className="text-blue-400 hover:text-blue-300">Privacy Policy</a>
      </p>
    </div>
  );
}