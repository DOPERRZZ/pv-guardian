import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

// Valid status values
const VALID_STATUSES = ['Normal', 'Fault', 'Warning']

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('Unauthorized request: No valid Authorization header')
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create client with user's token for auth verification
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token)
    
    if (claimsError || !claimsData?.claims) {
      console.log('Unauthorized request: Invalid token')
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = claimsData.claims.sub
    console.log(`Authenticated request from user: ${userId}`)

    // Create service role client for database operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    if (req.method === 'GET') {
      // Fetch current system status
      const { data: status, error } = await supabase
        .from('system_status')
        .select('*')
        .limit(1)
        .single()

      if (error) {
        console.error('Error fetching status:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch system status' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify(status),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST') {
      // Parse and validate input
      let body: unknown
      try {
        body = await req.json()
      } catch {
        return new Response(
          JSON.stringify({ error: 'Invalid JSON body' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (typeof body !== 'object' || body === null) {
        return new Response(
          JSON.stringify({ error: 'Request body must be an object' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { status: newStatus, currentFault, confidence } = body as { 
        status?: unknown; 
        currentFault?: unknown; 
        confidence?: unknown 
      }

      // Validate status
      let validatedStatus = 'Normal'
      if (newStatus !== undefined) {
        if (typeof newStatus !== 'string' || !VALID_STATUSES.includes(newStatus)) {
          return new Response(
            JSON.stringify({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        validatedStatus = newStatus
      }

      // Validate currentFault
      let validatedFault = 'Normal'
      if (currentFault !== undefined) {
        if (typeof currentFault !== 'string' || currentFault.length > 100) {
          return new Response(
            JSON.stringify({ error: 'Invalid currentFault. Must be a string with max 100 characters' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        validatedFault = currentFault.trim() || 'Normal'
      }

      // Validate confidence
      let validatedConfidence = 0
      if (confidence !== undefined) {
        if (typeof confidence !== 'number' || isNaN(confidence) || confidence < 0 || confidence > 1) {
          return new Response(
            JSON.stringify({ error: 'Invalid confidence. Must be a number between 0 and 1' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        validatedConfidence = confidence
      }

      const { data: existing } = await supabase
        .from('system_status')
        .select('id')
        .limit(1)
        .single()

      const { data: updated, error } = await supabase
        .from('system_status')
        .update({
          status: validatedStatus,
          current_fault: validatedFault,
          confidence: validatedConfidence,
          last_updated: new Date().toISOString()
        })
        .eq('id', existing?.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating status:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to update system status' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify(updated),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Status error:', error)
    return new Response(
      JSON.stringify({ error: 'An error occurred processing your request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
