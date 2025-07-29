import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { fileId, buyerId, sessionId } = await req.json()

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get file and user details
    const { data: file } = await supabaseClient
      .from('files')
      .select(`
        *,
        creator_id (
          username
        )
      `)
      .eq('id', fileId)
      .single()

    const { data: { user: buyer } } = await supabaseClient.auth.admin.getUserById(buyerId)
    const { data: { user: creator } } = await supabaseClient.auth.admin.getUserById(file.creator_id)

    if (!file || !buyer || !creator) {
      throw new Error('Missing required data')
    }

    const creatorName = file.creator_id?.username || 'PayView Creator'
    const contentUrl = `${Deno.env.get('VITE_APP_URL') || 'https://payview.io'}/content/${fileId}`
    const price = (file.price / 100).toFixed(2)

    // Send buyer confirmation email
    await supabaseClient.functions.invoke('send-email', {
      body: {
        to: buyer.email,
        subject: 'Purchase Confirmation - PayView',
        html: `
          <h2>Thank you for your purchase!</h2>
          <p>You have successfully purchased <strong>${file.file_name}</strong> from ${creatorName}.</p>
          <p><strong>Amount paid:</strong> $${price}</p>
          <p><strong>Access your content:</strong> <a href="${contentUrl}">Click here</a></p>
          <p>If you have any questions, please don't hesitate to contact us.</p>
          <p>Best regards,<br>The PayView Team</p>
        `
      }
    })

    // Send seller notification email
    await supabaseClient.functions.invoke('send-email', {
      body: {
        to: creator.email,
        subject: 'New Sale Notification - PayView',
        html: `
          <h2>Congratulations! You made a sale!</h2>
          <p><strong>${file.file_name}</strong> was purchased by ${buyer.email}.</p>
          <p><strong>Sale amount:</strong> $${price}</p>
          <p><strong>Your earnings:</strong> $${(file.price * 0.95 / 100).toFixed(2)} (after 5% platform fee)</p>
          <p>The funds will be transferred to your connected Stripe account according to your payout schedule.</p>
          <p>Best regards,<br>The PayView Team</p>
        `
      }
    })

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Notification error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})