/**
 * SOAR Orchestration Engine
 * Handles Security Orchestration, Automation and Response workflows
 * Manages playbooks, incident response automation, and workflow execution
 */

import { EventEmitter } from '../utils/EventEmitter';

class SoarOrchestrationEngine extends EventEmitter {
  constructor() {
    super();
    this.workflows = new Map();
    this.playbooks = new Map();
    this.incidents = new Map();
    this.executions = new Map();
    this.integrations = new Map();
    this.automationRules = new Map();
    
    // Initialize default data
    this.initializeDefaultWorkflows();
    this.initializeDefaultPlaybooks();
    this.initializeDefaultIncidents();
    this.initializeIntegrations();
  }

  /**
   * Initialize default security workflows
   */
  initializeDefaultWorkflows() {
    const defaultWorkflows = [
      {
        id: 'wf_malware_response',
        name: 'Malware Detection Response',
        description: 'Automated response to malware detection alerts',
        enabled: true,
        trigger: {
          type: 'alert',
          conditions: {
            alertType: 'malware_detected',
            severity: ['high', 'critical']
          }
        },
        steps: [
          {
            id: 'step_1',
            name: 'Isolate Affected System',
            type: 'action',
            action: 'isolate_endpoint',
            timeout: 30
          },
          {
            id: 'step_2',
            name: 'Collect Forensic Data',
            type: 'action',
            action: 'collect_forensics',
            timeout: 300
          },
          {
            id: 'step_3',
            name: 'Analyze Sample',
            type: 'action',
            action: 'analyze_malware',
            timeout: 600
          },
          {
            id: 'step_4',
            name: 'Update IOCs',
            type: 'action',
            action: 'update_threat_intelligence',
            timeout: 60
          },
          {
            id: 'step_5',
            name: 'Notify Security Team',
            type: 'notification',
            action: 'send_alert',
            timeout: 30
          }
        ],
        executionCount: 42,
        successRate: 94.5
      },
      {
        id: 'wf_phishing_response',
        name: 'Phishing Email Response',
        description: 'Automated response to phishing email detection',
        enabled: true,
        trigger: {
          type: 'email_analysis',
          conditions: {
            phishingScore: { min: 0.8 }
          }
        },
        steps: [
          {
            id: 'step_1',
            name: 'Block Sender Domain',
            type: 'action',
            action: 'block_domain',
            timeout: 30
          },
          {
            id: 'step_2',
            name: 'Quarantine Similar Emails',
            type: 'action',
            action: 'quarantine_emails',
            timeout: 120
          },
          {
            id: 'step_3',
            name: 'Update Email Filters',
            type: 'action',
            action: 'update_email_rules',
            timeout: 60
          },
          {
            id: 'step_4',
            name: 'User Awareness Alert',
            type: 'notification',
            action: 'user_notification',
            timeout: 30
          }
        ],
        executionCount: 156,
        successRate: 98.2
      },
      {
        id: 'wf_failed_login_response',
        name: 'Failed Login Response',
        description: 'Response to suspicious failed login attempts',
        enabled: true,
        trigger: {
          type: 'authentication',
          conditions: {
            failedAttempts: { min: 5 },
            timeWindow: 300 // 5 minutes
          }
        },
        steps: [
          {
            id: 'step_1',
            name: 'Lock User Account',
            type: 'action',
            action: 'lock_account',
            timeout: 30
          },
          {
            id: 'step_2',
            name: 'Block Source IP',
            type: 'action',
            action: 'block_ip',
            timeout: 30
          },
          {
            id: 'step_3',
            name: 'Analyze Login Patterns',
            type: 'analysis',
            action: 'analyze_behavior',
            timeout: 180
          },
          {
            id: 'step_4',
            name: 'Notify User',
            type: 'notification',
            action: 'user_alert',
            timeout: 30
          }
        ],
        executionCount: 89,
        successRate: 91.2
      },
      {
        id: 'wf_vulnerability_response',
        name: 'Critical Vulnerability Response',
        description: 'Automated response to critical vulnerability detection',
        enabled: true,
        trigger: {
          type: 'vulnerability_scan',
          conditions: {
            cvssScore: { min: 9.0 },
            exploitAvailable: true
          }
        },
        steps: [
          {
            id: 'step_1',
            name: 'Assess Affected Systems',
            type: 'discovery',
            action: 'scan_affected_systems',
            timeout: 300
          },
          {
            id: 'step_2',
            name: 'Apply Emergency Patches',
            type: 'action',
            action: 'emergency_patch',
            timeout: 1800
          },
          {
            id: 'step_3',
            name: 'Verify Patch Success',
            type: 'verification',
            action: 'verify_patch',
            timeout: 300
          },
          {
            id: 'step_4',
            name: 'Update Asset Inventory',
            type: 'action',
            action: 'update_inventory',
            timeout: 120
          }
        ],
        executionCount: 23,
        successRate: 87.5
      }
    ];

    defaultWorkflows.forEach(workflow => {
      this.workflows.set(workflow.id, workflow);
    });
  }

