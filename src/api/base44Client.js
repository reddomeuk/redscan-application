import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Validate required environment variables
const requiredEnvVars = {
  VITE_BASE44_APP_ID: import.meta.env.VITE_BASE44_APP_ID,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

// In development, provide fallback values instead of throwing
const isDevelopment = import.meta.env.VITE_APP_ENV === 'development' || import.meta.env.NODE_ENV === 'development' || !import.meta.env.PROD;
const enableMockAPI = import.meta.env.VITE_ENABLE_MOCK_API === 'true';

if (missingVars.length > 0) {
  if (isDevelopment || enableMockAPI) {
    console.warn('Missing environment variables in development mode, using fallback values:', missingVars);
  } else {
    console.error('Missing required environment variables:', missingVars);
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

// Use fallback values for development
const appId = import.meta.env.VITE_BASE44_APP_ID || 'redscan-development-app';
const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Create a client with authentication required and proper configuration
export const base44 = createClient({
  appId: appId,
  apiUrl: apiUrl,
  requiresAuth: !enableMockAPI, // Don't require auth in mock mode
  timeout: 30000, // 30 second timeout
  retries: 3, // Retry failed requests
  rateLimit: {
    requests: 100,
    window: 60000 // 100 requests per minute
  },
  mockMode: enableMockAPI // Enable mock mode if configured
});
