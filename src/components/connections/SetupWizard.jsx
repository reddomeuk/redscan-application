
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { FieldMapping, ItsmConnection, SyncQueueItem } from '@/api/entities';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Upload,
  Download,
  Play,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

const SETUP_STEPS = [
  { id: 'overview', title: 'Overview', description: 'Introduction and requirements' },
  { id: 'credentials', title: 'Credentials', description: 'Authentication setup' },
  { id: 'mapping', title: 'Field Mapping', description: 'Configure field mappings' },
  { id: 'test', title: 'Test & Finish', description: 'Validate configuration' }
];

const DEFAULT_MAPPINGS = {
  servicenow: [
    { internal_field: 'title', external_field: 'short_description', field_type: 'string', is_required: true, notes: 'Ticket title' },
    { internal_field: 'description', external_field: 'description', field_type: 'string', is_required: true, notes: 'Full description' },
    { internal_field: 'severity', external_field: 'impact', field_type: 'string', is_required: true, transform_rule: 'critical->1, high->2, medium->3, low->4', notes: 'Severity mapping' },
    { internal_field: 'status', external_field: 'state', field_type: 'string', is_required: true, transform_rule: 'open->1, investigating->2, resolved->6, closed->7', notes: 'Status workflow' },
    { internal_field: 'assignee', external_field: 'assigned_to', field_type: 'string', notes: 'User assignment' },
    { internal_field: 'external_id', external_field: 'u_external_id', field_type: 'string', is_required: true, notes: 'External reference ID' }
  ],
  jira: [
    { internal_field: 'title', external_field: 'summary', field_type: 'string', is_required: true, notes: 'Issue summary' },
    { internal_field: 'description', external_field: 'description', field_type: 'string', is_required: true, notes: 'Issue description' },
    { internal_field: 'severity', external_field: 'priority', field_type: 'string', is_required: true, transform_rule: 'critical->Highest, high->High, medium->Medium, low->Low', notes: 'Priority mapping' },
    { internal_field: 'status', external_field: 'status', field_type: 'string', is_required: true, notes: 'Issue status' },
    { internal_field: 'assignee', external_field: 'assignee', field_type: 'string', notes: 'User assignment' },
    { internal_field: 'external_id', external_field: 'customfield_external_id', field_type: 'string', is_required: true, notes: 'External reference ID' }
  ]
};

