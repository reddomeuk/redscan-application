/**
 * Standardized Security Entity Definitions
 * Provides consistent entity classes for all security modules
 */

import { BaseEntity } from './BaseEntity';
import { ValidationSchema } from './StandardApiClient';

// User entity
export class User extends BaseEntity {
  constructor(data = {}) {
    super(data, {
      entityName: 'user',
      endpoint: '/users',
      primaryKey: 'id',
      validationSchema: new ValidationSchema({
        email: { 
          required: true, 
          type: 'string',
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        },
        full_name: { required: true, type: 'string', minLength: 2 },
        role: { 
          required: true, 
          enum: ['super_admin', 'admin', 'user', 'viewer'] 
        }
      })
    });
  }

  // User-specific methods
  async changePassword(currentPassword, newPassword) {
    const response = await apiClient.post(`${this.endpoint}/${this.id}/change-password`, {
      current_password: currentPassword,
      new_password: newPassword
    });
    return response;
  }

  static async me() {
    const response = await apiClient.get('/users/me');
    if (response.success) {
      return new User(response.data);
    }
    return response;
  }

  static async logout() {
    return await apiClient.post('/auth/logout');
  }
}

// Organization entity
export class Organization extends BaseEntity {
  constructor(data = {}) {
    super(data, {
      entityName: 'organization',
      endpoint: '/organizations',
      primaryKey: 'id',
      validationSchema: new ValidationSchema({
        name: { required: true, type: 'string', minLength: 2 },
        subscription_tier: { 
          required: true, 
          enum: ['trial', 'basic', 'professional', 'enterprise'] 
        }
      })
    });
  }
}

// Asset entity
export class Asset extends BaseEntity {
  constructor(data = {}) {
    super(data, {
      entityName: 'asset',
      endpoint: '/assets',
      primaryKey: 'id',
      validationSchema: new ValidationSchema({
        name: { required: true, type: 'string', minLength: 1 },
        type: { 
          required: true, 
          enum: ['server', 'workstation', 'mobile_device', 'network_device', 'cloud_resource', 'application'] 
        },
        ip_address: {
          pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
        }
      })
    });
  }

  // Asset-specific methods
  async getFindings() {
    const response = await apiClient.get(`${this.endpoint}/${this.id}/findings`);
    if (response.success) {
      return response.data.map(data => new Finding(data));
    }
    return response;
  }

  async getVulnerabilities() {
    const response = await apiClient.get(`${this.endpoint}/${this.id}/vulnerabilities`);
    return response;
  }

  static async getByType(type) {
    return this.findBy({ type });
  }
}

// Finding entity
export class Finding extends BaseEntity {
  constructor(data = {}) {
    super(data, {
      entityName: 'finding',
      endpoint: '/findings',
      primaryKey: 'id',
      validationSchema: new ValidationSchema({
        title: { required: true, type: 'string', minLength: 5 },
        severity: { 
          required: true, 
          enum: ['critical', 'high', 'medium', 'low', 'info'] 
        },
        status: { 
          required: true, 
          enum: ['open', 'in_progress', 'resolved', 'false_positive', 'accepted'] 
        },
        asset_id: { required: true, type: 'string' }
      })
    });
  }

  // Finding-specific methods
  async resolve(resolution_notes = '') {
    this.status = 'resolved';
    this.resolution_notes = resolution_notes;
    this.resolved_at = new Date().toISOString();
    return await this.save();
  }

  async markFalsePositive(reason = '') {
    this.status = 'false_positive';
    this.false_positive_reason = reason;
    return await this.save();
  }

  static async getBySeverity(severity) {
    return this.findBy({ severity });
  }

  static async getByStatus(status) {
    return this.findBy({ status });
  }
}

// Vulnerability entity
export class Vulnerability extends BaseEntity {
  constructor(data = {}) {
    super(data, {
      entityName: 'vulnerability',
      endpoint: '/vulnerabilities',
      primaryKey: 'id',
      validationSchema: new ValidationSchema({
        cve_id: { type: 'string', pattern: /^CVE-\d{4}-\d{4,}$/ },
        cvss_score: { type: 'number', custom: (value) => value >= 0 && value <= 10 ? null : 'CVSS score must be between 0 and 10' },
        severity: { 
          required: true, 
          enum: ['critical', 'high', 'medium', 'low'] 
        },
        title: { required: true, type: 'string', minLength: 5 }
      })
    });
  }

