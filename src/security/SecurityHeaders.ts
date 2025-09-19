/**
 * Security Headers and Middleware Configuration
 * Implements comprehensive security headers and policies
 */

// ============================================================================
// CONTENT SECURITY POLICY (CSP)
// ============================================================================

export const CSP_DIRECTIVES = {
  // Default sources - only allow self
  'default-src': ["'self'"],
  
  // Scripts - allow self, inline for React, and specific CDNs
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for React development
    "'unsafe-eval'", // Required for development tools (remove in production)
    'https://cdn.jsdelivr.net',
    'https://unpkg.com',
    'https://polyfill.io'
  ],
  
  // Styles - allow self, inline, and trusted CDNs
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for styled components
    'https://fonts.googleapis.com',
    'https://cdn.jsdelivr.net'
  ],
  
  // Images - allow self, data URLs, and trusted sources
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https://avatars.githubusercontent.com',
    'https://images.unsplash.com',
    'https://ui-avatars.com'
  ],
  
  // Fonts - allow self and Google Fonts
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
    'data:'
  ],
  
  // Connect - API endpoints and external services
  'connect-src': [
    "'self'",
    'https://base44.app', // Base44 SDK API access
    'https://api.github.com',
    'https://login.microsoftonline.com',
    'https://graph.microsoft.com',
    'https://amazonaws.com',
    'https://*.amazonaws.com',
    'https://googleapis.com',
    'https://*.googleapis.com',
    'wss://localhost:*', // For development WebSocket
    import.meta.env.NODE_ENV === 'development' ? 'ws://localhost:*' : null
  ].filter(Boolean),
  
  // Media sources
  'media-src': ["'self'", 'data:', 'blob:'],
  
  // Object and embed restrictions
  'object-src': ["'none'"],
  'embed-src': ["'none'"],
  
  // Frame restrictions
  'frame-src': [
    "'self'",
    'https://login.microsoftonline.com',
    'https://accounts.google.com'
  ],
  
  // Frame ancestors - prevent clickjacking
  'frame-ancestors': ["'none'"],
  
  // Base URI restrictions
  'base-uri': ["'self'"],
  
  // Form action restrictions
  'form-action': ["'self'"],
  
  // Manifest source
  'manifest-src': ["'self'"],
  
  // Worker restrictions
  'worker-src': ["'self'", 'blob:'],
  
  // Upgrade insecure requests in production
  ...(import.meta.env.NODE_ENV === 'production' && {
    'upgrade-insecure-requests': []
  })
};

// ============================================================================
// SECURITY HEADERS CONFIGURATION
// ============================================================================

export const SECURITY_HEADERS = {
  // Content Security Policy
  'Content-Security-Policy': Object.entries(CSP_DIRECTIVES)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; '),

  // Strict Transport Security (HTTPS only)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // XSS Protection
  'X-XSS-Protection': '1; mode=block',

  // Frame Options - prevent clickjacking
  'X-Frame-Options': 'DENY',

  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions Policy (Feature Policy)
  'Permissions-Policy': [
    'accelerometer=()',
    'ambient-light-sensor=()',
    'autoplay=()',
    'battery=()',
    'camera=()',
    'cross-origin-isolated=()',
    'display-capture=()',
    'document-domain=()',
    'encrypted-media=()',
    'execution-while-not-rendered=()',
    'execution-while-out-of-viewport=()',
    'fullscreen=(self)',
    'geolocation=()',
    'gyroscope=()',
    'keyboard-map=()',
    'magnetometer=()',
    'microphone=()',
    'midi=()',
    'navigation-override=()',
    'payment=()',
    'picture-in-picture=()',
    'publickey-credentials-get=(self)',
    'screen-wake-lock=()',
    'sync-xhr=()',
    'usb=()',
    'web-share=(self)',
    'xr-spatial-tracking=()'
  ].join(', '),

  // Cross-Origin policies
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',

  // Cache Control for sensitive pages
  'Cache-Control': 'no-cache, no-store, must-revalidate, private',
  'Pragma': 'no-cache',
  'Expires': '0',

  // Remove server information
  'Server': 'RedScan Security Platform',

  // Custom security headers
  'X-Powered-By': 'RedScan',
  'X-Security-Policy': 'strict'
};

// ============================================================================
// DEVELOPMENT OVERRIDES
// ============================================================================

