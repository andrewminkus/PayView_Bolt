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
    const { sellerAccountId, contentTitle, priceCents, currency = 'usd' } = await req.json()

    if (!sellerAccountId || !contentTitle || !priceCents) {
      throw new Error('Missing required fields')
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    })

    // Create the Stripe Product
    const product = await stripe.products.create({
      name: contentTitle,
      type: 'service',
    }, {
      stripeAccount: sellerAccountId
    })

    // Create the Price
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: priceCents,
      currency: currency,
    }, {
      stripeAccount: sellerAccountId
    })

    return new Response(
      JSON.stringify({
        productId: product.id,
        priceId: price.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Create product/price error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})