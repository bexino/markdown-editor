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
    if (!supabaseUrl || !supabaseAnonKey) {
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
    const pendingEmail =
      (
        typeof (user as { new_email?: string }).new_email === 'string'
          ? (user as { new_email?: string }).new_email
          : typeof (user as { email_change?: string }).email_change === 'string'
            ? (user as { email_change?: string }).email_change
            : ''
      )
        .trim()
        .toLowerCase()

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

    const { error: cancelError } = await userClient.rpc('cancel_pending_email_change', {
      target_user_id: user.id,
      confirmed_email: currentEmail,
    })

    if (cancelError) {
      return Response.json(
        { error: cancelError.message ?? 'Unable to cancel the pending email change.' },
        { status: 500, headers: corsHeaders }
      )
    }

    const {
      data: { user: refreshedUser },
      error: refreshError,
    } = await userClient.auth.getUser()

    if (refreshError || !refreshedUser) {
      return Response.json(
        { error: refreshError?.message ?? 'Unable to refresh the updated user.' },
        { status: 500, headers: corsHeaders }
      )
    }

    return Response.json(
      {
        user: refreshedUser,
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