export const DEVELOPMENT_CSP_OVERRIDES = {
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'", // Required for HMR and dev tools
    'http://localhost:*',
    'ws://localhost:*',
    'https://cdn.jsdelivr.net'
  ],
  'connect-src': [
    "'self'",
    'http://localhost:*',
    'ws://localhost:*',
    'wss://localhost:*'
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'",
    'http://localhost:*'
  ]
};

// ============================================================================
// MIDDLEWARE FUNCTIONS
// ============================================================================

export function createSecurityMiddleware() {
  return {
    // Apply security headers to all responses
    applyHeaders: (response: Response, request: Request): Response => {
      const headers = new Headers(response.headers);
      
      // Apply base security headers
      Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
        headers.set(key, value);
      });

      // Apply development overrides if needed
      if (import.meta.env.NODE_ENV === 'development') {
        const devCSP = { ...CSP_DIRECTIVES, ...DEVELOPMENT_CSP_OVERRIDES };
        const cspValue = Object.entries(devCSP)
          .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
          .join('; ');
        headers.set('Content-Security-Policy', cspValue);
      }

      // Conditional headers based on request
      if (request.url.includes('/api/')) {
        // API responses should not be cached
        headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      } else if (request.url.includes('/static/')) {
        // Static assets can be cached
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      }

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    },

    // Validate request security
    validateRequest: (request: Request): boolean => {
      // Check for suspicious headers
      const suspiciousHeaders = [
        'x-forwarded-proto',
        'x-forwarded-for',
        'x-real-ip'
      ];

      for (const header of suspiciousHeaders) {
        const value = request.headers.get(header);
        if (value && !isValidHeaderValue(value)) {
          return false;
        }
      }

      // Check for common attack patterns in URL
      const url = new URL(request.url);
      const dangerousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /\.\.\/\.\.\//,
        /%00/,
        /\x00/
      ];

      for (const pattern of dangerousPatterns) {
        if (pattern.test(url.pathname) || pattern.test(url.search)) {
          return false;
        }
      }

      return true;
    },

    // Generate nonce for inline scripts/styles
    generateNonce: (): string => {
      const crypto = globalThis.crypto || require('crypto');
      const array = new Uint8Array(16);
      crypto.getRandomValues(array);
      return btoa(String.fromCharCode(...array));
    }
  };
}

function isValidHeaderValue(value: string): boolean {
  // Basic validation for header values
  return !/[\r\n\x00]/.test(value) && value.length < 1000;
}

// ============================================================================
// CSP REPORTING
// ============================================================================

export interface CSPReport {
  'csp-report': {
    'document-uri': string;
    'referrer': string;
    'violated-directive': string;
    'effective-directive': string;
    'original-policy': string;
    'disposition': string;
    'blocked-uri': string;
    'line-number': number;
    'column-number': number;
    'source-file': string;
    'status-code': number;
    'script-sample': string;
  };
}

export function handleCSPReport(report: CSPReport): void {
  console.warn('CSP Violation Report:', report);
  
  // In production, send to monitoring service
  if (import.meta.env.NODE_ENV === 'production') {
    fetch('/api/security/csp-reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(report)
    }).catch(error => {
      console.error('Failed to report CSP violation:', error);
    });
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function validateCSPSource(source: string): boolean {
  const validPatterns = [
    /^'self'$/,
    /^'unsafe-inline'$/,
    /^'unsafe-eval'$/,
    /^'none'$/,
    /^https:\/\/.+$/,
    /^http:\/\/localhost:\d+$/,
    /^ws:\/\/localhost:\d+$/,
    /^wss:\/\/localhost:\d+$/,
    /^data:$/,
    /^blob:$/,
    /^'nonce-.+'$/,
    /^'sha256-.+'$/
  ];

  return validPatterns.some(pattern => pattern.test(source));
}

export function sanitizeCSPValue(value: string): string {
  return value
    .replace(/[^\w\s:\/\.-]/g, '') // Remove potentially dangerous characters
    .trim()
    .substring(0, 1000); // Limit length
}

// ============================================================================
// EXPORT MIDDLEWARE INSTANCE
// ============================================================================

export const securityMiddleware = createSecurityMiddleware();

export default {
  CSP_DIRECTIVES,
  SECURITY_HEADERS,
  DEVELOPMENT_CSP_OVERRIDES,
  createSecurityMiddleware,
  handleCSPReport,
  validateCSPSource,
  sanitizeCSPValue
};
