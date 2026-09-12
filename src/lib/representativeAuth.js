import { createClient } from '@supabase/supabase-js';

export function createRepresentativeAuthClient() {
  return createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}

export async function createRepresentativeAccount({ email, password, fullName }) {
  const { data, error } = await createRepresentativeAuthClient().functions.invoke('create-representative', {
    body: { email, password, fullName },
  });
  if (error) return { data: null, error: new Error(data?.error || error.message) };
  if (data?.error) return { data: null, error: new Error(data.error) };
  return { data, error: null };
}
