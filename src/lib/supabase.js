import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const PRIVATE_BUCKETS = ['payment-receipts', 'graduation-orders'];

/**
 * Upload a file to a Supabase storage bucket.
 * @param {string} bucket - Bucket name
 * @param {string} path - File path within the bucket (e.g. 'receipts/123.jpg')
 * @param {File|Blob} file - The file to upload
 * @returns {Promise<string>} Public URL for public buckets, or storage path for private buckets
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

  const isPrivate = PRIVATE_BUCKETS.includes(bucket);

  // Security: Never allow client to overwrite existing files using upsert
  let finalPath = sanitizedPath;
  let uploadResult = await supabase.storage
    .from(bucket)
    .upload(finalPath, file, { upsert: false });

  if (uploadResult.error) {
    // If path collision occurs, generate a unique path with timestamp to prevent overwriting
    const parts = sanitizedPath.split('.');
    const ext = parts.length > 1 ? parts.pop() : '';
    const base = parts.join('.');
    finalPath = `${base}_${Date.now()}${ext ? '.' + ext : ''}`;

    uploadResult = await supabase.storage
      .from(bucket)
      .upload(finalPath, file, { upsert: false });

    if (uploadResult.error) throw uploadResult.error;
  }

  // Private buckets must NOT expose getPublicUrl
  if (isPrivate) {
    return finalPath;
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(finalPath);

  return data.publicUrl;
}

/**
 * Get the public URL for a file already in storage (Public buckets only).
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
 * Create a signed URL for a file in a private storage bucket.
 * Strictly returns null on failure for private buckets (no public URL fallback).
 * @param {string} bucket - Bucket name
 * @param {string} pathOrUrl - Storage path or full URL
 * @param {number} expiresIn - Expiration in seconds (default 3600 = 1 hour)
 * @returns {Promise<string|null>} Signed URL or null on failure
 */
export async function createSignedUrl(bucket, pathOrUrl, expiresIn = 3600) {
  if (!pathOrUrl || typeof pathOrUrl !== 'string') return null;

  const isPrivate = PRIVATE_BUCKETS.includes(bucket);

  if (pathOrUrl.includes('/storage/v1/object/sign/')) {
    return pathOrUrl;
  }

  const cleanPath = extractPathFromUrl(pathOrUrl, bucket) || (pathOrUrl.startsWith('http') ? null : pathOrUrl);
  if (!cleanPath) return null;

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(cleanPath, expiresIn);

    if (error || !data?.signedUrl) {
      console.warn(`Could not create signed URL for bucket '${bucket}', path '${cleanPath}':`, error?.message || error);
      return isPrivate ? null : (pathOrUrl.startsWith('http') ? pathOrUrl : null);
    }

    return data.signedUrl;
  } catch (err) {
    console.warn(`Exception creating signed URL for bucket '${bucket}':`, err);
    return isPrivate ? null : (pathOrUrl.startsWith('http') ? pathOrUrl : null);
  }
}

/**
 * Delete a file from a storage bucket.
 * @param {string} bucket
 * @param {string} path
 */
export async function deleteFile(bucket, path) {
  const cleanPath = extractPathFromUrl(path, bucket) || path;
  if (!cleanPath) return;

  const { error } = await supabase.storage
    .from(bucket)
    .remove([cleanPath]);
  if (error) console.error('Failed to delete file:', error);
}

/**
 * Extract the storage path from a full public or signed URL.
 * E.g. "https://xxx.supabase.co/storage/v1/object/public/portfolio/img.jpg" → "img.jpg"
 * @param {string} url
 * @param {string} bucket
 * @returns {string|null}
 */
export function extractPathFromUrl(url, bucket) {
  if (!url || typeof url !== 'string') return null;

  const publicMarker = `/storage/v1/object/public/${bucket}/`;
  const pIdx = url.indexOf(publicMarker);
  if (pIdx !== -1) {
    return url.substring(pIdx + publicMarker.length);
  }

  const signMarker = `/storage/v1/object/sign/${bucket}/`;
  const sIdx = url.indexOf(signMarker);
  if (sIdx !== -1) {
    const rawPath = url.substring(sIdx + signMarker.length);
    return rawPath.split('?')[0];
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return url;
  }

  return null;
}
