/**
 * AI Configuration Manager for Security Copilot
 * 
 * Provides easy setup and management of different AI providers
 */

import AISecurityAnalyzer, { AIModelConfig } from './AISecurityAnalyzer';

export interface AIProviderPresets {
  openai: AIModelConfig;
  openaiAdvanced: AIModelConfig;
  azureOpenAI: AIModelConfig;
  anthropic: AIModelConfig;
  ollama: AIModelConfig;
  'ollama-code': AIModelConfig;
  'ollama-quick': AIModelConfig;
  'ollama-advanced': AIModelConfig;
  local: AIModelConfig;
  development: AIModelConfig;
  [key: string]: AIModelConfig;
}

export class AIConfigurationManager {
  private static instance: AIConfigurationManager;
  private analyzer: AISecurityAnalyzer | null = null;
  private currentConfig: AIModelConfig | null = null;

  private constructor() {}

  static getInstance(): AIConfigurationManager {
    if (!AIConfigurationManager.instance) {
      AIConfigurationManager.instance = new AIConfigurationManager();
    }
    return AIConfigurationManager.instance;
  }

  /**
   * Get predefined provider configurations optimized for production
   */
  getProviderPresets(): AIProviderPresets {
    return {
      // FREE AI PROVIDERS (No cost for development)
      'groq-free': {
        provider: 'openai',
        model: 'llama3-8b-8192',
        apiKey: process.env.VITE_GROQ_API_KEY || '',
        endpoint: 'https://api.groq.com/openai/v1',
        temperature: 0.1,
        maxTokens: 1024,
        cost: 'FREE (6k requests/day)',
        description: 'Groq - Ultra-fast inference, 500+ tokens/second'
      },
      'gemini-free': {
        provider: 'custom',
        model: 'gemini-pro',
        apiKey: process.env.VITE_GOOGLE_AI_STUDIO_KEY || '',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta',
        temperature: 0.1,
        maxTokens: 1000,
        cost: 'FREE (60 requests/minute)',
        description: 'Google Gemini Pro - High quality responses'
      },
      'huggingface-free': {
        provider: 'custom',
        model: 'microsoft/DialoGPT-large',
        apiKey: process.env.VITE_HUGGINGFACE_TOKEN || '',
        endpoint: 'https://api-inference.huggingface.co',
        temperature: 0.1,
        maxTokens: 250,
        cost: 'FREE (30k requests/month)',
        description: 'Hugging Face - 150k+ open source models'
      },
      'openrouter-free': {
        provider: 'openai',
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        apiKey: process.env.VITE_OPENROUTER_API_KEY || '',
        endpoint: 'https://openrouter.ai/api/v1',
        temperature: 0.1,
        maxTokens: 1000,
        cost: 'FREE (limited)',
        description: 'OpenRouter - Access to 100+ models'
      },
      'together-cheap': {
        provider: 'openai',
        model: 'meta-llama/Llama-3-8b-chat-hf',
        apiKey: process.env.VITE_TOGETHER_API_KEY || '',
        endpoint: 'https://api.together.xyz/v1',
        temperature: 0.1,
        maxTokens: 1000,
        cost: '$0.0002/1k tokens',
        description: 'Together AI - Very cheap, fast inference'
      },
      
      // PREMIUM PROVIDERS
      openai: {
        provider: 'openai',
        model: 'gpt-4',
        apiKey: process.env.OPENAI_API_KEY || '',
        temperature: 0.1,
        maxTokens: 2048
      },
      openaiAdvanced: {
        provider: 'openai',
        model: 'gpt-4-turbo',
        apiKey: process.env.OPENAI_API_KEY || '',
        temperature: 0.05,
        maxTokens: 4096
      },
      azureOpenAI: {
        provider: 'azure-openai',
        model: 'gpt-4',
        apiKey: process.env.AZURE_OPENAI_API_KEY || '',
        endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
        temperature: 0.1,
        maxTokens: 2048
      },
      anthropic: {
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
        apiKey: process.env.ANTHROPIC_API_KEY || '',
        temperature: 0.1,
        maxTokens: 2048
      },
      ollama: {
        provider: 'ollama',
        model: process.env.OLLAMA_PRIMARY_MODEL || 'llama3.1:8b-instruct-q4_0',
        endpoint: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        temperature: 0.1,
        maxTokens: 2048,
        systemPrompt: 'You are a cybersecurity expert providing accurate, actionable security recommendations.'
      },
      'ollama-code': {
        provider: 'ollama',
        model: process.env.OLLAMA_CODE_MODEL || 'codellama:7b-instruct-q4_0',
        endpoint: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        temperature: 0.05,
        maxTokens: 4096,
        systemPrompt: 'You are a secure code review expert specializing in vulnerability detection and secure coding practices.'
      },
      'ollama-quick': {
        provider: 'ollama',
        model: process.env.OLLAMA_QUICK_MODEL || 'phi3:3.8b-mini-instruct-q4_0',
        endpoint: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        temperature: 0.2,
        maxTokens: 1024,
        systemPrompt: 'You are a cybersecurity assistant providing quick, accurate responses to security queries.'
      },
      'ollama-advanced': {
        provider: 'ollama',
        model: process.env.OLLAMA_ADVANCED_MODEL || 'mistral:7b-instruct-q4_0',
        endpoint: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        temperature: 0.15,
        maxTokens: 3072,
        systemPrompt: 'You are an advanced threat intelligence analyst with expertise in complex security analysis and forensics.'
      },
      local: {
        provider: 'local',
        model: 'local-security-model',
        endpoint: process.env.LOCAL_AI_ENDPOINT || 'http://localhost:8080',
        temperature: 0.1,
        maxTokens: 2048
      },
      development: {
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        apiKey: process.env.OPENAI_API_KEY || '',
        temperature: 0.3,
        maxTokens: 1024
      }
    };
  }

