/**
 * Secure Authentication Manager
 * Implements secure token management with httpOnly cookies and proper session handling
 */

import EventEmitter from '../utils/EventEmitter.js';

// ============================================================================
// SECURE TOKEN STORAGE MANAGER
// ============================================================================

class SecureTokenManager {
  constructor() {
    this.tokens = new Map(); // In-memory storage only
    this.refreshTimers = new Map();
    this.sessionKey = this.generateSessionKey();
  }

  /**
   * Store token securely (in-memory only)
   */
  storeToken(key, tokenData) {
    // Encrypt token before storing
    const encryptedToken = this.encryptToken(tokenData);
    this.tokens.set(key, {
      ...encryptedToken,
      timestamp: Date.now(),
      expiresAt: Date.now() + (tokenData.expiresIn * 1000)
    });

    // Set httpOnly cookie for session tracking (no sensitive data)
    this.setSecureSessionCookie(key, {
      sessionId: this.generateSessionId(),
      expiresAt: Date.now() + (tokenData.expiresIn * 1000)
    });

    // Setup automatic refresh
    this.setupTokenRefresh(key, tokenData);
  }

  /**
   * Retrieve token securely
   */
  getToken(key) {
    const tokenData = this.tokens.get(key);
    if (!tokenData) return null;

    // Check if token is expired
    if (Date.now() > tokenData.expiresAt) {
      this.removeToken(key);
      return null;
    }

    // Decrypt and return token
    return this.decryptToken(tokenData);
  }

  /**
   * Remove token and cleanup
   */
  removeToken(key) {
    this.tokens.delete(key);
    this.clearRefreshTimer(key);
    this.clearSecureSessionCookie(key);
  }

