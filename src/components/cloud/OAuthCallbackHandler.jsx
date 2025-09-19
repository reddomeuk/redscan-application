import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Shield, 
  ExternalLink,
  ArrowRight 
} from 'lucide-react';
import { toast } from 'sonner';
import { cloudAuthManager, CLOUD_PROVIDERS } from '@/services/CloudAuthManager';

/**
 * OAuth 2.0 Callback Handler Component
 * Handles the OAuth callback for all cloud providers and completes the authentication flow
 */
export default function OAuthCallbackHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [provider, setProvider] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract OAuth parameters from URL
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Determine provider from current path
        const pathParts = window.location.pathname.split('/');
        const providerFromPath = pathParts[pathParts.length - 1];
        setProvider(providerFromPath);

        // Handle OAuth errors
        if (error) {
          throw new Error(errorDescription || `OAuth error: ${error}`);
        }

        if (!code || !state) {
          throw new Error('Missing required OAuth parameters');
        }

        setStatus('exchanging');

        // Exchange authorization code for tokens
        const connection = await cloudAuthManager.handleOAuthCallback(
          providerFromPath, 
          code, 
          state
        );

        setUserInfo(connection.userInfo);
        setPermissions(connection.scopes);
        setStatus('success');

        // Auto-redirect after success
        setTimeout(() => {
          navigate('/cloud-integrations', { replace: true });
        }, 3000);

      } catch (err) {
        console.error('OAuth callback error:', err);
        setError(err.message);
        setStatus('error');
        toast.error(`Authentication failed: ${err.message}`);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  const getProviderConfig = () => {
    return CLOUD_PROVIDERS[provider?.toUpperCase()] || { name: provider, id: provider };
  };

  const renderStatus = () => {
    const config = getProviderConfig();

    switch (status) {
      case 'processing':
        return (
          <div className="text-center space-y-4">
            <RefreshCw className="w-12 h-12 mx-auto animate-spin text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Processing Authentication</h2>
            <p className="text-slate-400">
              Completing OAuth 2.0 flow with {config.name}...
            </p>
          </div>
        );

      case 'exchanging':
        return (
          <div className="text-center space-y-4">
            <RefreshCw className="w-12 h-12 mx-auto animate-spin text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Exchanging Authorization Code</h2>
            <p className="text-slate-400">
              Securely exchanging tokens with {config.name}...
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-6">
            <CheckCircle2 className="w-16 h-16 mx-auto text-green-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Successfully Connected!</h2>
              <p className="text-slate-400 mt-2">
                Your {config.name} account has been securely linked to RedScan
              </p>
            </div>

            {/* User Information */}
            {userInfo && (
              <Card className="bg-slate-800/50 border-slate-700 text-left">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="text-white">{userInfo.email || userInfo.login}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Name:</span>
                    <span className="text-white">{userInfo.name || userInfo.displayName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Provider:</span>
                    <Badge className="bg-blue-500/20 text-blue-400">{config.name}</Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Granted Permissions */}
            {permissions.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700 text-left">
                <CardHeader>
                  <CardTitle className="text-white">Granted Permissions</CardTitle>
                  <p className="text-slate-400 text-sm">
                    The following permissions have been granted for security scanning:
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                    {permissions.slice(0, 10).map((scope, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0" />
                        <span className="text-sm text-slate-300">{scope}</span>
                      </div>
                    ))}
                    {permissions.length > 10 && (
                      <div className="text-sm text-slate-400 mt-2">
                        ... and {permissions.length - 10} more permissions
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-3">
              <Button
                onClick={() => navigate('/cloud-integrations', { replace: true })}
                className="bg-[var(--color-primary)] hover:bg-red-700"
              >
                Go to Cloud Integrations
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                onClick={() => navigate('/dashboard', { replace: true })}
                variant="outline"
                className="border-slate-600 text-slate-300"
              >
                Return to Dashboard
              </Button>
            </div>

            <p className="text-xs text-slate-500">
              You will be automatically redirected in a few seconds...
            </p>
          </div>
        );

      case 'error':
        return (
          <div className="text-center space-y-6">
            <AlertTriangle className="w-16 h-16 mx-auto text-red-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Authentication Failed</h2>
              <p className="text-slate-400 mt-2">
                There was an issue connecting to {config.name}
              </p>
            </div>

            <Alert className="text-left">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-400">
                <strong>Error Details:</strong><br />
                {error}
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Troubleshooting Steps:</h3>
              <div className="text-left space-y-2 text-sm text-slate-400">
                {provider === 'azure' && (
                  <>
                    <div>• Ensure your Azure Tenant ID is correct</div>
                    <div>• Verify admin consent has been granted for required permissions</div>
                    <div>• Check that the application is registered in Azure AD</div>
                  </>
                )}
                {provider === 'aws' && (
                  <>
                    <div>• Verify the cross-account IAM role exists and has correct permissions</div>
                    <div>• Ensure the trust relationship allows RedScan to assume the role</div>
                    <div>• Check that the AWS Account ID is correct</div>
                  </>
                )}
                {provider === 'google' && (
                  <>
                    <div>• Ensure Google Workspace admin has approved the application</div>
                    <div>• Verify the OAuth 2.0 client is properly configured</div>
                    <div>• Check that required APIs are enabled in Google Cloud Console</div>
                  </>
                )}
                {provider === 'github' && (
                  <>
                    <div>• Ensure the GitHub OAuth App is properly configured</div>
                    <div>• Verify organization permissions allow third-party applications</div>
                    <div>• Check that required scopes are approved</div>
                  </>
                )}
                <div>• Contact support if the issue persists</div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => navigate('/cloud-integrations', { replace: true })}
                className="bg-[var(--color-primary)] hover:bg-red-700"
              >
                Try Again
              </Button>
              <Button
                onClick={() => navigate('/dashboard', { replace: true })}
                variant="outline"
                className="border-slate-600 text-slate-300"
              >
                Return to Dashboard
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-2xl">
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl text-white">Cloud Authentication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderStatus()}
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            🔒 All authentication flows use industry-standard OAuth 2.0 with PKCE for enhanced security.
            Your credentials are never stored or transmitted to RedScan servers.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Route component for handling different provider callbacks
 */
export const OAuthRoutes = () => {
  return (
    <>
      {/* Define routes for each provider callback */}
      <Route path="/auth/callback/azure" element={<OAuthCallbackHandler />} />
      <Route path="/auth/callback/aws" element={<OAuthCallbackHandler />} />
      <Route path="/auth/callback/google" element={<OAuthCallbackHandler />} />
      <Route path="/auth/callback/github" element={<OAuthCallbackHandler />} />
    </>
  );
};
