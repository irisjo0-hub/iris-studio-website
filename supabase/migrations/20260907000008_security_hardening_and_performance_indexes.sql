-- Security hardening for public RPCs and booking helpers.
-- This is intentionally idempotent so it can be applied to a fresh database,
-- while the equivalent change has already been applied to the current project.

begin;

alter function public.booking_time_range(text, text, integer)
  set search_path = public, pg_temp;

revoke execute on function public.create_public_booking(jsonb) from authenticated;
revoke execute on function public.create_public_graduation_order(jsonb) from authenticated;
revoke execute on function public.create_public_printing_order(jsonb) from authenticated;
revoke execute on function public.get_public_booking_availability(text, text) from authenticated;
revoke execute on function public.get_public_printing_order_status(text, text) from authenticated;

revoke execute on function public.is_admin() from anon;
revoke execute on function public.is_admin() from authenticated;
grant execute on function public.is_admin() to authenticated;

create index if not exists printing_orders_product_id_idx
  on public.printing_orders (product_id);

commit;
