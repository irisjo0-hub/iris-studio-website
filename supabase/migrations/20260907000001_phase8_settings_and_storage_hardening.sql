-- ============================================================
-- IRIS Studio — Supabase Security Migration: Phase 8
-- Public settings allowlist + storage bucket restrictions
-- ============================================================

BEGIN;

DROP POLICY IF EXISTS "Public read site_settings" ON public.site_settings;

CREATE POLICY "Public read site_settings"
  ON public.site_settings
  FOR SELECT
  TO anon, authenticated
  USING (
    key IN (
      'whatsapp_number', 'facebook_link', 'instagram_link',
      'slogan_line_1_ar', 'slogan_line_1_en', 'slogan_line_2_ar', 'slogan_line_2_en',
      'slogan_line_1', 'slogan_line_2', 'supporting_text_ar', 'supporting_text_en', 'supporting_text',
      'hero_primary_cta_ar', 'hero_primary_cta_en',
      'studio_address_ar', 'studio_address_en', 'studio_address', 'location_map_url',
      'office_hours_ar', 'office_hours_en', 'office_hours', 'logo_url', 'hero_logo_url',
      'hero_desktop_video_url', 'hero_mobile_video_url',
      'hero_division_media_image', 'hero_division_studio_image', 'hero_division_print_image',
      'hero_motion_media_image', 'hero_motion_studio_image', 'hero_motion_print_image',
      'hero_motion_images', 'hero_image_display_count',
      'division_media_image', 'division_studio_image', 'division_print_image',
      'division_media_title_ar', 'division_media_title_en',
      'division_media_subtitle_ar', 'division_media_subtitle_en',
      'division_studio_title_ar', 'division_studio_title_en',
      'division_studio_subtitle_ar', 'division_studio_subtitle_en',
      'division_print_title_ar', 'division_print_title_en',
      'division_print_subtitle_ar', 'division_print_subtitle_en',
      'division_media_url', 'division_studio_url', 'division_print_url',
      'preloader_text', 'booking_companion_config', 'booking_delivery_config'
    )
  );

UPDATE storage.buckets
SET file_size_limit = 8388608,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
WHERE id IN ('payment-receipts', 'graduation-orders', 'printing-orders');

DROP POLICY IF EXISTS "Public upload payment-receipts bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public upload graduation-orders bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public upload printing-orders bucket" ON storage.objects;

CREATE POLICY "Public upload payment-receipts bucket"
  ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (
    bucket_id = 'payment-receipts'
    AND lower(COALESCE(metadata->>'mimetype', '')) IN ('image/jpeg', 'image/png', 'image/webp')
    AND (metadata->>'size') ~ '^[0-9]+$'
    AND (metadata->>'size')::BIGINT BETWEEN 1 AND 8388608
    AND name !~ '(^|/)\.\.(/|$)'
  );

CREATE POLICY "Public upload graduation-orders bucket"
  ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (
    bucket_id = 'graduation-orders'
    AND lower(COALESCE(metadata->>'mimetype', '')) IN ('image/jpeg', 'image/png', 'image/webp')
    AND (metadata->>'size') ~ '^[0-9]+$'
    AND (metadata->>'size')::BIGINT BETWEEN 1 AND 8388608
    AND name !~ '(^|/)\.\.(/|$)'
  );

CREATE POLICY "Public upload printing-orders bucket"
  ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (
    bucket_id = 'printing-orders'
    AND lower(COALESCE(metadata->>'mimetype', '')) IN ('image/jpeg', 'image/png', 'image/webp')
    AND (metadata->>'size') ~ '^[0-9]+$'
    AND (metadata->>'size')::BIGINT BETWEEN 1 AND 8388608
    AND name !~ '(^|/)\.\.(/|$)'
  );

COMMIT;
