// Cloud Integration Architecture for RedScan Platform
// Comprehensive OAuth 2.0/OpenID Connect implementation for multi-cloud consent-based authentication

/**
 * ===================================
 * CONSENT-BASED CLOUD INTEGRATION
 * ===================================
 * 
 * This architecture implements secure, consent-based authentication and authorization
 * for cloud service providers using OAuth 2.0, OpenID Connect, and provider-specific
 * authentication mechanisms.
 */

import EventEmitter from '../utils/EventEmitter.js';

// ============================================================================
// 1. CLOUD PROVIDER CONFIGURATIONS
// ============================================================================

export const CLOUD_PROVIDERS = {
  AZURE: {
    id: 'azure',
    name: 'Microsoft Azure',
    authUrl: 'https://login.microsoftonline.com',
    apiUrl: 'https://graph.microsoft.com',
    scopes: {
      // Identity and Directory scopes
      identity: [
        'openid',
        'profile',
        'email',
        'User.Read',
        'Directory.Read.All',
        'Organization.Read.All'
      ],
      // Security and Compliance scopes
      security: [
        'SecurityEvents.Read.All',
        'SecurityActions.Read.All',
        'SecurityIncident.Read.All',
        'ThreatIndicators.Read.All',
        'IdentityRiskEvent.Read.All',
        'IdentityRiskyUser.Read.All'
      ],
      // Cloud Infrastructure scopes
      infrastructure: [
        'https://management.azure.com/user_impersonation',
        'CloudPC.Read.All',
        'DeviceManagementConfiguration.Read.All',
        'DeviceManagementManagedDevices.Read.All'
      ],
      // Office 365 Security scopes
      office365: [
        'Mail.Read',
        'Calendars.Read',
        'Sites.Read.All',
        'Files.Read.All',
        'SecurityEvents.Read.All',
        'ThreatAssessment.Request',
        'InformationProtectionPolicy.Read'
      ]
    },
    endpoints: {
      token: '/{tenantId}/oauth2/v2.0/token',
      authorize: '/{tenantId}/oauth2/v2.0/authorize',
      jwks: '/{tenantId}/discovery/v2.0/keys',
      userInfo: '/v1.0/me',
      resources: '/v1.0/subscriptions',
      securityCenter: '/v1.0/security'
    }
  },

  AWS: {
    id: 'aws',
    name: 'Amazon Web Services',
    authUrl: 'https://signin.aws.amazon.com',
    apiUrl: 'https://sts.amazonaws.com',
    scopes: {
      // AWS doesn't use OAuth scopes but IAM policies
      // These represent the equivalent permissions needed
      security: [
        'security-audit',  // ReadOnly access to security services
        'config:Describe*',
        'cloudtrail:Describe*',
        'cloudtrail:Get*',
        'cloudtrail:List*',
        'guardduty:Get*',
        'guardduty:List*',
        'inspector:Describe*',
        'inspector:List*',
        'securityhub:Get*',
        'securityhub:List*',
        'access-analyzer:Get*',
        'access-analyzer:List*'
      ],
      infrastructure: [
        'ec2:Describe*',
        's3:GetBucket*',
        's3:List*',
        'iam:Get*',
        'iam:List*',
        'organizations:Describe*',
        'organizations:List*',
        'cloudformation:Describe*',
        'cloudformation:List*'
      ]
    },
    endpoints: {
      sts: 'https://sts.amazonaws.com',
      organizations: 'https://organizations.amazonaws.com',
      securityHub: 'https://securityhub.{region}.amazonaws.com'
    }
  },

  GOOGLE: {
    id: 'google',
    name: 'Google Cloud Platform',
    authUrl: 'https://accounts.google.com',
    apiUrl: 'https://www.googleapis.com',
    scopes: {
      identity: [
        'openid',
        'email',
        'profile',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ],
      workspace: [
        'https://www.googleapis.com/auth/admin.directory.user.readonly',
        'https://www.googleapis.com/auth/admin.directory.group.readonly',
        'https://www.googleapis.com/auth/admin.directory.orgunit.readonly',
        'https://www.googleapis.com/auth/admin.directory.domain.readonly',
        'https://www.googleapis.com/auth/admin.reports.audit.readonly',
        'https://www.googleapis.com/auth/admin.reports.usage.readonly'
      ],
      cloud: [
        'https://www.googleapis.com/auth/cloud-platform.read-only',
        'https://www.googleapis.com/auth/cloudkms.readonly',
        'https://www.googleapis.com/auth/logging.read',
        'https://www.googleapis.com/auth/monitoring.read'
      ],
      security: [
        'https://www.googleapis.com/auth/cloud-identity.groups.readonly',
        'https://www.googleapis.com/auth/cloud-identity.devices.readonly',
        'https://www.googleapis.com/auth/securitycenter.readonly'
      ]
    },
    endpoints: {
      token: '/oauth2/v4/token',
      authorize: '/o/oauth2/v2/auth',
      userInfo: '/oauth2/v1/userinfo',
      jwks: '/oauth2/v3/certs'
    }
  },

  GITHUB: {
    id: 'github',
    name: 'GitHub',
    authUrl: 'https://github.com',
    apiUrl: 'https://api.github.com',
    scopes: {
      repos: [
        'repo:read',           // Read private repositories
        'repo:security_events', // Read security events
        'security_events'       // Read security advisories
      ],
      organizations: [
        'read:org',            // Read organization membership
        'read:user',           // Read user profile
        'user:email'           // Read user email
      ],
      security: [
        'security_events',     // Access to security log endpoints
        'repo:security_events' // Access to repository security events
      ]
    },
    endpoints: {
      token: '/login/oauth/access_token',
      authorize: '/login/oauth/authorize',
      user: '/user',
      orgs: '/user/orgs',
      repos: '/user/repos'
    }
  }
};

