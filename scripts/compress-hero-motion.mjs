/**
 * One-time migration: compress every image in Supabase Storage
 * bucket "packages/hero-motion" to WebP (max 1920px, quality 78).
 *
 * Run locally:
 *   npm install sharp
 *   SUPABASE_URL="https://..." SUPABASE_SERVICE_ROLE_KEY="..." node scripts/compress-hero-motion.mjs
 *
 * The service-role key is required because the script reads/replaces Storage
 * objects. NEVER put the key in Vite env files or commit it to GitHub.
 *
 * By default this script writes a .webp beside the original, updates
 * site_settings.hero_motion_images, then deletes the original only after the
 * new file is confirmed uploaded.
 */
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'packages';
const PREFIX = 'hero-motion/';
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;
const QUALITY = 78;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running.');
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function listAllObjects() {
  const objects = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(PREFIX.replace(/\/$/, ''), {
        limit,
        offset,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (error) throw error;
    objects.push(...(data || []));
    if (!data || data.length < limit) break;
    offset += limit;
  }

  return objects.filter((item) => /\.(jpe?g|png|webp|avif)$/i.test(item.name));
}

async function getHeroSettings() {
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'hero_motion_images')
    .maybeSingle();

  if (error) throw error;
  if (!data?.value) return [];
  try {
    const parsed = JSON.parse(data.value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function publicUrl(path) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function updateHeroSettings(items) {
  const { error } = await supabase
    .from('site_settings')
    .upsert(
      { key: 'hero_motion_images', value: JSON.stringify(items) },
      { onConflict: 'key' }
    );
  if (error) throw error;
}

const objects = await listAllObjects();
const settings = await getHeroSettings();

console.log('Found', objects.length, 'hero-motion images.');

let changed = 0;

for (const object of objects) {
  const sourcePath = PREFIX + object.name;
  const targetPath = sourcePath.replace(/\.[^./]+$/, '.webp');

  try {
    console.log('Processing:', sourcePath);

    const { data: blob, error: downloadError } = await supabase.storage
      .from(BUCKET)
      .download(sourcePath);

    if (downloadError) throw downloadError;

    const input = Buffer.from(await blob.arrayBuffer());

    const output = await sharp(input, { failOn: 'none' })
      .rotate()
      .resize({
        width: MAX_WIDTH,
        height: MAX_HEIGHT,
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: QUALITY, effort: 4 })
      .toBuffer();

    console.log(
      '  ',
      Math.round(input.length / 1024) + ' KB',
      '→',
      Math.round(output.length / 1024) + ' KB'
    );

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(targetPath, output, {
        contentType: 'image/webp',
        cacheControl: '31536000',
        upsert: true
      });

    if (uploadError) throw uploadError;

    const newUrl = publicUrl(targetPath);

    // Replace only exact old URLs in the hero settings JSON.
    for (const item of settings) {
      if (item?.image === publicUrl(sourcePath) || item?.image === sourcePath) {
        item.image = newUrl;
      }
    }

    // Delete the original only after the replacement exists.
    if (targetPath !== sourcePath) {
      const { error: removeError } = await supabase.storage
        .from(BUCKET)
        .remove([sourcePath]);
      if (removeError) throw removeError;
    }

    changed++;
  } catch (error) {
    console.error('FAILED:', sourcePath, error?.message || error);
  }

  await sleep(50);
}

if (changed > 0) {
  await updateHeroSettings(settings);
}

console.log('Done. Converted:', changed, 'of', objects.length);
