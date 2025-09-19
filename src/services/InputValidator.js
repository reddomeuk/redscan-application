/**
 * Comprehensive Input Validation and Sanitization System
 * Provides security validation for all user inputs across the RedScan platform
 */

import DOMPurify from 'dompurify';

// ============================================================================
// INPUT VALIDATION RULES
// ============================================================================

export const ValidationRules = {
  // Email validation
  email: {
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    maxLength: 254,
    required: true,
    sanitize: (value) => value.toLowerCase().trim()
  },

  // Password validation
  password: {
    minLength: 8,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    required: true,
    errorMessage: 'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character'
  },

  // General text validation
  text: {
    maxLength: 1000,
    pattern: /^[a-zA-Z0-9\s\-_.,!?()'"]+$/,
    sanitize: (value) => DOMPurify.sanitize(value.trim()),
    stripTags: true
  },

  // Name validation
  name: {
    maxLength: 100,
    pattern: /^[a-zA-Z\s\-'.]+$/,
    required: true,
    sanitize: (value) => value.trim().replace(/\s+/g, ' ')
  },

  // URL validation
  url: {
    pattern: /^https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?$/,
    maxLength: 2048,
    sanitize: (value) => encodeURI(value.trim())
  },

  // IP Address validation
  ipAddress: {
    pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    required: true
  },

  // Domain validation
  domain: {
    pattern: /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/,
    maxLength: 253,
    sanitize: (value) => value.toLowerCase().trim()
  },

  // Phone number validation
  phone: {
    pattern: /^\+?[1-9]\d{1,14}$/,
    sanitize: (value) => value.replace(/\D/g, '')
  },

  // Alphanumeric validation
  alphanumeric: {
    pattern: /^[a-zA-Z0-9]+$/,
    sanitize: (value) => value.replace(/[^a-zA-Z0-9]/g, '')
  },

  // File path validation (for upload paths)
  filePath: {
    pattern: /^[a-zA-Z0-9\-_./]+$/,
    maxLength: 260,
    sanitize: (value) => value.replace(/[^a-zA-Z0-9\-_./]/g, '')
  },

  // JSON validation
  json: {
    validate: (value) => {
      try {
        JSON.parse(value);
        return true;
      } catch {
        return false;
      }
    },
    sanitize: (value) => {
      try {
        return JSON.stringify(JSON.parse(value));
      } catch {
        return null;
      }
    }
  },

  // SQL injection prevention
  sqlSafe: {
    pattern: /^[^';\\--/*]+$/,
    blacklist: ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER', 'EXEC', 'UNION', 'SCRIPT'],
    sanitize: (value) => {
      let sanitized = value.replace(/[';\\--/*]/g, '');
      ValidationRules.sqlSafe.blacklist.forEach(keyword => {
        const regex = new RegExp(keyword, 'gi');
        sanitized = sanitized.replace(regex, '');
      });
      return sanitized;
    }
  },

  // XSS prevention
  xssSafe: {
    sanitize: (value) => DOMPurify.sanitize(value, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    })
  }
};

// ============================================================================
// VALIDATION ENGINE
// ============================================================================

export class InputValidator {
  constructor() {
    this.errors = new Map();
  }

  /**
   * Validate single field
   */
  validateField(fieldName, value, rules = {}) {
    const errors = [];
    
    // Check if field is required
    if (rules.required && (!value || value.toString().trim() === '')) {
      errors.push(`${fieldName} is required`);
      this.errors.set(fieldName, errors);
      return { isValid: false, errors, sanitizedValue: null };
    }

    // Skip validation if value is empty and not required
    if (!value || value.toString().trim() === '') {
      this.errors.delete(fieldName);
      return { isValid: true, errors: [], sanitizedValue: '' };
    }

    let sanitizedValue = value.toString();

    // Apply sanitization
    if (rules.sanitize) {
      sanitizedValue = rules.sanitize(sanitizedValue);
    }

    // Length validation
    if (rules.minLength && sanitizedValue.length < rules.minLength) {
      errors.push(`${fieldName} must be at least ${rules.minLength} characters long`);
    }

    if (rules.maxLength && sanitizedValue.length > rules.maxLength) {
      errors.push(`${fieldName} must not exceed ${rules.maxLength} characters`);
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(sanitizedValue)) {
      errors.push(rules.errorMessage || `${fieldName} format is invalid`);
    }

    // Custom validation function
    if (rules.validate && !rules.validate(sanitizedValue)) {
      errors.push(rules.errorMessage || `${fieldName} is invalid`);
    }

    // Blacklist validation
    if (rules.blacklist) {
      const hasBlacklistedContent = rules.blacklist.some(item => 
        sanitizedValue.toLowerCase().includes(item.toLowerCase())
      );
      if (hasBlacklistedContent) {
        errors.push(`${fieldName} contains prohibited content`);
      }
    }

    // Store errors
    if (errors.length > 0) {
      this.errors.set(fieldName, errors);
      return { isValid: false, errors, sanitizedValue };
    } else {
      this.errors.delete(fieldName);
      return { isValid: true, errors: [], sanitizedValue };
    }
  }

  /**
   * Validate form data
   */
  validateForm(formData, validationSchema) {
    const results = {};
    const sanitizedData = {};
    let isFormValid = true;

    Object.entries(validationSchema).forEach(([fieldName, rules]) => {
      const value = formData[fieldName];
      const result = this.validateField(fieldName, value, rules);
      
      results[fieldName] = result;
      sanitizedData[fieldName] = result.sanitizedValue;
      
      if (!result.isValid) {
        isFormValid = false;
      }
    });

    return {
      isValid: isFormValid,
      results,
      sanitizedData,
      errors: this.getAllErrors()
    };
  }

  /**
   * Get all validation errors
   */
  getAllErrors() {
    const allErrors = {};
    this.errors.forEach((errors, fieldName) => {
      allErrors[fieldName] = errors;
    });
    return allErrors;
  }

  /**
   * Clear all errors
   */
  clearErrors() {
    this.errors.clear();
  }

  /**
   * Clear specific field error
   */
  clearFieldError(fieldName) {
    this.errors.delete(fieldName);
  }
}

// ============================================================================
// PREDEFINED VALIDATION SCHEMAS
// ============================================================================

export const ValidationSchemas = {
  // User registration
  userRegistration: {
    email: ValidationRules.email,
    password: ValidationRules.password,
    firstName: ValidationRules.name,
    lastName: ValidationRules.name,
    phone: { ...ValidationRules.phone, required: false }
  },

  // Login form
  login: {
    email: ValidationRules.email,
    password: { ...ValidationRules.password, pattern: undefined } // Don't validate pattern on login
  },

  // Asset creation
  assetCreation: {
    name: { ...ValidationRules.text, required: true, maxLength: 100 },
    url: { ...ValidationRules.url, required: false },
    ipAddress: { ...ValidationRules.ipAddress, required: false },
    description: { ...ValidationRules.text, required: false, maxLength: 500 }
  },

  // Cloud account
  cloudAccount: {
    name: { ...ValidationRules.text, required: true, maxLength: 100 },
    provider: { ...ValidationRules.alphanumeric, required: true },
    accountId: { ...ValidationRules.alphanumeric, required: true },
    region: { ...ValidationRules.alphanumeric, required: false }
  },

  // Supplier information
  supplier: {
    name: { ...ValidationRules.text, required: true, maxLength: 200 },
    email: ValidationRules.email,
    website: { ...ValidationRules.url, required: false },
    contactPerson: { ...ValidationRules.name, required: true }
  },

  // Search and filtering
  search: {
    query: { ...ValidationRules.text, maxLength: 200, sanitize: ValidationRules.xssSafe.sanitize },
    filters: { ...ValidationRules.json, required: false }
  }
};

// ============================================================================
// SECURITY UTILITIES
// ============================================================================

export class SecurityUtils {
  /**
   * Sanitize HTML content
   */
  static sanitizeHTML(html) {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'],
      ALLOWED_ATTR: []
    });
  }

  /**
   * Escape SQL-like content
   */
  static escapeSQLLike(value) {
    if (typeof value !== 'string') return value;
    return value.replace(/[%_\\]/g, '\\$&');
  }

  /**
   * Generate CSRF token
   */
  static generateCSRFToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
  }

  /**
   * Validate CSRF token (constant-time comparison to prevent timing attacks)
   */
  static validateCSRFToken(token, expectedToken) {
    if (!token || !expectedToken) return false;
    
    // Ensure both tokens are the same length to prevent timing attacks
    if (token.length !== expectedToken.length) return false;
    
    // Constant-time comparison
    let result = 0;
    for (let i = 0; i < token.length; i++) {
      result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i);
    }
    
    return result === 0;
  }

  /**
   * Rate limiting check
   */
  static checkRateLimit(identifier, limit = 100, windowMs = 60000) {
    const key = `rate_limit_${identifier}`;
    const now = Date.now();
    
    const attempts = JSON.parse(localStorage.getItem(key) || '[]');
    const validAttempts = attempts.filter(time => now - time < windowMs);
    
    if (validAttempts.length >= limit) {
      return false;
    }
    
    validAttempts.push(now);
    localStorage.setItem(key, JSON.stringify(validAttempts));
    return true;
  }

  /**
   * Detect potential injection attacks
   */
  static detectInjectionAttack(input) {
    const injectionPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /eval\s*\(/gi,
      /expression\s*\(/gi
    ];

    return injectionPatterns.some(pattern => pattern.test(input));
  }
}

// ============================================================================
// REACT HOOKS FOR VALIDATION
// ============================================================================

export function useFormValidation(initialData = {}, schema = {}) {
  const [data, setData] = React.useState(initialData);
  const [errors, setErrors] = React.useState({});
  const [isValid, setIsValid] = React.useState(false);
  const validator = React.useRef(new InputValidator());

  const validateField = React.useCallback((fieldName, value) => {
    const rules = schema[fieldName];
    if (!rules) return { isValid: true, sanitizedValue: value };

    const result = validator.current.validateField(fieldName, value, rules);
    
    setErrors(prev => ({
      ...prev,
      [fieldName]: result.errors
    }));

    return result;
  }, [schema]);

  const validateForm = React.useCallback(() => {
    const result = validator.current.validateForm(data, schema);
    setErrors(result.errors);
    setIsValid(result.isValid);
    return result;
  }, [data, schema]);

  const updateField = React.useCallback((fieldName, value) => {
    const result = validateField(fieldName, value);
    setData(prev => ({
      ...prev,
      [fieldName]: result.sanitizedValue
    }));
  }, [validateField]);

  React.useEffect(() => {
    const result = validator.current.validateForm(data, schema);
    setIsValid(result.isValid);
  }, [data, schema]);

  return {
    data,
    errors,
    isValid,
    updateField,
    validateField,
    validateForm,
    setData
  };
}

// Export singleton validator instance
export const inputValidator = new InputValidator();
export default inputValidator;
