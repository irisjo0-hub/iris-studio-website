import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: cors });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'Authentication required' }, 401);
  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!url || !serviceKey) return json({ error: 'Server configuration is incomplete' }, 500);
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
  const { data: { user }, error: userError } = await admin.auth.getUser(token);
  if (userError || !user) return json({ error: 'Invalid session' }, 401);
  const { data: isAdmin, error: adminError } = await admin.rpc('is_admin', {});
  if (adminError || !isAdmin) return json({ error: 'Administrator access required' }, 403);
  let payload: Record<string, unknown>;
  try { payload = await req.json(); } catch { return json({ error: 'Invalid JSON body' }, 400); }
  const action = String(payload.action || '');
  try {
    if (action === 'create') {
      const email = String(payload.email || '').trim().toLowerCase();
      const password = String(payload.password || '');
      const fullName = String(payload.full_name || '').trim();
      const phone = String(payload.phone || '').trim() || null;
      const commissionRate = Number(payload.commission_rate ?? 10);
      const walletType = String(payload.wallet_type || '').trim() || null;
      const walletNumber = String(payload.wallet_number || '').trim() || null;
      if (!email || !password || !fullName) return json({ error: 'Name, email and password are required' }, 400);
      if (password.length < 8) return json({ error: 'Password must be at least 8 characters' }, 400);
      if (!Number.isFinite(commissionRate) || commissionRate < 0 || commissionRate > 100) return json({ error: 'Invalid commission rate' }, 400);
      const code = 'REP-' + crypto.randomUUID().slice(0, 8).toUpperCase();
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email, password, email_confirm: true,
        user_metadata: { full_name: fullName, role: 'representative' },
      });
      if (createError || !created.user) return json({ error: createError?.message || 'Could not create account' }, 400);
      const { error: profileError } = await admin.from('representatives').insert({
        user_id: created.user.id, employee_code: code, full_name: fullName, phone,
        commission_rate: commissionRate, wallet_type: walletType, wallet_number: walletNumber, status: 'active',
      });
      if (profileError) {
        await admin.auth.admin.deleteUser(created.user.id, false);
        return json({ error: profileError.message }, 400);
      }
      return json({ ok: true, representative_id: created.user.id, employee_code: code });
    }
    if (action === 'update') {
      const id = String(payload.user_id || '');
      const fields: Record<string, unknown> = {};
      if (payload.full_name !== undefined) fields.full_name = String(payload.full_name).trim();
      if (payload.phone !== undefined) fields.phone = String(payload.phone).trim() || null;
      if (payload.commission_rate !== undefined) fields.commission_rate = Number(payload.commission_rate);
      if (payload.wallet_type !== undefined) fields.wallet_type = String(payload.wallet_type).trim() || null;
      if (payload.wallet_number !== undefined) fields.wallet_number = String(payload.wallet_number).trim() || null;
      if (payload.status !== undefined) fields.status = String(payload.status);
      if (fields.commission_rate !== undefined && (!Number.isFinite(Number(fields.commission_rate)) || Number(fields.commission_rate) < 0 || Number(fields.commission_rate) > 100)) return json({ error: 'Invalid commission rate' }, 400);
      const { error } = await admin.from('representatives').update(fields).eq('user_id', id);
      if (error) return json({ error: error.message }, 400);
      if (fields.status === 'active') await admin.auth.admin.updateUserById(id, { ban_duration: 'none' });
      if (fields.status === 'inactive' || fields.status === 'deleted') await admin.auth.admin.updateUserById(id, { ban_duration: '876000h' });
      return json({ ok: true });
    }
    if (action === 'reset_password') {
      const id = String(payload.user_id || '');
      const password = String(payload.password || '');
      if (password.length < 8) return json({ error: 'Password must be at least 8 characters' }, 400);
      const { error } = await admin.auth.admin.updateUserById(id, { password });
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }
    if (action === 'delete') {
      const id = String(payload.user_id || '');
      const { error } = await admin.from('representatives').update({ status: 'deleted' }).eq('user_id', id);
      if (error) return json({ error: error.message }, 400);
      const { error: authError } = await admin.auth.admin.updateUserById(id, { ban_duration: '876000h' });
      if (authError) return json({ error: authError.message }, 400);
      return json({ ok: true });
    }
    return json({ error: 'Unknown action' }, 400);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unexpected server error' }, 500);
  }
});