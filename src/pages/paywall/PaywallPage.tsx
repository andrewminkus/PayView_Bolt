import React from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Shield, ShieldX, Clock, User, DollarSign } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { supabase } from '../../lib/supabase'
import { useAppContext } from '../../context/AppContext'
import { formatCurrency, formatDate, getFileType } from '../../lib/utils'
import { toast } from 'sonner'

export function PaywallPage() {
  const { fileId } = useParams<{ fileId: string }>()
  const { user } = useAppContext()

  const { data: fileData, isLoading } = useQuery({
    queryKey: ['paywall-file', fileId],
    queryFn: async () => {
      if (!fileId) return null

      const { data, error } = await supabase
        .from('files')
        .select(`
          *,
          creator_id (
            username,
            profile_image
          )
        `)
        .eq('id', fileId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!fileId,
  })

  const { data: hasAccess } = useQuery({
    queryKey: ['file-access', fileId, user?.id],
    queryFn: async () => {
      if (!fileId || !user) return false

      // Check if user is the creator
      if (fileData?.creator_id === user.id) return true

      // Check if user has purchased access
      const { data, error } = await supabase
        .from('transactions')
        .select('expiry_date')
        .eq('file_id', fileId)
        .eq('buyer_id', user.id)
        .eq('payment_status', 'completed')
        .single()

      if (error) return false

      // Check if access has expired
      if (data.expiry_date && new Date(data.expiry_date) < new Date()) {
        return false
      }

      return true
    },
    enabled: !!fileId && !!user && !!fileData,
  })

  const handlePurchase = async () => {
    if (!fileData) {
      toast.error('File not found')
      return
    }
    
    if (!user) {
      toast.error('Please sign in to purchase this content')
      return
    }

    try {
      // Check if seller has Stripe setup for this specific file
      if (!fileData.stripe_price_id || !fileData.stripe_product_id) {
        toast.error('Payment processing not available for this content')
        return
      }

      // Get seller's Stripe account info
      const { data: sellerProfile } = await supabase
        .from('profiles')
        .select('stripe_connected_account_id, stripe_onboarding_complete')
        .eq('user_id', fileData.creator_id)
        .single()

      // Create Stripe checkout session
      const { data, error } = await supabase.functions.invoke('stripe-create-checkout', {
        body: {
          priceId: fileData.stripe_price_id,
          sellerAccountId: sellerProfile?.stripe_connected_account_id,
          platformFeeCents: Math.round(fileData.price * 0.05), // 5% platform fee
          fileId: fileData.id,
          buyerUserId: user.id,
        }
      })

      if (error) throw error

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error('Failed to create checkout session')
      }
    } catch (error: any) {
      console.error('Purchase error:', error)
      toast.error(error.message || 'Failed to initiate purchase')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!fileData) {
    return <Navigate to="/404" replace />
  }

  const fileType = getFileType(fileData.file_name)
  const isExpired = fileData.expiry_date && new Date(fileData.expiry_date) < new Date()
  const creatorName = fileData.creator_id?.username || 'Unknown Creator'

  // If user has access, redirect to content page
  if (hasAccess && !isExpired) {
    return <Navigate to={`/content/${fileId}`} replace />
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card className="overflow-hidden">
          <CardHeader className="gradient-primary text-white">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                <FileIcon fileType={fileType} className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl">{fileData.file_name}</CardTitle>
                <CardDescription className="text-purple-100 flex items-center mt-2">
                  <User className="h-4 w-4 mr-2" />
                  by {creatorName}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {isExpired ? (
              <div className="text-center py-8">
                <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Content Expired</h3>
                <p className="text-gray-600">
                  This content expired on {formatDate(fileData.expiry_date!)}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <span className="text-3xl font-bold text-gray-900">
                      {formatCurrency(fileData.price / 100)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {fileData.allow_screenshots ? (
                      <>
                        <Shield className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-gray-600">Downloads enabled</span>
                      </>
                    ) : (
                      <>
                        <ShieldX className="h-5 w-5 text-orange-500" />
                        <span className="text-sm text-gray-600">Screenshot protected</span>
                      </>
                    )}
                  </div>
                </div>

                {fileData.expiry_date && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Access expires {formatDate(fileData.expiry_date)}</span>
                  </div>
                )}

                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-2">What you'll get:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Instant access to {fileData.file_name}</li>
                    <li>• Secure content delivery</li>
                    {fileData.allow_screenshots ? (
                      <li>• Download and screenshot permissions</li>
                    ) : (
                      <li>• View-only access with screenshot prevention</li>
                    )}
                    {fileData.expiry_date ? (
                      <li>• Access until {formatDate(fileData.expiry_date)}</li>
                    ) : (
                      <li>• Lifetime access</li>
                    )}
                  </ul>
                </div>

                <Button 
                  onClick={handlePurchase}
                  size="lg"
                  className="w-full"
                  disabled={!user}
                >
                  {!user ? 'Sign in to Purchase' : `Purchase for ${formatCurrency(fileData.price / 100)}`}
                </Button>

                {!user && (
                  <p className="text-center text-sm text-gray-600">
                    <a href="/login" className="text-primary hover:underline">
                      Sign in
                    </a>{' '}
                    or{' '}
                    <a href="/signup" className="text-primary hover:underline">
                      create an account
                    </a>{' '}
                    to purchase this content
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function FileIcon({ fileType, className }: { fileType: string; className?: string }) {
  const icons = {
    image: '🖼️',
    video: '🎥',
    audio: '🎵',
    pdf: '📄',
    document: '📝',
    other: '📁',
  }

  return (
    <span className={className}>
      {icons[fileType as keyof typeof icons] || icons.other}
    </span>
  )
}