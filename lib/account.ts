import { supabase } from './supabase';

/**
 * Permanently deletes the current user's account and all associated data by
 * invoking the `delete-account` Supabase Edge Function (which runs server-side
 * with the service role key). After a successful delete the local session is
 * cleared so the app returns to the auth flow.
 */
export async function deleteAccount(): Promise<void> {
  const { data, error } = await supabase.functions.invoke('delete-account', {
    method: 'POST',
  });

  if (error) {
    throw error;
  }

  if (data && (data as { error?: string }).error) {
    throw new Error((data as { error: string }).error);
  }

  // Session is invalid once the user is deleted; clear any local remnants.
  await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
}
