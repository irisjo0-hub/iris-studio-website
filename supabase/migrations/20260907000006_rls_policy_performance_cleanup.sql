-- Align repository migrations with the production RLS policy cleanup applied on 2026-09-07.

begin;

alter policy "Admins can view own admin status"
  on public.admin_users
  to authenticated
  using ((select auth.uid()) = user_id);

alter policy "Public read booking_extras" on public.booking_extras to anon;
alter policy "Public read flow_items" on public.flow_items to anon;
alter policy "Public read offers" on public.offers to anon;
alter policy "Public read package_items" on public.package_items to anon;
alter policy "Public read packages" on public.packages to anon;
alter policy "Public read portfolio_items" on public.portfolio_items to anon;
alter policy "Public read printing_products" on public.printing_products to anon;
alter policy "Public read site_settings" on public.site_settings to anon;
alter policy "Public read template_items" on public.template_items to anon;

commit;
