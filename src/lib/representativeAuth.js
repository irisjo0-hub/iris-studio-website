import { createClient } from '@supabase/supabase-js';

export function createRepresentativeAuthClient() {
  return createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}

export async function createRepresentativeAccount({ email, password, fullName }) {
  const client = createRepresentativeAuthClient();
  return client.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role: 'representative' },
      emailRedirectTo: window.location.origin + '/representative/login',
    },
  });
}