  // Vulnerability-specific methods
  getSeverityFromCvss() {
    if (this.cvss_score >= 9.0) return 'critical';
    if (this.cvss_score >= 7.0) return 'high';
    if (this.cvss_score >= 4.0) return 'medium';
    return 'low';
  }

  static async getByCve(cveId) {
    return this.findFirst({ cve_id: cveId });
  }
}

// Incident entity
export class Incident extends BaseEntity {
  constructor(data = {}) {
    super(data, {
      entityName: 'incident',
      endpoint: '/incidents',
      primaryKey: 'id',
      validationSchema: new ValidationSchema({
        title: { required: true, type: 'string', minLength: 5 },
        type: { 
          required: true, 
          enum: ['malware', 'phishing', 'data_breach', 'ddos', 'insider_threat', 'authentication', 'vulnerability'] 
        },
        severity: { 
          required: true, 
          enum: ['critical', 'high', 'medium', 'low'] 
        },
        status: { 
          required: true, 
          enum: ['open', 'investigating', 'mitigating', 'resolved', 'closed'] 
        }
      })
    });
  }

  // Incident-specific methods
  async assignTo(userId) {
    this.assigned_to = userId;
    this.assigned_at = new Date().toISOString();
    return await this.save();
  }

  async addEvidence(evidence) {
    if (!this.evidence) this.evidence = [];
    this.evidence.push({
      ...evidence,
      added_at: new Date().toISOString()
    });
    return await this.save();
  }

  async close(resolution_notes = '') {
    this.status = 'closed';
    this.resolution_notes = resolution_notes;
    this.closed_at = new Date().toISOString();
    return await this.save();
  }
}

// Workflow entity for SOAR
export class Workflow extends BaseEntity {
  constructor(data = {}) {
    super(data, {
      entityName: 'workflow',
      endpoint: '/workflows',
      primaryKey: 'id',
      validationSchema: new ValidationSchema({
        name: { required: true, type: 'string', minLength: 3 },
        trigger: { required: true, type: 'object' },
        steps: { required: true, type: 'object' },
        enabled: { type: 'boolean' }
      })
    });
  }

  // Workflow-specific methods
  async execute(incidentId, params = {}) {
    const response = await apiClient.post(`${this.endpoint}/${this.id}/execute`, {
      incident_id: incidentId,
      params
    });
    return response;
  }

  async enable() {
    this.enabled = true;
    return await this.save();
  }

  async disable() {
    this.enabled = false;
    return await this.save();
  }
}

// Playbook entity for SOAR
export class Playbook extends BaseEntity {
  constructor(data = {}) {
    super(data, {
      entityName: 'playbook',
      endpoint: '/playbooks',
      primaryKey: 'id',
      validationSchema: new ValidationSchema({
        name: { required: true, type: 'string', minLength: 3 },
        category: { required: true, type: 'string' },
        severity: { 
          required: true, 
          enum: ['critical', 'high', 'medium', 'low'] 
        },
        actions: { required: true, type: 'object' }
      })
    });
  }

  // Playbook-specific methods
  async execute(params = {}) {
    const response = await apiClient.post(`${this.endpoint}/${this.id}/execute`, params);
    return response;
  }

  static async getByCategory(category) {
    return this.findBy({ category });
  }
}

// Network Device entity
export class NetworkDevice extends BaseEntity {
  constructor(data = {}) {
    super(data, {
      entityName: 'network_device',
      endpoint: '/network/devices',
      primaryKey: 'id',
      validationSchema: new ValidationSchema({
        name: { required: true, type: 'string', minLength: 1 },
        type: { 
          required: true, 
          enum: ['firewall', 'router', 'switch', 'access_point', 'load_balancer'] 
        },
        ip_address: {
          required: true,
          pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
        },
        vendor: { required: true, type: 'string' }
      })
    });
  }

