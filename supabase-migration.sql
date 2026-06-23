-- ============================================================
-- IRIS Studio — Supabase Migration SQL
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ────────────────────────────────────────────
-- 1. TABLES
-- ────────────────────────────────────────────

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT now(),
  name          TEXT NOT NULL,
  phone         TEXT NOT NULL,
  package_name  TEXT NOT NULL,
  package_price NUMERIC(10,2) DEFAULT 0,
  date          TEXT NOT NULL,
  time          TEXT NOT NULL,
  duration      INT DEFAULT 50,
  companions    INT DEFAULT 0,
  extra_companions INT DEFAULT 0,
  extra_companions_cost NUMERIC(10,2) DEFAULT 0,
  extras        JSONB DEFAULT '[]'::jsonb,
  extras_total  NUMERIC(10,2) DEFAULT 0,
  subtotal      NUMERIC(10,2) DEFAULT 0,
  deposit_amount NUMERIC(10,2) DEFAULT 10,
  remaining_amount NUMERIC(10,2) DEFAULT 0,
  receipt_url   TEXT,
  notes         TEXT DEFAULT '',
  status        TEXT DEFAULT 'pending'
);

-- Graduation Orders
CREATE TABLE IF NOT EXISTS graduation_orders (
  id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at          TIMESTAMPTZ DEFAULT now(),
  order_number        TEXT NOT NULL,
  package_name        TEXT NOT NULL,
  package_price       NUMERIC(10,2) DEFAULT 0,
  arabic_name         TEXT NOT NULL,
  english_name        TEXT NOT NULL,
  phone               TEXT NOT NULL,
  university          TEXT DEFAULT '',
  major               TEXT DEFAULT '',
  custom_dedication   TEXT DEFAULT '',
  external_template_number TEXT DEFAULT '',
  internal_template_number TEXT DEFAULT '',
  front_cover_url     TEXT,
  back_cover_urls     JSONB DEFAULT '[]'::jsonb,
  internal_image_urls JSONB DEFAULT '[]'::jsonb,
  photographic_pages_quantity INT DEFAULT 0,
  photographic_pages_urls     JSONB DEFAULT '[]'::jsonb,
  photographic_pages_total    NUMERIC(10,2) DEFAULT 0,
  delivery_selected   BOOLEAN DEFAULT false,
  delivery_address    TEXT DEFAULT '',
  delivery_cost       NUMERIC(10,2) DEFAULT 0,
  subtotal            NUMERIC(10,2) DEFAULT 0,
  deposit_amount      NUMERIC(10,2) DEFAULT 5,
  remaining_amount    NUMERIC(10,2) DEFAULT 0,
  receipt_url         TEXT,
  status              TEXT DEFAULT 'pending'
);

-- Portfolio Items
CREATE TABLE IF NOT EXISTS portfolio_items (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT now(),
  title       TEXT NOT NULL,
  category    TEXT DEFAULT '',
  image_url   TEXT NOT NULL
);

-- Package Items
CREATE TABLE IF NOT EXISTS package_items (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT now(),
  title       TEXT NOT NULL,
  type        TEXT DEFAULT '',
  image_url   TEXT NOT NULL
);

-- Template Items
CREATE TABLE IF NOT EXISTS template_items (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT now(),
  title       TEXT NOT NULL DEFAULT '',
  category    TEXT NOT NULL DEFAULT 'cover',
  image_url   TEXT NOT NULL
);

-- Booking Extras (admin-managed list shown in booking form)
CREATE TABLE IF NOT EXISTS booking_extras (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT now(),
  name        TEXT NOT NULL,
  price       NUMERIC(10,2) DEFAULT 0
);

-- Book Extras (admin-managed list for graduation book orders)
CREATE TABLE IF NOT EXISTS book_extras (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT now(),
  name        TEXT NOT NULL,
  price       NUMERIC(10,2) DEFAULT 0,
  icon        TEXT DEFAULT '➕'
);


-- ────────────────────────────────────────────
-- 2. ROW LEVEL SECURITY (RLS)
-- ────────────────────────────────────────────
-- Since we're not using Supabase Auth, allow all operations for anon.

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on bookings" ON bookings FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE graduation_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on graduation_orders" ON graduation_orders FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on portfolio_items" ON portfolio_items FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE package_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on package_items" ON package_items FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE template_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on template_items" ON template_items FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE booking_extras ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on booking_extras" ON booking_extras FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE book_extras ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on book_extras" ON book_extras FOR ALL USING (true) WITH CHECK (true);


