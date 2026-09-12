import { supabase } from './supabase';

export async function createRepresentativeAccount({ email, password, fullName }) {
  const { data, error } = await supabase.functions.invoke('create-representative', {
    body: { email, password, fullName },
  });
  if (error) return { data: null, error: new Error(data?.error || error.message) };
  if (data?.error) return { data: null, error: new Error(data.error) };
  return { data, error: null };
}
