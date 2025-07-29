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
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      throw new Error('No Stripe signature found')
    }

    const body = await req.text()
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    })

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
    )

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const { fileId, buyerUserId } = session.metadata || {}

        if (!fileId) {
          console.error('No fileId in session metadata')
          break
        }

        // Update transaction status
        const { error: updateError } = await supabaseClient
          .from('transactions')
          .update({ 
            payment_status: 'completed',
            completed_at: new Date().toISOString(),
            stripe_payment_intent_id: session.payment_intent as string
          })
          .eq('stripe_session_id', session.id)

        if (updateError) {
          console.error('Error updating transaction:', updateError)
          break
        }

        // Send notification emails
        if (buyerUserId) {
          await supabaseClient.functions.invoke('send-notification', {
            body: {
              fileId,
              buyerUserId,
              sessionId: session.id
            }
          })
        }

        console.log(`Payment completed for file ${fileId}`)
        break
      }

      case 'account.updated': {
        const account = event.data.object as Stripe.Account
        
        // Update profile onboarding status
        const { error: updateError } = await supabaseClient
          .from('profiles')
          .update({ 
            stripe_onboarding_complete: account.details_submitted && account.charges_enabled
          })
          .eq('stripe_connected_account_id', account.id)

        if (updateError) {
          console.error('Error updating profile:', updateError)
        }

        console.log(`Account updated: ${account.id}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})