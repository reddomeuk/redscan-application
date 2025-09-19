/**
 * Authentication Store - TypeScript Version
 * Secure authentication state management with session handling
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { SecureTokenManager } from '@/components/common/SecureAuthManager';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
  lastLogin?: string;
  isActive: boolean;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: NotificationSettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  security: boolean;
  reports: boolean;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresAt: number;
  scope?: string;
}

export interface Session {
  id: string;
  userId: string;
  createdAt: string;
  lastActivity: string;
  ipAddress: string;
  userAgent: string;
  deviceId?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
  deviceId?: string;
}

export interface LoginResponse {
  success: boolean;
  user: User;
  tokens: Tokens;
  permissions: string[];
  session: Session;
}

export interface AuthError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

// ============================================================================
// AUTH STORE STATE INTERFACE
// ============================================================================

interface AuthState {
  // State
  isAuthenticated: boolean;
  user: User | null;
  permissions: string[];
  session: Session | null;
  tokens: Tokens | null;
  loading: boolean;
  error: AuthError | null;
  lastActivity: number;
  sessionTimeout: number;
  
  // Token manager instance
  tokenManager: SecureTokenManager;

  // Actions
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; user: User }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<Tokens>;
  updateActivity: () => void;
  checkSession: () => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissionsList: string[]) => boolean;
  setError: (error: string | AuthError) => void;
  clearError: () => void;
  initialize: () => Promise<void>;
}

// ============================================================================
// AUTH STORE IMPLEMENTATION
// ============================================================================

export const useAuthStore = create<AuthState>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Initial State
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
        login: async (credentials: LoginCredentials): Promise<{ success: boolean; user: User }> => {
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
              body: JSON.stringify(credentials),
              credentials: 'same-origin'
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.message || `Authentication failed: ${response.statusText}`);
            }

            const data: LoginResponse = await response.json();
            const { user, tokens, permissions, session } = data;

            // Validate response data
            if (!user?.id || !tokens?.accessToken) {
              throw new Error('Invalid authentication response');
            }

            // Store tokens securely
            const tokenManager = get().tokenManager;
            await tokenManager.storeTokens(tokens);

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
            const authError: AuthError = {
              code: 'LOGIN_FAILED',
              message: error instanceof Error ? error.message : 'Login failed',
              timestamp: new Date().toISOString()
            };

            set((state) => {
              state.loading = false;
              state.error = authError;
              state.isAuthenticated = false;
            });
            
            throw error;
          }
        },

        logout: async (): Promise<void> => {
          try {
            // Call logout endpoint
            const tokens = get().tokens;
            if (tokens?.accessToken) {
              await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${tokens.accessToken}`,
                  'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin'
              });
            }
          } catch (error) {
            console.warn('Logout API call failed:', error);
          } finally {
            // Clear state regardless of API success
            const tokenManager = get().tokenManager;
            await tokenManager.clearTokens();

            set((state) => {
              state.isAuthenticated = false;
              state.user = null;
              state.permissions = [];
              state.session = null;
              state.tokens = null;
              state.error = null;
              state.lastActivity = Date.now();
              state.loading = false;
            });
          }
        },

        refreshToken: async (): Promise<Tokens> => {
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
              body: JSON.stringify({ refreshToken: tokens.refreshToken }),
              credentials: 'same-origin'
            });

            if (!response.ok) {
              throw new Error('Token refresh failed');
            }

            const data = await response.json();
            const newTokens: Tokens = data.tokens;

            if (!newTokens?.accessToken) {
              throw new Error('Invalid token refresh response');
            }

            // Store new tokens
            const tokenManager = get().tokenManager;
            await tokenManager.storeTokens(newTokens);

            set((state) => {
              state.tokens = newTokens;
              state.lastActivity = Date.now();
              state.error = null;
            });

            return newTokens;

          } catch (error) {
            // If refresh fails, logout user
            await get().logout();
            throw error;
          }
        },

        updateActivity: (): void => {
          set((state) => {
            state.lastActivity = Date.now();
          });
        },

        checkSession: (): boolean => {
          const { lastActivity, sessionTimeout, isAuthenticated } = get();
          const now = Date.now();
          
          if (isAuthenticated && (now - lastActivity) > sessionTimeout) {
            get().logout();
            return false;
          }
          
          return isAuthenticated;
        },

        hasPermission: (permission: string): boolean => {
          const { permissions } = get();
          return permissions.includes(permission) || permissions.includes('admin');
        },

        hasAnyPermission: (permissionsList: string[]): boolean => {
          const { permissions } = get();
          return permissionsList.some(p => permissions.includes(p)) || permissions.includes('admin');
        },

        setError: (error: string | AuthError): void => {
          set((state) => {
            if (typeof error === 'string') {
              state.error = {
                code: 'GENERIC_ERROR',
                message: error,
                timestamp: new Date().toISOString()
              };
            } else {
              state.error = error;
            }
            state.loading = false;
          });
        },

        clearError: (): void => {
          set((state) => {
            state.error = null;
          });
        },

        // Initialize from stored tokens on app start
        initialize: async (): Promise<void> => {
          try {
            const tokenManager = get().tokenManager;
            const storedTokens = await tokenManager.getStoredTokens();
            
            if (storedTokens?.accessToken) {
              // Verify token is still valid
              const response = await fetch('/api/auth/verify', {
                headers: {
                  'Authorization': `Bearer ${storedTokens.accessToken}`,
                  'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin'
              });

              if (response.ok) {
                const userData = await response.json();
                
                // Validate response data
                if (userData.user?.id) {
                  set((state) => {
                    state.isAuthenticated = true;
                    state.user = userData.user;
                    state.permissions = userData.permissions || [];
                    state.session = userData.session;
                    state.tokens = storedTokens;
                    state.lastActivity = Date.now();
                  });
                } else {
                  throw new Error('Invalid user data from verification');
                }
              } else {
                // Token invalid, clear it
                await tokenManager.clearTokens();
              }
            }
          } catch (error) {
            console.warn('Failed to initialize auth from stored tokens:', error);
            const tokenManager = get().tokenManager;
            await tokenManager.clearTokens();
            
            set((state) => {
              state.error = {
                code: 'INITIALIZATION_FAILED',
                message: 'Failed to restore session',
                timestamp: new Date().toISOString()
              };
            });
          }
        }
      }))
    ),
    { name: 'Auth Store' }
  )
);

// ============================================================================
// TYPED SELECTORS
// ============================================================================

export const useAuthState = (): Pick<AuthState, 'isAuthenticated' | 'user' | 'loading' | 'error'> => 
  useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    loading: state.loading,
    error: state.error
  }));

export const useUser = (): User | null => useAuthStore((state) => state.user);

export const useIsAuthenticated = (): boolean => useAuthStore((state) => state.isAuthenticated);

export const usePermissions = (): string[] => useAuthStore((state) => state.permissions);

export const useAuthActions = () => useAuthStore((state) => ({
  login: state.login,
  logout: state.logout,
  refreshToken: state.refreshToken,
  hasPermission: state.hasPermission,
  hasAnyPermission: state.hasAnyPermission,
  clearError: state.clearError
}));

// ============================================================================
// PERMISSION CONSTANTS
// ============================================================================

export const PERMISSIONS = {
  // User management
  USER_READ: 'user:read',
  USER_WRITE: 'user:write',
  USER_DELETE: 'user:delete',
  
  // Asset management
  ASSET_READ: 'asset:read',
  ASSET_WRITE: 'asset:write',
  ASSET_DELETE: 'asset:delete',
  ASSET_SCAN: 'asset:scan',
  
  // Finding management
  FINDING_READ: 'finding:read',
  FINDING_WRITE: 'finding:write',
  FINDING_RESOLVE: 'finding:resolve',
  
  // Cloud integration
  CLOUD_CONNECT: 'cloud:connect',
  CLOUD_SCAN: 'cloud:scan',
  CLOUD_MANAGE: 'cloud:manage',
  
  // Compliance
  COMPLIANCE_READ: 'compliance:read',
  COMPLIANCE_GENERATE: 'compliance:generate',
  
  // Administration
  ADMIN_USERS: 'admin:users',
  ADMIN_SETTINGS: 'admin:settings',
  ADMIN_AUDIT: 'admin:audit',
  
  // Super admin
  ADMIN: 'admin'
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// ============================================================================
// SESSION ACTIVITY MONITORING
// ============================================================================

let activityTimer: NodeJS.Timeout | null = null;

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

// ============================================================================
// AUTO TOKEN REFRESH
// ============================================================================

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
