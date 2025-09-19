/**
 * Centralized Application State Management
 * Secure Zustand store with persistence, middleware, and type safety
 */

import { create } from 'zustand';
import { subscribeWithSelector, devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';
import { SecureTokenManager } from '../services/SecureAuthManager';

// Enable Immer MapSet plugin for Map/Set support in state
enableMapSet();

// ============================================================================
// STORE INTERFACES AND TYPES
// ============================================================================

const StoreNamespaces = {
  AUTH: 'auth',
  USER: 'user',
  CLOUD: 'cloud',
  ASSETS: 'assets',
  FINDINGS: 'findings',
  COMPLIANCE: 'compliance',
  SETTINGS: 'settings',
  UI: 'ui'
};

// ============================================================================
// SECURE PERSISTENCE MIDDLEWARE
// ============================================================================

class SecureStorageAdapter {
  constructor() {
    this.tokenManager = new SecureTokenManager();
    this.storageKey = 'redscan_app_state';
  }

  async getItem(name) {
    try {
      // Only persist non-sensitive data
      const persistedData = localStorage.getItem(this.storageKey);
      if (!persistedData) return null;

      const parsed = JSON.parse(persistedData);
      return parsed[name] || null;
    } catch (error) {
      console.warn('Failed to load persisted state:', error);
      return null;
    }
  }

  async setItem(name, value) {
    try {
      // Get current persisted data
      const current = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
      
      // Update specific namespace
      current[name] = value;
      
      // Only persist safe data (exclude sensitive auth tokens)
      const safeData = this.sanitizeForPersistence(current);
      localStorage.setItem(this.storageKey, JSON.stringify(safeData));
    } catch (error) {
      console.warn('Failed to persist state:', error);
    }
  }

  async removeItem(name) {
    try {
      const current = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
      delete current[name];
      localStorage.setItem(this.storageKey, JSON.stringify(current));
    } catch (error) {
      console.warn('Failed to remove persisted state:', error);
    }
  }

  sanitizeForPersistence(data) {
    const safe = { ...data };
    
    // Remove sensitive auth data
    if (safe.auth) {
      const { tokens, credentials, ...safeAuth } = safe.auth;
      safe.auth = safeAuth;
    }

    // Remove temporary UI state
    if (safe.ui) {
      const { modals, temporaryState, ...safeUI } = safe.ui;
      safe.ui = safeUI;
    }

    return safe;
  }
}

const secureStorage = new SecureStorageAdapter();

// ============================================================================
// MAIN APPLICATION STORE
// ============================================================================

export const useAppStore = create()(
  devtools(
    subscribeWithSelector(
      immer(
        persist(
          (set, get) => ({
            // ================================================================
            // AUTHENTICATION STATE
            // ================================================================
            auth: {
              isAuthenticated: false,
              user: null,
              permissions: [],
              session: null,
              loading: false,
              error: null,
              lastActivity: null,
              
              // Actions
              setAuthenticated: (user, session) => set((state) => {
                state.auth.isAuthenticated = true;
                state.auth.user = user;
                state.auth.session = session;
                state.auth.lastActivity = Date.now();
                state.auth.error = null;
                state.auth.loading = false;
              }),
              
              setLoading: (loading) => set((state) => {
                state.auth.loading = loading;
              }),
              
              setError: (error) => set((state) => {
                state.auth.error = error;
                state.auth.loading = false;
              }),
              
              updateActivity: () => set((state) => {
                state.auth.lastActivity = Date.now();
              }),
              
              logout: () => set((state) => {
                state.auth.isAuthenticated = false;
                state.auth.user = null;
                state.auth.session = null;
                state.auth.permissions = [];
                state.auth.error = null;
                
                // Clear cloud connections on logout
                state.cloud.connections.clear();
                state.cloud.activeScans.clear();
              })
            },

            // ================================================================
            // CLOUD INTEGRATION STATE
            // ================================================================
            cloud: {
              connections: new Map(),
              providers: new Map(),
              activeScans: new Map(),
              scanHistory: [],
              loading: false,
              error: null,
              
              // Actions
              addConnection: (provider, connection) => set((state) => {
                state.cloud.connections.set(provider, connection);
                state.cloud.error = null;
              }),
              
              removeConnection: (provider) => set((state) => {
                state.cloud.connections.delete(provider);
                state.cloud.activeScans.delete(provider);
              }),
              
              updateConnection: (provider, updates) => set((state) => {
                const existing = state.cloud.connections.get(provider);
                if (existing) {
                  state.cloud.connections.set(provider, { ...existing, ...updates });
                }
              }),
              
              addScan: (scanId, scanData) => set((state) => {
                state.cloud.activeScans.set(scanId, scanData);
              }),
              
              updateScan: (scanId, updates) => set((state) => {
                const existing = state.cloud.activeScans.get(scanId);
                if (existing) {
                  state.cloud.activeScans.set(scanId, { ...existing, ...updates });
                }
              }),
              
              addScanToHistory: (scan) => set((state) => {
                state.cloud.scanHistory.unshift(scan);
                // Keep only last 100 scans
                if (state.cloud.scanHistory.length > 100) {
                  state.cloud.scanHistory.splice(100);
                }
              }),
              
              setLoading: (loading) => set((state) => {
                state.cloud.loading = loading;
              }),
              
              setError: (error) => set((state) => {
                state.cloud.error = error;
                state.cloud.loading = false;
              })
            },

            // ================================================================
            // ASSETS STATE
            // ================================================================
            assets: {
              items: new Map(),
              categories: [],
              filters: {
                search: '',
                category: '',
                riskLevel: '',
                status: ''
              },
              pagination: {
                page: 1,
                limit: 50,
                total: 0
              },
              loading: false,
              error: null,
              
              // Actions
              setAssets: (assets) => set((state) => {
                state.assets.items.clear();
                assets.forEach(asset => {
                  state.assets.items.set(asset.id, asset);
                });
              }),
              
              addAsset: (asset) => set((state) => {
                state.assets.items.set(asset.id, asset);
              }),
              
              updateAsset: (assetId, updates) => set((state) => {
                const existing = state.assets.items.get(assetId);
                if (existing) {
                  state.assets.items.set(assetId, { ...existing, ...updates });
                }
              }),
              
              removeAsset: (assetId) => set((state) => {
                state.assets.items.delete(assetId);
              }),
              
              setFilters: (filters) => set((state) => {
                state.assets.filters = { ...state.assets.filters, ...filters };
                state.assets.pagination.page = 1; // Reset to first page when filtering
              }),
              
              setPagination: (pagination) => set((state) => {
                state.assets.pagination = { ...state.assets.pagination, ...pagination };
              }),
              
              setLoading: (loading) => set((state) => {
                state.assets.loading = loading;
              }),
              
              setError: (error) => set((state) => {
                state.assets.error = error;
                state.assets.loading = false;
              })
            },

            // ================================================================
            // FINDINGS STATE
            // ================================================================
            findings: {
              items: new Map(),
              filters: {
                severity: '',
                status: '',
                category: '',
                dateRange: null
              },
              summary: {
                total: 0,
                critical: 0,
                high: 0,
                medium: 0,
                low: 0,
                resolved: 0
              },
              loading: false,
              error: null,
              
              // Actions
              setFindings: (findings) => set((state) => {
                state.findings.items.clear();
                findings.forEach(finding => {
                  state.findings.items.set(finding.id, finding);
                });
                
                // Update summary
                state.findings.summary = {
                  total: findings.length,
                  critical: findings.filter(f => f.severity === 'critical').length,
                  high: findings.filter(f => f.severity === 'high').length,
                  medium: findings.filter(f => f.severity === 'medium').length,
                  low: findings.filter(f => f.severity === 'low').length,
                  resolved: findings.filter(f => f.status === 'resolved').length
                };
              }),
              
              addFinding: (finding) => set((state) => {
                state.findings.items.set(finding.id, finding);
                // Update summary counts
                state.findings.summary.total++;
                state.findings.summary[finding.severity]++;
              }),
              
              updateFinding: (findingId, updates) => set((state) => {
                const existing = state.findings.items.get(findingId);
                if (existing) {
                  // Update summary if severity or status changed
                  if (updates.severity && updates.severity !== existing.severity) {
                    state.findings.summary[existing.severity]--;
                    state.findings.summary[updates.severity]++;
                  }
                  if (updates.status === 'resolved' && existing.status !== 'resolved') {
                    state.findings.summary.resolved++;
                  }
                  
                  state.findings.items.set(findingId, { ...existing, ...updates });
                }
              }),
              
              setFilters: (filters) => set((state) => {
                state.findings.filters = { ...state.findings.filters, ...filters };
              })
            },

            // ================================================================
            // UI STATE
            // ================================================================
            ui: {
              theme: 'dark',
              sidebarCollapsed: false,
              modals: new Map(),
              notifications: [],
              loading: new Map(),
              breadcrumbs: [],
              
              // Actions
              setTheme: (theme) => set((state) => {
                state.ui.theme = theme;
              }),
              
              toggleSidebar: () => set((state) => {
                state.ui.sidebarCollapsed = !state.ui.sidebarCollapsed;
              }),
              
              openModal: (modalId, data = {}) => set((state) => {
                state.ui.modals.set(modalId, { ...data, isOpen: true });
              }),
              
              closeModal: (modalId) => set((state) => {
                state.ui.modals.delete(modalId);
              }),
              
              addNotification: (notification) => set((state) => {
                const id = Date.now() + Math.random();
                state.ui.notifications.push({ ...notification, id });
              }),
              
              removeNotification: (notificationId) => set((state) => {
                state.ui.notifications = state.ui.notifications.filter(
                  n => n.id !== notificationId
                );
              }),
              
              setLoading: (key, isLoading) => set((state) => {
                if (isLoading) {
                  state.ui.loading.set(key, true);
                } else {
                  state.ui.loading.delete(key);
                }
              }),
              
              setBreadcrumbs: (breadcrumbs) => set((state) => {
                state.ui.breadcrumbs = breadcrumbs;
              })
            },

            // ================================================================
            // GLOBAL ACTIONS
            // ================================================================
            reset: () => set(() => ({
              auth: { ...get().auth, isAuthenticated: false, user: null },
              cloud: { connections: new Map(), activeScans: new Map(), scanHistory: [] },
              assets: { items: new Map(), filters: {}, pagination: {} },
              findings: { items: new Map(), filters: {}, summary: {} },
              ui: { modals: new Map(), notifications: [], loading: new Map() }
            })),
            
            hydrate: (persistedState) => set((state) => {
              // Safely hydrate state from persistence
              if (persistedState.ui) {
                state.ui = { ...state.ui, ...persistedState.ui };
              }
              if (persistedState.assets?.filters) {
                state.assets.filters = persistedState.assets.filters;
              }
              if (persistedState.findings?.filters) {
                state.findings.filters = persistedState.findings.filters;
              }
            })
          }),
          {
            name: 'redscan-app-store',
            storage: secureStorage,
            partialize: (state) => ({
              ui: {
                theme: state.ui.theme,
                sidebarCollapsed: state.ui.sidebarCollapsed
              },
              assets: {
                filters: state.assets.filters
              },
              findings: {
                filters: state.findings.filters
              }
            }),
            version: 1,
            migrate: (persistedState, version) => {
              // Handle version migrations
              if (version === 0) {
                // Migration from v0 to v1
                return {
                  ...persistedState,
                  ui: {
                    ...persistedState.ui,
                    theme: persistedState.ui?.theme || 'dark'
                  }
                };
              }
              return persistedState;
            }
          }
        )
      )
    ),
    { name: 'RedScan App Store' }
  )
);

// ============================================================================
// SELECTOR HOOKS
// ============================================================================

// Authentication selectors
export const useAuth = () => useAppStore(state => state.auth);
export const useIsAuthenticated = () => useAppStore(state => state.auth.isAuthenticated);
export const useUser = () => useAppStore(state => state.auth.user);

// Cloud selectors
export const useCloudConnections = () => useAppStore(state => state.cloud.connections);
export const useCloudProvider = (provider) => useAppStore(state => state.cloud.connections.get(provider));
export const useActiveScans = () => useAppStore(state => state.cloud.activeScans);

// Assets selectors
export const useAssets = () => useAppStore(state => state.assets);
export const useAssetById = (id) => useAppStore(state => state.assets.items.get(id));
export const useFilteredAssets = () => useAppStore(state => {
  const { items, filters } = state.assets;
  // Apply filters logic here
  return Array.from(items.values());
});

// Findings selectors
export const useFindings = () => useAppStore(state => state.findings);
export const useFindingsSummary = () => useAppStore(state => state.findings.summary);
export const useFindingById = (id) => useAppStore(state => state.findings.items.get(id));

// UI selectors
export const useTheme = () => useAppStore(state => state.ui.theme);
export const useModals = () => useAppStore(state => state.ui.modals);
export const useNotifications = () => useAppStore(state => state.ui.notifications);
export const useLoading = (key) => useAppStore(state => state.ui.loading.get(key) || false);

// ============================================================================
// ACTION HOOKS
// ============================================================================

export const useAuthActions = () => useAppStore(state => ({
  setAuthenticated: state.auth.setAuthenticated,
  setLoading: state.auth.setLoading,
  setError: state.auth.setError,
  updateActivity: state.auth.updateActivity,
  logout: state.auth.logout
}));

export const useCloudActions = () => useAppStore(state => ({
  addConnection: state.cloud.addConnection,
  removeConnection: state.cloud.removeConnection,
  updateConnection: state.cloud.updateConnection,
  addScan: state.cloud.addScan,
  updateScan: state.cloud.updateScan,
  addScanToHistory: state.cloud.addScanToHistory,
  setLoading: state.cloud.setLoading,
  setError: state.cloud.setError
}));

export const useAssetActions = () => useAppStore(state => ({
  setAssets: state.assets.setAssets,
  addAsset: state.assets.addAsset,
  updateAsset: state.assets.updateAsset,
  removeAsset: state.assets.removeAsset,
  setFilters: state.assets.setFilters,
  setPagination: state.assets.setPagination,
  setLoading: state.assets.setLoading,
  setError: state.assets.setError
}));

export const useUIActions = () => useAppStore(state => ({
  setTheme: state.ui.setTheme,
  toggleSidebar: state.ui.toggleSidebar,
  openModal: state.ui.openModal,
  closeModal: state.ui.closeModal,
  addNotification: state.ui.addNotification,
  removeNotification: state.ui.removeNotification,
  setLoading: state.ui.setLoading,
  setBreadcrumbs: state.ui.setBreadcrumbs
}));

// ============================================================================
// STORE MIDDLEWARE AND PLUGINS
// ============================================================================

// Activity tracking middleware
useAppStore.subscribe(
  (state) => state.auth.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      // Update activity on any store change when authenticated
      useAppStore.getState().auth.updateActivity();
    }
  }
);

// Notification cleanup middleware
useAppStore.subscribe(
  (state) => state.ui.notifications,
  (notifications) => {
    // Auto-remove old notifications
    const now = Date.now();
    const expired = notifications.filter(n => 
      n.autoRemove && (now - n.timestamp > (n.duration || 5000))
    );
    
    expired.forEach(notification => {
      useAppStore.getState().ui.removeNotification(notification.id);
    });
  }
);

export default useAppStore;
