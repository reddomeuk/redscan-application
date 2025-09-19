import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

class AIServiceErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error: error
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log AI service errors specifically
    console.error('AI Service Error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      retryCount: this.state.retryCount
    });

    // Report to monitoring service if available
    if (window.gtag) {
      window.gtag('event', 'ai_service_error', {
        error_message: error.message,
        component: this.props.componentName || 'unknown',
        retry_count: this.state.retryCount
      });
    }

    // Show user-friendly toast notification
    toast.error('AI service temporarily unavailable. Please try again.', {
      duration: 5000,
      action: {
        label: 'Retry',
        onClick: () => this.handleRetry()
      }
    });
  }

  handleRetry = () => {
    if (this.state.retryCount < 3) {
      this.setState({
        hasError: false,
        error: null,
        retryCount: this.state.retryCount + 1
      });
    } else {
      toast.error('Multiple retry attempts failed. Please refresh the page or contact support.');
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      retryCount: 0
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center p-6">
          <Alert className="max-w-md border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="mt-2">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-orange-800">AI Service Error</h4>
                  <p className="text-sm text-orange-700 mt-1">
                    {this.props.fallbackMessage || 
                     'The AI assistant is temporarily unavailable. This might be due to high demand or network issues.'}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={this.handleRetry}
                    disabled={this.state.retryCount >= 3}
                    className="border-orange-300 text-orange-700 hover:bg-orange-100"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry ({3 - this.state.retryCount} left)
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={this.handleReset}
                    className="border-orange-300 text-orange-700 hover:bg-orange-100"
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Reset
                  </Button>
                </div>

                {this.state.retryCount >= 3 && (
                  <div className="text-xs text-orange-600 p-2 bg-orange-100 rounded">
                    <strong>Troubleshooting:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Check your internet connection</li>
                      <li>• Try refreshing the page</li>
                      <li>• Contact support if the issue persists</li>
                    </ul>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AIServiceErrorBoundary;