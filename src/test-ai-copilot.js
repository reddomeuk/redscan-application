// ============================================================================
// AI SECURITY COPILOT TEST SCRIPT
// ============================================================================

import { EnhancedSecurityCopilot } from './services/EnhancedSecurityCopilot.ts';

async function testAISecurityCopilot() {
  console.log('🧪 Testing AI Security Copilot Integration...\n');
  
  // Initialize the copilot
  const copilot = new EnhancedSecurityCopilot();
  
  // Create mock security context
  const mockContext = {
    findings: [
      {
        id: 'finding-1',
        severity: 'critical',
        type: 'vulnerability',
        description: 'SQL injection vulnerability in login endpoint',
        timestamp: new Date().toISOString()
      },
      {
        id: 'finding-2',
        severity: 'high',
        type: 'misconfiguration',
        description: 'Weak SSL/TLS configuration',
        timestamp: new Date().toISOString()
      },
      {
        id: 'finding-3',
        severity: 'medium',
        type: 'outdated_software',
        description: 'Outdated Apache version detected',
        timestamp: new Date().toISOString()
      }
    ],
    assets: [
      {
        id: 'asset-1',
        name: 'Web Server 1',
        type: 'server',
        criticality: 'high'
      },
      {
        id: 'asset-2',
        name: 'Database Server',
        type: 'database',
        criticality: 'critical'
      }
    ],
    scans: [
      {
        id: 'scan-1',
        type: 'vulnerability',
        status: 'completed',
        timestamp: new Date().toISOString()
      }
    ]
  };

  // Test different types of security questions
  const testQuestions = [
    "What should I fix first?",
    "Are there any critical vulnerabilities?",
    "How can I improve my security posture?",
    "What's the current risk level?",
    "Show me threat analysis for SQL injection",
    "Help me with incident response planning"
  ];

  console.log('📋 Testing Security Questions:\n');
  
  for (let i = 0; i < testQuestions.length; i++) {
    const question = testQuestions[i];
    console.log(`${i + 1}. Testing: "${question}"`);
    
    try {
      const recommendation = await copilot.analyzeSecurityQuestion(question, mockContext);
      
      console.log(`   ✅ Response: ${recommendation.title}`);
      console.log(`   🎯 Priority: ${recommendation.priority}`);
      console.log(`   🧠 AI Generated: ${recommendation.aiGenerated ? 'Yes' : 'No'}`);
      if (recommendation.modelUsed) {
        console.log(`   🤖 Model: ${recommendation.modelUsed}`);
      }
      console.log(`   📝 Description: ${recommendation.description.substring(0, 100)}...`);
      console.log('');
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      console.log('');
    }
  }

  console.log('🎉 AI Security Copilot test completed!');
}

// Self-executing test function
if (typeof window === 'undefined') {
  // Node.js environment
  testAISecurityCopilot().catch(console.error);
} else {
  // Browser environment - expose function globally
  window.testAISecurityCopilot = testAISecurityCopilot;
  console.log('💡 Run testAISecurityCopilot() in the browser console to test the AI integration');
}

export { testAISecurityCopilot };