import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FreeAIProviders } from '@/services/FreeAIProviders';
import { 
  Bot, 
  Check, 
  X, 
  ExternalLink, 
  Zap, 
  DollarSign,
  Settings,
  TestTube,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';

export default function AIProviderSetup() {
  const [providers, setProviders] = useState([]);
  const [apiKeys, setApiKeys] = useState({});
  const [testResults, setTestResults] = useState({});
  const [testing, setTesting] = useState(false);
  const [showKeys, setShowKeys] = useState({});
  const [freeAI] = useState(() => FreeAIProviders.getInstance());

  const providerConfig = [
    {
      key: 'VITE_GROQ_API_KEY',
      name: 'Groq',
      description: 'Ultra-fast inference, 500+ tokens/second',
      cost: 'FREE (6k requests/day)',
      signupUrl: 'https://console.groq.com',
      priority: 1,
      recommended: true,
      setup: [
        'Visit console.groq.com',
        'Sign up with GitHub/Google',
        'Create new API key',
        'Copy key to input below'
      ]
    },
    {
      key: 'VITE_GOOGLE_AI_STUDIO_KEY',
      name: 'Google Gemini',
      description: 'High-quality responses from Google',
      cost: 'FREE (60 requests/minute)',
      signupUrl: 'https://aistudio.google.com',
      priority: 2,
      setup: [
        'Visit aistudio.google.com',
        'Sign in with Google account',
        'Create API key',
        'Copy key to input below'
      ]
    },
    {
      key: 'VITE_HUGGINGFACE_TOKEN',
      name: 'Hugging Face',
      description: '150k+ open source models',
      cost: 'FREE (30k requests/month)',
      signupUrl: 'https://huggingface.co/settings/tokens',
      priority: 3,
      setup: [
        'Visit huggingface.co',
        'Create free account',
        'Go to Settings → Access Tokens',
        'Create token with Read permission'
      ]
    },
    {
      key: 'VITE_OPENROUTER_API_KEY',
      name: 'OpenRouter',
      description: 'Access to 100+ models',
      cost: 'Cheap ($0.00002/1k tokens)',
      signupUrl: 'https://openrouter.ai',
      priority: 4,
      setup: [
        'Visit openrouter.ai',
        'Sign up and verify email',
        'Add $5 credit (lasts months)',
        'Create API key'
      ]
    },
    {
      key: 'VITE_TOGETHER_API_KEY',
      name: 'Together AI',
      description: 'Very cheap, fast inference',
      cost: 'Cheap ($0.0002/1k tokens)',
      signupUrl: 'https://api.together.xyz',
      priority: 5,
      setup: [
        'Visit api.together.xyz',
        'Create account',
        'Add minimal credit',
        'Generate API key'
      ]
    }
  ];

  useEffect(() => {
    const status = freeAI.getProviderStatus();
    setProviders(status);

    // Load existing API keys from environment
    const keys = {};
    providerConfig.forEach(config => {
      const value = import.meta.env[config.key] || '';
      if (value && value !== 'your_key_here') {
        keys[config.key] = value;
      }
    });
    setApiKeys(keys);
  }, []);

  const handleKeyChange = (key, value) => {
    setApiKeys(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleShowKey = (key) => {
    setShowKeys(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const testProvider = async (config) => {
    setTesting(true);
    setTestResults(prev => ({
      ...prev,
      [config.name]: { status: 'testing' }
    }));

    try {
      // Temporarily set the environment variable for testing
      const originalValue = import.meta.env[config.key];
      import.meta.env[config.key] = apiKeys[config.key];

      const providers = freeAI.getProviders();
      const provider = providers.find(p => 
        p.name.toLowerCase().includes(config.name.toLowerCase())
      );

      if (!provider) {
        throw new Error('Provider not found');
      }

      const startTime = Date.now();
      const response = await provider.call('Test: What are the top 3 cybersecurity best practices?');
      const duration = Date.now() - startTime;

      setTestResults(prev => ({
        ...prev,
        [config.name]: {
          status: 'success',
          duration,
          responseLength: response?.length || 0
        }
      }));

      // Restore original value
      import.meta.env[config.key] = originalValue;

    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [config.name]: {
          status: 'error',
          error: error.message
        }
      }));
    }

    setTesting(false);
  };

  const testAllProviders = async () => {
    setTesting(true);
    
    for (const config of providerConfig) {
      if (apiKeys[config.key]) {
        await testProvider(config);
      }
    }
    
    setTesting(false);
  };

  const generateEnvFile = () => {
    let envContent = '# Free AI Providers Configuration\n';
    envContent += '# Generated by RedScan AI Provider Setup\n\n';
    
    providerConfig.forEach(config => {
      const value = apiKeys[config.key] || 'your_key_here';
      envContent += `# ${config.name} - ${config.description}\n`;
      envContent += `${config.key}=${value}\n\n`;
    });
    
    envContent += '# Ollama Local AI (No API key needed)\n';
    envContent += 'VITE_OLLAMA_BASE_URL=http://localhost:11434\n\n';
    envContent += '# AI Provider Settings\n';
    envContent += 'VITE_AI_SECURITY_PROVIDER=free_ai_providers\n';
    envContent += 'VITE_AI_SMART_FALLBACK=true\n';

    return envContent;
  };

  const downloadEnvFile = () => {
    const content = generateEnvFile();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.env.local';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const configuredCount = Object.keys(apiKeys).filter(key => 
    apiKeys[key] && apiKeys[key] !== 'your_key_here'
  ).length;

  const workingCount = Object.values(testResults).filter(result => 
    result.status === 'success'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-purple-400" />
            Free AI Providers Setup
            <Badge variant="outline" className="ml-auto border-green-400 text-green-400">
              {configuredCount} / {providerConfig.length} configured
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-slate-300">
              Set up free AI providers for RedScan's Security Copilot. No budget required - most providers offer generous free tiers perfect for development.
            </p>
            
            <div className="flex items-center gap-4">
              <Button 
                onClick={testAllProviders} 
                disabled={testing || configuredCount === 0}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <TestTube className="w-4 h-4 mr-2" />
                Test All Providers
              </Button>
              
              <Button 
                variant="outline" 
                onClick={downloadEnvFile}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Copy className="w-4 h-4 mr-2" />
                Download .env File
              </Button>
              
              {workingCount > 0 && (
                <Badge variant="outline" className="border-green-400 text-green-400">
                  {workingCount} working
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Provider Cards */}
      <div className="grid gap-4">
        {providerConfig.map((config) => {
          const hasKey = apiKeys[config.key] && apiKeys[config.key] !== 'your_key_here';
          const testResult = testResults[config.name];
          
          return (
            <Card 
              key={config.key} 
              className={`bg-slate-800/50 border-slate-700 ${config.recommended ? 'ring-1 ring-purple-500/30' : ''}`}
            >
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-purple-400" />
                    {config.name}
                    {config.recommended && (
                      <Badge className="bg-purple-600 text-white">Recommended</Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-green-400 text-green-400 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {config.cost}
                    </Badge>
                    
                    {testResult && (
                      <Badge 
                        variant="outline" 
                        className={`flex items-center gap-1 ${
                          testResult.status === 'success' ? 'border-green-400 text-green-400' :
                          testResult.status === 'error' ? 'border-red-400 text-red-400' :
                          'border-yellow-400 text-yellow-400'
                        }`}
                      >
                        {testResult.status === 'success' && <Check className="w-3 h-3" />}
                        {testResult.status === 'error' && <X className="w-3 h-3" />}
                        {testResult.status === 'testing' && <Zap className="w-3 h-3" />}
                        {testResult.status === 'success' && `${testResult.duration}ms`}
                        {testResult.status === 'error' && 'Failed'}
                        {testResult.status === 'testing' && 'Testing...'}
                      </Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-slate-300 text-sm">{config.description}</p>
                
                {/* Setup Steps */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-purple-300">Setup Steps:</h4>
                  <ol className="text-xs text-slate-400 space-y-1">
                    {config.setup.map((step, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-4 h-4 bg-purple-600/20 text-purple-300 rounded-full text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
                
                {/* API Key Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-300">API Key:</label>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(config.signupUrl, '_blank')}
                        className="text-xs border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Sign Up
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testProvider(config)}
                        disabled={!hasKey || testing}
                        className="text-xs border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <TestTube className="w-3 h-3 mr-1" />
                        Test
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Input
                      type={showKeys[config.key] ? 'text' : 'password'}
                      value={apiKeys[config.key] || ''}
                      onChange={(e) => handleKeyChange(config.key, e.target.value)}
                      placeholder="Enter your API key here..."
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleShowKey(config.key)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      {showKeys[config.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                
                {/* Test Results */}
                {testResult && testResult.status === 'error' && (
                  <Alert className="border-red-400/30 bg-red-900/20">
                    <X className="w-4 h-4 text-red-400" />
                    <AlertDescription className="text-red-300">
                      Test failed: {testResult.error}
                    </AlertDescription>
                  </Alert>
                )}
                
                {testResult && testResult.status === 'success' && (
                  <Alert className="border-green-400/30 bg-green-900/20">
                    <Check className="w-4 h-4 text-green-400" />
                    <AlertDescription className="text-green-300">
                      ✅ Working! Response in {testResult.duration}ms ({testResult.responseLength} characters)
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Ollama Local Setup */}
      <Card className="bg-slate-800/50 border-slate-700 border-dashed">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-green-400" />
            Ollama (Local AI)
            <Badge className="bg-green-600 text-white">100% FREE</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-slate-300 text-sm">
              Run AI models locally on your machine. Completely free, private, and works offline.
            </p>
            
            <div className="bg-slate-900/50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-green-300 mb-2">Quick Install:</h4>
              <code className="text-xs text-slate-300 block">
                curl -fsSL https://ollama.ai/install.sh | sh<br/>
                ollama pull llama3.1:8b<br/>
                ollama serve
              </code>
            </div>
            
            <Alert className="border-green-400/30 bg-green-900/20">
              <Check className="w-4 h-4 text-green-400" />
              <AlertDescription className="text-green-300">
                No API key required. Runs at http://localhost:11434 automatically.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}