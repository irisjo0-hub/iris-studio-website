import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Upload a file to a Supabase storage bucket.
 * @param {string} bucket - Bucket name
 * @param {string} path - File path within the bucket (e.g. 'receipts/123.jpg')
 * @param {File|Blob} file - The file to upload
 * @returns {Promise<string>} Public URL of the uploaded file
 */
export async function uploadFile(bucket, path, file) {
  // Sanitize path: split by folder slashes, sanitize base name and extension of each part, then join back
  const sanitizedPath = path.split('/').map(segment => {
    if (!segment) return '';
    const parts = segment.split('.');
    const ext = parts.length > 1 ? parts.pop().toLowerCase() : '';
    const base = parts.join('.');
    
    const cleanBase = base
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .replace(/__+/g, '_')
      .replace(/^_+|_+$/g, '');
      
    const finalBase = cleanBase.trim() || 'file';
    return ext ? `${finalBase}.${ext}` : finalBase;
  }).filter(Boolean).join('/');

  const { error } = await supabase.storage
    .from(bucket)
    .upload(sanitizedPath, file, { upsert: true });

  if (error) throw error;

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(sanitizedPath);

  return data.publicUrl;
}

/**
 * Get the public URL for a file already in storage.
 * @param {string} bucket
 * @param {string} path
 * @returns {string}
 */
export function getPublicUrl(bucket, path) {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Delete a file from a storage bucket.
 * @param {string} bucket
 * @param {string} path
 */
export async function deleteFile(bucket, path) {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);
  if (error) console.error('Failed to delete file:', error);
}

/**
 * Extract the storage path from a full public URL.
 * E.g. "https://xxx.supabase.co/storage/v1/object/public/portfolio/img.jpg" → "img.jpg"
 * @param {string} url
 * @param {string} bucket
 * @returns {string|null}
 */
export function extractPathFromUrl(url, bucket) {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.substring(idx + marker.length);
}
