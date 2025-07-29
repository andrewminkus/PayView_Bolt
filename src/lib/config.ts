// PayView.io Configuration
export const config = {
  // App Configuration
  app: {
    name: 'PayView',
    url: import.meta.env.PROD ? 'https://payview.io' : 'http://localhost:5173',
    domain: 'payview.io',
  },
  
  // Supabase Configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  
  // Stripe Configuration
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  },
  
  // Feature Flags
  features: {
    screenshotPrevention: true,
    emailNotifications: true,
    analytics: true,
  },
  
  // Platform Settings
  platform: {
    feePercentage: 5, // 5% platform fee
    maxFileSize: 100 * 1024 * 1024, // 100MB
    supportedFileTypes: [
      'pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg',
      'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm',
      'mp3', 'wav', 'ogg', 'aac', 'flac',
      'doc', 'docx', 'txt', 'rtf'
    ],
  }
}

// Environment validation
export function validateEnvironment() {
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ]
  
  const missing = required.filter(key => !import.meta.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
  
  return true
}

// URL helpers
export const urls = {
  home: () => config.app.url,
  dashboard: () => `${config.app.url}/dashboard`,
  paywall: (fileId: string) => `${config.app.url}/paywall/${fileId}`,
  content: (fileId: string) => `${config.app.url}/content/${fileId}`,
  stripeSuccess: (sessionId: string) => `${config.app.url}/stripe-success?session_id=${sessionId}`,
  stripeCancel: (fileId: string) => `${config.app.url}/paywall/${fileId}`,
}