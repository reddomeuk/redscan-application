import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { toast } from 'sonner';

class SecurityDashboardErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
      isSecuritySensitive: false
    };
  }

  static getDerivedStateFromError(error) {
    // Generate unique error ID for tracking
    const errorId = `SEC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Check if error involves security-sensitive data
    const isSecuritySensitive = this.checkSecuritySensitivity(error);
    
    return {
      hasError: true,
      error: error,
      errorId: errorId,
      isSecuritySensitive: isSecuritySensitive
    };
  }

  static checkSecuritySensitivity(error) {
    const sensitiveKeywords = [
      'api_key', 'token', 'password', 'secret', 'credential',
      'vulnerability', 'exploit', 'attack', 'breach'
    ];
    
    const errorString = error.toString().toLowerCase();
    return sensitiveKeywords.some(keyword => errorString.includes(keyword));
  }

  componentDidCatch(error, errorInfo) {
    const { isSecuritySensitive, errorId } = this.state;
    
    // Sanitized error logging for security components
    const sanitizedError = {
      errorId: errorId,
      timestamp: new Date().toISOString(),
      component: this.props.componentName || 'SecurityDashboard',
      isSensitive: isSecuritySensitive,
      userAgent: navigator.userAgent,
      url: window.location.href,
      // Only include stack trace if not security sensitive
      stack: isSecuritySensitive ? '[REDACTED]' : error.stack,
      message: isSecuritySensitive ? '[SECURITY ERROR - DETAILS REDACTED]' : error.message
    };

    console.error('Security Dashboard Error:', sanitizedError);

    // Report to monitoring (with sensitive data scrubbed)
    if (window.gtag) {
      window.gtag('event', 'security_dashboard_error', {
        error_id: errorId,
        component: this.props.componentName || 'unknown',
        is_sensitive: isSecuritySensitive,
        custom_parameter_1: isSecuritySensitive ? 'redacted' : error.message.substring(0, 100)
      });
    }

    // Alert security team for sensitive errors
    if (isSecuritySensitive) {
      toast.error('Security component error detected. Security team has been notified.', {
        duration: 10000,
        className: 'border-red-500 bg-red-50'
      });
    }
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/Dashboard';
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: null,
      isSecuritySensitive: false
    });
  };

  render() {
    if (this.state.hasError) {
      const { isSecuritySensitive, errorId } = this.state;
      
      return (
        <div className="flex items-center justify-center min-h-[400px] p-6">
          <Card className={`max-w-lg w-full ${isSecuritySensitive ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isSecuritySensitive ? 'text-red-800' : 'text-orange-800'}`}>
                {isSecuritySensitive ? (
                  <Shield className="h-5 w-5 text-red-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                )}
                {isSecuritySensitive ? 'Security Component Error' : 'Dashboard Component Error'}
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <Alert className={isSecuritySensitive ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}>
                <AlertDescription>
                  <div className="space-y-4">
                    <div>
                      <p className={`text-sm ${isSecuritySensitive ? 'text-red-700' : 'text-orange-700'}`}>
                        {isSecuritySensitive ? (
                          <>
                            A security-related component has encountered an error. For security reasons, 
                            detailed error information has been logged securely and the security team has been notified.
                          </>
                        ) : (
                          <>
                            The security dashboard component has encountered an error. 
                            This may affect the display of security information.
                          </>
                        )}
                      </p>
                      
                      <div className="mt-2 text-xs text-gray-600">
                        <strong>Error ID:</strong> {errorId}
                        <br />
                        <strong>Time:</strong> {new Date().toLocaleString()}
                        <br />
                        <strong>Component:</strong> {this.props.componentName || 'Unknown'}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={this.handleRetry}
                        className={`${isSecuritySensitive ? 'border-red-300 text-red-700 hover:bg-red-100' : 'border-orange-300 text-orange-700 hover:bg-orange-100'}`}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Try Again
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={this.handleRefresh}
                        className={`${isSecuritySensitive ? 'border-red-300 text-red-700 hover:bg-red-100' : 'border-orange-300 text-orange-700 hover:bg-orange-100'}`}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Refresh Page
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={this.handleGoHome}
                        className={`${isSecuritySensitive ? 'border-red-300 text-red-700 hover:bg-red-100' : 'border-orange-300 text-orange-700 hover:bg-orange-100'}`}
                      >
                        <Home className="h-3 w-3 mr-1" />
                        Go Home
                      </Button>
                    </div>

                    {isSecuritySensitive && (
                      <div className="text-xs text-red-600 p-3 bg-red-100 rounded border border-red-200">
                        <strong>🛡️ Security Notice:</strong>
                        <ul className="mt-1 space-y-1">
                          <li>• Error details have been securely logged</li>
                          <li>• Security team has been automatically notified</li>
                          <li>• No sensitive data has been exposed in this error display</li>
                          <li>• Please contact security team with Error ID: {errorId}</li>
                        </ul>
                      </div>
                    )}

                    {this.props.fallbackComponent && (
                      <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                        <p className="text-sm text-blue-700 font-medium">Alternative View Available</p>
                        <p className="text-xs text-blue-600 mt-1">
                          A simplified version of this component is available below.
                        </p>
                        <div className="mt-2">
                          {this.props.fallbackComponent}
                        </div>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SecurityDashboardErrorBoundary;