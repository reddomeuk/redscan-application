import React from 'react';
import DiagnosticsPanel from './DiagnosticsPanel';
import { useSafeMode } from './SafeModeContext';
import { useLogger } from './LogContext';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    const { addLog, safeMode, user } = this.props;
    
    // Log the error to the console and our in-memory logger
    const logEntry = {
      message: error.message,
      stack_start: error.stack.substring(0, 200),
      component: errorInfo.componentStack?.split('\n')[1]?.trim() || 'Unknown',
      route: window.location.pathname,
      user_role: user?.role || 'anonymous',
      org_id: user?.organization_id || 'none',
      safe_mode: safeMode.isSafeMode,
    };
    console.error("Caught by Error Boundary:", logEntry);
    addLog(logEntry);

    // If an error occurs, force the app back into Safe Mode
    if (!safeMode.isSafeMode) {
      safeMode.setIsSafeMode(true);
    }
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError) {
      return <DiagnosticsPanel error={this.state.error} resetErrorBoundary={this.resetErrorBoundary} />;
    }

    return this.props.children;
  }
}

// Wrapper component to inject context hooks
const GlobalErrorBoundaryWrapper = ({ children }) => {
  const safeMode = useSafeMode();
  const { addLog } = useLogger();
  const { user } = {}; // In a real app, you'd get this from a UserContext

  return (
    <GlobalErrorBoundary safeMode={safeMode} addLog={addLog} user={user}>
      {children}
    </GlobalErrorBoundary>
  );
};

export default GlobalErrorBoundaryWrapper;