  // Network device-specific methods
  async getConfiguration() {
    const response = await apiClient.get(`${this.endpoint}/${this.id}/configuration`);
    return response;
  }

  async testConnection() {
    const response = await apiClient.post(`${this.endpoint}/${this.id}/test-connection`);
    return response;
  }

  static async getByVendor(vendor) {
    return this.findBy({ vendor });
  }
}

// Partner entity
export class Partner extends BaseEntity {
  constructor(data = {}) {
    super(data, {
      entityName: 'partner',
      endpoint: '/partners',
      primaryKey: 'id',
      validationSchema: new ValidationSchema({
        name: { required: true, type: 'string', minLength: 2 },
        email: { 
          required: true, 
          type: 'string',
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        },
        status: { 
          required: true, 
          enum: ['pending_verification', 'verified', 'rejected'] 
        },
        tier: { 
          required: true, 
          enum: ['basic_partner', 'trusted_partner', 'premium_partner'] 
        }
      })
    });
  }

  // Partner-specific methods
  async approve() {
    this.status = 'verified';
    this.approved_at = new Date().toISOString();
    return await this.save();
  }

  async reject(reason = '') {
    this.status = 'rejected';
    this.rejection_reason = reason;
    this.rejected_at = new Date().toISOString();
    return await this.save();
  }

  static async getVerified() {
    return this.findBy({ status: 'verified' });
  }
}

// Compliance Check entity
export class ComplianceCheck extends BaseEntity {
  constructor(data = {}) {
    super(data, {
      entityName: 'compliance_check',
      endpoint: '/compliance/checks',
      primaryKey: 'id',
      validationSchema: new ValidationSchema({
        framework: { 
          required: true, 
          enum: ['SOC2', 'ISO27001', 'PCI_DSS', 'GDPR', 'HIPAA', 'NIST'] 
        },
        control_id: { required: true, type: 'string' },
        status: { 
          required: true, 
          enum: ['compliant', 'non_compliant', 'not_applicable', 'in_progress'] 
        },
        asset_id: { required: true, type: 'string' }
      })
    });
  }

  // Compliance-specific methods
  async markCompliant(evidence = '') {
    this.status = 'compliant';
    this.evidence = evidence;
    this.last_checked = new Date().toISOString();
    return await this.save();
  }

  async markNonCompliant(reason = '') {
    this.status = 'non_compliant';
    this.non_compliance_reason = reason;
    this.last_checked = new Date().toISOString();
    return await this.save();
  }

  static async getByFramework(framework) {
    return this.findBy({ framework });
  }
}

// Policy entity
export class Policy extends BaseEntity {
  constructor(data = {}) {
    super(data, {
      entityName: 'policy',
      endpoint: '/policies',
      primaryKey: 'id',
      validationSchema: new ValidationSchema({
        name: { required: true, type: 'string', minLength: 3 },
        type: { 
          required: true, 
          enum: ['security', 'privacy', 'compliance', 'operational'] 
        },
        status: { 
          required: true, 
          enum: ['draft', 'active', 'archived'] 
        }
      })
    });
  }

  // Policy-specific methods
  async activate() {
    this.status = 'active';
    this.activated_at = new Date().toISOString();
    return await this.save();
  }

  async archive() {
    this.status = 'archived';
    this.archived_at = new Date().toISOString();
    return await this.save();
  }

  static async getActive() {
    return this.findBy({ status: 'active' });
  }
}

// Export all entities
export {
  BaseEntity,
  User,
  Organization,
  Asset,
  Finding,
  Vulnerability,
  Incident,
  Workflow,
  Playbook,
  NetworkDevice,
  Partner,
  ComplianceCheck,
  Policy
};

// Create a registry for easy access
export const EntityRegistry = {
  User,
  Organization,
  Asset,
  Finding,
  Vulnerability,
  Incident,
  Workflow,
  Playbook,
  NetworkDevice,
  Partner,
  ComplianceCheck,
  Policy
};

export default EntityRegistry;