// ============================================================================
// 2. OAUTH 2.0 / OPENID CONNECT MANAGER
// ============================================================================

export class CloudAuthManager extends EventEmitter {
  constructor() {
    super();
    this.connections = new Map();
    this.refreshTimers = new Map();
  }

  /**
   * Initiate OAuth 2.0 Authorization Code Flow with PKCE
   */
  async initiateOAuthFlow(provider, scopes = [], tenantId = null) {
    const config = CLOUD_PROVIDERS[provider.toUpperCase()];
    if (!config) {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    // Generate PKCE parameters for security
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);
    const state = this.generateState();
    const nonce = this.generateNonce();

    // Store PKCE parameters securely (in production, use encrypted storage)
    sessionStorage.setItem(`oauth_${state}`, JSON.stringify({
      provider,
      codeVerifier,
      scopes,
      tenantId,
      timestamp: Date.now()
    }));

    // Build authorization URL
    const authUrl = this.buildAuthorizationUrl(config, {
      scopes,
      state,
      nonce,
      codeChallenge,
      tenantId
    });

    // Open authorization URL in popup or redirect
    return this.openAuthorizationWindow(authUrl, state);
  }

  /**
   * Build provider-specific authorization URL
   */
  buildAuthorizationUrl(config, params) {
    const { scopes, state, nonce, codeChallenge, tenantId } = params;
    
    let baseUrl = config.authUrl;
    let endpoint = config.endpoints.authorize;

    // Handle provider-specific URL building
    switch (config.id) {
      case 'azure':
        if (tenantId) {
          endpoint = endpoint.replace('{tenantId}', tenantId);
        } else {
          endpoint = endpoint.replace('{tenantId}', 'common');
        }
        baseUrl += endpoint;
        break;
      
      case 'aws':
        // AWS uses different flow - redirect to AWS Console with return URL
        return `${config.authUrl}/oauth?client_id=${import.meta.env.VITE_AWS_CLIENT_ID}&response_type=code&scope=${scopes.join(' ')}&redirect_uri=${encodeURIComponent(window.location.origin)}/auth/callback/aws&state=${state}`;
      
      case 'google':
        baseUrl += config.endpoints.authorize;
        break;
      
      case 'github':
        baseUrl += config.endpoints.authorize;
        break;
    }

    const params_obj = new URLSearchParams({
      client_id: this.getClientId(config.id),
      response_type: 'code',
      redirect_uri: `${window.location.origin}/auth/callback/${config.id}`,
      scope: scopes.join(' '),
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });

    if (nonce) {
      params_obj.append('nonce', nonce);
    }

    return `${baseUrl}?${params_obj.toString()}`;
  }

