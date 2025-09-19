/**
 * Client-Side Security Headers Implementation
 * Sets security-related meta tags and headers where possible
 */

import { CSP_DIRECTIVES, DEVELOPMENT_CSP_OVERRIDES } from './SecurityHeaders';

// ============================================================================
// CLIENT-SIDE SECURITY SETUP
// ============================================================================

class ClientSecurityManager {
  private nonce: string;

  constructor() {
    this.nonce = this.generateNonce();
    this.initializeSecurity();
  }

  private generateNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
  }

  private initializeSecurity(): void {
    // Set up CSP meta tag if not already present
    this.setupCSP();
    
    // Set up other security meta tags
    this.setupSecurityMeta();
    
    // Set up CSP violation reporting
    this.setupCSPReporting();
    
    // Set up security event listeners
    this.setupSecurityListeners();
  }

  private setupCSP(): void {
    // Check if CSP is already set via HTTP header
    if (this.isCSPSetViaHeader()) {
      console.log('CSP already set via HTTP header');
      return;
    }

    // Create CSP directive from configuration
    const directives = import.meta.env.DEV 
      ? { ...CSP_DIRECTIVES, ...DEVELOPMENT_CSP_OVERRIDES }
      : CSP_DIRECTIVES;

    // Add nonce to script and style directives
    if (directives['script-src']) {
      directives['script-src'] = [...directives['script-src'], `'nonce-${this.nonce}'`];
    }
    if (directives['style-src']) {
      directives['style-src'] = [...directives['style-src'], `'nonce-${this.nonce}'`];
    }

    const cspValue = Object.entries(directives)
      .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
      .join('; ');

    // Set CSP meta tag
    this.setMetaTag('Content-Security-Policy', cspValue);
  }

  private setupSecurityMeta(): void {
    const securityMetas = [
      { name: 'referrer', content: 'strict-origin-when-cross-origin' },
      { httpEquiv: 'X-Content-Type-Options', content: 'nosniff' },
      // Note: X-Frame-Options can only be set via HTTP header, not meta tag
      { httpEquiv: 'X-XSS-Protection', content: '1; mode=block' },
      { name: 'format-detection', content: 'telephone=no' },
      { name: 'msapplication-config', content: 'none' },
      { name: 'theme-color', content: '#000000' }
    ];

    securityMetas.forEach(meta => {
      if (meta.httpEquiv) {
        this.setMetaTag(meta.httpEquiv, meta.content, true);
      } else {
        this.setMetaNameTag(meta.name!, meta.content);
      }
    });
  }

  private setupCSPReporting(): void {
    // Listen for CSP violations
    document.addEventListener('securitypolicyviolation', (event) => {
      this.handleCSPViolation(event as SecurityPolicyViolationEvent);
    });
  }

  private setupSecurityListeners(): void {
    // Monitor for potential XSS attempts
    this.setupXSSDetection();
    
    // Monitor for suspicious DOM mutations
    this.setupDOMMonitoring();
    
    // Monitor for suspicious network requests
    this.setupNetworkMonitoring();
  }

  private setupXSSDetection(): void {
    // Override potentially dangerous methods
    const originalEval = window.eval;
    window.eval = function(code: string) {
      console.warn('eval() called - potential security risk:', code);
      // In development, allow eval for HMR
      if (import.meta.env.DEV) {
        return originalEval.call(this, code);
      }
      throw new Error('eval() is not allowed for security reasons');
    };

    // Monitor for script injection attempts
    const originalSetAttribute = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function(name: string, value: string) {
      if (name.toLowerCase().startsWith('on') && this.tagName.toLowerCase() === 'script') {
        console.warn('Potential XSS attempt detected:', name, value);
        return;
      }
      return originalSetAttribute.call(this, name, value);
    };
  }

  private setupDOMMonitoring(): void {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              this.validateNewElement(element);
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private setupNetworkMonitoring(): void {
    // Override fetch to add security headers
    const originalFetch = window.fetch;
    window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
      const headers = new Headers(init?.headers);
      
      // Add security headers to requests
      headers.set('X-Requested-With', 'XMLHttpRequest');
      headers.set('X-Content-Type-Options', 'nosniff');
      
      const newInit = {
        ...init,
        headers,
        credentials: 'same-origin' as RequestCredentials
      };

      return originalFetch.call(this, input, newInit);
    };
  }

  private validateNewElement(element: Element): void {
    // Check for suspicious attributes
    const dangerousAttributes = ['onclick', 'onload', 'onerror', 'onmouseover'];
    dangerousAttributes.forEach(attr => {
      if (element.hasAttribute(attr)) {
        console.warn('Suspicious attribute detected:', attr, element);
        element.removeAttribute(attr);
      }
    });

    // Check for inline scripts without nonce
    if (element.tagName.toLowerCase() === 'script') {
      const script = element as HTMLScriptElement;
      if (script.innerHTML && !script.hasAttribute('nonce')) {
        console.warn('Inline script without nonce detected');
        script.setAttribute('nonce', this.nonce);
      }
    }

    // Check for inline styles without nonce
    if (element.tagName.toLowerCase() === 'style') {
      const style = element as HTMLStyleElement;
      if (style.innerHTML && !style.hasAttribute('nonce')) {
        console.warn('Inline style without nonce detected');
        style.setAttribute('nonce', this.nonce);
      }
    }
  }

  private handleCSPViolation(event: SecurityPolicyViolationEvent): void {
    const violation = {
      documentURI: event.documentURI,
      violatedDirective: event.violatedDirective,
      effectiveDirective: event.effectiveDirective,
      originalPolicy: event.originalPolicy,
      blockedURI: event.blockedURI,
      disposition: event.disposition,
      referrer: event.referrer,
      lineNumber: event.lineNumber,
      columnNumber: event.columnNumber,
      sourceFile: event.sourceFile,
      sample: event.sample,
      timestamp: Date.now()
    };

    console.warn('CSP Violation:', violation);

    // Report to audit logger if available
    if (window.auditLogger) {
      window.auditLogger.logSecurity('SECURITY_CSP_VIOLATION', violation);
    }

    // In production, send to server
    if (import.meta.env.PROD) {
      fetch('/api/security/csp-violations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(violation)
      }).catch(error => {
        console.error('Failed to report CSP violation:', error);
      });
    }
  }

  private isCSPSetViaHeader(): boolean {
    // Check if CSP was set via HTTP header by trying to access it
    try {
      const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      return !!meta;
    } catch {
      return false;
    }
  }

  private setMetaTag(name: string, content: string, isHttpEquiv: boolean = false): void {
    const existing = document.querySelector(`meta[${isHttpEquiv ? 'http-equiv' : 'name'}="${name}"]`);
    if (existing) {
      existing.setAttribute('content', content);
    } else {
      const meta = document.createElement('meta');
      if (isHttpEquiv) {
        meta.setAttribute('http-equiv', name);
      } else {
        meta.setAttribute('name', name);
      }
      meta.setAttribute('content', content);
      document.head.appendChild(meta);
    }
  }

  private setMetaNameTag(name: string, content: string): void {
    this.setMetaTag(name, content, false);
  }

  // Public methods
  getNonce(): string {
    return this.nonce;
  }

  refreshNonce(): string {
    this.nonce = this.generateNonce();
    return this.nonce;
  }

  validateURL(url: string): boolean {
    try {
      const parsed = new URL(url);
      
      // Check for dangerous protocols
      const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
      if (dangerousProtocols.includes(parsed.protocol)) {
        return false;
      }

      // Check for suspicious patterns
      const suspiciousPatterns = [
        /<script/i,
        /on\w+\s*=/i,
        /%00/,
        /\x00/
      ];

      return !suspiciousPatterns.some(pattern => 
        pattern.test(url) || pattern.test(decodeURIComponent(url))
      );
    } catch {
      return false;
    }
  }

  sanitizeHTML(html: string): string {
    // Basic HTML sanitization (in addition to DOMPurify)
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  checkIntegrity(): boolean {
    // Basic integrity check
    try {
      // Check if critical security functions are intact
      return typeof window.eval === 'function' &&
             typeof document.createElement === 'function' &&
             typeof fetch === 'function';
    } catch {
      return false;
    }
  }
}

