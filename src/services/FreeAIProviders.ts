/**
 * Free AI Providers Service
 * Provides access to multiple free AI APIs for development without budget constraints
 * Supports: Groq, Hugging Face, Google Gemini, OpenRouter, Together AI
 */

export interface AIResponse {
  response: string;
  provider: string;
  cost: string;
  timestamp: string;
}

export interface AIProvider {
  name: string;
  call: (prompt: string) => Promise<string>;
  cost: string;
  priority: number;
  enabled: boolean;
}

export class FreeAIProviders {
  private static instance: FreeAIProviders;
  
  private constructor() {}
  
  static getInstance(): FreeAIProviders {
    if (!FreeAIProviders.instance) {
      FreeAIProviders.instance = new FreeAIProviders();
    }
    return FreeAIProviders.instance;
  }

  /**
   * Hugging Face Inference API (FREE - 30,000 requests/month)
   */
  async callHuggingFace(prompt: string, model = 'microsoft/DialoGPT-large'): Promise<string> {
    try {
      const token = import.meta.env.VITE_HUGGINGFACE_TOKEN;
      if (!token) {
        throw new Error('Hugging Face token not configured');
      }

      const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 250,
            temperature: 0.7,
            top_p: 0.9,
            return_full_text: false
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Hugging Face API error: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return result[0]?.generated_text || result.response || 'No response from Hugging Face';
    } catch (error) {
      console.warn('Hugging Face API failed:', error);
      throw error;
    }
  }