  /**
   * Initialize default security playbooks
   */
  initializeDefaultPlaybooks() {
    const defaultPlaybooks = [
      {
        id: 'pb_incident_response',
        name: 'Security Incident Response',
        description: 'Comprehensive incident response procedures',
        category: 'Incident Response',
        severity: 'high',
        actions: [
          {
            id: 'action_1',
            name: 'Initial Assessment',
            description: 'Assess the scope and impact of the incident',
            type: 'manual',
            estimatedTime: 15
          },
          {
            id: 'action_2',
            name: 'Containment',
            description: 'Contain the incident to prevent further damage',
            type: 'automated',
            estimatedTime: 5
          },
          {
            id: 'action_3',
            name: 'Evidence Collection',
            description: 'Collect and preserve digital evidence',
            type: 'semi-automated',
            estimatedTime: 30
          },
          {
            id: 'action_4',
            name: 'Impact Analysis',
            description: 'Analyze the full impact of the incident',
            type: 'manual',
            estimatedTime: 45
          },
          {
            id: 'action_5',
            name: 'Recovery Planning',
            description: 'Develop and execute recovery plan',
            type: 'manual',
            estimatedTime: 60
          }
        ]
      },
      {
        id: 'pb_malware_analysis',
        name: 'Malware Analysis Protocol',
        description: 'Standard procedures for malware analysis and response',
        category: 'Malware',
        severity: 'critical',
        actions: [
          {
            id: 'action_1',
            name: 'Sample Isolation',
            description: 'Safely isolate malware sample',
            type: 'automated',
            estimatedTime: 2
          },
          {
            id: 'action_2',
            name: 'Static Analysis',
            description: 'Perform static analysis of the sample',
            type: 'automated',
            estimatedTime: 10
          },
          {
            id: 'action_3',
            name: 'Dynamic Analysis',
            description: 'Execute sample in sandbox environment',
            type: 'automated',
            estimatedTime: 20
          },
          {
            id: 'action_4',
            name: 'IOC Extraction',
            description: 'Extract indicators of compromise',
            type: 'automated',
            estimatedTime: 5
          },
          {
            id: 'action_5',
            name: 'Threat Intelligence Update',
            description: 'Update threat intelligence feeds',
            type: 'automated',
            estimatedTime: 3
          }
        ]
      },
      {
        id: 'pb_data_breach',
        name: 'Data Breach Response',
        description: 'Response procedures for data breach incidents',
        category: 'Data Protection',
        severity: 'critical',
        actions: [
          {
            id: 'action_1',
            name: 'Breach Verification',
            description: 'Verify and assess the breach',
            type: 'manual',
            estimatedTime: 30
          },
          {
            id: 'action_2',
            name: 'Legal Notification',
            description: 'Notify legal and compliance teams',
            type: 'manual',
            estimatedTime: 15
          },
          {
            id: 'action_3',
            name: 'Customer Notification',
            description: 'Prepare customer notification',
            type: 'manual',
            estimatedTime: 120
          },
          {
            id: 'action_4',
            name: 'Regulatory Reporting',
            description: 'File required regulatory reports',
            type: 'manual',
            estimatedTime: 180
          }
        ]
      },
      {
        id: 'pb_ddos_mitigation',
        name: 'DDoS Attack Mitigation',
        description: 'Procedures for DDoS attack response and mitigation',
        category: 'Network Security',
        severity: 'high',
        actions: [
          {
            id: 'action_1',
            name: 'Traffic Analysis',
            description: 'Analyze attack traffic patterns',
            type: 'automated',
            estimatedTime: 5
          },
          {
            id: 'action_2',
            name: 'Rate Limiting',
            description: 'Implement rate limiting rules',
            type: 'automated',
            estimatedTime: 2
          },
          {
            id: 'action_3',
            name: 'WAF Configuration',
            description: 'Update WAF rules and filters',
            type: 'semi-automated',
            estimatedTime: 10
          },
          {
            id: 'action_4',
            name: 'CDN Activation',
            description: 'Activate DDoS protection service',
            type: 'automated',
            estimatedTime: 3
          }
        ]
      },
      {
        id: 'pb_insider_threat',
        name: 'Insider Threat Investigation',
        description: 'Investigation procedures for insider threat incidents',
        category: 'Insider Threat',
        severity: 'medium',
        actions: [
          {
            id: 'action_1',
            name: 'User Activity Analysis',
            description: 'Analyze user activity patterns',
            type: 'automated',
            estimatedTime: 30
          },
          {
            id: 'action_2',
            name: 'Access Review',
            description: 'Review user access permissions',
            type: 'manual',
            estimatedTime: 45
          },
          {
            id: 'action_3',
            name: 'Data Access Audit',
            description: 'Audit data access logs',
            type: 'semi-automated',
            estimatedTime: 60
          },
          {
            id: 'action_4',
            name: 'HR Coordination',
            description: 'Coordinate with HR department',
            type: 'manual',
            estimatedTime: 30
          }
        ]
      }
    ];

    defaultPlaybooks.forEach(playbook => {
      this.playbooks.set(playbook.id, playbook);
    });
  }

