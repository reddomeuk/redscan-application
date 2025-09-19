/**
 * API Client Types and Interfaces
 * Type definitions for base44 API client and responses
 */

// ============================================================================
// BASE API TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: ApiError[];
  metadata?: ResponseMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, any>;
}

export interface ResponseMetadata {
  timestamp: string;
  requestId: string;
  version: string;
  pagination?: PaginationInfo;
  rateLimit?: RateLimitInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: string;
}

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface PaginatedRequest {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface FilterRequest {
  search?: string;
  filters?: Record<string, any>;
  dateRange?: DateRange;
}

export interface DateRange {
  start: string;
  end: string;
}

// ============================================================================
// ASSET TYPES
// ============================================================================

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  status: AssetStatus;
  riskLevel: RiskLevel;
  ipAddress?: string;
  hostname?: string;
  domain?: string;
  os?: OperatingSystem;
  services?: Service[];
  tags?: string[];
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
  metadata?: AssetMetadata;
}

export interface AssetMetadata {
  source: string;
  confidence: number;
  discoveryMethod: string;
  lastScanned?: string;
  scanResults?: ScanResult[];
}

export type AssetType = 
  | 'server' 
  | 'workstation' 
  | 'network_device' 
  | 'cloud_resource' 
  | 'web_application' 
  | 'database' 
  | 'container' 
  | 'unknown';

export type AssetStatus = 'active' | 'inactive' | 'archived' | 'pending';

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface OperatingSystem {
  family: string;
  name: string;
  version?: string;
  architecture?: string;
}

export interface Service {
  port: number;
  protocol: string;
  service: string;
  version?: string;
  banner?: string;
  state: 'open' | 'closed' | 'filtered';
}

// ============================================================================
// FINDING TYPES
// ============================================================================

export interface Finding {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  status: FindingStatus;
  category: FindingCategory;
  assetId: string;
  asset?: Asset;
  cve?: CVE[];
  cvss?: CVSSScore;
  remediation?: Remediation;
  evidence?: Evidence[];
  tags?: string[];
  assignedTo?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  metadata?: FindingMetadata;
}

export interface FindingMetadata {
  scanner: string;
  scanId: string;
  confidence: number;
  falsePositive: boolean;
  exploitable: boolean;
  publicExploit: boolean;
}

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type FindingStatus = 
  | 'open' 
  | 'in_progress' 
  | 'resolved' 
  | 'false_positive' 
  | 'accepted_risk' 
  | 'duplicate';

export type FindingCategory = 
  | 'vulnerability' 
  | 'misconfiguration' 
  | 'compliance' 
  | 'malware' 
  | 'anomaly' 
  | 'policy_violation';

export interface CVE {
  id: string;
  description: string;
  published: string;
  modified: string;
  cvss: CVSSScore;
  references: string[];
}

export interface CVSSScore {
  version: '2.0' | '3.0' | '3.1';
  vector: string;
  baseScore: number;
  temporalScore?: number;
  environmentalScore?: number;
  exploitabilityScore: number;
  impactScore: number;
}

export interface Remediation {
  description: string;
  steps: string[];
  effort: 'low' | 'medium' | 'high';
  priority: number;
  references: string[];
}

export interface Evidence {
  type: 'screenshot' | 'log' | 'network_capture' | 'file' | 'text';
  name: string;
  description?: string;
  data: string;
  mimeType?: string;
}

// ============================================================================
// SCAN TYPES
// ============================================================================

export interface ScanResult {
  id: string;
  scanId: string;
  assetId: string;
  status: ScanStatus;
  startTime: string;
  endTime?: string;
  duration?: number;
  findings: Finding[];
  statistics: ScanStatistics;
  metadata: ScanMetadata;
}

export interface ScanStatistics {
  totalFindings: number;
  findingsBySeverity: Record<Severity, number>;
  findingsByCategory: Record<FindingCategory, number>;
  assetsScanned: number;
  portsScanned?: number;
  servicesIdentified?: number;
}

export interface ScanMetadata {
  scanner: string;
  version: string;
  configuration: Record<string, any>;
  target: string;
  scanType: ScanType;
}

export type ScanStatus = 
  | 'queued' 
  | 'running' 
  | 'completed' 
  | 'failed' 
  | 'cancelled' 
  | 'paused';

export type ScanType = 
  | 'network' 
  | 'web_application' 
  | 'cloud' 
  | 'container' 
  | 'compliance' 
  | 'malware';

// ============================================================================
// CLOUD INTEGRATION TYPES
// ============================================================================

export interface CloudProvider {
  id: string;
  name: string;
  type: CloudProviderType;
  status: ConnectionStatus;
  config: CloudConfig;
  resources?: CloudResource[];
  lastSync?: string;
  createdAt: string;
  updatedAt: string;
}

export type CloudProviderType = 
  | 'aws' 
  | 'azure' 
  | 'gcp' 
  | 'github' 
  | 'docker' 
  | 'kubernetes';

export type ConnectionStatus = 
  | 'connected' 
  | 'disconnected' 
  | 'error' 
  | 'expired' 
  | 'pending';

export interface CloudConfig {
  region?: string;
  subscriptionId?: string;
  projectId?: string;
  accountId?: string;
  tenantId?: string;
  credentials?: CloudCredentials;
  scopes?: string[];
}

export interface CloudCredentials {
  type: 'oauth' | 'service_account' | 'access_key';
  data: Record<string, any>;
  expiresAt?: string;
}

