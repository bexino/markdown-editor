import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader) {
      return Response.json({ error: 'Missing authorization header.' }, { status: 401, headers: corsHeaders })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      return Response.json(
        { error: 'Supabase function environment variables are not configured.' },
        { status: 500, headers: corsHeaders }
      )
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    })

    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser()

    if (authError || !user?.id || !user.email) {
      return Response.json({ error: 'Unable to authenticate the current user.' }, { status: 401, headers: corsHeaders })
    }

    const payload = (await request.json()) as { email?: string }
    const confirmedEmail = payload.email?.trim().toLowerCase()
    const currentEmail = user.email.trim().toLowerCase()
    const pendingEmail = user.new_email?.trim().toLowerCase()

    if (!confirmedEmail) {
      return Response.json({ error: 'The confirmed email is required.' }, { status: 400, headers: corsHeaders })
    }

    if (confirmedEmail !== currentEmail) {
      return Response.json(
        { error: 'The provided email must match the confirmed email on the account.' },
        { status: 400, headers: corsHeaders }
      )
    }

    if (!pendingEmail) {
      return Response.json(
        {
          user,
          cancelled: false,
        },
        { headers: corsHeaders }
      )
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data, error } = await adminClient.auth.admin.updateUserById(user.id, {
      email: currentEmail,
      email_confirm: true,
      user_metadata: user.user_metadata,
    })

    if (error || !data.user) {
      return Response.json(
        { error: error?.message ?? 'Unable to cancel the pending email change.' },
        { status: 500, headers: corsHeaders }
      )
    }

    return Response.json(
      {
        user: data.user,
        cancelled: true,
      },
      { headers: corsHeaders }
    )
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Unable to cancel the pending email change.',
      },
      { status: 500, headers: corsHeaders }
    )
  }
})
