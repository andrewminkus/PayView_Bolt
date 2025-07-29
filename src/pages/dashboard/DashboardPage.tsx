import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { UploadedFiles } from '../../components/dashboard/UploadedFiles'
import { TransactionsTab } from '../../components/dashboard/TransactionsTab'
import { Analytics } from '../../components/dashboard/Analytics'
import { FileUpload } from '../../components/dashboard/FileUpload'
import { useAppContext } from '../../context/AppContext'

export function DashboardPage() {
  const { profile, updateProfile } = useAppContext()

  // Make user a creator if they're not already
  React.useEffect(() => {
    if (profile && !profile.is_creator) {
      updateProfile({ is_creator: true })
    }
  }, [profile, updateProfile])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          <span className="text-gradient">Dashboard</span>
        </h1>
        <p className="text-lg text-gray-600">Manage your content and track your earnings</p>
      </div>

      <Tabs defaultValue="analytics" className="space-y-8">
        <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg p-1">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="uploaded">My Files</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-8">
          <Analytics />
        </TabsContent>

        <TabsContent value="upload" className="space-y-8">
          <FileUpload />
        </TabsContent>

        <TabsContent value="uploaded" className="space-y-8">
          <UploadedFiles />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-8">
          <TransactionsTab />
        </TabsContent>
      </Tabs>
    </div>
    </div>
  )
}