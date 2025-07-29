import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AppProvider } from './context/AppContext'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/auth/LoginPage'
import { SignupPage } from './pages/auth/SignupPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { PaywallPage } from './pages/paywall/PaywallPage'
import { ContentPage } from './pages/content/ContentPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { StripeSuccessPage } from './pages/StripeSuccessPage'
import { AdminPage } from './pages/admin/AdminPage'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { config } from './lib/config'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  // Initialize configuration and validate environment
  React.useEffect(() => {
    try {
      console.log('🚀 PayView.io Configuration:', {
        environment: import.meta.env.MODE,
        appUrl: config.app.url,
        domain: config.app.domain,
        supabaseUrl: config.supabase.url?.substring(0, 30) + '...',
      })
    } catch (error) {
      console.error('❌ Configuration Error:', error)
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/paywall/:fileId" element={<PaywallPage />} />
                <Route path="/stripe-success" element={<StripeSuccessPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/content/:fileId"
                  element={
                    <ProtectedRoute>
                      <ContentPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="*"
                  element={
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                        <p className="text-gray-600 mb-8">Page not found</p>
                        <a href="/" className="text-primary hover:underline">
                          Go back home
                        </a>
                      </div>
                    </div>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster position="top-right" />
        </Router>
      </AppProvider>
    </QueryClientProvider>
  )
}

export default App