  /**
   * Initialize AI analyzer with specific provider
   */
  async initializeProvider(providerName: keyof AIProviderPresets, customConfig?: Partial<AIModelConfig>): Promise<AISecurityAnalyzer> {
    const presets = this.getProviderPresets();
    const baseConfig = presets[providerName];
    
    if (!baseConfig) {
      throw new Error(`Unknown provider: ${providerName}`);
    }

    // Merge custom configuration
    const finalConfig: AIModelConfig = {
      ...baseConfig,
      ...customConfig
    };

    // Validate configuration
    this.validateConfiguration(finalConfig);

    // Create new analyzer instance
    this.analyzer = new AISecurityAnalyzer(finalConfig);
    this.currentConfig = finalConfig;

    // Test connection if not local
    if (finalConfig.provider !== 'local') {
      try {
        const connectionTest = await this.analyzer.testConnection();
        if (!connectionTest.connected) {
          console.warn(`AI provider connection failed: ${connectionTest.error}`);
          // Fallback to local mode
          return this.initializeProvider('local');
        }
      } catch (error) {
        console.warn('AI provider test failed, falling back to local mode:', error);
        return this.initializeProvider('local');
      }
    }

    return this.analyzer;
  }

  /**
   * Get current analyzer instance
   */
  getAnalyzer(): AISecurityAnalyzer | null {
    return this.analyzer;
  }

  /**
   * Get current configuration
   */
  getCurrentConfig(): AIModelConfig | null {
    return this.currentConfig;
  }

