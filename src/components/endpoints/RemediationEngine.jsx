import React, { useState, useEffect, useCallback } from 'react';
import { RemediationPlaybook, RemediationTask, RemediationEvent, Device } from '@/api/entities';
import { toast } from 'sonner';

// Simulated API integration functions
const simulateIntuneApiCall = async (action, deviceId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const responses = {
    'enable_bitlocker': { success: true, message: 'BitLocker policy deployed successfully' },
    'install_av': { success: Math.random() > 0.4, message: Math.random() > 0.4 ? 'AV installation completed' : 'AV installation failed - user intervention required' },
    'enable_firewall': { success: true, message: 'Windows Firewall enabled via policy' },
    'force_os_update': { success: Math.random() > 0.3, message: Math.random() > 0.3 ? 'OS update initiated' : 'OS update failed - manual intervention required' }
  };
  
  return responses[action] || { success: false, message: 'Unknown action' };
};

const simulateGoogleMdmCall = async (action, deviceId) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const responses = {
    'force_policy_sync': { success: true, message: 'Policy sync initiated successfully' },
    'push_os_update': { success: Math.random() > 0.2, message: Math.random() > 0.2 ? 'OS update pushed to device' : 'OS update push failed' },
    'enable_encryption': { success: true, message: 'Device encryption policy applied' }
  };
  
  return responses[action] || { success: false, message: 'Unknown action' };
};

export const RemediationEngine = {
  // Create remediation task for a non-compliant device
  async createRemediationTask(deviceId, issueType, triggerReason) {
    try {
      // Find appropriate playbook
      const playbooks = await RemediationPlaybook.filter({ issue_type: issueType, is_active: true });
      if (playbooks.length === 0) {
        console.warn(`No active playbook found for issue type: ${issueType}`);
        return null;
      }

      const playbook = playbooks[0]; // Take first active playbook
      const device = await Device.get(deviceId);
      
      // Check if playbook supports this device platform
      if (!playbook.platforms.includes(device.platform)) {
        console.warn(`Playbook ${playbook.name} doesn't support platform ${device.platform}`);
        return null;
      }

      // Create remediation task
      const task = await RemediationTask.create({
        device_id: deviceId,
        playbook_id: playbook.id,
        issue_type: issueType,
        trigger_reason: triggerReason,
        started_at: new Date().toISOString(),
        estimated_completion: new Date(Date.now() + playbook.estimated_duration * 60000).toISOString(),
        total_steps: playbook.steps.length,
        success_likelihood: playbook.success_rate,
        organization_id: device.organization_id
      });

      // Log task creation event
      await RemediationEvent.create({
        task_id: task.id,
        device_id: deviceId,
        event_type: 'task_created',
        message: `Remediation task created for ${issueType}`,
        details: { playbook_name: playbook.name, trigger_reason: triggerReason },
        organization_id: device.organization_id
      });

      // Start automatic remediation if possible
      if (playbook.automation_method !== 'manual_only') {
        this.executeRemediationTask(task.id);
      }

      return task;
    } catch (error) {
      console.error('Error creating remediation task:', error);
      return null;
    }
  },

  // Execute a remediation task
  async executeRemediationTask(taskId) {
    try {
      const task = await RemediationTask.get(taskId);
      const playbook = await RemediationPlaybook.get(task.playbook_id);
      const device = await Device.get(task.device_id);

      await RemediationTask.update(taskId, { 
        status: 'in_progress',
        automation_attempted: true
      });

      await RemediationEvent.create({
        task_id: taskId,
        device_id: task.device_id,
        event_type: 'automation_started',
        message: `Starting automated remediation using ${playbook.name}`,
        organization_id: device.organization_id
      });

      // Execute steps
      for (let i = 0; i < playbook.steps.length; i++) {
        const step = playbook.steps[i];
        
        await RemediationTask.update(taskId, { current_step: i + 1 });

        if (step.automated) {
          // Attempt automated fix
          let result;
          if (playbook.automation_method === 'intune_policy') {
            result = await simulateIntuneApiCall(step.api_call, task.device_id);
          } else if (playbook.automation_method === 'google_mdm') {
            result = await simulateGoogleMdmCall(step.api_call, task.device_id);
          }

          await RemediationEvent.create({
            task_id: taskId,
            device_id: task.device_id,
            event_type: 'step_completed',
            step_number: i + 1,
            message: result.success ? `Step ${i + 1}: ${result.message}` : `Step ${i + 1} failed: ${result.message}`,
            api_response: JSON.stringify(result),
            organization_id: device.organization_id
          });

          if (!result.success) {
            // Automation failed, require manual intervention
            await RemediationTask.update(taskId, {
              status: 'failed',
              manual_intervention_required: true,
              user_instructions: step.user_instruction,
              escalation_reason: `Automated step ${i + 1} failed: ${result.message}`
            });

            await RemediationEvent.create({
              task_id: taskId,
              device_id: task.device_id,
              event_type: 'user_action_required',
              step_number: i + 1,
              message: `Manual intervention required: ${step.user_instruction}`,
              organization_id: device.organization_id
            });

            return;
          }
        } else {
          // Manual step
          await RemediationTask.update(taskId, {
            status: 'failed',
            manual_intervention_required: true,
            user_instructions: step.user_instruction
          });

          await RemediationEvent.create({
            task_id: taskId,
            device_id: task.device_id,
            event_type: 'user_action_required',
            step_number: i + 1,
            message: `User action required: ${step.user_instruction}`,
            organization_id: device.organization_id
          });

          return;
        }
      }

      // All steps completed successfully
      await RemediationTask.update(taskId, {
        status: 'resolved',
        completed_at: new Date().toISOString()
      });

      await RemediationEvent.create({
        task_id: taskId,
        device_id: task.device_id,
        event_type: 'resolved',
        message: 'Remediation completed successfully',
        organization_id: device.organization_id
      });

      // Simulate device compliance improvement
      await Device.update(task.device_id, {
        compliance_percent: Math.min(100, device.compliance_percent + 25)
      });

      toast.success(`Remediation completed for device ${device.hostname}`);

    } catch (error) {
      console.error('Error executing remediation task:', error);
      
      await RemediationTask.update(taskId, {
        status: 'failed',
        escalation_reason: `System error: ${error.message}`
      });
    }
  },

  // Check remediation status (called by user)
  async checkRemediationStatus(taskId) {
    const task = await RemediationTask.get(taskId);
    const device = await Device.get(task.device_id);

    await RemediationEvent.create({
      task_id: taskId,
      device_id: task.device_id,
      event_type: 'user_check_requested',
      message: 'User requested compliance recheck',
      organization_id: device.organization_id
    });

    // Simulate compliance recheck
    const newCompliancePercent = Math.random() * 100;
    await Device.update(task.device_id, { compliance_percent: newCompliancePercent });

    if (newCompliancePercent >= 80) {
      await RemediationTask.update(taskId, {
        status: 'resolved',
        completed_at: new Date().toISOString()
      });
      
      toast.success('Device is now compliant!');
    } else {
      toast.info(`Compliance check complete. Current score: ${newCompliancePercent.toFixed(0)}%`);
    }

    return newCompliancePercent;
  }
};

export default function RemediationEngineProvider({ children }) {
  return <>{children}</>;
}