  /**
   * Initialize sample incidents
   */
  initializeDefaultIncidents() {
    const defaultIncidents = [
      {
        id: 'inc_001',
        title: 'Malware Detection on Workstation',
        description: 'Trojan detected on employee workstation in accounting department',
        type: 'Malware',
        severity: 'high',
        status: 'open',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        assignedTo: 'security_team',
        affectedAssets: ['WS-ACC-001'],
        evidence: [],
        automatedActions: ['isolate_endpoint', 'collect_forensics']
      },
      {
        id: 'inc_002',
        title: 'Suspicious Failed Login Attempts',
        description: 'Multiple failed login attempts from foreign IP addresses',
        type: 'Authentication',
        severity: 'medium',
        status: 'investigating',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        assignedTo: 'soc_analyst',
        affectedAssets: ['AUTH-SYS-001'],
        evidence: [],
        automatedActions: ['block_ip', 'lock_account']
      },
      {
        id: 'inc_003',
        title: 'Critical Vulnerability Detected',
        description: 'CVE-2024-1234 detected on production web server',
        type: 'Vulnerability',
        severity: 'critical',
        status: 'open',
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        assignedTo: 'security_team',
        affectedAssets: ['WEB-PROD-001'],
        evidence: [],
        automatedActions: ['emergency_patch', 'scan_affected_systems']
      },
      {
        id: 'inc_004',
        title: 'Phishing Email Campaign',
        description: 'Large-scale phishing campaign targeting employees',
        type: 'Phishing',
        severity: 'high',
        status: 'resolved',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        resolvedAt: new Date(Date.now() - 20 * 60 * 60 * 1000), // 20 hours ago
        assignedTo: 'security_team',
        affectedAssets: ['EMAIL-SYS-001'],
        evidence: [],
        automatedActions: ['block_domain', 'quarantine_emails', 'user_notification']
      },
      {
        id: 'inc_005',
        title: 'DDoS Attack in Progress',
        description: 'Distributed denial of service attack targeting main website',
        type: 'Network Attack',
        severity: 'high',
        status: 'mitigating',
        createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        assignedTo: 'network_team',
        affectedAssets: ['WEB-MAIN-001', 'LB-PROD-001'],
        evidence: [],
        automatedActions: ['rate_limiting', 'waf_update', 'cdn_activation']
      }
    ];

    defaultIncidents.forEach(incident => {
      this.incidents.set(incident.id, incident);
    });
  }

  /**
   * Initialize security tool integrations
   */
  initializeIntegrations() {
    const integrations = [
      {
        id: 'siem_splunk',
        name: 'Splunk SIEM',
        type: 'SIEM',
        status: 'connected',
        capabilities: ['log_ingestion', 'alert_generation', 'search'],
        lastSync: new Date()
      },
      {
        id: 'edr_crowdstrike',
        name: 'CrowdStrike EDR',
        type: 'EDR',
        status: 'connected',
        capabilities: ['endpoint_isolation', 'forensics', 'threat_hunting'],
        lastSync: new Date()
      },
      {
        id: 'email_proofpoint',
        name: 'Proofpoint Email Security',
        type: 'Email Security',
        status: 'connected',
        capabilities: ['email_quarantine', 'url_analysis', 'attachment_sandboxing'],
        lastSync: new Date()
      },
      {
        id: 'firewall_paloalto',
        name: 'Palo Alto Firewall',
        type: 'Firewall',
        status: 'connected',
        capabilities: ['traffic_blocking', 'rule_management', 'threat_prevention'],
        lastSync: new Date()
      },
      {
        id: 'threat_intel_misp',
        name: 'MISP Threat Intelligence',
        type: 'Threat Intelligence',
        status: 'connected',
        capabilities: ['ioc_sharing', 'threat_feeds', 'attribution'],
        lastSync: new Date()
      }
    ];

    integrations.forEach(integration => {
      this.integrations.set(integration.id, integration);
    });
  }