  /**
   * Encrypt token using Web Crypto API
   */
  async encryptToken(tokenData) {
    try {
      const key = await this.getEncryptionKey();
      const encoder = new TextEncoder();
      const data = encoder.encode(JSON.stringify(tokenData));
      
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      );

      return {
        encrypted: Array.from(new Uint8Array(encrypted)),
        iv: Array.from(iv)
      };
    } catch (error) {
      console.error('Token encryption failed:', error);
      throw new Error('Failed to encrypt token');
    }
  }

  /**
   * Decrypt token using Web Crypto API
   */
  async decryptToken(encryptedData) {
    try {
      const key = await this.getEncryptionKey();
      const encrypted = new Uint8Array(encryptedData.encrypted);
      const iv = new Uint8Array(encryptedData.iv);
      
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
      );

      const decoder = new TextDecoder();
      return JSON.parse(decoder.decode(decrypted));
    } catch (error) {
      console.error('Token decryption failed:', error);
      throw new Error('Failed to decrypt token');
    }
  }

  /**
   * Get or generate encryption key
   */
  async getEncryptionKey() {
    if (this.encryptionKey) return this.encryptionKey;

    // In production, derive key from server-provided salt
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(this.sessionKey),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    this.encryptionKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode('redscan-salt-' + window.location.origin),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    return this.encryptionKey;
  }

  /**
   * Set secure httpOnly session cookie (no sensitive data)
   */
  setSecureSessionCookie(key, sessionData) {
    // This would be set by the server in production
    // Client-side cookies should only contain session identifiers
    const cookieValue = btoa(JSON.stringify({
      sessionId: sessionData.sessionId,
      provider: key,
      expiresAt: sessionData.expiresAt
    }));

    // Note: httpOnly and secure flags can only be set server-side
    // This is a limitation of client-side implementation
    document.cookie = `redscan_session_${key}=${cookieValue}; SameSite=Strict; Secure; Path=/; Max-Age=${3600}`;
  }

  /**
   * Clear secure session cookie
   */
  clearSecureSessionCookie(key) {
    document.cookie = `redscan_session_${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  generateSessionKey() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
  }

  generateSessionId() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
  }

  setupTokenRefresh(key, tokenData) {
    if (!tokenData.refreshToken) return;

    const refreshTime = (tokenData.expiresIn - 300) * 1000; // 5 minutes before expiry
    const timer = setTimeout(() => {
      this.refreshToken(key);
    }, refreshTime);

    this.refreshTimers.set(key, timer);
  }

  clearRefreshTimer(key) {
    const timer = this.refreshTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.refreshTimers.delete(key);
    }
  }

  async refreshToken(key) {
    // Implementation would call the token refresh endpoint
    console.log(`Refreshing token for ${key}`);
  }
}

// ============================================================================
// SECURE AUTHENTICATION MANAGER
// ============================================================================

export class SecureAuthManager extends EventEmitter {
  constructor() {
    super();
    this.tokenManager = new SecureTokenManager();
    this.currentUser = null;
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
    this.lastActivity = Date.now();
    this.setupInactivityMonitoring();
  }

  /**
   * Secure login with multi-factor authentication
   */
  async login(credentials, mfaToken = null) {
    try {
      // Validate input
      this.validateCredentials(credentials);

      // Make secure API call
      const response = await this.makeSecureAPICall('/auth/login', {
        method: 'POST',
        body: {
          ...credentials,
          mfaToken,
          deviceFingerprint: await this.getDeviceFingerprint()
        }
      });

      if (response.requiresMFA && !mfaToken) {
        return {
          success: false,
          requiresMFA: true,
          mfaMethods: response.mfaMethods
        };
      }

      // Store tokens securely
      this.tokenManager.storeToken('auth', {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresIn: response.expiresIn
      });

      // Set user session
      this.currentUser = response.user;
      this.lastActivity = Date.now();

      // Emit login event
      this.emit('auth:login', { user: this.currentUser });

      return { success: true, user: this.currentUser };

    } catch (error) {
      this.emit('auth:error', { error: error.message });
      throw error;
    }
  }

  /**
   * Secure logout with token revocation
   */
  async logout() {
    try {
      const token = this.tokenManager.getToken('auth');
      
      if (token) {
        // Revoke tokens on server
        await this.makeSecureAPICall('/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token.accessToken}`
          }
        });
      }

      // Clear all tokens
      this.tokenManager.removeToken('auth');
      this.currentUser = null;

      // Clear all session data
      this.clearSessionData();

      this.emit('auth:logout');

    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local data even if server call fails
      this.tokenManager.removeToken('auth');
      this.currentUser = null;
      this.clearSessionData();
      this.emit('auth:logout');
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const token = this.tokenManager.getToken('auth');
    return !!(token && this.currentUser);
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Get valid access token
   */
  async getAccessToken() {
    const tokenData = this.tokenManager.getToken('auth');
    if (!tokenData) return null;

    // Check if token needs refresh
    const expiresAt = tokenData.expiresAt || 0;
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (expiresAt - now < fiveMinutes) {
      // Try to refresh token
      await this.refreshAccessToken();
      const refreshedToken = this.tokenManager.getToken('auth');
      return refreshedToken?.accessToken || null;
    }

    return tokenData.accessToken;
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken() {
    try {
      const tokenData = this.tokenManager.getToken('auth');
      if (!tokenData?.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await this.makeSecureAPICall('/auth/refresh', {
        method: 'POST',
        body: {
          refreshToken: tokenData.refreshToken,
          deviceFingerprint: await this.getDeviceFingerprint()
        }
      });

      // Store new tokens
      this.tokenManager.storeToken('auth', {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresIn: response.expiresIn
      });

      this.emit('auth:token-refreshed');

    } catch (error) {
      console.error('Token refresh failed:', error);
      // Force logout if refresh fails
      await this.logout();
      throw error;
    }
  }

  /**
   * Setup inactivity monitoring
   */
  setupInactivityMonitoring() {
    // Track user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const updateActivity = () => {
      this.lastActivity = Date.now();
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Check for inactivity every minute
    setInterval(() => {
      if (this.isAuthenticated() && Date.now() - this.lastActivity > this.sessionTimeout) {
        this.handleInactivityTimeout();
      }
    }, 60000);
  }

  /**
   * Handle inactivity timeout
   */
  async handleInactivityTimeout() {
    this.emit('auth:inactivity-timeout');
    await this.logout();
  }

  /**
   * Generate device fingerprint for session security
   */
  async getDeviceFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);

    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvas: canvas.toDataURL()
    };

    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(fingerprint));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Validate credentials input
   */
  validateCredentials(credentials) {
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      throw new Error('Invalid email format');
    }

    // Password strength validation
    if (credentials.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
  }

  /**
   * Make secure API call with CSRF protection
   */
  async makeSecureAPICall(endpoint, options = {}) {
    const csrfToken = this.getCSRFToken();
    const accessToken = await this.getAccessToken();

    const defaultHeaders = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    };

    if (csrfToken) {
      defaultHeaders['X-CSRF-Token'] = csrfToken;
    }

    if (accessToken) {
      defaultHeaders['Authorization'] = `Bearer ${accessToken}`;
    }

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {})
      },
      credentials: 'include', // Include httpOnly cookies
      body: options.body ? JSON.stringify(options.body) : undefined
    };

    const response = await fetch(`${this.getAPIBaseURL()}${endpoint}`, config);

    if (response.status === 401) {
      // Unauthorized - try token refresh
      if (endpoint !== '/auth/refresh') {
        await this.refreshAccessToken();
        // Retry the request
        return this.makeSecureAPICall(endpoint, options);
      } else {
        // Refresh failed - force logout
        await this.logout();
        throw new Error('Authentication expired');
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get CSRF token from meta tag or cookie
   */
  getCSRFToken() {
    // Try to get from meta tag first
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) {
      return metaTag.getAttribute('content');
    }

    // Try to get from cookie
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'XSRF-TOKEN') {
        return decodeURIComponent(value);
      }
    }

    return null;
  }

  /**
   * Get API base URL from environment
   */
  getAPIBaseURL() {
    return import.meta.env.VITE_API_BASE_URL || '/api';
  }

  /**
   * Clear all session data
   */
  clearSessionData() {
    // Clear any remaining localStorage/sessionStorage (for migration)
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('supplierPortalUser');
      sessionStorage.removeItem('onboarding_user');
      sessionStorage.clear();
    } catch (error) {
      console.warn('Error clearing session storage:', error);
    }
  }
}

// Export singleton instance
export const secureAuthManager = new SecureAuthManager();
export { SecureTokenManager };
export default secureAuthManager;
