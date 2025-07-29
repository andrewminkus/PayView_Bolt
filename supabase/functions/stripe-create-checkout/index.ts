import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      priceId, 
      sellerAccountId, 
      platformFeeCents, 
      fileId,
      buyerUserId 
    } = await req.json()

    if (!priceId || !sellerAccountId || !fileId) {
      throw new Error('Missing required fields')
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    })

    const baseUrl = Deno.env.get('VITE_APP_URL') || 'https://payview.io'
    const successUrl = `${baseUrl}/stripe-success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${baseUrl}/paywall/${fileId}`

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      payment_intent_data: {
        application_fee_amount: platformFeeCents,
        transfer_data: {
          destination: sellerAccountId
        },
        metadata: {
          fileId,
          buyerUserId: buyerUserId || '',
          sellerAccountId
        }
      },
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        fileId,
        buyerUserId: buyerUserId || '',
        sellerAccountId
      }
    })

    // Create pending transaction record
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    await supabaseClient
      .from('transactions')
      .insert({
        file_id: fileId,
        buyer_id: buyerUserId,
        stripe_session_id: session.id,
        amount_paid: platformFeeCents + (session.amount_total || 0),
        payment_status: 'pending'
      })

    return new Response(
      JSON.stringify({ 
        sessionId: session.id,
        url: session.url 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Create checkout session error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})