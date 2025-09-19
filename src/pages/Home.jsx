import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle2, Users, Cloud, Building2, ArrowRight } from 'lucide-react';
import { User } from '@/api/entities';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
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

// Hexagon pattern for background
const HexagonPattern = ({ className = "" }) => (
  <svg className={`absolute inset-0 opacity-5 ${className}`} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
    <defs>
      <pattern id="homeHexPattern" patternUnits="userSpaceOnUse" width="20" height="17.32">
        <polygon points="10,1 18.66,6 18.66,15 10,20 1.34,15 1.34,6" fill="none" stroke="#B00020" strokeWidth="0.5"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#homeHexPattern)" />
  </svg>
);

const FeatureHighlight = ({ icon: Icon, title, description }) => (
  <div className="text-center p-6">
    <div className="w-16 h-16 bg-[#B00020]/20 rounded-lg flex items-center justify-center mx-auto mb-4">
      <Icon className="w-8 h-8 text-[#B00020]" />
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-slate-400">{description}</p>
  </div>
);

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const user = await User.me();
        if (user) {
          setIsAuthenticated(true);
          // If user has an org, go to dashboard, otherwise go to onboarding
          if (user.organization_id) {
            navigate(createPageUrl('Dashboard'));
          } else {
            navigate(createPageUrl('GetStarted'));
          }
        }
      } catch (error) {
        // User not authenticated, stay on home page
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleMicrosoftLogin = async () => {
    setLoading(true);
    try {
      // Simulate Microsoft OAuth flow
      const mockUser = {
        full_name: 'Sarah Johnson',
        email: 'sarah.johnson@enterprise.com',
        provider: 'microsoft'
      };
      
      // Store temp session data for onboarding
      sessionStorage.setItem('onboarding_user', JSON.stringify(mockUser));
      toast.success('Microsoft authentication successful!');
      navigate(createPageUrl('GetStarted'));
    } catch (error) {
      toast.error('Microsoft authentication failed');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // Simulate Google OAuth flow
      const mockUser = {
        full_name: 'John Smith',
        email: 'john.smith@company.com',
        provider: 'google'
      };
      
      // Store temp session data for onboarding
      sessionStorage.setItem('onboarding_user', JSON.stringify(mockUser));
      toast.success('Google authentication successful!');
      navigate(createPageUrl('GetStarted'));
    } catch (error) {
      toast.error('Google authentication failed');
    }
    setLoading(false);
  };

  // Don't render if already authenticated
  if (isAuthenticated) {
    return <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center">
      <div className="text-white">Redirecting...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-[#1E1E1E] relative">
      <HexagonPattern className="fixed inset-0" />
      
      {/* Hero Section */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#B00020] to-[#8B0000] rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-white">RedScan</h1>
              <p className="text-xs text-slate-400">Security Platform</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate(createPageUrl('GetStarted'))}>
            Sign In
          </Button>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-6xl mx-auto text-center">
            {/* Hero */}
            <div className="mb-16">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Secure Your Business
                <span className="text-[#B00020]"> Automatically</span>
              </h1>
              <p className="text-xl text-slate-400 mb-8 max-w-3xl mx-auto">
                RedScan continuously monitors and protects your endpoints, cloud, and suppliers. 
                Get compliant with Cyber Essentials+ in weeks, not months.
              </p>

              {/* Auth Buttons */}
              <Card className="bg-[#1E1E1E]/80 border-[#8A8A8A]/20 backdrop-blur-sm max-w-md mx-auto mb-12">
                <CardHeader>
                  <CardTitle className="text-white">Get Started</CardTitle>
                  <p className="text-slate-400 text-sm">Sign up with your work account</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={handleMicrosoftLogin}
                    disabled={loading}
                    className="w-full bg-white text-slate-800 hover:bg-slate-200 h-12"
                  >
                    <MicrosoftIcon />
                    Continue with Microsoft
                  </Button>

                  <Button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full bg-white text-slate-800 hover:bg-slate-200 h-12"
                  >
                    <GoogleIcon />
                    Continue with Google
                  </Button>
                  
                  <p className="text-xs text-slate-500 text-center">
                    By continuing, you agree to our{' '}
                    <a href="#" className="text-[#B00020] hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-[#B00020] hover:underline">Privacy Policy</a>
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <FeatureHighlight
                icon={Shield}
                title="Auto-Pilot Security"
                description="Continuously monitors and fixes security issues across all your systems"
              />
              <FeatureHighlight
                icon={CheckCircle2}
                title="Compliance Made Easy"
                description="Guided path to Cyber Essentials+ certification with automated evidence collection"
              />
              <FeatureHighlight
                icon={Users}
                title="Team-Friendly"
                description="Built for small businesses - security that doesn't slow you down"
              />
            </div>

            {/* Social Proof */}
            <div className="text-center">
              <p className="text-slate-400 mb-4">Trusted by businesses worldwide</p>
              <div className="flex justify-center items-center gap-8 text-slate-500">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  <span>500+ Companies</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cloud className="w-5 h-5" />
                  <span>50k+ Assets Protected</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>95% Compliance Rate</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="p-6 text-center border-t border-[#8A8A8A]/20">
          <p className="text-sm text-slate-400">
            RedScan — Powered by{' '}
            <span className="text-[#B00020] font-medium">Reddome.org</span>
          </p>
        </footer>
      </div>

      <style jsx global>{`
        :root {
          --color-primary: #B00020;
          --color-primary-hover: #8B0000;
          --color-secondary: #1E1E1E;
          --color-surface: #F5F5F5;
          --color-text-primary: #FFFFFFE6;
          --color-text-muted: #8A8A8A;
        }
      `}</style>
    </div>
  );
}