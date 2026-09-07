-- Trigger-only helpers must never be directly callable through PostgREST RPC.
begin;
revoke execute on function public.apply_booking_delivery_total() from anon, authenticated;
revoke execute on function public.validate_flow_feedback_item() from anon, authenticated;
-- Public feedback is intentionally exposed only through the anonymous visitor path.
revoke execute on function public.get_public_flow_feedback() from authenticated;
commit;