  /**
   * Execute a workflow for an incident
   */
  async executeWorkflow(workflowId, incidentId, params = {}) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow || !workflow.enabled) {
      throw new Error('Workflow not found or disabled');
    }

    const execution = {
      id: this.generateExecutionId(),
      workflowId,
      incidentId,
      startedAt: new Date(),
      status: 'running',
      currentStep: 0,
      totalSteps: workflow.steps.length,
      stepResults: [],
      progress: 0,
      errors: []
    };

    this.executions.set(execution.id, execution);

    try {
      // Execute workflow steps
      for (let i = 0; i < workflow.steps.length; i++) {
        const step = workflow.steps[i];
        execution.currentStep = i + 1;
        execution.progress = Math.round(((i + 1) / workflow.steps.length) * 100);

        this.emit('workflowExecuted', {
          workflowId,
          executionId: execution.id,
          currentStep: execution.currentStep,
          totalSteps: execution.totalSteps,
          progress: execution.progress,
          stepName: step.name
        });

        // Simulate step execution
        const stepResult = await this.executeWorkflowStep(step, incidentId, params);
        execution.stepResults.push(stepResult);

        // Check if step failed
        if (!stepResult.success) {
          execution.status = 'failed';
          execution.errors.push(`Step ${step.name} failed: ${stepResult.error}`);
          break;
        }

        // Simulate execution time
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (execution.status !== 'failed') {
        execution.status = 'completed';
        execution.completedAt = new Date();
        
        // Update workflow execution count
        workflow.executionCount = (workflow.executionCount || 0) + 1;
      }

      this.emit('workflowCompleted', {
        workflowId,
        executionId: execution.id,
        status: execution.status,
        duration: execution.completedAt ? 
          execution.completedAt.getTime() - execution.startedAt.getTime() : null
      });

      return execution;
    } catch (error) {
      execution.status = 'failed';
      execution.errors.push(error.message);
      this.emit('workflowFailed', { workflowId, executionId: execution.id, error: error.message });
      throw error;
    }
  }

  /**
   * Execute a single workflow step
   */
  async executeWorkflowStep(step, incidentId, params) {
    try {
      switch (step.action) {
        case 'isolate_endpoint':
          return await this.isolateEndpoint(incidentId, params);
        
        case 'collect_forensics':
          return await this.collectForensics(incidentId, params);
        
        case 'analyze_malware':
          return await this.analyzeMalware(incidentId, params);
        
        case 'update_threat_intelligence':
          return await this.updateThreatIntelligence(incidentId, params);
        
        case 'send_alert':
          return await this.sendAlert(incidentId, params);
        
        case 'block_domain':
          return await this.blockDomain(incidentId, params);
        
        case 'quarantine_emails':
          return await this.quarantineEmails(incidentId, params);
        
        case 'update_email_rules':
          return await this.updateEmailRules(incidentId, params);
        
        case 'user_notification':
          return await this.sendUserNotification(incidentId, params);
        
        case 'lock_account':
          return await this.lockAccount(incidentId, params);
        
        case 'block_ip':
          return await this.blockIP(incidentId, params);
        
        case 'analyze_behavior':
          return await this.analyzeBehavior(incidentId, params);
        
        case 'user_alert':
          return await this.sendUserAlert(incidentId, params);
        
        default:
          return { success: false, error: `Unknown action: ${step.action}` };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Workflow action implementations
   */
  async isolateEndpoint(incidentId, params) {
    // Simulate endpoint isolation
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { 
      success: true, 
      message: 'Endpoint isolated successfully',
      details: {
        endpoint: params.endpoint || 'WS-001',
        isolatedAt: new Date(),
        method: 'network_quarantine'
      }
    };
  }

  async collectForensics(incidentId, params) {
    // Simulate forensic data collection
    await new Promise(resolve => setTimeout(resolve, 5000));
    return { 
      success: true, 
      message: 'Forensic data collected',
      details: {
        dataTypes: ['memory_dump', 'disk_image', 'network_logs'],
        collectedAt: new Date(),
        size: '2.5 GB'
      }
    };
  }

  async analyzeMalware(incidentId, params) {
    // Simulate malware analysis
    await new Promise(resolve => setTimeout(resolve, 10000));
    return { 
      success: true, 
      message: 'Malware analysis completed',
      details: {
        malwareFamily: 'TrojanDownloader',
        threatLevel: 'high',
        iocs: ['hash123', 'domain.evil.com', '192.168.1.100']
      }
    };
  }

  async updateThreatIntelligence(incidentId, params) {
    // Simulate threat intelligence update
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { 
      success: true, 
      message: 'Threat intelligence updated',
      details: {
        feedsUpdated: ['internal', 'commercial', 'open_source'],
        newIOCs: 15
      }
    };
  }

  async sendAlert(incidentId, params) {
    // Simulate alert sending
    await new Promise(resolve => setTimeout(resolve, 500));
    return { 
      success: true, 
      message: 'Alert sent to security team',
      details: {
        recipients: ['security@company.com', 'soc@company.com'],
        sentAt: new Date()
      }
    };
  }

  async blockDomain(incidentId, params) {
    // Simulate domain blocking
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { 
      success: true, 
      message: 'Domain blocked successfully',
      details: {
        domain: params.domain || 'phishing.evil.com',
        blockedAt: new Date(),
        method: 'dns_blacklist'
      }
    };
  }

  async quarantineEmails(incidentId, params) {
    // Simulate email quarantine
    await new Promise(resolve => setTimeout(resolve, 3000));
    return { 
      success: true, 
      message: 'Emails quarantined',
      details: {
        emailsQuarantined: 47,
        quarantinedAt: new Date()
      }
    };
  }

  async updateEmailRules(incidentId, params) {
    // Simulate email rule update
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { 
      success: true, 
      message: 'Email rules updated',
      details: {
        rulesAdded: 3,
        updatedAt: new Date()
      }
    };
  }

  async sendUserNotification(incidentId, params) {
    // Simulate user notification
    await new Promise(resolve => setTimeout(resolve, 500));
    return { 
      success: true, 
      message: 'User notification sent',
      details: {
        usersNotified: 1247,
        sentAt: new Date()
      }
    };
  }

  async lockAccount(incidentId, params) {
    // Simulate account locking
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { 
      success: true, 
      message: 'Account locked successfully',
      details: {
        account: params.account || 'user.suspicious',
        lockedAt: new Date()
      }
    };
  }

  async blockIP(incidentId, params) {
    // Simulate IP blocking
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { 
      success: true, 
      message: 'IP address blocked',
      details: {
        ip: params.ip || '192.168.1.100',
        blockedAt: new Date(),
        duration: '24 hours'
      }
    };
  }

  async analyzeBehavior(incidentId, params) {
    // Simulate behavior analysis
    await new Promise(resolve => setTimeout(resolve, 5000));
    return { 
      success: true, 
      message: 'Behavior analysis completed',
      details: {
        anomaliesDetected: 3,
        riskScore: 75,
        analyzedAt: new Date()
      }
    };
  }

  async sendUserAlert(incidentId, params) {
    // Simulate user alert
    await new Promise(resolve => setTimeout(resolve, 500));
    return { 
      success: true, 
      message: 'User alert sent',
      details: {
        alertType: 'security_warning',
        sentAt: new Date()
      }
    };
  }

  /**
   * Pause workflow execution
   */
  async pauseWorkflow(executionId) {
    const execution = this.executions.get(executionId);
    if (execution && execution.status === 'running') {
      execution.status = 'paused';
      execution.pausedAt = new Date();
      
      this.emit('workflowPaused', { executionId });
      return { success: true };
    }
    return { success: false, error: 'Execution not found or not running' };
  }

  /**
   * Resume workflow execution
   */
  async resumeWorkflow(executionId) {
    const execution = this.executions.get(executionId);
    if (execution && execution.status === 'paused') {
      execution.status = 'running';
      execution.resumedAt = new Date();
      
      this.emit('workflowResumed', { executionId });
      return { success: true };
    }
    return { success: false, error: 'Execution not found or not paused' };
  }

  /**
   * Stop workflow execution
   */
  async stopWorkflow(executionId) {
    const execution = this.executions.get(executionId);
    if (execution && ['running', 'paused'].includes(execution.status)) {
      execution.status = 'stopped';
      execution.stoppedAt = new Date();
      
      this.emit('workflowStopped', { executionId });
      return { success: true };
    }
    return { success: false, error: 'Execution not found or cannot be stopped' };
  }

  /**
   * Create new incident
   */
  createIncident(incidentData) {
    const incident = {
      id: this.generateIncidentId(),
      title: incidentData.title,
      description: incidentData.description,
      type: incidentData.type,
      severity: incidentData.severity,
      status: 'open',
      createdAt: new Date(),
      assignedTo: incidentData.assignedTo || 'security_team',
      affectedAssets: incidentData.affectedAssets || [],
      evidence: [],
      automatedActions: []
    };

    this.incidents.set(incident.id, incident);
    
    // Check for automation triggers
    this.checkAutomationTriggers(incident);
    
    this.emit('incidentCreated', incident);
    return incident;
  }

  /**
   * Check if incident triggers any automated workflows
   */
  checkAutomationTriggers(incident) {
    const workflows = Array.from(this.workflows.values());
    
    workflows.forEach(workflow => {
      if (workflow.enabled && this.matchesTrigger(workflow.trigger, incident)) {
        // Auto-execute workflow
        this.executeWorkflow(workflow.id, incident.id);
        
        this.emit('automationTriggered', {
          workflowId: workflow.id,
          incidentId: incident.id,
          trigger: workflow.trigger
        });
      }
    });
  }

  /**
   * Check if incident matches workflow trigger conditions
   */
  matchesTrigger(trigger, incident) {
    switch (trigger.type) {
      case 'alert':
        return trigger.conditions.alertType === incident.type &&
               trigger.conditions.severity.includes(incident.severity);
      
      case 'email_analysis':
        return incident.type === 'Phishing';
      
      case 'authentication':
        return incident.type === 'Authentication';
      
      case 'vulnerability_scan':
        return incident.type === 'Vulnerability' && 
               incident.severity === 'critical';
      
      default:
        return false;
    }
  }

  /**
   * Get all workflows
   */
  getWorkflows() {
    return Array.from(this.workflows.values());
  }

  /**
   * Get all playbooks
   */
  getPlaybooks() {
    return Array.from(this.playbooks.values());
  }

  /**
   * Get all incidents
   */
  getIncidents() {
    return Array.from(this.incidents.values()).sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  /**
   * Get active workflow executions
   */
  getActiveWorkflows() {
    return Array.from(this.executions.values())
      .filter(execution => ['running', 'paused'].includes(execution.status))
      .map(execution => {
        const workflow = this.workflows.get(execution.workflowId);
        return {
          ...execution,
          name: workflow?.name || 'Unknown Workflow',
          description: workflow?.description || ''
        };
      });
  }

  /**
   * Get automation statistics
   */
  getAutomationStatistics() {
    const executions = Array.from(this.executions.values());
    const workflows = Array.from(this.workflows.values());
    
    const successfulExecutions = executions.filter(e => e.status === 'completed').length;
    const totalExecutions = executions.length;
    const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;
    
    const completedExecutions = executions.filter(e => e.completedAt);
    const averageExecutionTime = completedExecutions.length > 0 ? 
      completedExecutions.reduce((sum, e) => 
        sum + (e.completedAt.getTime() - e.startedAt.getTime()), 0
      ) / (completedExecutions.length * 1000) : 0; // in seconds
    
    const totalWorkflowExecutions = workflows.reduce((sum, w) => sum + (w.executionCount || 0), 0);
    
    return {
      successfulExecutions,
      totalExecutions,
      successRate: Math.round(successRate),
      averageExecutionTime: Math.round(averageExecutionTime),
      automationRate: 85, // Simulated automation coverage
      averageResponseTime: 12, // Simulated average response time in minutes
      fastestResponse: 2, // Simulated fastest response in minutes
      slaCompliance: 94, // Simulated SLA compliance percentage
      timesSaved: Math.round(totalWorkflowExecutions * 0.75) // Simulated time saved in hours
    };
  }

  /**
   * Generate unique IDs
   */
  generateExecutionId() {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateIncidentId() {
    return `inc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Create and export singleton instance
const soarOrchestrationEngine = new SoarOrchestrationEngine();

export default soarOrchestrationEngine;
export { SoarOrchestrationEngine };