  /**
   * Handle OAuth callback and exchange code for tokens
   */
  async handleOAuthCallback(provider, code, state) {
    // Retrieve stored PKCE parameters
    const storedData = sessionStorage.getItem(`oauth_${state}`);
    if (!storedData) {
      throw new Error('Invalid or expired OAuth state');
    }

    const { codeVerifier, scopes, tenantId } = JSON.parse(storedData);
    const config = CLOUD_PROVIDERS[provider.toUpperCase()];

    // Exchange authorization code for tokens
    const tokens = await this.exchangeCodeForTokens(config, {
      code,
      codeVerifier,
      tenantId
    });

    // Validate tokens and extract user info
    const userInfo = await this.getUserInfo(config, tokens.access_token);
    
    // Store connection securely
    const connection = {
      provider: config.id,
      tokens,
      userInfo,
      scopes,
      connectedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + (tokens.expires_in * 1000)).toISOString()
    };

    this.connections.set(config.id, connection);
    this.setupTokenRefresh(config.id, tokens);

    // Clean up session storage
    sessionStorage.removeItem(`oauth_${state}`);

    this.emit('connection:established', { provider: config.id, connection });
    return connection;
  }

  /**
   * Exchange authorization code for access/refresh tokens
   */
  async exchangeCodeForTokens(config, { code, codeVerifier, tenantId }) {
    let tokenUrl = config.authUrl;
    let endpoint = config.endpoints.token;

    // Handle provider-specific token exchange
    switch (config.id) {
      case 'azure':
        if (tenantId) {
          endpoint = endpoint.replace('{tenantId}', tenantId);
        } else {
          endpoint = endpoint.replace('{tenantId}', 'common');
        }
        tokenUrl += endpoint;
        break;
      
      case 'aws':
        // AWS uses STS for token exchange
        return this.exchangeAWSCredentials(code);
      
      case 'google':
        tokenUrl += config.endpoints.token;
        break;
      
      case 'github':
        tokenUrl += config.endpoints.token;
        break;
    }

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.getClientId(config.id),
        client_secret: this.getClientSecret(config.id),
        code,
        redirect_uri: `${window.location.origin}/auth/callback/${config.id}`,
        code_verifier: codeVerifier
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token exchange failed: ${error}`);
    }

    return response.json();
  }

  /**
   * Setup automatic token refresh
   */
  setupTokenRefresh(provider, tokens) {
    if (!tokens.refresh_token) return;

    // Clear existing refresh timer
    if (this.refreshTimers.has(provider)) {
      clearTimeout(this.refreshTimers.get(provider));
    }

    // Setup new refresh timer (refresh 5 minutes before expiry)
    const refreshTime = (tokens.expires_in - 300) * 1000;
    const timer = setTimeout(() => {
      this.refreshAccessToken(provider);
    }, refreshTime);

    this.refreshTimers.set(provider, timer);
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(provider) {
    const connection = this.connections.get(provider);
    if (!connection || !connection.tokens.refresh_token) {
      this.emit('connection:expired', { provider });
      return;
    }

    const config = CLOUD_PROVIDERS[provider.toUpperCase()];
    
    try {
      const newTokens = await this.performTokenRefresh(config, connection.tokens.refresh_token);
      
      // Update stored connection
      connection.tokens = newTokens;
      connection.expiresAt = new Date(Date.now() + (newTokens.expires_in * 1000)).toISOString();
      this.connections.set(provider, connection);

      // Setup next refresh
      this.setupTokenRefresh(provider, newTokens);
      
      this.emit('token:refreshed', { provider, tokens: newTokens });
    } catch (error) {
      console.error(`Failed to refresh token for ${provider}:`, error);
      this.emit('connection:expired', { provider, error });
    }
  }

  // ============================================================================
  // 3. PROVIDER-SPECIFIC IMPLEMENTATIONS
  // ============================================================================

  /**
   * Azure AD / Entra ID specific implementation
   */
  async connectAzure(tenantId, scopes = []) {
    const allScopes = [
      ...CLOUD_PROVIDERS.AZURE.scopes.identity,
      ...CLOUD_PROVIDERS.AZURE.scopes.security,
      ...CLOUD_PROVIDERS.AZURE.scopes.infrastructure,
      ...scopes
    ];

    return this.initiateOAuthFlow('azure', allScopes, tenantId);
  }

  /**
   * AWS specific implementation using cross-account roles
   */
  async connectAWS(accountId, roleArn) {
    // AWS uses IAM roles for cross-account access
    // This would typically involve:
    // 1. User authenticates with AWS Console
    // 2. Assumes cross-account role with required permissions
    // 3. Returns temporary credentials via STS

    const assumeRoleParams = {
      RoleArn: roleArn,
      RoleSessionName: `RedScan-${Date.now()}`,
      ExternalId: import.meta.env.VITE_AWS_EXTERNAL_ID,
      DurationSeconds: 3600 // 1 hour
    };

    // In production, this would use AWS SDK
    return this.initiateOAuthFlow('aws', CLOUD_PROVIDERS.AWS.scopes.security);
  }

  /**
   * Google Cloud Platform / Workspace implementation
   */
  async connectGoogle(workspaceCustomerId, scopes = []) {
    const allScopes = [
      ...CLOUD_PROVIDERS.GOOGLE.scopes.identity,
      ...CLOUD_PROVIDERS.GOOGLE.scopes.workspace,
      ...CLOUD_PROVIDERS.GOOGLE.scopes.cloud,
      ...CLOUD_PROVIDERS.GOOGLE.scopes.security,
      ...scopes
    ];

    return this.initiateOAuthFlow('google', allScopes);
  }

  /**
   * GitHub implementation for code security scanning
   */
  async connectGitHub(scopes = []) {
    const allScopes = [
      ...CLOUD_PROVIDERS.GITHUB.scopes.repos,
      ...CLOUD_PROVIDERS.GITHUB.scopes.organizations,
      ...CLOUD_PROVIDERS.GITHUB.scopes.security,
      ...scopes
    ];

    return this.initiateOAuthFlow('github', allScopes);
  }

  // ============================================================================
  // 4. SECURITY SCANNING OPERATIONS
  // ============================================================================

  /**
   * Perform security scan using authenticated connection
   */
  async performSecurityScan(provider, scanType, options = {}) {
    const connection = this.getConnection(provider);
    if (!connection) {
      throw new Error(`No active connection for provider: ${provider}`);
    }

    switch (provider) {
      case 'azure':
        return this.scanAzureResources(connection, scanType, options);
      case 'aws':
        return this.scanAWSResources(connection, scanType, options);
      case 'google':
        return this.scanGoogleResources(connection, scanType, options);
      case 'github':
        return this.scanGitHubRepositories(connection, scanType, options);
      default:
        throw new Error(`Scanning not implemented for provider: ${provider}`);
    }
  }

  /**
   * Azure security scanning implementation
   */
  async scanAzureResources(connection, scanType, options) {
    const headers = {
      'Authorization': `Bearer ${connection.tokens.access_token}`,
      'Content-Type': 'application/json'
    };

    const results = {};

    try {
      switch (scanType) {
        case 'security_center':
          results.securityAlerts = await this.fetchAzureSecurityAlerts(headers);
          results.recommendations = await this.fetchAzureRecommendations(headers);
          break;
        
        case 'identity_protection':
          results.riskyUsers = await this.fetchAzureRiskyUsers(headers);
          results.riskEvents = await this.fetchAzureRiskEvents(headers);
          break;
        
        case 'compliance':
          results.complianceResults = await this.fetchAzureComplianceResults(headers);
          break;
        
        case 'infrastructure':
          results.subscriptions = await this.fetchAzureSubscriptions(headers);
          results.resources = await this.fetchAzureResources(headers, options.subscriptionId);
          break;
      }

      return {
        provider: 'azure',
        scanType,
        timestamp: new Date().toISOString(),
        results
      };
    } catch (error) {
      throw new Error(`Azure scan failed: ${error.message}`);
    }
  }

  // ============================================================================
  // 5. UTILITY METHODS
  // ============================================================================

  generateCodeVerifier() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  async generateCodeChallenge(verifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  generateState() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
  }

  generateNonce() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
  }

  getClientId(provider) {
    return import.meta.env[`VITE_${provider.toUpperCase()}_CLIENT_ID`];
  }

  getClientSecret(provider) {
    return import.meta.env[`VITE_${provider.toUpperCase()}_CLIENT_SECRET`];
  }

  getConnection(provider) {
    return this.connections.get(provider.toLowerCase());
  }

  isConnected(provider) {
    const connection = this.getConnection(provider);
    return connection && new Date(connection.expiresAt) > new Date();
  }

  disconnect(provider) {
    if (this.refreshTimers.has(provider)) {
      clearTimeout(this.refreshTimers.get(provider));
      this.refreshTimers.delete(provider);
    }
    this.connections.delete(provider);
    this.emit('connection:disconnected', { provider });
  }
}

// ============================================================================
// 6. EXPORT SINGLETON INSTANCE
// ============================================================================

export const cloudAuthManager = new CloudAuthManager();
export default cloudAuthManager;
