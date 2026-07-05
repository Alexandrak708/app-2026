// Supabase Edge Function: delete-account
//
// Permanently deletes the calling user's account and associated data.
// Deploy with:  supabase functions deploy delete-account
//
// Required function secrets (set in the Supabase dashboard or via CLI):
//   SUPABASE_URL       – your project URL (auto-provided at runtime)
//   SERVICE_ROLE_KEY   – service role key (manually set via `supabase secrets set`)
//
// NOTE: Secrets prefixed with SUPABASE_ are reserved/auto-injected by the
// Supabase runtime, so we use SERVICE_ROLE_KEY instead.
//
// The service role key NEVER leaves the server. The client only sends its
// own auth JWT; this function verifies it, then deletes that user only.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY')!;

    // Client scoped to the caller's JWT — used only to identify who is calling.
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Admin client — service role, server-side only.
    const admin = createClient(supabaseUrl, serviceRoleKey);

    // 1. Delete the user's avatar(s) from storage (best-effort).
    try {
      const { data: files } = await admin.storage.from('avatars').list(user.id);
      if (files && files.length > 0) {
        await admin.storage
          .from('avatars')
          .remove(files.map((f: { name: string }) => `${user.id}/${f.name}`));
      }
    } catch (_) {
      // ignore storage cleanup errors
    }

    // 2. Delete the user's profile row (best-effort; RLS bypassed by service role).
    await admin.from('profiles').delete().eq('id', user.id);

    // 3. Delete the auth user itself. This cascades any FK-linked rows
    //    that are configured with ON DELETE CASCADE.
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteError) {
      return new Response(JSON.stringify({ error: deleteError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
