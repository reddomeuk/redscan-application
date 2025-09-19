/**
 * Test script for Free AI Providers
 * Run this in browser console or as a standalone test
 */

import { FreeAIProviders } from './src/services/FreeAIProviders.ts';

const testFreeAI = async () => {
  console.log('🤖 Testing Free AI Providers for RedScan...\n');
  
  const freeAI = FreeAIProviders.getInstance();
  
  // Test prompt for cybersecurity context
  const testPrompt = `
RedScan Security Context:
- 15 critical vulnerabilities found
- 3 high-risk assets identified  
- Recent SQL injection detected
- Compliance scan needed for SOC2

Question: What should I prioritize first to reduce our security risk?
`;

  console.log('📋 Provider Status Check:');
  const status = freeAI.getProviderStatus();
  console.log(`✅ Configured providers: ${status.configured.join(', ')}`);
  console.log(`❌ Missing providers: ${status.missing.join(', ')}`);
  
  if (status.configured.length === 0) {
    console.log('\n⚠️  No providers configured. Setup guide:');
    console.log(status.setupGuide);
    return;
  }

  console.log('\n🧪 Testing provider connectivity:');
  const testResults = await freeAI.testProviders();
  Object.entries(testResults).forEach(([provider, working]) => {
    const emoji = working ? '✅' : '❌';
    console.log(`${emoji} ${provider}: ${working ? 'Working' : 'Failed'}`);
  });

  console.log('\n🎯 Generating security response...');
  const startTime = Date.now();
  
  try {
    const response = await freeAI.generateSecurityResponse(testPrompt);
    const duration = Date.now() - startTime;
    
    console.log(`\n🚀 Response generated in ${duration}ms`);
    console.log(`🤖 Provider: ${response.provider}`);
    console.log(`💰 Cost: ${response.cost}`);
    console.log(`⏰ Timestamp: ${response.timestamp}`);
    console.log(`\n📝 Response:\n${response.response.substring(0, 300)}...`);
    
    return {
      success: true,
      provider: response.provider,
      cost: response.cost,
      duration,
      responseLength: response.response.length
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Test multiple providers in sequence
const testAllProviders = async () => {
  console.log('🔄 Testing all configured providers individually...\n');
  
  const freeAI = FreeAIProviders.getInstance();
  const providers = freeAI.getProviders().filter(p => p.enabled);
  
  const results = [];
  
  for (const provider of providers) {
    console.log(`Testing ${provider.name}...`);
    const startTime = Date.now();
    
    try {
      const response = await provider.call('Test cybersecurity analysis capabilities');
      const duration = Date.now() - startTime;
      
      const result = {
        name: provider.name,
        cost: provider.cost,
        success: true,
        duration,
        responseLength: response?.length || 0
      };
      
      results.push(result);
      console.log(`✅ ${provider.name}: ${duration}ms, ${result.responseLength} chars`);
      
    } catch (error) {
      const result = {
        name: provider.name,
        cost: provider.cost,
        success: false,
        error: error.message
      };
      
      results.push(result);
      console.log(`❌ ${provider.name}: ${error.message}`);
    }
  }
  
  console.log('\n📊 Test Summary:');
  console.log('Provider\t\tStatus\t\tDuration\tCost');
  console.log('─'.repeat(60));
  
  results.forEach(r => {
    const status = r.success ? '✅' : '❌';
    const duration = r.duration ? `${r.duration}ms` : 'Failed';
    console.log(`${r.name.padEnd(20)}\t${status}\t${duration.padEnd(10)}\t${r.cost}`);
  });
  
  const workingProviders = results.filter(r => r.success);
  const fastestProvider = workingProviders.reduce((fastest, current) => 
    current.duration < fastest.duration ? current : fastest, 
    workingProviders[0]
  );
  
  if (fastestProvider) {
    console.log(`\n🏆 Fastest provider: ${fastestProvider.name} (${fastestProvider.duration}ms)`);
  }
  
  return results;
};

// Export for use in browser console or testing
window.testFreeAI = testFreeAI;
window.testAllProviders = testAllProviders;

// Auto-run if called directly
if (typeof window !== 'undefined' && window.location) {
  console.log('🤖 Free AI Test Functions Available:');
  console.log('- testFreeAI() - Test smart provider selection');
  console.log('- testAllProviders() - Test all providers individually');
  console.log('\nExample: await testFreeAI()');
}

export { testFreeAI, testAllProviders };