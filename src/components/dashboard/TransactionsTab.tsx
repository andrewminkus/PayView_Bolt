import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Eye, Calendar, DollarSign, ExternalLink, ShoppingBag, CreditCard, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { db, type TransactionDetails } from '../../lib/supabase'
import { useAppContext } from '../../context/AppContext'
import { formatCents, formatDate, createContentUrl, createPaywallUrl } from '../../lib/utils'
import { toast } from 'sonner'

export function TransactionsTab() {
  const { user, profile, refetchProfile } = useAppContext()

  const { data: purchases, isLoading: purchasesLoading } = useQuery({
    queryKey: ['user-purchases', user?.id],
    queryFn: async () => {
      if (!user) return []
      return await db.getUserPurchases(user.id)
    },
    enabled: !!user,
  })

  const { data: sales, isLoading: salesLoading } = useQuery({
    queryKey: ['creator-sales', user?.id],
    queryFn: async () => {
      if (!user) return []
      return await db.getCreatorSales(user.id)
    },
    enabled: !!user,
  })

  const handleStripeOnboarding = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('stripe-connect-onboard')
      
      if (error) throw error
      
      // Redirect to Stripe onboarding
      window.location.href = data.onboardingUrl
    } catch (error: any) {
      toast.error(error.message || 'Failed to start Stripe onboarding')
    }
  }

  const viewContent = (fileSlug: string) => {
    const url = createContentUrl(fileSlug)
    window.open(url, '_blank')
  }

  const needsStripeSetup = !profile?.stripe_onboarding_complete
  const totalEarnings = sales?.reduce((sum, sale) => sum + sale.seller_earnings_cents, 0) || 0
  const pendingPayouts = needsStripeSetup ? totalEarnings : 0

  return (
    <div className="space-y-8">
      {/* Stripe Connection Status */}
      <Card className={`border-0 shadow-xl ${needsStripeSetup ? 'bg-gradient-to-br from-orange-50 to-red-50' : 'bg-gradient-to-br from-green-50 to-emerald-50'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${needsStripeSetup ? 'bg-gradient-to-br from-orange-500 to-red-600' : 'bg-gradient-to-br from-green-500 to-emerald-600'}`}>
                {needsStripeSetup ? (
                  <AlertCircle className="h-8 w-8 text-white" />
                ) : (
                  <CheckCircle className="h-8 w-8 text-white" />
                )}
              </div>
              <div>
                <CardTitle className="text-2xl text-gray-900">
                  {needsStripeSetup ? 'Connect Stripe Account' : 'Stripe Connected'}
                </CardTitle>
                <CardDescription className="text-lg">
                  {needsStripeSetup 
                    ? 'Connect your Stripe account to receive payouts from sales'
                    : 'Your Stripe account is connected and ready to receive payouts'
                  }
                </CardDescription>
              </div>
            </div>
            {needsStripeSetup && (
              <Button 
                onClick={handleStripeOnboarding}
                size="lg"
                className="px-8 py-3 text-lg font-semibold"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Connect Stripe
              </Button>
            )}
          </div>
        </CardHeader>
        {needsStripeSetup && pendingPayouts > 0 && (
          <CardContent>
            <div className="bg-white/80 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Payouts</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCents(pendingPayouts)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">From {sales?.length || 0} sales</p>
                  <p className="text-sm text-orange-600 font-medium">
                    Connect Stripe to receive payments
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Transactions Tabs */}
      <Tabs defaultValue="purchases" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg p-1">
          <TabsTrigger value="purchases">My Purchases</TabsTrigger>
          <TabsTrigger value="sales">My Sales</TabsTrigger>
        </TabsList>

        <TabsContent value="purchases" className="space-y-6">
          <PurchasesSection purchases={purchases} isLoading={purchasesLoading} viewContent={viewContent} />
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <SalesSection sales={sales} isLoading={salesLoading} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function PurchasesSection({ 
  purchases, 
  isLoading, 
  viewContent 
}: { 
  purchases: TransactionDetails[] | undefined
  isLoading: boolean
  viewContent: (fileSlug: string) => void 
}) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!purchases?.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No purchases yet</h3>
            <p className="mt-2 text-gray-500">
              Files you purchase will appear here for easy access.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {purchases.map((purchase) => {
        const isExpired = purchase.access_expires_at && new Date(purchase.access_expires_at) < new Date()

        return (
          <Card key={purchase.id} className={isExpired ? 'opacity-75' : ''}>
            <CardHeader>
              <CardTitle className="truncate">{purchase.file_title}</CardTitle>
              <CardDescription className="flex items-center justify-between">
                <span>by {purchase.seller_username || 'Unknown'}</span>
                <span className="flex items-center">
                  <DollarSign className="h-3 w-3 mr-1" />
                  {formatCents(purchase.amount_cents)}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  Purchased {formatDate(purchase.created_at)}
                </div>
                
                {purchase.access_expires_at && (
                  <div className={`flex items-center text-sm ${isExpired ? 'text-red-500' : 'text-gray-500'}`}>
                    <Calendar className="h-4 w-4 mr-2" />
                    {isExpired ? 'Access expired' : 'Access expires'} {formatDate(purchase.access_expires_at)}
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button
                    variant={isExpired ? "outline" : "default"}
                    size="sm"
                    onClick={() => purchase.file_slug && viewContent(purchase.file_slug)}
                    disabled={isExpired || !purchase.file_slug}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {isExpired ? 'Expired' : 'View Content'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => purchase.file_slug && window.open(createPaywallUrl(purchase.file_slug), '_blank')}
                    disabled={!purchase.file_slug}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function SalesSection({ 
  sales, 
  isLoading 
}: { 
  sales: TransactionDetails[] | undefined
  isLoading: boolean 
}) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!sales?.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="text-center">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No sales yet</h3>
            <p className="mt-2 text-gray-500">
              When people purchase your content, transactions will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sales.map((sale) => (
        <Card key={sale.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="truncate">{sale.file_title}</CardTitle>
            <CardDescription className="flex items-center justify-between">
              <span className="flex items-center">
                <DollarSign className="h-3 w-3 mr-1" />
                {formatCents(sale.amount_cents)}
              </span>
              <span className="text-green-600 font-medium">
                #{sale.transaction_number}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-2" />
                Sold {formatDate(sale.created_at)}
              </div>
              
              <div className="flex items-center text-sm text-gray-500">
                <span>Buyer: {sale.buyer_username || sale.buyer_email}</span>
              </div>

              <div className="pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Your earnings:</span>
                  <span className="font-semibold text-green-600">
                    {formatCents(sale.seller_earnings_cents)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Platform fee:</span>
                  <span>{formatCents(sale.platform_fee_cents)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}