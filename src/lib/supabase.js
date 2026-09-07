import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Keep this list aligned with the actual Supabase Storage bucket visibility.
export const PRIVATE_BUCKETS = ['payment-receipts', 'graduation-orders', 'reels'];

/**
 * Upload a file to a Supabase storage bucket.
 * @param {string} bucket - Bucket name
 * @param {string} path - File path within the bucket (e.g. 'receipts/123.jpg')
 * @param {File|Blob} file - The file to upload
 * @returns {Promise<string>} Public URL for public buckets, or storage path for private buckets
 */
export async function uploadFile(bucket, path, file) {
  if (!bucket || typeof bucket !== 'string') {
    throw new Error('A valid storage bucket is required.');
  }
  if (!path || typeof path !== 'string') {
    throw new Error('A valid storage path is required.');
  }
  if (!file) {
    throw new Error('A file is required.');
  }

  // Sanitize path: split by folder slashes, sanitize base name and extension of each part, then join back.
  const sanitizedPath = path
    .split('/')
    .map(segment => {
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
    })
    .filter(Boolean)
    .join('/');

  if (!sanitizedPath) {
    throw new Error('The storage path is invalid.');
  }

  const isPrivate = PRIVATE_BUCKETS.includes(bucket);

  // Never overwrite an existing object. Only retry when Storage explicitly reports
  // a path collision; permission/network errors must surface immediately.
  let finalPath = sanitizedPath;
  let uploadResult = await supabase.storage
    .from(bucket)
    .upload(finalPath, file, { upsert: false });

  if (uploadResult.error) {
    const statusCode = Number(uploadResult.error.statusCode ?? uploadResult.error.status);
    const message = String(uploadResult.error.message || '').toLowerCase();
    const isCollision = statusCode === 409 ||
      message.includes('already exists') ||
      message.includes('duplicate') ||
      message.includes('object exists');

    if (!isCollision) {
      throw uploadResult.error;
    }

    const parts = sanitizedPath.split('/');
    const filename = parts.pop() || 'file';
    const dotIndex = filename.lastIndexOf('.');
    const base = dotIndex > 0 ? filename.slice(0, dotIndex) : filename;
    const ext = dotIndex > 0 ? filename.slice(dotIndex) : '';
    const uniqueSuffix = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    parts.push(`${base}_${uniqueSuffix}${ext}`);
    finalPath = parts.join('/');

    uploadResult = await supabase.storage
      .from(bucket)
      .upload(finalPath, file, { upsert: false });

    if (uploadResult.error) throw uploadResult.error;
  }

  // Private buckets return only the object path. Consumers must create a signed URL.
  if (isPrivate) {
    return finalPath;
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(finalPath);

  return data.publicUrl;
}

/**
 * Get the public URL for a file already in storage (public buckets only).
 * @param {string} bucket
 * @param {string} path
 * @returns {string}
 */
export function getPublicUrl(bucket, path) {
  if (!bucket || !path) return '';
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Create a fresh signed URL for a private storage object.
 * A previously generated signed URL is intentionally parsed back to its object path
 * instead of being reused because it may already be expired.
 * @param {string} bucket
 * @param {string} pathOrUrl
 * @param {number} expiresIn
 * @returns {Promise<string|null>}
 */
export async function createSignedUrl(bucket, pathOrUrl, expiresIn = 3600) {
  if (!pathOrUrl || typeof pathOrUrl !== 'string') return null;

  const isPrivate = PRIVATE_BUCKETS.includes(bucket);
  const cleanPath = extractPathFromUrl(pathOrUrl, bucket) || (
    pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')
      ? null
      : pathOrUrl
  );

  if (!cleanPath) return null;

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(cleanPath, expiresIn);

    if (error || !data?.signedUrl) {
      console.warn(`Could not create signed URL for bucket '${bucket}', path '${cleanPath}':`, error?.message || error);
      return isPrivate ? null : getPublicUrl(bucket, cleanPath);
    }

    return data.signedUrl;
  } catch (err) {
    console.warn(`Exception creating signed URL for bucket '${bucket}':`, err);
    return isPrivate ? null : getPublicUrl(bucket, cleanPath);
  }
}

/**
 * Delete a file from a storage bucket.
 * @param {string} bucket
 * @param {string} path
 */
export async function deleteFile(bucket, path) {
  const cleanPath = extractPathFromUrl(path, bucket) || path;
  if (!bucket || !cleanPath) return;

  const { error } = await supabase.storage
    .from(bucket)
    .remove([cleanPath]);

  if (error) throw error;
}

/**
 * Extract the storage object path from a full public/signed URL or return a plain path.
 * @param {string} url
 * @param {string} bucket
 * @returns {string|null}
 */
export function extractPathFromUrl(url, bucket) {
  if (!url || typeof url !== 'string' || !bucket) return null;

  const publicMarker = `/storage/v1/object/public/${bucket}/`;
  const pIdx = url.indexOf(publicMarker);
  if (pIdx !== -1) {
    return url.substring(pIdx + publicMarker.length).split('?')[0];
  }

  const signMarker = `/storage/v1/object/sign/${bucket}/`;
  const sIdx = url.indexOf(signMarker);
  if (sIdx !== -1) {
    const rawPath = url.substring(sIdx + signMarker.length);
    return rawPath.split('?')[0];
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return url.split('?')[0];
  }

  return null;
}
