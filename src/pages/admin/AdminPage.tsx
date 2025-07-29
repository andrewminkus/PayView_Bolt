import React from 'react'
import { Navigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { IntegrationTestPanel } from '../../components/admin/IntegrationTestPanel'
import { useAppContext } from '../../context/AppContext'

export function AdminPage() {
  const { user, profile } = useAppContext()

  // Simple admin check - in production, you'd want proper role-based access
  const isAdmin = user?.email === 'admin@payview.io' || 
                  profile?.email === 'admin@payview.io' ||
                  window.location.hostname === 'localhost'

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            <span className="text-gradient">Admin Panel</span>
          </h1>
          <p className="text-lg text-gray-600">System administration and testing tools</p>
        </div>

        <Tabs defaultValue="integration-tests" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm border-0 shadow-lg p-1">
            <TabsTrigger value="integration-tests">Integration Tests</TabsTrigger>
            <TabsTrigger value="system-health">System Health</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
          </TabsList>

          <TabsContent value="integration-tests" className="space-y-8">
            <IntegrationTestPanel />
          </TabsContent>

          <TabsContent value="system-health" className="space-y-8">
            <div className="text-center py-16">
              <h3 className="text-lg font-medium text-gray-900 mb-2">System Health Monitoring</h3>
              <p className="text-gray-600">Coming soon...</p>
            </div>
          </TabsContent>

          <TabsContent value="configuration" className="space-y-8">
            <div className="text-center py-16">
              <h3 className="text-lg font-medium text-gray-900 mb-2">System Configuration</h3>
              <p className="text-gray-600">Coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}