  /**
   * Google AI Studio Gemini (FREE - 60 requests/minute)
   */
  async callGemini(prompt: string): Promise<string> {
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_AI_STUDIO_KEY;
      if (!apiKey) {
        throw new Error('Google AI Studio key not configured');
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a cybersecurity expert assistant for the RedScan security platform. Provide clear, actionable security advice.\n\nUser Question: ${prompt}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 1,
            topP: 1,
            maxOutputTokens: 1000,
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Google Gemini API error: ${response.status}`);
      }
      
      const result = await response.json();
      return result.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini';
    } catch (error) {
      console.warn('Google Gemini API failed:', error);
      throw error;
    }
  }

  /**
   * Groq (FREE - 6,000 requests/day, ultra-fast inference)
   */
  async callGroq(prompt: string, model = 'llama3-8b-8192'): Promise<string> {
    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) {
        throw new Error('Groq API key not configured');
      }

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: 'You are a cybersecurity expert assistant helping with the RedScan security platform. Provide clear, actionable security recommendations and analysis.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
          top_p: 1,
          stream: false
        })
      });
      
      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }
      
      const result = await response.json();
      return result.choices?.[0]?.message?.content || 'No response from Groq';
    } catch (error) {
      console.warn('Groq API failed:', error);
      throw error;
    }
  }

  /**
   * OpenRouter (Cheap - access to 100+ models)
   */
  async callOpenRouter(prompt: string, model = 'meta-llama/llama-3.1-8b-instruct:free'): Promise<string> {
    try {
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      if (!apiKey) {
        throw new Error('OpenRouter API key not configured');
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://redscan.ai',
          'X-Title': 'RedScan Security Platform'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: 'You are a cybersecurity expert helping with security analysis for the RedScan platform.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });
      
      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }
      
      const result = await response.json();
      return result.choices?.[0]?.message?.content || 'No response from OpenRouter';
    } catch (error) {
      console.warn('OpenRouter API failed:', error);
      throw error;
    }
  }

  /**
   * Together AI (Very cheap, fast inference)
   */
  async callTogether(prompt: string, model = 'meta-llama/Llama-3-8b-chat-hf'): Promise<string> {
    try {
      const apiKey = import.meta.env.VITE_TOGETHER_API_KEY;
      if (!apiKey) {
        throw new Error('Together AI API key not configured');
      }

      const response = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: 'You are a cybersecurity expert assistant for the RedScan security platform.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });
      
      if (!response.ok) {
        throw new Error(`Together AI API error: ${response.status}`);
      }
      
      const result = await response.json();
      return result.choices?.[0]?.message?.content || 'No response from Together AI';
    } catch (error) {
      console.warn('Together AI API failed:', error);
      throw error;
    }
  }

  /**
   * Get all available providers with their configurations
   */
  getProviders(): AIProvider[] {
    return [
      {
        name: 'Groq',
        call: (prompt: string) => this.callGroq(prompt),
        cost: 'FREE (6k/day)',
        priority: 1,
        enabled: !!import.meta.env.VITE_GROQ_API_KEY
      },
      {
        name: 'Google Gemini',
        call: (prompt: string) => this.callGemini(prompt),
        cost: 'FREE (60/min)',
        priority: 2,
        enabled: !!import.meta.env.VITE_GOOGLE_AI_STUDIO_KEY
      },
      {
        name: 'OpenRouter Free',
        call: (prompt: string) => this.callOpenRouter(prompt),
        cost: 'FREE (limited)',
        priority: 3,
        enabled: !!import.meta.env.VITE_OPENROUTER_API_KEY
      },
      {
        name: 'Together AI',
        call: (prompt: string) => this.callTogether(prompt),
        cost: '$0.0002/1k tokens',
        priority: 4,
        enabled: !!import.meta.env.VITE_TOGETHER_API_KEY
      },
      {
        name: 'Hugging Face',
        call: (prompt: string) => this.callHuggingFace(prompt),
        cost: 'FREE (30k/month)',
        priority: 5,
        enabled: !!import.meta.env.VITE_HUGGINGFACE_TOKEN
      }
    ];
  }

  /**
   * Smart provider selection with automatic fallback
   */
  async generateSecurityResponse(prompt: string): Promise<AIResponse> {
    const providers = this.getProviders()
      .filter(p => p.enabled)
      .sort((a, b) => a.priority - b.priority);

    if (providers.length === 0) {
      return {
        response: 'No AI providers configured. Please set up at least one free API key in your environment variables.',
        provider: 'None',
        cost: 'FREE',
        timestamp: new Date().toISOString()
      };
    }

    // Try providers in order of priority
    for (const provider of providers) {
      try {
        console.log(`Trying ${provider.name}...`);
        const response = await provider.call(prompt);
        
        if (response && response.trim() && !response.includes('error') && response !== 'No response') {
          return {
            response: response.trim(),
            provider: provider.name,
            cost: provider.cost,
            timestamp: new Date().toISOString()
          };
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log(`${provider.name} failed, trying next provider...`, errorMessage);
        continue;
      }
    }

    // Fallback response
    return {
      response: `All AI providers are currently unavailable. Available providers: ${providers.map(p => p.name).join(', ')}. Please check your API keys and network connection.`,
      provider: 'Fallback',
      cost: 'FREE',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Test all configured providers
   */
  async testProviders(): Promise<{ [key: string]: boolean }> {
    const providers = this.getProviders().filter(p => p.enabled);
    const results: { [key: string]: boolean } = {};
    
    for (const provider of providers) {
      try {
        const response = await provider.call('Test connection');
        results[provider.name] = !!response && response.trim().length > 0;
      } catch (error) {
        results[provider.name] = false;
      }
    }
    
    return results;
  }

  /**
   * Get provider status and configuration guide
   */
  getProviderStatus(): { configured: string[], missing: string[], setupGuide: string } {
    const allProviders = this.getProviders();
    const configured = allProviders.filter(p => p.enabled).map(p => p.name);
    const missing = allProviders.filter(p => !p.enabled).map(p => p.name);
    
    const setupGuide = `
Free AI Setup Guide:

1. Groq (Recommended - Fast & Free):
   - Visit: https://console.groq.com
   - Sign up and get API key
   - Add to .env: VITE_GROQ_API_KEY=your_key

2. Google AI Studio (Free):
   - Visit: https://aistudio.google.com
   - Create API key
   - Add to .env: VITE_GOOGLE_AI_STUDIO_KEY=your_key

3. OpenRouter (Cheap access to many models):
   - Visit: https://openrouter.ai
   - Add credit and get API key
   - Add to .env: VITE_OPENROUTER_API_KEY=your_key
`;

    return { configured, missing, setupGuide };
  }
}

export default FreeAIProviders;