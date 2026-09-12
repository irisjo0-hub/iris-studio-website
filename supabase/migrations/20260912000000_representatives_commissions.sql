-- IRIS representatives and commission system
create table if not exists public.representatives (
  user_id uuid primary key references auth.users(id) on delete cascade,
  employee_code text unique not null,
  full_name text not null,
  phone text,
  commission_rate numeric(5,2) not null default 10 check (commission_rate >= 0 and commission_rate <= 100),
  status text not null default 'active' check (status in ('active','inactive','deleted')),
  wallet_type text,
  wallet_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.commission_sales (
  id uuid primary key default gen_random_uuid(),
  representative_id uuid not null references public.representatives(user_id) on delete restrict,
  sale_date date not null default current_date,
  customer_name text,
  division text,
  service_name text not null,
  amount numeric(12,2) not null check (amount > 0),
  commission_rate numeric(5,2) not null check (commission_rate >= 0 and commission_rate <= 100),
  commission_amount numeric(12,2) not null default 0 check (commission_amount >= 0),
  notes text,
  created_at timestamptz not null default now()
);
create table if not exists public.commission_withdrawals (
  id uuid primary key default gen_random_uuid(),
  representative_id uuid not null references public.representatives(user_id) on delete restrict,
  amount numeric(12,2) not null check (amount > 0),
  wallet_type text not null,
  wallet_number text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected','paid')),
  requested_at timestamptz not null default now(),
  processed_at timestamptz,
  processed_by uuid references auth.users(id) on delete set null,
  notes text
);
create or replace function public.set_commission_amount()
returns trigger language plpgsql set search_path = ''
as $$
begin
  new.commission_amount := round((new.amount * new.commission_rate / 100.0)::numeric, 2);
  return new;
end;
$$;
drop trigger if exists commission_sales_set_amount on public.commission_sales;
create trigger commission_sales_set_amount before insert or update of amount, commission_rate
on public.commission_sales for each row execute function public.set_commission_amount();
create or replace function public.touch_representative_updated_at()
returns trigger language plpgsql set search_path = ''
as $$ begin new.updated_at := now(); return new; end; $$;
drop trigger if exists representatives_touch_updated_at on public.representatives;
create trigger representatives_touch_updated_at before update on public.representatives
for each row execute function public.touch_representative_updated_at();
create schema if not exists private;
grant usage on schema private to authenticated;
create or replace function private.is_representative(p_user_id uuid default null)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.representatives r
    where r.user_id = coalesce($1, (select auth.uid())) and r.status = 'active');
$$;
revoke execute on function private.is_representative(uuid) from public, anon;
grant execute on function private.is_representative(uuid) to authenticated;
create or replace function private.rep_available_balance(p_user_id uuid)
returns numeric language sql stable security definer set search_path = ''
as $$
  select greatest(0,
    coalesce((select sum(s.commission_amount) from public.commission_sales s where s.representative_id = $1),0)
    - coalesce((select sum(w.amount) from public.commission_withdrawals w where w.representative_id = $1 and w.status in ('pending','approved','paid')),0));
$$;
revoke execute on function private.rep_available_balance(uuid) from public, anon;
grant execute on function private.rep_available_balance(uuid) to authenticated;
create or replace function public.request_commission_withdrawal(p_amount numeric, p_wallet_type text, p_wallet_number text)
returns public.commission_withdrawals language plpgsql security invoker set search_path = ''
as $$
declare v_uid uuid := auth.uid(); v_available numeric; v_row public.commission_withdrawals;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  if not private.is_representative(v_uid) then raise exception 'Representative account is not active'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'Withdrawal amount must be greater than zero'; end if;
  if p_wallet_type is null or length(trim(p_wallet_type)) < 2 then raise exception 'Wallet type is required'; end if;
  if p_wallet_number is null or length(regexp_replace(p_wallet_number, '\D', '', 'g')) < 8 then raise exception 'Valid wallet number is required'; end if;
  v_available := private.rep_available_balance(v_uid);
  if p_amount > v_available then raise exception 'Insufficient available commission balance'; end if;
  insert into public.commission_withdrawals(representative_id, amount, wallet_type, wallet_number)
  values (v_uid, round(p_amount,2), trim(p_wallet_type), trim(p_wallet_number)) returning * into v_row;
  return v_row;
