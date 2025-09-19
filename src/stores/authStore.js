/**
 * Authentication Store
 * Secure authentication state management with session handling
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { SecureTokenManager } from '../services/SecureAuthManager';

export const useAuthStore = create()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // State
        isAuthenticated: false,
        user: null,
        permissions: [],
        session: null,
        tokens: null,
        loading: false,
        error: null,
        lastActivity: Date.now(),
        sessionTimeout: 30 * 60 * 1000, // 30 minutes
        
        // Token manager instance
        tokenManager: new SecureTokenManager(),

        // Actions
        login: async (credentials) => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            // Authenticate with backend
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
              },
              body: JSON.stringify(credentials)
            });

            if (!response.ok) {
              throw new Error(`Authentication failed: ${response.statusText}`);
            }

            const data = await response.json();
            const { user, tokens, permissions, session } = data;

            // Store tokens securely
            const tokenManager = get().tokenManager;
            tokenManager.storeToken('auth', {
              accessToken: tokens.accessToken,
              refreshToken: tokens.refreshToken,
              expiresIn: tokens.expiresIn || 3600
            });

            set((state) => {
              state.isAuthenticated = true;
              state.user = user;
              state.permissions = permissions || [];
              state.session = session;
              state.tokens = tokens;
              state.lastActivity = Date.now();
              state.loading = false;
              state.error = null;
            });

            return { success: true, user };

          } catch (error) {
            set((state) => {
              state.loading = false;
              state.error = error.message;
              state.isAuthenticated = false;
            });
            throw error;
          }
        },

        logout: async () => {
          try {
            // Call logout endpoint
            const tokens = get().tokens;
            if (tokens?.accessToken) {
              await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${tokens.accessToken}`,
                  'X-Requested-With': 'XMLHttpRequest'
                }
              });
            }
          } catch (error) {
            console.warn('Logout API call failed:', error);
          } finally {
            // Clear state regardless of API success
            const tokenManager = get().tokenManager;
            tokenManager.removeToken('auth');

            set((state) => {
              state.isAuthenticated = false;
              state.user = null;
              state.permissions = [];
              state.session = null;
              state.tokens = null;
              state.error = null;
              state.lastActivity = Date.now();
            });
          }
        },

        refreshToken: async () => {
          try {
            const tokens = get().tokens;
            if (!tokens?.refreshToken) {
              throw new Error('No refresh token available');
            }

            const response = await fetch('/api/auth/refresh', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
              },
              body: JSON.stringify({ refreshToken: tokens.refreshToken })
            });

            if (!response.ok) {
              throw new Error('Token refresh failed');
            }

            const data = await response.json();
            const { tokens: newTokens } = data;

            // Store new tokens
            const tokenManager = get().tokenManager;
            tokenManager.storeToken('auth', {
              accessToken: newTokens.accessToken,
              refreshToken: newTokens.refreshToken,
              expiresIn: newTokens.expiresIn || 3600
            });

            set((state) => {
              state.tokens = newTokens;
              state.lastActivity = Date.now();
              state.error = null;
            });

            return newTokens;

          } catch (error) {
            // If refresh fails, logout user
            get().logout();
            throw error;
          }
        },

        updateActivity: () => {
          set((state) => {
            state.lastActivity = Date.now();
          });
        },

        checkSession: () => {
          const { lastActivity, sessionTimeout, isAuthenticated } = get();
          const now = Date.now();
          
          if (isAuthenticated && (now - lastActivity) > sessionTimeout) {
            get().logout();
            return false;
          }
          
          return isAuthenticated;
        },

        hasPermission: (permission) => {
          const { permissions } = get();
          return permissions.includes(permission) || permissions.includes('admin');
        },

        hasAnyPermission: (permissionsList) => {
          const { permissions } = get();
          return permissionsList.some(p => permissions.includes(p)) || permissions.includes('admin');
        },

        setError: (error) => {
          set((state) => {
            state.error = error;
            state.loading = false;
          });
        },

        clearError: () => {
          set((state) => {
            state.error = null;
          });
        },

        // Initialize from stored tokens on app start
        initialize: async () => {
          try {
            const tokenManager = get().tokenManager;
            const storedTokens = tokenManager.getToken('auth'); // Changed from getStoredTokens
            
            if (storedTokens?.accessToken) {
              // Verify token is still valid
              const response = await fetch('/api/auth/verify', {
                headers: {
                  'Authorization': `Bearer ${storedTokens.accessToken}`,
                  'X-Requested-With': 'XMLHttpRequest'
                }
              });

              if (response.ok) {
                const userData = await response.json();
                
                set((state) => {
                  state.isAuthenticated = true;
                  state.user = userData.user;
                  state.permissions = userData.permissions || [];
                  state.session = userData.session;
                  state.tokens = storedTokens;
                  state.lastActivity = Date.now();
                });
              } else {
                // Token invalid, clear it
                tokenManager.removeToken('auth'); // Changed from clearTokens
              }
            }
          } catch (error) {
            console.warn('Failed to initialize auth from stored tokens:', error);
            const tokenManager = get().tokenManager;
            tokenManager.removeToken('auth'); // Changed from clearTokens
          }
        }
      }))
    ),
    { name: 'Auth Store' }
  )
);

// Session activity monitoring
let activityTimer;

useAuthStore.subscribe(
  (state) => state.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      // Start session monitoring
      activityTimer = setInterval(() => {
        useAuthStore.getState().checkSession();
      }, 60000); // Check every minute
    } else {
      // Clear session monitoring
      if (activityTimer) {
        clearInterval(activityTimer);
        activityTimer = null;
      }
    }
  }
);

// Auto token refresh
useAuthStore.subscribe(
  (state) => state.tokens,
  (tokens) => {
    if (tokens?.accessToken) {
      // Schedule token refresh before expiry
      const expiryTime = tokens.expiresAt || (Date.now() + 55 * 60 * 1000); // 55 minutes default
      const refreshTime = expiryTime - (5 * 60 * 1000); // Refresh 5 minutes before expiry
      
      const timeUntilRefresh = refreshTime - Date.now();
      
      if (timeUntilRefresh > 0) {
        setTimeout(async () => {
          try {
            await useAuthStore.getState().refreshToken();
          } catch (error) {
            console.warn('Automatic token refresh failed:', error);
          }
        }, timeUntilRefresh);
      }
    }
  }
);

export default useAuthStore;
