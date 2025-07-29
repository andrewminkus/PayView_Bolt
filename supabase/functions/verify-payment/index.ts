import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const url = new URL(req.url)
    const sessionId = url.searchParams.get('session_id')

    if (!sessionId) {
      throw new Error('No session ID provided')
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    })

    // Retrieve checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      throw new Error('Payment not completed')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { fileId, userId } = session.metadata

    // Update transaction status
    const { error: updateError } = await supabaseClient
      .from('transactions')
      .update({ payment_status: 'completed' })
      .eq('payment_link', sessionId)
      .eq('file_id', fileId)
      .eq('buyer_id', userId)

    if (updateError) {
      throw updateError
    }

    // Send notification emails
    await supabaseClient.functions.invoke('send-notification', {
      body: {
        fileId,
        buyerId: userId,
        sessionId,
      }
    })

    // Redirect to content page
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${Deno.env.get('VITE_APP_URL') || 'https://payview.io'}/content/${fileId}`,
      },
    })
  } catch (error) {
    console.error('Payment verification error:', error)
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${Deno.env.get('VITE_APP_URL') || 'https://payview.io'}/error?message=${encodeURIComponent(error.message)}`,
      },
    })
  }
})