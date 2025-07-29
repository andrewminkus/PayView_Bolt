import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { DollarSign, FileText, TrendingUp, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { db } from '../../lib/supabase'
import { useAppContext } from '../../context/AppContext'
import { formatCents } from '../../lib/utils'

export function Analytics() {
  const { user, profile } = useAppContext()

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['creator-analytics', user?.id],
    queryFn: async () => {
      if (!user) return null

      // Get creator files and sales data
      const [files, sales] = await Promise.all([
        db.getCreatorFiles(user.id, 100), // Get more files for analytics
        db.getCreatorSales(user.id)
      ])

      // Calculate analytics
      const totalFiles = files.length
      const totalSales = sales.length
      const totalEarnings = sales.reduce((sum, sale) => sum + sale.seller_earnings_cents, 0)
      const totalRevenue = sales.reduce((sum, sale) => sum + sale.amount_cents, 0)
      
      // Find best selling file
      const filesSalesCount = files.map(file => ({
        ...file,
        salesCount: sales.filter(sale => sale.file_id === file.id).length
      }))
      
      const bestSellingFile = filesSalesCount.reduce((best, file) => 
        file.salesCount > (best?.salesCount || 0) ? file : best
      , null as any)

      // Calculate conversion rate (views to sales)
      const totalViews = files.reduce((sum, file) => sum + file.view_count, 0)
      const conversionRate = totalViews > 0 ? (totalSales / totalViews) * 100 : 0

      return {
        totalFiles,
        totalSales,
        totalEarnings,
        totalRevenue,
        bestSellingFile: bestSellingFile?.title || 'No sales yet',
        conversionRate,
        averageOrderValue: totalSales > 0 ? totalRevenue / totalSales : 0,
      }
    },
    enabled: !!user,
  })

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-0 shadow-lg hover:shadow-primary/10 transition-all duration-300 bg-gradient-to-br from-white to-green-50/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <DollarSign className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">
            {formatCents(analytics?.totalEarnings || 0)}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            From {analytics?.totalSales || 0} sales
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg hover:shadow-primary/10 transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">{analytics?.totalSales || 0}</div>
          <p className="text-sm text-gray-600 mt-1">
            Completed transactions
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg hover:shadow-primary/10 transition-all duration-300 bg-gradient-to-br from-white to-purple-50/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Files Uploaded</CardTitle>
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
            <FileText className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">{analytics?.totalFiles || 0}</div>
          <p className="text-sm text-gray-600 mt-1">
            Digital products created
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg hover:shadow-primary/10 transition-all duration-300 bg-gradient-to-br from-white to-orange-50/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
            <Users className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">
            {formatCents(analytics?.averageOrderValue || 0)}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Per transaction
          </p>
        </CardContent>
      </Card>

      {/* Best Seller Card - Full Width */}
      <Card className="md:col-span-2 lg:col-span-4 border-0 shadow-lg hover:shadow-primary/10 transition-all duration-300 bg-gradient-to-br from-white to-indigo-50/30">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {analytics?.bestSellingFile || 'No sales yet'}
              </div>
              <p className="text-sm text-gray-600">Best Selling File</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {analytics?.conversionRate?.toFixed(1) || '0.0'}%
              </div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {formatCents(analytics?.totalRevenue || 0)}
              </div>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}