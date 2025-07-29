import React, { useEffect, useState } from 'react'
import { useSearchParams, Navigate } from 'react-router-dom'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { supabase } from '../lib/supabase'
import { useAppContext } from '../context/AppContext'

export function StripeSuccessPage() {
  const [searchParams] = useSearchParams()
  const { user } = useAppContext()
  const [transaction, setTransaction] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (!sessionId || !user) {
      setLoading(false)
      return
    }

    const fetchTransaction = async () => {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select(`
            *,
            files (
              id,
              file_name,
              price
            )
          `)
          .eq('stripe_session_id', sessionId)
          .eq('buyer_id', user.id)
          .single()

        if (error) throw error
        setTransaction(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTransaction()
  }, [sessionId, user])

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!sessionId) {
    return <Navigate to="/dashboard" replace />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Payment Error</CardTitle>
            <CardDescription>
              {error || 'Transaction not found'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.href = '/dashboard'}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl -z-10" />
      
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center py-12">
            <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-12 w-12" />
            </div>
            <CardTitle className="text-3xl font-bold">Payment Successful!</CardTitle>
            <CardDescription className="text-green-100 text-lg mt-2">
              Your purchase has been completed
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8 space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {transaction.files?.file_name}
              </h3>
              <p className="text-gray-600 mb-6">
                You now have access to this content
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-semibold text-gray-900">
                  ${(transaction.amount_paid / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-mono text-sm text-gray-700">
                  {transaction.id.slice(0, 8)}...
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Completed
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => window.location.href = `/content/${transaction.files?.id}`}
                className="flex-1 py-3 text-lg font-semibold bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg transition-all duration-300"
              >
                Access Content
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/dashboard'}
                className="flex-1 py-3 text-lg"
              >
                Go to Dashboard
              </Button>
            </div>

            <div className="text-center text-sm text-gray-500 mt-6">
              A confirmation email has been sent to your email address
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}