  /**
   * Validate AI configuration
   */
  private validateConfiguration(config: AIModelConfig): void {
    // Check required fields based on provider
    switch (config.provider) {
      case 'openai':
        if (!config.apiKey) {
          throw new Error('OpenAI API key is required. Set OPENAI_API_KEY environment variable.');
        }
        break;
      
      case 'azure-openai':
        if (!config.apiKey || !config.endpoint) {
          throw new Error('Azure OpenAI requires API key and endpoint. Set AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT environment variables.');
        }
        break;
      
      case 'anthropic':
        if (!config.apiKey) {
          throw new Error('Anthropic API key is required. Set ANTHROPIC_API_KEY environment variable.');
        }
        break;
      
      case 'ollama':
        if (!config.endpoint) {
          console.warn('Ollama endpoint not specified, using default: http://localhost:11434');
          config.endpoint = 'http://localhost:11434';
        }
        break;
      
      case 'local':
        // No validation needed for local mode
        break;
      
      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`);
    }

    // Validate model parameters
    if (config.temperature !== undefined && (config.temperature < 0 || config.temperature > 2)) {
      throw new Error('Temperature must be between 0 and 2');
    }

    if (config.maxTokens !== undefined && config.maxTokens <= 0) {
      throw new Error('Max tokens must be positive');
    }
  }

  /**
   * Auto-detect and initialize best available provider
   */
  async autoInitialize(): Promise<AISecurityAnalyzer> {
    const providers: (keyof AIProviderPresets)[] = ['openai', 'azureOpenAI', 'anthropic', 'ollama', 'local'];
    
    for (const provider of providers) {
      try {
        console.log(`Attempting to initialize ${provider}...`);
        const analyzer = await this.initializeProvider(provider);
        
        // Test the connection
        const connectionTest = await analyzer.testConnection();
        if (connectionTest.connected) {
          console.log(`✅ Successfully initialized ${provider} (${connectionTest.latency}ms)`);
          return analyzer;
        }
      } catch (error: any) {
        console.log(`❌ Failed to initialize ${provider}:`, error?.message || error);
      }
    }

    // Final fallback to local mode
    console.log('🔄 Falling back to local rule-based analysis');
    return this.initializeProvider('local');
  }

  /**
   * Create analyzer with custom configuration
   */
  createCustomAnalyzer(config: AIModelConfig): AISecurityAnalyzer {
    this.validateConfiguration(config);
    this.analyzer = new AISecurityAnalyzer(config);
    this.currentConfig = config;
    return this.analyzer;
  }

  /**
   * Check if AI features are available
   */
  isAIAvailable(): boolean {
    return this.analyzer !== null;
  }

  /**
   * Get AI provider status
   */
  async getProviderStatus(): Promise<{
    provider: string;
    model: string;
    connected: boolean;
    latency?: number;
    error?: string;
  }> {
    if (!this.analyzer || !this.currentConfig) {
      return {
        provider: 'none',
        model: 'none',
        connected: false,
        error: 'No AI provider initialized'
      };
    }

    try {
      const connectionTest = await this.analyzer.testConnection();
      return {
        provider: this.currentConfig.provider,
        model: this.currentConfig.model,
        connected: connectionTest.connected,
        latency: connectionTest.latency,
        error: connectionTest.error
      };
    } catch (error: any) {
      return {
        provider: this.currentConfig.provider,
        model: this.currentConfig.model,
        connected: false,
        error: error.message
      };
    }
  }

  /**
   * Environment setup helper
   */
  getSetupInstructions(): {
    provider: string;
    instructions: string;
    envVars: string[];
  }[] {
    return [
      {
        provider: 'OpenAI',
        instructions: 'Sign up at https://platform.openai.com/, create an API key, and set the environment variable.',
        envVars: ['OPENAI_API_KEY']
      },
      {
        provider: 'Azure OpenAI',
        instructions: 'Set up Azure OpenAI service, get your endpoint and API key.',
        envVars: ['AZURE_OPENAI_API_KEY', 'AZURE_OPENAI_ENDPOINT']
      },
      {
        provider: 'Anthropic',
        instructions: 'Sign up at https://console.anthropic.com/, create an API key.',
        envVars: ['ANTHROPIC_API_KEY']
      },
      {
        provider: 'Ollama',
        instructions: 'Install Ollama locally from https://ollama.ai/, pull a model like llama2.',
        envVars: ['OLLAMA_ENDPOINT (optional)']
      },
      {
        provider: 'Local',
        instructions: 'No setup required - uses rule-based analysis without external API calls.',
        envVars: []
      }
    ];
  }

  /**
   * Reset analyzer
   */
  reset(): void {
    this.analyzer = null;
    this.currentConfig = null;
  }
}

// Export singleton instance
export const aiConfigManager = AIConfigurationManager.getInstance();

export default AIConfigurationManager;