-- ────────────────────────────────────────────
-- 3. STORAGE BUCKETS
-- ────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio', 'portfolio', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('packages', 'packages', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('templates', 'templates', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-receipts', 'payment-receipts', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('graduation-orders', 'graduation-orders', true) ON CONFLICT (id) DO NOTHING;


-- ────────────────────────────────────────────
-- 4. STORAGE POLICIES (allow public read + anon upload/delete)
-- ────────────────────────────────────────────

-- Portfolio bucket
CREATE POLICY "Public read portfolio" ON storage.objects FOR SELECT USING (bucket_id = 'portfolio');
CREATE POLICY "Allow upload portfolio" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'portfolio');
CREATE POLICY "Allow update portfolio" ON storage.objects FOR UPDATE USING (bucket_id = 'portfolio');
CREATE POLICY "Allow delete portfolio" ON storage.objects FOR DELETE USING (bucket_id = 'portfolio');

-- Packages bucket
CREATE POLICY "Public read packages" ON storage.objects FOR SELECT USING (bucket_id = 'packages');
CREATE POLICY "Allow upload packages" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'packages');
CREATE POLICY "Allow update packages" ON storage.objects FOR UPDATE USING (bucket_id = 'packages');
CREATE POLICY "Allow delete packages" ON storage.objects FOR DELETE USING (bucket_id = 'packages');

-- Templates bucket
CREATE POLICY "Public read templates" ON storage.objects FOR SELECT USING (bucket_id = 'templates');
CREATE POLICY "Allow upload templates" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'templates');
CREATE POLICY "Allow update templates" ON storage.objects FOR UPDATE USING (bucket_id = 'templates');
CREATE POLICY "Allow delete templates" ON storage.objects FOR DELETE USING (bucket_id = 'templates');

-- Payment receipts bucket
CREATE POLICY "Public read payment-receipts" ON storage.objects FOR SELECT USING (bucket_id = 'payment-receipts');
CREATE POLICY "Allow upload payment-receipts" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'payment-receipts');
CREATE POLICY "Allow update payment-receipts" ON storage.objects FOR UPDATE USING (bucket_id = 'payment-receipts');
CREATE POLICY "Allow delete payment-receipts" ON storage.objects FOR DELETE USING (bucket_id = 'payment-receipts');

-- Graduation orders bucket
CREATE POLICY "Public read graduation-orders" ON storage.objects FOR SELECT USING (bucket_id = 'graduation-orders');
CREATE POLICY "Allow upload graduation-orders" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'graduation-orders');
CREATE POLICY "Allow update graduation-orders" ON storage.objects FOR UPDATE USING (bucket_id = 'graduation-orders');
CREATE POLICY "Allow delete graduation-orders" ON storage.objects FOR DELETE USING (bucket_id = 'graduation-orders');


-- ────────────────────────────────────────────
-- 5. SEED DATA — Default booking extras
-- ────────────────────────────────────────────

INSERT INTO booking_extras (name, price) VALUES
  ('دفتر تخرج', 12),
  ('بوستر فوم 44×30', 6),
  ('بوستر خشب 44×30', 12),
  ('وشاح تطريز', 15),
  ('وشاح طباعة', 15),
  ('طاقية تطريز', 15),
  ('طاقية طباعة', 10),
  ('ريل جريدة تخرج A2', 10);


-- ────────────────────────────────────────────
-- 6. SEED DATA — Default book extras
-- ────────────────────────────────────────────

INSERT INTO book_extras (name, price, icon) VALUES
  ('صورة فوتوغرافية داخل الدفتر', 1, '📸'),
  ('إضافة دفتر تخرج', 12, '📖'),
  ('ملصق خشبي 44×30', 0, '🪵'),
  ('ملصق خشبي 60×40', 0, '🪵'),
  ('ملصق خشبي + ستاند', 0, '🖼️'),
  ('وشاح مطرز', 0, '🧣'),
  ('وشاح مطبوع', 0, '🧣'),
  ('قبعة مطرزة', 0, '🎓'),
  ('قبعة مطبوعة', 0, '🎓'),
  ('ريلز تخرج', 0, '🎬'),
  ('جريدة تخرج A2', 0, '📰');
