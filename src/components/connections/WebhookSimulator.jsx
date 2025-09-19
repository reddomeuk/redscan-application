import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ItsmAuditLog, ItsmSyncEvent, SyncQueueItem } from '@/api/entities';
import { Webhook, Play, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const SAMPLE_PAYLOADS = {
  servicenow: {
    incident_created: `{
  "record": {
    "sys_id": "abc123",
    "number": "INC0010001",
    "state": "1",
    "short_description": "SAST finding: SQL injection in login form",
    "description": "A SQL injection vulnerability was discovered in the user login form...",
    "priority": "1",
    "assigned_to": "admin",
    "u_external_id": "RSC-001"
  },
  "operation": "insert",
  "table": "incident"
}`,
    incident_updated: `{
  "record": {
    "sys_id": "abc123",
    "number": "INC0010001",
    "state": "2",
    "work_notes": "Security team investigating the SQL injection vulnerability"
  },
  "operation": "update",
  "table": "incident"
}`
  },
  jira: {
    issue_created: `{
  "issue": {
    "key": "SEC-123",
    "id": "10001",
    "fields": {
      "summary": "DAST finding: Cross-site scripting vulnerability",
      "description": "XSS vulnerability found in search functionality...",
      "priority": {"name": "High"},
      "status": {"name": "To Do"},
      "assignee": {"emailAddress": "analyst@company.com"},
      "customfield_external_id": "RSC-002"
    }
  },
  "webhookEvent": "jira:issue_created"
}`,
    issue_updated: `{
  "issue": {
    "key": "SEC-123",
    "id": "10001",
    "fields": {
      "status": {"name": "In Progress"}
    }
  },
  "comment": {
    "body": "Investigation started - vulnerability confirmed in production"
  },
  "webhookEvent": "jira:issue_updated"
}`
  }
};

export default function WebhookSimulator() {
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState('servicenow');
  const [payload, setPayload] = useState('');
  const [results, setResults] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handlePlatformChange = (newPlatform) => {
    setPlatform(newPlatform);
    setPayload('');
    setResults(null);
  };

  const loadSamplePayload = (eventType) => {
    setPayload(SAMPLE_PAYLOADS[platform][eventType]);
  };

  const processWebhook = async () => {
    if (!payload.trim()) {
      toast.error('Please enter a payload');
      return;
    }

    setProcessing(true);
    
    try {
      const data = JSON.parse(payload);
      
      // Simulate webhook processing
      let ticketId, externalId, action, outcome = 'success', details;
      
      if (platform === 'servicenow') {
        ticketId = `TICKET-${Date.now()}`;
        externalId = data.record?.number || data.record?.sys_id;
        action = data.operation === 'insert' ? 'create' : 'update';
        details = `ServiceNow ${action}: ${data.record?.short_description || 'Updated incident'}`;
      } else if (platform === 'jira') {
        ticketId = `TICKET-${Date.now()}`;
        externalId = data.issue?.key;
        action = data.webhookEvent?.includes('created') ? 'create' : 'update';
        details = `Jira ${action}: ${data.issue?.fields?.summary || 'Updated issue'}`;
      }

      // Check for idempotency (same external_id)
      const existingEvents = await ItsmSyncEvent.filter({ 
        external_id: externalId,
        organization_id: 'demo-org-1' 
      });

      let isUpdate = existingEvents.length > 0;
      let actualAction = isUpdate ? 'update' : 'create';

      // Create audit log
      await ItsmAuditLog.create({
        platform,
        action: actualAction,
        trace_id: `TRACE-${Date.now()}`,
        external_id: externalId,
        user_email: 'webhook@redscan.ai',
        outcome,
        details: isUpdate ? `${details} (idempotent update)` : details,
        product_group: 'devsecops',
        organization_id: 'demo-org-1'
      });

      // Create sync event
      await ItsmSyncEvent.create({
        platform,
        event_type: isUpdate ? 'ticket_updated' : 'ticket_created',
        status: 'success',
        ticket_id: ticketId,
        external_id: externalId,
        product_group: 'devsecops',
        organization_id: 'demo-org-1'
      });

      // Add to queue for outbound sync if needed
      await SyncQueueItem.create({
        platform,
        action: 'sync_response',
        ticket_id: ticketId,
        external_id: externalId,
        payload: { response: 'acknowledged' },
        status: 'completed',
        attempts: 1,
        organization_id: 'demo-org-1'
      });

      setResults({
        success: true,
        ticketId,
        externalId,
        action: actualAction,
        isIdempotent: isUpdate,
        message: isUpdate 
          ? 'Existing ticket updated (idempotent operation)' 
          : 'New ticket created successfully'
      });

      toast.success('Webhook processed successfully');
      
    } catch (error) {
      setResults({
        success: false,
        error: error.message,
        message: 'Failed to process webhook payload'
      });
      toast.error('Failed to process webhook');
    }
    
    setProcessing(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Webhook className="w-4 h-4 mr-2" />
          Webhook Simulator
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Webhook className="w-5 h-5 text-purple-400" />
            Inbound Webhook Simulator
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Platform Selection */}
          <div className="space-y-2">
            <Label className="text-slate-300">Platform</Label>
            <Select value={platform} onValueChange={handlePlatformChange}>
              <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="servicenow" className="text-white">ServiceNow</SelectItem>
                <SelectItem value="jira" className="text-white">Jira</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sample Payloads */}
          <div className="space-y-2">
            <Label className="text-slate-300">Quick Load Sample</Label>
            <div className="flex gap-2">
              {Object.keys(SAMPLE_PAYLOADS[platform]).map(eventType => (
                <Button
                  key={eventType}
                  onClick={() => loadSamplePayload(eventType)}
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300"
                >
                  {eventType.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>

          {/* Payload Input */}
          <div className="space-y-2">
            <Label className="text-slate-300">JSON Payload</Label>
            <Textarea
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              placeholder={`Paste your ${platform} webhook payload here...`}
              className="bg-slate-900/50 border-slate-700 text-white font-mono text-sm min-h-[300px]"
            />
          </div>

          {/* Process Button */}
          <div className="flex justify-center">
            <Button 
              onClick={processWebhook}
              disabled={processing || !payload.trim()}
              className="bg-purple-600 hover:bg-purple-700 px-8"
            >
              <Play className="w-4 h-4 mr-2" />
              {processing ? 'Processing...' : 'Process Webhook'}
            </Button>
          </div>

          {/* Results */}
          {results && (
            <Card className={`${results.success ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  {results.success ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  )}
                  Processing Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-slate-300">Status:</span>
                  <Badge className={results.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                    {results.success ? 'Success' : 'Failed'}
                  </Badge>
                </div>
                
                {results.success && (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300">Ticket ID:</span>
                      <span className="text-white font-mono">{results.ticketId}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300">External ID:</span>
                      <span className="text-white font-mono">{results.externalId}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300">Action:</span>
                      <Badge variant="outline" className="border-slate-600 text-slate-300 capitalize">
                        {results.action}
                      </Badge>
                    </div>
                    {results.isIdempotent && (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-300 text-sm">Idempotent operation detected</span>
                      </div>
                    )}
                  </>
                )}
                
                <div>
                  <span className="text-slate-300">Message:</span>
                  <p className={`mt-1 ${results.success ? 'text-green-300' : 'text-red-300'}`}>
                    {results.message}
                  </p>
                </div>

                {!results.success && results.error && (
                  <div>
                    <span className="text-slate-300">Error:</span>
                    <p className="mt-1 text-red-300 font-mono text-sm">{results.error}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-white mb-1">Webhook Simulator</h4>
                <p className="text-sm text-slate-300">
                  This simulator processes inbound webhook payloads locally and demonstrates idempotency, conflict resolution, and audit logging. In production, webhooks would be secured with HMAC signatures.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}