// ============================================================================
// SECURITY UTILITIES
// ============================================================================

export function createSecureElement(tagName: string, attributes: Record<string, string> = {}): HTMLElement {
  const element = document.createElement(tagName);
  
  Object.entries(attributes).forEach(([key, value]) => {
    // Validate attribute names and values
    if (key.toLowerCase().startsWith('on')) {
      console.warn('Event handler attributes are not allowed:', key);
      return;
    }
    
    element.setAttribute(key, value);
  });

  return element;
}

export function addNonceToInlineScripts(): void {
  const securityManager = getSecurityManager();
  const nonce = securityManager.getNonce();
  
  document.querySelectorAll('script:not([src]):not([nonce])').forEach(script => {
    script.setAttribute('nonce', nonce);
  });
  
  document.querySelectorAll('style:not([nonce])').forEach(style => {
    style.setAttribute('nonce', nonce);
  });
}

export function enforceHTTPS(): void {
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    if (import.meta.env.PROD) {
      location.replace(`https:${location.href.substring(location.protocol.length)}`);
    } else {
      console.warn('HTTPS is required in production');
    }
  }
}

// ============================================================================
// GLOBAL INSTANCE
// ============================================================================

let securityManagerInstance: ClientSecurityManager | null = null;

export function getSecurityManager(): ClientSecurityManager {
  if (!securityManagerInstance) {
    securityManagerInstance = new ClientSecurityManager();
  }
  return securityManagerInstance;
}

// Initialize security manager when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      getSecurityManager();
      addNonceToInlineScripts();
      enforceHTTPS();
    });
  } else {
    getSecurityManager();
    addNonceToInlineScripts();
    enforceHTTPS();
  }
}

// Global type extensions
declare global {
  interface Window {
    auditLogger?: any;
    securityManager?: ClientSecurityManager;
  }
}

// Export security manager instance
if (typeof window !== 'undefined') {
  window.securityManager = getSecurityManager();
}

export { ClientSecurityManager };
export default getSecurityManager;
