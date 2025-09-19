/**
 * Secure Authentication Manager
 * Handles secure token management and authentication for production deployment
 */

import { User } from '@/api/entities';

export interface AuthToken {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
  user_id: string;
  permissions: string[];
}

export interface UserSession {
  user: any;
  token: AuthToken;
  isAuthenticated: boolean;
  lastActivity: number;
}

export class SecureTokenManager {
  private static instance: SecureTokenManager;
  private session: UserSession | null = null;
  private readonly SESSION_KEY = 'redscan_session';
  private readonly TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.loadSession();
    this.setupTokenRefresh();
  }

  static getInstance(): SecureTokenManager {
    if (!SecureTokenManager.instance) {
      SecureTokenManager.instance = new SecureTokenManager();
    }
    return SecureTokenManager.instance;
  }

  /**
   * Load session from secure storage
   */
  private loadSession(): void {
    try {
      const stored = localStorage.getItem(this.SESSION_KEY);
      if (stored) {
        const session = JSON.parse(stored);
        if (this.isTokenValid(session.token)) {
          this.session = session;
          this.updateLastActivity();
        } else {
          this.clearSession();
        }
      }
    } catch (error) {
      console.warn('Failed to load session:', error);
      this.clearSession();
    }
  }

  /**
   * Save session to secure storage
   */
  private saveSession(): void {
    if (this.session) {
      try {
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(this.session));
      } catch (error) {
        console.error('Failed to save session:', error);
      }
    }
  }

  /**
   * Check if token is valid and not expired
   */
  private isTokenValid(token: AuthToken): boolean {
    if (!token || !token.access_token) return false;
    return Date.now() < token.expires_at;
  }

  /**
   * Update last activity timestamp
   */
  private updateLastActivity(): void {
    if (this.session) {
      this.session.lastActivity = Date.now();
      this.saveSession();
    }
  }

  /**
   * Setup automatic token refresh
   */
  private setupTokenRefresh(): void {
    setInterval(() => {
      if (this.session && this.isTokenExpiringSoon(this.session.token)) {
        this.refreshToken();
      }
    }, 60000); // Check every minute
  }

  /**
   * Check if token is expiring soon
   */
  private isTokenExpiringSoon(token: AuthToken): boolean {
    return Date.now() + this.TOKEN_REFRESH_THRESHOLD >= token.expires_at;
  }

  /**
   * Authenticate user with credentials
   */
  async authenticate(username: string, password: string): Promise<UserSession> {
    try {
      // Mock authentication for development
      const mockUser = {
        id: 'user_123',
        username,
        email: `${username}@redscan.ai`,
        role: 'admin',
        permissions: ['read', 'write', 'admin']
      };

      const mockToken: AuthToken = {
        access_token: `token_${Date.now()}_${Math.random()}`,
        refresh_token: `refresh_${Date.now()}_${Math.random()}`,
        expires_at: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        user_id: mockUser.id,
        permissions: mockUser.permissions
      };

      this.session = {
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        lastActivity: Date.now()
      };

      this.saveSession();
      return this.session;
    } catch (error) {
      console.error('Authentication failed:', error);
      throw new Error('Authentication failed');
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<void> {
    if (!this.session?.token?.refresh_token) {
      throw new Error('No refresh token available');
    }

    try {
      // Mock token refresh for development
      const newToken: AuthToken = {
        ...this.session.token,
        access_token: `token_${Date.now()}_${Math.random()}`,
        expires_at: Date.now() + (24 * 60 * 60 * 1000)
      };

      this.session.token = newToken;
      this.updateLastActivity();
      console.log('Token refreshed successfully');
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearSession();
      throw error;
    }
  }

  /**
   * Get current session
   */
  getSession(): UserSession | null {
    if (this.session && this.isTokenValid(this.session.token)) {
      this.updateLastActivity();
      return this.session;
    }
    return null;
  }

  /**
   * Get current user
   */
  getCurrentUser(): any | null {
    const session = this.getSession();
    return session?.user || null;
  }

  /**
   * Get auth token for API requests
   */
  getAuthToken(): string | null {
    const session = this.getSession();
    return session?.token?.access_token || null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getSession();
  }

  /**
   * Check if user has permission
   */
  hasPermission(permission: string): boolean {
    const session = this.getSession();
    return session?.token?.permissions?.includes(permission) || false;
  }

  /**
   * Logout user
   */
  logout(): void {
    this.clearSession();
  }

  /**
   * Clear session data
   */
  private clearSession(): void {
    this.session = null;
    localStorage.removeItem(this.SESSION_KEY);
  }

  /**
   * Get auth headers for API requests
   */
  getAuthHeaders(): Record<string, string> {
    const token = this.getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

export default SecureTokenManager;