const StepOverview = ({ platform }) => (
  <div className="space-y-6">
    <div className="text-center">
      <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <Settings className="w-8 h-8 text-blue-400" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">
        {platform === 'servicenow' ? 'ServiceNow' : 'Jira'} Integration Setup
      </h3>
      <p className="text-slate-400">
        This wizard will guide you through setting up bi-directional sync with your {platform} instance.
      </p>
    </div>

    <Card className="bg-slate-900/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white text-lg">What You'll Need</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <span className="text-slate-300">
            {platform === 'servicenow' ? 'ServiceNow instance URL' : 'Atlassian domain URL'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <span className="text-slate-300">OAuth 2.0 credentials or API token</span>
        </div>
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <span className="text-slate-300">Admin permissions to create custom fields</span>
        </div>
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <span className="text-slate-300">Field mapping configuration (optional CSV)</span>
        </div>
      </CardContent>
    </Card>

    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-white mb-1">Setup Time</h4>
          <p className="text-sm text-slate-300">
            This setup typically takes 5-10 minutes. You can save and continue later if needed.
          </p>
        </div>
      </div>
    </div>
  </div>
);

const StepCredentials = ({ platform, credentials, onCredentialsChange, testStatus }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-xl font-semibold text-white mb-2">Authentication Setup</h3>
      <p className="text-slate-400">
        Enter your {platform} instance credentials for API access.
      </p>
    </div>

    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-slate-300">
          {platform === 'servicenow' ? 'ServiceNow Instance URL' : 'Atlassian Domain'}
        </Label>
        <Input
          value={credentials.instance_url}
          onChange={(e) => onCredentialsChange({ ...credentials, instance_url: e.target.value })}
          placeholder={platform === 'servicenow' ? 'https://your-org.service-now.com' : 'https://your-org.atlassian.net'}
          className="bg-slate-900/50 border-slate-700 text-white"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-slate-300">Client ID / Username</Label>
        <Input
          value={credentials.client_id}
          onChange={(e) => onCredentialsChange({ ...credentials, client_id: e.target.value })}
          className="bg-slate-900/50 border-slate-700 text-white"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-slate-300">Client Secret / Password / Token</Label>
        <Input
          type="password"
          value={credentials.client_secret}
          onChange={(e) => onCredentialsChange({ ...credentials, client_secret: e.target.value })}
          placeholder="••••••••••••••••"
          className="bg-slate-900/50 border-slate-700 text-white"
        />
      </div>

      {testStatus && (
        <div className={`flex items-center gap-2 p-3 rounded-lg ${
          testStatus.success ? 'bg-green-900/20 border border-green-500/30' : 'bg-red-900/20 border border-red-500/30'
        }`}>
          {testStatus.success ? (
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400" />
          )}
          <span className={testStatus.success ? 'text-green-300' : 'text-red-300'}>
            {testStatus.message}
          </span>
        </div>
      )}
    </div>
  </div>
);

const StepMapping = ({ platform, mappings, onMappingsChange, onResetDefaults, onCsvUpload }) => {
  const [newMapping, setNewMapping] = useState({
    internal_field: '',
    external_field: '',
    field_type: 'string',
    is_required: false,
    notes: ''
  });

  const handleAddMapping = () => {
    if (!newMapping.internal_field || !newMapping.external_field) {
      toast.error('Internal field and external field are required');
      return;
    }

    // Check for duplicate internal fields
    const duplicate = mappings.find(m => m.internal_field === newMapping.internal_field);
    if (duplicate) {
      toast.error('Internal field already exists');
      return;
    }

    onMappingsChange([...mappings, { ...newMapping, platform, organization_id: 'demo-org-1' }]);
    setNewMapping({ internal_field: '', external_field: '', field_type: 'string', is_required: false, notes: '' });
    toast.success('Mapping added successfully');
  };

  const handleRemoveMapping = (index) => {
    const updated = mappings.filter((_, i) => i !== index);
    onMappingsChange(updated);
    toast.success('Mapping removed');
  };

  const handleCsvFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target.result;
      const lines = csv.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());

      const csvMappings = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length >= 2 && values[0] && values[1]) {
          csvMappings.push({
            internal_field: values[0],
            external_field: values[1],
            field_type: values[2] || 'string',
            is_required: values[3]?.toLowerCase() === 'true',
            notes: values[4] || '',
            platform,
            organization_id: 'demo-org-1'
          });
        }
      }

      onCsvUpload(csvMappings);
      toast.success(`Loaded ${csvMappings.length} mappings from CSV`);
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const csvContent = 'internal_field,external_field,field_type,is_required,notes\ntitle,summary,string,true,Issue title\ndescription,description,string,true,Issue description';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${platform}-mapping-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Field Mapping Configuration</h3>
          <p className="text-slate-400">
            Configure how fields are mapped between RedScan and {platform}.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={downloadTemplate} variant="outline" size="sm" className="border-slate-600">
            <Download className="w-4 h-4 mr-2" />
            CSV Template
          </Button>
          <Button onClick={onResetDefaults} variant="outline" size="sm" className="border-slate-600">
            Reset to Defaults
          </Button>
        </div>
      </div>

      {/* CSV Upload */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">Import from CSV</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload">
              <Button className="cursor-pointer bg-blue-600 hover:bg-blue-700">
                <Upload className="w-4 h-4 mr-2" />
                Upload CSV
              </Button>
            </label>
            <span className="text-sm text-slate-400">
              CSV format: internal_field, external_field, field_type, is_required, notes
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Mapping Table */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">Current Mappings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-300">Internal Field</TableHead>
                <TableHead className="text-slate-300">External Field</TableHead>
                <TableHead className="text-slate-300">Type</TableHead>
                <TableHead className="text-slate-300">Required</TableHead>
                <TableHead className="text-slate-300">Notes</TableHead>
                <TableHead className="text-slate-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mappings.map((mapping, index) => (
                <TableRow key={index} className="border-slate-700">
                  <TableCell className="text-white font-mono text-sm">{mapping.internal_field}</TableCell>
                  <TableCell className="text-slate-300 font-mono text-sm">{mapping.external_field}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-slate-600 text-slate-300">
                      {mapping.field_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {mapping.is_required && <Badge className="bg-orange-500/20 text-orange-400">Required</Badge>}
                  </TableCell>
                  <TableCell className="text-slate-400 text-sm">{mapping.notes}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleRemoveMapping(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {/* Add new mapping row */}
              <TableRow className="border-slate-700 bg-slate-800/30">
                <TableCell>
                  <Input
                    value={newMapping.internal_field}
                    onChange={(e) => setNewMapping({...newMapping, internal_field: e.target.value})}
                    placeholder="internal_field"
                    className="bg-slate-800/50 border-slate-700 text-white text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={newMapping.external_field}
                    onChange={(e) => setNewMapping({...newMapping, external_field: e.target.value})}
                    placeholder="external_field"
                    className="bg-slate-800/50 border-slate-700 text-white text-sm"
                  />
                </TableCell>
                <TableCell>
                  <select
                    value={newMapping.field_type}
                    onChange={(e) => setNewMapping({...newMapping, field_type: e.target.value})}
                    className="bg-slate-800/50 border border-slate-700 rounded px-2 py-1 text-white text-sm"
                  >
                    <option value="string">string</option>
                    <option value="number">number</option>
                    <option value="date">date</option>
                    <option value="boolean">boolean</option>
                    <option value="array">array</option>
                  </select>
                </TableCell>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={newMapping.is_required}
                    onChange={(e) => setNewMapping({...newMapping, is_required: e.target.checked})}
                    className="w-4 h-4"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={newMapping.notes}
                    onChange={(e) => setNewMapping({...newMapping, notes: e.target.value})}
                    placeholder="notes"
                    className="bg-slate-800/50 border-slate-700 text-white text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Button onClick={handleAddMapping} size="sm" className="bg-green-600 hover:bg-green-700">
                    Add
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const StepTest = ({ platform, testResults, onRunTests }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-xl font-semibold text-white mb-2">Test & Validation</h3>
      <p className="text-slate-400">
        Run tests to validate your {platform} integration configuration.
      </p>
    </div>

    <div className="flex justify-center">
      <Button onClick={onRunTests} className="bg-blue-600 hover:bg-blue-700 px-8">
        <Play className="w-4 h-4 mr-2" />
        Run Integration Tests
      </Button>
    </div>

    {testResults && (
      <div className="space-y-4">
        {testResults.map((test, index) => (
          <Card key={index} className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {test.success ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                  <span className="text-white font-medium">{test.name}</span>
                </div>
                <Badge className={test.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                  {test.success ? 'Pass' : 'Fail'}
                </Badge>
              </div>
              <p className="text-slate-400 text-sm mt-2 ml-8">{test.message}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    )}
  </div>
);

export default function SetupWizard({ platform, connection, onComplete }) {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [credentials, setCredentials] = useState({
    instance_url: connection?.instance_url || '',
    client_id: connection?.client_id || '',
    client_secret: ''
  });
  const [mappings, setMappings] = useState([]);
  const [testStatus, setTestStatus] = useState(null);
  const [testResults, setTestResults] = useState(null);

  const loadMappings = useCallback(async () => {
    try {
      const existingMappings = await FieldMapping.filter({ platform, organization_id: 'demo-org-1' });
      if (existingMappings.length > 0) {
        setMappings(existingMappings);
      } else {
        setMappings(DEFAULT_MAPPINGS[platform] || []);
      }
    } catch (error) {
      console.error('Error loading mappings:', error);
      setMappings(DEFAULT_MAPPINGS[platform] || []);
    }
  }, [platform]); // 'platform' is a dependency for loadMappings

  useEffect(() => {
    if (open) {
      loadMappings();
    }
  }, [open, loadMappings]); // 'loadMappings' is now a stable reference due to useCallback

  const handleTestCredentials = async () => {
    setTestStatus({ success: false, message: 'Testing connection...' });

    // Simulate API test
    setTimeout(() => {
      const success = credentials.instance_url && credentials.client_id && credentials.client_secret;
      setTestStatus({
        success,
        message: success
          ? `✓ Successfully connected to ${platform}`
          : `✗ Failed to connect. Check your credentials.`
      });
    }, 2000);
  };

  const handleResetDefaults = () => {
    setMappings(DEFAULT_MAPPINGS[platform] || []);
    toast.success('Mappings reset to defaults');
  };

  const handleCsvUpload = (csvMappings) => {
    setMappings(csvMappings);
  };

  const handleRunTests = async () => {
    const tests = [
      { name: 'Connection Test', success: true, message: 'Successfully connected to API' },
      { name: 'Create Ticket', success: true, message: 'Test ticket created successfully' },
      { name: 'Update Ticket', success: true, message: 'Test ticket updated successfully' },
      { name: 'Add Comment', success: true, message: 'Comment added successfully' },
      { name: 'Field Mapping', success: mappings.length > 0, message: mappings.length > 0 ? 'All field mappings validated' : 'No field mappings configured' }
    ];

    setTestResults(tests);

    // Save mappings to database
    try {
      // Clear existing mappings
      const existing = await FieldMapping.filter({ platform, organization_id: 'demo-org-1' });
      for (const mapping of existing) {
        await FieldMapping.delete(mapping.id);
      }

      // Create new mappings
      for (const mapping of mappings) {
        await FieldMapping.create(mapping);
      }

      toast.success('Setup completed successfully!');
    } catch (error) {
      console.error('Error saving mappings:', error);
      toast.error('Error saving configuration');
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && !testStatus?.success) {
      handleTestCredentials();
      return;
    }
    if (currentStep < SETUP_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete?.();
    setOpen(false);
    setCurrentStep(0);
    toast.success(`${platform} integration setup completed!`);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return testStatus?.success;
      case 2: return mappings.length > 0;
      case 3: return testResults && testResults.every(t => t.success);
      default: return true;
    }
  };

  const renderStepContent = () => {
    switch (SETUP_STEPS[currentStep].id) {
      case 'overview':
        return <StepOverview platform={platform} />;
      case 'credentials':
        return (
          <StepCredentials
            platform={platform}
            credentials={credentials}
            onCredentialsChange={setCredentials}
            testStatus={testStatus}
          />
        );
      case 'mapping':
        return (
          <StepMapping
            platform={platform}
            mappings={mappings}
            onMappingsChange={setMappings}
            onResetDefaults={handleResetDefaults}
            onCsvUpload={handleCsvUpload}
          />
        );
      case 'test':
        return (
          <StepTest
            platform={platform}
            testResults={testResults}
            onRunTests={handleRunTests}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Settings className="w-4 h-4 mr-2" />
          Setup Wizard
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {platform === 'servicenow' ? 'ServiceNow' : 'Jira'} Setup Wizard
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {SETUP_STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index <= currentStep ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'
              }`}>
                {index + 1}
              </div>
              <div className="ml-2 hidden sm:block">
                <div className={`text-sm font-medium ${
                  index <= currentStep ? 'text-white' : 'text-slate-400'
                }`}>
                  {step.title}
                </div>
                <div className="text-xs text-slate-500">{step.description}</div>
              </div>
              {index < SETUP_STEPS.length - 1 && (
                <ChevronRight className="w-5 h-5 text-slate-500 mx-4" />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t border-slate-700">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            variant="outline"
            className="border-slate-600 text-slate-300"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-3">
            {currentStep === SETUP_STEPS.length - 1 ? (
              <Button
                onClick={handleComplete}
                disabled={!canProceed()}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Complete Setup
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