end;
$$;
revoke execute on function public.request_commission_withdrawal(numeric,text,text) from public, anon;
grant execute on function public.request_commission_withdrawal(numeric,text,text) to authenticated;
alter table public.representatives enable row level security;
alter table public.commission_sales enable row level security;
alter table public.commission_withdrawals enable row level security;
revoke all on table public.representatives, public.commission_sales, public.commission_withdrawals from anon;
grant select on public.representatives, public.commission_sales, public.commission_withdrawals to authenticated;
grant insert on public.commission_withdrawals to authenticated;
grant update, insert, delete on public.commission_sales to authenticated;
grant update on public.representatives to authenticated;
drop policy if exists "Admins manage representatives" on public.representatives;
create policy "Admins manage representatives" on public.representatives for all to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "Representatives view own profile" on public.representatives;
create policy "Representatives view own profile" on public.representatives for select to authenticated
using (user_id = (select auth.uid()) and status = 'active');
drop policy if exists "Admins manage sales" on public.commission_sales;
create policy "Admins manage sales" on public.commission_sales for all to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "Representatives view own sales" on public.commission_sales;
create policy "Representatives view own sales" on public.commission_sales for select to authenticated
using (representative_id = (select auth.uid()));
drop policy if exists "Admins manage withdrawals" on public.commission_withdrawals;
create policy "Admins manage withdrawals" on public.commission_withdrawals for all to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "Representatives can request withdrawals" on public.commission_withdrawals;\ncreate policy "Representatives can request withdrawals" on public.commission_withdrawals for insert to authenticated\nwith check (representative_id = (select auth.uid()) and (select private.is_representative((select auth.uid()))));\n\ndrop policy if exists "Representatives view own withdrawals" on public.commission_withdrawals;
create policy "Representatives view own withdrawals" on public.commission_withdrawals for select to authenticated
using (representative_id = (select auth.uid()));
create index if not exists idx_commission_sales_rep_date on public.commission_sales(representative_id, sale_date);
create index if not exists idx_commission_withdrawals_rep_status on public.commission_withdrawals(representative_id, status);
create index if not exists idx_commission_withdrawals_requested_at on public.commission_withdrawals(requested_at);

create or replace function private.handle_new_representative()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(new.raw_user_meta_data ->> 'role','') = 'representative' then
    insert into public.representatives (user_id, employee_code, email, full_name, status)
    values (new.id, 'REP-' || upper(substr(new.id::text,1,8)), lower(new.email),
            coalesce(nullif(new.raw_user_meta_data ->> 'full_name',''), 'Representative'), 'active')
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_representative on auth.users;
create trigger on_auth_user_created_representative
after insert on auth.users
for each row execute function private.handle_new_representative();

create unique index if not exists representatives_email_unique
on public.representatives(lower(email)) where email is not null;

drop policy if exists "Representatives view own sales" on public.commission_sales;
create policy "Representatives view own sales" on public.commission_sales
for select to authenticated
using (representative_id = (select auth.uid()) and (select private.is_representative((select auth.uid()))));

drop policy if exists "Representatives view own withdrawals" on public.commission_withdrawals;
create policy "Representatives view own withdrawals" on public.commission_withdrawals
for select to authenticated
using (representative_id = (select auth.uid()) and (select private.is_representative((select auth.uid()))));

create index if not exists idx_commission_withdrawals_processed_by on public.commission_withdrawals(processed_by);


create or replace function public.request_commission_withdrawal(p_amount numeric, p_wallet_type text, p_wallet_number text)
returns public.commission_withdrawals
language plpgsql security invoker set search_path = ''
as $$
declare
  v_uid uuid := auth.uid(); v_available numeric; v_row public.commission_withdrawals; v_wallet text := trim(coalesce(p_wallet_number,''));
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_uid::text, 0));
  if not private.is_representative(v_uid) then raise exception 'Representative account is not active'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'Withdrawal amount must be greater than zero'; end if;
  if p_wallet_type is null or length(trim(p_wallet_type)) < 2 then raise exception 'Wallet type is required'; end if;
  if length(v_wallet) < 3 or length(v_wallet) > 100 then raise exception 'Valid wallet number or wallet identifier is required'; end if;
  if p_wallet_type in ('Zain Cash','Orange Money','UWallet','Dinarak') and v_wallet !~ '^[A-Za-z0-9@._+ -]+$' then raise exception 'Invalid wallet number or identifier'; end if;
  v_available := private.rep_available_balance(v_uid);
  if p_amount > v_available then raise exception 'Insufficient available commission balance'; end if;
  insert into public.commission_withdrawals(representative_id, amount, wallet_type, wallet_number) values (v_uid, round(p_amount,2), trim(p_wallet_type), v_wallet) returning * into v_row;
  return v_row;
end; $$;
