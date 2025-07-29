import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Eye, Calendar, DollarSign, ExternalLink, ShoppingBag } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { supabase } from '../../lib/supabase'
import { useAppContext } from '../../context/AppContext'
import { formatCurrency, formatDate } from '../../lib/utils'

export function PurchasedFiles() {
  const { user } = useAppContext()

  const { data: purchases, isLoading } = useQuery({
    queryKey: ['purchased-files', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          files (
            id,
            name,
            price_cents,
            expires_at,
            screenshot_prevention,
            profiles!files_creator_id_fkey (
              email
            )
          )
        `)
        .eq('buyer_user_id', user.id)
        .eq('payment_status', 'completed')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!user,
  })

  const viewContent = (fileId: string) => {
    window.open(`/content/${fileId}`, '_blank')
  }

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
        const file = purchase.files
        if (!file) return null

        const isExpired = file.expires_at && new Date(file.expires_at) < new Date()
        const creatorName = file.profiles?.email?.split('@')[0] || 'Unknown Creator'

        return (
          <Card key={purchase.id} className={isExpired ? 'opacity-75' : ''}>
            <CardHeader>
              <CardTitle className="truncate">{file.name}</CardTitle>
              <CardDescription className="flex items-center justify-between">
                <span>by {creatorName}</span>
                <span className="flex items-center">
                  <DollarSign className="h-3 w-3 mr-1" />
                  {formatCurrency(purchase.amount_cents / 100)}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  Purchased {formatDate(purchase.created_at)}
                </div>
                
                {file.expires_at && (
                  <div className={`flex items-center text-sm ${isExpired ? 'text-red-500' : 'text-gray-500'}`}>
                    <Calendar className="h-4 w-4 mr-2" />
                    {isExpired ? 'Access expired' : 'Access expires'} {formatDate(file.expires_at)}
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button
                    variant={isExpired ? "outline" : "default"}
                    size="sm"
                    onClick={() => viewContent(file.id)}
                    disabled={isExpired}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {isExpired ? 'Expired' : 'View Content'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/paywall/${file.id}`, '_blank')}
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