export interface CloudResource {
  id: string;
  name: string;
  type: string;
  status: string;
  region?: string;
  tags?: Record<string, string>;
  metadata?: Record<string, any>;
  lastUpdated: string;
}

// ============================================================================
// COMPLIANCE TYPES
// ============================================================================

export interface ComplianceFramework {
  id: string;
  name: string;
  version: string;
  description: string;
  controls: ComplianceControl[];
  requirements: ComplianceRequirement[];
}

export interface ComplianceControl {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: Severity;
  status: ComplianceStatus;
  evidence?: Evidence[];
  lastAssessed?: string;
}

export interface ComplianceRequirement {
  id: string;
  title: string;
  description: string;
  controls: string[];
  status: ComplianceStatus;
  score?: number;
}

export type ComplianceStatus = 
  | 'compliant' 
  | 'non_compliant' 
  | 'partially_compliant' 
  | 'not_assessed';

export interface ComplianceReport {
  id: string;
  framework: string;
  scope: string;
  generatedAt: string;
  period: DateRange;
  summary: ComplianceSummary;
  findings: Finding[];
  recommendations: string[];
}

export interface ComplianceSummary {
  totalControls: number;
  compliantControls: number;
  nonCompliantControls: number;
  partiallyCompliantControls: number;
  notAssessedControls: number;
  overallScore: number;
}

// ============================================================================
// USER AND ORGANIZATION TYPES
// ============================================================================

export interface Organization {
  id: string;
  name: string;
  domain: string;
  type: OrganizationType;
  settings: OrganizationSettings;
  subscription?: Subscription;
  createdAt: string;
  updatedAt: string;
}

export type OrganizationType = 'enterprise' | 'sme' | 'startup' | 'individual';

export interface OrganizationSettings {
  timezone: string;
  dateFormat: string;
  currency: string;
  features: string[];
  integrations: Record<string, any>;
  security: SecuritySettings;
}

export interface SecuritySettings {
  passwordPolicy: PasswordPolicy;
  mfaRequired: boolean;
  sessionTimeout: number;
  ipWhitelist?: string[];
  auditLogRetention: number;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  maxAge: number;
  historyCount: number;
}

export interface Subscription {
  id: string;
  plan: string;
  status: SubscriptionStatus;
  features: string[];
  limits: SubscriptionLimits;
  billing: BillingInfo;
  expiresAt: string;
}

export type SubscriptionStatus = 'active' | 'inactive' | 'trial' | 'expired' | 'cancelled';

export interface SubscriptionLimits {
  assets: number;
  scans: number;
  users: number;
  storage: number;
  apiCalls: number;
}

export interface BillingInfo {
  currency: string;
  amount: number;
  interval: 'monthly' | 'yearly';
  nextBilling: string;
  paymentMethod?: string;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  severity: Severity;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  expiresAt?: string;
}

export type NotificationType = 
  | 'security_alert' 
  | 'scan_complete' 
  | 'finding_assigned' 
  | 'compliance_violation' 
  | 'system_update' 
  | 'billing_update';

// ============================================================================
// REPORT TYPES
// ============================================================================

export interface Report {
  id: string;
  name: string;
  type: ReportType;
  format: ReportFormat;
  status: ReportStatus;
  config: ReportConfig;
  generatedAt?: string;
  downloadUrl?: string;
  expiresAt?: string;
  createdBy: string;
}

export type ReportType = 
  | 'vulnerability' 
  | 'compliance' 
  | 'asset_inventory' 
  | 'executive_summary' 
  | 'trend_analysis';

export type ReportFormat = 'pdf' | 'csv' | 'json' | 'xml' | 'html';

export type ReportStatus = 'generating' | 'completed' | 'failed' | 'expired';

export interface ReportConfig {
  scope: string[];
  dateRange: DateRange;
  includeResolved: boolean;
  severityFilter?: Severity[];
  categories?: string[];
  customFields?: string[];
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type ID = string;

export type Timestamp = string;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type CreateRequest<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateRequest<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;

// ============================================================================
// API ENDPOINT TYPES
// ============================================================================

export interface ApiEndpoints {
  // Authentication
  login: '/api/auth/login';
  logout: '/api/auth/logout';
  refresh: '/api/auth/refresh';
  verify: '/api/auth/verify';
  
  // Assets
  assets: '/api/assets';
  asset: '/api/assets/:id';
  assetScans: '/api/assets/:id/scans';
  
  // Findings
  findings: '/api/findings';
  finding: '/api/findings/:id';
  findingResolve: '/api/findings/:id/resolve';
  
  // Scans
  scans: '/api/scans';
  scan: '/api/scans/:id';
  scanStart: '/api/scans/start';
  scanStop: '/api/scans/:id/stop';
  
  // Cloud
  cloudProviders: '/api/cloud/providers';
  cloudProvider: '/api/cloud/providers/:id';
  cloudConnect: '/api/cloud/connect';
  cloudDisconnect: '/api/cloud/disconnect/:id';
  
  // Compliance
  compliance: '/api/compliance';
  complianceFrameworks: '/api/compliance/frameworks';
  complianceReports: '/api/compliance/reports';
  
  // Reports
  reports: '/api/reports';
  report: '/api/reports/:id';
  reportGenerate: '/api/reports/generate';
  
  // Notifications
  notifications: '/api/notifications';
  notification: '/api/notifications/:id';
  notificationMarkRead: '/api/notifications/:id/read';
  
  // Organization
  organization: '/api/organization';
  organizationUsers: '/api/organization/users';
  organizationSettings: '/api/organization/settings';
}

export default ApiResponse;
