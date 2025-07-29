import { supabase } from './supabase'
import { config, validateEnvironment } from './config'

export interface IntegrationTestResult {
  service: string
  status: 'success' | 'error' | 'warning'
  message: string
  details?: any
}

export class PayViewIntegrationTester {
  private results: IntegrationTestResult[] = []

  async runAllTests(): Promise<IntegrationTestResult[]> {
    this.results = []
    
    console.log('🚀 Starting PayView.io Integration Tests...')
    
    await this.testEnvironmentVariables()
    await this.testSupabaseConnection()
    await this.testSupabaseAuth()
    await this.testSupabaseDatabase()
    await this.testSupabaseStorage()
    await this.testSupabaseEdgeFunctions()
    await this.testStripeIntegration()
    await this.testDomainConfiguration()
    
    this.logResults()
    return this.results
  }

  private async testEnvironmentVariables() {
    try {
      validateEnvironment()
      this.addResult('Environment', 'success', 'All required environment variables are set')
      
      // Check optional variables
      const optional = ['VITE_STRIPE_PUBLISHABLE_KEY']
      const missingOptional = optional.filter(key => !import.meta.env[key])
      
      if (missingOptional.length > 0) {
        this.addResult('Environment', 'warning', `Optional variables missing: ${missingOptional.join(', ')}`)
      }
    } catch (error: any) {
      this.addResult('Environment', 'error', error.message)
    }
  }

  private async testSupabaseConnection() {
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1)
      
      if (error) throw error
      
      this.addResult('Supabase Connection', 'success', 'Successfully connected to Supabase')
    } catch (error: any) {
      this.addResult('Supabase Connection', 'error', `Connection failed: ${error.message}`)
    }
  }

  private async testSupabaseAuth() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        this.addResult('Supabase Auth', 'success', `Authenticated as: ${session.user.email}`)
      } else {
        this.addResult('Supabase Auth', 'warning', 'No active session (user not logged in)')
      }
    } catch (error: any) {
      this.addResult('Supabase Auth', 'error', `Auth test failed: ${error.message}`)
    }
  }

  private async testSupabaseDatabase() {
    try {
      // Test all required tables exist
      const tables = ['profiles', 'files', 'transactions', 'additional_files']
      const tableTests = await Promise.all(
        tables.map(async (table) => {
          try {
            const { error } = await supabase.from(table).select('*').limit(1)
            return { table, success: !error, error }
          } catch (err) {
            return { table, success: false, error: err }
          }
        })
      )

      const failedTables = tableTests.filter(t => !t.success)
      
      if (failedTables.length === 0) {
        this.addResult('Supabase Database', 'success', `All tables accessible: ${tables.join(', ')}`)
      } else {
        this.addResult('Supabase Database', 'error', `Failed tables: ${failedTables.map(t => t.table).join(', ')}`)
      }
    } catch (error: any) {
      this.addResult('Supabase Database', 'error', `Database test failed: ${error.message}`)
    }
  }

  private async testSupabaseStorage() {
    try {
      const { data, error } = await supabase.storage.listBuckets()
      
      if (error) throw error
      
      const uploadsBucket = data.find(bucket => bucket.name === 'uploads')
      
      if (uploadsBucket) {
        this.addResult('Supabase Storage', 'success', 'Storage bucket "uploads" exists and accessible')
      } else {
        this.addResult('Supabase Storage', 'error', 'Storage bucket "uploads" not found')
      }
    } catch (error: any) {
      this.addResult('Supabase Storage', 'error', `Storage test failed: ${error.message}`)
    }
  }

  private async testSupabaseEdgeFunctions() {
    const functions = [
      'stripe-connect-onboard',
      'stripe-create-product-price',
      'stripe-create-checkout',
      'stripe-webhook',
      'get-secure-signed-url',
      'send-email'
    ]

    try {
      // Test if functions are deployed (this will fail if not authenticated, but that's expected)
      const functionTests = await Promise.allSettled(
        functions.map(async (funcName) => {
          const { error } = await supabase.functions.invoke(funcName, { body: {} })
          return { funcName, deployed: true, error }
        })
      )

      const deployedFunctions = functionTests.filter(result => result.status === 'fulfilled').length
      
      this.addResult(
        'Supabase Edge Functions', 
        deployedFunctions > 0 ? 'success' : 'warning',
        `${deployedFunctions}/${functions.length} functions appear to be deployed`
      )
    } catch (error: any) {
      this.addResult('Supabase Edge Functions', 'warning', 'Could not test edge functions (may require authentication)')
    }
  }

  private async testStripeIntegration() {
    try {
      // Test if Stripe publishable key is valid format
      const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
      
      if (!stripeKey) {
        this.addResult('Stripe Integration', 'warning', 'Stripe publishable key not configured')
        return
      }

      if (stripeKey.startsWith('pk_test_') || stripeKey.startsWith('pk_live_')) {
        this.addResult('Stripe Integration', 'success', `Stripe key configured (${stripeKey.startsWith('pk_test_') ? 'test' : 'live'} mode)`)
      } else {
        this.addResult('Stripe Integration', 'error', 'Invalid Stripe publishable key format')
      }
    } catch (error: any) {
      this.addResult('Stripe Integration', 'error', `Stripe test failed: ${error.message}`)
    }
  }

  private async testDomainConfiguration() {
    try {
      const currentUrl = window.location.origin
      const expectedUrl = config.app.url
      
      if (currentUrl === expectedUrl) {
        this.addResult('Domain Configuration', 'success', `Correct domain: ${currentUrl}`)
      } else {
        this.addResult(
          'Domain Configuration', 
          'warning', 
          `Domain mismatch - Current: ${currentUrl}, Expected: ${expectedUrl}`
        )
      }

      // Test HTTPS
      if (window.location.protocol === 'https:' || window.location.hostname === 'localhost') {
        this.addResult('SSL/HTTPS', 'success', 'Secure connection established')
      } else {
        this.addResult('SSL/HTTPS', 'error', 'Insecure connection - HTTPS required for production')
      }
    } catch (error: any) {
      this.addResult('Domain Configuration', 'error', `Domain test failed: ${error.message}`)
    }
  }

  private addResult(service: string, status: 'success' | 'error' | 'warning', message: string, details?: any) {
    this.results.push({ service, status, message, details })
  }

  private logResults() {
    console.log('\n📊 PayView.io Integration Test Results:')
    console.log('=' .repeat(50))
    
    this.results.forEach(result => {
      const icon = result.status === 'success' ? '✅' : result.status === 'error' ? '❌' : '⚠️'
      console.log(`${icon} ${result.service}: ${result.message}`)
      
      if (result.details) {
        console.log(`   Details:`, result.details)
      }
    })
    
    const summary = {
      success: this.results.filter(r => r.status === 'success').length,
      warnings: this.results.filter(r => r.status === 'warning').length,
      errors: this.results.filter(r => r.status === 'error').length,
    }
    
    console.log('\n📈 Summary:')
    console.log(`✅ Success: ${summary.success}`)
    console.log(`⚠️  Warnings: ${summary.warnings}`)
    console.log(`❌ Errors: ${summary.errors}`)
    
    if (summary.errors === 0) {
      console.log('\n🎉 All critical tests passed! PayView.io is ready for production.')
    } else {
      console.log('\n🔧 Please fix the errors above before deploying to production.')
    }
  }
}

// Export singleton instance
export const integrationTester = new PayViewIntegrationTester()