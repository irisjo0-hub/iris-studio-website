-- flow_items still has a local fallback in the frontend, so feedback must not
-- require a corresponding database row. Keep basic payload validation in the
-- table constraints and moderate publication through status/RLS.
begin;
drop trigger if exists trg_validate_flow_feedback_item on public.flow_feedback;
drop function if exists public.validate_flow_feedback_item();
commit;
