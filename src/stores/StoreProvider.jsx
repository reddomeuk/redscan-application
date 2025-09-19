/**
 * Store Provider and Context
 * Provides centralized state management context to the entire application
 */

import React, { createContext, useContext, useEffect } from 'react';
import { useAppStore } from './appStore';
import { useAuthStore } from './authStore';
import { useCloudStore } from './cloudStore';

// ============================================================================
// STORE CONTEXT
// ============================================================================

const StoreContext = createContext(null);

export const useStores = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStores must be used within a StoreProvider');
  }
  return context;
};

// ============================================================================
// STORE PROVIDER COMPONENT
// ============================================================================

export function StoreProvider({ children }) {
  const appStore = useAppStore();
  const authStore = useAuthStore();
  const cloudStore = useCloudStore();

  // Initialize stores on mount
  useEffect(() => {
    const initializeStores = async () => {
      try {
        // Initialize auth store first
        await authStore.initialize();
        
        // Initialize cloud store if authenticated
        if (authStore.isAuthenticated) {
          await cloudStore.initialize();
        }
        
        // Mark app as initialized
        appStore.ui.setLoading('app_initialization', false);
        
      } catch (error) {
        console.error('Failed to initialize stores:', error);
        appStore.ui.addNotification({
          type: 'error',
          title: 'Initialization Error',
          message: 'Failed to initialize application. Please refresh the page.',
          duration: 10000,
          timestamp: Date.now()
        });
      }
    };

    // Set initial loading state
    console.log('appStore:', appStore);
    console.log('appStore.ui:', appStore.ui);
    if (appStore.ui && appStore.ui.setLoading) {
      appStore.ui.setLoading('app_initialization', true);
    } else {
      console.error('appStore.ui.setLoading is not available');
    }
    
    initializeStores();
  }, []);

  // Sync auth state between stores
  useEffect(() => {
    const unsubscribeAuth = useAuthStore.subscribe(
      (state) => state.isAuthenticated,
      (isAuthenticated, prevAuthenticated) => {
        if (isAuthenticated !== prevAuthenticated) {
          if (isAuthenticated) {
            // User logged in - initialize cloud store
            cloudStore.initialize();
            
            // Update app store auth state
            appStore.auth.setAuthenticated(
              authStore.user,
              authStore.session
            );
          } else {
            // User logged out - clear cloud connections
            cloudStore.disconnectAllProviders();
            
            // Update app store
            appStore.auth.logout();
          }
        }
      }
    );

    return unsubscribeAuth;
  }, []);

  // Activity tracking
  useEffect(() => {
    const handleActivity = () => {
      if (authStore.isAuthenticated) {
        authStore.updateActivity();
        appStore.auth.updateActivity();
      }
    };

    // Track user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [authStore.isAuthenticated]);

  // Store synchronization for cloud connections
  useEffect(() => {
    const unsubscribeCloud = useCloudStore.subscribe(
      (state) => state.connections,
      (connections) => {
        // Sync cloud connections to app store
        connections.forEach((connection, provider) => {
          appStore.cloud.addConnection(provider, connection);
        });
      }
    );

    return unsubscribeCloud;
  }, []);

  // Error synchronization
  useEffect(() => {
    const unsubscribeAuthErrors = useAuthStore.subscribe(
      (state) => state.error,
      (error) => {
        if (error) {
          appStore.auth.setError(error);
        }
      }
    );

    const unsubscribeCloudErrors = useCloudStore.subscribe(
      (state) => state.errors,
      (errors) => {
        errors.forEach((error, provider) => {
          appStore.cloud.setError(`${provider}: ${error}`);
        });
      }
    );

    return () => {
      unsubscribeAuthErrors();
      unsubscribeCloudErrors();
    };
  }, []);

  const stores = {
    app: appStore,
    auth: authStore,
    cloud: cloudStore
  };

  return (
    <StoreContext.Provider value={stores}>
      {children}
    </StoreContext.Provider>
  );
}

// ============================================================================
// STORE HOOKS AND UTILITIES
// ============================================================================

// Combined hooks for common operations
export const useAuth = () => {
  const { auth } = useStores();
  return {
    ...auth,
    // Combined actions from both stores
    login: auth.login,
    logout: auth.logout,
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
    permissions: auth.permissions,
    hasPermission: auth.hasPermission,
    loading: auth.loading
  };
};

export const useCloudIntegration = () => {
  const { cloud } = useStores();
  return {
    connections: cloud.connections,
    activeScans: cloud.activeScans,
    scanHistory: cloud.scanHistory,
    connectProvider: cloud.connectProvider,
    disconnectProvider: cloud.disconnectProvider,
    startScan: cloud.startScan,
    stopScan: cloud.stopScan,
    isProviderConnected: cloud.isProviderConnected,
    getConnectionHealth: cloud.getConnectionHealth,
    loading: cloud.loading,
    errors: cloud.errors
  };
};

export const useAppState = () => {
  const { app } = useStores();
  return {
    theme: app.ui.theme,
    setTheme: app.ui.setTheme,
    sidebarCollapsed: app.ui.sidebarCollapsed,
    toggleSidebar: app.ui.toggleSidebar,
    modals: app.ui.modals,
    openModal: app.ui.openModal,
    closeModal: app.ui.closeModal,
    notifications: app.ui.notifications,
    addNotification: app.ui.addNotification,
    removeNotification: app.ui.removeNotification,
    loading: app.ui.loading,
    setLoading: app.ui.setLoading,
    breadcrumbs: app.ui.breadcrumbs,
    setBreadcrumbs: app.ui.setBreadcrumbs
  };
};

// Store reset utility
export const useStoreReset = () => {
  const { app, auth, cloud } = useStores();
  
  return {
    resetAll: async () => {
      await auth.logout();
      await cloud.disconnectAllProviders();
      app.reset();
    },
    resetAuth: () => auth.logout(),
    resetCloud: () => cloud.disconnectAllProviders(),
    resetUI: () => {
      app.ui.modals.clear();
      app.ui.notifications.splice(0);
      app.ui.loading.clear();
    }
  };
};

// Debug utilities (development only)
export const useStoreDebug = () => {
  const stores = useStores();
  
  if (import.meta.env.PROD) {
    return {}; // No debug in production
  }

  return {
    getState: () => ({
      app: stores.app,
      auth: {
        isAuthenticated: stores.auth.isAuthenticated,
        user: stores.auth.user,
        permissions: stores.auth.permissions,
        lastActivity: stores.auth.lastActivity
      },
      cloud: {
        connections: Array.from(stores.cloud.connections.entries()),
        activeScans: Array.from(stores.cloud.activeScans.entries()),
        errors: Array.from(stores.cloud.errors.entries())
      }
    }),
    
    logState: () => {
      console.group('RedScan Store State');
      console.log('App Store:', stores.app);
      console.log('Auth Store:', stores.auth);
      console.log('Cloud Store:', stores.cloud);
      console.groupEnd();
    },
    
    exportState: () => {
      const state = {
        timestamp: new Date().toISOString(),
        app: stores.app,
        auth: {
          isAuthenticated: stores.auth.isAuthenticated,
          permissions: stores.auth.permissions
        },
        cloud: {
          connections: Object.fromEntries(stores.cloud.connections),
          scanHistory: stores.cloud.scanHistory.slice(0, 10) // Last 10 scans
        }
      };
      
      const blob = new Blob([JSON.stringify(state, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `redscan-state-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };
};

export default StoreProvider;
