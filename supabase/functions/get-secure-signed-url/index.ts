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
    const { fileId } = await req.json()

    // Get auth user
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser(token)
    if (!user) throw new Error('Unauthorized')

    // Get file details
    const { data: file, error: fileError } = await supabaseClient
      .from('files')
      .select('*')
      .eq('id', fileId)
      .single()

    if (fileError || !file) {
      throw new Error('File not found')
    }

    // Check if user has access (is creator or has purchased)
    let hasAccess = false

    if (file.creator_id === user.id) {
      hasAccess = true
    } else {
      const { data: transaction } = await supabaseClient
        .from('transactions')
        .select('expiry_date')
        .eq('file_id', fileId)
        .eq('buyer_id', user.id)
        .eq('payment_status', 'completed')
        .single()

      if (transaction) {
        // Check if access has expired
        if (!transaction.expiry_date || new Date(transaction.expiry_date) > new Date()) {
          hasAccess = true
        }
      }
    }

    if (!hasAccess) {
      throw new Error('Access denied')
    }

    // Generate signed URL for the file
    const fileName = file.file_url.split('/').pop()
    const filePath = `${file.creator_id}/${fileName}`

    const { data: signedUrlData, error: signedUrlError } = await supabaseClient.storage
      .from('uploads')
      .createSignedUrl(filePath, 3600) // 1 hour expiry

    if (signedUrlError) {
      throw signedUrlError
    }

    return new Response(
      JSON.stringify({ url: signedUrlData.signedUrl }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})