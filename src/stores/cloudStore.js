/**
 * Cloud Integration Store
 * Secure state management for cloud provider connections and scans
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { cloudAuthManager, CLOUD_PROVIDERS } from '@/services/CloudAuthManager';
import { CloudSecurityScanner } from '@/services/CloudSecurityScanner';

export const useCloudStore = create()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // State
        connections: new Map(),
        providers: new Map(Object.entries(CLOUD_PROVIDERS)),
        activeScans: new Map(),
        scanHistory: [],
        scanResults: new Map(),
        loading: new Map(),
        errors: new Map(),
        
        // Security scanner instance
        scanner: new CloudSecurityScanner(),

        // Connection Management
        connectProvider: async (provider, config = {}) => {
          const loadingKey = `connect_${provider}`;
          
          set((state) => {
            state.loading.set(loadingKey, true);
            state.errors.delete(provider);
          });

          try {
            const connection = await cloudAuthManager.initiateOAuth(provider, config);
            
            set((state) => {
              state.connections.set(provider, {
                ...connection,
                connectedAt: new Date().toISOString(),
                status: 'connected',
                config
              });
              state.loading.delete(loadingKey);
            });

            return connection;

          } catch (error) {
            set((state) => {
              state.errors.set(provider, error.message);
              state.loading.delete(loadingKey);
            });
            throw error;
          }
        },

        disconnectProvider: async (provider) => {
          try {
            await cloudAuthManager.revokeConnection(provider);
            
            set((state) => {
              state.connections.delete(provider);
              state.errors.delete(provider);
              
              // Clean up any active scans for this provider
              const scansToRemove = [];
              state.activeScans.forEach((scan, scanId) => {
                if (scan.provider === provider) {
                  scansToRemove.push(scanId);
                }
              });
              scansToRemove.forEach(scanId => {
                state.activeScans.delete(scanId);
              });
            });

          } catch (error) {
            set((state) => {
              state.errors.set(provider, error.message);
            });
            throw error;
          }
        },

        refreshConnection: async (provider) => {
          const connection = get().connections.get(provider);
          if (!connection) {
            throw new Error(`No connection found for provider: ${provider}`);
          }

          const loadingKey = `refresh_${provider}`;
          
          set((state) => {
            state.loading.set(loadingKey, true);
            state.errors.delete(provider);
          });

          try {
            const refreshedConnection = await cloudAuthManager.refreshToken(provider);
            
            set((state) => {
              state.connections.set(provider, {
                ...connection,
                ...refreshedConnection,
                lastRefreshed: new Date().toISOString()
              });
              state.loading.delete(loadingKey);
            });

            return refreshedConnection;

          } catch (error) {
            set((state) => {
              state.errors.set(provider, error.message);
              state.loading.delete(loadingKey);
            });
            throw error;
          }
        },

        updateConnectionStatus: (provider, status, metadata = {}) => {
          set((state) => {
            const connection = state.connections.get(provider);
            if (connection) {
              state.connections.set(provider, {
                ...connection,
                status,
                ...metadata,
                lastUpdated: new Date().toISOString()
              });
            }
          });
        },

        // Scanning Operations
        startScan: async (provider, scanConfig) => {
          const connection = get().connections.get(provider);
          if (!connection) {
            throw new Error(`No connection found for provider: ${provider}`);
          }

          const scanId = `scan_${provider}_${Date.now()}`;
          const loadingKey = `scan_${scanId}`;

          set((state) => {
            state.loading.set(loadingKey, true);
            state.activeScans.set(scanId, {
              id: scanId,
              provider,
              config: scanConfig,
              status: 'starting',
              startTime: new Date().toISOString(),
              progress: 0,
              findings: []
            });
          });

          try {
            const scanner = get().scanner;
            const scanResult = await scanner.scanProvider(provider, connection, scanConfig);
            
            set((state) => {
              state.activeScans.set(scanId, {
                ...state.activeScans.get(scanId),
                status: 'running',
                progress: 10,
                scanResult
              });
              state.loading.delete(loadingKey);
            });

            // Start monitoring scan progress
            get().monitorScan(scanId);

            return scanId;

          } catch (error) {
            set((state) => {
              state.activeScans.set(scanId, {
                ...state.activeScans.get(scanId),
                status: 'failed',
                error: error.message,
                endTime: new Date().toISOString()
              });
              state.loading.delete(loadingKey);
            });
            throw error;
          }
        },

        monitorScan: async (scanId) => {
          const scan = get().activeScans.get(scanId);
          if (!scan || scan.status === 'completed' || scan.status === 'failed') {
            return;
          }

          try {
            const scanner = get().scanner;
            const progress = await scanner.getScanProgress(scanId);
            
            set((state) => {
              const currentScan = state.activeScans.get(scanId);
              if (currentScan) {
                state.activeScans.set(scanId, {
                  ...currentScan,
                  progress: progress.percentage,
                  findings: progress.findings || currentScan.findings,
                  status: progress.status || currentScan.status
                });
              }
            });

            // Continue monitoring if not completed
            if (progress.status === 'running') {
              setTimeout(() => get().monitorScan(scanId), 5000);
            } else if (progress.status === 'completed') {
              get().completeScan(scanId, progress);
            }

          } catch (error) {
            set((state) => {
              const currentScan = state.activeScans.get(scanId);
              if (currentScan) {
                state.activeScans.set(scanId, {
                  ...currentScan,
                  status: 'failed',
                  error: error.message,
                  endTime: new Date().toISOString()
                });
              }
            });
          }
        },

        completeScan: (scanId, finalResults) => {
          set((state) => {
            const scan = state.activeScans.get(scanId);
            if (scan) {
              const completedScan = {
                ...scan,
                status: 'completed',
                progress: 100,
                endTime: new Date().toISOString(),
                results: finalResults,
                findings: finalResults.findings || scan.findings
              };

              // Move to scan history
              state.scanHistory.unshift(completedScan);
              
              // Keep only last 100 scans in history
              if (state.scanHistory.length > 100) {
                state.scanHistory.splice(100);
              }

              // Remove from active scans
              state.activeScans.delete(scanId);

              // Store detailed results
              state.scanResults.set(scanId, finalResults);
            }
          });
        },

        stopScan: async (scanId) => {
          const scan = get().activeScans.get(scanId);
          if (!scan) {
            throw new Error(`Scan not found: ${scanId}`);
          }

          try {
            const scanner = get().scanner;
            await scanner.stopScan(scanId);
            
            set((state) => {
              const currentScan = state.activeScans.get(scanId);
              if (currentScan) {
                state.activeScans.set(scanId, {
                  ...currentScan,
                  status: 'stopped',
                  endTime: new Date().toISOString()
                });
              }
            });

          } catch (error) {
            set((state) => {
              const currentScan = state.activeScans.get(scanId);
              if (currentScan) {
                state.activeScans.set(scanId, {
                  ...currentScan,
                  error: error.message
                });
              }
            });
            throw error;
          }
        },

        // Data Management
        getScanResults: (scanId) => {
          return get().scanResults.get(scanId);
        },

        getProviderConnections: () => {
          return Array.from(get().connections.entries()).map(([provider, connection]) => ({
            provider,
            ...connection
          }));
        },

        getActiveScansForProvider: (provider) => {
          const scans = [];
          get().activeScans.forEach((scan, scanId) => {
            if (scan.provider === provider) {
              scans.push(scan);
            }
          });
          return scans;
        },

        // Utility Methods
        isProviderConnected: (provider) => {
          const connection = get().connections.get(provider);
          return connection && connection.status === 'connected';
        },

        getConnectionHealth: (provider) => {
          const connection = get().connections.get(provider);
          if (!connection) return 'disconnected';
          
          const lastActivity = new Date(connection.lastUpdated || connection.connectedAt);
          const now = new Date();
          const hoursSinceActivity = (now - lastActivity) / (1000 * 60 * 60);
          
          if (hoursSinceActivity > 24) return 'stale';
          if (connection.status === 'connected') return 'healthy';
          return connection.status;
        },

        clearError: (provider) => {
          set((state) => {
            state.errors.delete(provider);
          });
        },

        clearAllErrors: () => {
          set((state) => {
            state.errors.clear();
          });
        },

        // Bulk Operations
        disconnectAllProviders: async () => {
          const providers = Array.from(get().connections.keys());
          const results = await Promise.allSettled(
            providers.map(provider => get().disconnectProvider(provider))
          );
          
          return results;
        },

        refreshAllConnections: async () => {
          const providers = Array.from(get().connections.keys());
          const results = await Promise.allSettled(
            providers.map(provider => get().refreshConnection(provider))
          );
          
          return results;
        },

        // Initialize store
        initialize: async () => {
          try {
            // Load any persisted connections
            const savedConnections = await cloudAuthManager.getStoredConnections();
            
            if (savedConnections && savedConnections.size > 0) {
              set((state) => {
                state.connections = new Map(savedConnections);
              });

              // Verify each connection is still valid
              for (const [provider] of savedConnections) {
                try {
                  await get().refreshConnection(provider);
                } catch (error) {
                  console.warn(`Failed to refresh connection for ${provider}:`, error);
                  get().disconnectProvider(provider);
                }
              }
            }
          } catch (error) {
            console.warn('Failed to initialize cloud store:', error);
          }
        }
      }))
    ),
    { name: 'Cloud Store' }
  )
);

// Auto-refresh connections periodically
setInterval(() => {
  const store = useCloudStore.getState();
  if (store.connections.size > 0) {
    store.refreshAllConnections().catch(error => {
      console.warn('Periodic connection refresh failed:', error);
    });
  }
}, 30 * 60 * 1000); // Every 30 minutes

export default useCloudStore;
